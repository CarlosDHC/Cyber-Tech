import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../Admin.module.css"; // Usa o mesmo CSS do Admin principal

// Firebase
import { db } from "../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// --- CONFIGURAÇÃO DAS SUBCATEGORIAS (ATUALIZADO COM 8 OPÇÕES) ---
const OPCOES_POR_AREA = {
  "Tecnologia": [
      "Lógica de Programação", 
      "Estrutura de Dados", 
      "Front-end (HTML/CSS)", 
      "JavaScript Avançado", 
      "React.js", 
      "Banco de Dados",
      "Git e GitHub",       // Novo
      "Projetos Práticos"   // Novo
  ],
  "Engenharia": ["Física Mecânica", "Cálculo Estrutural", "Hidráulica", "Resistência dos Materiais", "Gestão de Obras"],
  "Direito": ["Direito Civil", "Direito Penal", "Direito Constitucional", "Direito Trabalhista", "Direito Digital"],
  "Marketing": ["Fundamentos de Marketing", "Marketing Digital", "SEO e Tráfego", "Branding", "Copywriting"],
  "Rh": ["Gestão de Pessoas", "Recrutamento e Seleção", "Treinamento", "Cultura Organizacional", "Liderança"]
};

export default function NewDesafios() {
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(true);

    // Metadados do Desafio
    const [tituloGeral, setTituloGeral] = useState("");
    const [capa, setCapa] = useState("");
    const [tentativas, setTentativas] = useState(1);
    
    // Seleção de Área e Subcategoria
    const [area, setArea] = useState("Tecnologia");
    const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState("");

    // Estrutura das 6 Questões (Inicialmente vazias)
    const [exercicios, setExercicios] = useState(
        Array(6).fill(null).map(() => ({
            perguntaTexto: "",
            perguntaImagem: "",
            alternativaCorreta: "",
            alternativas: {
                a: { texto: "", imagem: "" },
                b: { texto: "", imagem: "" },
                c: { texto: "", imagem: "" },
                d: { texto: "", imagem: "" }
            }
        }))
    );

    // Reseta a subcategoria se mudar a área para evitar erros
    useEffect(() => {
        setSubcategoriaSelecionada("");
    }, [area]);

    // Atualiza o enunciado ou a resposta correta da questão
    const handleQuestaoChange = (index, campo, valor) => {
        const novosExercicios = [...exercicios];
        novosExercicios[index] = { ...novosExercicios[index], [campo]: valor };
        setExercicios(novosExercicios);
    };

    // Atualiza o texto das alternativas (a, b, c, d)
    const handleAltChange = (exIndex, letra, campo, valor) => {
        const novosExercicios = [...exercicios];
        novosExercicios[exIndex].alternativas[letra] = { 
            ...novosExercicios[exIndex].alternativas[letra], 
            [campo]: valor 
        };
        setExercicios(novosExercicios);
    };

    const salvarDesafios = async () => {
        // Validação 1: Campos principais
        if (!tituloGeral || !area || !subcategoriaSelecionada) {
            alert("Preencha o Título, Área e Subcategoria.");
            return;
        }

        // Validação 2: Filtrar questões vazias
        // Só aceita questões que tenham Texto E uma Alternativa Correta marcada
        const questoesValidas = exercicios.filter(q => 
            q.perguntaTexto.trim() !== "" && q.alternativaCorreta !== ""
        );

        if (questoesValidas.length === 0) {
            alert("Preencha pelo menos uma questão completa (Enunciado e Resposta Correta).");
            return;
        }

        setLoading(true);
        try {
            // Gravar no Firebase
            await addDoc(collection(db, "desafios"), {
                titulo: tituloGeral,
                area,
                subcategoria: subcategoriaSelecionada, // "React.js", "Git e GitHub", etc.
                imagemCapa: capa || "https://placehold.co/600x400?text=Quiz",
                tentativasPermitidas: Number(tentativas),
                tipo: "quiz", 
                questoes: questoesValidas, // Envia apenas as questões preenchidas
                dataCriacao: new Date().toISOString()
            });
            
            alert("Desafio publicado com sucesso!");
            window.location.reload(); // Recarrega para limpar o formulário
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao publicar o desafio.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Sidebar consistente com o Admin Principal */}
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
                        
                        {/* --- BLOCO 1: CONFIGURAÇÕES GERAIS --- */}
                        <div className={styles.metaBox}>
                            <h3>1. Dados do Desafio</h3>
                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>Título do Quiz</label>
                                <input 
                                    className={styles.inputField} 
                                    placeholder="Ex: Git Básico - Nível 1" 
                                    value={tituloGeral} 
                                    onChange={e => setTituloGeral(e.target.value)} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
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

                                <div className={styles.inputGroup} style={{ flex: 1, minWidth: '200px' }}>
                                    <label className={styles.fieldLabel}>Matéria (Capítulo)</label>
                                    <select className={styles.inputField} value={subcategoriaSelecionada} onChange={e => setSubcategoriaSelecionada(e.target.value)}>
                                        <option value="">-- Selecione --</option>
                                        {OPCOES_POR_AREA[area]?.map((op) => (
                                            <option key={op} value={op}>{op}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <div className={styles.inputGroup} style={{ flex: 2 }}>
                                    <label className={styles.fieldLabel}>Capa (URL da Imagem)</label>
                                    <input className={styles.inputField} placeholder="https://..." value={capa} onChange={e => setCapa(e.target.value)} />
                                </div>
                                <div className={styles.inputGroup} style={{ flex: 1 }}>
                                    <label className={styles.fieldLabel}>Tentativas</label>
                                    <input className={styles.inputField} type="number" min="1" value={tentativas} onChange={e => setTentativas(e.target.value)} />
                                </div>
                            </div>
                            
                            {capa && <img src={capa} alt="Preview" style={{ height: '100px', marginTop: '10px', borderRadius: '6px', objectFit: 'cover' }} onError={(e)=>e.target.style.display='none'} />}
                        </div>

                        <hr className={styles.divider} />

                        {/* --- BLOCO 2: LISTA DE QUESTÕES --- */}
                        <div className={styles.blocksList}>
                            {exercicios.map((ex, index) => (
                                <div key={index} className={styles.blockItem}>
                                    <div className={styles.blockHeader}>
                                        <span className={styles.blockLabel} style={{background: '#2563EB', color: 'white'}}>QUESTÃO {index + 1}</span>
                                    </div>
                                    
                                    <div className={styles.inputGroup}>
                                        <label className={styles.fieldLabel}>Enunciado</label>
                                        <textarea 
                                            className={styles.textAreaBlock} 
                                            placeholder="Digite a pergunta aqui..." 
                                            value={ex.perguntaTexto} 
                                            onChange={e => handleQuestaoChange(index, 'perguntaTexto', e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <input className={styles.inputField} placeholder="URL de imagem de apoio (opcional)" value={ex.perguntaImagem} onChange={e => handleQuestaoChange(index, 'perguntaImagem', e.target.value)} />
                                        {ex.perguntaImagem && <img src={ex.perguntaImagem} alt="" style={{height:'60px', marginTop:'5px'}} onError={(e)=>e.target.style.display='none'}/>}
                                    </div>

                                    {/* Alternativas */}
                                    <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                        <p style={{fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', color: '#555'}}>ALTERNATIVAS (Marque a correta):</p>
                                        
                                        {['a', 'b', 'c', 'd'].map((letra) => (
                                            <div key={letra} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                                                <input 
                                                    type="radio" 
                                                    name={`correta-${index}`} 
                                                    checked={ex.alternativaCorreta === letra} 
                                                    onChange={() => handleQuestaoChange(index, 'alternativaCorreta', letra)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563EB' }}
                                                />
                                                <span style={{ fontWeight: 'bold', width: '20px', textTransform: 'uppercase' }}>{letra})</span>
                                                
                                                <input 
                                                    className={styles.inputField} 
                                                    placeholder={`Resposta da opção ${letra.toUpperCase()}`} 
                                                    value={ex.alternativas[letra].texto} 
                                                    onChange={e => handleAltChange(index, letra, 'texto', e.target.value)} 
                                                    style={{ flex: 1 }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}