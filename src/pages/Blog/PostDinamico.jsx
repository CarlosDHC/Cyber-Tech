import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  doc, getDoc, collection, query, where, orderBy, limit, getDocs 
} from "firebase/firestore";
import { db } from "../../../FirebaseConfig";
import "./BlogPost.css";

const PostDinamico = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);

  // 1. Função que decide para onde o botão "Menu" (Azulejos) vai voltar
  // Baseado na categoria salva no Firebase
  const getBackLink = (categoria) => {
    if (!categoria) return '/blog'; // Se não tiver categoria, volta para o início

    // Normaliza para letras minúsculas para evitar erros (Ex: "Direito" ou "direito")
    const cat = categoria.toLowerCase();

    switch(cat) {
      case 'tecnologia': return '/tecnologia';
      case 'engenharia': return '/engenharia';
      case 'direito':    return '/direito';
      case 'marketing':  return '/marketing';
      case 'rh':         return '/rh';
      default:           return '/blog';
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // Busca o post atual pelo ID da URL
        const docRef = doc(db, "blog", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const currentData = docSnap.data();
          setPost(currentData);

          // 2. Lógica de Navegação (Anterior / Próximo)
          // Só busca vizinhos que sejam da MESMA categoria
          if (currentData.dataCriacao && currentData.categoria) {
            const blogRef = collection(db, "blog");
            
            // Post Anterior: Mesma categoria, data mais antiga
            const prevQuery = query(
              blogRef, 
              where("categoria", "==", currentData.categoria),
              where("dataCriacao", "<", currentData.dataCriacao), // Atenção à direção da seta
              orderBy("dataCriacao", "desc"), 
              limit(1)
            );
            
            // Post Próximo: Mesma categoria, data mais recente
            const nextQuery = query(
              blogRef, 
              where("categoria", "==", currentData.categoria),
              where("dataCriacao", ">", currentData.dataCriacao), // Atenção à direção da seta
              orderBy("dataCriacao", "asc"), 
              limit(1)
            );

            // Executa as buscas em paralelo
            const [prevSnap, nextSnap] = await Promise.all([getDocs(prevQuery), getDocs(nextQuery)]);
            
            // Define os IDs para os botões
            setPrevId(!prevSnap.empty ? prevSnap.docs[0].id : null);
            setNextId(!nextSnap.empty ? nextSnap.docs[0].id : null);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!post) return <div className="error-msg">Post não encontrado.</div>;

  // Calcula o link de volta baseado na categoria carregada
  const backLink = getBackLink(post.categoria);

  return (
    <div className="blog-post-container">
      <header className="blog-post-header">
        {/* Mostra a TAG da categoria (Ex: DIREITO) */}
        {post.categoria && (
          <span className={`categoria-tag tag-${post.categoria.toLowerCase()}`}>
            {post.categoria}
          </span>
        )}
        
        <h1 className="blog-title">{post.titulo}</h1>
        
        <div className="blog-meta-info">
          <span>{post.dataCriacao ? new Date(post.dataCriacao).toLocaleDateString('pt-BR') : ''}</span>
          {post.autor && <span> • Por {post.autor}</span>}
        </div>

        {post.imagemUrl && (
          <div className="main-image-wrapper">
             <img src={post.imagemUrl} alt={post.titulo} className="main-post-image" />
          </div>
        )}
      </header>

      <section className="blog-content-body">
        {/* Renderização do Conteúdo (Suporta texto corrido ou blocos do Admin) */}
        {Array.isArray(post.conteudo) ? (
          post.conteudo.map((bloco, index) => (
            <div key={index} className="content-block">
              {bloco.type === 'paragraph' && <p>{bloco.content}</p>}
              {bloco.type === 'subtitle' && <h2>{bloco.content}</h2>}
              {bloco.type === 'image' && <img src={bloco.content} alt="Detalhe" />}
              {bloco.type === 'code' && <pre><code>{bloco.content}</code></pre>}
            </div>
          ))
        ) : (
          // Fallback para posts antigos (string simples)
          <div dangerouslySetInnerHTML={{ __html: post.conteudo }} />
        )}
      </section>

      {/* Navegação no Rodapé */}
      <nav className="blog-navigation">
        <div className="nav-side left">
          {prevId ? (
            <Link to={`/blog/post/${prevId}`} className="nav-btn">
              <span>← Anterior</span>
            </Link>
          ) : (
            <span className="nav-btn disabled">← Anterior</span>
          )}
        </div>

        {/* O BOTÃO CENTRAL IMPORTANTE */}
        <div className="nav-center">
          <Link to={backLink} className="menu-azulejos" title={`Voltar para ${post.categoria}`}>
            <img src="/azulejos.png" alt="Menu Categorias" />
          </Link>
        </div>

        <div className="nav-side right">
          {nextId ? (
            <Link to={`/blog/post/${nextId}`} className="nav-btn">
              <span>Próximo →</span>
            </Link>
          ) : (
            <span className="nav-btn disabled">Próximo →</span>
          )}
        </div>
      </nav>
    </div>
  );
};

export default PostDinamico;