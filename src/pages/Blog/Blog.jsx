import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Importamos o mesmo CSS module usado na ChallengeList para garantir o design idêntico
import styles from "../Home/Home.module.css"; 
import ForumButton from '../../components/ForumButton';

function Blog() {
  const navigate = useNavigate();

  return (
    // Fragmento para permitir múltiplos elementos raiz (Container + Botão)
    <>
      {/* Container Principal do Conteúdo */}
      <div className={`container ${styles.challengeListContainer}`}>
        <h1 className={styles.pageTitle}>Blog</h1>
        <p className={styles.pageSubtitle}>
          Explore nossos artigos por categoria.
        </p>

        <div className={styles.challengeCardsList}>
          {/* Tecnologia */}
          <Link to="/tecnologia" className={styles.challengeCard}>
            {/* Tenta usar a imagem local específica do blog, com fallback */}
            <img 
              src="/Tec-blog.png" 
              alt="Tecnologia" 
              onError={(e) => e.target.src = "https://imgur.com/A6MA8Ua.jpg"} 
            />
            <p>Tecnologia</p>
          </Link>

          {/* Direito */}
          <Link to="/direito" className={styles.challengeCard}>
            <img 
              src="/Dir-blog.png" 
              alt="Direito" 
              onError={(e) => e.target.src = "https://imgur.com/6RTD2WO.jpg"} 
            />
            <p>Direito</p>
          </Link>

          {/* Engenharia */}
          <Link to="/engenharia" className={styles.challengeCard}>
            <img 
              src="/Eng-blog.png" 
              alt="Engenharia" 
              onError={(e) => e.target.src = "https://imgur.com/5KHksLP.jpg"} 
            />
            <p>Engenharia Civil</p>
          </Link>


        {/* Marketing */}
        <Link to="/marketing" className={styles.challengeCard}>
          <img 
            src="/Mk-blog.png" 
            alt="Marketing" 
          />
          <p>Marketing Digital</p>
        </Link>

        {/* RH */}
        <Link to="/rh" className={styles.challengeCard}>
          <img 
            src="/Rh-blog.png" 
            alt="RH" 
          />
          <p>Recursos Humanos</p>
        </Link>

        </div>

      </div>
      <ForumButton />
    </>
  );
}

export default Blog;