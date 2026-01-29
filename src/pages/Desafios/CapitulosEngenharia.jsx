import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Cursos</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar!
      </p>

      <div className={styles.challengeCardsList}>
           {/* Desafio 1 */}
               <Link to="/Desafios/Engenharia/DesafioEng1" className={styles.challengeCard}>
                 <img
                   src="/img_desafios/algoritmo.jpg"
                 ></img>
                 <p>Projeto Estrutural</p> 
               </Link>
       
               {/* Desafio 2 */}
               <Link to="/desafios/Engenharia/DesafioEng2" className={styles.challengeCard}>
                 <img
                   src="/img_desafios/operacoes.jpg"
                 ></img>
                 <p>Planejamento Urbano</p> 
               </Link>
       
               {/* Desafio 3 */}
               <Link to="/desafios/Engenharia/DesafioEng3" className={styles.challengeCard}>
                <img
                   src="/img_desafios/condicionais.jpg"
                 ></img>
                 <p>Infraestrutura</p>
               </Link>
               {/* Desafio 4 */}
               <Link to="/desafios/Engenharia/DesafioEng4" className={styles.challengeCard}>
                <img
                   src="/img_desafios/funcoes.jpg"
                 ></img>
                 <p>Geotecnia e Solos</p>
               </Link>
               <Link to="/desafios/Engenharia/DesafioEng5" className={styles.challengeCard}>
                <img
                   src="/img_desafios/funcoes.jpg"
                 ></img>
                 <p>Pontes e Viadutos</p>
               </Link>
               <Link to="/desafios/Engenharia/DesafioEng6" className={styles.challengeCard}>
                <img
                   src="/img_desafios/funcoes.jpg"
                 ></img>
                 <p>Constituição</p>
               </Link>
               <Link to="/desafios/Engenharia/DesafioEng7" className={styles.challengeCard}>
                <img
                   src="/img_desafios/funcoes.jpg"
                 ></img>
                 <p>Processo</p>
               </Link>
               <Link to="/desafios/Engenharia/DesafioEng8" className={styles.challengeCard}>
                <img
                   src="/img_desafios/funcoes.jpg"
                 ></img>
                 <p>Fundações</p>
               </Link>
             </div>
           </div>
  );
}

export default ChallengeList;