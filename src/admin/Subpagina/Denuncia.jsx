import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../FirebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import styles from '../Admin.module.css';

const Denuncia = () => {
    const [denuncias, setDenuncias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const fetchDenuncias = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "denuncias"));
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

        fetchDenuncias();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Deseja marcar como resolvida e excluir esta denúncia?")) {
            try {
                await deleteDoc(doc(db, "denuncias", id));
                setDenuncias(denuncias.filter(d => d.id !== id));
            } catch (error) {
                alert("Erro ao excluir denúncia. Verifique as permissões do Firebase.");
            }
        }
    };

    if (loading) return <p className={styles.loading}>Carregando denúncias...</p>;

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
                    <li><Link to="/admin/denuncia" className={styles.navLink}><img src="/denuncia.png" alt="U" /><span className={styles.linkText}>Denuncia</span></Link></li>
                </ul>
            </aside>

            <main className={styles.main}>
                <h2 className={styles.mainTitle}>Revisão de Denúncias</h2>
                
                {denuncias.length === 0 ? (
                    <div className={styles.okMsg}>Nenhuma denúncia pendente.</div>
                ) : (
                    <div className={styles.denunciaGrid} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {denuncias.map((denuncia) => (
                            <div key={denuncia.id} className={styles.denunciaCard} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #ff4d4f', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                <div className={styles.info}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                        {denuncia.tipo || "Denúncia"} - <span style={{ color: '#ff4d4f' }}>{denuncia.status}</span>
                                    </h3>
                                    
                                    <p style={{ margin: '5px 0', fontSize: '15px' }}><strong>Motivo:</strong> {denuncia.motivo}</p>
                                    <p style={{ margin: '5px 0', fontSize: '15px' }}><strong>Detalhes:</strong> {denuncia.detalhes}</p>
                                    
                                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
                                    
                                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}><strong>ID do Denunciante:</strong> {denuncia.denuncianteId}</p>
                                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}><strong>ID do Post:</strong> {denuncia.postId}</p>
                                    
                                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                                        Data: {denuncia.data?.toDate ? denuncia.data.toDate().toLocaleString('pt-BR') : 'Data indisponível'}
                                    </p>
                                </div>
                                <button
                                    className={styles.btnDeleteComment}
                                    onClick={() => handleDelete(denuncia.id)}
                                >
                                    Resolver / Excluir
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Denuncia;