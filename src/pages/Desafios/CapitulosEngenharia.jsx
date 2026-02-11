import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css"; // Reutilizando estilos existentes

// Firebase Imports
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function CapitulosEngenharia() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define a área desta página como Engenharia
  const AREA_ATUAL = "Engenharia"; 

  useEffect(() => {
    const fetchDesafios = async () => {
      try {
        setLoading(true);
        // Busca desafios da coleção 'desafios' filtrados pela área Engenharia
        const q = query(
          collection(db, "desafios"),
          where("area", "==", AREA_ATUAL),
          orderBy("dataCriacao", "desc")
        );

        const querySnapshot = await getDocs(q);
        const listaDesafios = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setDesafios(listaDesafios);
      } catch (error) {
        console.error("Erro ao buscar desafios de Engenharia:", error);
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
        Soluções técnicas e inovação: aplique seus conhecimentos em desafios de Engenharia.
      </p>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando desafios...</p>
      ) : (
        <div className={styles.challengeCardsList}>
          {desafios.length > 0 ? (
            desafios.map((desafio) => (
              <Link to={`/quiz/${desafio.id}`} key={desafio.id} className={styles.challengeCard}>
                <img
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=Engenharia"}
                  alt={desafio.titulo}
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Sem+Imagem"; }}
                  style={{ objectFit: 'cover' }}
                />
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{desafio.titulo}</p>
                

                <span style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                  {desafio.subcategoria}
                </span>
              </Link>
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>
              Nenhum desafio encontrado para a área de Engenharia no momento.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CapitulosEngenharia;