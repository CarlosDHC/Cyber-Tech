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
  const [collapsed, setCollapsed] = useState(true);

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
            data: dados.data
          });
        });

        const listaProcessada = Object.values(agrupamento).map(aluno => {
          const desafiosUnicos = {};

          aluno.respostasBrutas.forEach(resp => {
            const chaveDesafio = resp.desafioId || resp.desafio;
            // Mantém apenas a melhor nota de cada desafio
            if (!desafiosUnicos[chaveDesafio] || resp.nota > desafiosUnicos[chaveDesafio].nota) {
              desafiosUnicos[chaveDesafio] = resp;
            }
          });

          const respostasFinais = Object.values(desafiosUnicos);
          let somaNotasPonderadas = 0;
          respostasFinais.forEach(resp => {
            somaNotasPonderadas += (resp.nota / resp.total) * 10;
          });

          const mediaFinal = respostasFinais.length > 0 ? (somaNotasPonderadas / respostasFinais.length) : 0;

          return {
            ...aluno,
            respostas: respostasFinais,
            tentativasTotal: aluno.respostasBrutas.length,
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
          <li><Link to="/admin/notas" className={styles.navLink}><img src="/estrela.png" alt="N" /><span className={styles.linkText}>Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/blog.png" alt="B" /><span className={styles.linkText}>Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/desafio.png" alt="D" /><span className={styles.linkText}>Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Likes</span></Link></li>
          <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="C" /><span className={styles.linkText}>Comentários</span></Link></li>
        </ul>
      </aside>

      <main className={styles.main}>
        <h1>Painel de Desempenho</h1>

        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <>
            {/* Seção de Métricas Rápidas */}
            <div className={notasStyles.metricsGrid} style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div className={styles.card} style={{ flex: 1, borderLeft: '4px solid #00C49F' }}>
                <h3>Destaques (Média {'>'} 8)</h3>
                <table className={notasStyles.responsiveTable} style={{ width: '100%' }}>
                  <tbody>
                    {topStudents.map((aluno, i) => (
                      <tr key={i}>
                        <td>{aluno.nome}</td>
                        <td style={{ fontWeight: 'bold', color: '#00C49F', textAlign: 'right' }}>{aluno.media.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.card} style={{ flex: 1, borderLeft: '4px solid #FF8042' }}>
                <h3>Atenção (Média {'<'} 6)</h3>
                <table className={notasStyles.responsiveTable} style={{ width: '100%' }}>
                  <tbody>
                    {riskStudents.map((aluno, i) => (
                      <tr key={i}>
                        <td>{aluno.nome}</td>
                        <td style={{ fontWeight: 'bold', color: '#FF8042', textAlign: 'right' }}>{aluno.media.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lista Detalhada de Alunos */}
            <h2>Lista de Alunos</h2>
            <div className={styles.cards}>
              {alunos.map((aluno) => (
                <div key={aluno.email} className={styles.card}>
                  <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ color: '#095e8b' }}>{aluno.nome}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#666' }}>{aluno.email}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{aluno.media.toFixed(1)}</span>
                      <p style={{ fontSize: '0.7rem' }}>MÉDIA</p>
                    </div>
                  </div>

                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ color: '#999', textAlign: 'left' }}>
                          <th>Desafio</th>
                          <th>Nota</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aluno.respostas.map((item) => (
                          <tr key={item.id}>
                            <td>{item.desafio.replace("Desafio ", "")}</td>
                            <td style={{ color: (item.nota/item.total) >= 0.6 ? 'green' : 'red', fontWeight: 'bold' }}>
                              {item.nota}/{item.total}
                            </td>
                            <td>{formatarData(item.data).split(' às ')[0]}</td>
                          </tr>
                        ))}
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