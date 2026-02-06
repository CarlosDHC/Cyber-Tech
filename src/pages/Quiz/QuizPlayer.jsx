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

  // Estados de Tentativas e Melhor Nota
  const [tentativasUsadas, setTentativasUsadas] = useState(0);
  const [melhorNotaAnterior, setMelhorNotaAnterior] = useState(0);
  const [verificandoTentativas, setVerificandoTentativas] = useState(true);

  // Estados do Jogo
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [notaAtual, setNotaAtual] = useState(0);
  const [salvando, setSalvando] = useState(false);

  // 1. Carregar o Desafio
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

  // 2. Checar Histórico (Tentativas e Nota)
  useEffect(() => {
    const checarHistorico = async () => {
      if (!auth.currentUser || !id) return;

      try {
        const scoreId = `${auth.currentUser.uid}_${id}`;
        const scoreRef = doc(db, "pontuacoes", scoreId);
        const scoreSnap = await getDoc(scoreRef);

        if (scoreSnap.exists()) {
          const dados = scoreSnap.data();
          setTentativasUsadas(dados.tentativas || 0);
          setMelhorNotaAnterior(dados.nota || 0);
        } else {
          setTentativasUsadas(0);
          setMelhorNotaAnterior(0);
        }
      } catch (error) {
        console.error("Erro ao verificar histórico:", error);
      } finally {
        setVerificandoTentativas(false);
      }
    };

    checarHistorico();
  }, [id]);

  const selecionarOpcao = (letra) => {
    setRespostasUsuario({ ...respostasUsuario, [indiceAtual]: letra });
  };

  const proximaQuestao = () => {
    if (indiceAtual < desafio.questoes.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    } else {
      calcularESalvarResultado();
    }
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
        
        // Garante que salvamos a maior nota entre a atual e a anterior
        const notaFinal = Math.max(acertos, melhorNotaAnterior);
        
        // CORREÇÃO: Salvando com os nomes de campos que o Admin espera
        const dadosParaSalvar = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          nome: auth.currentUser.displayName || "Usuário",
          
          desafioId: id,
          desafio: desafio.titulo || "Desafio Sem Título", // Nome correto para o Admin
          categoria: desafio.categoria || "Geral",
          subcategoria: desafio.subcategoria || "",
          
          nota: notaFinal,
          ultimaNota: acertos,
          total: desafio.questoes.length,
          tentativas: tentativasUsadas + 1,
          data: serverTimestamp()
        };

        // Usa setDoc com merge para atualizar ou criar
        await setDoc(scoreRef, dadosParaSalvar, { merge: true });
        
        setTentativasUsadas(prev => prev + 1);
        setMelhorNotaAnterior(notaFinal);

      } catch (error) {
        console.error("Erro ao salvar pontuação:", error);
      } finally {
        setSalvando(false);
      }
    }
  };

  if (loading) return <div className="quiz-loading">Carregando Desafio...</div>;
  if (!desafio) return <div className="quiz-error">Desafio não encontrado. <Link to="/desafios">Voltar</Link></div>;

  if (mostrarResultado) {
    const total = desafio.questoes.length;
    const porcentagem = (notaAtual / total) * 100;
    let mensagem = "", cor = "";

    if (porcentagem === 100) { mensagem = "Perfeito!"; cor = "#10B981"; }
    else if (porcentagem >= 70) { mensagem = "Aprovado!"; cor = "#2563EB"; }
    else { mensagem = "Tente novamente!"; cor = "#EF4444"; }

    return (
      <div className="quiz-container resultado-container">
        <h1>Resultado da Tentativa</h1>
        <div className="score-circle" style={{ borderColor: cor, color: cor }}>
          {notaAtual} / {total}
        </div>
        <h2>{mensagem}</h2>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '0.9rem' }}>
          <strong>Melhor pontuação registrada:</strong> {Math.max(notaAtual, melhorNotaAnterior)} / {total}
        </div>
        
        {salvando && <p style={{fontSize: '0.8rem', color: '#666'}}>Salvando...</p>}

        <div className="resultado-actions">
          {!verificandoTentativas && (
            <>
              {tentativasUsadas < (desafio.tentativasPermitidas || 3) ? (
                <button className="btn-restart" onClick={() => window.location.reload()}>
                  Tentar Novamente ({tentativasUsadas}/{desafio.tentativasPermitidas || 3})
                </button>
              ) : (
                <button className="btn-restart" disabled style={{ opacity: 0.5 }}>
                  Limite Atingido
                </button>
              )}
            </>
          )}
          <Link to="/desafios" className="btn-sair">Sair</Link>
        </div>
      </div>
    );
  }

  const questaoAtual = desafio.questoes[indiceAtual];

  return (
    <div className="quiz-bg">
      <div className="quiz-container">
        <div className="quiz-header">
          <span className="quiz-badge">{desafio.categoria} - {desafio.subcategoria}</span>
          <span className="quiz-counter">Q. {indiceAtual + 1} / {desafio.questoes.length}</span>
        </div>
        <div className="barra-progresso">
          <div className="progresso-preenchido" style={{ width: `${((indiceAtual + 1) / desafio.questoes.length) * 100}%` }}></div>
        </div>
        <h2 className="pergunta-texto">{questaoAtual.perguntaTexto}</h2>
        {questaoAtual.perguntaImagem && <img src={questaoAtual.perguntaImagem} alt="" className="pergunta-img" />}
        
        <div className="alternativas-grid">
          {['a', 'b', 'c', 'd'].map((letra) => {
            const opcao = questaoAtual.alternativas[letra];
            if (!opcao) return null;
            const isSelected = respostasUsuario[indiceAtual] === letra;
            return (
              <div key={letra} className={`alternativa-card ${isSelected ? 'selecionada' : ''}`} onClick={() => selecionarOpcao(letra)}>
                <div className="letra-bolinha">{letra.toUpperCase()}</div>
                <div className="texto-opcao">{opcao.texto}</div>
                {opcao.imagem && <img src={opcao.imagem} alt="" className="opcao-img" />}
              </div>
            );
          })}
        </div>
        <div className="quiz-footer">
          <button className="btn-proximo" disabled={!respostasUsuario[indiceAtual]} onClick={proximaQuestao}>
            {indiceAtual === desafio.questoes.length - 1 ? "Finalizar" : "Próxima"} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}