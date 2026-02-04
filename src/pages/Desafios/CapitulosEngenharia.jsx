import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Engenharia Civil</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar! 
      </p>

      <div className={styles.challengeCardsList}>
           {/* Desafio 1 */}
               <Link to="/Desafios/Engenharia/DesafioEng1" className={styles.challengeCard}>
                 <img
                   src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/proj-estrutural.jpg?raw=true"
                 ></img>
                 <p>Projeto Estrutural</p> 
               </Link>
       
               {/* Desafio 2 */}
               <Link to="/desafios/Engenharia/DesafioEng2" className={styles.challengeCard}>
                 <img
                   src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/planejamento-urbano.jpg?raw=true"
                 ></img>
                 <p>Planejamento Urbano</p> 
               </Link>
       
               {/* Desafio 3 */}
               <Link to="/desafios/Engenharia/DesafioEng3" className={styles.challengeCard}>
                <img
                   src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/infra-eng.jpg?raw=true"
                 ></img>
                 <p>Infraestrutura</p>
               </Link>
               {/* Desafio 4 */}
               <Link to="/desafios/Engenharia/DesafioEng4" className={styles.challengeCard}>
                <img
                   src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/geo-solos.jpg?raw=true"
                 ></img>
                 <p>Geotecnia e Solos</p>
               </Link>
               <Link to="/desafios/Engenharia/DesafioEng5" className={styles.challengeCard}>
                <img
                   src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pontes-viadutos.jpg?raw=true"
                 ></img>
                 <p>Pontes e Viadutos</p>
               </Link>
               <Link to="/desafios/Engenharia/DesafioEng6" className={styles.challengeCard}>
                <img
                   src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/const.jpg?raw=true"
                 ></img>
                 <p>Constituição</p>
               </Link>
               <Link to="/desafios/Engenharia/DesafioEng7" className={styles.challengeCard}>
                <img
                   src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/processo-eng.jpg?raw=true"
                 ></img>
                 <p>Processo</p>
               </Link>
               <Link to="/desafios/Engenharia/DesafioEng8" className={styles.challengeCard}>
                <img
                   src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/fundacoes.jpg?raw=true"
                 ></img>
                 <p>Fundações</p>
               </Link>
             </div>
           </div>
  );
}

export default ChallengeList;