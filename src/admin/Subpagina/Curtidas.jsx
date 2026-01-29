import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";

// Firebase
import { db } from "../../../FirebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function Curtidas() {
  const [curtidas, setCurtidas] = useState([]);
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
        <h1>Histórico de Curtidas</h1>

        {loading ? (
          <p>Carregando curtidas...</p>
        ) : curtidas.length === 0 ? (
          <p>Nenhuma curtida registrada ainda.</p>
        ) : (
          <>
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