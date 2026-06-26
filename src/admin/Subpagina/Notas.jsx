import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";
import notasStyles from "./Notas.module.css";

// Firebase
import { db } from "../../../FirebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function Notas() {
  const [alunos, setAlunos] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const buscarNotas = async () => {
      try {
        const q = query(collection(db, "pontuacoes"), orderBy("data", "desc"));
        const snapshot = await getDocs(q);

        const agrupamento = {};

        snapshot.docs.forEach((doc) => {
          const dados = doc.data();
          const emailAluno = dados.email || dados.userEmail;

          if (!emailAluno) return;

          if (!agrupamento[emailAluno]) {
            agrupamento[emailAluno] = {
              uid: dados.uid || dados.userId,
              nome: dados.nome || dados.userName || dados.usuario || "Aluno sem nome",
              email: emailAluno,
              respostasBrutas: []
            };
          }

          agrupamento[emailAluno].respostasBrutas.push({
            id: doc.id,
            desafioId: dados.desafioId,
            desafio: dados.desafio || dados.desafioTitulo || "Desafio sem título",
            categoria: dados.categoria || "Geral",
            nota: Number(dados.nota || 0),
            total: Number(dados.total || 1),
            tentativas: Number(dados.tentativas || 1),
            data: dados.data
          });
        });

        const listaProcessada = Object.values(agrupamento).map(aluno => {
          const desafiosUnicos = {};

          aluno.respostasBrutas.forEach(resp => {
            const chaveDesafio = resp.desafioId || resp.desafio;
            if (!desafiosUnicos[chaveDesafio]) {
              desafiosUnicos[chaveDesafio] = resp;
            } else {
              if (resp.nota > desafiosUnicos[chaveDesafio].nota) {
                desafiosUnicos[chaveDesafio] = resp;
              }
            }
          });

          const respostasFinais = Object.values(desafiosUnicos);

          let somaNotasPonderadas = 0;
          respostasFinais.forEach(resp => {
            const notaBase10 = (resp.nota / resp.total) * 10;
            somaNotasPonderadas += notaBase10;
          });

          const mediaFinal = respostasFinais.length > 0
            ? (somaNotasPonderadas / respostasFinais.length)
            : 0;

          return {
            ...aluno,
            respostas: respostasFinais,
            media: mediaFinal
          };
        });

        setAlunos(listaProcessada);
        setTopStudents([...listaProcessada].sort((a, b) => b.media - a.media).slice(0, 5));
        setRiskStudents([...listaProcessada].filter(a => a.media < 6.0).sort((a, b) => a.media - b.media).slice(0, 5));

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
    const d = isoString.toDate ? isoString.toDate() : new Date(isoString);
    if (isNaN(d)) return "-";
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          <img src="/menu.png" alt="menu" />
        </button>
        <h2 className={styles.title}>Administrador</h2>
        <ul className={styles.navList}>
          <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={`${styles.navLink} ${styles.active}`}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Gestão de Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Criar Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Criar Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Histórico de curtidas</span></Link></li>
          <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="L" /><span className={styles.linkText}>Comentários Forum</span></Link></li>
          <li><Link to="/admin/denuncia" className={styles.navLink}><img src="/denuncia.png" alt="U" /><span className={styles.linkText}>Denúncia</span></Link></li>
        </ul>
      </aside>

      <main className={styles.main}>
        <h1 style={{ marginBottom: '20px' }}>Desempenho dos Alunos</h1>

        {loading ? (
          <p>Carregando notas...</p>
        ) : alunos.length === 0 ? (
          <p>Nenhuma nota registrada ainda.</p>
        ) : (
          <>
            {/* 🟢 GRID SUPERIOR: ALUNOS DESTAQUE E RISCO */}
            <div className={notasStyles.metricsGrid}>

              {/* CARD DESTAQUE */}
              <div className={notasStyles.alunoCard}>
                <h3 className={notasStyles.sectionTitleDestaque}>Alunos em Destaque</h3>
                <div className={notasStyles.tableWrapper}>
                  <table className={notasStyles.notasTable}>
                    <thead>
                      <tr>
                        <th>Aluno</th>
                        <th className={notasStyles.alignRight}>Média Geral</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStudents.map((aluno, i) => (
                        <tr key={`top-${i}`}>
                          <td>{aluno.nome}</td>
                          <td className={`${notasStyles.alignRight} ${notasStyles.mediaDestaque}`}>
                            <strong>{aluno.media.toFixed(1)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD RISCO */}
              <div className={`${notasStyles.alunoCard} ${notasStyles.cardRisco}`}>
                <h3 className={notasStyles.sectionTitleRisco}>Alunos em Risco</h3>
                {riskStudents.length > 0 ? (
                  <div className={notasStyles.tableWrapper}>
                    <table className={notasStyles.notasTable}>
                      <thead>
                        <tr>
                          <th>Aluno</th>
                          <th className={notasStyles.alignRight}>Média Geral</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskStudents.map((aluno, i) => (
                          <tr key={`risk-${i}`}>
                            <td>{aluno.nome}</td>
                            <td className={`${notasStyles.alignRight} ${notasStyles.mediaRisco}`}>
                              <strong>{aluno.media.toFixed(1)}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={notasStyles.centerTd} style={{ marginTop: '20px' }}>Tudo certo por aqui!</p>
                )}
              </div>

            </div>

            {/* 🟢 LISTA DETALHADA DE TODOS OS ALUNOS */}
            <div className={styles.cards}>
              {alunos.map((aluno) => (
                <div key={aluno.email} className={notasStyles.alunoCard}>
                  
                  <div className={notasStyles.alunoHeader}>
                    <div className={notasStyles.alunoInfo}>
                      <h3 className={notasStyles.alunoNome}>{aluno.nome}</h3>
                      <p className={notasStyles.alunoEmail}>{aluno.email}</p>
                    </div>
                    <div className={notasStyles.mediaContainer}>
                      <span className={notasStyles.mediaLabel}>Média Geral</span>
                      <span className={notasStyles.mediaValue}>{aluno.media.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className={notasStyles.tableWrapper}>
                    <table className={notasStyles.notasTable}>
                      <thead>
                        <tr>
                          <th>Desafio</th>
                          <th>Categoria</th>
                          <th>Melhor Nota</th>
                          <th className={notasStyles.centerTd}>Tentativas</th>
                          <th>Última Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aluno.respostas.map((item) => {
                          const porcentagem = item.nota / item.total;
                          const aprovado = porcentagem >= 0.6;

                          return (
                            <tr key={item.id}>
                              <td>
                                {item.desafio ? item.desafio.replace("Desafio ", "") : "Sem nome"}
                              </td>
                              <td className={notasStyles.categoriaTd}>
                                {item.categoria}
                              </td>
                              <td>
                                <span className={`${notasStyles.badge} ${aprovado ? notasStyles.badgeAprovado : notasStyles.badgeReprovado}`}>
                                  {item.nota} / {item.total}
                                </span>
                              </td>
                              <td className={notasStyles.centerTd}>
                                {item.tentativas}
                              </td>
                              <td className={notasStyles.dataTd}>
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
          </>
        )}
      </main>
    </div>
  );
}