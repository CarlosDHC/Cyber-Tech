import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './QuizPlayer.css';

import { db, auth } from '../../../FirebaseConfig';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";

export default function QuizPlayer() {
  const { id } = useParams();
  
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

  // 1. Carregar o Desafio do Firebase
  useEffect(() => {
    const carregarDesafio = async () => {
      try {
        const docRef = doc(db, "desafios", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDesafio(docSnap.data());
        } else {
          alert("Desafio não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDesafio();
  }, [id]);

  // 2. Checar Histórico e Definir Modo
  useEffect(() => {
    const checarHistorico = async () => {
      if (!auth.currentUser || !id || !desafio) return;

      try {
        const scoreId = `${auth.currentUser.uid}_${id}`;
        const scoreRef = doc(db, "pontuacoes", scoreId);
        const scoreSnap = await getDoc(scoreRef);

        let tentativasFeitas = 0;
        if (scoreSnap.exists()) {
          const dados = scoreSnap.data();
          tentativasFeitas = dados.tentativas || 0;
          setTentativasUsadas(tentativasFeitas);
          setMelhorNotaAnterior(dados.nota || 0);
        }

        // Bloqueio após 2 tentativas
        const limite = desafio.tentativasPermitidas || 2;
        if (tentativasFeitas >= limite) {
          setModoRevisao(true);
        }
      } catch (error) {
        console.error("Erro ao verificar histórico:", error);
      }
    };

    checarHistorico();
  }, [id, desafio]);

  const selecionarOpcao = (letra) => {
    if (modoRevisao) return;
    setRespostasUsuario({ ...respostasUsuario, [indiceAtual]: letra });
  };

  const proximaQuestao = () => {
    if (indiceAtual < desafio.questoes.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    } else {
      if (modoRevisao) {
        setIndiceAtual(0); // Reinicia o índice para sair ou rever
        return;
      }
      calcularESalvarResultado();
    }
  };

  const voltarQuestao = () => {
    if (indiceAtual > 0) setIndiceAtual(indiceAtual - 1);
  };

  const calcularESalvarResultado = async () => {
    setSalvando(true);
    let acertos = 0;
    
    desafio.questoes.forEach((q, index) => {
      if (respostasUsuario[index] === q.alternativaCorreta) acertos++;
    });

    setNotaAtual(acertos);
    setMostrarResultado(true);

    if (auth.currentUser) {
      try {
        const scoreId = `${auth.currentUser.uid}_${id}`;
        const scoreRef = doc(db, "pontuacoes", scoreId);
        const notaFinal = Math.max(acertos, melhorNotaAnterior);

        await setDoc(scoreRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          nome: auth.currentUser.displayName || "Usuário",
          desafioId: id,
          desafio: desafio.titulo || "Desafio",
          categoria: desafio.area || "Geral",
          nota: notaFinal,
          ultimaNota: acertos,
          total: desafio.questoes.length,
          tentativas: tentativasUsadas + 1,
          data: serverTimestamp()
        }, { merge: true });
        
        setTentativasUsadas(prev => prev + 1);
        setMelhorNotaAnterior(notaFinal);
      } catch (error) {
        console.error("Erro ao salvar:", error);
      } finally {
        setSalvando(false);
      }
    }
  };

  // --- PROTEÇÃO DE CARREGAMENTO (Evita o erro "desafio is not defined") ---
  if (loading) return <div className="quiz-loading">Carregando...</div>;
  if (!desafio || !desafio.questoes) return <div className="quiz-error">Desafio indisponível.</div>;

  const questaoAtual = desafio.questoes[indiceAtual];

  if (mostrarResultado) {
    return (
      <div className="quiz-container resultado-container">
        <h1>Tentativas Esgotadas</h1>
        <div className="score-circle">{notaAtual} / {desafio.questoes.length}</div>
        <div className="resultado-actions">
           <button className="btn-restart" style={{backgroundColor: '#F59E0B'}} onClick={() => { setMostrarResultado(false); setModoRevisao(true); setIndiceAtual(0); }}>
              Ver Gabarito e Justificativas
           </button>
           <Link to="/desafios" className="btn-sair">Sair</Link>
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
        {questaoAtual.perguntaImagem && <img src={questaoAtual.perguntaImagem} alt="Questão" className="pergunta-img" />}

        {/* MODO REVISÃO: Esconde as alternativas interativas e mostra apenas a justificativa */}
        {modoRevisao ? (
          <div className="caixa-justificativa" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, color: '#92400E' }}>💡 Justificativa:</h3>
            <p style={{ color: '#4B5563', whiteSpace: 'pre-wrap' }}>
              {questaoAtual.respostaEsperada || "Nenhum comentário disponível para esta questão."}
            </p>
            {questaoAtual.alternativaCorreta && (
              <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#166534' }}>
                Resposta correta: Alternativa {questaoAtual.alternativaCorreta.toUpperCase()}
              </p>
            )}
          </div>
        ) : (
          /* MODO JOGO: Mostra as alternativas para clicar */
          <div className="alternativas-grid">
            {['a', 'b', 'c', 'd'].map((letra) => {
              const opcao = questaoAtual.alternativas[letra];
              if (!opcao || !opcao.texto) return null;
              return (
                <div 
                  key={letra} 
                  className={`alternativa-card ${respostasUsuario[indiceAtual] === letra ? 'selecionada' : ''}`} 
                  onClick={() => selecionarOpcao(letra)}
                >
                  <div className="letra-bolinha">{letra.toUpperCase()}</div>
                  <div className="texto-opcao">{opcao.texto}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="quiz-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-voltar" onClick={voltarQuestao} disabled={indiceAtual === 0}>Anterior</button>
          <button className="btn-proximo" onClick={proximaQuestao}>
            {indiceAtual === desafio.questoes.length - 1 ? (modoRevisao ? "Sair" : "Finalizar") : "Próxima"}
          </button>
        </div>
      </div>
    </div>
  );
}