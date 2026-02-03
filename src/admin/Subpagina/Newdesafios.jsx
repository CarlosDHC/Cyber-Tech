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
                a: { texto: "", imagem: "" },
                b: { texto: "", imagem: "" },
                c: { texto: "", imagem: "" },
                d: { texto: "", imagem: "" }
            }
        }
    ]);

    // Adicionar Nova Questão (COM LIMITE DE 10)
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
                    a: { texto: "", imagem: "" },
                    b: { texto: "", imagem: "" },
                    c: { texto: "", imagem: "" },
                    d: { texto: "", imagem: "" }
                }
            }
        ]);
    };

    // Remover Questão
    const excluirQuestao = (indexToDelete) => {
        if (exercicios.length === 1) {
            alert("O desafio precisa ter pelo menos uma questão.");
            return;
        }

        if (window.confirm("Excluir esta questão?")) {
            const novaLista = exercicios.filter((_, index) => index !== indexToDelete);
            setExercicios(novaLista);
        }
    };

    // Atualiza campos da questão
    const handleQuestaoChange = (index, campo, valor) => {
        const novosExercicios = [...exercicios];
        novosExercicios[index] = { ...novosExercicios[index], [campo]: valor };
        setExercicios(novosExercicios);
    };

    // Atualiza alternativas
    const handleAltChange = (exIndex, letra, campo, valor) => {
        const novosExercicios = [...exercicios];
        novosExercicios[exIndex].alternativas[letra] = {
            ...novosExercicios[exIndex].alternativas[letra],
            [campo]: valor
        };
        setExercicios(novosExercicios);
    };

    const salvarDesafios = async () => {
        if (!tituloGeral || !area) {
            alert("Preencha o Título Principal e a Área de Conhecimento.");
            return;
        }

        const questoesValidas = exercicios.filter(q =>
            q.perguntaTexto.trim() !== "" && q.alternativaCorreta !== ""
        );

        if (questoesValidas.length === 0) {
            alert("Preencha pelo menos uma questão completa.");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "desafios"), {
                titulo: tituloGeral,
                subtitulo: subtitulo,
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
                    <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
                    <li><Link to="/admin/notas" className={styles.navLink}><img src="/estrela.png" alt="N" /><span className={styles.linkText}>Notas</span></Link></li>
                    <li><Link to="/admin/newblog" className={styles.navLink}><img src="/blog.png" alt="B" /><span className={styles.linkText}>Blog</span></Link></li>
                    <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/desafio.png" alt="D" /><span className={styles.linkText}>Desafios</span></Link></li>
                    <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Curtidas</span></Link></li>
                </ul>
            </aside>

            <main className={styles.main}>
                <div className={styles.headerFlex}>
                    <h1>Novo Desafio (Quiz)</h1>
                    <button className={styles.publishBtn} onClick={salvarDesafios} disabled={loading}>
                        {loading ? "Salvando..." : "Publicar Quiz"}
                    </button>
                </div>

                <div className={styles.editorContainer}>
                    <div className={styles.formColumn}>

                        {/* --- BLOCO 1: CONFIGURAÇÕES (METADADOS) --- */}
                        <div className={styles.metaBox}>
                            <h3 style={{ marginTop: 0, color: '#1E293B' }}>1. Configurações</h3>

                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>Título Principal</label>
                                <input
                                    className={styles.inputField}
                                    placeholder="Ex: Lógica de Programação - Módulo 1"
                                    value={tituloGeral}
                                    onChange={e => setTituloGeral(e.target.value)}
                                    style={{ fontWeight: 'bold' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div className={styles.inputGroup} style={{ flex: 1, minWidth: '200px' }}>
                                    <label className={styles.fieldLabel}>Área</label>
                                    <select className={styles.inputField} value={area} onChange={e => setArea(e.target.value)}>
                                        <option value="Tecnologia">Tecnologia</option>
                                        <option value="Engenharia">Engenharia</option>
                                        <option value="Direito">Direito</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Rh">RH</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup} style={{ flex: 1, minWidth: '150px' }}>
                                    <label className={styles.fieldLabel}>Tentativas</label>
                                    <input
                                        className={styles.inputField}
                                        type="number"
                                        min="1"
                                        value={tentativas}
                                        onChange={e => setTentativas(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
                                <label className={styles.fieldLabel}>Imagem de Capa (URL)</label>
                                <input className={styles.inputField} placeholder="https://..." value={capa} onChange={e => setCapa(e.target.value)} />
                            </div>
                            {capa && <img src={capa} alt="Preview" style={{ height: '120px', marginTop: '10px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} onError={(e) => e.target.style.display = 'none'} />}
                        </div>

                        <hr className={styles.divider} />

                        <div className={styles.blocksList}>

                            <div style={{ marginBottom: '25px', paddingBottom: '15px' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#095e8b' }}>2. Dados do Desafio</h3>

                                <div className={styles.inputGroup}>
                                    <label className={styles.fieldLabel}>Título Principal</label>
                                    <input
                                        className={styles.inputField}
                                        placeholder="..."
                                        value={tituloGeral}
                                        onChange={e => setTituloGeral(e.target.value)}
                                        style={{ fontWeight: 'bold' }}
                                    />
                                </div>

                                <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
                                    <label className={styles.fieldLabel}>Subtítulo</label>
                                    <input
                                        className={styles.inputField}
                                        placeholder="..."
                                        value={subtitulo}
                                        onChange={e => setSubtitulo(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* LISTA DE QUESTÕES */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3>3. Perguntas ({exercicios.length}/10)</h3>
                                {exercicios.length >= 10 && <span style={{ color: 'red', fontWeight: 'bold', fontSize: '0.9rem' }}>Máximo atingido!</span>}
                            </div>

                            {exercicios.map((ex, index) => (
                                <div key={index} className={styles.blockItem}>
                                    <div className={styles.blockHeader}>
                                        <span className={styles.blockLabel} style={{ background: '#095e8b', color: 'white' }}>
                                            QUESTÃO {index + 1}
                                        </span>

                                        <div className={styles.blockActions}>
                                            <button
                                                onClick={() => excluirQuestao(index)}
                                                className={styles.btnIcon}
                                                title="Excluir Questão"
                                            >
                                                <img src="/lixeira.png" alt="Excluir" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.fieldLabel}>Enunciado</label>
                                        <textarea
                                            className={styles.textAreaBlock}
                                            placeholder="Digite a pergunta..."
                                            value={ex.perguntaTexto}
                                            onChange={e => handleQuestaoChange(index, 'perguntaTexto', e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <input className={styles.inputField} placeholder="URL da imagem (opcional)" value={ex.perguntaImagem} onChange={e => handleQuestaoChange(index, 'perguntaImagem', e.target.value)} />
                                        {ex.perguntaImagem && <img src={ex.perguntaImagem} alt="" style={{ height: '60px', marginTop: '5px', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />}
                                    </div>

                                    {/* Alternativas */}
                                    <div style={{ marginTop: '15px', background: '#f1f5f9', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', color: '#475569' }}>ALTERNATIVAS (Marque a correta):</p>

                                        {['a', 'b', 'c', 'd'].map((letra) => (
                                            <div key={letra} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                                                <input
                                                    type="radio"
                                                    name={`correta-${index}`}
                                                    checked={ex.alternativaCorreta === letra}
                                                    onChange={() => handleQuestaoChange(index, 'alternativaCorreta', letra)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563EB' }}
                                                />
                                                <span style={{ fontWeight: 'bold', width: '25px', textTransform: 'uppercase', color: '#334155' }}>{letra})</span>

                                                <input
                                                    className={styles.inputField}
                                                    placeholder={`Resposta ${letra.toUpperCase()}`}
                                                    value={ex.alternativas[letra].texto}
                                                    onChange={e => handleAltChange(index, letra, 'texto', e.target.value)}
                                                    style={{ flex: 1, background: 'white' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className={styles.addButtons} style={{ marginTop: '15px' }}>
                                <button
                                    onClick={adicionarQuestao}
                                    className={styles.btnAdd}
                                    disabled={exercicios.length >= 10}
                                    style={exercicios.length >= 10 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                >
                                    {exercicios.length >= 10 ? "Máximo de Questões Atingido" : "+ Adicionar Questão"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}