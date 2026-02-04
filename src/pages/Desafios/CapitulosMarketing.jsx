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
            src="https://media.licdn.com/dms/image/v2/C4D12AQFFL0046WJljw/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1520187871347?e=2147483647&v=beta&t=44dHEfB5m1EUwonP-PdqfRcltFpNDbvhsRlfMZ7z-n0" 
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
            src="https://www.nacionalvox.com.br/wp-content/uploads/2022/06/automacao-marketing-digital-1024x597.jpg" 
          ></img>
          <p>Automação</p>
        </Link>
        {/* Desafio 4 */}
        <Link to="/desafios/Marketing/DesafioMar4" className={styles.challengeCard}>
         <img
            src="https://cdn.prod.website-files.com/645c64c06e6e2600a0067ccf/651dd88b3241d469eea73731_metas%20de%20vendas.jpg"
          ></img>
          <p>Análise e Estratégia</p>
        </Link>
        <Link to="/desafios/Marketing/DesafioMar5" className={styles.challengeCard}>
         <img
            src="https://blog.nectarcrm.com.br/content/images/2023/01/Vendas-B2B---estrat-gias-para-vender-mais.png"
          ></img>
          <p>CRM & Ferramentas</p>
        </Link>
        <Link to="/desafios/Tecnologia/DesafioTec4" className={styles.challengeCard}>
         <img
            src="https://www.kawaiikakkoiisugoi.com/wp-content/uploads/2022/10/L1040003-scaled.jpg"
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