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
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [collapsed, setCollapsed] = useState(false);

  const isDashboard = location.pathname === '/admin';

  // Cores para o gráfico
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
        // 1. Buscando Contagens
        const usersColl = collection(db, "users");
        const blogColl = collection(db, "blog");
        const adminsColl = collection(db, "admins"); // Referência para coleção de admins
        
        const [usersSnap, blogSnap, adminsSnap] = await Promise.all([
            getCountFromServer(usersColl).catch(() => ({ data: () => ({ count: 0 }) })), 
            getCountFromServer(blogColl).catch(() => ({ data: () => ({ count: 0 }) })),
            getCountFromServer(adminsColl).catch(() => ({ data: () => ({ count: 0 }) })) // Busca total de admins
        ]);

        setStats({
          // Subtrai os admins do total de usuários para mostrar apenas alunos
          users: usersSnap.data().count - adminsSnap.data().count,
          posts: blogSnap.data().count,
        });

        // 2. Buscando Dados do Gráfico
        const pontuacoesRef = collection(db, "pontuacoes");
        const querySnapshot = await getDocs(query(pontuacoesRef));
        
        const agrupamento = {
          "Geral": { somaNotas: 0, quantidade: 0 }
        };

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          const nomeDesafio = data.desafio ? data.desafio.split(" - ")[0].trim() : "Outros"; 
          
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
        });

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
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Abrir menu" : "Fechar menu"}
        >
          <img src="/menu.png" alt="menu" />
        </button>

        <h2 className={styles.title}>Administrador 2</h2>

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
             <h1 style={{color: '#333'}}>Visão Geral</h1>
             
             {errorMsg && <p style={{color:'red'}}>{errorMsg}</p>}

             {loading ? <p>Carregando...</p> : (
               <>
                 <div className={styles.cards} style={{marginBottom: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'}}>
                   <div className={styles.card}>
                    <img src="/ialuno.png" alt="iconealuno" />
                     <h3>Alunos</h3>
                     <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#095e8b', margin: '10px 0'}}>{stats.users}</p>
                     <p>Cadastrados</p>
                   </div>
                   <div className={styles.card}>
                    <img src="/iblog.png" alt="iconeblog" />
                     <h3>Posts</h3>
                     <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#095e8b', margin: '10px 0'}}>{stats.posts}</p>
                     <p>Publicados</p>
                   </div>
                 </div>

                 <div className={styles.card} style={{ minHeight: '400px' }}>
                  <img src="/igrafico.png" alt="iconegrafico" />
                    <h3>Média de Notas (0 - 10)</h3>
                    {chartData.length > 0 ? (
                      <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                        <ResponsiveContainer>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} tick={{ fill: '#333' }} />
                            <YAxis domain={[0, 10]} stroke="#666" fontSize={12} allowDecimals={false} />
                            <Tooltip 
                              cursor={{fill: '#f3f4f6'}} 
                              formatter={(value) => [value, "Média"]}
                              labelStyle={{ color: '#333' }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="media" name="Média" radius={[6, 6, 0, 0]} barSize={50}>
                              {chartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[entry.name] || '#8884d8'} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{marginTop:'20px', color:'#999'}}>Sem dados de notas ainda.</p>
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