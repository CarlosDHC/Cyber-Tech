import React, { useState, useEffect } from "react"; // Certifique-se de que useState está aqui dentro das chaves
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../../FirebaseConfig";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import md5 from "md5";

// UID do Admin para mostrar o botão extra no menu
const ADMIN_UID = "SswilmG3ZQPAfIfCaA4NohaKZzM2";

const getFirstName = (fullName) => {
  if (!fullName) return '';
  const firstName = fullName.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
};

export default function Header() {
  // Inicialização dos estados[cite: 1]
  const [menuLeftOpen, setMenuLeftOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = currentUser && currentUser.uid === ADMIN_UID;

  // Lógica do Gravatar[cite: 1]
  const emailParaHash = currentUser?.email ? currentUser.email.trim().toLowerCase() : "";
  const hash = emailParaHash ? md5(emailParaHash).toString() : "";
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;

  // Listener em tempo real para o nome do usuário[cite: 1]
  useEffect(() => {
    let unsubscribe = () => { };
    if (currentUser?.uid) {
      const docRef = doc(db, "users", currentUser.uid);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserName(docSnap.data().name || "");
        }
      }, (error) => {
        if (error.code !== 'permission-denied') {
          console.error("Erro no Header:", error);
        }
      });
    } else {
      setUserName("");
    }
    return () => unsubscribe();
  }, [currentUser]);

  // Atualiza título da aba conforme o nome do usuário[cite: 1]
  useEffect(() => {
    document.title = userName ? `CyberTech | ${getFirstName(userName)}` : "CyberTech";
  }, [userName]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const handleNavClick = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMenuLeftOpen(false);
    setProfileOpen(false);
  };

  const handleProtectedClick = (e, path) => {
    if (!currentUser) {
      e.preventDefault();
      alert("Você precisa realizar o login!");
      navigate("/login");
      setMenuLeftOpen(false);
    } else {
      handleNavClick(path);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* Lado Esquerdo: Hambúrguer de Opções e Logo */}
        <div className={styles.leftSection}>
          <button 
            className={styles.hamburger} 
            onClick={() => setMenuLeftOpen(!menuLeftOpen)}
            aria-label="Menu de navegação"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className={styles.logo}>
            <img src="/CybertechLogo.png" alt="CyberTech" className={styles.logoImg}/>
          </div>
        </div>

        {/* Centro: Opções de Navegação (Centralizado no Desktop) */}
        <nav className={`${styles.nav} ${menuLeftOpen ? styles.navOpen : ""}`}>
          <Link to="/" onClick={() => handleNavClick("/")}>Início</Link>
          <Link to="/blog" onClick={(e) => handleProtectedClick(e, "/blog")}>Blog</Link>
          <Link to="/desafios" onClick={(e) => handleProtectedClick(e, "/desafios")}>Desafios</Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => handleNavClick("/admin")} className={styles.adminLink}>
              Admin
            </Link>
          )}
        </nav>

        {/* Lado Direito: Imagem de Perfil (Abre opções no clique) */}
        <div className={styles.rightSection}>
          {currentUser ? (
            <div className={styles.profileWrapper}>
              <img 
                src={avatarUrl} 
                alt="Perfil" 
                className={styles.profilePic} 
                onClick={() => setProfileOpen(!profileOpen)} 
              />
              
              {profileOpen && (
                <div className={styles.dropdown}>
                  <p className={styles.dropName}><strong>{userName || "Usuário"}</strong></p>
                  <hr className={styles.divider} />
                  <Link to="/perfil" onClick={() => setProfileOpen(false)}>Minha Conta</Link>
                  <button onClick={handleLogout} className={styles.logoutBtn}>Sair</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginLink} onClick={() => handleNavClick("/login")}>
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}