import React, { useEffect, useState } from 'react';
import { db } from '../../../FirebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import styles from '../Admin.module.css';

const Denuncia = () => {
    const [denuncias, setDenuncias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDenuncias = async () => {
            const querySnapshot = await getDocs(collection(db, "denuncias"));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDenuncias(data);
            setLoading(false);
        };

        fetchDenuncias();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Deseja marcar como resolvida e excluir esta denúncia?")) {
            await deleteDoc(doc(db, "denuncias", id));
            setDenuncias(denuncias.filter(d => d.id !== id));
        }
    };

    if (loading) return <p>Carregando denúncias...</p>;

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
                    <li><Link to="/admin/denucia" className={styles.navLink}><img src="/denuncia.png" alt="U" /><span className={styles.linkText}>Denuncia</span></Link></li>
                </ul>
            </aside>
            <h2>Revisão de Denúncias</h2>
            {denuncias.length === 0 ? (
                <p>Nenhuma denúncia pendente.</p>
            ) : (
                denuncias.map((denuncia) => (
                    <div key={denuncia.id} className={styles.denunciaCard}>
                        <div className={styles.info}>
                            <strong>Categoria: {denuncia.categoria}</strong>
                            <p>{denuncia.descricao}</p>
                            <small>Data: {denuncia.data?.toDate().toLocaleDateString()}</small>
                        </div>
                        <button
                            className={styles.btnDelete}
                            onClick={() => handleDelete(denuncia.id)}
                        >
                            Resolver/Excluir
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default Denuncia;