import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CerDesbloqueados() {

  const [certificados, setCertificados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {

    const lista =
      JSON.parse(localStorage.getItem("certificadosUsuario")) || [];

    setCertificados(lista);

  }, []);

  return (

    <div style={{ padding: "40px", textAlign: "center" }}>

      <h1>Meus Certificados</h1>

      {certificados.length === 0 && (
        <p>Você ainda não desbloqueou nenhum certificado.</p>
      )}

      {certificados.includes("RH") && (
        <div style={{ marginTop: "20px" }}>
          <h3>Certificado de Recursos Humanos</h3>

          <button onClick={() => navigate("/certificado/rh")}>
            Visualizar Certificado
          </button>
        </div>
      )}

      {certificados.includes("ENG") && (
        <div style={{ marginTop: "20px" }}>
          <h3>Certificado de Engenharia</h3>

          <button onClick={() => navigate("/certificado/engenharia")}>
            Visualizar Certificado
          </button>
        </div>
      )}

      {certificados.includes("DIR") && (
        <div style={{ marginTop: "20px" }}>
          <h3>Certificado de Direito</h3>

          <button onClick={() => navigate("/certificado/direito")}>
            Visualizar Certificado
          </button>
        </div>
      )}

      {certificados.includes("MAR") && (
        <div style={{ marginTop: "20px" }}>
          <h3>Certificado de Marketing</h3>

          <button onClick={() => navigate("/certificado/marketing")}>
            Visualizar Certificado
          </button>
        </div>
      )}

    </div>

  );

}