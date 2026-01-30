import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Direito</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar! Teste seus conhecimentos jurídicos com nossos desafios.
      </p>

      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/Direito/DesafioDir1" className={styles.challengeCard}>
          <img
            src="https://amaerj.org.br/wp-content/uploads/2018/10/CNJ_Balanca-Justica_Arquivo-CNJ.jpg"
          ></img>
          <p>Legislação</p> 
        </Link> 
        <Link to="/desafios/Direito/DesafioDir2" className={styles.challengeCard}>
          <img
            src="https://cdn.prod.website-files.com/63e66ec5712a8ab81dfeaec6/664e7a664782ffc19527ba8d_Entendendo%20a%20Justi%C3%A7a%20Arbitral%20uma%20Alternativa%20Eficiente%20%C3%A0%20Justi%C3%A7a%20Comum.jpg"
          ></img>
          <p>Justiça</p> 
        </Link> 
        {/* Desafio 2 */}
        <Link to="/desafios/Direito/DesafioDir3" className={styles.challengeCard}>
          <img
            src="https://www.bcompany.com.br/wp-content/uploads/2025/11/malhete-com-balanca-de-temis-e-livros-ao-fundo-1024x683.jpg"
          ></img>
          <p>Direitos e Deveres</p> 
        </Link>

        {/* Desafio 3 */}
        <Link to="/desafios/Direito/DesafioDir4" className={styles.challengeCard}>
         <img
            src="https://imgs.jusbr.com/publications/images/fa6f8c9b6731077a0f96742016133888"
          ></img>
          <p>Advocacia</p>
        </Link>
        <Link to="/desafios/Direito/DesafioDir5" className={styles.challengeCard}>
         <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGeXxl0Jh_pDdkD2Y_2xFEYWO7lq15f_cRXg&s"
          ></img>
          <p>Constituição</p>
        </Link>
        <Link to="/desafios/Direito/DesafioDir6" className={styles.challengeCard}>
         <img
            src="https://seuprocesso.com/blog/wp-content/uploads/elementor/thumbs/2151023395-qluhsttt2zolo4swjzk2wzwrbjm4gn15xydfn8lcls.jpg"
          ></img>
          <p>Processo</p>
        </Link>
        <Link to="/desafios/Direito/DesafioDir7" className={styles.challengeCard}>
         <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHmfX5VIW5tH6_WV_BAaeC-8paoEOGv9D1bw&s"
          ></img>
          <p>Jurisprudência</p>
        </Link>
        <Link to="/desafios/Direito/DesafioDir8" className={styles.challengeCard}>
         <img
            src="https://farj-rj.com/wp-content/uploads/2019/08/direito.jpg"
          ></img>
          <p>Ética</p>
        </Link>
      </div>
    </div>
  );
}

export default ChallengeList;