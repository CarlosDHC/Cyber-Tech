import React, { useState, useEffect } from "react";
import "./DesafioDir.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function DesafioDireito2() {
  const total = 6;
const corretas = ["b", "c", "a", "b", "c", "a"];

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
            desafio: "Desafio 2 - Os Pilares do Direito",
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
    titulo: "Ética Jurídica",
    codigo: "A ética no sistema jurídico tem como principal objetivo:",
    alternativas: {
      a: "Punir apenas condutas ilegais",
      b: "Orientar condutas justas e responsáveis",
      c: "Substituir as leis",
      d: "Beneficiar apenas operadores do direito",
    },
  },
  {
    titulo: "Moral e Ética",
    codigo: "Qual a diferença entre moral e ética?",
    alternativas: {
      a: "Não há diferença entre elas",
      b: "A ética impõe sanções legais",
      c: "A moral refere-se a costumes e a ética à reflexão crítica",
      d: "A ética é individual e a moral é jurídica",
    },
  },
  {
    titulo: "Conduta Ética",
    codigo: "Uma conduta ética no sistema jurídico exige:",
    alternativas: {
      a: "Imparcialidade, honestidade e responsabilidade",
      b: "Vantagem pessoal",
      c: "Interesse político",
      d: "Obediência cega à autoridade",
    },
  },
  {
    titulo: "Operadores do Direito",
    codigo: "É dever ético dos operadores do direito:",
    alternativas: {
      a: "Defender interesses pessoais",
      b: "Atuar com honestidade e boa-fé",
      c: "Ignorar princípios morais",
      d: "Priorizar resultados a qualquer custo",
    },
  },
  {
    titulo: "Justiça",
    codigo: "A ética contribui para a justiça quando:",
    alternativas: {
      a: "Favorece interesses particulares",
      b: "É aplicada apenas em julgamentos",
      c: "Promove decisões equilibradas e justas",
      d: "Substitui a lei escrita",
    },
  },
  {
    titulo: "Responsabilidade Social",
    codigo: "No contexto jurídico, a responsabilidade social significa:",
    alternativas: {
      a: "Atuar pensando no bem da sociedade",
      b: "Cumprir ordens sem questionar",
      c: "Atender apenas clientes ricos",
      d: "Evitar envolvimento social",
    },
  },
];

  return (
    <div className="pagina-desafios">
      <div className="scoreboard">{atualizarPlacar()}</div>

      <h1>Desafio 2 - Ética do sistema juridico</h1>
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
        <Link to="/desafios/Direito/DesafioDir1" className="back-link">
          <img src="/flecha1.png" alt="Voltar" className="logo-img" />
          Voltar
        </Link>

        <Link to="/desafios/CapitulosDireito" className="menu-link">
          <img src="/azulejos.png" alt="Menu" className="logo-img" />
        </Link>

        <Link to="/desafios/Direito/DesafioDir3" className="next-link">
          Próximo
          <img src="/flecha2.png" alt="Próximo" className="logo-img" />
        </Link>
      </div>
    </div>
  );
}
