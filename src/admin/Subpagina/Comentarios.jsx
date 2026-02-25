// src/admin/Subpagina/Comentarios.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../FirebaseConfig"; // Confirme se o caminho está correto
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import styles from "../Comentarios.module.css";

export default function Comentarios() {
  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os dados do Firebase
  const fetchConteudos = async () => {
    setLoading(true);
    try {
      // Busca publicações do Fórum
      const forumSnapshot = await getDocs(collection(db, "forum"));
      const forumData = forumSnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: "Fórum",
        ...doc.data()
      }));

      // Busca Comentários (ajuste o nome da coleção se for diferente)
      const comentariosSnapshot = await getDocs(collection(db, "comentarios"));
      const comentariosData = comentariosSnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: "Comentário",
        ...doc.data()
      }));

      // Junta tudo em um único array e ordena pela data (mais recentes primeiro)
      const todosConteudos = [...forumData, ...comentariosData].sort((a, b) => {
        // Assume que você tem um campo createdAt (timestamp). Se não tiver, remova o sort.
        const dataA = a.createdAt?.toMillis() || 0;
        const dataB = b.createdAt?.toMillis() || 0;
        return dataB - dataA; 
      });

      setConteudos(todosConteudos);
    } catch (error) {
      console.error("Erro ao buscar conteúdos:", error);
      alert("Erro ao carregar os dados. Verifique sua conexão ou permissões do Firebase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConteudos();
  }, []);

  // Função para excluir um post ou comentário
  const handleExcluir = async (id, tipo) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir este ${tipo}? Esta ação é irreversível.`);
    
    if (confirmacao) {
      try {
        // Define qual coleção será acessada com base no tipo
        const nomeColecao = tipo === "Fórum" ? "forum" : "comentarios";
        await deleteDoc(doc(db, nomeColecao, id));
        
        // Atualiza o estado da tela removendo o item excluído
        setConteudos(conteudos.filter(item => item.id !== id));
        alert(`${tipo} excluído com sucesso!`);
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir o conteúdo. Verifique se você tem permissão de administrador.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Moderação de Conteúdo</h1>
      <p>Gerencie as publicações do fórum e os comentários dos usuários abaixo.</p>

      {loading ? (
        <p>Carregando conteúdos...</p>
      ) : (
        <div className={styles.tableContainer}>
          {conteudos.length === 0 ? (
            <p className={styles.emptyMessage}>Nenhum conteúdo encontrado no momento.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Autor</th>
                  <th>Conteúdo</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {conteudos.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={`${styles.badge} ${item.tipo === "Fórum" ? styles.badgeForum : styles.badgeComentario}`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td>{item.autor || item.nomeUsuario || "Anônimo"}</td>
                    {/* Limita o texto na tela para não quebrar o layout se for muito grande */}
                    <td>{item.texto ? item.texto.substring(0, 80) + "..." : item.titulo}</td>
                    <td>
                      {item.createdAt 
                        ? new Date(item.createdAt.toDate()).toLocaleDateString('pt-BR') 
                        : "Data indisponível"}
                    </td>
                    <td className={styles.actions}>
                      <button 
                        className={styles.btnDelete} 
                        onClick={() => handleExcluir(item.id, item.tipo)}
                      >
                        Excluir Spam/Ofensa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}