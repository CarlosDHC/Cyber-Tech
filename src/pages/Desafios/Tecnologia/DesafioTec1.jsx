import React, { useState, useEffect } from "react";
import "./Desafio.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function DesafioTec1() {
  const total = 6;
  const corretas = ["b", "c", "c", "b", "b", "a"];

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
      novosFeedbacks[num] = "Resposta incorreta. (sem nova tentativa)";
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

  // Salvar no Firebase
  useEffect(() => {
    if (verificarFim && !salvo && auth.currentUser) {
      // Aplique este bloco nos ficheiros de desafio
      const salvarNoBanco = async () => {
        try {
          await addDoc(collection(db, "pontuacoes"), {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            nome: auth.currentUser.displayName || "Aluno",
            desafio: "Desafio 1 - Introdução",
            nota: pontuacao,
            total: total,
            data: new Date().toISOString()
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
      titulo: "O que é um algoritmo?",
      codigo: `Um algoritmo em programação é:`,
      alternativas: {
        a: "Um erro que ocorre durante a execução do código.",
        b: "Um conjunto de instruções que resolvem um problema passo a passo.",
        c: "Um tipo especial de variável usada no Python.",
        d: "Uma biblioteca padrão do Python.",
      },
    },
    {
      titulo: "Variáveis em Python",
      codigo: `Qual linha cria corretamente uma variável chamada nome com o valor "Victor"?`,
      alternativas: {
        a: 'var nome = "Victor"',
        b: 'nome: "Victor"',
        c: 'nome = "Victor"',
        d: 'string nome = "Victor"',
      },
    },
    {
      titulo: "Tipos de Dados",
      codigo: `Qual das opções abaixo representa um valor booleano no Python?`,
      alternativas: {
        a: '"True"',
        b: "1",
        c: "True",
        d: "'False'",
      },
    },
    {
      titulo: "Condicionais (if, elif, else)",
      codigo: `O que o código abaixo imprime?

x = 10
if x > 15:
    print("Maior que 15")
elif x == 10:
    print("Igual a 10")
else:
    print("Menor que 10")`,
      alternativas: {
        a: "Maior que 15",
        b: "Igual a 10",
        c: "Menor que 10",
        d: "Erro no código",
      },
    },
    {
      titulo: "Funções em Python",
      codigo: `Qual é a saída deste código?

def saudacao():
    return "Olá, mundo!"

print(saudacao())`,
      alternativas: {
        a: "saudacao()",
        b: "Olá, mundo!",
        c: "return Olá, mundo!",
        d: "Erro: falta argumento",
      },
    },
    {
      titulo: "Operações matemáticas",
      codigo: `Qual será o valor de resultado?

a = 8
b = 3
resultado = a % b`,
      alternativas: {
        a: "2",
        b: "3",
        c: "1",
        d: "5",
      },
    },
  ];

  return (
    <div className="pagina-desafios">
      <div className="scoreboard">{atualizarPlacar()}</div>
      <h1>Desafios de Python</h1>
      <p className="subtitle">Clique na alternativa correta! (Apenas uma tentativa)</p>
      {desafios.map((d, i) => (
        <div key={i} className="challenge-container">
          <h2>{`Desafio ${i + 1} — ${d.titulo}`}</h2>
          <pre>{d.codigo}</pre>
          <div className="alternativas">
            {Object.entries(d.alternativas).map(([letra, texto]) => (
              <button
                key={letra}
                className={`alternativa-btn ${valores[i] === letra ? "selecionada" : ""
                  } ${respondidas[i] ? "bloqueada" : ""}`}
                onClick={() => verificar(i, letra)}
                disabled={respondidas[i]}
              >
                <strong>{letra.toUpperCase()}.</strong> {texto}
              </button>
            ))}
          </div>
          <div className={`feedback ${feedbacks[i].includes("Correto") ? "correct" : "incorrect"}`}>
            {feedbacks[i]}
          </div>
        </div>
      ))}
      {verificarFim && (
        <div className="final-score">
          {msg} Sua nota final é {pontuacao}/{total} ({porcentagem}%).
          {salvo && <p style={{ fontSize: "0.9rem", color: "green", marginTop: "5px" }}>Nota salva com sucesso!</p>}
        </div>
      )}


      <div className="navigation-links">
        <Link to="/desafios" className="back-link">
          <img src="/flecha1.png" alt="Voltar" className="logo-img" />
          Voltar
        </Link>

        <Link to="/desafios/CapitulosTecnologia" className="menu-link">
          <img src="/azulejos.png" alt="Menu" className="logo-img" />
        </Link>

        <Link to="/desafios/Tecnologia/DesafioTec2" className="next-link">
          Próximo
          <img src="/flecha2.png" alt="Próximo" className="logo-img" />
        </Link>
      </div>

    </div>
  );
}
