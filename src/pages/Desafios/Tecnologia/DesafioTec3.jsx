import React, { useState, useEffect } from "react";
import "./Desafio.css";
import { db, auth } from "../../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";


export default function DesafioTec3() {
  const total = 5;
  const corretas = [
    ["if", "elif", "else"],
    ["if", "elif", "else"],
    ["if", "elif", "else"],
    ["if", "elif", "else"],
    ["if", "elif", "else"],
  ];

  const desafios = [
    {
      titulo: "Escolha da bebida",
      linhas: [
        'bebida = "café"',
        'print("O que você quer beber no café da manhã?")',
        "____ bebida == \"café\":",
        '    print("Bom café!")',
        "____ bebida == \"leite\":",
        '    print("Um leite quentinho!")',
        "____:",
        '    print("Opção diferente!")',
      ],
    },
    {
      titulo: "Tipo de pão",
      linhas: [
        'pao = "francês"',
        'print("Você prefere pão integral ou francês?")',
        "____ pao == \"integral\":",
        '    print("Saudável!")',
        "____ pao == \"francês\":",
        '    print("Clássico!")',
        "____:",
        '    print("Outro tipo de pão!")',
      ],
    },
    {
      titulo: "Fruta da manhã",
      linhas: [
        'fruta = "banana"',
        'print("Verificando a fruta escolhida...")',
        "____ fruta == \"banana\":",
        '    print("Boa fonte de energia!")',
        "____ fruta == \"maçã\":",
        '    print("Rica em fibras!")',
        "____:",
        '    print("Outra fruta deliciosa!")',
      ],
    },
    {
      titulo: "Acompanhamento",
      linhas: [
        'acompanhamento = "queijo"',
        'print("Verificando o acompanhamento do café...")',
        "____ acompanhamento == \"queijo\":",
        '    print("Combinação perfeita!")',
        "____ acompanhamento == \"presunto\":",
        '    print("Clássico brasileiro!")',
        "____:",
        '    print("Algo diferente no café!")',
      ],
    },
    {
      titulo: "Doce ou salgado?",
      linhas: [
        'sabor = "doce"',
        'print("Seu café da manhã é doce ou salgado?")',
        "____ sabor == \"doce\":",
        '    print("Panquecas e mel!")',
        "____ sabor == \"salgado\":",
        '    print("Ovos e pão de queijo!")',
        "____:",
        '    print("Um sabor misto!")',
      ],
    },
  ];

  const [pontuacao, setPontuacao] = useState(0);
  const [respondidas, setRespondidas] = useState(Array(total).fill(false));
  const [respostas, setRespostas] = useState(
    Array.from({ length: total }, () => [])
  );
  const [salvo, setSalvo] = useState(false);

  function handleChange(num, selectIndex, value) {
    const novasRespostas = [...respostas];
    novasRespostas[num][selectIndex] = value;
    setRespostas(novasRespostas);
  }

  function verificar(num) {
    if (respondidas[num]) return;

    const r = respostas[num];
    if (!r || r.length < 3 || r.includes("") || r.includes(undefined)) {
      alert("Preencha todos os espaços antes de verificar!");
      return;
    }

    const isCorreta = r.every((v, i) => v === corretas[num][i]);
    const novasRespondidas = [...respondidas];
    novasRespondidas[num] = true;
    setRespondidas(novasRespondidas);

    if (isCorreta) setPontuacao((p) => p + 1);
  }

  const finalizado = respondidas.every((r) => r);
  const porcentagem = Math.round((pontuacao / total) * 100);
  let msg = "Precisa praticar mais...";
  if (porcentagem >= 85) msg = "Excelente!";
  else if (porcentagem >= 60) msg = "Bom trabalho!";

  // Salvar no Firebase
  useEffect(() => {
    if (finalizado && !salvo && auth.currentUser) {
      // Aplique este bloco nos 4 ficheiros de desafio
      const salvarNoBanco = async () => {
        try {
          await addDoc(collection(db, "pontuacoes"), {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            nome: auth.currentUser.displayName || "Aluno",
            desafio: "Desafio 3 - Condicionais", // Mantenha o nome original de cada um
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
  }, [finalizado, salvo, pontuacao]);

  return (
    <div className="pagina-desafios">
      <div className="scoreboard">Pontuação: {pontuacao} / {total}</div>
      <h1>Desafios do Café da Manhã</h1>
      <p className="subtitle">
        Complete os espaços <b>____</b> com <b>if</b>, <b>elif</b> ou <b>else</b>.<br />
        Apenas uma tentativa por questão!
      </p>

      {desafios.map((d, i) => {
        let selectCount = 0;
        return (
          <div key={i} className="challenge-container">
            <h2>Desafio {i + 1} — {d.titulo}</h2>
            <pre>
              {d.linhas.map((linha, j) => {
                if (linha.includes("____")) {
                  const selectId = selectCount++;
                  return (
                    <React.Fragment key={j}>
                      {linha.split("____")[0]}
                      <select
                        disabled={respondidas[i]}
                        value={respostas[i][selectId] || ""}
                        onChange={(e) =>
                          handleChange(i, selectId, e.target.value)
                        }
                      >
                        <option value="">____</option>
                        <option value="if">if</option>
                        <option value="elif">elif</option>
                        <option value="else">else</option>
                      </select>
                      {linha.split("____")[1]}
                      {"\n"}
                    </React.Fragment>
                  );
                } else {
                  return <span key={j}>{linha + "\n"}</span>;
                }
              })}
            </pre>

            {respondidas[i] && (
              <div className={`feedback ${respostas[i].every((v, j) => v === corretas[i][j]) ? "correct" : "incorrect"}`}>
                {respostas[i].every((v, j) => v === corretas[i][j]) ? "Correto!" : "Resposta incorreta. (sem nova tentativa)"}
              </div>
            )}

            {!respondidas[i] && (
              <button className="btn-verificar" onClick={() => verificar(i)}>Verificar</button>
            )}
          </div>
        );
      })}

      {finalizado && (
        <div className="final-score">
          {msg} Sua nota final é {pontuacao}/{total} ({porcentagem}%).
          {salvo && <p style={{ fontSize: "0.9rem", color: "green", marginTop: "5px" }}>Nota salva com sucesso!</p>}
        </div>
      )}

      <div className="navigation-links">
      <Link to="/desafios/Tecnologia/DesafioTec2" className="back-link">
          Voltar
          <img src="/flecha1.png" alt="Voltar" className="logo-img" />
      </Link>

        <Link to="/desafios/CapitulosTecnologia" className="menu-link">
          <img src="/azulejos.png" alt="Menu" className="logo-img" />
        </Link>


        <Link to="/desafios/Tecnologia/DesafioTec4" className="next-link">
          Próximo
          <img src="/flecha2.png" alt="Próximo" className="logo-img" />
        </Link>
      </div>

    </div>
  );
}