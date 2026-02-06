import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css"; // Reutilizando estilos existentes

// Firebase Imports
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function CapitulosRH() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define a área desta página
  const AREA_ATUAL = "RH"; 

  useEffect(() => {
    const fetchDesafios = async () => {
      try {
        setLoading(true);
        // Busca desafios da coleção 'desafios' filtrados pela área
        const q = query(
          collection(db, "desafios"),
          where("area", "==", AREA_ATUAL),
          orderBy("dataCriacao", "desc") // Ordena pelos mais novos
        );

        const querySnapshot = await getDocs(q);
        const listaDesafios = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setDesafios(listaDesafios);
      } catch (error) {
        console.error("Erro ao buscar desafios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesafios();
  }, []);

  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>{AREA_ATUAL}</h1>
      <p className={styles.pageSubtitle}>
        Hora de praticar! Treine a lógica de programação com nossos desafios.
      </p>

      <div className={styles.challengeCardsList}>
        {/* Desafio 1 */}
        <Link to="/desafios/Rh/DesafioRh1" className={styles.challengeCard}>
          <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-resumegenius-18848929.jpg?raw=true" 
          ></img>
          <p>Recrutamento & Seleção</p> 
        </Link>

        {/* Desafio 2 */}
        <Link to="/desafios/Rh/DesafioRh2" className={styles.challengeCard}>
          <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-tima-miroshnichenko-5439436.jpg?raw=true"
          ></img>
          <p>Treinamento & Desenvolvimento</p> 
        </Link>

        {/* Desafio 3 */}
        <Link to="/desafios/Rh/DesafioRh3" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/pexels-khwanchai-4175028.jpg?raw=true" 
          ></img>
          <p>Relações Trabalhistas</p>
        </Link>
        {/* Desafio 4 */}
        <Link to="/desafios/Rh/DesafioRh4" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-yankrukov-7698746.jpg?raw=true"
          ></img>
          <p>Cultura & Engajamento</p>
        </Link>
        <Link to="/desafios/Rh/DesafioRh5" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-gabby-k-5273559.jpg?raw=true"
          ></img>
          <p>Folha de Pagamento</p>
        </Link>
        <Link to="/desafios/Rh/DesafioRh6" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/beneficios.jpeg.1200x0_q95_crop.jpg?raw=true"
          ></img>
          <p>Benefícios</p>
        </Link><Link to="/desafios/Rh/DesafioRh7" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-pavel-danilyuk-7869111.jpg?raw=true"
          ></img>
          <p>Avaliação e Desempenho</p>
        </Link><Link to="/desafios/Rh/DesafioRh8" className={styles.challengeCard}>
         <img
            src="https://github.com/CarlosDHC/cyber-tech-v.2.0/blob/main/public/img_desafios/pexels-burst-544965.jpg?raw=true"
          ></img>
          <p>Segurança do Trabalho</p>
        </Link>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando desafios...</p>
      ) : (
        <div className={styles.challengeCardsList}>
          {desafios.length > 0 ? (
            desafios.map((desafio) => (
              <Link to={`/quiz/${desafio.id}`} key={desafio.id} className={styles.challengeCard}>
                <img
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=Quiz"}
                  alt={desafio.titulo}
                  // Adiciona um fallback caso a imagem esteja quebrada
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Sem+Imagem"; }}
                  style={{ objectFit: 'cover' }}
                />
                <p>{desafio.titulo}</p>
                {/* Opcional: Mostrar a subcategoria pequena */}
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{desafio.subcategoria}</span>
              </Link>
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>
              Nenhum desafio encontrado para esta área no momento.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CapitulosRH;