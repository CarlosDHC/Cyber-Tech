import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CerDesbloqueados() {

  const [certificados, setCertificados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const lista =
      JSON.parse(localStorage.getItem("certificadosUsuario")) || [];
    setCertificados(lista);
  }, []);

  const listaCertificados = [
    { id: "TEC", nome: "💻 Tecnologia", rota: "/Certificado/Certificado.jsx" },
    { id: "RH", nome: "🏢 RH", rota: "/Certificado/CertificadoRH.jsx" },
    { id: "ENG", nome: "⚙️ Engenharia", rota: "/Certificado/CertificadoENG.jsx" },
    { id: "DIR", nome: "⚖️ Direito", rota: "/Certificado/CertificadoDIR.jsx" },
    { id: "MAR", nome: "📊 Marketing", rota: "/Certificado/CertificadoMAR.jsx" }
  ];

  return (
    <div style={container}>

      <motion.h1
        style={titulo}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🎓 Meus Certificados
      </motion.h1>

      {certificados.length === 0 && (
        <p style={mensagem}>
          Você ainda não desbloqueou nenhum certificado.
        </p>
      )}

      <div style={grid}>

        {listaCertificados.map((cert, index) => {

          if (!certificados.includes(cert.id)) return null;

          return (

            <motion.div
              key={cert.id}
              style={card}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.05 }}
            >

              <h3>{cert.nome}</h3>

              <button
                style={botao}
                onClick={() => navigate(cert.rota)}
              >
                Visualizar Certificado
              </button>

            </motion.div>

          );

        })}

      </div>

    </div>
  );
}

/* ---------- ESTILOS ---------- */

const container = {
  padding: "50px",
  textAlign: "center",
  minHeight: "80vh",
  background: "#f5f7fb"
};

const titulo = {
  fontSize: "36px",
  marginBottom: "40px"
};

const mensagem = {
  fontSize: "18px",
  color: "#666"
};

const grid = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "25px"
};

const card = {
  background: "#fff",
  borderRadius: "12px",
  padding: "30px",
  width: "260px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  transition: "all 0.3s ease"
};

const botao = {
  marginTop: "18px",
  padding: "12px 20px",
  border: "none",
  borderRadius: "6px",
  background: "#0a66c2",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px"
};