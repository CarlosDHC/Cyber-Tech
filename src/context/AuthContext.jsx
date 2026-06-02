import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        
        // --- BARREIRA DE SEGURANÇA GLOBAL ---
        if (!user.emailVerified) {
          await signOut(auth);
          setCurrentUser(null);
          setIsAdmin(false);
          setLoading(false);
          return; // Interrompe o processo
        }
        // ------------------------------------

        try {
          const userDocRef = doc(db, "users", user.uid);
          const adminDocRef = doc(db, "admins", user.uid);

          const [userDocSnap, adminDocSnap] = await Promise.all([
            getDoc(userDocRef),
            getDoc(adminDocRef)
          ]);

          if (adminDocSnap.exists()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCurrentUser({ uid: user.uid, emailVerified: user.emailVerified, ...userData });
            
            // --- NOVO: NOTIFICAÇÃO DE LOGIN COM ESCUDO ANTI-SPAM ---
            fetch('https://cyber-tech-backend.onrender.com/api/notify-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                uid: user.uid, 
                email: user.email,
                name: userData.name || ''
              })
            }).catch(err => console.error("Erro ao notificar login:", err));
            // --------------------------------------------------------

          } else {
            setCurrentUser({ uid: user.uid, email: user.email, emailVerified: user.emailVerified });
            
            // --- NOVO: NOTIFICAÇÃO DE LOGIN (CASO SEJA PRIMEIRO ACESSO) ---
            fetch('https://cyber-tech-backend.onrender.com/api/notify-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                uid: user.uid, 
                email: user.email,
                name: ''
              })
            }).catch(err => console.error("Erro ao notificar login:", err));
            // --------------------------------------------------------------
          }

        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setCurrentUser({ uid: user.uid, email: user.email, emailVerified: user.emailVerified });
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  // --- LÓGICA DE INATIVIDADE COM REDIS ---
  useEffect(() => {
    if (!currentUser) return;

    let heartbeatTimeout;
    
    const sendHeartbeat = async () => {
      try {
        await fetch('https://cyber-tech-backend.onrender.com/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: currentUser.uid })
        });
      } catch (error) {
        console.error("Erro ao comunicar com o servidor", error);
      }
    };

    const handleActivity = () => {
      if (!heartbeatTimeout) {
        sendHeartbeat();
        heartbeatTimeout = setTimeout(() => {
          heartbeatTimeout = null;
        }, 60000); 
      }
    };

    const checkRedisSession = async () => {
      try {
        const response = await fetch('https://cyber-tech-backend.onrender.com/api/check-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: currentUser.uid })
        });
        
        if (response.status === 401) {
          console.log("Inatividade detetada. Sessão terminada.");
          await signOut(auth);
        }
      } catch (error) {
        console.error("Erro ao checar sessão", error);
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    sendHeartbeat();

    const sessionCheckInterval = setInterval(checkRedisSession, 300000); 

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearInterval(sessionCheckInterval);
      if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
    };
  }, [currentUser]);
  // -------------------------------------------------------------------

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};