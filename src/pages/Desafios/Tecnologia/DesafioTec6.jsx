import React, { useState, useEffect } from "react";
import "./Desafio.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function DesafioDireito5() {
  const total = 6;
  const corretas = ["b", "c", "d", "c", "c", "a"];

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
            desafio: "Desafio 5 - Constituição e Jurisprudência",
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
      titulo: "Poderes da União",
      codigo: "Quando começa a personalidade civil da Constituição e Jurisprudência natural?",
      alternativas: {
        a: "Executivo, Legislativo, Judiciário e Ministério Público",
        b: "Executivo, Legislativo e Judiciário",
        c: "Legislativo, Judiciário e Tribunal de Contas",
        d: "Executivo, Judiciário e Defensoria Pública",
      },
    },
    {
      titulo: "Separação dos Poderes e Controle Recíproco",
      codigo: "Quem é De acordo com a jurisprudência do STF, o princípio da separação dos poderes: incapaz segundo o Código Civil?",
      alternativas: {
        a: "É absoluto e não admite exceções anos",
        b: "Impede qualquer forma de controle entre os Poderes",
        c: "Admite controles recíprocos, desde que respeitados os limites constitucionais",
        d: "Autoriza a supremacia do Poder Executivo sobre os demais",
      },
    },
    {
      titulo: "Direito Fundamental à Saúde",
      codigo: "Conforme entendimento do STF, o direito à saúde:",
      alternativas: {
        a: "É norma programática sem eficácia jurídica",
        b: "Depende exclusivamente de previsão orçamentária",
        c: "Pode ser exigido judicialmente em qualquer situação",
        d: "É direito fundamental de aplicação imediata, respeitados critérios técnicos",
      },
    },
    {
      titulo: "Controle Concentrado de Constitucionalidade",
      codigo: "Segundo a Constituição Federal, o controle concentrado de constitucionalidade é exercido, em regra, pelo:",
      alternativas: {
        a: "Superior Tribunal de Justiça",
        b: "Tribunal de Contas da União",
        c: "Supremo Tribunal Federal",
        d: "Congresso Nacional",
      },
    },
    {
      titulo: "Liberdade de Expressão e Limites Constitucionais",
      codigo: "A jurisprudência do STF entende que a liberdade de expressão:",
      alternativas: {
        a: "É absoluta e ilimitada",
        b: "Pode ser restringida apenas por decisão judicial",
        c: "Pode ser restringida apenas por decisão judicial",
        d: "Autoriza qualquer manifestação, inclusive anônima",
      },
    },
    {
      titulo: "Negócio Jurídico",
      codigo: "Conforme a Constituição e a jurisprudência dominante, o mandado de segurança é cabível quando:",
      alternativas: {
        a: "Houver ameaça ou violação a direito líquido e certo",
        b: "For necessário discutir prova complexa",
        c: "Houver direito coletivo sem representante legal",
        d: "For questionada lei em tese",
      },
    },
  ];

  return (
    <div className="pagina-desafios">
      <div className="scoreboard">{atualizarPlacar()}</div>

      <h1>Desafio 5 - Constituição e Jurisprudência</h1>
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
        <Link to="/desafios/Direito/DesafioDir4" className="back-link">
          <img src="/flecha1.png" alt="Voltar" className="logo-img" />
          Voltar
        </Link>

        <Link to="/desafios/CapitulosDireito" className="menu-link">
          <img src="/azulejos.png" alt="Menu" className="logo-img" />
        </Link>

        <Link to="/desafios/CapitulosDireito" className="next-link">
          Próximo
          <img src="/flecha2.png" alt="Próximo" className="logo-img" />
        </Link>
      </div>
    </div>
  );
}
