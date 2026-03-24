import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Admin.module.css"; // Use o mesmo CSS
// import { useAuth } from "../../context/AuthContext"; // Ajuste o caminho se precisar

// Este é o conteúdo que estava no seu Admin.jsx original
export default function AdminDashboard() {
  const navigate = useNavigate();

  // const { currentUser } = useAuth();
  const username = "Admin"; // ou currentUser.nome

  // Dados mocados (substitua por dados reais)
  const media = "8.5/10";
  const posts = 15;
  const drafts = 3;
  const pendingComments = 23;

  return (
    <>
      <h1>
        Bem-vindo, <span>{username}!</span>
      </h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Gestão de Notas</h3>
          <p>Média geral: <strong>{media}</strong></p>
          <p>Últimas notas submetidas hoje.</p>
          <button onClick={() => navigate('/admin/notas')}>Gerir Notas</button>
        </div>

        <div className={styles.card}>
          <h3>Gestão de Blog</h3>
          <p>Total de <strong>{posts} posts</strong></p>
          <p>{drafts} rascunhos por publicar.</p>
          <button onClick={() => navigate('/admin/new-blog')}>Gerir Blog</button>
        </div>

        <div className={styles.card}>
          <h3>Moderação de Comentários</h3>
          <p><strong>{pendingComments}</strong> comentários pendentes</p>
          <p className={styles.warning}>Moderação necessária.</p>
          <button className={styles.red} onClick={() => navigate('/admin/comentarios')}>
            Moderar
          </button>
        </div>
      </div>
    </>
  );
}