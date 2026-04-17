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
  const [collapsed, setCollapsed] = useState(false);

  const [selectedArea, setSelectedArea] = useState('Tecnologia');
  const [availableAreas, setAvailableAreas] = useState([]);

  const isDashboard = location.pathname === '/admin';

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const GABARITO_TOTAIS = {
    "Desafio 1": 6, "Desafio 2": 7, "Desafio 3": 5, "Desafio 4": 5
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
        const desafiosColl = collection(db, "desafios");

        const [usersSnap, blogSnap, adminsSnap, desafiosSnap] = await Promise.all([
          getCountFromServer(usersColl).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(blogColl).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(adminsColl).catch(() => ({ data: () => ({ count: 0 }) })),
          getDocs(desafiosColl).catch(() => ({ docs: [] }))
        ]);

        const desafioAreaMap = {};
        const areasEncontradas = new Set(); 
        
        desafiosSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.titulo && data.area) {
            desafioAreaMap[data.titulo] = data.area;
            areasEncontradas.add(data.area);
          }
        });

        setAvailableAreas(Array.from(areasEncontradas));

        setStats({
          users: usersSnap.data().count - adminsSnap.data().count,
          posts: blogSnap.data().count,
        });

        const pontuacoesRef = collection(db, "pontuacoes");
        const querySnapshot = await getDocs(query(pontuacoesRef));
        
        const agrupamento = {};
        const alunosMap = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const nomeDesafio = data.desafio ? data.desafio.split(" - ")[0].trim() : "Outros";
          const areaDoDesafio = desafioAreaMap[nomeDesafio] || data.categoria || "Outros";

          if (!agrupamento[nomeDesafio]) {
            agrupamento[nomeDesafio] = { 
              somaNotas: 0, 
              quantidade: 0, 
              area: areaDoDesafio 
            };
          }

          const notaBruta = Number(data.nota || 0);
          let totalQuestoes = Number(data.total) || GABARITO_TOTAIS[nomeDesafio] || 1;
          const nota0a10 = (notaBruta / totalQuestoes) * 10;

          agrupamento[nomeDesafio].somaNotas += nota0a10;
          agrupamento[nomeDesafio].quantidade += 1;

          if (data.email) {
            if (!alunosMap[data.email]) {
              alunosMap[data.email] = {
                nome: data.nome || data.usuario || data.email.split('@')[0],
                somaMedia: 0, qtd: 0
              };
            }
            alunosMap[data.email].somaMedia += nota0a10;
            alunosMap[data.email].qtd += 1;
          }
        });

        const dadosGrafico = Object.keys(agrupamento)
          .filter(chave => chave !== "Outros")
          .map(chave => {
            const item = agrupamento[chave];
            return {
              name: chave,
              media: Number((item.somaNotas / item.quantidade || 0).toFixed(1)),
              area: item.area 
            };
          });

        setChartData(dadosGrafico);
        const listaAlunos = Object.values(alunosMap).map(aluno => ({
          nome: aluno.nome,
          media: aluno.somaMedia / aluno.qtd
        }));

        setTopStudents([...listaAlunos].sort((a, b) => b.media - a.media).slice(0, 3));
        setRiskStudents([...listaAlunos].filter(a => a.media < 6.0).sort((a, b) => a.media - b.media).slice(0, 3));
      } catch (e) { 
        console.error(e);
        setErrorMsg("Erro ao carregar dados."); 
      } finally { setLoading(false); }
    }
    fetchDashboardData();
  }, [isDashboard]);

  // FiltrO
  const filteredChartData = chartData.filter(item => item.area === selectedArea);

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          <img src="/menu.png" alt="menu" />
        </button>
        <h2 className={styles.title}>ADMIN</h2>
        <ul className={styles.navList}>
          <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={styles.navLink}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Gestão de Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Criar Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Criar Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Historico de curtidas</span></Link></li>
          <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="L" /><span className={styles.linkText}>Comentarios Forum</span></Link></li>
          <li><Link to="/admin/denucia" className={styles.navLink}><img src="/denuncia.png" alt="U" /><span className={styles.linkText}>Denuncia</span></Link></li>
        </ul>
      </aside>

      <main className={styles.main}>
        {isDashboard ? (
          <div className={styles.dashboardContent}>
            <h1 className={styles.mainTitle}>Visão Geral - {selectedArea}</h1>
            {loading ? <p>Carregando...</p> : (
              <>
                <div className={styles.metricsGrid}>
                  <div className={styles.cardCompact}><span className={styles.cardHeaderMini}>Total de Alunos</span><strong className={styles.bigNumber}>{stats.users}</strong></div>
                  <div className={styles.cardCompact}><span className={styles.cardHeaderMini}>Total de Posts</span><strong className={styles.bigNumber}>{stats.posts}</strong></div>
                  <div className={styles.cardCompact}>
                    <span className={styles.cardHeaderMini}>Destaques</span>
                    <div className={styles.miniList}>
                      {topStudents.map((aluno, i) => (
                        <div key={i} className={styles.miniItem}><span className={styles.truncate}>{aluno.nome}</span><span className={styles.highScore}>{aluno.media.toFixed(1)}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className={`${styles.cardCompact} ${styles.riskBorder}`}>
                    <span className={styles.cardHeaderMini}>Em Risco</span>
                    <div className={styles.miniList}>
                      {riskStudents.length > 0 ? riskStudents.map((aluno, i) => (
                        <div key={i} className={styles.miniItem}><span className={styles.truncate}>{aluno.nome}</span><span className={styles.lowScore}>{aluno.media.toFixed(1)}</span></div>
                      )) : <div className={styles.okMsg}>Tudo em ordem!</div>}
                    </div>
                  </div>
                </div>

                {/* Gráfico de barras */}
                <div className={styles.chartFullWidth}>
                  <div className={styles.chartHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Média de Notas: {selectedArea}</h3>
                    <div className={styles.filterArea}>
                      <select 
                        value={selectedArea} 
                        onChange={(e) => setSelectedArea(e.target.value)}
                        style={{ padding:'14px 16px', borderRadius:'8px', border:'1px solid #e0e0e0', fontSize:'1rem', backgroundColor:'#f9fafb', transition:'all 0.2s ease', color:'#333' }}
                      >
                        {availableAreas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={filteredChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={11} interval={0} angle={-10} textAnchor="end" height={60} />
                        <YAxis domain={[0, 10]} fontSize={11} />
                        <Tooltip cursor={{ fill: '#f5f5f5' }} />
                        <Bar dataKey="media" radius={[4, 4, 0, 0]} barSize={45}>
                          {filteredChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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