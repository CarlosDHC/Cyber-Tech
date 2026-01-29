import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import './styles/globals.css';

// Layout
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

// Scroll Reset
import ScrollToTop from "./components/ScrollToTop.jsx";

// Páginas Principais
import Home from './pages/Home/Home.jsx';
import Blog from './pages/Blog/Blog.jsx';
import ChallengeList from './pages/ChallengeList/ChallengeList.jsx';
import Forum from './pages/Forum/Forum.jsx';

// Blog Pages (Categorias)
import Tecnologia from "./pages/Blog/Tecnologia.jsx";
import Engenharia from "./pages/Blog/Engenharia.jsx";
import Direito from "./pages/Blog/Direito.jsx";
import Marketing from "./pages/Blog/Marketing.jsx";
import Rh from "./pages/Blog/Rh.jsx";

// Lazy Load para Posts Dinâmicos
const PostDinamico = React.lazy(() => import("./pages/Blog/PostDinamico"));

// Autenticação
import Login from './pages/Login/Login.jsx';
import Cadastro from './pages/Cadastro/Cadastro.jsx';
import EsqueciSenha from './pages/EsqueciSenha/EsqueciSenha.jsx';
import EsqueciSenhaPerfil from './pages/EsqueciSenha/EsqueciSenhaPerfil.jsx';
import Perfil from './pages/Perfil/Perfil.jsx';

// --- JOGO DO QUIZ (IMPORT NOVO) ---
// Certifica-te de criar este arquivo em src/pages/Quiz/QuizPlayer.jsx
// Se ainda não existir, comente esta linha abaixo:
import QuizPlayer from './pages/Quiz/QuizPlayer.jsx'; 

// Admin
import Admin from './admin/Admin.jsx';
import Newblog from './admin/Subpagina/Newblog.jsx';
import Comentarios from './admin/Subpagina/Curtidas.jsx';
import Newdesafios from './admin/Subpagina/Newdesafios.jsx';
import Notas from './admin/Subpagina/Notas.jsx';

// Rotas protegidas
import ProtectedRoute from './context/ProtectedRoute.jsx';
import ProtectedAdminRoute from './context/ProtectedAdminRoute.jsx';

// Capitulos 
import CapitulosTecnologia from './pages/Desafios/CapitulosTecnologia.jsx';
import CapitulosDireito from './pages/Desafios/CapitulosDireito.jsx';
import CapitulosEngenharia from './pages/Desafios/CapitulosEngenharia.jsx';
import CapitulosMarketing from './pages/Desafios/CapitulosMarketing.jsx';
import CapitulosRh from './pages/Desafios/CapitulosRh.jsx';

// Desafios Tecnologia 
import DesafioTec1 from './pages/Desafios/Tecnologia/DesafioTec1.jsx';
import DesafioTec2 from './pages/Desafios/Tecnologia/DesafioTec2.jsx';
import DesafioTec3 from './pages/Desafios/Tecnologia/DesafioTec3.jsx';
import DesafioTec4 from './pages/Desafios/Tecnologia/DesafioTec4.jsx';
import DesafioTec5 from './pages/Desafios/Tecnologia/DesafioTec5.jsx';
import DesafioTec6 from './pages/Desafios/Tecnologia/DesafioTec6.jsx';
import DesafioTec7 from './pages/Desafios/Tecnologia/DesafioTec7.jsx';
import DesafioTec8 from './pages/Desafios/Tecnologia/DesafioTec8.jsx';

// Desafios Engenharia
import DesafioEng1 from './pages/Desafios/Engenharia/DesafioEng1.jsx';
import DesafioEng2 from './pages/Desafios/Engenharia/DesafioEng2.jsx';
import DesafioEng3 from './pages/Desafios/Engenharia/DesafioEng3.jsx';
import DesafioEng4 from './pages/Desafios/Engenharia/DesafioEng4.jsx';
import DesafioEng5 from './pages/Desafios/Engenharia/DesafioEng5.jsx';
import DesafioEng6 from './pages/Desafios/Engenharia/DesafioEng6.jsx';
import DesafioEng7 from './pages/Desafios/Engenharia/DesafioEng7.jsx';
import DesafioEng8 from './pages/Desafios/Engenharia/DesafioEng8.jsx';

// Desafios Direito 
import DesafioDir1 from './pages/Desafios/Direito/DesafioDir1.jsx';
import DesafioDir2 from './pages/Desafios/Direito/DesafioDir2.jsx';
import DesafioDir3 from './pages/Desafios/Direito/DesafioDir3.jsx';
import DesafioDir4 from './pages/Desafios/Direito/DesafioDir4.jsx'; // Corrigido erro de //
import DesafioDir5 from './pages/Desafios/Direito/DesafioDir5.jsx';
import DesafioDir6 from './pages/Desafios/Direito/DesafioDir6.jsx';
import DesafioDir7 from './pages/Desafios/Direito/DesafioDir7.jsx';
import DesafioDir8 from './pages/Desafios/Direito/DesafioDir8.jsx';

// Desafios Marketing
import DesafioMar1 from './pages/Desafios/Marketing/DesafioMar1.jsx';
import DesafioMar2 from './pages/Desafios/Marketing/DesafioMar2.jsx';
import DesafioMar3 from './pages/Desafios/Marketing/DesafioMar3.jsx';
import DesafioMar4 from './pages/Desafios/Marketing/DesafioMar4.jsx';
import DesafioMar5 from './pages/Desafios/Marketing/DesafioMar5.jsx';
import DesafioMar6 from './pages/Desafios/Marketing/DesafioMar6.jsx';
import DesafioMar7 from './pages/Desafios/Marketing/DesafioMar7.jsx';
import DesafioMar8 from './pages/Desafios/Marketing/DesafioMar8.jsx';

// Desafios RH
import DesafioRh1 from './pages/Desafios/Rh/DesafioRh1.jsx';
import DesafioRh2 from './pages/Desafios/Rh/DesafioRh2.jsx';
import DesafioRh3 from './pages/Desafios/Rh/DesafioRh3.jsx';
import DesafioRh4 from './pages/Desafios/Rh/DesafioRh4.jsx';
import DesafioRh5 from './pages/Desafios/Rh/DesafioRh5.jsx';
import DesafioRh6 from './pages/Desafios/Rh/DesafioRh6.jsx';
import DesafioRh7 from './pages/Desafios/Rh/DesafioRh7.jsx';
import DesafioRh8 from './pages/Desafios/Rh/DesafioRh8.jsx';

// Novas páginas
import Sobre from './pages/Sobre/Sobre.jsx';
import Privacidade from './pages/Privacidade/Privacidade.jsx';

function App() {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.45, ease: "easeOut" },
  };

  const AnimatedPage = ({ children }) => (
    <motion.div {...pageVariants}>
      {children}
    </motion.div>
  );

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-layout">
      <Header />
      <ScrollToTop />

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* --- Rotas Públicas --- */}
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route path="/cadastro" element={<AnimatedPage><Cadastro /></AnimatedPage>} />
            <Route path="/esqueci-minha-senha" element={<AnimatedPage><EsqueciSenha /></AnimatedPage>} />
            <Route path="/sobre" element={<AnimatedPage><Sobre /></AnimatedPage>} />
            <Route path="/privacidade" element={<AnimatedPage><Privacidade /></AnimatedPage>} />

            {/* --- Rotas Protegidas Blog --- */}
            <Route path="/blog" element={<ProtectedRoute><AnimatedPage><Blog /></AnimatedPage></ProtectedRoute>} />
            <Route path="/tecnologia" element={<ProtectedRoute><AnimatedPage><Tecnologia /></AnimatedPage></ProtectedRoute>} />
            <Route path="/engenharia" element={<ProtectedRoute><AnimatedPage><Engenharia /></AnimatedPage></ProtectedRoute>} />
            <Route path="/direito" element={<ProtectedRoute><AnimatedPage><Direito /></AnimatedPage></ProtectedRoute>} />
            <Route path="/marketing" element={<ProtectedRoute><AnimatedPage><Marketing /></AnimatedPage></ProtectedRoute>} />
            <Route path="/rh" element={<ProtectedRoute><AnimatedPage><Rh /></AnimatedPage></ProtectedRoute>} />

            <Route path="/blog/post/:id" element={
              <ProtectedRoute><AnimatedPage><PostDinamico /></AnimatedPage></ProtectedRoute>
            } />
            
            {/* --- ROTA DE JOGO (QUIZ) --- */}
            {/* Esta rota é necessária para o botão "INICIAR DESAFIO" funcionar */}
            <Route path="/quiz/:id" element={
              <ProtectedRoute><AnimatedPage><QuizPlayer /></AnimatedPage></ProtectedRoute>
            } />

            {/* --- Rotas Capítulos --- */}
            <Route path="/desafios/capitulostecnologia" element={<ProtectedRoute><AnimatedPage><CapitulosTecnologia /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulosengenharia" element={<ProtectedRoute><AnimatedPage><CapitulosEngenharia /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulosdireito" element={<ProtectedRoute><AnimatedPage><CapitulosDireito /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulosmarketing" element={<ProtectedRoute><AnimatedPage><CapitulosMarketing /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulosrh" element={<ProtectedRoute><AnimatedPage><CapitulosRh /></AnimatedPage></ProtectedRoute>} />

            {/* --- Rotas Desafios Tecnologia --- */}
            <Route path="/desafios" element={<ProtectedRoute><AnimatedPage><ChallengeList /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/tecnologia/desafiotec1" element={<ProtectedRoute><AnimatedPage><DesafioTec1 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/tecnologia/desafiotec2" element={<ProtectedRoute><AnimatedPage><DesafioTec2 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/tecnologia/desafiotec3" element={<ProtectedRoute><AnimatedPage><DesafioTec3 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/tecnologia/desafiotec4" element={<ProtectedRoute><AnimatedPage><DesafioTec4 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/tecnologia/desafiotec5" element={<ProtectedRoute><AnimatedPage><DesafioTec5 /></AnimatedPage></ProtectedRoute>} /> 
            <Route path="/desafios/tecnologia/desafiotec6" element={<ProtectedRoute><AnimatedPage><DesafioTec6 /></AnimatedPage></ProtectedRoute>} /> 
            <Route path="/desafios/tecnologia/desafiotec7" element={<ProtectedRoute><AnimatedPage><DesafioTec7 /></AnimatedPage></ProtectedRoute>} /> 
            <Route path="/desafios/tecnologia/desafiotec8" element={<ProtectedRoute><AnimatedPage><DesafioTec8 /></AnimatedPage></ProtectedRoute>} />

            {/* --- Rotas Desafios Engenharia --- */}
            <Route path="/desafios/engenharia/desafioeng1" element={<ProtectedRoute><AnimatedPage><DesafioEng1 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/engenharia/desafioeng2" element={<ProtectedRoute><AnimatedPage><DesafioEng2 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/engenharia/desafioeng3" element={<ProtectedRoute><AnimatedPage><DesafioEng3 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/engenharia/desafioeng4" element={<ProtectedRoute><AnimatedPage><DesafioEng4 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/engenharia/desafioeng5" element={<ProtectedRoute><AnimatedPage><DesafioEng5 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/engenharia/desafioeng6" element={<ProtectedRoute><AnimatedPage><DesafioEng6 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/engenharia/desafioeng7" element={<ProtectedRoute><AnimatedPage><DesafioEng7 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/engenharia/desafioeng8" element={<ProtectedRoute><AnimatedPage><DesafioEng8 /></AnimatedPage></ProtectedRoute>} />

            {/* --- Rotas Desafios Direito --- */}
            <Route path="/desafios/direito/desafiodir1" element={<ProtectedRoute><AnimatedPage><DesafioDir1 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/direito/desafiodir2" element={<ProtectedRoute><AnimatedPage><DesafioDir2 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/direito/desafiodir3" element={<ProtectedRoute><AnimatedPage><DesafioDir3 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/direito/desafiodir4" element={<ProtectedRoute><AnimatedPage><DesafioDir4 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/direito/desafiodir5" element={<ProtectedRoute><AnimatedPage><DesafioDir5 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/direito/desafiodir6" element={<ProtectedRoute><AnimatedPage><DesafioDir6 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/direito/desafiodir7" element={<ProtectedRoute><AnimatedPage><DesafioDir7 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/direito/desafiodir8" element={<ProtectedRoute><AnimatedPage><DesafioDir8 /></AnimatedPage></ProtectedRoute>} />

            {/* --- Rotas Desafios Marketing --- */}
            <Route path="/desafios/marketing/desafiomar1" element={<ProtectedRoute><AnimatedPage><DesafioMar1 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/marketing/desafiomar2" element={<ProtectedRoute><AnimatedPage><DesafioMar2 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/marketing/desafiomar3" element={<ProtectedRoute><AnimatedPage><DesafioMar3 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/marketing/desafiomar4" element={<ProtectedRoute><AnimatedPage><DesafioMar4 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/marketing/desafiomar5" element={<ProtectedRoute><AnimatedPage><DesafioMar5 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/marketing/desafiomar6" element={<ProtectedRoute><AnimatedPage><DesafioMar6 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/marketing/desafiomar7" element={<ProtectedRoute><AnimatedPage><DesafioMar7 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/marketing/desafiomar8" element={<ProtectedRoute><AnimatedPage><DesafioMar8 /></AnimatedPage></ProtectedRoute>} />

            {/* --- Rotas Desafios RH --- */}
            <Route path="/desafios/rh/desafiorh1" element={<ProtectedRoute><AnimatedPage><DesafioRh1 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/rh/desafiorh2" element={<ProtectedRoute><AnimatedPage><DesafioRh2 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/rh/desafiorh3" element={<ProtectedRoute><AnimatedPage><DesafioRh3 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/rh/desafiorh4" element={<ProtectedRoute><AnimatedPage><DesafioRh4 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/rh/desafiorh5" element={<ProtectedRoute><AnimatedPage><DesafioRh5 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/rh/desafiorh6" element={<ProtectedRoute><AnimatedPage><DesafioRh6 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/rh/desafiorh7" element={<ProtectedRoute><AnimatedPage><DesafioRh7 /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/rh/desafiorh8" element={<ProtectedRoute><AnimatedPage><DesafioRh8 /></AnimatedPage></ProtectedRoute>} />

            {/* --- Perfil e Fórum --- */}
            <Route path="/perfil" element={<ProtectedRoute><AnimatedPage><Perfil /></AnimatedPage></ProtectedRoute>} />
            <Route path="/forum" element={<ProtectedRoute><AnimatedPage><Forum /></AnimatedPage></ProtectedRoute>} />
            <Route path="/alterar-senha" element={<ProtectedRoute><AnimatedPage><EsqueciSenhaPerfil /></AnimatedPage></ProtectedRoute>} />

            {/* --- Rotas Admin --- */}
            <Route path="/admin" element={<ProtectedAdminRoute><AnimatedPage><Admin /></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/newblog" element={<ProtectedAdminRoute><AnimatedPage><Newblog /></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/curtidas" element={<ProtectedAdminRoute><AnimatedPage><Comentarios /></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/newdesafios" element={<ProtectedAdminRoute><AnimatedPage><Newdesafios/></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/notas" element={<ProtectedAdminRoute><AnimatedPage><Notas /></AnimatedPage></ProtectedAdminRoute>} />

            {/* Rota 404 (Opcional, mas recomendada) */}
            <Route path="*" element={<div style={{textAlign: 'center', padding: '50px'}}>Página não encontrada</div>} />

          </Routes>
        </AnimatePresence>
      </main>

      <main className={isAdminRoute ? 'admin-main' : 'public-main'}>
      </main>

      <Footer />
    </div>
  );
}

export default App;