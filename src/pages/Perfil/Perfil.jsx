import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Perfil.module.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import md5 from "crypto-js/md5";

// Imports apenas do Firestore e Auth
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db, auth } from "../../../FirebaseConfig"; 

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
          <h2 className={styles.warningText}>Você precisa estar logado para ver seu perfil.</h2>
        </div>
      </div>
    );
  }

  // Geração automática da URL da foto via Gravatar
  const emailParaHash = currentUser.email ? currentUser.email.trim().toLowerCase() : "";
  const hash = emailParaHash ? md5(emailParaHash).toString() : "";
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;

  const formatPhone = (value) => {
    if (!value) return "";
    let v = value.replace(/\D/g, "");
    v = v.substring(0, 11);
    if (v.length >= 3 && v.length <= 7) {
      v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    } else if (v.length >= 8) {
      v = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
    }
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefone") {
      setForm((s) => ({ ...s, telefone: formatPhone(value) }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault(); // Previne o reload se chamado via submit do form

    if (!form.name.trim()) {
      alert("Por favor, informe o nome completo.");
      return;
    }
    
    setSaving(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      
      await setDoc(userRef, {
        ...form,
        updatedAt: new Date(),
      }, { merge: true });

      setProfile({ ...profile, ...form });
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.");
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
      <motion.div 
        className={styles.profileBox} 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.header}>
          <h2>Meu Perfil</h2>
          <div className={styles.tabs}>
            <span className={styles.activeTab}>Dados do Usuário</span>
          </div>
        </div>

        <div className={styles.content}>
          {/* SEÇÃO DA FOTO DE PERFIL (GRAVATAR) E LOGIN */}
          <div className={styles.topSection}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatarImageWrapper}>
                <img src={avatarUrl} alt="Foto de Perfil" className={styles.avatarImage} />
              </div>
              <a 
                href="https://pt.gravatar.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.gravatarLink}
              >
                Mudar foto no Gravatar
              </a>
            </div>

            <div className={styles.loginGroup}>
              <div className={styles.inputGroup}>
                <label className={styles.required}>Email de Acesso</label>
                <input
                  type="email"
                  value={profile?.email || currentUser.email}
                  readOnly
                  disabled
                  className={styles.loginInput}
                />
              </div>

              <div className={styles.actionButtonsRow}>
                <button
                  type="button"
                  className={`${styles.buttonBase} ${styles.secondaryButton}`}
                  onClick={() => navigate("/alterar-senha")}
                >
                  Alterar Senha
                </button>
                <button
                  type="button"
                  className={`${styles.buttonBase} ${styles.certificateButton}`}
                  onClick={() => navigate("/Certificado/CerDesbloqueados")}
                >
                  Meus Certificados
                </button>
              </div>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* FORMULÁRIO DE DADOS */}
          <form onSubmit={handleSave} className={styles.formContainer}>
            <h3 className={styles.sectionTitle}>Informações Pessoais</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.required}>Nome Completo*</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="Seu nome completo"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Como prefere ser chamado</label>
                <input 
                  name="apelido" 
                  value={form.apelido} 
                  onChange={handleChange} 
                  placeholder="Apelido ou nome social" 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Telefone</label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  id="telefone"
                  maxLength="15"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Data de Nascimento</label>
                <input 
                  name="dataNascimento" 
                  type="date" 
                  value={form.dataNascimento} 
                  onChange={handleChange}
                  id="dataNascimento"
                  min="1900-01-01"
                  max="2099-12-31"
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Escolaridade</label>
                <select name="Escolaridade" value={form.Escolaridade} onChange={handleChange}>
                  <option value="ENSINO FUNDAMENTAL">Ensino Fundamental</option>
                  <option value="ENSINO MEDIO">Ensino Médio</option>
                  <option value="ENSINO SUPERIOR">Ensino Superior</option>
                </select>
              </div>
            </div>

            {/* AÇÕES FINAIS DO FORMULÁRIO */}
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.buttonBase} ${styles.dangerButton}`}
                onClick={handleDeleteAccount}
              >
                Excluir Conta
              </button>
              <button
                type="submit"
                className={`${styles.buttonBase} ${styles.primaryButton}`}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>

        </div>
      </motion.div>
    </div>
  );
}