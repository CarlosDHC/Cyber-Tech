import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../FirebaseConfig'; // Verifique se o caminho para o FirebaseConfig está correto
import styles from './Tutorial.module.css';

const Tutorial = () => {
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            const roleDoUsuario = userData.role || 'aluno'; 
            setTipoUsuario(roleDoUsuario.toLowerCase());
          }
        } catch (error) {
          console.error("Erro ao buscar dados no Firestore:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'black' }}>
        <p>A carregar o tutorial...</p>
      </div>
    );
  }

  return (
    <div className={styles.tutorialContainer}>
      
      {/* Cabeçalho da Página */}
      <div className={styles.header}>
        <h1 className={styles.title}>Tutorial da Plataforma Cyber Tech</h1>
        <p className={styles.description}>
          Assista ao vídeo de introdução para saber como utilizar todas as ferramentas e funcionalidades do seu perfil.
        </p>
      </div>

      <div className={styles.videoGrid}>
        {/* Lógica condicional: Exibe um vídeo diferente dependendo do cargo */}
        {tipoUsuario === 'admin' ? (
          <div className={styles.videoCard}>
            <div className={styles.iframeContainer}>
              <iframe 
                className={styles.iframe}
                // ATENÇÃO: Substitua apenas o "ID_DO_VIDEO_AQUI" pelo código real do seu vídeo do YouTube
                src="https://www.youtube.com/embed/ID_DO_VIDEO_AQUI" 
                title="Tutorial Administrador" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <h2 className={styles.videoTitle}>Visão Geral para Administradores</h2>
            <p className={styles.videoText}>
              Aprenda a gerir os alunos, adicionar novos desafios e moderar o blog.
            </p>
          </div>
        ) : tipoUsuario === 'aluno' ? (
          <div className={styles.videoCard}>
            <div className={styles.iframeContainer}>
              <iframe 
                className={styles.iframe}
                // ATENÇÃO: Substitua apenas o "ID_DO_VIDEO_AQUI" pelo código real do seu vídeo do YouTube
                src="https://www.youtube.com/embed/NxJaQ8z3DUM" 
                title="Tutorial Aluno" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <h2 className={styles.videoTitle}>Bem-vindo(a) à Cyber Tech!</h2>
            <p className={styles.videoText}>
              Veja como resolver os desafios práticos, aceder ao blog e interagir no fórum.
            </p>
          </div>
        ) : (
          <div className={styles.videoCard} style={{ backgroundColor: '#fee2e2', borderColor: '#f87171' }}>
            <p style={{ color: '#dc2626', textAlign: 'center', fontWeight: 'bold' }}>
              Não foi possível determinar o seu tipo de perfil. Por favor, contacte o suporte técnico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tutorial;