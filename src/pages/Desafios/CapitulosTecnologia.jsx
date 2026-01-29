import React from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

function ChallengeList() {
  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>Desafios</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar! Treine a lógica de programação com nossos desafios.
      </p>
      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/Tecnologia/DesafioTec1" className={styles.challengeCard}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKDz_bFly7KpcwHUB-FxunQc1FLQXJwR0Xxg&s"
          ></img>
          <p>Introdução</p> 
        </Link> 

        {/* Desafio 2 */}
        <Link to="/desafios/Tecnologia/DesafioTec2" className={styles.challengeCard}>
          <img
            src="https://www.unido.org/sites/default/files/2023-01/technology%20transfer%20%282%29.jpg"
          ></img>
          <p>Front-End</p> 
        </Link>

        {/* Desafio 3 */}
        <Link to="/desafios/Tecnologia/DesafioTec3" className={styles.challengeCard}>
         <img
            src="https://images.pexels.com/photos/16592498/pexels-photo-16592498.jpeg"
          ></img>
          <p>Back-End</p>
        </Link>
        <Link to="/desafios/Tecnologia/DesafioTec4" className={styles.challengeCard}>
         <img
            src="https://www.aeccglobal.my/images/2022/11/08/study-information--technology-abroad.webp"
          ></img>
          <p>Algoritmos</p>
        </Link>
        <Link to="/desafios/Tecnologia/DesafioTec5" className={styles.challengeCard}>
         <img
            src="https://www.monitoratec.com.br/blog/wp-content/uploads/2020/08/AdobeStock_310133736.jpeg"
          ></img>
          <p>Desenvolvimento</p>
        </Link>
        <Link to="/desafios/Tecnologia/DesafioTec5" className={styles.challengeCard}>
         <img
            src="https://www.deutschland.de/sites/default/files/media/image/EuroHPC%20entwickelt%20Supercomputer%20f%C3%BCr%20Europa.jpg"
          ></img>
          <p>Banco de Dados</p>
        </Link>
        <Link to="/desafios/Tecnologia/DesafioTec5" className={styles.challengeCard}>
         <img
            src="https://miro.medium.com/1*VzexncB2H2chkgC87wcnAA.jpeg"
          ></img>
          <p>Conceitos</p>
        </Link>
        <Link to="/desafios/Tecnologia/DesafioTec5" className={styles.challengeCard}>
         <img
            src="/public/img_desafios/python.png"
          ></img>
          <p>Python</p>
        </Link>
      </div>
    </div>
  );
}

export default ChallengeList;