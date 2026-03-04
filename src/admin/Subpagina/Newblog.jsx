import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";

// Firebase
import { db } from "../../../FirebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";

import "../../pages/Blog/BlogPost.css";

export default function NewBlog() {
  // Controle de Abas: "create" ou "manage"
  const [activeTab, setActiveTab] = useState("create");
  
  // Estados para Criação
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [capa, setCapa] = useState("");
  const [autor, setAutor] = useState("");
  const [tempoLeitura, setTempoLeitura] = useState("");
  const [categoria, setCategoria] = useState("");
  const [secoes, setSecoes] = useState([
    { id: Date.now(), type: "paragraph", content: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [modoPreview, setModoPreview] = useState(false);

  // Estados para Gerenciamento
  const [postsPublicados, setPostsPublicados] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Layout
  const [collapsed, setCollapsed] = useState(false);

  // Cálculo de tempo de leitura automático
  useEffect(() => {
    const textoTotal = secoes.reduce((acc, bloco) => {
      if (bloco.type === 'paragraph' || bloco.type === 'subtitle') {
        return acc + " " + (bloco.content || "");
      }
      return acc;
    }, "");

    const contagemPalavras = textoTotal.trim().split(/\s+/).length;
    const minutosCalculados = Math.ceil(contagemPalavras / 200);
    const tempoFinal = contagemPalavras > 0 ? minutosCalculados : "";

    setTempoLeitura(tempoFinal.toString());
  }, [secoes]);

  // Carregar posts quando entrar na aba "manage"
  useEffect(() => {
    if (activeTab === "manage") {
      fetchPosts();
    }
  }, [activeTab]);

  // --- FUNÇÕES DE CRIAÇÃO ---
  const adicionarBloco = (tipo) => {
    setSecoes([...secoes, { id: Date.now(), type: tipo, content: "" }]);
  };

  const atualizarBloco = (id, valor) => {
    setSecoes(secoes.map(secao => secao.id === id ? { ...secao, content: valor } : secao));
  };

  const removerBloco = (id) => {
    if (secoes.length === 1) return;
    setSecoes(secoes.filter(secao => secao.id !== id));
  };

  const moverBloco = (index, direcao) => {
    const novasSecoes = [...secoes];
    const [itemRemovido] = novasSecoes.splice(index, 1);
    novasSecoes.splice(index + direcao, 0, itemRemovido);
    setSecoes(novasSecoes);
  };

  async function salvarPost() {
    if (!titulo || !resumo || !autor || !tempoLeitura || !categoria) {
      alert("Preencha todos os campos, incluindo a Categoria.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "blog"), {
        titulo,
        resumo,
        autor,
        tempoLeitura,
        categoria,
        imagemUrl: capa || "https://placehold.co/600x400?text=Capa",
        conteudo: secoes,
        dataCriacao: new Date().toISOString()
      });
      alert("Post publicado com sucesso!");

      // Limpar formulário
      setTitulo(""); setResumo(""); setCapa(""); setAutor(""); setTempoLeitura(""); setCategoria("");
      setSecoes([{ id: Date.now(), type: "paragraph", content: "" }]);
      setModoPreview(false);
      setActiveTab("manage"); // Redireciona para o gerenciador para ver o post criado
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o post. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÕES DE GERENCIAMENTO ---
  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const q = query(collection(db, "blog"), orderBy("dataCriacao", "desc"));
      const querySnapshot = await getDocs(q);
      const posts = [];
      querySnapshot.forEach((docSnap) => {
        posts.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPostsPublicados(posts);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      alert("Erro ao carregar os posts.");
    } finally {
      setLoadingPosts(false);
    }
  }

  async function excluirPost(id, tituloPost) {
    const confirmar = window.confirm(`Tem certeza que deseja excluir permanentemente o post:\n"${tituloPost}"?`);
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "blog", id));
      // Remove o post excluído da lista na tela sem precisar recarregar o banco
      setPostsPublicados(postsPublicados.filter(post => post.id !== id));
      alert("Post excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      alert("Erro ao excluir. Verifique sua conexão e permissões.");
    }
  }

  // Helper para formatar data
  const formatarData = (dataIso) => {
    if (!dataIso) return "-";
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          <img src="/menu.png" alt="menu" />
        </button>
        <h2 className={styles.title}>Painel Admin</h2>
        <ul className={styles.navList}>
          <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={styles.navLink}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Gestão de Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Criar Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Criar Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Historico de curtidas</span></Link></li>
          <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="L" /><span className={styles.linkText}>Comentarios Forum</span></Link></li>
        </ul>
      </aside>

      <main className={styles.main}>
        {/* CABEÇALHO E ABAS */}
        <div className={styles.headerFlex}>
          <h1>
            {activeTab === "manage" 
              ? "Gerenciar Artigos Publicados" 
              : (modoPreview ? "Visualização do Post" : "Editor Profissional")}
          </h1>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={styles.publishBtn} onClick={() => { setActiveTab("create"); setModoPreview(false); }}
            >
              Criar Novo
            </button>
            <button 
              className={styles.btnAdd} 
              onClick={() => setActiveTab("manage")}
            >
              Gerenciar Publicados
            </button>
            
            {activeTab === "create" && (
              <>
                <button className={styles.btnAdd} onClick={() => setModoPreview(!modoPreview)} style={{marginLeft: '15px'}}>
                  {modoPreview ? "Voltar ao Editor" : "Ver Prévia"}
                </button>
                <button className={styles.publishBtn} onClick={salvarPost} disabled={loading}>
                  {loading ? "Publicando..." : "Publicar Artigo"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ÁREA DE CONTEÚDO */}
        {activeTab === "manage" ? (
          /* =========================================
             ABA 2: GERENCIADOR DE POSTS
             ========================================= */
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginTop: '20px' }}>
            {loadingPosts ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Carregando artigos...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#4b5563' }}>
                    <th style={{ padding: '12px' }}>Título do Artigo</th>
                    <th style={{ padding: '12px' }}>Categoria</th>
                    <th style={{ padding: '12px' }}>Autor</th>
                    <th style={{ padding: '12px' }}>Data</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {postsPublicados.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                        Nenhum artigo publicado ainda.
                      </td>
                    </tr>
                  ) : (
                    postsPublicados.map((post) => (
                      <tr key={post.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>{post.titulo}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {post.categoria}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#4b5563' }}>{post.autor}</td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '0.9rem' }}>{formatarData(post.dataCriacao)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button 
                            onClick={() => excluirPost(post.id, post.titulo)}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

        ) : modoPreview ? (
          /* =========================================
             ABA 1: PRÉVIA DO POST
             ========================================= */
          <div className="blog-post-container" style={{ marginTop: '20px' }}>
            <header className="blog-post-header">
              {categoria && <span style={{
                background: '#2563EB', color: 'white', padding: '4px 12px',
                borderRadius: '20px', fontSize: '0.85rem', textTransform: 'uppercase',
                marginBottom: '10px', display: 'inline-block'
              }}>{categoria}</span>}
              <h1 className="blog-title">{titulo || "Título do Post"}</h1>
              {resumo && <p className="blog-subtitle">{resumo}</p>}
            </header>

            <section>
              {secoes.map((bloco, index) => (
                <div key={index}>
                  {bloco.type === 'paragraph' && <p className="blog-text">{bloco.content}</p>}
                  {bloco.type === 'subtitle' && <h2 className="blog-section-title">{bloco.content}</h2>}
                  {bloco.type === 'image' && bloco.content && (
                    <div className="blog-image-container">
                      <img src={bloco.content} alt="Imagem do post" className="blog-img" />
                    </div>
                  )}
                </div>
              ))}
            </section>
          </div>
        ) : (
          /* =========================================
             ABA 1: EDITOR DO POST
             ========================================= */
          <div className={styles.editorContainer}>
            <div className={styles.formColumn}>
              <div className={styles.metaBox}>
                <h3>Metadados (Dados do Firebase)</h3>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Título</label>
                  <input className={styles.inputField} value={titulo} onChange={e => setTitulo(e.target.value)} />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Categoria (Área)</label>
                  <select
                    className={styles.inputField}
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    style={{ height: '45px', background: 'white' }}
                  >
                    <option value="">Selecione a área...</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Engenharia">Engenharia</option>
                    <option value="Direito">Direito</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Rh">RH (Gestão de Pessoas)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label className={styles.fieldLabel}>Autor</label>
                    <input className={styles.inputField} value={autor} onChange={e => setAutor(e.target.value)} />
                  </div>

                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label className={styles.fieldLabel}>Tempo Estimado de Leitura</label>
                    <input
                      className={styles.inputField}
                      type="number"
                      value={tempoLeitura}
                      onChange={e => setTempoLeitura(e.target.value)}
                      placeholder="Calculado automaticamente..."
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Resumo</label>
                  <input className={styles.inputField} value={resumo} onChange={e => setResumo(e.target.value)} />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>URL da Capa</label>
                  <input
                    className={styles.inputField}
                    value={capa}
                    onChange={e => setCapa(e.target.value)}
                    placeholder="Cole o link da imagem aqui..."
                  />
                </div>

                {capa && (
                  <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>Prévia da Capa:</p>
                    <img
                      src={capa}
                      alt="Capa"
                      style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', border: '1px solid #ddd' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className={styles.blocksList}>
                {secoes.map((secao, index) => (
                  <div key={secao.id} className={styles.blockItem}>
                    <div className={styles.blockHeader}>
                      <span className={styles.blockLabel}>{secao.type.toUpperCase()}</span>
                      <div className={styles.blockActions}>
                        <button onClick={() => removerBloco(secao.id)} className={styles.btnIcon}><img src="/lixeira.png" alt="X" /></button>
                        {index > 0 && <button onClick={() => moverBloco(index, -1)} className={styles.btnIcon}><img src="/sobe.png" alt="^" /></button>}
                        {index < secoes.length - 1 && <button onClick={() => moverBloco(index, 1)} className={styles.btnIcon}><img src="/dece.png" alt="v" /></button>}
                      </div>
                    </div>
                    {secao.type === 'paragraph' ? (
                      <textarea className={styles.textAreaBlock} value={secao.content} onChange={e => atualizarBloco(secao.id, e.target.value)} />
                    ) : (
                      <div className={styles.inputGroup}>
                        <input className={styles.inputBlock} value={secao.content} onChange={e => atualizarBloco(secao.id, e.target.value)} />
                        {secao.type === 'image' && secao.content && (
                          <img
                            src={secao.content}
                            alt="Bloco"
                            style={{ maxWidth: '100px', marginTop: '10px', borderRadius: '4px' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className={styles.addButtons}>
                <button onClick={() => adicionarBloco('subtitle')} className={styles.btnAdd}>+ Subtítulo</button>
                <button onClick={() => adicionarBloco('paragraph')} className={styles.btnAdd}>+ Parágrafo</button>
                <button onClick={() => adicionarBloco('image')} className={styles.btnAdd}>+ Imagem</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}