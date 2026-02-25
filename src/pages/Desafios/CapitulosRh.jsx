import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Recursos Humanos</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar! Desenvolva competências essenciais da área de Recursos Humanos.
      </p>
      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/Rh/DesafioRh1" className={styles.challengeCard}>
          <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-resumegenius-18848929.jpg?raw=true" 
          ></img>
          <p>Recrutamento & Seleção</p> 
        </Link>

        {/* Desafio 2 */}
        <Link to="/desafios/Rh/DesafioRh2" className={styles.challengeCard}>
          <img
 
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-tima-miroshnichenko-5439436.jpg?raw=true"
          ></img>
          <p>Treinamento & Desenvolvimento</p> 
        </Link>

            src="C:\Users\usrlabeco2N\Documents\GitHub\cyber-tech-v.2.0\public\rh-cursos.jpg"
          ></img>
          <p>Treinamento & Desenvolvimento</p> 
        </Link>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando desafios...</p>
      ) : (
        <div className={styles.challengeCardsList}>
          {desafios.length > 0 ? (
            desafios.map((desafio) => (
              <Link to={`/quiz/${desafio.id}`} key={desafio.id} className={styles.challengeCard}>
                <img
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=RH"}
                  alt={desafio.titulo}
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Sem+Imagem"; }}
                  style={{ objectFit: 'cover' }}
                />
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{desafio.titulo}</p>
                
                {/* --- EXIBIÇÃO PADRONIZADA: QUESTÕES E TENTATIVAS --- */}
                <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
                  <span>{desafio.qtdQuestoes || 0} Questões</span>
                  <span> • </span>
                  <span>{desafio.tentativasPermitidas || 0} Tentativas</span>
                </div>
                {/* ------------------------------------------------- */} 

        {/* Desafio 3 */}
        <Link to="/desafios/Rh/DesafioRh3" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-rdne-7821913.jpg?raw=true" 
          ></img>
          <p>Relações Trabalhistas</p>
        </Link>
        {/* Desafio 4 */}
        <Link to="/desafios/Rh/DesafioRh4" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-yankrukov-7698746.jpg?raw=true"
          ></img>
          <p>Cultura & Engajamento</p>
        </Link>
        <Link to="/desafios/Rh/DesafioRh5" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-gabby-k-5273559.jpg?raw=true"
          ></img>
          <p>Folha de Pagamento</p>
        </Link>
        <Link to="/desafios/Rh/DesafioRh6" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/pexels-rdne-10376258.jpg?raw=true"
          ></img>
          <p>Benefícios</p>
        </Link><Link to="/desafios/Rh/DesafioRh7" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-pavel-danilyuk-7869111.jpg?raw=true"
          ></img>
          <p>Avaliação e Desempenho</p>
        </Link><Link to="/desafios/Rh/DesafioRh8" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-burst-544965.jpg?raw=true"
          ></img>
          <p>Segurança do Trabalho</p>
        </Link>
      </div>
    </div>
  ); 
}

export default ChallengeList;