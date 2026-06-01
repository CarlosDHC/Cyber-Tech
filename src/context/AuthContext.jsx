import React, { createContext, useContext, useState, useEffect } from "react";
// Importação do signOut adicionada aqui
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
            setCurrentUser({ uid: user.uid, emailVerified: user.emailVerified, ...userDocSnap.data() });
          } else {
            setCurrentUser({ uid: user.uid, email: user.email, emailVerified: user.emailVerified });
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


  // --- NOVA LÓGICA DE INATIVIDADE COM REDIS (COM O LINK DO RENDER) ---
  useEffect(() => {
    // Só executa se o utilizador estiver logado
    if (!currentUser) return;

    let heartbeatTimeout;
    
    // Função para avisar o backend (Render) que o usuário mexeu na tela
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

    // Controla requisições: envia um sinal ao servidor a cada 1 minuto de atividade contínua
    const handleActivity = () => {
      if (!heartbeatTimeout) {
        sendHeartbeat();
        heartbeatTimeout = setTimeout(() => {
          heartbeatTimeout = null;
        }, 60000); 
      }
    };

    // Função que verifica periodicamente se a sessão no Redis (nuvem) expirou
    const checkRedisSession = async () => {
      try {
        const response = await fetch('https://cyber-tech-backend.onrender.com/api/check-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: currentUser.uid })
        });
        
        if (response.status === 401) {
          // Redis deletou a chave por inatividade! Força logout na plataforma.
          console.log("Inatividade detetada. Sessão terminada.");
          await signOut(auth);
        }
      } catch (error) {
        console.error("Erro ao checar sessão", error);
      }
    };

    // Adiciona os detetores de movimento e cliques
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Envia o primeiro sinal mal o utilizador entra
    sendHeartbeat();

    // Cria um loop que checa se o tempo acabou a cada 5 minutos
    const sessionCheckInterval = setInterval(checkRedisSession, 300000); 

    // Limpeza automática ao sair
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