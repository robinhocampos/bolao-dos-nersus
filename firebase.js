import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, onValue } from "firebase/database";

// ⚠️ COLE AQUI as credenciais do SEU projeto Firebase.
// Onde encontrar: console.firebase.google.com → seu projeto →
// ⚙️ Configurações do projeto → Seus apps → app Web → "firebaseConfig"
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  databaseURL: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const BOLAO_PATH = "bolaoDosNersus";

// Estas funções substituem o window.storage que existia no protótipo.
// Toda vez que o app salva ou lê o estado do bolão, ele conversa com o
// Firebase Realtime Database, que é compartilhado entre todos os participantes.

export async function loadState() {
  try {
    const snapshot = await get(ref(db, BOLAO_PATH));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (err) {
    console.error("Erro ao carregar dados do Firebase:", err);
    return null;
  }
}

export async function saveState(state) {
  try {
    await set(ref(db, BOLAO_PATH), state);
  } catch (err) {
    console.error("Erro ao salvar dados no Firebase:", err);
  }
}

// Escuta mudanças em tempo real: quando um amigo registra um palpite ou
// resultado, todos os outros participantes veem a atualização na hora,
// sem precisar recarregar a página.
export function subscribeToState(callback) {
  const stateRef = ref(db, BOLAO_PATH);
  const unsubscribe = onValue(stateRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return unsubscribe;
}
