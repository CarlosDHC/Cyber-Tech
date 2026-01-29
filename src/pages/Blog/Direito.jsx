import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Blog.css'; 

import { collection, getDocs, orderBy, query, addDoc, deleteDoc, where, onSnapshot, doc } from "firebase/firestore";
import { db, auth } from "../../../FirebaseConfig"; 

// --- PostCard (Mesmo código, copiado) ---
function PostCard({ post }) {
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState(null); 
  useEffect(() => {
    const q = query(collection(db, "likes"), where("postId", "==", post.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLikesCount(snapshot.size);
      if (auth.currentUser) {
        const meuLike = snapshot.docs.find(d => d.data().userId === auth.currentUser.uid);
        if (meuLike) { setUserLiked(true); setLikeDocId(meuLike.id); } 
        else { setUserLiked(false); setLikeDocId(null); }
      } else { setUserLiked(false); }
    });
    return () => unsubscribe();
  }, [post.id]);
  const handleLike = async (e) => {
    e.preventDefault(); 
    if (!auth.currentUser) return alert("Você precisa estar logado para curtir!");
    try {
      if (userLiked && likeDocId) await deleteDoc(doc(db, "likes", likeDocId));
      else await addDoc(collection(db, "likes"), {
          postId: post.id, postTitle: post.titulo,
          userId: auth.currentUser.uid, userEmail: auth.currentUser.email,
          userName: auth.currentUser.displayName || "Usuário", data: new Date().toISOString()
      });
    } catch (error) { console.error("Erro ao curtir:", error); }
  };
  const linkDestino = post.slug ? `/${post.slug}` : `/blog/post/${post.id}`;
  return (
    <div className="post-card-alg">
      <Link to={linkDestino} className="read-more-link">
        <div className="post-image">
          <img src={post.imagem || "/placeholder-blog.png"} alt={post.titulo} className="post-img-blog" onError={(e) => e.target.src = "https://placehold.co/600x400?text=Direito"} />
        </div>
        <div className="post-info">
          <h3 className="post-title">{post.titulo}</h3>
          <div className="post-meta">
            <p><img src='/user.png' className='user' alt="Autor" /> {post.autor || "Equipe"}</p>
            <p><img src='/calendar.png' alt="Data" className='user' /> {post.data}</p>
            <p><img src='/time-left.png' className='user' alt="Tempo" /> {post.tempoLeitura}</p>
          </div>
        </div>
      </Link>
      <div className="post-feedback">
        <button className={`like-btn ${userLiked ? 'curtido' : ''}`} onClick={handleLike}>
          <span className="heart-icon" style={{fontSize: '1.4rem'}}>{userLiked ? '❤️' : '🤍'}</span> 
          <span style={{fontWeight: 'bold', color: '#555', fontSize: '1rem'}}>{likesCount > 0 ? likesCount : ''}</span>
        </button>
      </div>
    </div>
  );
}

function Direito() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarMais, setMostrarMais] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // FILTRO: Direito
        const q = query(
          collection(db, "blog"), 
          where("categoria", "==", "Direito"), 
          orderBy("dataCriacao", "desc")
        );
        const querySnapshot = await getDocs(q);
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id, ...doc.data(),
          data: doc.data().dataCriacao ? new Date(doc.data().dataCriacao).toLocaleDateString('pt-BR') : "Recente",
          tempoLeitura: doc.data().tempoLeitura ? `${doc.data().tempoLeitura} min` : "Leitura rápida"
        }));
        setPosts(lista);
      } catch (error) { console.error("Erro:", error); } 
      finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  return (
    <div className="blog-page">
      <div className='hero-section hero-dir'>
      </div>

      <div className="post-container-blog">
        {loading && <p style={{textAlign:'center'}}>Carregando...</p>}
        {!loading && posts.length === 0 && <p style={{textAlign:'center'}}>Nenhum post encontrado.</p>}
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      <div className="curiosidade-card" style={{borderLeftColor: '#4b0000'}}>
        <h2>Curiosidades Jurídicas</h2>
        <strong>A lei mais antiga</strong>
        <p>O Código de Ur-Nammu (2100 a.C.) é o código legal mais antigo que se tem notícia, anterior ao famoso Código de Hamurabi.</p>
        
        {mostrarMais && (
          <div className="conteudo-extra">
            <strong>Julgamento Animal</strong>
            <p>Na Idade Média, era comum animais (como porcos e ratos) serem julgados em tribunais por "crimes" cometidos.</p>
          </div>
        )}
        <button className="btn-ver-mais" onClick={() => setMostrarMais(!mostrarMais)}>
          {mostrarMais ? 'Ver menos ▲' : 'Ver mais curiosidades ▼'}
        </button>
      </div>
    </div>
  );
}

export default Direito;