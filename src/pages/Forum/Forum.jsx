import React, { useState, useEffect } from 'react';
import styles from './Forum.module.css';

// Imports do Firebase
import { db, auth } from "../../../FirebaseConfig";
import { 
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, 
  updateDoc, doc, arrayUnion, arrayRemove 
} from "firebase/firestore";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [trendingTags, setTrendingTags] = useState([]);
  
  // Filtros
  const [activeFilter, setActiveFilter] = useState("Todas"); // Começa exibindo tudo
  const [searchQuery, setSearchQuery] = useState(""); 

  // Nova pergunta
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [imageLink, setImageLink] = useState(""); 
  
  // Tags e Inputs
  const [selectedTags, setSelectedTags] = useState(["Geral"]); 
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({}); 

  // Categorias Principais (Filtro Rápido)
  const mainCategories = [
    "Todas", "Tecnologia", "Direito", "Engenharia", 
    "Marketing", "RH", "Geral"
  ];

  // Sugestões de Tags
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

      // Lógica de Trending Tags
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
          return { tag, count: stat.count, topPostTitle: topPost ? topPost.title : "Sem discussões" };
        });

      setTrendingTags(sortedTags);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Lógica de Clique nas Categorias (Áreas)
  const handleCategoryClick = (category) => {
    setActiveFilter(category);
    setSearchQuery(""); // Limpa a busca textual ao mudar de categoria
  };

  // Filtragem dos Posts
  const displayedPosts = posts.filter(post => {
    // 1. Filtro por Categoria/Tag
    const matchesCategory = activeFilter === "Todas" 
      ? true 
      : (post.tags && post.tags.some(t => t.toLowerCase() === activeFilter.toLowerCase()));

    // 2. Filtro por Busca de Texto
    const matchesSearch = searchQuery 
      ? (post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         post.content.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    return matchesCategory && matchesSearch;
  });

  // --- LÓGICA DE TAGS (Mantida) ---
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
    try {
      const safeName = getSafeUserName(user);
      await addDoc(collection(db, "forum_posts"), {
        title: newTitle, content: newContent, imageUrl: imageLink.trim(),
        author: safeName, authorId: user.uid, authorInitial: safeName[0].toUpperCase(), 
        createdAt: serverTimestamp(), tags: finalTags, likedBy: [], comments: [] 
      });
      setNewTitle(""); setNewContent(""); setImageLink(""); 
      setSelectedTags(["Geral"]); setTagInput(""); setActiveFilter("Todas"); setSearchQuery("");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
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
    if (!user) return alert("Faça login.");
    try {
      const safeName = getSafeUserName(user);
      const postRef = doc(db, "forum_posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          id: Date.now(), text: text, author: safeName, authorId: user.uid, createdAt: new Date().toISOString()
        })
      });
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    } catch (error) { console.error(error); }
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
            
            {/* BARRA DE PESQUISA REFINADA */}
            <div className={styles.searchBar}>
              <div className={styles.searchIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por título ou assunto..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* --- NOVO: FILTRO POR ÁREAS (CATEGORY PILLS) --- */}
            <div className={styles.categoryFilterContainer}>
              {mainCategories.map((cat) => (
                <button 
                  key={cat} 
                  className={`${styles.categoryPill} ${activeFilter === cat ? styles.activePill : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading && <p className={styles.loadingMsg}>Carregando...</p>}

          {!loading && displayedPosts.length === 0 && (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3>Nenhuma discussão encontrada</h3>
              <p>Seja o primeiro a iniciar um tópico em <strong>{activeFilter}</strong>!</p>
            </div>
          )}
          
          {displayedPosts.map((post) => {
            const likedBy = post.likedBy || [];
            const userHasLiked = auth.currentUser && likedBy.includes(auth.currentUser.uid);

            return (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <div className={styles.authorBadge}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
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
                    {post.tags?.map((tag, idx) => (
                      <span key={idx} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.postFooter}>
                  <button className={`${styles.actionBtn} ${userHasLiked ? styles.liked : ''}`} onClick={() => handleLike(post.id, likedBy)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={userHasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {likedBy.length} Relevância
                  </button>
                  <button className={styles.actionBtn}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    {post.comments?.length || 0} Comentários
                  </button>
                </div>

                <div className={styles.commentsSection}>
                  {post.comments?.map((comment, idx) => (
                    <div key={idx} className={styles.comment}>
                      <span className={styles.commentAuthor}>{comment.author}:</span>
                      <span className={styles.commentText}>{comment.text}</span>
                    </div>
                  ))}
                  <div className={styles.commentInputGroup}>
                    <input 
                      type="text" 
                      placeholder="Adicionar resposta..." 
                      value={commentInputs[post.id] || ""} 
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })} 
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(post.id); }}} 
                    />
                    <button className={styles.sendBtn} onClick={() => handleAddComment(post.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ÁREA DE CRIAÇÃO (DESIGN LIMPO) */}
          <div className={styles.newQuestionArea}>
            <h3>Iniciar nova discussão</h3>
            {!auth.currentUser ? (
              <p className={styles.loginWarn}>Faça login para participar.</p>
            ) : (
              <form onSubmit={handlePublish} className={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="Título da discussão" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  disabled={isSubmitting} 
                  className={styles.cleanInput} 
                />
                
                <div className={styles.tagInputContainer}>
                  <div className={styles.tagsWrapper}>
                    {selectedTags.map(tag => (
                      <span key={tag} className={styles.cleanTag}>{tag} <button type="button" onClick={() => removeTag(tag)}>×</button></span>
                    ))}
                    <input 
                      type="text" 
                      list="tagSuggestions" 
                      placeholder="Tags (ex: Tecnologia, React)" 
                      value={tagInput} 
                      onChange={(e) => setTagInput(e.target.value)} 
                      onKeyDown={handleTagKeyDown} 
                      className={styles.tagTextInput} 
                    />
                    <datalist id="tagSuggestions">{tagSuggestions.map(tag => <option key={tag} value={tag} />)}</datalist>
                    <button type="button" onClick={handleManualAddTag} className={styles.addTagBtn}>+</button>
                  </div>
                </div>

                <div className={styles.imageInputContainer}>
                  <input 
                    type="url" 
                    placeholder="Cole aqui o link da imagem (http://...)" 
                    value={imageLink} 
                    onChange={(e) => setImageLink(e.target.value)} 
                    disabled={isSubmitting} 
                    className={styles.cleanInput}
                  />
                  {imageLink && (
                    <div className={styles.miniPreview}>
                      <img src={imageLink} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <textarea 
                  rows="3" 
                  placeholder="No que você está pensando?" 
                  value={newContent} 
                  onChange={(e) => setNewContent(e.target.value)} 
                  disabled={isSubmitting} 
                  className={styles.cleanTextarea} 
                />
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>Publicar</button>
              </form>
            )}
          </div>
        </main>
        
        {/* SIDEBAR COM SVG E DESIGN FLAT */}
        <aside className={styles.sidebarSection}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <div className={styles.iconBox} style={{backgroundColor: '#e0e7ff', color: '#2563EB'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div>
                <h3>Comunidade</h3>
                <p>Conecte-se e evolua.</p>
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
              Em Alta
            </div>
            {trendingTags.length === 0 ? <p className={styles.emptyMsg}>Sem dados recentes</p> : (
              <ul className={styles.topicList}>
                {trendingTags.map((item) => (
                  <li key={item.tag} className={styles.topicItem} onClick={() => setActiveFilter(item.tag)}>
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
            <div className={styles.sidebarTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Regras
            </div>
            <ul className={styles.rulesList}>
              <li>Respeito mútuo sempre.</li>
              <li>Mantenha o foco do tópico.</li>
              <li>Não compartilhe dados sensíveis.</li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Forum;