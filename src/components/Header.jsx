// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../../FirebaseConfig";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

// 1. IMPORTAÇÃO DO MD5 AQUI:
import md5 from "md5";

// UID do Admin para mostrar o botão extra no menu
const ADMIN_UID = "SswilmG3ZQPAfIfCaA4NohaKZzM2";

const getFirstName = (fullName) => {
  if (!fullName) return '';
  const firstName = fullName.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se é admin
  const isAdmin = currentUser && currentUser.uid === ADMIN_UID;

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      setMenuOpen(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleNavClick = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const handleProtectedClick = (e, path) => {
    if (!currentUser) {
      e.preventDefault();
      alert("Você precisa realizar o login para acessar esta área!");
      navigate("/login");
      setMenuOpen(false);
    } else {
      handleNavClick(path);
    }
  };

  // Geração automática da URL da foto via Gravatar
  const emailParaHash = currentUser?.email ? currentUser.email.trim().toLowerCase() : "";
  const hash = emailParaHash ? md5(emailParaHash).toString() : "";
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;

  // Função provisória para evitar erro no botão "Alterar Senha"
  const handleNavigateToChangePassword = () => {
    navigate("/perfil"); // Redireciona para o perfil, ajuste conforme sua rota real
  };

  useEffect(() => {
    let unsubscribe = () => { };

    if (currentUser && currentUser.uid) {
      const docRef = doc(db, "users", currentUser.uid);
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserName(data.name || "");
          }
        },
        (error) => {
          if (error.code === 'permission-denied') {
            console.log("Leitura do Header interrompida (logout ou permissão negada).");
          } else {
            console.error("Erro no onSnapshot do Header:", error);
          }
        }
      );
    } else {
      setUserName("");
    }
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (userName) {
      document.title = `CyberTech | ${getFirstName(userName)}`;
    } else {
      document.title = "CyberTech";
    }
  }, [userName]);

  return (
    <header id="site-header" className={styles.header}>
      <div className={styles.logo}>
        <Link to="/" onClick={() => handleNavClick("/")}>
          {currentUser && userName ? `Olá, ${getFirstName(userName)}!` : "CyberTech"}
        </Link>
      </div>

      <nav className={`${styles.nav} ${menuOpen ? styles.open : ""}`}>
        <Link to="/" onClick={() => handleNavClick("/")} style={{ fontWeight: 'bold' }}>Início</Link>

        <Link
          to="/blog"
          onClick={(e) => handleProtectedClick(e, "/blog")}
          style={{ fontWeight: 'bold' }}
        >
          Blog
        </Link>

        <Link
          to="/desafios"
          onClick={(e) => handleProtectedClick(e, "/desafios")}
          style={{ fontWeight: 'bold' }}
        >
          Desafios
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            onClick={() => handleNavClick("/admin")}
            style={{
              color: '#F0F0F0',
              fontWeight: 'bold',
              padding: '10px 14px',
              borderRadius: '5px',
              marginRight: '10px'
            }}
          >
            Administrativo
          </Link>
        )}

        {currentUser ? (
          <>
            <Link
              to="/perfil"
              className={styles.profileButton}
              onClick={() => handleNavClick("/perfil")}
              style={{ fontWeight: 'bold' }}
            >
              Perfil
            </Link>

            {/*<button onClick={handleLogout} className={styles.logoutButton}>
              Sair
            </button>*/}
          </>
        ) : (
          <Link to="/login" onClick={() => handleNavClick("/login")} style={{ fontWeight: 'bold' }}>
            Login
          </Link>
        )}
      </nav>
      
      {currentUser && (
        <div className={styles.imageAndLogin} style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#ccc',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '2px solid #e0e0e0'
              }}
            >
              
              
              <img src={avatarUrl} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
              Sair
            </button>
        </div>
      )}

      <button
        className={`${styles.hamburger}`}
        onClick={toggleMenu}
        aria-label="Abrir menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}