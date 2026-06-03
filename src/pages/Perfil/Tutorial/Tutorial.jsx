import React from 'react';
import { motion } from 'framer-motion';
import styles from './Tutorial.module.css';

function Tutorial() {
  return (
    <motion.div
      className={styles.tutorialContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Tutoriais da Plataforma</h1>
        <p className={styles.description}>
          Assista aos vídeos abaixo para aprender como utilizar todos os recursos da plataforma, seja você um aluno ou um administrador.
        </p>
      </div>

      <div className={styles.videoGrid}>
        {/* Vídeo 1 - Para Usuários/Alunos */}
        <motion.div 
          className={styles.videoCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.iframeContainer}>
            <iframe
              src="https://www.youtube.com/embed/COLOQUE_O_ID_DO_VIDEO_DOS_USUARIOS_AQUI"
              title="Tutorial para Usuários"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            ></iframe>
          </div>
          <h3 className={styles.videoTitle}>Tutorial do Aluno</h3>
          <p className={styles.videoText}>
            Aprenda a navegar pela plataforma, resolver desafios, interagir no fórum da comunidade e resgatar seus certificados.
          </p>
        </motion.div>

        {/* Vídeo 2 - Para Administradores */}
        <motion.div 
          className={styles.videoCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.iframeContainer}>
            <iframe
              src="https://www.youtube.com/embed/COLOQUE_O_ID_DO_VIDEO_DO_ADMIN_AQUI"
              title="Tutorial para Administradores"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            ></iframe>
          </div>
          <h3 className={styles.videoTitle}>Tutorial do Administrador</h3>
          <p className={styles.videoText}>
            Veja como acessar o painel de controle, gerenciar os usuários da plataforma, moderar o fórum e acompanhar as métricas gerais.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Tutorial;