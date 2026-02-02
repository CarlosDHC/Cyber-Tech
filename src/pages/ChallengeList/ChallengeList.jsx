// src/pages/ChallengeList/ChallengeList.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Desafios</h1>
      <p className={styles.pageSubtitle}>
        Selecione a sua área de atuação.
      </p>

      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/CapitulosTecnologia" className={styles.challengeCard}>
          <img 
            src="/tec-card.jpg"> 
          </img>
          <p>Tecnologia </p>
        </Link>

        {/* Desafio 2 */}
        <Link to="/desafios/CapitulosDireito" className={styles.challengeCard}>
          <img
            src="/dir-card.jpg"
          ></img>
          <p>Direito</p> 
        </Link>

        {/* Desafio 3 */}
        <Link to="/desafios/CapitulosEngenharia" className={styles.challengeCard}>
         <img
            src="/eng-card.jpg"
          ></img>
          <p>Engenharia Civil</p>
        </Link>
        <Link to="/desafios/CapitulosMarketing" className={styles.challengeCard}>
         <img
            src="/mkt-card.jpg"
          ></img>
          <p>Marketing Digital</p>
        </Link>
        <Link to="/desafios/CapitulosRh" className={styles.challengeCard}>
         <img
            src="/rh-card.jpg"
          ></img>
          <p>Recursos Humanos</p>
        </Link>
      </div>
    </div>
  );
}

export default ChallengeList;