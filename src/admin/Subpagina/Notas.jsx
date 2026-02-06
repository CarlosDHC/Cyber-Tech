import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";

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
          
          // CORREÇÃO AQUI: Tenta ler 'email' (novo) ou 'userEmail' (antigo)
          const emailAluno = dados.email || dados.userEmail;

          if (!emailAluno) return;

          // Se o aluno ainda não existe no objeto, cria a entrada
          if (!agrupamento[emailAluno]) {
            agrupamento[emailAluno] = {
              uid: dados.uid || dados.userId, // Lê uid novo ou userId antigo
              nome: dados.nome || dados.userName || dados.usuario || "Aluno sem nome",
              email: emailAluno,
              respostasBrutas: []
            };
          }

          // Adiciona os dados brutos (compatibilidade com nomes antigos)
          agrupamento[emailAluno].respostasBrutas.push({
            id: doc.id,
            desafioId: dados.desafioId,
            desafio: dados.desafio || dados.desafioTitulo || "Desafio sem título", // Lê desafio ou desafioTitulo
            categoria: dados.categoria || "Geral",
            nota: Number(dados.nota || 0),
            total: Number(dados.total || 1),
            tentativas: Number(dados.tentativas || 1),
            data: dados.data
          });
        });

        // PROCESSAMENTO: Filtrar pela nota mais alta de cada desafio
        const listaProcessada = Object.values(agrupamento).map(aluno => {
          const desafiosUnicos = {};

          aluno.respostasBrutas.forEach(resp => {
            // Usa o ID do desafio se existir, senão usa o nome como chave
            const chaveDesafio = resp.desafioId || resp.desafio;

            if (!desafiosUnicos[chaveDesafio]) {
              desafiosUnicos[chaveDesafio] = resp;
            } else {
              // Mantém apenas a maior nota
              if (resp.nota > desafiosUnicos[chaveDesafio].nota) {
                desafiosUnicos[chaveDesafio] = resp;
              }
            }
          });

          const respostasFinais = Object.values(desafiosUnicos);

          // Calcula a média
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

        // Top 5 Destaques
        setTopStudents([...listaProcessada].sort((a, b) => b.media - a.media).slice(0, 5));

        // Top 5 Risco
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
          <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="Home" /><span className={styles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={styles.navLink}><img src="/estrela.png" alt="Notas" /><span className={styles.linkText}>Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/blog.png" alt="Blog" /><span className={styles.linkText}>Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/desafio.png" alt="Desafios" /><span className={styles.linkText}>Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="like" /><span className={styles.linkText}>like</span></Link></li>
        </ul>
      </aside>

      <main className={styles.main}>
        <h1>Desempenho dos Alunos (Melhores Notas)</h1>

        {loading ? (
          <p>Carregando notas...</p>
        ) : alunos.length === 0 ? (
          <p>Nenhuma nota registrada ainda.</p>
        ) : (
          <>
            <div className={styles.metricsGrid} style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className={styles.card}>
                <h3 style={{ borderBottom: '2px solid #00C49F', paddingBottom: '10px', marginBottom: '15px' }}>🏆 Top 5 Destaques</h3>
                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#999' }}>
                      <th style={{ padding: '8px' }}>Aluno</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Média Geral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((aluno, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '8px' }}>{aluno.nome}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#00C49F' }}>{aluno.media.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #FF8042' }}>
                <h3 style={{ borderBottom: '2px solid #FF8042', paddingBottom: '10px', marginBottom: '15px' }}>⚠️ Top 5 em Risco</h3>
                {riskStudents.length > 0 ? (
                  <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#999' }}>
                        <th style={{ padding: '8px' }}>Aluno</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Média Geral</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riskStudents.map((aluno, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px' }}>{aluno.nome}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#FF8042' }}>{aluno.media.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Tudo certo por aqui!</p>}
              </div>
            </div>

            <div className={styles.cards}>
              {alunos.map((aluno) => (
                <div key={aluno.email} className={styles.card} style={{ display: 'block' }}>
                  <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ color: '#095e8b', marginBottom: '5px' }}>{aluno.nome}</h3>
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>{aluno.email}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <span style={{ display: 'block', fontSize: '0.8rem', color: '#999' }}>Média Geral</span>
                       <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{aluno.media.toFixed(1)}</span>
                    </div>
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: '#999', borderBottom: '1px solid #eee' }}>
                          <th style={{ padding: '8px' }}>Desafio</th>
                          <th style={{ padding: '8px' }}>Categoria</th>
                          <th style={{ padding: '8px' }}>Melhor Nota</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Tentativas</th>
                          <th style={{ padding: '8px' }}>Última Data</th>
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
                              <td style={{ padding: '8px', fontSize: '0.85rem', color: '#666' }}>
                                {item.categoria}
                              </td>
                              <td style={{ padding: '8px' }}>
                                <span style={{
                                  fontWeight: "bold",
                                  color: aprovado ? "green" : "red",
                                  backgroundColor: aprovado ? "#e6fffa" : "#fff5f5",
                                  padding: "2px 6px",
                                  borderRadius: "4px"
                                }}>
                                  {item.nota} / {item.total}
                                </span>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center', color: '#555' }}>
                                {item.tentativas}
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
          </>
        )}
      </main>
    </div>
  );
}