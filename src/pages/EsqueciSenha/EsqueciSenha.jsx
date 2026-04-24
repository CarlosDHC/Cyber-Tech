import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./EsqueciSenha.module.css";

import { auth } from "../../../FirebaseConfig.js";
import { sendPasswordResetEmail } from "firebase/auth";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("E-mail de redefinição enviado! Verifique a sua caixa de entrada ou spam.");
      setEmail(""); // Limpa o campo após sucesso
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      if (err.code === 'auth/user-not-found') {
        setError("Não existe nenhuma conta registada com este e-mail.");
      } else if (err.code === 'auth/invalid-email') {
        setError("O e-mail introduzido é inválido.");
      } else {
        setError("Ocorreu um erro ao tentar enviar o e-mail.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.esqueciContainer}>
      <div className={styles.esqueciWrapper}>
        
        {/* Lado Esquerdo: Imagem */}
        <div className={styles.imageSection}>
          {/* Imagem configurada no CSS */}
        </div>

        {/* Lado Direito: Formulário */}
        <div className={styles.formSection}>
          <h2>Recuperar Senha</h2>
          <p className={styles.esqueciSubtitle}>
            Insira o seu e-mail abaixo e enviaremos um link para redefinir a sua senha.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail registado</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>

            {/* Mensagens de Feedback */}
            {error && <div className={styles.errorMessage}>{error}</div>}
            {message && <div className={styles.successMessage}>{message}</div>}

            <button type="submit" className={styles.esqueciButton} disabled={loading}>
              {loading ? "A Enviar..." : "Enviar link de recuperação"}
            </button>
          </form>

          <div className={styles.switchAuth}>
            <p>
              <span style={{ fontWeight: 'bold', color: "white" }}>Lembrou-se da senha?</span>{" "}
              <Link to="/login">
                <span style={{ fontWeight: "normal", color: "lightgray" }}>Voltar ao Login</span>
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EsqueciSenha;