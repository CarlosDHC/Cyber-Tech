import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./CerDesbloqueados.module.css"; 

// Adicionada a propriedade "imagem" com os caminhos da pasta public
const LISTA_CERTIFICADOS = [
  { id: "TEC", nome: "Tecnologia", rota: "/Certificado/Certificado.jsx", imagem: "/tec-card.jpg" },
  { id: "RH", nome: "RH", rota: "/Certificado/CertificadoRH.jsx", imagem: "/rh-card.jpg" },
  { id: "ENG", nome: "Engenharia", rota: "/Certificado/CertificadoENG.jsx", imagem: "/eng-card.jpg" },
  { id: "DIR", nome: "Direito", rota: "/Certificado/CertificadoDIR.jsx", imagem: "/direito-card.jpg" },
  { id: "MAR", nome: "Marketing", rota: "/Certificado/CertificadoMAR.jsx", imagem: "/marketing-card.jpg" }
];

export default function CerDesbloqueados() {
  const [certificados, setCertificados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("certificadosUsuario")) || [];
    setCertificados(lista);
  }, []);

  const certificadosDesbloqueados = LISTA_CERTIFICADOS.filter(cert =>
    certificados.includes(cert.id)
  );

  return (
    <div className={styles.container}>
      
      <motion.h1
        className={styles.titulo}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🎓 Meus Certificados
      </motion.h1>

      {certificadosDesbloqueados.length === 0 ? (
        <p className={styles.mensagem}>
          Você ainda não desbloqueou nenhum certificado.
        </p>
      ) : (
        <div className={styles.grid}>
          {certificadosDesbloqueados.map((cert, index) => (
            <motion.div
              key={cert.id}
              className={styles.card}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Imagem adicionada aqui */}
              <img 
                src={cert.imagem} 
                alt={`Imagem do curso de ${cert.nome}`} 
                className={styles.cardImagem} 
              />

              <h3 className={styles.cardTitulo}>{cert.nome}</h3>

              <button
                className={styles.botao}
                onClick={() => navigate(cert.rota)}
              >
                Visualizar Certificado
              </button>
            </motion.div>
          ))}
        </div>
      )}
      
    </div>
  );
}