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
          Assista aos vídeos abaixo para aprender como utilizar todos os recursos e aproveitar ao máximo a sua jornada.
        </p>
      </div>

      <div className={styles.videoGrid}>
        {/* Vídeo 1 */}
        <motion.div 
          className={styles.videoCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.iframeContainer}>
            <iframe
              src="https://www.youtube.com/embed/COLOQUE_O_ID_DO_VIDEO_1_AQUI"
              title="Tutorial Parte 1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            ></iframe>
          </div>
          <h3 className={styles.videoTitle}>Tutorial Parte 1: Primeiros Passos</h3>
          <p className={styles.videoText}>Aprenda a navegar pela plataforma e iniciar seus primeiros desafios.</p>
        </motion.div>

        {/* Vídeo 2 */}
        <motion.div 
          className={styles.videoCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.iframeContainer}>
            <iframe
              src="https://www.youtube.com/embed/COLOQUE_O_ID_DO_VIDEO_2_AQUI"
              title="Tutorial Parte 2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            ></iframe>
          </div>
          <h3 className={styles.videoTitle}>Tutorial Parte 2: Fórum e Certificados</h3>
          <p className={styles.videoText}>Veja como interagir na comunidade e desbloquear seus certificados.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Tutorial;