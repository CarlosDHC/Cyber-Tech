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

        {/* Desafio 3 */}
        <Link to="/desafios/Rh/DesafioRh3" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/pexels-rdne-10376258.jpg?raw=true" 
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
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/beneficios.jpeg.1200x0_q95_crop.jpg?raw=true"
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