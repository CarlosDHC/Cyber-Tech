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
  // --- HOOKS E PARAMS ---
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- ESTADOS: DADOS E LOADING ---
  const [desafio, setDesafio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // --- ESTADOS: HISTÓRICO DO USUÁRIO ---
  const [tentativasUsadas, setTentativasUsadas] = useState(0);
  const [melhorNotaAnterior, setMelhorNotaAnterior] = useState(0);
  const [modoRevisao, setModoRevisao] = useState(false);

  // --- ESTADOS: CONTROLE DO JOGO ATUAL ---
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState({}); // { 0: 'a', 1: 'c', ... }
  const [notaAtual, setNotaAtual] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);


  // --- 1. CARREGAMENTO INICIAL (Desafio + Pontuação Anterior) ---
  useEffect(() => {
    const carregarDados = async () => {
      if (!id || !auth.currentUser) return;
      
      try {
        setLoading(true);

        // A) Busca os dados do Desafio
        const docRef = doc(db, "desafios", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Desafio não encontrado!");
          navigate('/desafios');
          return;
        }
        
        const dadosDesafio = docSnap.data();
        setDesafio(dadosDesafio);

        // B) Busca o Histórico de Pontuação do Usuário
        // ID composto para garantir unicidade por usuário e desafio
        const scoreId = `${auth.currentUser.uid}_${id}`; 
        const scoreRef = doc(db, "pontuacoes", scoreId);
        const scoreSnap = await getDoc(scoreRef);

        if (scoreSnap.exists()) {
          const dadosScore = scoreSnap.data();
          const jaFeitas = dadosScore.tentativas || 0;
          const limite = dadosDesafio.tentativasPermitidas || 2;

          setTentativasUsadas(jaFeitas);
          setMelhorNotaAnterior(dadosScore.nota || 0);

          // Se já esgotou as tentativas, entra direto em Modo Revisão
          if (jaFeitas >= limite) {
            setModoRevisao(true);
          } else {
            setModoRevisao(false);
          }
        } else {
          // Primeira vez jogando
          setTentativasUsadas(0);
          setModoRevisao(false);
        }

      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [id, navigate]);


  // --- 2. HANDLERS (AÇÕES DO USUÁRIO) ---

  const handleSelecaoOpcao = (letra) => {
    // No modo revisão (gabarito), não permite clicar
    if (modoRevisao) return; 
    setRespostasUsuario(prev => ({ ...prev, [indiceAtual]: letra }));
  };

  const handleProximaQuestao = () => {
    // Se não for a última, avança
    if (indiceAtual < desafio.questoes.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    } else {
      // Se for a última:
      if (modoRevisao) {
        navigate('/desafios'); // Sai do quiz
      } else {
        calcularESalvarResultado(); // Salva a tentativa
      }
    }
  };

  const handleQuestaoAnterior = () => {
    if (indiceAtual > 0) setIndiceAtual(indiceAtual - 1);
  };

  // --- 3. LÓGICA DE FINALIZAÇÃO E SALVAMENTO ---
  const calcularESalvarResultado = async () => {
    setSalvando(true);
    let acertos = 0;
    
    // Calcula Nota
    desafio.questoes.forEach((q, index) => {
      if (respostasUsuario[index] === q.alternativaCorreta) acertos++;
    });

    setNotaAtual(acertos);
    
    if (auth.currentUser) {
      try {
        const scoreId = `${auth.currentUser.uid}_${id}`;
        const scoreRef = doc(db, "pontuacoes", scoreId);
        
        const novaContagem = tentativasUsadas + 1;
        // Mantém a maior nota entre a atual e a histórica
        const notaFinal = Math.max(acertos, melhorNotaAnterior);

        // Atualiza no Firebase (usando setDoc com merge para não apagar outros campos se existirem)
        await setDoc(scoreRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          nome: auth.currentUser.displayName || "Usuário",
          desafioId: id,
          desafio: desafio.titulo || "Desafio",
          categoria: desafio.area || "Geral",
          nota: notaFinal,          // Melhor nota (para ranking)
          ultimaNota: acertos,      // Nota desta tentativa específica
          total: desafio.questoes.length,
          tentativas: novaContagem,
          data: serverTimestamp()
        }, { merge: true });
        
        setTentativasUsadas(novaContagem);
        setMostrarResultado(true); // Exibe tela de feedback
      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar progresso.");
      } finally {
        setSalvando(false);
      }
    }
  };

  // --- 4. RENDERIZAÇÃO: ESTADOS DE CARREGAMENTO ---
  if (loading) return <div className="quiz-loading">Carregando dados...</div>;
  if (!desafio) return <div className="quiz-error">Desafio não carregado.</div>;

  const questaoAtual = desafio.questoes[indiceAtual];


  // --- 5. RENDERIZAÇÃO: TELA DE RESULTADO FINAL ---
  if (mostrarResultado) {
    const limite = desafio.tentativasPermitidas || 2;
    const esgotouTentativas = tentativasUsadas >= limite;

    return (
      <div className="quiz-container resultado-container">
        <h1>Desafio Finalizado!</h1>
        
        <div className="score-circle">
          {notaAtual} / {desafio.questoes.length}
        </div>
        
        <p>Você utilizou {tentativasUsadas} de {limite} tentativas.</p>
        
        <div className="resultado-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            
            {esgotouTentativas ? (
              // CENÁRIO A: ACABARAM AS TENTATIVAS -> VER GABARITO
              <button 
                className="btn-restart" 
                style={{ 
                  backgroundColor: '#F59E0B', color: 'white', padding: '12px 20px', 
                  borderRadius: '8px', border: 'none', cursor: 'pointer' 
                }} 
                onClick={() => { 
                  setMostrarResultado(false); 
                  setModoRevisao(true); // Ativa modo gabarito
                  setIndiceAtual(0);    // Volta pra questão 1
                }}
              >
                Ver Gabarito e Justificativas
              </button>
            ) : (
              // CENÁRIO B: TEM TENTATIVAS -> TENTAR NOVAMENTE
              <button 
                className="btn-restart" 
                style={{ 
                  backgroundColor: '#2d72d9', color: 'white', padding: '12px 20px', 
                  borderRadius: '8px', border: 'none', cursor: 'pointer' 
                }} 
                onClick={() => window.location.reload()}
              >
                Repetir tentativa do exercício
              </button>
            )}

            <Link 
              to="/desafios" 
              className="btn-sair" 
              style={{ 
                textDecoration: 'none', color: '#666', padding: '12px 20px', 
                border: '1px solid #ccc', borderRadius: '8px' 
              }}
            >
              Voltar ao Menu
            </Link>
        </div>
      </div>
    );
  }

  // --- 6. RENDERIZAÇÃO: TELA DO JOGO (PERGUNTAS) ---
  return (
    <div className="quiz-bg">
      <div className="quiz-container">
        
        {/* CABEÇALHO */}
        <div className="quiz-header">
          <span className="quiz-badge">
            {modoRevisao ? "MODO REVISÃO" : desafio.area}
          </span>
          <span className="quiz-counter">
            Questão {indiceAtual + 1} / {desafio.questoes.length}
          </span>
        </div>

        {/* ENUNCIADO */}
        <h2 className="pergunta-texto">{questaoAtual.perguntaTexto}</h2>

        {/* CORPO DA QUESTÃO: REVISÃO VS JOGO */}
        {modoRevisao ? (
          // VISUALIZAÇÃO DE GABARITO (JUSTIFICATIVA)
          <div className="caixa-justificativa" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px' }}>
            <h3 style={{ color: '#92400E', marginTop: 0 }}>💡 Justificativa:</h3>
            <p style={{ color: '#4B5563', whiteSpace: 'pre-wrap' }}>
              {questaoAtual.respostaEsperada || "Nenhum comentário disponível para esta questão."}
            </p>
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #FDE68A' }}>
               <p style={{ fontWeight: 'bold', color: '#166534', margin: 0 }}>
                 Resposta correta: {questaoAtual.alternativaCorreta?.toUpperCase()}
               </p>
            </div>
          </div>
        ) : (
          // VISUALIZAÇÃO DE JOGO (ALTERNATIVAS CLICÁVEIS)
          <div className="alternativas-grid">
            {['a', 'b', 'c', 'd'].map((letra) => {
              const opcao = questaoAtual.alternativas?.[letra];
              
              // Proteção caso a alternativa esteja vazia no banco
              if (!opcao?.texto) return null;
              
              const selecionada = respostasUsuario[indiceAtual] === letra;

              return (
                <div 
                  key={letra} 
                  className={`alternativa-card ${selecionada ? 'selecionada' : ''}`} 
                  onClick={() => handleSelecaoOpcao(letra)}
                >
                  <div className="letra-bolinha">{letra.toUpperCase()}</div>
                  <div className="texto-opcao">{opcao.texto}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* RODAPÉ (BOTÕES DE NAVEGAÇÃO) */}
        <div className="quiz-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            className="btn-voltar" 
            onClick={handleQuestaoAnterior} 
            disabled={indiceAtual === 0}
          >
            Anterior
          </button>
          
          <button 
            className="btn-proximo" 
            onClick={handleProximaQuestao}
            disabled={!modoRevisao && !respostasUsuario[indiceAtual] && !salvando}
          >
            {/* Texto dinâmico do botão */}
            {indiceAtual === desafio.questoes.length - 1 
              ? (modoRevisao ? "Sair da Revisão" : (salvando ? "Salvando..." : "Finalizar")) 
              : "Próxima"}
          </button>
        </div>

      </div>
    </div>
  );
}