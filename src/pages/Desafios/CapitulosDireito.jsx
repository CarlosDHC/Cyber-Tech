import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css"; // Reutilizando estilos existentes

// Firebase Imports
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function CapitulosDireito() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define a área desta página
  const AREA_ATUAL = "Direito"; 

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

export default CapitulosDireito;