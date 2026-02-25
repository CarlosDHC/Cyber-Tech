import React, { useState, useEffect } from "react";
import { db } from "../../../FirebaseConfig"; 
import { collection, getDocs, deleteDoc, doc, updateDoc, arrayRemove } from "firebase/firestore";
import styles from "./Comentarios.module.css";

export default function Comentarios() {
  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca dados do Fórum e separa os Posts principais dos Comentários
  const fetchConteudos = async () => {
    setLoading(true);
    try {
      // Vai na coleção correta onde tudo está salvo
      const forumSnapshot = await getDocs(collection(db, "forum_posts"));
      let todosConteudos = [];

      forumSnapshot.docs.forEach(documento => {
        const postData = documento.data();
        
        // 1. Adiciona o Post principal à tabela
        todosConteudos.push({
          id: documento.id, 
          tipo: "Post",
          autor: postData.author || "Desconhecido",
          texto: postData.title ? `${postData.title} - ${postData.content}` : postData.content,
          createdAt: postData.createdAt?.toMillis ? postData.createdAt.toMillis() : 0, 
        });

        // 2. Extrai os comentários de dentro do Post e os adiciona à tabela
        if (postData.comments && Array.isArray(postData.comments)) {
          postData.comments.forEach(comentario => {
            todosConteudos.push({
              id: comentario.id, // ID gerado na hora da criação do comentário
              postId: documento.id, // Referência de qual post este comentário pertence
              tipo: "Comentário",
              autor: comentario.author || "Desconhecido",
              texto: comentario.text,
              createdAt: new Date(comentario.createdAt).getTime(),
              objetoOriginal: comentario // Guarda o objeto inteiro para o Firebase saber o que deletar
            });
          });
        }
      });

      // Ordena tudo do mais recente para o mais antigo
      todosConteudos.sort((a, b) => b.createdAt - a.createdAt);

      setConteudos(todosConteudos);
    } catch (error) {
      console.error("Erro ao buscar conteúdos:", error);
      alert("Erro ao carregar os dados do fórum.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConteudos();
  }, []);

  // Função para excluir post ou comentário
  const handleExcluir = async (item) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir este ${item.tipo}? Esta ação é irreversível.`);
    
    if (confirmacao) {
      try {
        if (item.tipo === "Post") {
          // Deleta o documento inteiro do Post
          await deleteDoc(doc(db, "forum_posts", item.id));
          
          // Atualiza a tela removendo o post E os comentários que estavam dentro dele
          setConteudos(prev => prev.filter(c => c.id !== item.id && c.postId !== item.id));
          
        } else if (item.tipo === "Comentário") {
          // Deleta apenas o comentário de dentro da lista do Post
          const postRef = doc(db, "forum_posts", item.postId);
          await updateDoc(postRef, {
            comments: arrayRemove(item.objetoOriginal)
          });
          
          // Atualiza a tela removendo apenas o comentário específico
          setConteudos(prev => prev.filter(c => c.id !== item.id));
        }
        
        alert(`${item.tipo} excluído com sucesso!`);
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir. Verifique as permissões de administrador no Firebase.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Moderação do Fórum</h1>
      <p>Gerencie as publicações e respostas da comunidade.</p>

      {loading ? (
        <p>Carregando publicações e comentários...</p>
      ) : (
        <div className={styles.tableContainer}>
          {conteudos.length === 0 ? (
            <p className={styles.emptyMessage}>Nenhum conteúdo no fórum.</p>
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
                  <tr key={`${item.tipo}-${item.id}`}>
                    <td>
                      <span className={`${styles.badge} ${item.tipo === "Post" ? styles.badgeForum : styles.badgeComentario}`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td>{item.autor}</td>
                    <td>{item.texto ? item.texto.substring(0, 100) + "..." : "Sem conteúdo"}</td>
                    <td>
                      {item.createdAt > 0 
                        ? new Date(item.createdAt).toLocaleDateString('pt-BR') 
                        : "Indisponível"}
                    </td>
                    <td className={styles.actions}>
                      <button 
                        className={styles.btnDelete} 
                        onClick={() => handleExcluir(item)}
                      >
                        Excluir
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