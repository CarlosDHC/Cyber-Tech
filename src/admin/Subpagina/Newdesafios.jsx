import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";

// Firebase
import { db } from "../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function NewDesafios() {
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(true);

    const [tituloGeral, setTituloGeral] = useState("");
    const [subtitulo, setSubtitulo] = useState("");
    const [capa, setCapa] = useState("");
    const [tentativas, setTentativas] = useState(1);
    const [area, setArea] = useState("Tecnologia");

    const [exercicios, setExercicios] = useState([
        {
            perguntaTexto: "",
            perguntaImagem: "",
            alternativaCorreta: "",
            alternativas: {
                a: { texto: "" },
                b: { texto: "" },
                c: { texto: "" },
                d: { texto: "" }
            }
        }
    ]);

    // Adicionar questão (máx 10)
    const adicionarQuestao = () => {
        if (exercicios.length >= 10) {
            alert("Limite máximo de 10 questões atingido!");
            return;
        }

        setExercicios([
            ...exercicios,
            {
                perguntaTexto: "",
                perguntaImagem: "",
                alternativaCorreta: "",
                alternativas: {
                    a: { texto: "" },
                    b: { texto: "" },
                    c: { texto: "" },
                    d: { texto: "" }
                }
            }
        ]);
    };

    // Remover questão
    const excluirQuestao = (index) => {
        if (exercicios.length === 1) {
            alert("O desafio precisa ter pelo menos uma questão.");
            return;
        }

        if (window.confirm("Excluir esta questão?")) {
            const novaLista = exercicios.filter((_, i) => i !== index);
            setExercicios(novaLista);
        }
    };

    // Atualiza pergunta
    const handleQuestaoChange = (index, campo, valor) => {
        const novos = [...exercicios];
        novos[index] = { ...novos[index], [campo]: valor };
        setExercicios(novos);
    };

    // Atualiza alternativa
    const handleAltChange = (exIndex, letra, valor) => {
        const novos = [...exercicios];
        novos[exIndex].alternativas[letra].texto = valor;
        setExercicios(novos);
    };

    const salvarDesafios = async () => {
        if (!tituloGeral || !area) {
            alert("Preencha o Título Principal e a Área.");
            return;
        }

        const questoesValidas = exercicios.filter(
            q => q.perguntaTexto.trim() !== "" && q.alternativaCorreta !== ""
        );

        if (questoesValidas.length === 0) {
            alert("Preencha pelo menos uma questão completa.");
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, "desafios"), {
                titulo: tituloGeral,
                subtitulo,
                area,
                imagemCapa: capa || "https://placehold.co/600x400?text=Quiz",
                tentativasPermitidas: Number(tentativas),
                tipo: "quiz",
                questoes: questoesValidas,
                qtdQuestoes: questoesValidas.length,
                dataCriacao: new Date().toISOString()
            });

            alert("Desafio publicado com sucesso!");
            window.location.reload();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao publicar o desafio.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
                <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
                    <img src="/menu.png" alt="menu" />
                </button>
                <h2 className={styles.title}>Admin</h2>
                <ul className={styles.navList}>
                    <li><Link to="/admin" className={styles.navLink}>Home</Link></li>
                    <li><Link to="/admin/newdesafios" className={styles.navLink}>Desafios</Link></li>
                </ul>
            </aside>

            <main className={styles.main}>
                <div className={styles.headerFlex}>
                    <h1>Novo Desafio (Quiz)</h1>
                    <button 
                        className={styles.publishBtn} 
                        onClick={salvarDesafios} 
                        disabled={loading}
                    >
                        {loading ? "Salvando..." : "Publicar Quiz"}
                    </button>
                </div>
                
                <div className={styles.editorContainer}>
                    <div className={styles.blockItem}>
                        <h3>1. Configurações Gerais</h3>

                        <input
                            className={styles.inputField}
                            placeholder="Título Principal"
                            value={tituloGeral}
                            onChange={e => setTituloGeral(e.target.value)}
                        />

                        <input
                            className={styles.inputField}
                            placeholder="Subtítulo"
                            value={subtitulo}
                            onChange={e => setSubtitulo(e.target.value)}
                        />

                        <select
                            className={styles.inputField}
                            value={area}
                            onChange={e => setArea(e.target.value)}
                        >
                            <option value="Tecnologia">Tecnologia</option>
                            <option value="Engenharia">Engenharia</option>
                            <option value="Direito">Direito</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Rh">RH</option>
                        </select>

                        <input
                            className={styles.inputField}
                            type="number"
                            min="1"
                            value={tentativas}
                            onChange={e => setTentativas(e.target.value)}
                        />

                        <input
                            className={styles.inputField}
                            placeholder="URL da imagem de capa"
                            value={capa}
                            onChange={e => setCapa(e.target.value)}
                        />
                    </div>

                    <h3 style={{ marginTop: "30px" }}>
                        2. Perguntas ({exercicios.length}/10)
                    </h3>

                    {exercicios.map((ex, index) => (
                        <div key={index} className={styles.blockItem}>
                            <h4>Questão {index + 1}</h4>

                            <textarea
                                className={styles.textAreaBlock}
                                placeholder="Digite a pergunta..."
                                value={ex.perguntaTexto}
                                onChange={e => handleQuestaoChange(index, "perguntaTexto", e.target.value)}
                            />

                            {["a", "b", "c", "d"].map(letra => (
                                <div key={letra} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                                    <input
                                        type="radio"
                                        name={`correta-${index}`}
                                        checked={ex.alternativaCorreta === letra}
                                        onChange={() =>
                                            handleQuestaoChange(index, "alternativaCorreta", letra)
                                        }
                                    />
                                    <input
                                        className={styles.inputField}
                                        placeholder={`Alternativa ${letra.toUpperCase()}`}
                                        value={ex.alternativas[letra].texto}
                                        onChange={e =>
                                            handleAltChange(index, letra, e.target.value)
                                        }
                                    />
                                </div>
                            ))}

                            <button
                                onClick={() => excluirQuestao(index)}
                                className={styles.btnIcon}
                            >
                                Excluir Questão
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={adicionarQuestao}
                        disabled={exercicios.length >= 10}
                        className={styles.btnAdd}
                    >
                        + Adicionar Questão
                    </button>
                </div>
            </main>
        </div>
    );
}