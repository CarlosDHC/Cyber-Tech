import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../FirebaseConfig';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, getDoc } from 'firebase/firestore';
import { analisarDenunciaComIA } from '../../services/moderacao';
import styles from '../Admin.module.css';

const Denuncia = () => {
    const [denuncias, setDenuncias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);
    const [postsOriginais, setPostsOriginais] = useState({});
    const [isAnalisandoIA, setIsAnalisandoIA] = useState(false);

    const fetchDenuncias = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "denuncias"), orderBy("data", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDenuncias(data);
        } catch (error) {
            console.error("Erro ao buscar denúncias:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDenuncias(); }, []);

    const buscarPostOriginal = async (postId) => {
        if (!postId || postId === "N/A") return;
        try {
            let postRef = doc(db, "forum_posts", postId);
            let postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                postRef = doc(db, "forum_messages", postId);
                postSnap = await getDoc(postRef);
            }

            if (postSnap.exists()) {
                const dados = postSnap.data();
                const textoExibicao = `${dados.title ? dados.title.toUpperCase() + '\n\n' : ''}${dados.content || dados.texto || dados.mensagem || ""}`;
                setPostsOriginais(prev => ({ ...prev, [postId]: { encontrado: true, texto: textoExibicao, imagem: dados.imageUrl || "" } }));
            } else {
                setPostsOriginais(prev => ({ ...prev, [postId]: { encontrado: false, erro: "O conteúdo original já foi removido." } }));
            }
        } catch (error) {
            setPostsOriginais(prev => ({ ...prev, [postId]: { encontrado: false, erro: "Erro ao carregar original." } }));
        }
    };

    const executarExclusaoNoBanco = async (denuncia) => {
        try {
            if (!denuncia.postId || denuncia.postId === "N/A") return false;
            const postRef = doc(db, "forum_posts", denuncia.postId);
            const isComment = denuncia.tipo === "Denúncia de Comentário";

            if (isComment) {
                const postSnap = await getDoc(postRef);
                if (postSnap.exists()) {
                    const postData = postSnap.data();
                    if (postData.comments && postData.comments.length > 0) {
                        const novosComentarios = postData.comments.filter(c => 
                            String(c.id) !== String(denuncia.commentId) && c.text !== denuncia.textoComentario
                        );
                        await updateDoc(postRef, { comments: novosComentarios });
                    }
                }
            } else {
                await deleteDoc(postRef);
            }
            
            setPostsOriginais(prev => ({ ...prev, [denuncia.postId]: { encontrado: false, erro: "Conteúdo removido pela IA de moderação." } }));
            return true; 
        } catch (error) {
            return false;
        }
    };

    const handleDeleteOriginalContent = async (denuncia) => {
        const msg = denuncia.tipo === "Denúncia de Comentário" 
            ? "ATENÇÃO: Deseja excluir PERMANENTEMENTE este comentário?" 
            : "ATENÇÃO: Deseja excluir PERMANENTEMENTE o post inteiro do fórum?";

        if (window.confirm(msg)) {
            const sucesso = await executarExclusaoNoBanco(denuncia);
            if (sucesso) {
                await handleUpdateStatus(denuncia.id, 'solucionado');
                alert("Conteúdo removido com sucesso!");
            } else {
                alert("Falha ao remover. O conteúdo já pode ter sido apagado.");
            }
        }
    };

    const handleUpdateStatus = async (id, novoStatus) => {
        try {
            await updateDoc(doc(db, "denuncias", id), { status: novoStatus });
            setDenuncias(prev => prev.map(d => d.id === id ? { ...d, status: novoStatus } : d));
        } catch (error) {}
    };

    const handleDelete = async (id) => {
        if (window.confirm("Deseja excluir este registro de denúncia do histórico?")) {
            try {
                await deleteDoc(doc(db, "denuncias", id));
                setDenuncias(prev => prev.filter(d => d.id !== id));
            } catch (error) { alert("Erro ao excluir."); }
        }
    };

    // 🔥 O SEGREDO ESTÁ AQUI: A IA AGORA VÊ A IMAGEM ANTES DE JULGAR
    const rodarTriagemIA = async () => {
        setIsAnalisandoIA(true);
        const denunciasPendentes = denuncias.filter(d => d.status === "pendente");

        if (denunciasPendentes.length === 0) {
            alert("Não existem denúncias pendentes para a IA analisar no momento.");
            setIsAnalisandoIA(false);
            return;
        }

        let atualizadas = 0;
        let excluidas = 0;

        for (let denuncia of denunciasPendentes) {
            try {
                let linkDaImagemParaIA = "";
                let textoParaIA = denuncia.textoComentario || "";

                // Se a denúncia for de um Post Inteiro, vamos buscar a imagem dele à base de dados primeiro!
                if (denuncia.tipo === "Denúncia de Post" && denuncia.postId && denuncia.postId !== "N/A") {
                    const postRef = doc(db, "forum_posts", denuncia.postId);
                    const postSnap = await getDoc(postRef);
                    
                    if (postSnap.exists()) {
                        const data = postSnap.data();
                        linkDaImagemParaIA = data.imageUrl || ""; // Pegamos a imagem!
                        textoParaIA = `${data.title}\n${data.content}`; // Pegamos o texto exato do post
                    }
                }

                // Agora sim enviamos tudo para a IA avaliar
                const veredicto = await analisarDenunciaComIA(denuncia.motivo, denuncia.detalhes, textoParaIA, linkDaImagemParaIA);
                const denunciaRef = doc(db, "denuncias", denuncia.id);

                if (veredicto === "GRAVE") {
                    const deletadoComSucesso = await executarExclusaoNoBanco(denuncia);
                    if (deletadoComSucesso) {
                        await updateDoc(denunciaRef, { statusIA: "GRAVE - EXCLUÍDO", status: "solucionado" });
                        excluidas++;
                    } else {
                        await updateDoc(denunciaRef, { statusIA: "GRAVE - ERRO AO EXCLUIR", status: "pendente" });
                    }
                } 
                else if (veredicto === "DESCARTAR") {
                    await updateDoc(denunciaRef, { statusIA: "DESCARTAR (SEGURO)", status: "solucionado" });
                } 
                else {
                    await updateDoc(denunciaRef, { statusIA: "ANALISAR (DÚVIDA)", status: "pendente" });
                }
                atualizadas++;
            } catch (error) {
                console.error("Erro ao analisar a denúncia " + denuncia.id, error);
            }
        }

        alert(`Triagem concluída! A IA avaliou ${atualizadas} denúncia(s) e deletou ${excluidas} conteúdo(s) explicitamente obscenos.`);
        setIsAnalisandoIA(false);
        fetchDenuncias(); 
    };

    if (loading) return <div className={styles.emptyMessage}>Carregando central de moderação...</div>;

    return (
        <div className={styles.container}>
            <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
                <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}><img src="/menu.png" alt="menu" /></button>
                <h2 className={styles.title}>ADMIN</h2>
                <ul className={styles.navList}>
                    <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
                    <li><Link to="/admin/notas" className={styles.navLink}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Gestão de Notas</span></Link></li>
                    <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Criar Blog</span></Link></li>
                    <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Criar Desafios</span></Link></li>
                    <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Histórico de curtidas</span></Link></li>
                    <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="L" /><span className={styles.linkText}>Comentários Forum</span></Link></li>
                    <li><Link to="/admin/denuncias" className={`${styles.navLink} ${styles.active}`}><img src="/denuncia.png" alt="U" /><span className={styles.linkText}>Denúncias</span></Link></li>
                </ul>
            </aside>

            <main className={styles.main}>
                <div className={styles.headerFlex}>
                    <div>
                        <h1>Moderação & Revisão</h1>
                        <span className={styles.warning}>{denuncias.length} registros encontrados</span>
                    </div>
                    
                    <button onClick={rodarTriagemIA} disabled={isAnalisandoIA} className={styles.publishBtn} style={isAnalisandoIA ? {} : { backgroundColor: '#8b5cf6' }}>
                        {isAnalisandoIA ? "A IA está a analisar..." : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                                Triagem Automática (IA)
                            </>
                        )}
                    </button>
                </div>
                
                <div className={styles.blocksList}>
                    {denuncias.map((denuncia) => (
                        <div key={denuncia.id} className={styles.blockItem} style={{ borderLeft: denuncia.statusIA?.includes('GRAVE') ? '5px solid #ef4444' : denuncia.status === 'pendente' ? '5px solid #f59e0b' : '5px solid #10b981' }}>
                            <div className={styles.blockHeader}>
                                <div>
                                    <strong style={{ fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        {denuncia.motivo} 
                                        {denuncia.statusIA && (
                                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', backgroundColor: denuncia.statusIA?.includes('GRAVE') ? '#fef2f2' : denuncia.statusIA?.includes('DESCARTAR') ? '#f1f5f9' : '#fef3c7', color: denuncia.statusIA?.includes('GRAVE') ? '#ef4444' : denuncia.statusIA?.includes('DESCARTAR') ? '#64748b' : '#d97706' }}>
                                                IA: {denuncia.statusIA}
                                            </span>
                                        )}
                                    </strong>
                                    <span className={styles.blockLabel} style={{ marginTop: '8px', display: 'inline-block' }}>{denuncia.tipo}</span>
                                </div>
                                <span className={denuncia.status === 'pendente' ? styles.warning : styles.highScore} style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{denuncia.status}</span>
                            </div>

                            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                                <label className={styles.fieldLabel}>Relato do Usuário</label>
                                <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>{denuncia.detalhes}</p>

                                {denuncia.tipo === "Denúncia de Comentário" && denuncia.textoComentario && (
                                    <div className={styles.postContentBox} style={{ borderLeftColor: '#ef4444' }}>
                                        <label className={styles.fieldLabel}>COMENTÁRIO DENUNCIADO</label>
                                        <p style={{ margin: 0, color: '#1e293b', fontStyle: 'italic' }}>"{denuncia.textoComentario}"</p>
                                    </div>
                                )}

                                {denuncia.postId !== "N/A" && (
                                    <div className={styles.alternativasGrid}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                            <label className={styles.fieldLabel} style={{ margin: 0 }}>POST ORIGINAL ASSOCIADO</label>
                                            <div className={styles.blockActions}>
                                                <button onClick={() => buscarPostOriginal(denuncia.postId)} className={styles.btnView}>Ver Post</button>
                                                <button onClick={() => handleDeleteOriginalContent(denuncia)} className={styles.btnDeleteOriginal}>
                                                    {denuncia.tipo === "Denúncia de Comentário" ? "Apagar Só Comentário" : "Apagar Post Original"}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {postsOriginais[denuncia.postId] && (
                                            <div className={styles.postCard} style={{ margin: '10px 0 0 0', padding: '16px' }}>
                                                {postsOriginais[denuncia.postId].erro ? (
                                                    <p className={styles.warning} style={{ margin: 0 }}>{postsOriginais[denuncia.postId].erro}</p>
                                                ) : (
                                                    <>
                                                        <p style={{ fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap', marginBottom: '12px' }}>{postsOriginais[denuncia.postId].texto}</p>
                                                        {postsOriginais[denuncia.postId].imagem && (
                                                            <div style={{ textAlign: 'center' }}>
                                                                <img src={postsOriginais[denuncia.postId].imagem} alt="Post" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }} />
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Registrado em: {denuncia.data?.toDate().toLocaleString('pt-BR')}</span>
                                <div className={styles.blockActions}>
                                    <button onClick={() => handleUpdateStatus(denuncia.id, denuncia.status === 'pendente' ? 'solucionado' : 'pendente')} className={denuncia.status === 'pendente' ? styles.btnResolve : styles.btnReopen}>
                                        {denuncia.status === 'pendente' ? 'Marcar como Resolvido' : 'Reabrir Denúncia'}
                                    </button>
                                    <button onClick={() => handleDelete(denuncia.id)} className={styles.btnDeleteRecord}>Excluir Registro</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Denuncia;