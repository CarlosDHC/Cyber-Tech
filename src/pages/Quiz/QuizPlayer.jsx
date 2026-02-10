import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

  // 1. Efeito único para carregar TUDO ao iniciar
  useEffect(() => {
    const inicializarDados = async () => {
      if (!id || !auth.currentUser) return;
      
      try {
        setLoading(true);

        // Busca o Desafio
        const docRef = doc(db, "desafios", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Desafio não encontrado!");
          navigate('/desafios');
          return;
        }
        const dadosD = docSnap.data();
        setDesafio(dadosD);

        // Busca a Pontuação
        const scoreId = `${auth.currentUser.uid}_${id}`;
        const scoreRef = doc(db, "pontuacoes", scoreId);
        const scoreSnap = await getDoc(scoreRef);

        if (scoreSnap.exists()) {
          const dadosS = scoreSnap.data();
          const jaFeitas = dadosS.tentativas || 0;
          const limite = dadosD.tentativasPermitidas || 2;

          setTentativasUsadas(jaFeitas);
          setMelhorNotaAnterior(dadosS.nota || 0);

          // SÓ ativa modo revisão se JÁ tiver completado o limite (ex: 2)
          if (jaFeitas >= limite) {
            setModoRevisao(true);
          } else {
            setModoRevisao(false); // Garante que começa como jogo
          }
        } else {
          // Se não existe documento, é a primeira tentativa absoluta
          setTentativasUsadas(0);
          setModoRevisao(false);
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    };

    inicializarDados();
  }, [id, navigate]);

  const selecionarOpcao = (letra) => {
    if (modoRevisao) return; // Trava interação no modo revisão
    setRespostasUsuario(prev => ({ ...prev, [indiceAtual]: letra }));
  };

  const proximaQuestao = () => {
    if (indiceAtual < desafio.questoes.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    } else {
      if (modoRevisao) {
        navigate('/desafios'); // Se era revisão, apenas sai
      } else {
        calcularESalvarResultado(); // Se era jogo, finaliza
      }
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
    
    if (auth.currentUser) {
      try {
        const scoreId = `${auth.currentUser.uid}_${id}`;
        const scoreRef = doc(db, "pontuacoes", scoreId);
        
        // Aumenta o contador atual
        const novaContagem = tentativasUsadas + 1;
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
          tentativas: novaContagem,
          data: serverTimestamp()
        }, { merge: true });
        
        setTentativasUsadas(novaContagem);
        setMostrarResultado(true); // Só mostra a tela de resultado após salvar com sucesso
      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar progresso.");
      } finally {
        setSalvando(false);
      }
    }
  };

  if (loading) return <div className="quiz-loading">Carregando dados...</div>;
  if (!desafio) return <div className="quiz-error">Desafio não carregado.</div>;

  const questaoAtual = desafio.questoes[indiceAtual];

  // Tela de Resultado após concluir uma tentativa
  if (mostrarResultado) {
    const limite = desafio.tentativasPermitidas || 2;
    return (
      <div className="quiz-container resultado-container">
        <h1>{tentativasUsadas >= limite ? "Chances Esgotadas" : "Desafio Finalizado!"}</h1>
        <div className="score-circle">{notaAtual} / {desafio.questoes.length}</div>
        <p>Você completou {tentativasUsadas} de {limite} tentativas.</p>
        <div className="resultado-actions">
           <button 
             className="btn-restart" 
             style={{backgroundColor: '#F59E0B'}} 
             onClick={() => { setMostrarResultado(false); setModoRevisao(true); setIndiceAtual(0); }}
           >
              Ver Gabarito e Justificativas
           </button>
           <Link to="/desafios" className="btn-sair">Voltar ao Menu</Link>
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

        {/* Lógica de exibição: Se for revisão, mostra texto. Se for jogo, mostra botões. */}
        {modoRevisao ? (
          <div className="caixa-justificativa" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px' }}>
            <h3 style={{ color: '#92400E' }}>💡 Justificativa:</h3>
            <p style={{ color: '#4B5563', whiteSpace: 'pre-wrap' }}>
              {questaoAtual.respostaEsperada || "Nenhum comentário disponível."}
            </p>
            <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#166534' }}>
              Resposta correta: {questaoAtual.alternativaCorreta?.toUpperCase()}
            </p>
          </div>
        ) : (
          <div className="alternativas-grid">
            {['a', 'b', 'c', 'd'].map((letra) => {
              const opcao = questaoAtual.alternativas?.[letra];
              if (!opcao?.texto) return null;
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
          <button 
            className="btn-proximo" 
            onClick={proximaQuestao}
            disabled={!modoRevisao && !respostasUsuario[indiceAtual] && !salvando}
          >
            {indiceAtual === desafio.questoes.length - 1 
              ? (modoRevisao ? "Sair da Revisão" : (salvando ? "Salvando..." : "Finalizar")) 
              : "Próxima"}
          </button>
        </div>
      </div>
    </div>
  );
}