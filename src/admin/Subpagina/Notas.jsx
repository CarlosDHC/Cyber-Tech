import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";
import notasStyles from "./Notas.module.css";

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

 
        const listaAgrupada = Object.values(agrupamento);
        setAlunos(listaAgrupada);

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
 
    const d = new Date(isoString);

    const d = isoString.toDate ? isoString.toDate() : new Date(isoString);
    if (isNaN(d)) return "-";
 
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
         <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={styles.navLink}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Like</span></Link></li>
          <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="L" /><span className={styles.linkText}>Comentarios Forum</span></Link></li>
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

          <>
            <div className={notasStyles.metricsGrid}>

              <div className={styles.card}>
                <h3 style={{ borderBottom: '2px solid #00C49F', paddingBottom: '10px', marginBottom: '15px' }}>Alunos em Destaque</h3>
                <div className={notasStyles.tableWrapper}>
                  <table className={notasStyles.responsiveTable}>

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

                      {topStudents.map((aluno, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px' }}>{aluno.nome}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#00C49F' }}>{aluno.media.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #FF8042' }}>
                <h3 style={{ borderBottom: '2px solid #FF8042', paddingBottom: '10px', marginBottom: '15px' }}>Alunos em risco</h3>
                {riskStudents.length > 0 ? (
                  <div className={notasStyles.tableWrapper}>
                    <table className={notasStyles.responsiveTable}>
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
                  </div>
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

                  <div className={notasStyles.tableWrapper} style={{ maxHeight: '300px' }}>
                    <table className={notasStyles.responsiveTable}>
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