import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './QuizPlayer.css';

// --- IMPORTS CORRIGIDOS ---
import { db, auth } from '../../../FirebaseConfig'; // Adicionado auth
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  getCountFromServer, 
  serverTimestamp 
} from "firebase/firestore";

export default function QuizPlayer() {
  const { id } = useParams(); // Pega o ID da URL
  
  // Estados do Desafio
  const [desafio, setDesafio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de Tentativas
  const [tentativasUsadas, setTentativasUsadas] = useState(0);
  const [verificandoTentativas, setVerificandoTentativas] = useState(true);

  // Estados do Jogo
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [nota, setNota] = useState(0);
  const [salvando, setSalvando] = useState(false); // Novo estado para feedback visual

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

  // 2. Checar Tentativas (MOVIDO PARA O TOPO - FORA DO IF)
  useEffect(() => {
    const checarTentativas = async () => {
      if (!auth.currentUser || !id) return;

      try {
        const q = query(
          collection(db, "pontuacoes"),
          where("userId", "==", auth.currentUser.uid),
          where("desafioId", "==", id)
        );

        const snapshot = await getCountFromServer(q);
        setTentativasUsadas(snapshot.data().count);
      } catch (error) {
        console.error("Erro ao contar tentativas:", error);
      } finally {
        setVerificandoTentativas(false);
      }
    };

    checarTentativas();
  }, [id]);

  // Registra a resposta escolhida
  const selecionarOpcao = (letra) => {
    setRespostasUsuario({
      ...respostasUsuario,
      [indiceAtual]: letra
    });
  };

  // Avança para a próxima ou finaliza
  const proximaQuestao = () => {
    if (indiceAtual < desafio.questoes.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    } else {
      calcularESalvarResultado();
    }
  };

  // Calcula a nota E SALVA no Firebase
  const calcularESalvarResultado = async () => {
    setSalvando(true);
    let acertos = 0;
    
    desafio.questoes.forEach((q, index) => {
      if (respostasUsuario[index] === q.alternativaCorreta) {
        acertos++;
      }
    });

    setNota(acertos);
    setMostrarResultado(true);

    // LÓGICA DE SALVAMENTO ADICIONADA
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, "pontuacoes"), {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          userName: auth.currentUser.displayName || "Usuário",
          desafioId: id,
          desafioTitulo: desafio.titulo || "Desafio",
          nota: acertos,
          total: desafio.questoes.length,
          data: serverTimestamp()
        });
        
        // Atualiza o contador localmente para o botão "Tentar Novamente" atualizar na hora
        setTentativasUsadas(prev => prev + 1);
      } catch (error) {
        console.error("Erro ao salvar pontuação:", error);
      } finally {
        setSalvando(false);
      }
    }
  };

  if (loading) return <div className="quiz-loading">Carregando Desafio...</div>;
  if (!desafio) return <div className="quiz-error">Desafio não encontrado. <Link to="/desafios">Voltar</Link></div>;

  // TELA DE RESULTADO
  if (mostrarResultado) {
    const total = desafio.questoes.length;
    const porcentagem = (nota / total) * 100;
    let mensagem = "";
    let cor = "";

    if (porcentagem === 100) { mensagem = "Perfeito! Você dominou o assunto!"; cor = "#10B981"; }
    else if (porcentagem >= 70) { mensagem = "Muito bem! Você foi aprovado."; cor = "#2563EB"; }
    else { mensagem = "Precisa estudar mais. Tente novamente!"; cor = "#EF4444"; }

    return (
      <div className="quiz-container resultado-container">
        <h1>Resultado Final</h1>
        <div className="score-circle" style={{ borderColor: cor, color: cor }}>
          {nota} / {total}
        </div>
        <h2>{mensagem}</h2>
        <p>Você acertou {porcentagem.toFixed(0)}% das questões.</p>
        
        {salvando && <p style={{fontSize: '0.8rem', color: '#666'}}>Salvando resultado...</p>}

        <div className="resultado-actions">
          {!verificandoTentativas && (
            <>
              {tentativasUsadas < (desafio.tentativasPermitidas || 1) ? (
                <button className="btn-restart" onClick={() => window.location.reload()}>
                  Tentar Novamente ({tentativasUsadas}/{desafio.tentativasPermitidas || 1})
                </button>
              ) : (
                <button
                  className="btn-restart"
                  disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }}
                >
                  Limite Excedido ({tentativasUsadas}/{desafio.tentativasPermitidas || 1})
                </button>
              )}
            </>
          )}

          <Link to="/desafios" className="btn-sair">Sair para Menu</Link>
        </div>
      </div>
    );
  }

  //  TELA DO JOGO (PERGUNTA ATUAL
  const questaoAtual = desafio.questoes[indiceAtual];

  return (
    <div className="quiz-bg">
      <div className="quiz-container">
        <div className="quiz-header">
          <span className="quiz-badge">{desafio.subcategoria}</span>
          <span className="quiz-counter">Questão {indiceAtual + 1} de {desafio.questoes.length}</span>
        </div>

        <div className="barra-progresso">
          <div
            className="progresso-preenchido"
            style={{ width: `${((indiceAtual + 1) / desafio.questoes.length) * 100}%` }}
          ></div>
        </div>

        <h2 className="pergunta-texto">{questaoAtual.perguntaTexto}</h2>

        {questaoAtual.perguntaImagem && (
          <img src={questaoAtual.perguntaImagem} alt="Apoio" className="pergunta-img" />
        )}

        <div className="alternativas-grid">
          {['a', 'b', 'c', 'd'].map((letra) => {
            const opcao = questaoAtual.alternativas[letra];
            const isSelected = respostasUsuario[indiceAtual] === letra;

            return (
              <div
                key={letra}
                className={`alternativa-card ${isSelected ? 'selecionada' : ''}`}
                onClick={() => selecionarOpcao(letra)}
              >
                <div className="letra-bolinha">{letra.toUpperCase()}</div>
                <div className="texto-opcao">{opcao.texto}</div>
                {opcao.imagem && <img src={opcao.imagem} alt="" className="opcao-img" />}
              </div>
            );
          })}
        </div>

        <div className="quiz-footer">
          <button
            className="btn-proximo"
            disabled={!respostasUsuario[indiceAtual]}
            onClick={proximaQuestao}
          >
            {indiceAtual === desafio.questoes.length - 1 ? "Finalizar" : "Próxima"} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}