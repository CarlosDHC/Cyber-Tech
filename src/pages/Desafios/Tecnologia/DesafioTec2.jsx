import React, { useState, useEffect } from "react";
import "./Desafio.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";


export default function DesafioTec2() {
  const total = 7;
  const corretas = [["+"], ["-"], ["*"], ["/"], ["%"], ["**"], ["and"]];

  const [pontuacao, setPontuacao] = useState(0);
  const [respondidas, setRespondidas] = useState(Array(total).fill(false));
  const [feedbacks, setFeedbacks] = useState(Array(total).fill(""));
  const [valores, setValores] = useState(Array.from({ length: total }, () => [""]));
  const [salvo, setSalvo] = useState(false);

  const atualizarPlacar = () => `Pontuação: ${pontuacao} / ${total}`;

  const handleChange = (num, index, valor) => {
    if (respondidas[num]) return;
    const novosValores = [...valores];
    novosValores[num][index] = valor;
    setValores(novosValores);
  };

  const verificar = (num) => {
    if (respondidas[num]) return;
    const valoresQuestao = valores[num];
    if (valoresQuestao.includes("")) return;

    const isCorreta = valoresQuestao.every(
      (v, i) => v === corretas[num][i]
    );

    const novosFeedbacks = [...feedbacks];
    const novasRespondidas = [...respondidas];

    if (isCorreta) {
      novosFeedbacks[num] = "Correto!";
      setPontuacao((prev) => prev + 1);
    } else {
      novosFeedbacks[num] = "Resposta incorreta. (sem nova tentativa)";
    }

    novasRespondidas[num] = true;
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
            desafio: "Desafio 2 - Operações", // Mantenha o nome original de cada um
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
    { titulo: "Soma de valores", codigo: `a = 10\nb = 5\nresultado = a ___ b\nprint(resultado)  # Esperado: 15` },
    { titulo: "Subtração simples", codigo: `x = 20\ny = 8\nresultado = x ___ y\nprint(resultado)  # Esperado: 12` },
    { titulo: "Multiplicação de números", codigo: `num1 = 4\nnum2 = 3\nresultado = num1 ___ num2\nprint(resultado)  # Esperado: 12` },
    { titulo: "Divisão", codigo: `valor = 10\ndivisor = 2\nresultado = valor ___ divisor\nprint(resultado)  # Esperado: 5.0` },
    { titulo: "Resto da divisão", codigo: `a = 9\nb = 4\nresultado = a ___ b\nprint(resultado)  # Esperado: 1` },
    { titulo: "Potência (exponenciação)", codigo: `base = 2\nexpoente = 4\nresultado = base ___ expoente\nprint(resultado)  # Esperado: 16` },
    { titulo: "Operador lógico AND", codigo: `idade = 20\ncarteira = True\nif idade >= 18 ___ carteira:\n    print("Pode dirigir")` }
  ];

  const opcoes = ["+", "-", "*", "/", "%", "**", "and", "or", "not"];

  return (
    <div className="pagina-desafios">
      <div className="scoreboard">{atualizarPlacar()}</div>
      <h1>Desafios de Operações em Python</h1>
      <p className="subtitle">Escolha o operador correto para completar o código! (Apenas uma tentativa)</p>

      {desafios.map((d, i) => (
        <div key={i} className="challenge-container">
          <h2>{`Desafio ${i + 1} — ${d.titulo}`}</h2>
          <pre>
            {d.codigo.replace(
              "___",
              verificarFim
                ? `→ ${msg} Sua nota final é ${pontuacao}/${total} (${porcentagem}%) ←`
                : "___"
            )}
          </pre>
          <select
            value={valores[i][0]}
            onChange={(e) => handleChange(i, 0, e.target.value)}
            disabled={respondidas[i]}
          >
            <option value="">___</option>
            {opcoes.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
          <div className={`feedback ${feedbacks[i].includes("Correto") ? "correct" : "incorrect"}`}>
            {feedbacks[i]}
          </div>
          {!respondidas[i] && (
            <button className="btn-verificar" onClick={() => verificar(i)}>Verificar</button>
          )}
        </div>
      ))}

      {verificarFim && salvo && (
        <div className="final-score">
          <p style={{ fontSize: "1rem", color: "green", textAlign: "center" }}>Nota salva com sucesso!</p>
        </div>
      )}

      <div className="navigation-links">
        <Link to="/desafios/Tecnologia/DesafioTec1" className="back-link">
          <img src="/flecha1.png" alt="Voltar" className="logo-img" />
          Voltar
        </Link>

        <Link to="/desafios/CapitulosTecnologia" className="menu-link">
          <img src="/azulejos.png" alt="Menu" className="logo-img" />
        </Link>


        <Link to="/desafios/Tecnologia/DesafioTec3" className="next-link">
          Próximo
          <img src="/flecha2.png" alt="Próximo" className="logo-img" />
        </Link>
      </div>

    </div>
  );
}