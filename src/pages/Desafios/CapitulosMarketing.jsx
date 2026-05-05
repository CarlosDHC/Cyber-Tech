import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Home/Home.module.css";

// Firebase Imports
import { collection, query, where, getDocs, orderBy, doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../FirebaseConfig";

function CapitulosMarketing() {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para armazenar os IDs dos desafios que o usuário já fez (vem do Firebase)
  const [desafiosConcluidos, setDesafiosConcluidos] = useState([]);

  const [certificadoLiberado, setCertificadoLiberado] = useState(false);
  const [mostrarAnimacao, setMostrarAnimacao] = useState(false);

  // Estado que controla a largura da barra e o número na tela
  const [progresso, setProgresso] = useState(0);

  const AREA_ATUAL = "Marketing";
  const auth = getAuth(); // Pega a instância do Auth

  // 1. FUNÇÃO PARA SALVAR O DESAFIO NO FIREBASE
  async function concluirDesafio(idDesafio) {
    const user = auth.currentUser;

    if (!user) {
      console.error("Usuário não autenticado. O progresso não pode ser salvo.");
      return;
    }

    const userRef = doc(db, "users", user.uid);

    try {
      // setDoc com merge: true cria o documento se não existir, e apenas atualiza se já existir
      // arrayUnion garante que o ID do desafio não seja salvo duplicado
      await setDoc(userRef, {
        desafiosConcluidosMarketing: arrayUnion(idDesafio)
      }, { merge: true });

      // Atualiza o estado visual na tela imediatamente (faz a barra andar na hora)
      if (!desafiosConcluidos.includes(idDesafio)) {
        setDesafiosConcluidos((prev) => [...prev, idDesafio]);
      }
      
      console.log("Desafio salvo com sucesso no banco de dados!");

    } catch (error) {
      console.error("Erro ao salvar progresso no Firebase:", error);
    }
  }

  // 2. BUSCAR A LISTA DE DESAFIOS DA ÁREA DE MARKETING
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
        console.error("Erro ao buscar desafios de Marketing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesafios();
  }, []);

  // 3. BUSCAR O PROGRESSO DO USUÁRIO LOGADO DIRETAMENTE DO BANCO
  useEffect(() => {
    // onAuthStateChanged espera o Firebase confirmar quem é o usuário
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          // Se o usuário tiver um array de desafios de marketing, nós o carregamos. Senão, inicia vazio.
          setDesafiosConcluidos(dados.desafiosConcluidosMarketing || []);
        }
      } else {
        // Limpa a barra se o usuário deslogar
        setDesafiosConcluidos([]); 
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // 4. CALCULAR O PROGRESSO E LIBERAR O CERTIFICADO
  useEffect(() => {
    // Conta quantos desafios da lista geral estão dentro do array de concluídos do usuário
    const concluidos = desafios.filter((desafio) =>
      desafiosConcluidos.includes(desafio.id)
    ).length;

    // Faz o cálculo da porcentagem (regra de 3 simples)
    const porcentagem =
      desafios.length > 0 ? Math.round((concluidos / desafios.length) * 100) : 0;

    setProgresso(porcentagem);

    // Verifica se bateu 100%
    const todosConcluidos = concluidos === desafios.length && desafios.length > 0;

    if (todosConcluidos) {
      setCertificadoLiberado(true);
      setMostrarAnimacao(true);

      setTimeout(() => {
        setMostrarAnimacao(false);
      }, 4000);
    }

  }, [desafios, desafiosConcluidos]);

  // 5. RENDERIZAÇÃO DA TELA
  return (
    <div className={`container ${styles.challengeListContainer}`}>

      <h1 className={styles.pageTitle}>{AREA_ATUAL}</h1>

      <p className={styles.pageSubtitle}>
        Domine estratégias, métricas e criatividade com nossos desafios práticos.
      </p>

      {/* COMPONENTE DA BARRA DE PROGRESSO */}
      <div style={{ width: "100%", marginBottom: "30px" }}>

        <div
          style={{
            width: "100%",
            height: "20px",
            background: "#ddd",
            borderRadius: "10px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progresso}%`,
              height: "100%",
              background: "#4CAF50",
              transition: "width 0.8s ease" // Animação um pouco mais suave
            }}
          />
        </div>

        <p style={{ textAlign: "center", marginTop: "8px", fontWeight: "bold" }}>
          Progresso: {progresso}%
        </p>

      </div>

      {/* LISTAGEM DOS CARDS */}
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
                // Dispara o salvamento no banco de dados quando o usuário clica
                onClick={() => concluirDesafio(desafio.id)}
              >

                <img
                  src={desafio.imagemCapa || "https://placehold.co/600x400?text=Marketing"}
                  alt={desafio.titulo}
                  onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Sem+Imagem"; }}
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
              Nenhum desafio encontrado para a área de Marketing no momento.
            </p>
          )}
        </div>
      )}

      {/* ANIMAÇÃO E BOTÃO DE CERTIFICADO */}
      {mostrarAnimacao && (
        <div className={styles.animacaoConquista}>
          🎉 Parabéns! Você concluiu todos os desafios!
        </div>
      )}

      {certificadoLiberado && (
        <div style={{ textAlign: "center", marginTop: "60px", fontSize: "22px", padding: "20px 95px"}}>
          <Link to="/Certificado/CertificadoMAR.jsx">
            <button className={styles.botao}>
              🎓 Certificado desbloqueado!
            </button>
          </Link>
        </div>
      )}

    </div>
  );
}

export default CapitulosMarketing;