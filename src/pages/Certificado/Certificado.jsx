import styles from "./Certificado.module.css";
import html2pdf from "html2pdf.js";

// Adicionamos { nomeUsuario, nomeCurso, cargaHoraria } como props
export default function Certificado({ nomeUsuario, nomeCurso, cargaHoraria }) {

  const baixarCertificado = () => {
    const elemento = document.getElementById("certificado");

    const opt = {
      margin: 0,
      filename: `Certificado_${nomeUsuario}.pdf`, // Nome do arquivo personalizado
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 3,
        scrollX: 0,
        scrollY: -window.scrollY,
        useCORS: true // Importante para carregar imagens externas/Firebase
      },
      jsPDF: {
        unit: "px",
        format: [900, 600],
        orientation: "landscape"
      }
    };

    html2pdf().set(opt).from(elemento).save();
  };

  // Pegamos a data atual automaticamente
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (
    <div className={styles.container}>
      <div id="certificado" className={styles.certificado}>
        <div className={styles.topo}></div>

        <h1 className={styles.titulo}>CERTIFICADO</h1>

        <p className={styles.subtitulo}>
          ESTE CERTIFICADO COMPROVA QUE
        </p>

        <div className={styles.logo}>
          <img src="/LogoEniacDourada.png" alt="logo" />
        </div>

        <div className={styles.selo}>
          <img src="/Selo.jpg" alt="Selo" />
        </div>

        {/* USANDO AS PROPS AQUI */}
        <h2 className={styles.nome}>{nomeUsuario || "Estudante"}</h2>

        <p className={styles.texto}>
          Concluiu com êxito o curso <strong>{nomeCurso || "Tecnologia"}</strong>,
          com carga horária de <strong>{cargaHoraria || "2 horas"}</strong>,
          demonrando dedicação e desempenho exemplares.
        </p>

        <p className={styles.data}>
          Emitido em {dataHoje}
        </p>

        <div className={styles.assinatura}>
          <div className={styles.imagemAssinatura}>
            <img src="/AssinaturaCertificado.png" alt="assinatura" />
          </div>
          <div className={styles.linha}></div>
          <p>CyberTech</p>
          <span>Diretoria Responsável</span>
        </div>
      </div>

      <button className={styles.botao} onClick={baixarCertificado}>
        Baixar Certificado
      </button>
    </div>
  );
}