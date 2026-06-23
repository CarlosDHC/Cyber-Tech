import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";
import styles from "../Admin.module.css";

export default function Curtidas() {
  const [curtidas, setCurtidas] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // Carrega as curtidas assim que a página abre
  useEffect(() => {
    buscarCurtidas();
  }, []);

  const buscarCurtidas = async () => {
    try {
      const q = query(collection(db, "likes"), orderBy("data", "desc"));
      const snapshot = await getDocs(q);

      const listaCurtidas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCurtidas(listaCurtidas);
      processarRanking(listaCurtidas);
    } catch (error) {
      console.error("Erro ao buscar curtidas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica separada para calcular o Top 5
  const processarRanking = (lista) => {
    const stats = {};
    lista.forEach((item) => {
      const titulo = item.postTitle || item.postId || "Post sem título";
      stats[titulo] = (stats[titulo] || 0) + 1;
    });

    const formattedData = Object.keys(stats).map((key) => ({
      name: key,
      likes: stats[key],
    }));

    const top5 = formattedData.sort((a, b) => b.likes - a.likes).slice(0, 5);
    setTopPosts(top5);
  };

  // Formatação de data padronizada
  const formatarData = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Tela de Loading padronizada com o layout
  if (loading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.emptyMessage}>Carregando histórico de curtidas...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* ================= SIDEBAR ================= */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Abrir menu" : "Fechar menu"}
        >
          <img src="/menu.png" alt="menu" />
        </button>

        <h2 className={styles.title}>ADMIN</h2>

        <ul className={styles.navList}>
          <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={styles.navLink}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Gestão de Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Criar Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Criar Desafios</span></Link></li>
          
          {/* Link Ativo marcado com a classe styles.active */}
          <li><Link to="/admin/curtidas" className={`${styles.navLink} ${styles.active}`}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Histórico de curtidas</span></Link></li>
          
          <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="L" /><span className={styles.linkText}>Comentários Forum</span></Link></li>
          <li><Link to="/admin/denuncias" className={styles.navLink}><img src="/denuncia.png" alt="U" /><span className={styles.linkText}>Denúncias</span></Link></li>
        </ul>
      </aside>

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <main className={styles.main}>
        <div className={styles.headerFlex}>
          <div>
            <h1>Histórico de Curtidas</h1>
            <span className={styles.warning} style={{ color: "var(--color-text-muted)" }}>
              Acompanhe o engajamento dos posts
            </span>
          </div>
        </div>

        {curtidas.length === 0 ? (
          <div className={styles.emptyMessage}>Nenhuma curtida registrada ainda.</div>
        ) : (
          <>
            {/* GRID DE MÉTRICAS E RANKING */}
            <div className={styles.metricsGrid}>
              
              {/* CARD: TOTAL DE CURTIDAS */}
              <div className={styles.cardCompact} style={{ justifyContent: "center" }}>
                <span className={styles.cardHeaderMini}>Total de Curtidas</span>
                <span className={styles.bigNumber} style={{ color: "var(--color-primary-light)" }}>
                  {curtidas.length}
                </span>
              </div>

              {/* CARD: POST CAMPEÃO */}
              <div className={styles.cardCompact} style={{ justifyContent: "center", textAlign: "center" }}>
                <span className={styles.cardHeaderMini}>Post mais popular</span>
                <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--color-text-dark)", marginTop: "10px" }}>
                  {topPosts.length > 0 ? topPosts[0].name : "-"}
                </span>
                {topPosts.length > 0 && (
                  <span style={{ color: "var(--color-primary-light)", fontWeight: "bold", marginTop: "5px" }}>
                    {topPosts[0].likes} curtidas
                  </span>
                )}
              </div>

              {/* CARD: RANKING TOP 5 (Ocupa 2 colunas no Desktop) */}
              <div className={styles.card} style={{ gridColumn: "span 2" }}>
                <h3 className={styles.cardHeaderMini} style={{ textAlign: "left", marginBottom: "15px" }}>
                  Top 5 Posts do Blog
                </h3>
                {topPosts.length > 0 ? (
                  <div className={styles.miniList}>
                    {topPosts.map((post, index) => (
                      <div key={index} className={styles.miniItem}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span
                            style={{
                              background: index === 0 ? "#fef08a" : "var(--color-light-bg)",
                              color: index === 0 ? "#ca8a04" : "var(--color-text-muted)",
                              width: "28px",
                              height: "28px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              fontWeight: "bold",
                              fontSize: "0.8rem",
                            }}
                          >
                            {index + 1}º
                          </span>
                          <span style={{ fontWeight: "600", color: "var(--color-text-dark)" }}>{post.name}</span>
                        </div>
                        <span
                          style={{
                            background: "var(--color-primary-light)",
                            color: "var(--color-white)",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                          }}
                        >
                          {post.likes} <span style={{ fontSize: "0.7rem" }}>❤️</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyMessage} style={{ padding: 0 }}>Dados insuficientes.</p>
                )}
              </div>
            </div>

            {/* FEED DE ÚLTIMAS CURTIDAS (LISTA VERTICAL) */}
            <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-dark)", marginTop: "40px", marginBottom: "20px" }}>
              Últimas Atividades
            </h2>

            <div className={styles.blocksList}>
              {curtidas.map((c) => (
                <div key={c.id} className={styles.blockItem} style={{ borderLeft: "4px solid var(--color-primary-light)", padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    
                    {/* Info do Usuário */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <strong style={{ fontSize: "1rem", color: "var(--color-text-dark)" }}>
                        {c.userName || "Usuário Anônimo"}
                      </strong>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{c.userEmail}</span>
                    </div>

                    {/* Info do Post e Data */}
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                        {formatarData(c.data)}
                      </span>
                      <div
                        style={{
                          background: "var(--color-light-bg)",
                          border: "1px solid var(--color-border)",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          color: "var(--color-text-dark)",
                          maxWidth: "300px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        Curtiu: <strong>{c.postTitle || c.postId}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}