import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, onValue } from "firebase/database";

// Credenciais do projeto Firebase "Bolao-dos-nersus".
const firebaseConfig = {
  apiKey: "AIzaSyBUWN8tg-ejuI5qLlK10KrRkwzv1ilv9WI",
  authDomain: "bolao-dos-nersus.firebaseapp.com",
  databaseURL: "https://bolao-dos-nersus-default-rtdb.firebaseio.com",
  projectId: "bolao-dos-nersus",
  storageBucket: "bolao-dos-nersus.firebasestorage.app",
  messagingSenderId: "194545881390",
  appId: "1:194545881390:web:0f431650b150091201aabf",
  measurementId: "G-F3H47PJMCP",
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
