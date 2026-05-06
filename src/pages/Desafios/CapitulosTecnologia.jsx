import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

// Firebase Imports
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../FirebaseConfig";

function CapitulosTecnologia() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [desafiosConcluidos, setDesafiosConcluidos] = useState([]);
  const [certificadoLiberado, setCertificadoLiberado] = useState(false);
  const [mostrarAnimacao, setMostrarAnimacao] = useState(false);
  const [progresso, setProgresso] = useState(0); 

  // =============== CONFIGURAÇÕES DA ÁREA ===============
  const AREA_ATUAL = "Tecnologia"; 
  const CAMPO_FIREBASE = "desafiosConcluidosTecnologia";
  const ROTA_CERTIFICADO = "/Certificado/CertificadoTEC.jsx";
  const TEXTO_SUBTITULO = "Aprofunde-se em programação, infraestrutura e inovação tecnológica.";
  // =====================================================

  const auth = getAuth(); 

  // 1. BUSCAR A LISTA DE DESAFIOS DA ÁREA DE TECNOLOGIA
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
        console.error(`Erro ao buscar desafios de ${AREA_ATUAL}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchDesafios();
  }, []);

  // 2. LER O PROGRESSO DO USUÁRIO LOGADO NO FIREBASE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          // Usa a variável dinâmica para buscar o array correto no banco
          setDesafiosConcluidos(dados[CAMPO_FIREBASE] || []);
        }
      } else {
        setDesafiosConcluidos([]); 
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // 3. CALCULAR A BARRA DE PROGRESSO
  useEffect(() => {
    const concluidos = desafios.filter((desafio) =>
      desafiosConcluidos.includes(desafio.id)
    ).length;

    const porcentagem = desafios.length > 0 ? Math.round((concluidos / desafios.length) * 100) : 0;
    setProgresso(porcentagem);

    const todosConcluidos = concluidos === desafios.length && desafios.length > 0;

    if (todosConcluidos) {
      setCertificadoLiberado(true);
      setMostrarAnimacao(true);
      setTimeout(() => { setMostrarAnimacao(false); }, 4000);
    }
  }, [desafios, desafiosConcluidos]);

  return (
    <div className={`container ${styles.challengeListContainer}`}>
      <h1 className={styles.pageTitle}>{AREA_ATUAL}</h1>
      <p className={styles.pageSubtitle}>
        {TEXTO_SUBTITULO}
      </p>

      {/* BARRA DE PROGRESSO */}
      <div style={{ width: "100%", marginBottom: "30px" }}>
        <div style={{ width: "100%", height: "20px", background: "#ddd", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ width: `${progresso}%`, height: "100%", background: "#4CAF50", transition: "width 0.8s ease" }} />
        </div>
        <p style={{ textAlign: "center", marginTop: "8px", fontWeight: "bold" }}>
          Progresso: {progresso}%
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Carregando desafios...</p>
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
                  src={desafio.imagemCapa || `https://placehold.co/600x400?text=${AREA_ATUAL.replace(/\s+/g, '+')}`}
                  alt={desafio.titulo}
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Sem+Imagem"; }}
                  style={{ objectFit: 'cover' }}
                />
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{desafio.titulo}</p>
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
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Nenhum desafio encontrado para a área de {AREA_ATUAL} no momento.</p>
          )}
        </div>
      )}

      {mostrarAnimacao && (
        <div className={styles.animacaoConquista}>🎉 Parabéns! Você concluiu todos os desafios!</div>
      )}

      {certificadoLiberado && (
        <div style={{ textAlign: "center", marginTop: "60px", fontSize: "22px", padding: "20px 95px"}}>
          <Link to={ROTA_CERTIFICADO}>
            <button className={styles.botao}>🎓 Certificado desbloqueado!</button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default CapitulosTecnologia;