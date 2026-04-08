import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './QuizPlayer.css';

import { db, auth } from '../../../FirebaseConfig';
import { onAuthStateChanged } from "firebase/auth"; 
import { 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";

// 🔥 IMPORTAÇÃO DA IA
import { GoogleGenerativeAI } from "@google/generative-ai";

// 🧠 FUNÇÃO AUXILIAR PARA CHAMAR A IA COM FEEDBACK DETALHADO
const avaliarRespostaComIA = async (pergunta, esperada, respostaAluno) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Falta a VITE_GEMINI_API_KEY no .env");
    return { correta: false, feedback: "A API da IA não está configurada no sistema." };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Atue como um professor empático e especialista avaliando a resposta dissertativa de um aluno.
      
      Pergunta feita: "${pergunta}"
      Gabarito esperado (conceito correto): "${esperada}"
      Resposta do aluno: "${respostaAluno}"

      Analise a resposta do aluno considerando o conceito do gabarito. 
      
      Regras obrigatórias para o feedback:
      1. Se o aluno ACERTOU (mesmo usando outras palavras, desde que a essência esteja correta): Dê os parabéns, confirme que ele acertou e explique brevemente o porquê de estar correto, reforçando o aprendizado.
      2. Se o aluno ERROU ou respondeu algo INCOMPLETO: Explique de forma didática o que está errado ou o que faltou, justifique o motivo e diga explicitamente qual seria a resposta correta de acordo com o gabarito.

      Retorne APENAS um objeto JSON válido (sem formatação markdown como \`\`\`json), com o seguinte formato exato:
      {
        "correta": true ou false,
        "feedback": "O seu texto de feedback aqui, seguindo as regras acima."
      }
    `;

    const result = await model.generateContent(prompt);
    const textoLimpo = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(textoLimpo);
  } catch (error) {
    console.error("Erro na avaliação da IA:", error);
    return { correta: false, feedback: "Houve uma instabilidade ao conectar com a inteligência artificial para corrigir a sua resposta. Consulte o professor." };
  }
};

export default function QuizPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [desafio, setDesafio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de Histórico
  const [tentativasUsadas, setTentativasUsadas] = useState(0);
  const [melhorNotaAnterior, setMelhorNotaAnterior] = useState(0);
  
  const [modoRevisao, setModoRevisao] = useState(false);

  // Estados do Jogo
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState({});
  const [feedbacksIA, setFeedbacksIA] = useState({}); 
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [notaAtual, setNotaAtual] = useState(0);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!id) return;
      
      if (user) {
        try {
          setLoading(true);

          const docRef = doc(db, "desafios", id);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            alert("Desafio não encontrado!");
            navigate('/desafios');
            return;
          }
          const dadosD = docSnap.data();
          setDesafio(dadosD);

          const scoreId = `${user.uid}_${id}`;
          const scoreRef = doc(db, "pontuacoes", scoreId);
          const scoreSnap = await getDoc(scoreRef);

          if (scoreSnap.exists()) {
            const dadosS = scoreSnap.data();
            
            const jaFeitas = Number(dadosS.tentativas) || 0;
            const limite = Number(dadosD.tentativasPermitidas) || 2;

            setTentativasUsadas(jaFeitas);
            setMelhorNotaAnterior(Number(dadosS.nota) || 0);

            if (dadosS.respostas) setRespostasUsuario(dadosS.respostas);
            if (dadosS.feedbacksIA) setFeedbacksIA(dadosS.feedbacksIA); 

            if (jaFeitas >= limite) {
              setModoRevisao(true);
            } else {
              setModoRevisao(false);
            }
          } else {
            setTentativasUsadas(0);
            setMelhorNotaAnterior(0);
            setModoRevisao(false);
          }
        } catch (error) {
          console.error("Erro ao carregar:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("A aguardar o carregamento da autenticação...");
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const lidarComResposta = (valor) => {
    if (modoRevisao) return; 
    setRespostasUsuario(prev => ({ ...prev, [indiceAtual]: valor }));
  };

  const proximaQuestao = () => {
    if (indiceAtual < desafio.questoes.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    } else {
      if (modoRevisao) {
        navigate('/desafios'); 
      } else {
        calcularESalvarResultado(); 
      }
    }
  };

  const voltarQuestao = () => {
    if (indiceAtual > 0) setIndiceAtual(indiceAtual - 1);
  };

  const calcularESalvarResultado = async () => {
    setSalvando(true);
    let acertos = 0;
    let novosFeedbacksIA = {}; 
    
    // AVALIAÇÃO INTELIGENTE
    for (let index = 0; index < desafio.questoes.length; index++) {
      const q = desafio.questoes[index];
      const respostaAluno = respostasUsuario[index];

      // Verificação case-insensitive
      if (q.tipo && q.tipo.toLowerCase() === 'dissertativa') {
        if (respostaAluno && respostaAluno.trim().length > 0) {
          const analise = await avaliarRespostaComIA(q.perguntaTexto, q.respostaEsperada, respostaAluno);
          if (analise.correta) acertos++;
          novosFeedbacksIA[index] = analise.feedback;
        } else {
          novosFeedbacksIA[index] = "Nenhuma resposta foi enviada pelo aluno. Aconselhamos que tente formular uma resposta teórica da próxima vez.";
        }
      } else {
        if (respostaAluno === q.alternativaCorreta) acertos++;
      }
    }

    setNotaAtual(acertos);
    
    if (!auth.currentUser) {
      setSalvando(false);
      return;
    }

    try {
      const scoreId = `${auth.currentUser.uid}_${id}`;
      const scoreRef = doc(db, "pontuacoes", scoreId);
      
      let notaHistoricaNoBanco = 0;
      let tentativasHistoricasNoBanco = 0;
      let respostasHistoricasNoBanco = {};
      let feedbacksHistoricosNoBanco = {};

      try {
        const scoreSnap = await getDocFromServer(scoreRef);
        if (scoreSnap.exists()) {
            const dadosBanco = scoreSnap.data();
            notaHistoricaNoBanco = Number(dadosBanco.nota) || 0;
            tentativasHistoricasNoBanco = Number(dadosBanco.tentativas) || 0;
            respostasHistoricasNoBanco = dadosBanco.respostas || {};
            feedbacksHistoricosNoBanco = dadosBanco.feedbacksIA || {};
        }
      } catch (cacheError) {
        const fallbackSnap = await getDoc(scoreRef);
        if (fallbackSnap.exists()) {
            const dadosBanco = fallbackSnap.data();
            notaHistoricaNoBanco = Number(dadosBanco.nota) || 0;
            tentativasHistoricasNoBanco = Number(dadosBanco.tentativas) || 0;
            respostasHistoricasNoBanco = dadosBanco.respostas || {};
            feedbacksHistoricosNoBanco = dadosBanco.feedbacksIA || {};
        }
      }
      
      const novaContagem = tentativasHistoricasNoBanco + 1;
      
      let notaDefinitiva = acertos;
      let respostasDefinitivas = respostasUsuario; 
      let feedbacksDefinitivos = novosFeedbacksIA;

      if (notaHistoricaNoBanco > acertos) {
          notaDefinitiva = notaHistoricaNoBanco;
          if (Object.keys(respostasHistoricasNoBanco).length > 0) {
              respostasDefinitivas = respostasHistoricasNoBanco;
              feedbacksDefinitivos = feedbacksHistoricosNoBanco; 
          }
      }

      await setDoc(scoreRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        nome: auth.currentUser.displayName || "Utilizador",
        desafioId: id,
        desafio: desafio.titulo || "Desafio",
        categoria: desafio.area || "Geral",
        nota: notaDefinitiva,     
        ultimaNota: acertos,      
        respostas: respostasDefinitivas, 
        feedbacksIA: feedbacksDefinitivos, 
        total: desafio.questoes.length,
        tentativas: novaContagem,
        data: serverTimestamp()
      }, { merge: true });
      
      setTentativasUsadas(novaContagem);
      setMelhorNotaAnterior(notaDefinitiva); 
      setRespostasUsuario(respostasDefinitivas); 
      setFeedbacksIA(feedbacksDefinitivos);
      setMostrarResultado(true); 

    } catch (error) {
      console.error("Erro fatal ao salvar o progresso:", error);
      alert("Houve um erro ao guardar o teu progresso.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div className="quiz-loading">A carregar os dados...</div>;
  if (!desafio) return <div className="quiz-error">Desafio não carregado.</div>;

  const questaoAtual = desafio.questoes[indiceAtual];

  if (mostrarResultado) {
    const limite = Number(desafio.tentativasPermitidas) || 2;
    const esgotouTentativas = tentativasUsadas >= limite;

    return (
      <div className="quiz-bg">
        <div className="quiz-container resultado-container">
          <h1>Desafio Finalizado!</h1>
          
          <div className="score-circle">{melhorNotaAnterior} / {desafio.questoes.length}</div>
          
          <div style={{ margin: '15px 0', fontSize: '16px', color: '#555' }}>
            <p>Nota desta tentativa: <strong>{notaAtual}</strong></p>
            <p style={{ color: '#10B981', fontWeight: 'bold' }}>A tua melhor nota registada: {melhorNotaAnterior}</p>
          </div>

          <p>Completaste {tentativasUsadas} de {limite} tentativas.</p>
          
          <div style={{ marginTop: '30px', maxHeight: '400px', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Resumo da Tentativa:</h3>
            {desafio.questoes.map((questao, index) => {
              const respostaAluno = respostasUsuario[index];
              const respondeuAlgo = respostaAluno !== undefined;
              const feedbackIA = feedbacksIA[index];

              // 🔥 SOLUÇÃO: A dissertativa mostra SEMPRE o feedback da IA, independentemente de ter esgotado as tentativas!
              if (questao.tipo && questao.tipo.toLowerCase() === 'dissertativa') {
                return (
                  <div key={index} style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #0EA5E9', backgroundColor: '#F0F9FF' }}>
                    <div style={{ marginBottom: '8px' }}><strong style={{ color: '#0369A1' }}>Questão {index + 1} (Avaliação da IA):</strong></div>
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong>Pergunta:</strong> {questao.perguntaTexto}</p>
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#333' }}><strong>A tua resposta:</strong> <span style={{ color: '#374151' }}>{respostaAluno || "Em branco"}</span></p>
                    
                    {/* AQUI ESTÁ A CORREÇÃO: Removi a limitação 'esgotouTentativas' */}
                    {feedbackIA && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#E0F2FE', borderRadius: '6px' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#0284C7' }}><strong>🤖 Professor IA diz:</strong> {feedbackIA}</p>
                      </div>
                    )}
                  </div>
                );
              }

              // Múltipla escolha clássica (Continua a esconder o gabarito até esgotar as tentativas)
              const estaCorreta = respostaAluno === questao.alternativaCorreta;
              const textoResposta = questao.alternativas?.[respostaAluno]?.texto || "Não respondida";
              const textoCorreta = questao.alternativas?.[questao.alternativaCorreta]?.texto;

              if (!esgotouTentativas) {
                return (
                  <div key={index} style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
                    <div style={{ marginBottom: '8px' }}><strong style={{ color: '#333' }}>Questão {index + 1}:</strong></div>
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong>Pergunta:</strong> {questao.perguntaTexto}</p>
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#333' }}><strong>A tua resposta:</strong> <span style={{ color: '#374151' }}>{respostaAluno ? `${respostaAluno.toUpperCase()}) ${textoResposta}` : 'Não respondida'}</span></p>
                  </div>
                );
              }

              return (
                <div key={index} style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', border: (respondeuAlgo && estaCorreta) ? '2px solid #10B981' : '2px solid #EF4444', backgroundColor: (respondeuAlgo && estaCorreta) ? '#F0FDF4' : '#FEF2F2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{estaCorreta ? '✓' : '✗'}</span>
                    <strong style={{ color: '#333' }}>Questão {index + 1}:</strong>
                    <span style={{ fontSize: '14px', color: estaCorreta ? '#10B981' : '#EF4444' }}>{estaCorreta ? 'Acertaste!' : 'Erraste'}</span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}><strong>Pergunta:</strong> {questao.perguntaTexto}</p>
                  <p style={{ margin: '8px 0', fontSize: '14px', color: '#333' }}><strong>A tua resposta:</strong> <span style={{ color: estaCorreta ? '#10B981' : '#EF4444' }}>{respostaAluno ? `${respostaAluno.toUpperCase()}) ${textoResposta}` : 'Em branco'}</span></p>
                  {!estaCorreta && (
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#10B981' }}><strong>Gabarito Correto:</strong> {questao.alternativaCorreta?.toUpperCase()}) {textoCorreta}</p>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="resultado-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
              {esgotouTentativas ? (
                <button className="btn-restart" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} onClick={() => { setMostrarResultado(false); setModoRevisao(true); setIndiceAtual(0); }}>
                  Aceder ao Modo Revisão
                </button>
              ) : (
                <button className="btn-restart" style={{ backgroundColor: '#2d72d9', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} onClick={() => window.location.reload()}>
                  Repetir tentativa do exercício
                </button>
              )}
              <Link to="/desafios" className="btn-sair" style={{ textDecoration: 'none', color: '#666', padding: '12px 20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                Voltar ao Menu
              </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-bg">
      <div className="quiz-container">
        <div className="quiz-header">
          <span className="quiz-badge">{modoRevisao ? "MODO REVISÃO" : desafio.area}</span>
          <span className="quiz-counter">Questão {indiceAtual + 1} / {desafio.questoes.length}</span>
        </div>

        <h2 className="pergunta-texto">{questaoAtual.perguntaTexto}</h2>

        {questaoAtual.tipo && questaoAtual.tipo.toLowerCase() === 'dissertativa' ? (
          <div className="area-dissertativa">
            <textarea
              value={respostasUsuario[indiceAtual] || ''}
              onChange={(e) => lidarComResposta(e.target.value)}
              disabled={modoRevisao}
              placeholder={modoRevisao ? "A tua resposta enviada:" : "Desenvolve a tua resposta aqui..."}
              style={{
                width: '100%', minHeight: '120px', padding: '15px', borderRadius: '8px', 
                border: '2px solid #ccc', fontSize: '16px', outline: 'none', 
                fontFamily: 'inherit', resize: 'vertical'
              }}
            />
            {modoRevisao && feedbacksIA[indiceAtual] && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#E0F2FE', borderLeft: '4px solid #0EA5E9', borderRadius: '4px' }}>
                 <p style={{ color: '#0369A1', margin: 0, fontWeight: 'bold' }}>🤖 Professor IA diz:</p>
                 <p style={{ color: '#0284C7', margin: '5px 0 0 0' }}>{feedbacksIA[indiceAtual]}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="alternativas-grid">
            {['a', 'b', 'c', 'd'].map((letra) => {
              const opcao = questaoAtual.alternativas?.[letra];
              if (!opcao?.texto) return null;

              let classeFeedback = '';
              
              if (modoRevisao) {
                const isCorreta = questaoAtual.alternativaCorreta === letra;
                const isSelecionada = respostasUsuario[indiceAtual] === letra;
                if (isCorreta) classeFeedback = 'opcao-correta';
                else if (isSelecionada && !isCorreta) classeFeedback = 'opcao-errada';
              } else {
                if (respostasUsuario[indiceAtual] === letra) classeFeedback = 'selecionada';
              }

              return (
                <div key={letra} className={`alternativa-card ${classeFeedback}`} onClick={() => lidarComResposta(letra)} style={{ cursor: modoRevisao ? 'default' : 'pointer' }}>
                  <div className="letra-bolinha">{letra.toUpperCase()}</div>
                  <div className="texto-opcao">{opcao.texto}</div>
                </div>
              );
            })}
          </div>
        )}

        {modoRevisao && (!questaoAtual.tipo || questaoAtual.tipo.toLowerCase() !== 'dissertativa') && respostasUsuario[indiceAtual] && respostasUsuario[indiceAtual] !== questaoAtual.alternativaCorreta && (
           <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', borderRadius: '4px' }}>
             <p style={{ color: '#B91C1C', margin: 0, fontWeight: 'bold' }}>Resposta Incorreta selecionada! <br></br>A alternativa correta é a letra {questaoAtual.alternativaCorreta?.toUpperCase()}.</p>
           </div>
        )}

        {modoRevisao && (!questaoAtual.tipo || questaoAtual.tipo.toLowerCase() !== 'dissertativa') && !respostasUsuario[indiceAtual] && (
           <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#F0FDF4', borderLeft: '4px solid #10B981', borderRadius: '4px' }}>
             <p style={{ color: '#047857', margin: 0, fontWeight: 'bold' }}>Gabarito: A alternativa correta é a letra {questaoAtual.alternativaCorreta?.toUpperCase()}.</p>
           </div>
        )}

        {modoRevisao && (!questaoAtual.tipo || questaoAtual.tipo.toLowerCase() !== 'dissertativa') && (
          <div className="caixa-justificativa" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px' }}>
            <h3 style={{ color: '#92400E' }}>💡 Justificativa:</h3>
            <p style={{ color: '#4B5563', whiteSpace: 'pre-wrap' }}>{questaoAtual.respostaEsperada || "Nenhum comentário disponível."}</p>
          </div>
        )}

        <div className="quiz-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-voltar" onClick={voltarQuestao} disabled={indiceAtual === 0}>Anterior</button>
          
          <button className="btn-proximo" onClick={proximaQuestao} disabled={!modoRevisao && !respostasUsuario[indiceAtual] && !salvando}>
            {indiceAtual === desafio.questoes.length - 1 ? (modoRevisao ? "Sair da Revisão" : (salvando ? "A IA está a avaliar..." : "Finalizar")) : "Próxima"}
          </button>
        </div>
      </div>
    </div>
  );
}