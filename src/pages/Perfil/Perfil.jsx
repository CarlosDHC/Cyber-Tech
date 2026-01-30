import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Perfil.module.css";
import { motion } from "framer-motion";

import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db, auth } from "../../../FirebaseConfig";
import { useNavigate } from "react-router-dom"; // Import necessário

export default function Perfil() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    dataNascimento: "",
    telefone: "",
    apelido: "",
    Escolaridade: "Ensino Fundamental",
  });

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser || !currentUser.uid) {
        setProfile(null);
        return;
      }
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);

          setForm({
            name: data.name || "",
            dataNascimento: data.dataNascimento || "",
            telefone: data.telefone || "",
            apelido: data.apelido || "",
            Escolaridade: data.Escolaridade || "Ensino Fundamental",
          });
        } else {
          setProfile({ email: currentUser.email, uid: currentUser.uid });
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setProfile({ email: currentUser.email, uid: currentUser.uid });
      }
    }
    loadProfile();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className={styles.container}>
        <div className={styles.profileBox}>
          <h2>Você precisa estar logado para ver seu perfil.</h2>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

 const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Por favor, informe o nome completo.");
      return;
    }
    setSaving(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        name: form.name, 
        dataNascimento: form.dataNascimento || "",
        telefone: form.telefone || "",
        apelido: form.apelido || "",
        Escolaridade: form.Escolaridade || "Ensino Fundamental", // Corrigido aqui
        updatedAt: new Date(),
      });

      setProfile({ ...profile, ...form });
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Função para o botão "Alterar Senha"
  const handleNavigateToChangePassword = () => {
    navigate("/alterar-senha");
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      "Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
    );
    if (!ok) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Usuário não encontrado. Tente fazer login novamente.");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      alert("Conta excluída com sucesso.");
      navigate("/");
    } catch (err) {
      console.error("Erro detalhado ao excluir conta:", err);
      if (err.code === "auth/requires-recent-login") {
        alert("Por segurança, faça login novamente antes de excluir a conta.");
      } else {
        alert("Não foi possível excluir a conta. Tente novamente mais tarde.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <motion.div className={styles.profileBox} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>

        <div className={styles.header}>
          <h2>MEU PERFIL</h2>
          <div className={styles.tabs}>
            <span className={styles.activeTab}>Dados do Usuário</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.imageAndLogin}>

            <div className={styles.loginGroup}>
              <div className={styles.inputGroup}>
                <label className={styles.required}>Login</label>
                <input
                  type="email"
                  value={profile?.email || currentUser.email}
                  readOnly
                  disabled
                  className={styles.loginInput}
                />
              </div>

              <button
                className={`${styles.buttonBase} ${styles.dangerButton}`}
                onClick={handleNavigateToChangePassword}
              >
                Alterar Senha
              </button>
            </div>
          </div>

          <div className={styles.formGrid}>

            {/* Linha 1 */}
            <div className={styles.inputGroup}>
              <label className={styles.required}>Nome*</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Sobrenome</label>
              <input name="apelido" value={form.apelido} onChange={handleChange} placeholder="Como prefere ser chamado" />
            </div>

            {/* Linha 2 */}
            <div className={styles.inputGroup}>
              <label>Telefone</label>
              <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(xx) xxxx-xxxx" />
            </div>
            <div className={styles.inputGroup}>
              <label>Data de Nascimento</label>
              <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} />
            </div>

            {/* Linha 3 */}
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Escolaridade</label>
              <select name="Escolaridade" value={form.Escolaridade} onChange={handleChange}>
                <option value="ENSINO FUNDAMENTAL">Ensino Fundamental</option>
                <option value="ENSINO MEDIO">Ensino Médio</option>
                <option value="ENSINO SUPERIOR">Ensino Superior</option>
              </select>
            </div> 

          </div>

          {/* Rodapé com botões */}
          <div className={styles.actions}>
            <button
              className={`${styles.buttonBase} ${styles.primaryButton}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>

            <button
              className={`${styles.buttonBase} ${styles.dangerButton}`}
              onClick={handleDeleteAccount}
            >
              Excluir Conta
            </button>

          </div>

        </div>
      </motion.div>
    </div>
  );
}