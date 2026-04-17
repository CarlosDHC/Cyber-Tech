// FirebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Import do Storage

// ✅ Configurações do Firebase via variáveis de ambiente (.env)
const firebaseConfig = {
  apiKey: "AIzaSyBQ1i_DyfGcVmMwIZex_L3JBc_dGfF31VE",
  authDomain: "cybertech-ce995.firebaseapp.com",
  projectId: "cybertech-ce995",
  storageBucket: "cybertech-ce995.firebasestorage.app",
  messagingSenderId: "116364534281",
  appId: "1:116364534281:web:ce3588b5a3804f393a0ed8",
  measurementId: "G-52HPWZWSP0"
};

// ✅ 1. Inicializa o Firebase (Obrigatório ser a primeira inicialização)
const app = initializeApp(firebaseConfig);

// ✅ 2. Inicializa serviços principais (Usando a variável 'app' criada acima)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Agora está na ordem correta

// ✅ Inicializa o Analytics (apenas se suportado pelo navegador)
isSupported().then((yes) => {
  if (yes) getAnalytics(app);
});

// ✅ Log de verificação (só em dev)
if (import.meta.env.DEV) {
  console.log("🔥 Firebase inicializado com sucesso:", firebaseConfig.projectId);
}

export default app;