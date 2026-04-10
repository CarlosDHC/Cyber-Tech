import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css"; // Reutilizando estilos existentes

// Firebase Imports
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

function CapitulosDireito() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [certificadoLiberado, setCertificadoLiberado] = useState(false);
  const [mostrarAnimacao, setMostrarAnimacao] = useState(false);

  // Define a área desta página como Direito
  const AREA_ATUAL = "Direito";

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
        console.error("Erro ao buscar desafios de Direito:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesafios();
  }, []);

  // VERIFICA SE CONCLUIU TODOS OS DESAFIOS
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

      <p className={styles.pageSubtitle}>
        Explore os fundamentos jurídicos e resolva os desafios desta área.
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
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=Direito"}
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
              Nenhum desafio encontrado para a área de Direito no momento.
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
        <div
          style={{
            textAlign: "center",
            marginTop: "60px",
            fontSize: "22px",
            padding: "20px 95px",
          }}
        >
          <Link to="/certificado/CertificadoDIR.jsx">
            <button className={styles.botao}>
              🎓 Certificado desbloqueado!
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default CapitulosDireito;