import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Marketing</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar!
      </p>
      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/Marketing/DesafioMar1" className={styles.challengeCard}>
          <img
            src="https://imgur.com/IBcmitz.jpg" 
          ></img>
          <p>SEO & Conteúdo</p> 
        </Link>

        {/* Desafio 2 */}
        <Link to="/desafios/Marketing/DesafioMar2" className={styles.challengeCard}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkM5hLE7qMu1DbnsrbwBeWtUbg5PprxAXdXg&s"
          ></img>
          <p>Mídias Socias</p> 
        </Link>

        {/* Desafio 3 */}
        <Link to="/desafios/Marketing/DesafioMar3" className={styles.challengeCard}>
         <img
            src="https://imgur.com/uAH3O0f.jpg" 
          ></img>
          <p>Automação</p>
        </Link>
        {/* Desafio 4 */}
        <Link to="/desafios/Marketing/DesafioMar4" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>Análise e Estratégia</p>
        </Link>
        <Link to="/desafios/Marketing/DesafioMar5" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>CRM & Ferramentas</p>
        </Link>
        <Link to="/desafios/Tecnologia/DesafioTec4" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>CRM</p>
        </Link>
        <Link to="/desafios/Tecnologia/DesafioTec4" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>Conversão</p>
        </Link>
         <Link to="/desafios/Tecnologia/DesafioTec4" className={styles.challengeCard}>
         <img
            src="https://imgur.com/n4dfJ4f.jpg"
          ></img>
          <p>Vendas</p>
        </Link>
      </div>
    </div>
  ); 
}

export default ChallengeList;