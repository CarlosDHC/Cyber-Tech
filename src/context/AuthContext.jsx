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
        // Se o Firebase detetar um login, mas o e-mail não estiver validado,
        // forçamos a saída imediatamente e ignoramos a criação da sessão.
        if (!user.emailVerified) {
          await signOut(auth);
          setCurrentUser(null);
          setIsAdmin(false);
          setLoading(false);
          return; // Interrompe o processo para não carregar os dados do utilizador!
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
            // Adicionado o emailVerified ao estado para garantir a leitura correta
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

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};