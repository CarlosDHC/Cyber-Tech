// src/pages/ChallengeList/ChallengeList.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Cursos</h1>
      <p className={styles.pageSubtitle}>
        Selecione a sua área.
      </p>

      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/CapitulosTecnologia" className={styles.challengeCard}>
          <img 
            src="https://imgur.com/A6MA8Ua.jpg"> 
          </img>
          <p>Tecnologia </p>
        </Link>

        {/* Desafio 2 */}
        <Link to="/desafios/CapitulosDireito" className={styles.challengeCard}>
          <img
            src="https://imgur.com/6RTD2WO.jpg"
          ></img>
          <p>Direito</p> 
        </Link>

        {/* Desafio 3 */}
        <Link to="/desafios/CapitulosEngenharia" className={styles.challengeCard}>
         <img
            src="https://imgur.com/5KHksLP.jpg"
          ></img>
          <p>Engenharia Civil</p>
        </Link>
        <Link to="/desafios/CapitulosMarketing" className={styles.challengeCard}>
         <img
            src="https://imgur.com/rjp7qWU.jpg"
          ></img>
          <p>Marketing Digital</p>
        </Link>
        <Link to="/desafios/CapitulosRh" className={styles.challengeCard}>
         <img
            src="https://imgur.com/NRn7mwt.jpg"
          ></img>
          <p>Recursos Humanos</p>
        </Link>
      </div>
    </div>
  );
}

export default ChallengeList;