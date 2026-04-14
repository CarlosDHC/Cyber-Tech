import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function CapitulosRh() {

  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [certificadoLiberado, setCertificadoLiberado] = useState(false);
  const [mostrarAnimacao, setMostrarAnimacao] = useState(false);

  const AREA_ATUAL = "RH";

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
        console.error("Erro ao buscar desafios de RH:", error);
      } finally {
        setLoading(false);
      }

    };

    fetchDesafios();

  }, []);

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

  // CALCULAR PROGRESSO
  const desafiosConcluidos =
    JSON.parse(localStorage.getItem("desafiosConcluidos")) || [];

  const concluidosNaArea = desafios.filter(d =>
    desafiosConcluidos.includes(d.id)
  ).length;

  const progresso = desafios.length
    ? (concluidosNaArea / desafios.length) * 100
    : 0;

  return (
    <div className={`container ${styles.challengeListContainer}`}>

      <h1 className={styles.pageTitle}>{AREA_ATUAL}</h1>

      <p className={styles.pageSubtitle}>
        Desenvolva competências em gestão de pessoas com nossos simulados.
      </p>

      {/* BARRA DE PROGRESSO */}

      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#ddd",
          borderRadius: "10px",
          marginBottom: "10px"
        }}
      >
        <div
          style={{
            width: `${progresso}%`,
            height: "100%",
            background: "linear-gradient(135deg,#4CAF50,#2E7D32)",
            borderRadius: "10px",
            transition: "0.5s"
          }}
        />
      </div>

      <p style={{ textAlign: "center", marginBottom: "25px" }}>
        {concluidosNaArea} de {desafios.length} desafios concluídos
      </p>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
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
                onClick={() => concluirDesafio(desafio.id)}
              >

                <img
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=RH"}
                  alt={desafio.titulo}
                  onError={(e) => { 
                    e.target.src = "https://placehold.co/600x400?text=Sem+Imagem"; 
                  }}
                  style={{ objectFit: 'cover' }}
                />

                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {desafio.titulo}
                </p>

                <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
                  <span>{desafio.qtdQuestoes || 0} Questões</span>
                  <span> • </span>
                  <span>{desafio.tentativasPermitidas || 0} Tentativas</span>
                </div>

                <span style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                  {desafio.subcategoria}
                </span>

              </Link>

            ))

          ) : (

            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>
              Nenhum desafio encontrado para a área de RH no momento.
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
        <div style={{ textAlign: "center", marginTop: "60px", fontSize: "22px", padding: "20px 95px"}}>
          <Link to="/Certificado/CertificadoRH">
            <button className={styles.botao}>
              🎓 Certificado desbloqueado!
            </button>
          </Link>
        </div>
      )}

    </div>
  );
}

export default CapitulosRh;