import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import styles from "./Admin.module.css";

import { db } from "../../FirebaseConfig";
import { collection, getCountFromServer, getDocs, query } from "firebase/firestore";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({ users: 0, posts: 0 });
  const [chartData, setChartData] = useState([]);

  const [topStudents, setTopStudents] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  const isDashboard = location.pathname === '/admin';

  const COLORS = {
    'Desafio 1': '#0088FE',
    'Desafio 2': '#00C49F',
    'Desafio 3': '#FFBB28',
    'Desafio 4': '#FF8042',
    'Geral': '#8884d8'
  };

  const GABARITO_TOTAIS = {
    "Desafio 1": 6,
    "Desafio 2": 7,
    "Desafio 3": 5,
    "Desafio 4": 5
  };

  useEffect(() => {
    if (!isDashboard) return;

    async function fetchDashboardData() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const usersColl = collection(db, "users");
        const blogColl = collection(db, "blog");
        const adminsColl = collection(db, "admins");

        const [usersSnap, blogSnap, adminsSnap] = await Promise.all([
          getCountFromServer(usersColl).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(blogColl).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(adminsColl).catch(() => ({ data: () => ({ count: 0 }) }))
        ]);

        setStats({
          users: usersSnap.data().count - adminsSnap.data().count,
          posts: blogSnap.data().count,
        });

        const pontuacoesRef = collection(db, "pontuacoes");
        const querySnapshot = await getDocs(query(pontuacoesRef));

        const agrupamento = {
          "Geral": { somaNotas: 0, quantidade: 0 }
        };

        const alunosMap = {}; 

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const nomeDesafio = data.desafio ? data.desafio.split(" - ")[0].trim() : "Outros";

          // LÓGICA DO GRÁFICO
          if (!agrupamento[nomeDesafio]) {
            agrupamento[nomeDesafio] = { somaNotas: 0, quantidade: 0 };
          }

          const notaBruta = Number(data.nota || 0);
          let totalQuestoes = Number(data.total);
          if (!totalQuestoes || totalQuestoes === 0) {
            totalQuestoes = GABARITO_TOTAIS[nomeDesafio] || 1;
          }

          const nota0a10 = (notaBruta / totalQuestoes) * 10;
          agrupamento[nomeDesafio].somaNotas += nota0a10;
          agrupamento[nomeDesafio].quantidade += 1;
          agrupamento["Geral"].somaNotas += nota0a10;
          agrupamento["Geral"].quantidade += 1;

          // LÓGICA DO RANKING
          const email = data.email;
          if (email) {
            if (!alunosMap[email]) {
              alunosMap[email] = {
                nome: data.nome || data.usuario || email.split('@')[0],
                somaMedia: 0,
                qtd: 0
              };
            }
            alunosMap[email].somaMedia += nota0a10;
            alunosMap[email].qtd += 1;
          }
        }); 

        // PROCESSAMENTO DO GRÁFICO
        const dadosGrafico = Object.keys(agrupamento)
          .filter(chave => chave !== "Outros")
          .map(chave => {
            const item = agrupamento[chave];
            const media = item.quantidade > 0 ? (item.somaNotas / item.quantidade) : 0;
            return {
              name: chave,
              media: Number(media.toFixed(1)),
              qtd: item.quantidade
            };
          });

        dadosGrafico.sort((a, b) => {
          if (a.name === 'Geral') return 1;
          if (b.name === 'Geral') return -1;
          return a.name.localeCompare(b.name);
        });

        setChartData(dadosGrafico);

        // PROCESSAMENTO DOS ALUNOS
        const listaAlunos = Object.values(alunosMap).map(aluno => ({
          nome: aluno.nome,
          media: aluno.qtd > 0 ? (aluno.somaMedia / aluno.qtd) : 0,
          qtd: aluno.qtd
        }));

        const top3 = [...listaAlunos].sort((a, b) => b.media - a.media).slice(0, 3);
        setTopStudents(top3);

        const risk3 = [...listaAlunos]
          .filter(a => a.media < 6.0)
          .sort((a, b) => a.media - b.media)
          .slice(0, 3);
        setRiskStudents(risk3);

      } catch (error) {
        console.error("Erro Dashboard:", error);
        setErrorMsg("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [isDashboard]);

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

        <h2 className={styles.title}>ADMINISTRADOR</h2>

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
        {isDashboard ? (
          <div className="dashboard-content">
            <h1 style={{ color: '#333', marginBottom: '20px' }}>Visão Geral</h1>
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            {loading ? <p>Carregando...</p> : (
              <>
                {/* 1. CARDS DE RESUMO (ALUNOS E POSTS) */}
                {/* Grid ajustado para cards menores e compactos */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '20px', 
                    marginBottom: '30px' 
                }}>
                  <div className={styles.card} style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                       <img src="/ialuno.png" alt="iconealuno" style={{ width: '28px', height: '28px' }} />
                       <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#555' }}>Alunos</h3>
                    </div>
                    <div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#095e8b' }}>{stats.users}</span>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Cadastrados</p>
                    </div>
                  </div>

                  <div className={styles.card} style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                       <img src="/iblog.png" alt="iconeblog" style={{ width: '28px', height: '28px' }} />
                       <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#555' }}>Posts</h3>
                    </div>
                    <div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#095e8b' }}>{stats.posts}</span>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Publicados</p>
                    </div>
                  </div>
                </div>
                {/* 3. LISTAS: DESTAQUES E RISCO */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                  {/* Card de Destaques */}
                  <div className={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                       <img src="/itrofeu.png" alt="iconetrofeu" style={{ width: '24px' }} />
                       <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Alunos em Destaque</h3>
                    </div>
                    
                    {topStudents.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {topStudents.map((aluno, index) => (
                          <li key={index} style={{ borderBottom: '1px solid #f9f9f9', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                <span style={{ 
                                    background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32', 
                                    color: 'white', width: '20px', height: '20px', borderRadius: '50%', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>{index + 1}</span>
                                <span style={{ fontWeight: '500', color: '#333' }}>{aluno.nome}</span>
                            </div>
                            <span style={{ color: '#059669', background:'#ECFDF5', padding:'2px 8px', borderRadius:'10px', fontSize:'0.85rem', fontWeight: 'bold' }}>{aluno.media.toFixed(1)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p style={{color:'#999'}}>Sem dados.</p>}
                  </div>

                  {/* Card de Risco */}
                  <div className={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                       <img src="/iatencion.png" alt="iconeatencion" style={{ width: '24px' }} />
                       <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Atenção Necessária</h3>
                    </div>

                    {riskStudents.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {riskStudents.map((aluno, index) => (
                          <li key={index} style={{ borderBottom: '1px solid #f9f9f9', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#555' }}>{aluno.nome}</span>
                            <span style={{ color: '#991B1B', background:'#FEF2F2', padding:'2px 8px', borderRadius:'10px', fontSize:'0.85rem', fontWeight: 'bold' }}>{aluno.media.toFixed(1)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#059669' }}>
                            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '5px' }}>😊</span>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Tudo ótimo!</p>
                            <p style={{ fontSize: '0.85rem', margin: 0 }}>Nenhum aluno com média baixa.</p>
                        </div>
                    )}
                  </div>

                </div>

                {/* 2. GRÁFICO PRINCIPAL */}
                <div className={styles.card} style={{ minHeight: '400px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0', marginBottom: '20px' }}>
                     <img src="/igrafico.png" alt="iconegrafico" style={{ width: '24px' }}/>
                     <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Média de Notas (0 - 10)</h3>
                  </div>
                  {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" stroke="#666" fontSize={12} tick={{ fill: '#333' }} />
                          <YAxis domain={[0, 10]} stroke="#666" fontSize={12} allowDecimals={false} />
                          <Tooltip
                            cursor={{ fill: '#f3f4f6' }}
                            formatter={(value) => [value, "Média"]}
                            labelStyle={{ color: '#333' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="media" name="Média" radius={[6, 6, 0, 0]} barSize={50}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p style={{ marginTop: '20px', color: '#999' }}>Sem dados de notas ainda.</p>
                  )}
                </div>

                
              </>
            )}
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}