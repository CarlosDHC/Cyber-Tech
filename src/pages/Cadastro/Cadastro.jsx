import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Cadastro.module.css";

import { auth, db } from "../../../FirebaseConfig.js";

// Importação necessária do updateProfile para vincular o nome ao Auth do Firebase
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const Cadastro = () => {
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Função principal de cadastro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (password !== confirmPassword) {
      setError("As senhas não conferem!");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // 1. Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. ATUALIZAÇÃO IMPORTANTE: Vincula o nome ao perfil de autenticação
      // Isso garante que auth.currentUser.displayName não seja nulo nos desafios
      await updateProfile(user, {
        displayName: nome
      });

      // 3. Salva os dados detalhados no Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: nome,
        apelido,
        dataNascimento,
        telefone,
        email,
        criadoEm: new Date().toISOString(),
      });

      console.log("Usuário cadastrado com sucesso:", user.uid);
      setLoading(false);

      // Redireciona para o login após o sucesso
      navigate("/login");

    } catch (err) {
      setLoading(false);
      console.error("Erro detalhado no cadastro:", err);

      // Tratamento de erros amigável para o usuário
      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
      } else if (err.code === "auth/invalid-email") {
        setError("O e-mail informado é inválido.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha é muito fraca. Escolha uma mais forte.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Falha de conexão. Verifique sua internet.");
      } else {
        setError("Ocorreu um erro ao tentar cadastrar.");
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2>Crie sua conta</h2>
        <p className={styles.loginSubtitle}>É rápido e fácil!</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="apelido">Nome Social</label>
            <input
              type="text"
              id="apelido"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              placeholder="Como prefere ser chamado"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dataNascimento">Data de Nascimento</label>
            <div className={styles.formGroup}>
              <input
                type="date"
                id="dataNascimento"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                min="1900-01-01"
                max="2099-12-31"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className={styles.switchAuth}>
          <p>
            Já tem uma conta? <Link to="/login">Entre aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;