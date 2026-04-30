import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../FirebaseConfig';
import { 
    collection, getDocs, updateDoc, deleteDoc, doc, 
    query, orderBy, getDoc 
} from 'firebase/firestore';

// Usa o seu CSS padrão
import styles from '../Admin.module.css';

const Denuncia = () => {
    const [denuncias, setDenuncias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);
    const [postsOriginais, setPostsOriginais] = useState({});

    const fetchDenuncias = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "denuncias"), orderBy("data", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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
                
                setPostsOriginais(prev => ({
                    ...prev,
                    [postId]: {
                        encontrado: true,
                        texto: textoExibicao,
                        imagem: dados.imageUrl || dados.imagem || ""
                    }
                }));
            } else {
                setPostsOriginais(prev => ({ 
                    ...prev, 
                    [postId]: { encontrado: false, erro: "O conteúdo original já foi removido." } 
                }));
            }
        } catch (error) {
            setPostsOriginais(prev => ({ ...prev, [postId]: { encontrado: false, erro: "Erro ao carregar original." } }));
        }
    };

    const handleDeleteOriginalContent = async (postId, denunciaId) => {
        if (window.confirm("ATENÇÃO: Você deseja excluir PERMANENTEMENTE o post/comentário original do fórum?")) {
            try {
                await deleteDoc(doc(db, "forum_posts", postId));
                await deleteDoc(doc(db, "forum_messages", postId));
                await handleUpdateStatus(denunciaId, 'solucionado');
                alert("Conteúdo original removido com sucesso!");
                setPostsOriginais(prev => ({
                    ...prev,
                    [postId]: { encontrado: false, erro: "Conteúdo removido pelo administrador." }
                }));
            } catch (error) {
                alert("Erro ao tentar excluir o conteúdo original.");
            }
        }
    };

    const handleUpdateStatus = async (id, novoStatus) => {
        try {
            await updateDoc(doc(db, "denuncias", id), { status: novoStatus });
            setDenuncias(denuncias.map(d => d.id === id ? { ...d, status: novoStatus } : d));
        } catch (error) {
            alert("Erro ao atualizar status.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Deseja excluir este registro de denúncia do histórico?")) {
            try {
                await deleteDoc(doc(db, "denuncias", id));
                setDenuncias(denuncias.filter(d => d.id !== id));
            } catch (error) {
                alert("Erro ao excluir.");
            }
        }
    };

    if (loading) return <div className={styles.loading}>Carregando central de moderação...</div>;

    return (
        <div className={styles.container}>
            <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
                <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
                    <img src="/menu.png" alt="menu" />
                </button>
                <h2 className={styles.title}>ADMIN</h2>
                <ul className={styles.navList}>
                    <li><Link to="/admin" className={styles.navLink}><img src="/casa.png" alt="H" /><span className={styles.linkText}>Home</span></Link></li>
                    <li><Link to="/admin/notas" className={styles.navLink}><img src="/blog.png" alt="N" /><span className={styles.linkText}>Gestão de Notas</span></Link></li>
                    <li><Link to="/admin/newblog" className={styles.navLink}><img src="/inotas.png" alt="B" /><span className={styles.linkText}>Criar Blog</span></Link></li>
                    <li><Link to="/admin/newdesafios" className={styles.navLink}><img src="/idesafio.png" alt="D" /><span className={styles.linkText}>Criar Desafios</span></Link></li>
                    <li><Link to="/admin/curtidas" className={styles.navLink}><img src="/curti.png" alt="L" /><span className={styles.linkText}>Historico de curtidas</span></Link></li>
                    <li><Link to="/admin/comentarios" className={styles.navLink}><img src="/icomentarios.png" alt="L" /><span className={styles.linkText}>Comentarios Forum</span></Link></li>
                    <li><Link to="/admin/denuncias" className={styles.navLink}><img src="/denuncia.png" alt="U" /><span className={styles.linkText}>Denuncias</span></Link></li>
                </ul>
            </aside>

            <main className={styles.main}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className={styles.mainTitle}>Moderação & Revisão</h1>
                    <span style={{ color: '#666' }}>{denuncias.length} registros</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {denuncias.map((denuncia) => (
                        <div key={denuncia.id} style={{ 
                            backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            borderLeft: denuncia.status === 'pendente' ? '6px solid #ffa940' : '6px solid #52c41a',
                            overflow: 'hidden'
                        }}>
                            {/* Cabeçalho do Card */}
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#333' }}>{denuncia.motivo}</strong>
                                    <small style={{ color: '#888' }}>{denuncia.tipo}</small>
                                </div>
                                <span style={{ 
                                    padding: '5px 15px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                                    backgroundColor: denuncia.status === 'pendente' ? '#fff7e6' : '#f6ffed',
                                    color: denuncia.status === 'pendente' ? '#ffa940' : '#52c41a', border: '1px solid'
                                }}>
                                    {denuncia.status}
                                </span>
                            </div>

                            {/* Corpo do Card */}
                            <div style={{ padding: '20px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' }}>Relato do Usuário:</label>
                                <p style={{ margin: '5px 0 15px 0', color: '#444', lineHeight: '1.5' }}>{denuncia.detalhes}</p>

                                {/* Área de Revisão do Fórum */}
                                {denuncia.postId !== "N/A" && (
                                    <div style={{ backgroundColor: '#f0f2f5', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#555' }}>CONTEÚDO ORIGINAL DO FÓRUM</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => buscarPostOriginal(denuncia.postId)} className={styles.btnView}>
                                                    Ver Conteúdo
                                                </button>
                                                <button onClick={() => handleDeleteOriginalContent(denuncia.postId, denuncia.id)} className={styles.btnDeleteOriginal}>
                                                    Apagar Post Original
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {postsOriginais[denuncia.postId] && (
                                            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                                                {postsOriginais[denuncia.postId].erro ? (
                                                    <p style={{ color: '#ff4d4f', margin: 0, fontSize: '0.9rem' }}>{postsOriginais[denuncia.postId].erro}</p>
                                                ) : (
                                                    <>
                                                        <p style={{ fontSize: '0.95rem', margin: '0 0 10px 0', color: '#333', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                                                            {postsOriginais[denuncia.postId].texto}
                                                        </p>
                                                        {postsOriginais[denuncia.postId].imagem && (
                                                            <div style={{ textAlign: 'center' }}>
                                                                <img 
                                                                    src={postsOriginais[denuncia.postId].imagem} 
                                                                    alt="Post" 
                                                                    style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', border: '1px solid #eee', objectFit: 'contain' }} 
                                                                />
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Rodapé do Card */}
                            <div style={{ padding: '15px 20px', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee' }}>
                                <small style={{ color: '#999' }}>Registrado em: {denuncia.data?.toDate().toLocaleString('pt-BR')}</small>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button 
                                        onClick={() => handleUpdateStatus(denuncia.id, denuncia.status === 'pendente' ? 'solucionado' : 'pendente')}
                                        className={denuncia.status === 'pendente' ? styles.btnResolve : styles.btnReopen}
                                    >
                                        {denuncia.status === 'pendente' ? 'Resolver' : 'Reabrir'}
                                    </button>
                                    <button onClick={() => handleDelete(denuncia.id)} className={styles.btnDeleteRecord}>
                                        Excluir Registro
                                    </button>
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