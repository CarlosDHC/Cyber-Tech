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

  // --- NOVA LÓGICA DE FORMATAÇÃO DO TELEFONE ---
  const formatPhone = (value) => {
    if (!value) return "";
    
    // 1. Remove tudo o que não for número (impede letras e símbolos)
    let v = value.replace(/\D/g, ""); 
    
    // 2. Limita a 11 dígitos no máximo
    v = v.substring(0, 11); 
    
    // 3. Aplica a máscara
    if (v.length >= 3 && v.length <= 7) {
      v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    } else if (v.length >= 8) {
      v = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
    }
    
    return v;
  };
  // ----------------------------------------------

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

      navigate("/login");

    } catch (err) {
      setLoading(false);
      console.error("Erro detalhado no cadastro:", err);
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
          
          <div className={styles.formRow}>
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
          </div>

          <div className={styles.formRow}>
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
              {/* O onChange usa formatPhone, e o maxLength foi para 15 */}
              <input
                type="tel"
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                maxLength="15"
              />
            </div>
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

          <div className={styles.formRow}>
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