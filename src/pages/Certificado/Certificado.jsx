import styles from "./Certificado.module.css";
import html2pdf from "html2pdf.js";

export default function Certificado() {

const baixarCertificado = () => {

  const elemento = document.getElementById("certificado");

  const opt = {
    margin: 0,
    filename: "certificado.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 3
    },
    jsPDF: {
      unit: "px",
      format: [900, 600],
      orientation: "landscape"
    },
    pagebreak: {
      mode: ["avoid-all"]
    }
  };

  html2pdf().set(opt).from(elemento).save();
};

  const usuario = "João da Silva";
  const curso = "Tecnologia";
  const data = "30/03/2026";
  const cargaHoraria = "10 horas";

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

        <h2 className={styles.nome}>{usuario}</h2>

        <p className={styles.texto}>
          Concluiu com êxito o curso <strong>{curso}</strong>,
          com carga horária de <strong>{cargaHoraria}</strong>,
          demonstrando dedicação e desempenho exemplares.
        </p>

        <p className={styles.data}>
          Emitido em {data}
        </p>

  <div className={styles.assinatura}>
  
  <div className={styles.imagemAssinatura}>
  <img 
    src="/AssinaturaCertificado.png"alt="assinatura"
  />
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