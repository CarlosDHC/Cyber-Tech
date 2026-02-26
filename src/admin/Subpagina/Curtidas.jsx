import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";

// Firebase
import { db } from "../../../FirebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function Curtidas() {
  const [curtidas, setCurtidas] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);

    const buscarCurtidas = async () => {
      try {
        const q = query(collection(db, "likes"), orderBy("data", "desc"));
        const snapshot = await getDocs(q);

        const listaCurtidas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCurtidas(listaCurtidas);

        const stats = {};

        listaCurtidas.forEach((item) => {
          const titulo = item.postTitle || item.postId || "Post sem título";

          if (!stats[titulo]) {
            stats[titulo] = 0;
          }
          stats[titulo] += 1;
        });

        const formattedData = Object.keys(stats).map(key => ({
          name: key,
          likes: stats[key]
        }));

        const top5 = formattedData.sort((a, b) => b.likes - a.likes).slice(0, 5);

        setTopPosts(top5);

      } catch (error) {
        console.error("Erro ao buscar curtidas:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarCurtidas();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatarData = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return (
      d.toLocaleDateString("pt-BR") +
      " " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Abrir menu" : "Fechar menu"}
        >
          <img src="/menu.png" alt="menu" />
        </button>

        <h2 className={styles.title}>Administrador</h2>

        <ul className={styles.navList}>
          <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={styles.navLink}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Like</span></Link></li>
          <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="L" /><span className={styles.linkText}>Comentarios Forum</span></Link></li>
        </ul>
      </aside>

      <main className={styles.main}>
        <h1>Histórico de Curtidas</h1>

        {loading ? (
          <p>Carregando curtidas...</p>
        ) : curtidas.length === 0 ? (
          <p>Nenhuma curtida registrada ainda.</p>
        ) : (
          <>
            {/* TABELA DE TOP 5 CURTIDAS */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                Post mais populares
              </h3>

              {topPosts.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: "12px", borderBottom: "2px solid #e9ecef", color: '#495057', width: '50px' }}>#</th>
                        <th style={{ padding: "12px", borderBottom: "2px solid #e9ecef", color: '#495057' }}>Título do Post</th>
                        <th style={{ padding: "12px", borderBottom: "2px solid #e9ecef", color: '#495057', textAlign: 'center', width: '120px' }}>Total Curtidas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPosts.map((post, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f1f3f5" }}>
                          <td style={{ padding: "12px", fontWeight: 'bold', color: '#2563EB' }}>{index + 1}º</td>
                          <td style={{ padding: "12px", fontWeight: '500' }}>{post.name}</td>
                          <td style={{ padding: "12px", textAlign: 'center' }}>
                            <span style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              fontSize: '0.9rem'
                            }}>
                              {post.likes}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#888', fontStyle: 'italic' }}>Dados insuficientes para o ranking.</p>
              )}
            </div>

            {/* LISTA GERAL / TABELA DE HISTÓRICO */}
            <h3 style={{ marginTop: '40px', marginBottom: '15px', color: '#666' }}>Últimas Curtidas Recebidas</h3>

            {isMobile ? (
              <div className={styles.mobileCardsContainer}>
                {curtidas.map((c) => (
                  <div key={c.id} className={styles.notaCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.alunoNome}>{c.userName || "Usuário"}</span>
                      <span className={styles.alunoEmail}>{c.userEmail}</span>
                    </div>
                    <div className={styles.cardDetail}>
                      <strong>Post curtido:</strong> {c.postTitle || c.postId}
                    </div>
                    <div className={styles.cardDetail}>
                      <strong>Data:</strong> {formatarData(c.data)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.card} style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <th style={{ padding: "10px" }}>Usuário (Email)</th>
                      <th style={{ padding: "10px" }}>Post</th>
                      <th style={{ padding: "10px" }}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curtidas.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "10px" }}>
                          <strong>{c.userName || "Usuário"}</strong>
                          <br />
                          <span style={{ fontSize: "0.8rem", color: "#666" }}>{c.userEmail}</span>
                        </td>
                        <td style={{ padding: "10px" }}>{c.postTitle || c.postId}</td>
                        <td style={{ padding: "10px", fontSize: "0.9rem" }}>{formatarData(c.data)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}