import React, { useState, useEffect } from "react";
import "./DesafioEng.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function DesafioEng4() {
  const total = 6;
  const corretas = ["b", "c", "a", "b", "c", "a"];

  const [pontuacao, setPontuacao] = useState(0);
  const [respondidas, setRespondidas] = useState(Array(total).fill(false));
  const [feedbacks, setFeedbacks] = useState(Array(total).fill(""));
  const [valores, setValores] = useState(Array(total).fill(""));
  const [salvo, setSalvo] = useState(false);

  const atualizarPlacar = () => `Pontuação: ${pontuacao} / ${total}`;

  const verificar = (num, alternativa) => {
    if (respondidas[num]) return;

    const novasRespondidas = [...respondidas];
    const novosFeedbacks = [...feedbacks];
    const novosValores = [...valores];

    novosValores[num] = alternativa;

    if (alternativa === corretas[num]) {
      novosFeedbacks[num] = "Correto!";
      setPontuacao((prev) => prev + 1);
    } else {
      novosFeedbacks[num] = "Resposta incorreta.";
    }

    novasRespondidas[num] = true;
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
      titulo: "O que é o Direito?",
      codigo: "O Direito pode ser definido como:",
      alternativas: {
        a: "Um conjunto de regras morais sem força obrigatória.",
        b: "Um conjunto de normas que regulam a convivência em sociedade.",
        c: "Apenas leis escritas pelo Poder Executivo.",
        d: "Um ramo exclusivo da filosofia.",
      },
    },
    {
      titulo: "Fontes do Direito",
      codigo: "Qual das alternativas é considerada uma fonte formal do Direito?",
      alternativas: {
        a: "Opinião pessoal do juiz",
        b: "Costumes sociais informais",
        c: "A lei",
        d: "Vontade individual",
      },
    },
    {
      titulo: "Direito Público e Privado",
      codigo: "O Direito Constitucional pertence a qual ramo?",
      alternativas: {
        a: "Direito Público",
        b: "Direito Privado",
        c: "Direito Empresarial",
        d: "Direito Internacional Privado",
      },
    },
    {
      titulo: "Princípio da Legalidade",
      codigo: "O princípio da legalidade determina que:",
      alternativas: {
        a: "Tudo é permitido ao cidadão",
        b: "Ninguém é obrigado a fazer ou deixar de fazer algo senão em virtude de lei",
        c: "A lei vale apenas para o Estado",
        d: "As leis são opcionais",
      },
    },
    {
      titulo: "Constituição Federal",
      codigo: "Qual é a principal função da Constituição Federal?",
      alternativas: {
        a: "Criar leis municipais",
        b: "Regular contratos privados",
        c: "Organizar o Estado e garantir direitos fundamentais",
        d: "Punir crimes",
      },
    },
    {
      titulo: "Direitos Fundamentais",
      codigo: "Os direitos fundamentais têm como objetivo principal:",
      alternativas: {
        a: "Garantir dignidade, liberdade e igualdade às pessoas",
        b: "Beneficiar apenas o Estado",
        c: "Regular apenas a economia",
        d: "Punir infrações administrativas",
      },
    },
  ];

  return (
    <div className="pagina-desafios">
      <div className="scoreboard">{atualizarPlacar()}</div>

      <h1>Desafio 1 - Noções Introdutórias de Direito</h1>
      <p className="subtitle">
        Clique na alternativa correta! (Apenas uma tentativa)
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


