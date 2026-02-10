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
    const [tab, setTab] = useState("criar"); 
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    
    const [listaDesafios, setListaDesafios] = useState([]);
    const [busca, setBusca] = useState("");

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
            },
            respostaEsperada: ""
        }
    ]);

    const carregarDesafios = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "desafios"), orderBy("dataCriacao", "desc"));
            const querySnapshot = await getDocs(q);
            const dados = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setListaDesafios(dados);
        } catch (error) {
            console.error("Erro ao carregar:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === "gerenciar") carregarDesafios();
    }, [tab]);

    const excluirDesafioBanco = async (id) => {
        if (window.confirm("Deseja excluir permanentemente este desafio?")) {
            try {
                await deleteDoc(doc(db, "desafios", id));
                setListaDesafios(listaDesafios.filter(d => d.id !== id));
            } catch (e) {
                alert("Erro ao excluir.");
            }
        }
    };

    const excluirQuestaoForm = (indexToDelete) => {
        if (exercicios.length === 1) return alert("O desafio precisa de uma questão.");
        if (window.confirm("Remover questão?")) {
            setExercicios(exercicios.filter((_, index) => index !== indexToDelete));
        }
    };

    const prepararEdicao = (desafio) => {
        setEditandoId(desafio.id);
        setTituloGeral(desafio.titulo);
        setSubtitulo(desafio.subtitulo || "");
        setCapa(desafio.imagemCapa || "");
        setArea(desafio.area);
        setExercicios(desafio.questoes.map(q => ({
            ...q,
            tipo: q.tipo || "objetiva",
            respostaEsperada: q.respostaEsperada || ""
        })));
        setTab("criar");
    };

    const adicionarQuestao = () => {
        if (exercicios.length >= 10) return alert("Limite atingido");
        setExercicios([...exercicios, {
            perguntaTexto: "", perguntaImagem: "", tipo: "objetiva",
            alternativaCorreta: "", alternativas: { a: { texto: "" }, b: { texto: "" }, c: { texto: "" }, d: { texto: "" } },
            respostaEsperada: ""
        }]);
    };

    const handleQuestaoChange = (index, campo, valor) => {
        const novos = [...exercicios];
        novos[index][campo] = valor;
        setExercicios(novos);
    };

    const salvarOuAtualizar = async () => {
        if (!tituloGeral) return alert("Título obrigatório");
        setLoading(true);
        const payload = {
            titulo: tituloGeral, subtitulo, area,
            imagemCapa: capa || "https://placehold.co/600x400?text=Quiz",
            tentativasPermitidas: 2, questoes: exercicios, qtdQuestoes: exercicios.length,
            ultimaAtualizacao: new Date().toISOString()
        };
        try {
            if (editandoId) { await updateDoc(doc(db, "desafios", editandoId), payload); alert("Atualizado!"); }
            else { await addDoc(collection(db, "desafios"), { ...payload, dataCriacao: new Date().toISOString() }); alert("Publicado!"); }
            window.location.reload();
        } catch (e) { alert("Erro ao salvar."); } finally { setLoading(false); }
    };

    return (
        <div className={styles.container}>
            <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
                <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}><img src="/menu.png" alt="menu" /></button>
                <h2 className={styles.title}>Painel Admin</h2>
                <ul className={styles.navList}>
                    <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
                    <li><Link to="/admin/notas" className={styles.navLink}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Notas</span></Link></li>
                    <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Blog</span></Link></li>
                    <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Desafios</span></Link></li>
                    <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Like</span></Link></li>
                </ul>
            </aside>

            <main className={styles.main}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button className={styles.publishBtn} onClick={() => {setTab("criar"); setEditandoId(null)}} style={{ backgroundColor: tab === 'criar' ? '#0f172a' : '#3b82f6' }}>+ Novo</button>
                    <button className={styles.publishBtn} onClick={() => {setTab("gerenciar"); setEditandoId(null)}} style={{ backgroundColor: tab === 'gerenciar' ? '#0f172a' : '#3b82f6' }}>Gerenciar</button>
                </div>

                <div className={styles.headerFlex}>
                    <h1>{tab === "criar" ? (editandoId ? "Editar Desafio" : "Novo Desafio") : "Buscar no Banco"}</h1>
                    {tab === "criar" && <button className={styles.publishBtn} onClick={salvarOuAtualizar} disabled={loading}>{loading ? "..." : "Salvar"}</button>}
                </div>

                {tab === "gerenciar" ? (
                    <div className={styles.editorContainer}>
                        <input className={styles.inputField} placeholder="Pesquisar..." value={busca} onChange={e => setBusca(e.target.value)} style={{marginBottom: '20px'}} />
                        <div className={styles.blocksList}>
                            {listaDesafios.filter(d => d.titulo.toLowerCase().includes(busca.toLowerCase()) || d.area.toLowerCase().includes(busca.toLowerCase())).map(d => (
                                <div key={d.id} className={styles.blockItem} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <div><strong>{d.titulo}</strong> <br/><small>{d.area} • {d.qtdQuestoes} Qs</small></div>
                                    <div style={{display:'flex', gap:'8px'}}>
                                        <button onClick={() => prepararEdicao(d)} className={styles.btnAdd} style={{width:'auto', padding:'5px 15px'}}>Editar</button>
                                        <button onClick={() => excluirDesafioBanco(d.id)} className={styles.btnIcon}><img src="/lixeira.png" alt="X" style={{width:'18px'}}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.editorContainer}>
                        {/* 1. CONFIGURAÇÕES EM CARD (IGUAL AO DAS QUESTÕES) */}
                        <div className={styles.blockItem}>
                            <h3 style={{margin:'20px 0 10px'}}>1. Configurações Gerais</h3>
                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>Título Principal</label>
                                <input className={styles.inputField} value={tituloGeral} onChange={e => setTituloGeral(e.target.value)} placeholder="Ex: Módulo 1 - RH" />
                            </div>

                            <div className={styles.inputGroup} style={{marginTop:'15px'}}>
                                <label className={styles.fieldLabel}>URL da Imagem de Capa</label>
                                <input className={styles.inputField} value={capa} onChange={e => setCapa(e.target.value)} placeholder="Cole o link aqui..." />
                                {capa && <div style={{marginTop:'10px', textAlign:'center'}}><img src={capa} alt="Preview Capa" style={{maxHeight:'150px', borderRadius:'8px', border:'1px solid #ddd'}} onError={(e) => e.target.style.display = 'none'} /></div>}
                            </div>

                            <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                                <div style={{flex:1}}><label className={styles.fieldLabel}>Área</label>
                                    <select className={styles.inputField} value={area} onChange={e => setArea(e.target.value)}>
                                        <option value="Tecnologia">Tecnologia</option><option value="RH">RH</option>
                                        <option value="Direito">Direito</option><option value="Engenharia">Engenharia</option><option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                                <div style={{flex:1}}><label className={styles.fieldLabel}>Tentativas</label><input className={styles.inputField} value="2 (Bloqueado)" disabled style={{background:'#eee'}} /></div>
                            </div>
                        </div>

                        {/* 2. QUESTÕES */}
                        <div className={styles.blocksList}>
                            {exercicios.map((ex, index) => (
                                <div key={index} className={styles.blockItem}>
                                                                <h3 style={{margin:'20px 0 10px'}}>2. QUESTÕES ({exercicios.length}/10)</h3>

                                    <div className={styles.blockHeader}>
                                        <span className={styles.blockLabel} style={{background:'#095e8b', color:'white'}}>QUESTÃO {index + 1}</span>
                                        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                            <select value={ex.tipo} onChange={e => handleQuestaoChange(index, 'tipo', e.target.value)} style={{padding:'14px 16px', borderRadius:'8px', border:'1px solid #e0e0e0', fontSize:'1rem', backgroundColor:'#f9fafb', transition:'all 0.2s ease', color:'#333'}}>
                                                <option value="objetiva">Objetiva</option><option value="justificativa">Justificativa</option>
                                            </select>
                                            <button onClick={() => excluirQuestaoForm(index)} className={styles.btnIcon}><img src="/lixeira.png" alt="X" /></button>
                                        </div>
                                    </div>
                                    <textarea className={styles.textAreaBlock} value={ex.perguntaTexto} onChange={e => handleQuestaoChange(index, 'perguntaTexto', e.target.value)} placeholder="Enunciado..." />
                                    
                                    <div className={styles.inputGroup} style={{marginTop:'10px'}}>
                                        <label className={styles.fieldLabel}>Link da Imagem da Pergunta</label>
                                        <input className={styles.inputField} value={ex.perguntaImagem} onChange={e => handleQuestaoChange(index, 'perguntaImagem', e.target.value)} placeholder="https://..." />
                                        {ex.perguntaImagem && <div style={{marginTop:'8px'}}><img src={ex.perguntaImagem} alt="Preview" style={{maxHeight:'100px', borderRadius:'5px'}} onError={(e) => e.target.style.display = 'none'} /></div>}
                                    </div>
                                    

                                    {ex.tipo === "objetiva" ? (
                                        <div style={{marginTop:'15px', background:'#f1f5f9', padding:'15px', borderRadius:'8px'}}>
                                            {['a','b','c','d'].map(l => (
                                                <div key={l} style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px'}}>
                                                    <input type="radio" checked={ex.alternativaCorreta === l} onChange={() => handleQuestaoChange(index, 'alternativaCorreta', l)} />
                                                    <input className={styles.inputField} placeholder={`Opção ${l.toUpperCase()}`} value={ex.alternativas[l].texto} onChange={e => {
                                                        const n = [...exercicios]; n[index].alternativas[l].texto = e.target.value; setExercicios(n);
                                                    }} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{marginTop:'15px'}}>
                                            <label className={styles.fieldLabel}>Justificativa / Gabarito Esperado</label>
                                            <textarea className={styles.textAreaBlock} style={{background:'#fffbeb'}} value={ex.respostaEsperada} onChange={e => handleQuestaoChange(index, 'respostaEsperada', e.target.value)} rows={3} />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button onClick={adicionarQuestao} className={styles.btnAdd}>+ Adicionar Questão</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}