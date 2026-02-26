import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css";

// Firebase
import { db } from "../../../FirebaseConfig";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "firebase/firestore";

export default function PainelDesafios() {
    const [tab, setTab] = useState("criar"); // 'criar' ou 'gerenciar'
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(true);

    const [listaDesafios, setListaDesafios] = useState([]);
    const [busca, setBusca] = useState("");

    // Estados do Formulário
    const [editandoId, setEditandoId] = useState(null);
    const [tituloGeral, setTituloGeral] = useState("");
    const [subtitulo, setSubtitulo] = useState("");
    const [capa, setCapa] = useState("");
    const [area, setArea] = useState("Tecnologia");
    const [exercicios, setExercicios] = useState([
        {
            perguntaTexto: "",
            perguntaImagem: "",
            tipo: "objetiva",
            alternativaCorreta: "",
            alternativas: {
                a: { texto: "" }, b: { texto: "" }, c: { texto: "" }, d: { texto: "" }
            }
        }
    ]);

    // Carregar desafios para a aba Gerenciar
    const buscarDesafios = async () => {
        const q = query(collection(db, "desafios"), orderBy("dataCriacao", "desc"));
        const snap = await getDocs(q);
        setListaDesafios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    useEffect(() => {
        if (tab === "gerenciar") buscarDesafios();
    }, [tab]);

    // --- FUNÇÕES DE MANIPULAÇÃO DO FORMULÁRIO ---
    const adicionarQuestao = () => {
        if (exercicios.length >= 10) return alert("Limite de 10 questões atingido!");
        setExercicios([...exercicios, {
            perguntaTexto: "", perguntaImagem: "", tipo: "objetiva", alternativaCorreta: "",
            alternativas: { a: { texto: "" }, b: { texto: "" }, c: { texto: "" }, d: { texto: "" } }
        }]);
    };

    const handleQuestaoChange = (index, campo, valor) => {
        const novos = [...exercicios];
        novos[index][campo] = valor;
        setExercicios(novos);
    };

    const salvarDesafio = async () => {
        if (!tituloGeral || !area) return alert("Preencha o título e a área.");
        
        setLoading(true);
        const dados = {
            titulo: tituloGeral,
            subtitulo,
            area,
            imagemCapa: capa || "https://placehold.co/600x400?text=Quiz",
            questoes: exercicios,
            qtdQuestoes: exercicios.length,
            dataCriacao: new Date().toISOString()
        };

        try {
            if (editandoId) {
                await updateDoc(doc(db, "desafios", editandoId), dados);
                alert("Desafio atualizado!");
            } else {
                await addDoc(collection(db, "desafios"), dados);
                alert("Desafio criado!");
            }
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar.");
        } finally { setLoading(false); }
    };

    const prepararEdicao = (d) => {
        setEditandoId(d.id);
        setTituloGeral(d.titulo);
        setSubtitulo(d.subtitulo || "");
        setCapa(d.imagemCapa || "");
        setArea(d.area);
        setExercicios(d.questoes);
        setTab("criar");
    };

    const excluirDesafioBanco = async (id) => {
        if (window.confirm("Excluir desafio permanentemente?")) {
            await deleteDoc(doc(db, "desafios", id));
            buscarDesafios();
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
                    <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Likes</span></Link></li>
                </ul>
            </aside>

            <main className={styles.main}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button className={styles.publishBtn} onClick={() => { setTab("criar"); setEditandoId(null); }} style={{ backgroundColor: tab === 'criar' ? '#0f172a' : '#095d8bd5' }}>
                        {editandoId ? "Editando..." : "+ Novo"}
                    </button>
                    <button className={styles.publishBtn} onClick={() => setTab("gerenciar")} style={{ backgroundColor: tab === 'gerenciar' ? '#0f172a' : '#095d8bd5' }}>Gerenciar</button>
                </div>

                {tab === "criar" ? (
                    <div className={styles.editorContainer}>
                        <div className={styles.headerFlex}>
                            <h1>{editandoId ? "Editar Desafio" : "Novo Desafio (Quiz)"}</h1>
                            <button className={styles.publishBtn} onClick={salvarDesafio} disabled={loading}>
                                {loading ? "Processando..." : editandoId ? "Salvar Alterações" : "Publicar Quiz"}
                            </button>
                        </div>

                        <div className={styles.blockItem}>
                            <h3>1. Configurações Gerais</h3>
                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>Título Principal</label>
                                <input className={styles.inputField} value={tituloGeral} onChange={e => setTituloGeral(e.target.value)} placeholder="Ex: Lógica de Programação" />
                            </div>
                            <div className={styles.inputGroup} style={{ marginTop: '10px' }}>
                                <label className={styles.fieldLabel}>Área</label>
                                <select className={styles.inputField} value={area} onChange={e => setArea(e.target.value)}>
                                    <option value="Tecnologia">Tecnologia</option>
                                    <option value="Engenharia">Engenharia</option>
                                    <option value="Direito">Direito</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Rh">RH</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup} style={{ marginTop: '10px' }}>
                                <label className={styles.fieldLabel}>URL da Imagem de Capa</label>
                                <input className={styles.inputField} value={capa} onChange={e => setCapa(e.target.value)} placeholder="Link da imagem..." />
                            </div>
                        </div>

                        <h3 style={{ margin: '20px 0' }}>2. Questões ({exercicios.length}/10)</h3>
                        {exercicios.map((ex, index) => (
                            <div key={index} className={styles.blockItem} style={{ marginBottom: '15px', borderLeft: '4px solid #095e8b' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span className={styles.blockLabel}>QUESTÃO {index + 1}</span>
                                    <button onClick={() => setExercicios(exercicios.filter((_, i) => i !== index))} className={styles.btnIcon}><img src="/lixeira.png" alt="X" /></button>
                                </div>
                                <textarea className={styles.textAreaBlock} value={ex.perguntaTexto} onChange={e => handleQuestaoChange(index, 'perguntaTexto', e.target.value)} placeholder="Enunciado da questão..." />
                                
                                <div style={{ marginTop: '10px' }}>
                                    <label className={styles.fieldLabel}>Alternativas (Marque a correta)</label>
                                    {['a', 'b', 'c', 'd'].map(l => (
                                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                            <input type="radio" name={`correct-${index}`} checked={ex.alternativaCorreta === l} onChange={() => handleQuestaoChange(index, 'alternativaCorreta', l)} />
                                            <input className={styles.inputField} placeholder={`Opção ${l.toUpperCase()}`} value={ex.alternativas[l].texto} 
                                                onChange={e => {
                                                    const n = [...exercicios];
                                                    n[index].alternativas[l].texto = e.target.value;
                                                    setExercicios(n);
                                                }} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button onClick={adicionarQuestao} className={styles.btnAdd} disabled={exercicios.length >= 10}>
                            + Adicionar Questão
                        </button>
                    </div>
                ) : (
                    <div className={styles.editorContainer}>
                        <h1>Gerenciar Desafios</h1>
                        <input className={styles.inputField} placeholder="Pesquisar por título ou área..." value={busca} onChange={e => setBusca(e.target.value)} style={{ marginBottom: '20px' }} />
                        <div className={styles.blocksList}>
                            {listaDesafios.filter(d => d.titulo.toLowerCase().includes(busca.toLowerCase())).map(d => (
                                <div key={d.id} className={styles.blockItem} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div><strong>{d.titulo}</strong> <br /><small>{d.area} • {d.qtdQuestoes} Questões</small></div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => prepararEdicao(d)} className={styles.publishBtn} style={{ padding: '5px 15px', fontSize: '0.8rem' }}>Editar</button>
                                        <button onClick={() => excluirDesafioBanco(d.id)} className={styles.btnIcon}><img src="/lixeira.png" alt="X" style={{ width: '18px' }} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}