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

// --- JOGO DO QUIZ ---
import QuizPlayer from './pages/Quiz/QuizPlayer.jsx'; 

// Admin
import Admin from './admin/Admin.jsx';
import Newblog from './admin/Subpagina/Newblog.jsx';
import Curtidas from './admin/Subpagina/Curtidas.jsx';
import Newdesafios from './admin/Subpagina/Newdesafios.jsx';
import Notas from './admin/Subpagina/Notas.jsx';
import Comentarios from './admin/Subpagina/Comentarios.jsx';

// Rotas protegidas
import ProtectedRoute from './context/ProtectedRoute.jsx';
import ProtectedAdminRoute from './context/ProtectedAdminRoute.jsx';

// Capitulos 
import CapitulosTecnologia from './pages/Desafios/CapitulosTecnologia.jsx';
import CapitulosDireito from './pages/Desafios/CapitulosDireito.jsx';
import CapitulosEngenharia from './pages/Desafios/CapitulosEngenharia.jsx';
import CapitulosMarketing from './pages/Desafios/CapitulosMarketing.jsx';
import CapitulosRh from './pages/Desafios/CapitulosRh.jsx';

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
            <Route path="/quiz/:id" element={
              <ProtectedRoute><AnimatedPage><QuizPlayer /></AnimatedPage></ProtectedRoute>
            } />

            {/* --- MENU PRINCIPAL DE DESAFIOS (A CORREÇÃO ESTÁ AQUI) --- */}
            <Route path="/desafios" element={
              <ProtectedRoute><AnimatedPage><ChallengeList /></AnimatedPage></ProtectedRoute>
            } />

            {/* --- Rotas Capítulos --- */}
            <Route path="/desafios" element={<ProtectedRoute><AnimatedPage><ChallengeList /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulostecnologia" element={<ProtectedRoute><AnimatedPage><CapitulosTecnologia /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulosengenharia" element={<ProtectedRoute><AnimatedPage><CapitulosEngenharia /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulosdireito" element={<ProtectedRoute><AnimatedPage><CapitulosDireito /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulosmarketing" element={<ProtectedRoute><AnimatedPage><CapitulosMarketing /></AnimatedPage></ProtectedRoute>} />
            <Route path="/desafios/capitulosrh" element={<ProtectedRoute><AnimatedPage><CapitulosRh /></AnimatedPage></ProtectedRoute>} />
            
            
            {/* --- Perfil e Fórum --- */}
            <Route path="/perfil" element={<ProtectedRoute><AnimatedPage><Perfil /></AnimatedPage></ProtectedRoute>} />
            <Route path="/forum" element={<ProtectedRoute><AnimatedPage><Forum /></AnimatedPage></ProtectedRoute>} />
            <Route path="/alterar-senha" element={<ProtectedRoute><AnimatedPage><EsqueciSenhaPerfil /></AnimatedPage></ProtectedRoute>} />

            {/* --- Rotas Admin --- */}
            <Route path="/admin" element={<ProtectedAdminRoute><AnimatedPage><Admin /></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/newblog" element={<ProtectedAdminRoute><AnimatedPage><Newblog /></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/curtidas" element={<ProtectedAdminRoute><AnimatedPage><Curtidas /></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/newdesafios" element={<ProtectedAdminRoute><AnimatedPage><Newdesafios/></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/notas" element={<ProtectedAdminRoute><AnimatedPage><Notas /></AnimatedPage></ProtectedAdminRoute>} />
            <Route path="/admin/comentarios" element={<ProtectedAdminRoute><AnimatedPage><Comentarios/></AnimatedPage></ProtectedAdminRoute>} />

            {/* Rota 404 */}
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