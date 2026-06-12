import React, { useState, useEffect } from 'react';
import styles from './Forum.module.css';
import { moderarConteudo } from "../../services/moderacao"; 
import { db, auth } from "../../../FirebaseConfig";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove 
} from "firebase/firestore";

const Forum = () => {
  // --- ESTADO DE NAVEGAÇÃO ---
  const [viewMode, setViewMode] = useState('feed'); // 'feed' ou 'create'

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Todas"); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [imageLink, setImageLink] = useState(""); 
  const [selectedTags, setSelectedTags] = useState(["Geral"]); 
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({}); 

  // --- ESTADOS DO MODAL DE DENÚNCIA ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alvoDenuncia, setAlvoDenuncia] = useState({ tipo: null, postId: null, commentId: null, extraText: "" });
  const [motivoDenuncia, setMotivoDenuncia] = useState("Conteúdo Inadequado/Ofensivo");
  const [detalhesDenuncia, setDetalhesDenuncia] = useState("");
 
  const mainCategories = [
    "Todas", "Tecnologia", "Direito", "Engenharia", 
    "Marketing", "RH", "Geral"
  ];

  const categoryMap = {
    "Tecnologia": ["tecnologia", "python", "javascript", "react", "html/css", "lógica", "banco de dados", "mobile", "devops", "código", "programação","Framework", "web", "app"],
    "Direito": ["direito", "direito digital", "leis", "jurídico", "legislação", "advocacia", "penal", "civil"],
    "Engenharia": ["engenharia", "civil", "obras", "projetos", "cálculo", "estruturas", "construção"],
    "Marketing": ["marketing", "seo", "branding", "social media", "vendas", "publicidade", "conteúdo"],
    "RH": ["rh", "recursos humanos", "gestão", "carreira", "entrevista", "liderança", "vagas"],
    "Geral": ["geral", "dúvida", "off-topic", "discussão", "ajuda"]
  };

  const tagSuggestions = [
    "Python", "JavaScript", "React", "HTML/CSS", "Lógica", 
    "Banco de Dados", "Mobile", "DevOps", "Carreira", "Gestão"
  ];

  const getSafeUserName = (user) => {
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return "Usuário da Comunidade";
  };

  useEffect(() => {
    const q = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);

      const tagStats = {}; 
      postsData.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            if (!tagStats[tag]) tagStats[tag] = { count: 0, posts: [] };
            tagStats[tag].count += 1;
            tagStats[tag].posts.push(post);
          });
        }
      });

      const sortedTags = Object.entries(tagStats)
        .sort(([, statA], [, statB]) => statB.count - statA.count)
        .slice(0, 5)
        .map(([tag, stat]) => {
          const topPost = stat.posts.sort((a, b) => {
            const likesA = a.likedBy ? a.likedBy.length : 0;
            const likesB = b.likedBy ? b.likedBy.length : 0;
            return likesB - likesA;
          })[0];
          return { tag, count: stat.count, topPostTitle: topPost ? topPost.title : "Sem discussões ainda" };
        });

      setTrendingTags(sortedTags);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCategoryClick = (category) => setActiveFilter(category);

  const displayedPosts = posts.filter(post => {
    let matchesCategory = false;
    if (activeFilter === "Todas") {
      matchesCategory = true;
    } else {
      const relatedTags = categoryMap[activeFilter] || [];
      if (post.tags && Array.isArray(post.tags)) {
        matchesCategory = post.tags.some(tag => {
          const lowerTag = tag.toLowerCase();
          return lowerTag === activeFilter.toLowerCase() || relatedTags.includes(lowerTag);
        });
      }
    }
    const matchesSearch = searchQuery 
      ? (post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         post.content.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  const addTagLogic = () => {
    const val = tagInput.trim();
    if (val) {
      if (!selectedTags.includes(val)) setSelectedTags([...selectedTags, val]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTagLogic(); } };
  const handleManualAddTag = (e) => { e.preventDefault(); addTagLogic(); };
  const removeTag = (tagToRemove) => { setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove)); };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    
    let finalTags = [...selectedTags];
    if (tagInput.trim() && !finalTags.includes(tagInput.trim())) finalTags.push(tagInput.trim());

    if (finalTags.length === 0) { alert("Adicione pelo menos uma tag."); return; }

    const user = auth.currentUser;
    if (!user) { alert("Faça login para publicar."); return; }

    setIsSubmitting(true);
    
    const ehSeguro = await moderarConteudo(newTitle, newContent, imageLink);

    if (!ehSeguro) {
      alert("Conteúdo impróprio ou link não seguro detectado. Revise sua publicação.");
      setIsSubmitting(false);
      return; 
    }

    try {
      const safeName = getSafeUserName(user);
      await addDoc(collection(db, "forum_posts"), {
        title: newTitle.trim(), 
        content: newContent.trim(), 
        imageUrl: imageLink.trim(),
        author: safeName, 
        authorId: user.uid, 
        authorInitial: safeName[0].toUpperCase(), 
        createdAt: serverTimestamp(), 
        tags: finalTags, 
        likedBy: [], 
        comments: [],
        status: "aprovado" 
      });
      
      setNewTitle(""); setNewContent(""); setImageLink(""); 
      setSelectedTags(["Geral"]); setTagInput(""); 
      setViewMode('feed'); // Volta para o feed após publicar com sucesso
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) { 
      alert("Erro ao publicar. Verifique sua conexão.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleLike = async (postId, likedByArray = []) => {
    const user = auth.currentUser;
    if (!user) { alert("Faça login."); return; }
    const postRef = doc(db, "forum_posts", postId);
    const safeLikedBy = Array.isArray(likedByArray) ? likedByArray : [];
    const hasLiked = safeLikedBy.includes(user.uid);
    try {
      if (hasLiked) await updateDoc(postRef, { likedBy: arrayRemove(user.uid) });
      else await updateDoc(postRef, { likedBy: arrayUnion(user.uid) });
    } catch (error) { console.error(error); }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    
    const user = auth.currentUser;
    if (!user) { alert("Faça login para comentar."); return; }

    const ehSeguro = await moderarConteudo("", text, "");
    if (!ehSeguro) {
      alert("Comentário bloqueado por violar as diretrizes de segurança da comunidade.");
      return;
    }

    try {
      const safeName = getSafeUserName(user);
      const postRef = doc(db, "forum_posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          id: Date.now().toString(), 
          text: text.trim(), 
          author: safeName, 
          authorId: user.uid, 
          createdAt: new Date().toISOString()
        })
      });
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    } catch (error) { console.error(error); }
  };

  // --- LÓGICA DO SISTEMA DE DENÚNCIAS ---
  const abrirModalDenunciaPost = (postId) => {
    setAlvoDenuncia({ tipo: "post", postId: postId, commentId: null, extraText: "" });
    setIsModalOpen(true);
  };

  const abrirModalDenunciaComentario = (postId, comment) => {
    setAlvoDenuncia({ tipo: "comentario", postId: postId, commentId: comment.id, extraText: comment.text });
    setIsModalOpen(true);
  };

  const abrirModalDenunciaGeral = () => {
    setAlvoDenuncia({ tipo: "geral", postId: null, commentId: null, extraText: "" });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setAlvoDenuncia({ tipo: null, postId: null, commentId: null, extraText: "" });
    setDetalhesDenuncia("");
  };

  const handleEnviarDenuncia = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    let tipoDenunciaStr = "Denúncia Geral";
    if (alvoDenuncia.tipo === "post") tipoDenunciaStr = "Denúncia de Post";
    if (alvoDenuncia.tipo === "comentario") tipoDenunciaStr = "Denúncia de Comentário";

    try {
      await addDoc(collection(db, "denuncias"), {
        tipo: tipoDenunciaStr, 
        postId: alvoDenuncia.postId || "N/A", 
        commentId: alvoDenuncia.commentId || "N/A",
        textoComentario: alvoDenuncia.extraText || "", 
        motivo: motivoDenuncia,
        detalhes: detalhesDenuncia,
        denuncianteId: user ? user.uid : "Anônimo", 
        status: "pendente",
        data: serverTimestamp() 
      });
      alert("Denúncia enviada com sucesso! A nossa equipe analisará em breve.");
      fecharModal();
    } catch (error) {
      alert("Erro ao enviar denúncia. Tente novamente.");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "...";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.forumPage}>
      <div className={styles.contentWrapper}>
        
        <main className={styles.feedSection}>
          <div className={styles.headerBlock}>
            <h1 className={styles.pageTitle}>Fórum de Discussões</h1>
            <p className={styles.pageSubtitle}>Conecte-se com especialistas e tire suas dúvidas.</p>
            
            {/* BOTÃO PARA ALTERNAR ENTRE FEED E CRIAÇÃO */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                {viewMode === 'feed' ? (
                    <button 
                        onClick={() => setViewMode('create')}
                        style={{ background: '#095e8b', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Nova Discussão
                    </button>
                ) : (
                    <button 
                        onClick={() => setViewMode('feed')}
                        style={{ background: 'transparent', color: '#095e8b', border: '1px solid #2563EB', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Voltar para o Feed
                    </button>
                )}
            </div>
          </div>

          {/* RENDERIZA O FORMULÁRIO APENAS SE VIEWMODE FOR 'CREATE' */}
          {viewMode === 'create' && (
            <div className={styles.newQuestionArea} style={{ marginTop: '20px' }}>
              <h3>Criar Nova Publicação</h3>
              {!auth.currentUser ? (
                <p className={styles.loginWarn}>Faça login para publicar no fórum.</p>
              ) : (
                <form onSubmit={handlePublish} className={styles.inputGroup}>
                  <input type="text" placeholder="Título da discussão" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} disabled={isSubmitting} className={styles.cleanInput} />
                  
                  <div className={styles.tagInputContainer}>
                    <div className={styles.tagsWrapper}>
                      {selectedTags.map(tag => (
                        <span key={tag} className={styles.cleanTag}>{tag} <button type="button" onClick={() => removeTag(tag)}>×</button></span>
                      ))}
                      <input type="text" list="tagSuggestions" placeholder="Tags (ex: Tecnologia, React)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className={styles.tagTextInput} />
                      <datalist id="tagSuggestions">{tagSuggestions.map(tag => <option key={tag} value={tag} />)}</datalist>
                      <button type="button" onClick={handleManualAddTag} className={styles.addTagBtn}>+</button>
                    </div>
                  </div>

                  <div className={styles.imageInputContainer}>
                    <input type="url" placeholder="Cole aqui o link da imagem (opcional)" value={imageLink} onChange={(e) => setImageLink(e.target.value)} disabled={isSubmitting} className={styles.cleanInput} />
                    {imageLink && (
                      <div className={styles.miniPreview}>
                        <img src={imageLink} alt="Preview" onError={(e) => e.target.style.display = 'none'} style={{ maxHeight: '150px' }} />
                      </div>
                    )}
                  </div>

                  <textarea rows="5" placeholder="Desenvolva sua ideia aqui..." value={newContent} onChange={(e) => setNewContent(e.target.value)} disabled={isSubmitting} className={styles.cleanTextarea} />
                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? 'A analisar...' : 'Publicar'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* RENDERIZA O FEED APENAS SE VIEWMODE FOR 'FEED' */}
          {viewMode === 'feed' && (
            <>
              <div className={styles.searchBar} style={{ marginTop: '20px' }}>
                <input type="text" placeholder="Procurar por título ou assunto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}/>
              </div>

              <div className={styles.categoryFilterContainer} style={{ marginTop: '15px' }}>
                {mainCategories.map((cat) => (
                  <button key={cat} className={`${styles.categoryPill} ${activeFilter === cat ? styles.activePill : ''}`} onClick={() => handleCategoryClick(cat)}>
                    {cat}
                  </button>
                ))}
              </div>

              {loading && <p className={styles.loadingMsg}>A carregar...</p>}
              {!loading && displayedPosts.length === 0 && <p style={{ marginTop: '20px' }}>Nenhuma discussão encontrada.</p>}
              
              {displayedPosts.map((post) => {
                const likedBy = post.likedBy || [];
                const userHasLiked = auth.currentUser && likedBy.includes(auth.currentUser.uid);

                return (
                  <div key={post.id} className={styles.postCard}>
                    <div className={styles.postHeader}>
                      <div className={styles.authorBadge}>
                        <div style={{ width: '30px', height: '30px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {post.authorInitial}
                        </div>
                      </div>
                      <div className={styles.authorInfo}>
                        <h4>{post.author}</h4>
                        <span>{formatTime(post.createdAt)}</span>
                      </div>
                    </div>

                    <div className={styles.postContent}>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                      {post.imageUrl && (
                        <div className={styles.postImageWrapper}>
                          <img src={post.imageUrl} alt="Anexo" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                      <div className={styles.tags}>
                        {post.tags?.map((tag, idx) => ( <span key={idx} className={styles.tag}>#{tag}</span> ))}
                      </div>
                    </div>

                    <div className={styles.postFooter}>
                      <button className={`${styles.actionBtn} ${userHasLiked ? styles.liked : ''}`} onClick={() => handleLike(post.id, likedBy)}>
                        Relevância ({likedBy.length})
                      </button>
                      
                      <button className={styles.actionBtn} style={{marginLeft: 'auto', color: '#ef4444'}} onClick={() => abrirModalDenunciaPost(post.id)}>
                        Denunciar Post
                      </button>
                    </div>

                    <div className={styles.commentsSection}>
                      {post.comments?.map((comment, idx) => (
                        <div key={idx} className={styles.comment} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span className={styles.commentAuthor}>{comment.author}:</span>
                            <span className={styles.commentText}>{comment.text}</span>
                          </div>
                          <button 
                            onClick={() => abrirModalDenunciaComentario(post.id, comment)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '10px' }}
                          >
                            Denunciar
                          </button>
                        </div>
                      ))}
                      <div className={styles.commentInputGroup}>
                        <input type="text" placeholder="Adicionar resposta..." value={commentInputs[post.id] || ""} onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(post.id); }}} />
                        <button className={styles.sendBtn} onClick={() => handleAddComment(post.id)}>Enviar</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </main>
        
        <aside className={styles.sidebarSection}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Em Alta</div>
            {trendingTags.length === 0 ? <p className={styles.emptyMsg}>Sem dados recentes</p> : (
              <ul className={styles.topicList}>
                {trendingTags.map((item) => (
                  <li key={item.tag} className={styles.topicItem} onClick={() => { setSearchQuery(item.tag); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <div className={styles.topicHeader}>
                      <span className={styles.topicName}>#{item.tag}</span>
                      <span className={styles.topicCount}>{item.count}</span>
                    </div>
                    <div className={styles.topicHighlight}>{item.topPostTitle}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.sidebarCard}>
            <button className={styles.btnDenunciaGeral} onClick={abrirModalDenunciaGeral}>
              Relatar Problema Geral
            </button>
          </div>
        </aside>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{marginTop: 0, color: '#f8fafc', marginBottom: '20px', fontSize: '1.3rem'}}>
              {alvoDenuncia.tipo === "post" ? "Relatar Publicação" : alvoDenuncia.tipo === "comentario" ? "Relatar Comentário" : "Relatar Problema Geral"}
            </h3>
            
            {alvoDenuncia.tipo === "comentario" && (
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', marginBottom: '15px', borderLeft: '3px solid #ef4444' }}>
                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>"{alvoDenuncia.extraText}"</p>
                </div>
            )}

            <form onSubmit={handleEnviarDenuncia}>
              <select value={motivoDenuncia} onChange={(e) => setMotivoDenuncia(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #475569', boxSizing: 'border-box'}}>
                <option value="Conteúdo Inadequado/Ofensivo">Conteúdo Inadequado / Ofensivo</option>
                <option value="Spam ou Propaganda">Spam ou Propaganda</option>
                <option value="Assédio ou Bullying">Assédio ou Bullying</option>
                {alvoDenuncia.tipo === "geral" && <option value="Problema Técnico/Bug">Problema Técnico / Bug no Site</option>}
                <option value="Outros">Outros</option>
              </select>

              <textarea required rows="4" placeholder="Descreva com detalhes o que está acontecendo..." value={detalhesDenuncia} onChange={(e) => setDetalhesDenuncia(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #475569', resize: 'vertical', boxSizing: 'border-box'}} />

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                <button type="button" onClick={fecharModal} style={{background: 'transparent', color: '#cbd5e1', border: '1px solid #475569', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'}}>Cancelar</button>
                <button type="submit" style={{background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Enviar Denúncia</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;