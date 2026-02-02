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
    'Desafio 1': '#0088FE', 'Desafio 2': '#00C49F',
    'Desafio 3': '#FFBB28', 'Desafio 4': '#FF8042', 'Geral': '#8884d8'
  };

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
        const agrupamento = { "Geral": { somaNotas: 0, quantidade: 0 } };
        const alunosMap = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const nomeDesafio = data.desafio ? data.desafio.split(" - ")[0].trim() : "Outros";
          if (!agrupamento[nomeDesafio]) agrupamento[nomeDesafio] = { somaNotas: 0, quantidade: 0 };

          const notaBruta = Number(data.nota || 0);
          let totalQuestoes = Number(data.total) || GABARITO_TOTAIS[nomeDesafio] || 1;
          const nota0a10 = (notaBruta / totalQuestoes) * 10;

          agrupamento[nomeDesafio].somaNotas += nota0a10;
          agrupamento[nomeDesafio].quantidade += 1;
          agrupamento["Geral"].somaNotas += nota0a10;
          agrupamento["Geral"].quantidade += 1;

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
              media: Number((item.somaNotas / item.quantidade || 0).toFixed(1))
            };
          });

        setChartData(dadosGrafico);
        const listaAlunos = Object.values(alunosMap).map(aluno => ({
          nome: aluno.nome,
          media: aluno.somaMedia / aluno.qtd
        }));

        setTopStudents([...listaAlunos].sort((a, b) => b.media - a.media).slice(0, 3));
        setRiskStudents([...listaAlunos].filter(a => a.media < 6.0).sort((a, b) => a.media - b.media).slice(0, 3));
      } catch (e) { setErrorMsg("Erro ao carregar dados."); } finally { setLoading(false); }
    }
    fetchDashboardData();
  }, [isDashboard]);

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          <img src="/menu.png" alt="menu" />
        </button>
        <h2 className={styles.title}>ADMIN</h2>
        <ul className={styles.navList}>
          <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
          <li><Link to="/admin/notas" className={styles.navLink}><img src="/estrela.png" alt="N" /><span className={styles.linkText}>Notas</span></Link></li>
          <li><Link to="/admin/newblog" className={styles.navLink}><img src="/blog.png" alt="B" /><span className={styles.linkText}>Blog</span></Link></li>
          <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/desafio.png" alt="D" /><span className={styles.linkText}>Desafios</span></Link></li>
          <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Like</span></Link></li>
        </ul>
      </aside>

      <main className={styles.main}>
        {isDashboard ? (
          <div className={styles.dashboardContent}>
            <h1 className={styles.mainTitle}>Visão Geral</h1>
            {loading ? <p>Carregando...</p> : (
              <>
                <div className={styles.metricsGrid}>
                  <div className={styles.cardCompact}>
                    <span className={styles.cardHeaderMini}>Total Alunos</span>
                    <img src="/ialuno.png" alt="icon" className={styles.iconMini} />
                    <strong className={styles.bigNumber}>{stats.users}</strong>
                  </div>

                  <div className={styles.cardCompact}>
                    <span className={styles.cardHeaderMini}>Total Posts</span>
                    <img src="/iblog.png" alt="icon" className={styles.iconMini} />
                    <strong className={styles.bigNumber}>{stats.posts}</strong>
                  </div>

                  <div className={styles.cardCompact}>
                    <span className={styles.cardHeaderMini}>Destaques</span>
                    <div className={styles.miniList}>
                      {topStudents.map((aluno, i) => (
                        <div key={i} className={styles.miniItem}>
                          <span className={styles.truncate}>{aluno.nome}</span>
                          <span className={styles.highScore}>{aluno.media.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`${styles.cardCompact} ${styles.riskBorder}`}>
                    <span className={styles.cardHeaderMini}>Em Risco</span>
                    <div className={styles.miniList}>
                      {riskStudents.length > 0 ? riskStudents.map((aluno, i) => (
                        <div key={i} className={styles.miniItem}>
                          <span className={styles.truncate}>{aluno.nome}</span>
                          <span className={styles.lowScore}>{aluno.media.toFixed(1)}</span>
                        </div>
                      )) : <div className={styles.okMsg}>Tudo em ordem! 😊</div>}
                    </div>
                  </div>
                </div>

                <div className={styles.chartFullWidth}>
                   <div className={styles.chartHeader}>
                      <img src="/igrafico.png" alt="g" />
                      <h3>Média de Notas por Desafio</h3>
                   </div>
                   <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={11} />
                        <YAxis domain={[0, 10]} fontSize={11} />
                        <Tooltip cursor={{fill: '#f5f5f5'}} />
                        <Bar dataKey="media" radius={[4, 4, 0, 0]} barSize={40}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
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