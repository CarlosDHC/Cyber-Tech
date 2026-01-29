import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Desafios</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar! 
      </p>

      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/Direito/DesafioDir1" className={styles.challengeCard}>
          <img
            src="https://imgur.com/oBy3VFB.jpg"
          ></img>
          <p>Legislação</p> 
        </Link> 
        <Link to="/desafios/Direito/DesafioDir2" className={styles.challengeCard}>
          <img
            src="https://imgur.com/oBy3VFB.jpg"
          ></img>
          <p>Justiça</p> 
        </Link> 
        {/* Desafio 2 */}
        <Link to="/desafios/Direito/DesafioDir3" className={styles.challengeCard}>
          <img
            src="https://imgur.com/pKlyga5.jpg"
          ></img>
          <p>Direitos e Deveres</p> 
        </Link>

        {/* Desafio 3 */}
        <Link to="/desafios/Direito/DesafioDir4" className={styles.challengeCard}>
         <img
            src="https://imgur.com/0cMEy3T.jpg"
          ></img>
          <p>Advocacia</p>
        </Link>
        <Link to="/desafios/Direito/DesafioDir5" className={styles.challengeCard}>
         <img
            src="https://imgur.com/wcyzeFf.jpg"
          ></img>
          <p>Constituição</p>
        </Link>
        <Link to="/desafios/Direito/DesafioDir6" className={styles.challengeCard}>
         <img
            src="https://imgur.com/XAHCgaS.jpg"
          ></img>
          <p>Processo</p>
        </Link>
        <Link to="/desafios/Direito/DesafioDir7" className={styles.challengeCard}>
         <img
            src="https://imgur.com/XAHCgaS.jpg"
          ></img>
          <p>Jurisprudência</p>
        </Link>
        <Link to="/desafios/Direito/DesafioDir8" className={styles.challengeCard}>
         <img
            src="https://imgur.com/XAHCgaS.jpg"
          ></img>
          <p>Ética</p>
        </Link>
      </div>
    </div>
  );
}

export default ChallengeList;