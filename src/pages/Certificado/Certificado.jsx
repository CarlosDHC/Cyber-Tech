import styles from "./Certificado.module.css";
import html2pdf from "html2pdf.js";

import { useEffect, useState } from "react";
import { auth, db } from "../../../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function CertificadoMAR({ nomeCurso, cargaHoraria }) {
  
  const [nomeUsuario, setNomeUsuario] = useState("");

  const curso = nomeCurso || "Tecnologia";
  const horas = cargaHoraria || "10 horas";

  useEffect(() => {

    const buscarNome = async () => {

      const user = auth.currentUser;

      if (!user) {
        setNomeUsuario("Estudante");
        return;
      }

      try {

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

          const dados = docSnap.data();

          const nomeCompleto = dados.name || "";
          const apelido = dados.apelido || "";

          let nomeFinal = "";

          if (nomeCompleto && apelido) {

            // Exemplo: Carlos Silva Carlinhos
            nomeFinal = `${nomeCompleto}`;

          } else {

            nomeFinal =
              nomeCompleto ||
              "Estudante";
          }

          setNomeUsuario(nomeFinal);

        } else {

          setNomeUsuario("Estudante");

        }

      } catch (erro) {

        console.log("Erro ao buscar nome:", erro);
        setNomeUsuario("Estudante");

      }

    };

    buscarNome();

  }, []);

  const usuario = nomeUsuario || "Estudante";

  const baixarCertificado = () => {

    window.scrollTo(0, 0);

    const elemento = document.getElementById("certificado");

    if (!elemento) return;

    const opt = {
      margin: 0,
      filename: `Certificado_${usuario}.pdf`,

      image: {
        type: "jpeg",
        quality: 0.98,
      },

      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
      },

      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "landscape",
      },
    };

    html2pdf()
      .set(opt)
      .from(elemento)
      .save()
      .then(() => {

        const certificadosSalvos =
          JSON.parse(localStorage.getItem("certificadosUsuario")) || [];

        if (!certificadosSalvos.includes("TEC")) {

          certificadosSalvos.push("TEC");

        }

        localStorage.setItem(
          "certificadosUsuario",
          JSON.stringify(certificadosSalvos)
        );

      });

  };

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (

    <div className={styles.container}>

      <div
        id="certificado"
        className={styles.certificado}
      >

        <div className={styles.topo}></div>

        <h1 className={styles.titulo}>
          CERTIFICADO
        </h1>

        <p className={styles.subtitulo}>
          ESTE CERTIFICADO COMPROVA QUE
        </p>

        <div className={styles.logo}>
          <img
            src="/CybertechLogo.png"
            alt="Logo"
          />
        </div>

        <div className={styles.selo}>
          <img
            src="/Selo.jpg"
            alt="Selo"
          />
        </div>

        <h2 className={styles.nome}>
          {usuario}
        </h2>

        <p className={styles.texto}>
          Concluiu com êxito o curso de{" "}
          <strong>{curso}</strong>,
          com carga horária de{" "}
          <strong>{horas}</strong>,
          demonstrando dedicação e desempenho exemplares.
        </p>

        <p className={styles.data}>
          Emitido em {dataHoje}
        </p>

        <div className={styles.assinatura}>

          <div className={styles.imagemAssinatura}>
            <img
              src="/AssinaturaCertificado.png"
              alt="Assinatura"
            />
          </div>

          <div className={styles.linha}></div>

          <p>CyberTech</p>

          <span>
            Diretoria Responsável
          </span>

        </div>

      </div>

      <button
        className={styles.botao}
        onClick={baixarCertificado}
      >

        <span className={styles.icone}>
          🎓
        </span>

        Baixar Certificado

      </button>

    </div>

  );

}