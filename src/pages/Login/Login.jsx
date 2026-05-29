import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser'; 
import styles from "./Login.module.css";

import { auth, db } from "../../../FirebaseConfig.js";
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

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
      // 1. Autenticação no Firebase
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // 2. VERIFICAÇÃO CRÍTICA: O e-mail foi validado?
      if (!user.emailVerified) {
        try {
          // Dispara um novo e-mail ANTES de desconectar o utilizador!
          await sendEmailVerification(user);
        } catch (emailErr) {
          console.error("Erro ao reenviar e-mail de verificação:", emailErr);
        }
        
        // Desconecta o utilizador imediatamente
        await signOut(auth);
        
        setError("A sua conta ainda não foi validada. Acabámos de enviar um novo link para a sua caixa de entrada.");
        setLoading(false);
        return; // Interrompe o fluxo (não regista atividade, não envia o EmailJS nem navega)
      }

      // 3. REGISTAR A ÚLTIMA ATIVIDADE (Apenas se o e-mail estiver verificado)
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          ultimaAtividade: serverTimestamp() // Salva a hora exata do servidor da Google
        });
        console.log("Atividade registada com sucesso no Firestore.");
      } catch (dbErr) {
        console.error("Erro ao atualizar a última atividade:", dbErr);
        // Não precisamos de interromper o login se isto falhar
      }

      // 4. Preparação dos dados para o template do EmailJS
      const dataAtual = new Date().toLocaleString('pt-BR');
      const infoNavegador = navigator.userAgent;

      const templateParams = {
        to_name: user.displayName || 'Estudante',
        user_email: user.email, 
        login_date: dataAtual, 
        browser_info: infoNavegador
      };

      // 5. Envio da notificação e navegação controlada
      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_API_KEY
      )
      .then((response) => {
        console.log('Email de boas-vindas enviado!', response.status);
        navigate("/"); // Navega após sucesso no envio
      })
      .catch((err) => {
        console.error('Erro no EmailJS, mas redirecionando...', err);
        navigate("/"); // Navega mesmo que o email falhe para não prender o utilizador
      });

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
      <div className={styles.loginWrapper}>
        
        {/* Secção de Imagem Lateral */}
        <div className={styles.imageSection}>
        </div>

        {/* Formulário de Login */}
        <div className={styles.formSection}>
          <img src="/CybertechLogo.png" alt="Logo Cyber Tech" className={styles.logo} />
          <p className={styles.loginSubtitle}>Bem-vindo de volta! Insira os seus dados.</p>

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
              <label htmlFor="password">Palavra-passe</label>
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
              {loading ? "A entrar..." : "Entrar"}
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
                Esqueci-me da minha palavra-passe
              </span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;