import React, { useState, useEffect } from "react";
import "./DesafioDir.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function DesafioDir1() {
  const total = 6;
const corretas = ["b", "a", "c", "b", "a", "c"];

  const [pontuacao, setPontuacao] = useState(0);
  const [respondidas, setRespondidas] = useState(Array(total).fill(false));
  const [feedbacks, setFeedbacks] = useState(Array(total).fill(""));
  const [valores, setValores] = useState(Array(total).fill(""));
  const [tentativas, setTentativas] = useState(Array(total).fill(0));
  const [salvo, setSalvo] = useState(false);
  

  const atualizarPlacar = () => `Pontuação: ${pontuacao} / ${total}`;

  const verificar = (num, alternativa) => {
    if (respondidas[num]) return;

    const novasRespondidas = [...respondidas];
    const novosFeedbacks = [...feedbacks];
    const novosValores = [...valores];
    const novasTentativas = [...tentativas];

    novasTentativas[num] += 1;
    novosValores[num] = alternativa;

    if (alternativa === corretas[num]) {
      novosFeedbacks[num] = "Correto!";
      novasRespondidas[num] = true;
      setPontuacao((prev) => prev + 1);
    } else {
      if (novasTentativas[num] < 2) {
        novosFeedbacks[num] = "Resposta incorreta. Tente novamente!";
      } else {
        novosFeedbacks[num] = "Resposta incorreta.";
        novasRespondidas[num] = true;
      }
    }

    setTentativas(novasTentativas);
    setValores(novosValores);
    setFeedbacks(novosFeedbacks);
    setRespondidas(novasRespondidas);
  };

  const verificarFim = respondidas.every((r) => r);
  const porcentagem = Math.round((pontuacao / total) * 100);

  let msg = "Precisa praticar mais...";
  if (porcentagem >= 85) msg = "Excelente!";
  else if (porcentagem >= 60) msg = "Bom trabalho!";

  useEffect(() => {
    if (verificarFim && !salvo && auth.currentUser) {
      const salvarNoBanco = async () => {
        try {
          await addDoc(collection(db, "pontuacoes"), {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            nome: auth.currentUser.displayName || "Aluno",
            desafio: "Desafio 1 - Noções Introdutórias de Direito",
            nota: pontuacao,
            total: total,
            data: new Date().toISOString(),
          });
          setSalvo(true);
        } catch (error) {
          console.error("Erro ao salvar nota:", error);
        }
      };
      salvarNoBanco();
    }
  }, [verificarFim, salvo, pontuacao]);

  const desafios = [
  {
    titulo: "Conceito de Legislação",
    codigo: "Legislação pode ser definida como:",
    alternativas: {
      a: "Conjunto de costumes sociais",
      b: "Conjunto de leis que regem uma sociedade",
      c: "Decisões exclusivas dos juízes",
      d: "Normas morais sem obrigatoriedade",
    },
  },
  {
    titulo: "Lei",
    codigo: "O que é uma lei?",
    alternativas: {
      a: "Norma jurídica escrita, criada pelo Poder competente",
      b: "Opinião pessoal do legislador",
      c: "Regra moral",
      d: "Costume popular",
    },
  },
  {
    titulo: "Hierarquia das Leis",
    codigo: "Qual norma está no topo da hierarquia normativa brasileira?",
    alternativas: {
      a: "Lei ordinária",
      b: "Decreto",
      c: "Constituição Federal",
      d: "Portaria",
    },
  },
  {
    titulo: "Vigência da Lei",
    codigo: "Quando uma lei começa a produzir efeitos, em regra?",
    alternativas: {
      a: "No momento em que é proposta",
      b: "Após sua publicação",
      c: "Quando o juiz aplica",
      d: "Quando o cidadão concorda",
    },
  },
  {
    titulo: "Obrigatoriedade da Lei",
    codigo: "Sobre a obrigatoriedade da lei, é correto afirmar que:",
    alternativas: {
      a: "Ninguém pode alegar desconhecimento da lei para descumpri-la",
      b: "A lei só vale para quem a conhece",
      c: "A lei é opcional",
      d: "A lei só se aplica a servidores públicos",
    },
  },
  {
    titulo: "Revogação da Lei",
    codigo: "Uma lei pode ser revogada quando:",
    alternativas: {
      a: "O juiz decide",
      b: "O povo deixa de cumpri-la",
      c: "Outra lei posterior a modifica ou elimina",
      d: "O Executivo ignora sua aplicação",
    },
  },
];


  return (
    <div className="pagina-desafios">
      <div className="scoreboard">{atualizarPlacar()}</div>

      <h1>Desafio 1 - Legislação</h1>
      <p className="subtitle">
        Cada pergunta permite <strong>duas tentativas</strong>
      </p>

      {desafios.map((d, i) => (
        <div key={i} className="challenge-container">
          <h2>{`Desafio ${i + 1} — ${d.titulo}`}</h2>
          <pre>{d.codigo}</pre>

          <div className="alternativas">
            {Object.entries(d.alternativas).map(([letra, texto]) => (
              <button
                key={letra}
                className={`alternativa-btn ${
                  valores[i] === letra ? "selecionada" : ""
                } ${respondidas[i] ? "bloqueada" : ""}`}
                onClick={() => verificar(i, letra)}
                disabled={respondidas[i]}
              >
                <strong>{letra.toUpperCase()}.</strong> {texto}
              </button>
            ))}
          </div>

          <div
            className={`feedback ${
              feedbacks[i].includes("Correto") ? "correct" : "incorrect"
            }`}
          >
            {feedbacks[i]}
          </div>

          {!respondidas[i] && tentativas[i] === 1 && (
            <p style={{ fontSize: "0.8rem", color: "#ff9800" }}>
              Última tentativa!
            </p>
          )}
        </div>
      ))}

      {verificarFim && (
        <div className="final-score">
          {msg} Sua nota final é {pontuacao}/{total} ({porcentagem}%).
          {salvo && (
            <p style={{ fontSize: "0.9rem", color: "green", marginTop: "5px" }}>
              Nota salva com sucesso!
            </p>
          )}
        </div>
      )}

      <div className="navigation-links">
        <Link to="/desafios/CapitulosDireito" className="back-link">
          <img src="/flecha1.png" alt="Voltar" className="logo-img" />
          Voltar
        </Link>

        <Link to="/desafios/CapitulosDireito" className="menu-link">
          <img src="/azulejos.png" alt="Menu" className="logo-img" />
        </Link>

        <Link to="/desafios/Direito/DesafioDir2" className="next-link">
          Próximo
          <img src="/flecha2.png" alt="Próximo" className="logo-img" />
        </Link>
      </div>
    </div>
  );
}
