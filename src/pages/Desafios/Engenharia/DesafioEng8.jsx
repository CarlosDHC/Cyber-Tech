import React, { useState, useEffect } from "react";
import "./DesafioEng.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function DesafioDireito4() {
  const total = 6;
  const corretas = ["a", "b", "c", "a", "b", "c"];

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
            desafio: "Desafio 4 - Advocacia",
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
      titulo: "Função Essencial à Justiça",
      codigo: "Segundo a Constituição Federal, a advocacia é:",
      alternativas: {
        a: "Atividade privada sem relevância pública",
        b: "Função essencial à Justiça",
        c: "Órgão auxiliar do Poder Judiciário",
        d: "Serviço público delegado",
      },
    },
    {
      titulo: "Inviolabilidade do Advogado",
      codigo: "De acordo com o Estatuto da OAB (Lei nº 8.906/94), o advogado é inviolável:",
      alternativas: {
        a: "Em qualquer situação, sem exceções",
        b: "Apenas no exercício da defesa criminal",
        c: "Por seus atos e manifestações no exercício da profissão, nos limites da lei",
        d: "Somente quando atuando em juízo",
      },
    },
    {
      titulo: "Sigilo Profissional",
      codigo: "Sobre o sigilo profissional do advogado, é correto afirmar que:",
      alternativas: {
        a: "Pode ser livremente quebrado por ordem judicial",
        b: "É dever absoluto, mesmo para defesa própria",
        c: "Pode ser relativizado em situações excepcionais previstas em leio",
        d: "Não se aplica a informações recebidas do cliente",
      },
    },
    {
      titulo: "Direitos do Advogado",
      codigo: "Constitui direito do advogado, conforme o Estatuto da OAB:",
      alternativas: {
        a: "Recusar-se a prestar contas ao cliente",
        b: "Ter vista dos processos apenas com autorização judicial",
        c: "Comunicar-se com o cliente preso, ainda que incomunicável",
        d: "Praticar atos privativos de magistrados",
      },
    },
    {
      titulo: "Ética Profissional e Captação de Clientela",
      codigo: "Segundo o Código de Ética e Disciplina da OAB, é vedado ao advogado:",
      alternativas: {
        a: "Divulgar conteúdos jurídicos com finalidade educativa",
        b: "Participar de eventos jurídicos",
        c: "Utilizar publicidade moderada e informativa",
        d: "Captar clientela por meio de mercantilização da profissão",
      },
    },
    {
      titulo: "Exercício da Advocacia e Impedimentos",
      codigo: "Conforme o Estatuto da OAB, estão impedidos de exercer a advocacia:",
      alternativas: {
        a: "Todos os servidores públicos",
        b: "Apenas os membros do Poder Judiciário",
        c: "Os ocupantes de cargos que gerem incompatibilidade ou impedimento legal",
        d: "Apenas os advogados públicos",
      },
    },
  ];

  return (
    <div className="pagina-desafios">
      <div className="scoreboard">{atualizarPlacar()}</div>

      <h1>Desafio 4 - Advocacia</h1>
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
              <Link to="/desafios/Direito/DesafioDir3" className="back-link">
                <img src="/flecha1.png" alt="Voltar" className="logo-img" />
                Voltar
              </Link>
      
              <Link to="/desafios/CapitulosDireito" className="menu-link">
                <img src="/azulejos.png" alt="Menu" className="logo-img" />
              </Link>
      
              <Link to="/desafios/Direito/DesafioDir5" className="next-link">
                Próximo
                <img src="/flecha2.png" alt="Próximo" className="logo-img" />
              </Link>
            </div>
          </div>
        );
      }
