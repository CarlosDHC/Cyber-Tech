import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";

// Firebase
import { db } from "../../../FirebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function Notas() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const buscarNotas = async () => {
      try {
        const q = query(collection(db, "pontuacoes"), orderBy("data", "desc"));
        const snapshot = await getDocs(q);

        const agrupamento = {};

        snapshot.docs.forEach((doc) => {
          const dados = doc.data(); // Readicionado: essencial para pegar os dados
          const emailAluno = dados.email; // Readicionado: essencial para o agrupamento

          // Se o aluno ainda não existe no objeto, cria a entrada dele
          if (!agrupamento[emailAluno]) {
            agrupamento[emailAluno] = {
              uid: dados.uid,
              // Tenta pegar 'nome', se não tiver tenta 'usuario', senão usa padrão
              nome: dados.nome || dados.usuario || "Aluno sem nome",
              email: dados.email,
              respostas: []
            };
          }

          // Adiciona a nota atual ao histórico desse aluno específico
          agrupamento[emailAluno].respostas.push({
            id: doc.id,
            desafio: dados.desafio,
            nota: dados.nota,
            total: dados.total,
            data: dados.data
          });
        });

        const listaAgrupada = Object.values(agrupamento);
        setAlunos(listaAgrupada);
      } catch (error) {
        console.error("Erro ao buscar notas:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarNotas();
  }, []);

  const formatarData = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          <img src="/menu.png" alt="menu" />
        </button>

        <h2 className={styles.title}>Administrador</h2>

        <ul className={styles.navList}>
          <li>
            <Link to="/admin" className={styles.navLink}>
              <img src="/casa.png" alt="Home" />
              <span className={styles.linkText}>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/notas" className={styles.navLink}>
              <img src="/estrela.png" alt="Notas" />
              <span className={styles.linkText}>Notas</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/newblog" className={styles.navLink}>
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
            <Link to="/admin/curtidas" className={styles.navLink}>
              <img src="/curti.png" alt="curti" />
              <span className={styles.linkText}>like</span>
            </Link>
          </li>
        </ul>
      </aside>

      <main className={styles.main}>
        <h1>Desempenho por Aluno</h1>

        {loading ? (
          <p>Carregando notas...</p>
        ) : alunos.length === 0 ? (
          <p>Nenhuma nota registrada ainda.</p>
        ) : (
          <div className={styles.cards}>
            {alunos.map((aluno) => (
              <div key={aluno.email} className={styles.card} style={{ display: 'block' }}>
                <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
                  <h3 style={{ color: '#095e8b', marginBottom: '5px' }}>{aluno.nome}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>{aluno.email}</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '5px' }}>
                    Total de tentativas: {aluno.respostas.length}
                  </p>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#999', borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '8px' }}>Desafio</th>
                        <th style={{ padding: '8px' }}>Nota</th>
                        <th style={{ padding: '8px' }}>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aluno.respostas.map((item) => {
                        const porcentagem = item.nota / item.total;
                        const aprovado = porcentagem >= 0.6;

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '8px', color: '#333' }}>
                              {item.desafio ? item.desafio.replace("Desafio ", "") : "Sem nome"}
                            </td>
                            <td style={{ padding: '8px' }}>
                              <span
                                style={{
                                  fontWeight: "bold",
                                  color: aprovado ? "green" : "red",
                                  backgroundColor: aprovado ? "#e6fffa" : "#fff5f5",
                                  padding: "2px 6px",
                                  borderRadius: "4px"
                                }}
                              >
                                {item.nota} / {item.total}
                              </span>
                            </td>
                            <td style={{ padding: '8px', fontSize: '0.75rem', color: '#777' }}>
                              {formatarData(item.data).split(' às ')[0]}
                              <br />
                              {formatarData(item.data).split(' às ')[1]}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}