import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './QuizPlayer.css';

import { db, auth } from '../../../FirebaseConfig';
import { onAuthStateChanged } from "firebase/auth"; 
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";

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
            
            // Força a coversão para garantir que lidamos sempre com números
            const jaFeitas = parseInt(dadosS.tentativas) || 0;
            const limite = parseInt(dadosD.tentativasPermitidas) || 2;

            setTentativasUsadas(jaFeitas);
            setMelhorNotaAnterior(parseInt(dadosS.nota) || 0);

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

  const selecionarOpcao = (letra) => {
    if (modoRevisao) return; 
    setRespostasUsuario(prev => ({ ...prev, [indiceAtual]: letra }));
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
    
    // Calcula quantos acertos o utilizador teve agora
    desafio.questoes.forEach((q, index) => {
      if (respostasUsuario[index] === q.alternativaCorreta) acertos++;
    });

    setNotaAtual(acertos);
    
    if (auth.currentUser) {
      try {
        const scoreId = `${auth.currentUser.uid}_${id}`;
        const scoreRef = doc(db, "pontuacoes", scoreId);
        
        // 1. Consulta o banco AGORA, imediatamente antes de salvar
        const scoreSnap = await getDoc(scoreRef);
        let notaHistoricaNoBanco = 0;
        let tentativasHistoricasNoBanco = 0;

        if (scoreSnap.exists()) {
            const dadosBanco = scoreSnap.data();
            // 🔥 FORÇA O VALOR A SER UM NÚMERO (Resolve o problema das notas antigas salvas como texto)
            notaHistoricaNoBanco = parseInt(dadosBanco.nota) || 0;
            tentativasHistoricasNoBanco = parseInt(dadosBanco.tentativas) || 0;
        }
        
        const novaContagem = tentativasHistoricasNoBanco + 1;
        
        // 2. LÓGICA BLINDADA: A nota final só será a histórica se ela for MAIOR que a de agora
        let notaFinal = acertos; // Por defeito, é a nota de agora
        if (notaHistoricaNoBanco > acertos) {
            notaFinal = notaHistoricaNoBanco; // Se a antiga for maior, a antiga vence
        }

        // 3. Salva a decisão no banco
        await setDoc(scoreRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          nome: auth.currentUser.displayName || "Utilizador",
          desafioId: id,
          desafio: desafio.titulo || "Desafio",
          categoria: desafio.area || "Geral",
          nota: notaFinal, // 🔥 SALVA SEMPRE A MAIOR NOTA
          ultimaNota: acertos, // Salva a nota desta tentativa atual separada
          total: desafio.questoes.length,
          tentativas: novaContagem,
          data: serverTimestamp()
        }, { merge: true });
        
        setTentativasUsadas(novaContagem);
        setMelhorNotaAnterior(notaFinal); 
        setMostrarResultado(true); 
      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao guardar o teu progresso.");
      } finally {
        setSalvando(false);
      }
    }
  };

  if (loading) return <div className="quiz-loading">A carregar os dados...</div>;
  if (!desafio) return <div className="quiz-error">Desafio não carregado.</div>;

  const questaoAtual = desafio.questoes[indiceAtual];

  if (mostrarResultado) {
    const limite = parseInt(desafio.tentativasPermitidas) || 2;
    const esgotouTentativas = tentativasUsadas >= limite;

    return (
      <div className="quiz-bg">
        <div className="quiz-container resultado-container">
          <h1>Desafio Finalizado!</h1>
          
          {/* Círculo exibe a melhor nota */}
          <div className="score-circle">{melhorNotaAnterior} / {desafio.questoes.length}</div>
          
          <div style={{ margin: '15px 0', fontSize: '16px', color: '#555' }}>
            <p>Nota desta tentativa: <strong>{notaAtual}</strong></p>
            <p style={{ color: '#10B981', fontWeight: 'bold' }}>A tua melhor nota registada: {melhorNotaAnterior}</p>
          </div>

          <p>Completaste {tentativasUsadas} de {limite} tentativas.</p>
          
          {/* SECÇÃO DE FEEDBACK DAS RESPOSTAS */}
          <div style={{ marginTop: '30px', maxHeight: '400px', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>As tuas Respostas:</h3>
            {desafio.questoes.map((questao, index) => {
              const respostaAluno = respostasUsuario[index];
              const estaCorreta = respostaAluno === questao.alternativaCorreta;
              const textoResposta = questao.alternativas?.[respostaAluno]?.texto || "Não respondida";
              const textoCorreta = questao.alternativas?.[questao.alternativaCorreta]?.texto;

              // Só revelar o gabarito quando as tentativas esgotarem
              if (!esgotouTentativas) {
                return (
                  <div 
                    key={index}
                    style={{
                      marginBottom: '15px',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#333' }}>Questão {index + 1}:</strong>
                    </div>

                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
                      <strong>Pergunta:</strong> {questao.perguntaTexto}
                    </p>

                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#333' }}>
                      <strong>A tua resposta:</strong> <span style={{ color: '#374151' }}>
                        {respostaAluno ? `${respostaAluno.toUpperCase()}) ${textoResposta}` : 'Não respondida'}
                      </span>
                    </p>
                  </div>
                );
              }

              // Gabarito com destaque quando as tentativas esgotaram
              return (
                <div 
                  key={index} 
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    borderRadius: '8px',
                    border: estaCorreta ? '2px solid #10B981' : '2px solid #EF4444',
                    backgroundColor: estaCorreta ? '#F0FDF4' : '#FEF2F2'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>
                      {estaCorreta ? '✓' : '✗'}
                    </span>
                    <strong style={{ color: '#333' }}>Questão {index + 1}:</strong>
                    <span style={{ fontSize: '14px', color: estaCorreta ? '#10B981' : '#EF4444' }}>
                      {estaCorreta ? 'Acertaste!' : 'Erraste'}
                    </span>
                  </div>
                  
                  <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
                    <strong>Pergunta:</strong> {questao.perguntaTexto}
                  </p>
                  
                  <p style={{ margin: '8px 0', fontSize: '14px', color: '#333' }}>
                    <strong>A tua resposta:</strong> <span style={{ color: estaCorreta ? '#10B981' : '#EF4444' }}>
                      {respostaAluno?.toUpperCase()}) {textoResposta}
                    </span>
                  </p>
                  
                  {!estaCorreta && (
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#10B981' }}>
                      <strong>Resposta correta:</strong> {questao.alternativaCorreta?.toUpperCase()}) {textoCorreta}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="resultado-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
              
              {esgotouTentativas ? (
                <button 
                  className="btn-restart" 
                  style={{ backgroundColor: '#F59E0B', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} 
                  onClick={() => { setMostrarResultado(false); setModoRevisao(true); setIndiceAtual(0); }}
                >
                  Ver Gabarito e Justificativas
                </button>
              ) : (
                <button 
                  className="btn-restart" 
                  style={{ backgroundColor: '#2d72d9', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} 
                  onClick={() => window.location.reload()}
                >
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

        {/* Renderiza as alternativas */}
        <div className="alternativas-grid">
          {['a', 'b', 'c', 'd'].map((letra) => {
            const opcao = questaoAtual.alternativas?.[letra];
            if (!opcao?.texto) return null;

            let classeFeedback = '';
            
            if (modoRevisao) {
              const isCorreta = questaoAtual.alternativaCorreta === letra;
              const isSelecionada = respostasUsuario[indiceAtual] === letra;

              if (isCorreta) {
                classeFeedback = 'opcao-correta'; // Verde
              } else if (isSelecionada && !isCorreta) {
                classeFeedback = 'opcao-errada'; // Vermelho
              }
            } else {
              if (respostasUsuario[indiceAtual] === letra) {
                classeFeedback = 'selecionada';
              }
            }

            return (
              <div 
                key={letra} 
                className={`alternativa-card ${classeFeedback}`} 
                onClick={() => selecionarOpcao(letra)}
                style={{ cursor: modoRevisao ? 'default' : 'pointer' }}
              >
                <div className="letra-bolinha">{letra.toUpperCase()}</div>
                <div className="texto-opcao">{opcao.texto}</div>
              </div>
            );
          })}
        </div>

        {/* Mensagem de alerta se errar a questão na revisão */}
        {modoRevisao && respostasUsuario[indiceAtual] !== questaoAtual.alternativaCorreta && (
           <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', borderRadius: '4px' }}>
             <p style={{ color: '#B91C1C', margin: 0, fontWeight: 'bold' }}>
               Resposta Incorreta! A alternativa correta era a letra {questaoAtual.alternativaCorreta?.toUpperCase()}.
             </p>
           </div>
        )}

        {/* Caixa de Justificativa */}
        {modoRevisao && (
          <div className="caixa-justificativa" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px' }}>
            <h3 style={{ color: '#92400E' }}>💡 Justificativa:</h3>
            <p style={{ color: '#4B5563', whiteSpace: 'pre-wrap' }}>
              {questaoAtual.respostaEsperada || "Nenhum comentário disponível."}
            </p>
          </div>
        )}

        <div className="quiz-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-voltar" onClick={voltarQuestao} disabled={indiceAtual === 0}>Anterior</button>
          <button 
            className="btn-proximo" 
            onClick={proximaQuestao}
            disabled={!modoRevisao && !respostasUsuario[indiceAtual] && !salvando}
          >
            {indiceAtual === desafio.questoes.length - 1 
              ? (modoRevisao ? "Sair da Revisão" : (salvando ? "A guardar..." : "Finalizar")) 
              : "Próxima"}
          </button>
        </div>
      </div>
    </div>
  );
}