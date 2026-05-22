import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  // 1. Aguarda enquanto o Firebase verifica a sessão e lê o banco de dados
  if (loading) {
    return <div>A carregar painel...</div>; // Pode substituir por um spinner ou o seu componente <Loading />
  }

  // 2. Se a pessoa não estiver logada, é enviada para a página de Login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Se a pessoa estiver logada, mas a variável isAdmin for FALSA, é expulsa para a página principal (Home)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Se passou em tudo (está logado E é admin), liberta o acesso ao conteúdo!
  return children;
};

export default ProtectedAdminRoute;