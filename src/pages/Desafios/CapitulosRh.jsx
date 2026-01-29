import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Desafios</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar! Teste sua lógica com os nossos exercícios práticos. 
      </p>
      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/Rh/DesafioRh1" className={styles.challengeCard}>
          <img
            src="https://imgur.com/IBcmitz.jpg" 
          ></img>
          <p>Recrutamento & Seleção</p> 
        </Link>

        {/* Desafio 2 */}
        <Link to="/desafios/Rh/DesafioRh2" className={styles.challengeCard}>
          <img
            src="https://imgur.com/7VyVCw2.jpg"
          ></img>
          <p>Treinamento & Desenvolvimento</p> 
        </Link>

        {/* Desafio 3 */}
        <Link to="/desafios/Rh/DesafioRh3" className={styles.challengeCard}>
         <img
            src="https://imgur.com/uAH3O0f.jpg" 
          ></img>
          <p>Relações Trabalhistas</p>
        </Link>
        {/* Desafio 4 */}
        <Link to="/desafios/Rh/DesafioRh4" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>Cultura & Engajamento</p>
        </Link>
        <Link to="/desafios/Rh/DesafioRh5" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>Folha de Pagamento</p>
        </Link>
        <Link to="/desafios/Rh/DesafioRh6" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>Benefícios</p>
        </Link><Link to="/desafios/Rh/DesafioRh7" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>Avaliação e Desempenho</p>
        </Link><Link to="/desafios/Rh/DesafioRh8" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>Segurança do Trabalho</p>
        </Link>
      </div>
    </div>
  ); 
}

export default ChallengeList;