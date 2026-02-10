import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css"; // Reutilizando estilos existentes

// Firebase Imports
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function CapitulosMarketing() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define a área desta página como Marketing
  const AREA_ATUAL = "Marketing"; 

  useEffect(() => {
    const fetchDesafios = async () => {
      try {
        setLoading(true);
        // Busca desafios da coleção 'desafios' filtrados pela área Marketing
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
        console.error("Erro ao buscar desafios de Marketing:", error);
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
        Domine estratégias, métricas e criatividade com nossos desafios práticos.
      </p>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando desafios...</p>
      ) : (
        <div className={styles.challengeCardsList}>
          {desafios.length > 0 ? (
            desafios.map((desafio) => (
              <Link to={`/quiz/${desafio.id}`} key={desafio.id} className={styles.challengeCard}>
                <img
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=Marketing"}
                  alt={desafio.titulo}
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Sem+Imagem"; }}
                  style={{ objectFit: 'cover' }}
                />
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{desafio.titulo}</p>
                
                {/* --- ADIÇÃO: QUESTÕES E TENTATIVAS PADRONIZADAS --- */}
                <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
                  <span>{desafio.qtdQuestoes || 0} Questões</span>
                  <span> • </span>
                  <span>{desafio.tentativasPermitidas || 0} Tentativas</span>
                </div>
                {/* ------------------------------------------------- */}

                <span style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                  {desafio.subcategoria}
                </span>
              </Link>
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>
              Nenhum desafio encontrado para a área de Marketing no momento.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CapitulosMarketing;