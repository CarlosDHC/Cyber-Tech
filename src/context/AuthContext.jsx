import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig"; 

//  Criação do contexto
const AuthContext = createContext();

//  Provedor global
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // O estado de admin
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Defina as referências para os dois documentos
          const userDocRef = doc(db, "users", user.uid);
          const adminDocRef = doc(db, "admins", user.uid); // Coleção "admins"

          // 2. Busque os dois documentos em paralelo
          const [userDocSnap, adminDocSnap] = await Promise.all([
            getDoc(userDocRef),
            getDoc(adminDocRef)
          ]);

          // 3. Verifique a permissão de Admin
          if (adminDocSnap.exists()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }

          // 4. Defina os dados do usuário
          if (userDocSnap.exists()) {
            setCurrentUser({ uid: user.uid, ...userDocSnap.data() });
          } else {
            setCurrentUser({ uid: user.uid, email: user.email });
          }

        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setCurrentUser({ uid: user.uid, email: user.email });
          setIsAdmin(false); // Garante que não é admin em caso de erro
        }
      } else {
        // Usuário deslogado
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

// 🔹 Hook customizado
export const useAuth = () => {
  return useContext(AuthContext);
};