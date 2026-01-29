import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";

// Firebase
import { db } from "../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";

import "../../pages/Blog/BlogPost.css";

export default function NewBlog() {
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [capa, setCapa] = useState("");
  const [autor, setAutor] = useState("");
  const [tempoLeitura, setTempoLeitura] = useState("");
  
  // Estado para categoria
  const [categoria, setCategoria] = useState(""); 

  const [secoes, setSecoes] = useState([
    { id: Date.now(), type: "paragraph", content: "" }
  ]);

  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [modoPreview, setModoPreview] = useState(false);

  // --- CÁLCULO AUTOMÁTICO DE TEMPO DE LEITURA ---
  useEffect(() => {
    const textoTotal = secoes.reduce((acc, bloco) => {
      if (bloco.type === 'paragraph' || bloco.type === 'subtitle') {
        return acc + " " + (bloco.content || "");
      }
      return acc;
    }, "");

    const contagemPalavras = textoTotal.trim().split(/\s+/).length;
    
    // Média de leitura: 200 palavras por minuto
    const minutosCalculados = Math.ceil(contagemPalavras / 200);
    const tempoFinal = contagemPalavras > 0 ? minutosCalculados : "";

    setTempoLeitura(tempoFinal.toString());

  }, [secoes]);

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
      
      setTitulo(""); setResumo(""); setCapa(""); setAutor(""); setTempoLeitura(""); setCategoria("");
      setSecoes([{ id: Date.now(), type: "paragraph", content: "" }]);
      setModoPreview(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o post. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          <img src="/menu.png" alt="menu" />
        </button>
        <h2 className={styles.title}>Painel Admin</h2>
        <ul className={styles.navList}>
          <li>
            <Link to="/admin" data-tooltip="Home" className={styles.navLink}>
              <img src="/casa.png" alt="Home" />
              <span className={styles.linkText}>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/notas" data-tooltip="Notas" className={styles.navLink}>
              <img src="/estrela.png" alt="Notas" />
              <span className={styles.linkText}>Notas</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/newblog" data-tooltip="Blog" className={styles.navLink}>
              <img src="/blog.png" alt="Blog" />
              <span className={styles.linkText}>Blog</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/newdesafios" data-tooltip="Desafios" className={styles.navLink}>
              <img src="/desafio.png" alt="Desafios" />
              <span className={styles.linkText}>Desafios</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/curtidas" data-tooltip="like" className={styles.navLink}>
              <img src="/curti.png" alt="curti" />
              <span className={styles.linkText}>like</span>
            </Link>
          </li>
        </ul>
      </aside>

      <main className={styles.main}>
        <div className={styles.headerFlex}>
          <h1>{modoPreview ? "Visualização do Post" : "Editor Profissional"}</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className={styles.btnAdd} onClick={() => setModoPreview(!modoPreview)}>
              {modoPreview ? "Voltar ao Editor" : "Ver Prévia"}
            </button>
            <button className={styles.publishBtn} onClick={salvarPost} disabled={loading}>
              {loading ? "Publicando..." : "Publicar Artigo"}
            </button>
          </div>
        </div>

        {modoPreview ? (
          <div className="blog-post-container">
            <header className="blog-post-header">
              {categoria && <span style={{
                  background:'#2563EB', color:'white', padding:'4px 12px', 
                  borderRadius:'20px', fontSize:'0.85rem', textTransform:'uppercase',
                  marginBottom:'10px', display:'inline-block'
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
                  
                  {/* --- CAMPO DE TEMPO MELHORADO --- */}
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label className={styles.fieldLabel}>
                      Tempo Estimado de Leitura (min)
                    </label>
                    <input 
                      className={styles.inputField} 
                      type="number" 
                      value={tempoLeitura} 
                      onChange={e => setTempoLeitura(e.target.value)} 
                      placeholder="Calculado automaticamente..."
                    />
                    <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                      Estimativa de quanto tempo o usuário levará para ler o artigo.
                    </small>
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