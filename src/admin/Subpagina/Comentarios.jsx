import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../FirebaseConfig"; 
import { collection, getDocs, deleteDoc, doc, updateDoc, arrayRemove } from "firebase/firestore";

// Importamos APENAS o CSS global do Admin
import adminStyles from "../admin.module.css"; 
import notasStyles from "./Notas.module.css";

export default function Comentarios() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // Busca os dados do Fórum, agrupando os Comentários dentro dos seus respetivos Posts
  const fetchConteudos = async () => {
    setLoading(true);
    try {
      const forumSnapshot = await getDocs(collection(db, "forum_posts"));
      let todosPosts = [];

      forumSnapshot.docs.forEach(documento => {
        const postData = documento.data();
        
        const post = {
          id: documento.id,
          autor: postData.author || "Desconhecido",
          titulo: postData.title || "Sem Título",
          conteudo: postData.content || "",
          createdAt: postData.createdAt?.toMillis ? postData.createdAt.toMillis() : 0,
          comentarios: []
        };

        // Extrai e formata os comentários deste post específico
        if (postData.comments && Array.isArray(postData.comments)) {
          post.comentarios = postData.comments.map(comentario => ({
            id: comentario.id,
            autor: comentario.author || "Desconhecido",
            texto: comentario.text,
            createdAt: new Date(comentario.createdAt).getTime(),
            objetoOriginal: comentario // Necessário para o Firebase saber qual item apagar do array
          }));
          
          // Ordena os comentários do mais antigo para o mais recente
          post.comentarios.sort((a, b) => a.createdAt - b.createdAt);
        }

        todosPosts.push(post);
      });

      // Ordena os posts principais do mais recente para o mais antigo
      todosPosts.sort((a, b) => b.createdAt - a.createdAt);
      
      setPosts(todosPosts);
    } catch (error) {
      console.error("Erro ao procurar conteúdos:", error);
      alert("Erro ao carregar os dados do fórum.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConteudos();
  }, []);

  // Função para excluir o Post INTEIRO (e todos os comentários dentro dele)
  const handleExcluirPost = async (postId) => {
    const confirmacao = window.confirm("Tens a certeza de que desejas excluir este POST e TODOS os seus comentários?");
    
    if (confirmacao) {
      try {
        await deleteDoc(doc(db, "forum_posts", postId));
        
        // Atualiza a interface removendo o post apagado
        setPosts(prev => prev.filter(p => p.id !== postId));
        alert("Post excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir o post:", error);
        alert("Erro ao excluir. Verifica as tuas permissões de administrador.");
      }
    }
  };

  // Função para excluir APENAS um comentário específico de dentro de um Post
  const handleExcluirComentario = async (postId, comentario) => {
    const confirmacao = window.confirm("Tens a certeza de que desejas excluir este COMENTÁRIO?");
    
    if (confirmacao) {
      try {
        const postRef = doc(db, "forum_posts", postId);
        
        // Remove o objeto do comentário do array 'comments' no Firestore
        await updateDoc(postRef, {
          comments: arrayRemove(comentario.objetoOriginal)
        });
        
        // Atualiza a interface removendo apenas aquele comentário do post correspondente
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return { 
              ...post, 
              comentarios: post.comentarios.filter(c => c.id !== comentario.id) 
            };
          }
          return post;
        }));
        
        alert("Comentário excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir o comentário:", error);
        alert("Erro ao excluir. Verifica as tuas permissões de administrador.");
      }
    }
  };

  return (
    <div className={adminStyles.container}> 
      
      {/* Menu Lateral */}
      <aside className={`${adminStyles.sidebar} ${collapsed ? adminStyles.sidebarCollapsed : ""}`}>
        <button className={adminStyles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          <img src="/menu.png" alt="menu" />
        </button>
        <h2 className={adminStyles.title}>ADMIN</h2>
        <ul className={adminStyles.navList}>
          <li><Link to="/admin" className={adminStyles.navLink}><img src="/casa.png" alt="H" /><span className={adminStyles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={adminStyles.navLink}><img src="/blog.png" alt="N" /><span className={adminStyles.linkText}>Gestão  de Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={adminStyles.navLink}><img src="/inotas.png" alt="B" /><span className={adminStyles.linkText}>Criar Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={adminStyles.navLink}><img src="/idesafio.png" alt="D" /><span className={adminStyles.linkText}>Criar Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={adminStyles.navLink}><img src="/curti.png" alt="L" /><span className={adminStyles.linkText}>Historico de curtidas</span></Link></li>
          <li><Link to="/admin/comentarios" className={adminStyles.navLink}><img src="/icomentarios.png" alt="L" /><span className={adminStyles.linkText}>Comentarios Fórum</span></Link></li>
        </ul>
      </aside>
      
      {/* Área Principal */}
      <main className={`${adminStyles.mainContent} ${collapsed ? adminStyles.contentExpanded : ""}`}>
        <h1>Moderação do Fórum</h1>
        <p>Gere as publicações e as respostas da comunidade.</p>

        {loading ? (
          <p>A carregar as publicações...</p>
        ) : (
          <div>
            {posts.length === 0 ? (
              <p className={adminStyles.emptyMessage}>Nenhum post encontrado no fórum.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className={adminStyles.postCard}>
                  
                  {/* Informações do Post */}
                  <div className={adminStyles.postHeader}>
                    <h3>{post.titulo}</h3>
                    <p className={adminStyles.postMeta}>
                      <strong>Autor:</strong> {post.autor} | <strong>Data:</strong> {post.createdAt > 0 ? new Date(post.createdAt).toLocaleDateString('pt-PT') : "Indisponível"}
                    </p>
                    <div className={adminStyles.postContentBox}>
                      {post.conteudo}
                    </div>
                    
                    <button 
                      className={adminStyles.btnDeletePost} 
                      onClick={() => handleExcluirPost(post.id)}
                    >
                      Excluir Post Inteiro
                    </button>
                  </div>

                  <hr className={adminStyles.postDivider} />

                  {/* Lista de Comentários associados a este Post */}
                  <div className={adminStyles.commentsSection}>
                    <h4>Comentários ({post.comentarios.length})</h4>
                    {post.comentarios.length === 0 ? (
                      <p className={adminStyles.emptyMessage}>Nenhum comentário nesta postagem.</p>
                    ) : (
                      <ul className={adminStyles.commentsList}>
                        {post.comentarios.map((comentario) => (
                          <li key={comentario.id} className={adminStyles.commentItem}>
                            <div className={adminStyles.commentText}>
                              <strong>{comentario.autor}:</strong> {comentario.texto}
                            </div>
                            <button 
                              className={adminStyles.btnDeleteComment} 
                              onClick={() => handleExcluirComentario(post.id, comentario)}
                            >
                              Excluir
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}