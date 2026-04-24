import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

import { auth } from "../../../FirebaseConfig.js";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      // const user = userCredential.user;

      // Se passou por tudo, redireciona para a Home imediatamente
      navigate("/");

    } catch (err) {
      console.error("Erro detalhado no login:", err);
      const code = err?.code || "";
      
      if (
        code.includes("user-not-found") ||
        code.includes("wrong-password") ||
        code.includes("invalid-credential")
      ) {
        setError("E-mail ou palavra-passe inválidos. Verifique os seus dados.");
      } else if (code.includes("too-many-requests")) {
        setError("Muitas tentativas falhadas. Tente novamente mais tarde.");
      } else {
        setError("Ocorreu um erro ao tentar iniciar sessão.");
      }
      
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Novo Wrapper que vai segurar as duas metades */}
      <div className={styles.loginWrapper}>
        
        {/* Lado Esquerdo: Imagem */}
        <div className={styles.imageSection}>
          {/* A imagem será definida via CSS no background, ou você pode colocar uma tag <img src="/caminho.jpg" /> aqui */}
        </div>

        {/* Lado Direito: Formulário */}
        <div className={styles.formSection}>
          <img src="/CybertechLogo.png" alt="Logo do Site" className={styles.logo} />
          <p className={styles.loginSubtitle}>Bem-vindo de volta! Insira seus dados.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className={styles.switchAuth}>
            <p>
              <span style={{ fontWeight: 'bold', color: "white" }}>Não tem uma conta?</span>{" "}
              <Link to="/cadastro">
                <span style={{ fontWeight: "normal", color: "lightgray" }}>Cadastre-se</span>
              </Link>
            </p>
          </div>

          <div className={styles.passwordReset}>
            <Link to="/esqueci-minha-senha" className={styles.passwordResetLink}>
              <span style={{ fontWeight: "normal", color: "lightgray" }}>
                Esqueci minha senha
              </span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;