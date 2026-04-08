import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function CapitulosTecnologia() {

  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certificadoLiberado, setCertificadoLiberado] = useState(false);
  const [mostrarAnimacao, setMostrarAnimacao] = useState(false);

  const AREA_ATUAL = "Tecnologia";

  // FUNÇÃO PARA SALVAR DESAFIO CONCLUÍDO
  function concluirDesafio(idDesafio) {

    const desafiosConcluidos =
      JSON.parse(localStorage.getItem("desafiosConcluidos")) || [];

    if (!desafiosConcluidos.includes(idDesafio)) {

      desafiosConcluidos.push(idDesafio);

      localStorage.setItem(
        "desafiosConcluidos",
        JSON.stringify(desafiosConcluidos)
      );

    }

  }

  useEffect(() => {

    const fetchDesafios = async () => {

      try {

        setLoading(true);

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

  // Verifica se todos desafios foram concluídos
  useEffect(() => {

    const desafiosConcluidos =
      JSON.parse(localStorage.getItem("desafiosConcluidos")) || [];

    const todosConcluidos = desafios.every((desafio) =>
      desafiosConcluidos.includes(desafio.id)
    );

    if (todosConcluidos && desafios.length > 0) {
      setCertificadoLiberado(true);
      setMostrarAnimacao(true);

      setTimeout(() => {
        setMostrarAnimacao(false);
      }, 4000);
    }

  }, [desafios]);

  return (
    <div className={`container ${styles.challengeListContainer}`}>

      <h1 className={styles.pageTitle}>{AREA_ATUAL}</h1>

      {loading ? (
        <p style={{ textAlign: "center" }}>Carregando desafios...</p>
      ) : (

        <div className={styles.challengeCardsList}>

          {desafios.map((desafio) => (

            <Link
              to={`/quiz/${desafio.id}`}
              key={desafio.id}
              className={styles.challengeCard}
              onClick={() => concluirDesafio(desafio.id)}
            >

              <img
                src={desafio.imagemCapa || "https://placehold.co/600x400"}
                alt={desafio.titulo}
              />

              <p>{desafio.titulo}</p>

              <span>
                {desafio.qtdQuestoes} Questões
              </span>

            </Link>

          ))}

        </div>

      )}

      {mostrarAnimacao && (
        <div className={styles.animacaoConquista}>
          🎉 Parabéns! Você concluiu todos os desafios!
        </div>
      )}

      {certificadoLiberado && (
        <div style={{ textAlign: "center", marginTop: "60px", fontSize: "22px", padding: "20px 95px"}}>
          <Link to="/certificado/Certificado.jsx">
            <button className={styles.botao}>
              🎓 Certificado desbloqueado!
            </button>
          </Link>
        </div>
      )}

    </div>
  );
}

export default CapitulosTecnologia;