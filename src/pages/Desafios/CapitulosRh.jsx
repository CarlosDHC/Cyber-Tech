import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css"; 

// Firebase Imports
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function CapitulosRH() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. PADRONIZAÇÃO: Use "RH" (maiúsculas) para coincidir com o novo Select do Admin
  const AREA_ATUAL = "RH"; 

  useEffect(() => {
    const fetchDesafios = async () => {
      try {
        setLoading(true);
        // Busca os desafios filtrando pela área correta
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
        Treine seus conhecimentos em Recursos Humanos com nossos desafios interativos.
      </p>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando desafios...</p>
      ) : (
        <div className={styles.challengeCardsList}>
          {desafios.length > 0 ? (
            desafios.map((desafio) => (
              /* 2. ROTA CORRETA: Redireciona para /quiz/ID para usar o novo QuizPlayer */
              <Link to={`/quiz/${desafio.id}`} key={desafio.id} className={styles.challengeCard}>
                <img
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=RH+Quiz"}
                  alt={desafio.titulo}
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Sem+Imagem"; }}
                  style={{ objectFit: 'cover' }}
                />
                <p>{desafio.titulo}</p>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {desafio.qtdQuestoes} Questões • 2 Tentativas
                </span>
              </Link>
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>
              Nenhum desafio encontrado para RH. Crie um no Painel Admin!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CapitulosRH;