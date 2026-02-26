

import React, { useState, useEffect } from "react";
import "./DesafioRh.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function DesafioRh1() {
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
            desafio: "Desafio 1 - Projeto Estrutural",
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
      titulo: "Compatibilização de Projetos",
      codigo: "O projeto estrutural deve ser compatibilizado com:",
      alternativas: {
        a: "Apenas o projeto hidráulico",
        b: "Projetos arquitetônico e complementares",
        c: "Somente o cronograma",
        d: "Apenas o orçamento",
      },
    },
    {
      titulo: "Finalidade da Análise Estrutural",
      codigo: "A análise estrutural visa determinar:",
      alternativas: {
        a: "Custos da obra",
        b: "Esforços e deslocamentos",
        c: "Tipo de acabamento",
        d: "Layout arquitetônico",
      },
    },
    {
      titulo: "Base do Dimensionamento Estrutural",
      codigo: "O dimensionamento estrutural baseia-se:",
      alternativas: {
        a: "Na experiência do engenheiro",
        b: "Em normas técnicas",
        c: "Em preferências do cliente",
        d: "No menor custo possível",
      },
    },
    {
      titulo: "Ações Permanentes",
      codigo: "As ações permanentes incluem:",
      alternativas: {
        a: "Vento e sismo",
        b: "Cargas de uso",
        c: "Peso próprio da estrutura",
        d: "Impactos acidentais",
      },
    },
    {
      titulo: "Ações Variáveis",
      codigo: "As ações variáveis incluem:",
      alternativas: {
        a: "Peso das fundações",
        b: "Peso das vigas",
        c: "Sobrecargas de uso",
        d: "Peso próprio",
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
        <Link to="/desafios/Capitulos/Engenharia" className="back-link">
          <img src="/flecha1.png" alt="Voltar" className="logo-img" />
          Voltar
        </Link>

        <Link to="/desafios/CapitulosDireito" className="menu-link">
          <img src="/azulejos.png" alt="Menu" className="logo-img" />
        </Link>

        <Link to="/desafios/Engenharia/DesafioEng2" className="next-link">
          Próximo
          <img src="/flecha2.png" alt="Próximo" className="logo-img" />
        </Link>
      </div>
    </div>
  );
}
