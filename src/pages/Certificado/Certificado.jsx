import styles from "./Certificado.module.css";

export default function Certificado() {

  const usuario = "João";
  const curso = "Tecnologia";
  const data = "30/03/2026";
  const cargaHoraria = "10 horas"

  return (
    <div className={styles.container}>

      <div className={styles.certificado}>

        <h1 className={styles.titulo}>CERTIFICADO</h1>

        <p className={styles.paragrafo}>
          Certificamos que <span className={styles.nome}>{usuario} </span> 
          concluiu com sucesso o curso de <span className={styles.curso}>{curso}</span>, 
          com carga horária de <strong>{cargaHoraria}</strong>, demonstrando dedicação e comprometimento durante sua formação.
        </p>

        <p className={styles.data}>
          Emitido em {data}
        </p>

        <div className={styles.assinatura}>
          <div className={styles.linha}></div>
          <p>CyberTech</p>
        </div>

      </div>

    </div>
  );
}