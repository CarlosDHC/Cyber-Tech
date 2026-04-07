import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function concluirDesafio(idDesafio) {

  const desafios =
    JSON.parse(localStorage.getItem("desafiosConcluidos")) || [];

  if (!desafios.includes(idDesafio)) {

    desafios.push(idDesafio);

    localStorage.setItem(
      "desafiosConcluidos",
      JSON.stringify(desafios)
    );

  }

}

function CapitulosTecnologia() {

  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certificadoLiberado, setCertificadoLiberado] = useState(false);
  const [mostrarAnimacao, setMostrarAnimacao] = useState(false);

  const AREA_ATUAL = "Tecnologia";

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

        const desafiosConcluidos =
          JSON.parse(localStorage.getItem("desafiosConcluidos")) || [];

        const todosConcluidos = listaDesafios.every((desafio) =>
          desafiosConcluidos.includes(desafio.id)
        );

        if (todosConcluidos) {
          setCertificadoLiberado(true);
          setMostrarAnimacao(true);

          setTimeout(() => {
            setMostrarAnimacao(false);
          }, 4000);
        }

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

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Carregando desafios...
        </p>

      ) : (

        <div className={styles.challengeCardsList}>

          {desafios.length > 0 ? (

            desafios.map((desafio) => (

              <Link
                to={`/quiz/${desafio.id}`}
                key={desafio.id}
                className={styles.challengeCard}
              >

                <img
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=Quiz"}
                  alt={desafio.titulo}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/600x400?text=Sem+Imagem";
                  }}
                  style={{ objectFit: "cover" }}
                />

                <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  {desafio.titulo}
                </p>

                <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "8px" }}>
                  <span>{desafio.qtdQuestoes || 0} Questões</span>
                  <span> • </span>
                  <span>{desafio.tentativasPermitidas || 0} Tentativas</span>
                </div>

                <span style={{ fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}>
                  {desafio.subcategoria}
                </span>

              </Link>

            ))

          ) : (

            <p style={{ gridColumn: "1/-1", textAlign: "center" }}>
              Nenhum desafio encontrado para esta área no momento.
            </p>

          )}

        </div>

      )}

      {mostrarAnimacao && (
        <div className={styles.animacaoConquista}>
          🎉 Parabéns! Você concluiu todos os desafios!
        </div>
      )}

      {certificadoLiberado && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link to="/certificado">
            <button className={styles.botao}>
              🎓 Baixar Certificado
            </button>
          </Link>
        </div>
      )}

    </div>
  );

}

export default CapitulosTecnologia;