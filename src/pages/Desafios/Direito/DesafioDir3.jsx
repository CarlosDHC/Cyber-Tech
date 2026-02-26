import React, { useState, useEffect } from "react";
import "./DesafioDir.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function DesafioDireito3() {
  const total = 6;
const corretas = ["a", "c", "b", "a", "c", "b"];

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
            desafio: "Desafio 3 - Direito Constitucional",
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
    titulo: "Direitos Fundamentais",
    codigo: "Qual artigo da Constituição Federal trata dos direitos e deveres individuais e coletivos?",
    alternativas: {
      a: "Artigo 5º",
      b: "Artigo 1º",
      c: "Artigo 14",
      d: "Artigo 60",
    },
  },
  {
    titulo: "Direito à Vida",
    codigo: "O direito à vida, segundo a Constituição Federal, é:",
    alternativas: {
      a: "Relativo e pode ser livremente retirado",
      b: "Garantido apenas aos brasileiros natos",
      c: "Inviolável",
      d: "Garantido apenas em tempos de paz",
    },
  },
  {
    titulo: "Liberdade de Expressão",
    codigo: "Sobre a liberdade de expressão, é correto afirmar que:",
    alternativas: {
      a: "É absoluta e sem limites",
      b: "É garantida, vedado o anonimato",
      c: "Só pode ser exercida com autorização do Estado",
      d: "Não se aplica à internet",
    },
  },
  {
    titulo: "Igualdade",
    codigo: "O princípio da igualdade previsto na Constituição significa que:",
    alternativas: {
      a: "Todos são iguais perante a lei",
      b: "Todos devem ser tratados de forma idêntica",
      c: "A lei pode favorecer determinados grupos sem justificativa",
      d: "Apenas brasileiros são iguais perante a lei",
    },
  },
  {
    titulo: "Deveres do Cidadão",
    codigo: "Qual das alternativas representa um dever do cidadão?",
    alternativas: {
      a: "Direito à vida",
      b: "Liberdade de crença",
      c: "Votar, quando obrigatório",
      d: "Direito de propriedade",
    },
  },
  {
    titulo: "Direito de Propriedade",
    codigo: "O direito de propriedade, segundo a Constituição Federal:",
    alternativas: {
      a: "É absoluto e ilimitado",
      b: "Deve atender à sua função social",
      c: "Não pode sofrer restrições",
      d: "Só existe para bens imóveis",
    },
  },
];


  return (
    <div className="pagina-desafios">
      <div className="scoreboard">{atualizarPlacar()}</div>

      <h1>Desafio 3 - Direito & Deveres</h1>
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
        <Link to="/desafios/Direito/DesafioDir2" className="back-link">
          <img src="/flecha1.png" alt="Voltar" className="logo-img" />
          Voltar
        </Link>

        <Link to="/desafios/CapitulosDireito" className="menu-link">
          <img src="/azulejos.png" alt="Menu" className="logo-img" />
        </Link>

        <Link to="/desafios/Direito/DesafioDir4" className="next-link">
          Próximo
          <img src="/flecha2.png" alt="Próximo" className="logo-img" />
        </Link>
      </div>
    </div>
  );
}
