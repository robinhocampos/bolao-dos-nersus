import { useState, useEffect, useCallback } from "react";
import { loadState as fbLoadState, saveState as fbSaveState, subscribeToState } from "./firebase.js";
import nersuPhoto from "./assets/nersu.jpg";

// ── helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "bolao_dos_nersus_v1";

// Foto oficial do mascote: Nersu da Capitinga
const NERSU_IMG = nersuPhoto;

const initialMatches = [
  // Group A
  { id: 1, home: "México", away: "África do Sul", date: "2026-06-11", time: "16:00", group: "A", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 2, home: "EUA", away: "Canadá", date: "2026-06-12", time: "19:00", group: "A", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 3, home: "México", away: "Canadá", date: "2026-06-16", time: "16:00", group: "A", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 4, home: "EUA", away: "África do Sul", date: "2026-06-16", time: "19:00", group: "A", phase: "Grupos", homeScore: null, awayScore: null },
  // Group B
  { id: 5, home: "Argentina", away: "Peru", date: "2026-06-13", time: "16:00", group: "B", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 6, home: "Chile", away: "Austrália", date: "2026-06-13", time: "19:00", group: "B", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 7, home: "Argentina", away: "Austrália", date: "2026-06-17", time: "16:00", group: "B", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 8, home: "Chile", away: "Peru", date: "2026-06-17", time: "19:00", group: "B", phase: "Grupos", homeScore: null, awayScore: null },
  // Group C
  { id: 9, home: "Brasil", away: "Croácia", date: "2026-06-14", time: "16:00", group: "C", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 10, home: "Japão", away: "Marrocos", date: "2026-06-14", time: "19:00", group: "C", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 11, home: "Brasil", away: "Marrocos", date: "2026-06-18", time: "16:00", group: "C", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 12, home: "Croácia", away: "Japão", date: "2026-06-18", time: "19:00", group: "C", phase: "Grupos", homeScore: null, awayScore: null },
  // Group D
  { id: 13, home: "França", away: "Bélgica", date: "2026-06-15", time: "16:00", group: "D", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 14, home: "Alemanha", away: "Espanha", date: "2026-06-15", time: "19:00", group: "D", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 15, home: "França", away: "Espanha", date: "2026-06-19", time: "16:00", group: "D", phase: "Grupos", homeScore: null, awayScore: null },
  { id: 16, home: "Alemanha", away: "Bélgica", date: "2026-06-19", time: "19:00", group: "D", phase: "Grupos", homeScore: null, awayScore: null },
];

const RULES = { exact: 4, winner: 3, draw: 1 };

function calcPoints(prediction, actual) {
  if (actual.homeScore === null || actual.awayScore === null) return null;
  if (prediction.home === actual.homeScore && prediction.away === actual.awayScore) return RULES.exact;
  const pRes = Math.sign(prediction.home - prediction.away);
  const aRes = Math.sign(actual.homeScore - actual.awayScore);
  if (pRes === aRes) return pRes === 0 ? RULES.draw : RULES.winner;
  return 0;
}

function formatDate(d) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}`;
}

const PHASES = ["Grupos", "Oitavas", "Quartas", "Semifinal", "3º Lugar", "Final"];
const FLAG = { "Brasil": "🇧🇷", "Argentina": "🇦🇷", "França": "🇫🇷", "Alemanha": "🇩🇪", "Espanha": "🇪🇸", "Portugal": "🇵🇹", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "México": "🇲🇽", "EUA": "🇺🇸", "Canadá": "🇨🇦", "Japão": "🇯🇵", "Croácia": "🇭🇷", "Marrocos": "🇲🇦", "Bélgica": "🇧🇪", "Chile": "🇨🇱", "Peru": "🇵🇪", "Austrália": "🇦🇺", "África do Sul": "🇿🇦" };
const fl = t => FLAG[t] || "🏳️";

// ── storage helpers ───────────────────────────────────────────────────────────
// Agora conversam com o Firebase Realtime Database (veja src/firebase.js),
// para que todos os participantes compartilhem os mesmos dados em tempo real.
async function loadState() {
  return await fbLoadState();
}
async function saveState(s) {
  await fbSaveState(s);
}

// ── styles ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#1c1326;color:#f3ecf7;min-height:100vh}

.app{max-width:480px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;
  background:
    repeating-linear-gradient(45deg, rgba(216,42,143,0.05) 0 14px, rgba(20,140,110,0.05) 14px 28px, rgba(106,61,180,0.05) 28px 42px, rgba(33,166,196,0.05) 42px 56px);
}

/* header / banner */
.header{
  background:
    linear-gradient(160deg, rgba(28,19,38,.55) 0%, rgba(28,19,38,.88) 60%, rgba(28,19,38,.97) 100%),
    repeating-linear-gradient(45deg, #d82a8f 0 22px, #6a3db4 22px 44px, #14a36e 44px 66px, #21a6c4 66px 88px);
  border-bottom:3px solid #f2d680;
  padding:18px 16px 16px;
  display:flex;align-items:center;justify-content:space-between;
  position:sticky;top:0;z-index:100;
  box-shadow:0 4px 18px rgba(0,0,0,.35);
}
.header-brand{display:flex;align-items:center;gap:12px}
.header-photo{width:52px;height:52px;border-radius:50%;object-fit:cover;border:3px solid #f2d680;box-shadow:0 2px 10px rgba(0,0,0,.4);flex-shrink:0}
.header-title{font-family:'Fredoka',sans-serif;font-weight:700;font-size:19px;letter-spacing:.2px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.5);line-height:1.05}
.header-sub{font-size:10px;color:#f2d680;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;margin-top:2px}
.header-user{display:flex;align-items:center;gap:8px}
.avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#d82a8f,#6a3db4);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;border:2px solid #f2d680;cursor:pointer;flex-shrink:0}

/* nav */
.nav{background:#150e1d;border-top:1px solid #382647;display:flex;overflow-x:auto;scrollbar-width:none;position:sticky;bottom:0;z-index:100}
.nav::-webkit-scrollbar{display:none}
.nav-btn{flex:1;min-width:64px;padding:10px 4px 8px;display:flex;flex-direction:column;align-items:center;gap:3px;border:none;background:none;color:#7a6a8a;cursor:pointer;font-size:9px;letter-spacing:.5px;text-transform:uppercase;font-family:'Inter',sans-serif;font-weight:600;transition:color .2s}
.nav-btn.active{color:#f2d680}
.nav-btn .icon{font-size:18px}

/* main */
.main{flex:1;overflow-y:auto;padding:16px}

/* cards */
.card{background:#241731;border:1px solid #3a2750;border-radius:12px;padding:16px;margin-bottom:12px}
.card-title{font-family:'Fredoka',sans-serif;font-size:16px;font-weight:600;letter-spacing:.2px;color:#c9a8d9;margin-bottom:12px;text-transform:uppercase;display:flex;align-items:center;gap:6px}

/* match card */
.match-card{background:#241731;border:1px solid #3a2750;border-radius:12px;padding:14px;margin-bottom:10px}
.match-meta{font-size:10px;color:#7a6a8a;margin-bottom:10px;display:flex;gap:8px;align-items:center}
.match-badge{background:#382647;border-radius:4px;padding:2px 6px;font-weight:600}
.match-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}
.team{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}
.team-flag{font-size:24px}
.team-name{font-family:'Fredoka',sans-serif;font-size:14px;font-weight:600;color:#e8d8f0;letter-spacing:.2px}
.score-box{display:flex;align-items:center;gap:4px}
.score-input{width:40px;height:40px;border-radius:8px;border:2px solid #d82a8f;background:#170f1f;color:#fff;font-size:20px;font-weight:700;text-align:center;font-family:'Fredoka',sans-serif;outline:none;-moz-appearance:textfield}
.score-input::-webkit-outer-spin-button,.score-input::-webkit-inner-spin-button{-webkit-appearance:none}
.score-sep{font-size:22px;font-weight:900;color:#5a4a6a}
.score-display{width:40px;height:40px;border-radius:8px;background:#170f1f;color:#fff;font-size:20px;font-weight:700;text-align:center;font-family:'Fredoka',sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #382647}
.pts-chip{margin-top:8px;text-align:center;font-size:11px;font-weight:600}
.pts-4{color:#f2d680} .pts-3{color:#3ecb96} .pts-1{color:#5bc4e8} .pts-0{color:#e8607a} .pts-null{color:#7a6a8a}

/* ranking */
.rank-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #382647}
.rank-row:last-child{border-bottom:none}
.rank-pos{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:700;min-width:28px;color:#7a6a8a}
.rank-pos.gold{color:#f2d680} .rank-pos.silver{color:#c9a8d9} .rank-pos.bronze{color:#e08a5a}
.rank-name{flex:1;font-weight:600;font-size:14px}
.rank-pts{font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:#3ecb96}
.rank-detail{font-size:10px;color:#7a6a8a;display:flex;gap:6px;margin-top:2px}

/* group standings */
.group-table{width:100%;border-collapse:collapse;font-size:12px}
.group-table th{text-align:left;padding:6px 4px;color:#7a6a8a;font-weight:600;border-bottom:1px solid #382647;font-size:11px}
.group-table td{padding:6px 4px;border-bottom:1px solid #1c1326}
.group-table tr:last-child td{border-bottom:none}
.q-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:4px}
.q-yes{background:#3ecb96} .q-no{background:#4a3a5a}

/* admin */
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.form-full{margin-bottom:8px}
.inp{width:100%;background:#170f1f;border:1px solid #382647;border-radius:8px;color:#f3ecf7;padding:8px 10px;font-size:13px;font-family:'Inter',sans-serif;outline:none}
.inp:focus{border-color:#d82a8f}
.sel{width:100%;background:#170f1f;border:1px solid #382647;border-radius:8px;color:#f3ecf7;padding:8px 10px;font-size:13px;font-family:'Inter',sans-serif;outline:none;cursor:pointer}
.btn{padding:10px 16px;border-radius:8px;border:none;font-weight:600;font-size:13px;cursor:pointer;transition:opacity .2s;font-family:'Inter',sans-serif}
.btn:hover{opacity:.85}
.btn-green{background:#14a36e;color:#fff}
.btn-red{background:#c0392b;color:#fff}
.btn-blue{background:#21a6c4;color:#fff}
.btn-sm{padding:6px 12px;font-size:12px}
.btn-full{width:100%}
.tag{display:inline-flex;align-items:center;background:#382647;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;color:#c9a8d9;margin-right:4px}
.section-header{font-family:'Fredoka',sans-serif;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#7a6a8a;margin:16px 0 8px;padding-bottom:4px;border-bottom:1px solid #382647}

/* countdown */
.countdown{display:flex;gap:12px;justify-content:center;padding:12px 0}
.cd-block{display:flex;flex-direction:column;align-items:center;background:#170f1f;border-radius:10px;padding:10px 14px;min-width:60px}
.cd-num{font-family:'Fredoka',sans-serif;font-size:32px;font-weight:700;color:#d82a8f;line-height:1}
.cd-label{font-size:9px;text-transform:uppercase;color:#7a6a8a;letter-spacing:1px;margin-top:2px}

/* mural */
.msg-card{background:#170f1f;border:1px solid #382647;border-radius:10px;padding:10px 12px;margin-bottom:8px}
.msg-author{font-weight:700;font-size:12px;color:#3ecb96;margin-bottom:3px}
.msg-text{font-size:13px;line-height:1.5}
.msg-time{font-size:10px;color:#4a3a5a;margin-top:4px}
.emoji-bar{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.emoji-btn{background:#382647;border:none;border-radius:6px;padding:4px 8px;font-size:16px;cursor:pointer;transition:transform .1s}
.emoji-btn:active{transform:scale(.85)}

/* login */
.login-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px;gap:16px;
  background:
    linear-gradient(180deg, rgba(28,19,38,.4) 0%, rgba(28,19,38,.92) 100%),
    repeating-linear-gradient(45deg, #d82a8f 0 22px, #6a3db4 22px 44px, #14a36e 44px 66px, #21a6c4 66px 88px);
}
.login-photo{width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid #f2d680;box-shadow:0 6px 24px rgba(0,0,0,.5)}
.login-title{font-family:'Fredoka',sans-serif;font-size:30px;font-weight:700;color:#fff;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.5)}
.login-sub{font-size:13px;color:#f2d680;letter-spacing:1.5px;text-transform:uppercase;font-weight:600}
.login-card{width:100%;max-width:340px;background:#241731;border:1px solid #3a2750;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:12px}

/* toast */
.toast{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#14a36e;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;animation:fadeInOut 2.5s forwards}
@keyframes fadeInOut{0%{opacity:0;top:8px}10%{opacity:1;top:16px}80%{opacity:1;top:16px}100%{opacity:0;top:8px}}

/* payment card */
.pay-card{background:#241731;border:1px solid #3a2750;border-radius:12px;padding:16px;margin-bottom:12px}
.pay-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.pay-title{font-family:'Fredoka',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;color:#c9a8d9;text-transform:uppercase;display:flex;align-items:center;gap:6px}
.pay-cota-badge{background:#1c1326;border:1px solid #f2d680;color:#f2d680;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;font-family:'Fredoka',sans-serif}
.pay-pix-row{display:flex;align-items:baseline;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.pay-pix-label{font-size:13px;color:#7a6a8a}
.pay-pix-value{font-family:'Fredoka',sans-serif;font-size:19px;font-weight:700;color:#f3ecf7;letter-spacing:.3px}
.pay-recebedor{font-size:12px;color:#7a6a8a;margin-bottom:12px}
.pay-status-btn{display:inline-flex;align-items:center;gap:6px;border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid transparent;font-family:'Inter',sans-serif;transition:opacity .2s}
.pay-status-btn:hover{opacity:.85}
.pay-status-paid{background:#0f2e22;color:#3ecb96;border-color:#3ecb96}
.pay-status-pending{background:#2e1a1f;color:#e8607a;border-color:#e8607a}

/* result admin */
.result-row{display:grid;grid-template-columns:1fr auto 1fr auto;align-items:center;gap:6px;margin-bottom:8px}
`;

// ── component ─────────────────────────────────────────────────────────────────
export default function Bolao() {
  const [appState, setAppState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [countdown, setCountdown] = useState({});

  // admin form
  const [newMatch, setNewMatch] = useState({ home: "", away: "", date: "", time: "16:00", group: "A", phase: "Grupos" });
  const [newMsg, setNewMsg] = useState("");
  const [msgEmoji, setMsgEmoji] = useState("");

  // countdown
  useEffect(() => {
    const target = new Date("2026-06-11T19:00:00Z");
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setCountdown({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setCountdown({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Sessão local: cada navegador guarda o usuário logado separadamente,
  // já que o Firebase compartilha apenas os dados do bolão (jogos, palpites etc).
  const getLocalUser = () => {
    try {
      const raw = localStorage.getItem("bolaoDosNersus_currentUser");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };
  const setLocalUser = (user) => {
    try {
      if (user) localStorage.setItem("bolaoDosNersus_currentUser", JSON.stringify(user));
      else localStorage.removeItem("bolaoDosNersus_currentUser");
    } catch {}
  };

  // load + tempo real
  useEffect(() => {
    let isFirstLoad = true;
    const unsubscribe = subscribeToState((shared) => {
      const base = shared || { users: [], matches: initialMatches, predictions: {}, messages: [], payments: {}, settings: { cota: 50, pixKey: "185.624.458-00", payeeName: "Robson Campos", bank: "Nubank" } };
      setAppState(prev => {
        const sessionUser = isFirstLoad ? getLocalUser() : (prev?.currentUser ?? null);
        // Sempre usa a versão mais atual do usuário (ex: se foi promovido a admin).
        const freshUser = sessionUser ? (base.users || []).find(u => u.name === sessionUser.name) || sessionUser : null;
        return { ...base, currentUser: freshUser };
      });
      if (isFirstLoad) { isFirstLoad = false; setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  const save = useCallback(async (s) => {
    // Salva apenas os dados compartilhados; currentUser fica só no navegador.
    const { currentUser: _omit, ...shared } = s;
    await saveState(shared);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  const setState = (fn) => {
    setAppState(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      save(next);
      return next;
    });
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16, background: "#1c1326" }}>
      <style>{css}</style>
      <img src={NERSU_IMG} alt="Nersu da Capitinga" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "3px solid #f2d680" }} />
      <div style={{ color: "#c9a8d9", fontSize: 13 }}>Carregando o Bolão dos Nersus…</div>
    </div>
  );

  const { users, matches, predictions, messages, currentUser } = appState;
  const payments = appState.payments || {};
  const settings = appState.settings || { cota: 50, pixKey: "185.624.458-00", payeeName: "Robson Campos", bank: "Nubank" };

  // ── login ──
  if (!currentUser) {
    const handleLogin = () => {
      if (!loginName.trim() || !loginPass.trim()) return showToast("Preencha nome e senha");
      if (registerMode) {
        if (users.find(u => u.name.toLowerCase() === loginName.trim().toLowerCase())) return showToast("Nome já cadastrado");
        const newUser = { name: loginName.trim(), pass: loginPass.trim(), isAdmin: users.length === 0, emoji: "⚽" };
        setLocalUser(newUser);
        setState(p => ({ ...p, users: [...p.users, newUser], currentUser: newUser }));
        showToast(`Bem-vindo, ${newUser.name}! ${users.length === 0 ? "Você é o admin." : ""}`);
      } else {
        const user = users.find(u => u.name.toLowerCase() === loginName.trim().toLowerCase() && u.pass === loginPass.trim());
        if (!user) return showToast("Nome ou senha incorretos");
        setLocalUser(user);
        setState(p => ({ ...p, currentUser: user }));
        showToast(`Bem-vindo de volta, ${user.name}!`);
      }
    };
    return (
      <div style={{ background: "#1c1326", minHeight: "100vh" }}>
        <style>{css}</style>
        {toast && <div className="toast">{toast}</div>}
        <div className="login-screen">
          <img src={NERSU_IMG} alt="Nersu da Capitinga" className="login-photo" />
          <div className="login-title">Bolão dos Nersus</div>
          <div className="login-sub">Copa do Mundo 2026</div>
          <div className="login-card">
            <div className="section-header">{registerMode ? "Criar conta" : "Entrar"}</div>
            <input className="inp" placeholder="Seu nome" value={loginName} onChange={e => setLoginName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <input className="inp" type="password" placeholder="Senha" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <button className="btn btn-green btn-full" onClick={handleLogin}>{registerMode ? "Criar conta" : "Entrar"}</button>
            <button className="btn btn-full" style={{ background: "none", color: "#3ecb96", fontSize: 12 }} onClick={() => setRegisterMode(!registerMode)}>
              {registerMode ? "Já tenho conta" : "Criar conta"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#5a4a6a", textAlign: "center" }}>O primeiro cadastro vira admin automaticamente</div>
        </div>
      </div>
    );
  }

  // ── ranking calc ──
  const rankData = users.map(u => {
    let pts = 0, exact = 0, wins = 0, draws = 0;
    matches.forEach(m => {
      const pred = predictions[u.name]?.[m.id];
      if (!pred) return;
      const p = calcPoints(pred, m);
      if (p === null) return;
      pts += p;
      if (p === 4) exact++;
      if (p === 3) wins++;
      if (p === 1) draws++;
    });
    return { ...u, pts, exact, wins, draws };
  }).sort((a, b) => b.pts - a.pts || b.exact - a.exact || b.wins - a.wins);

  const myPred = (matchId) => predictions[currentUser.name]?.[matchId];
  const myPoints = rankData.find(u => u.name === currentUser.name);

  // ── prediction save ──
  const setPred = (matchId, side, val) => {
    const num = val === "" ? "" : parseInt(val);
    if (val !== "" && (isNaN(num) || num < 0 || num > 99)) return;
    setState(p => ({
      ...p,
      predictions: {
        ...p.predictions,
        [currentUser.name]: {
          ...p.predictions[currentUser.name],
          [matchId]: {
            ...p.predictions[currentUser.name]?.[matchId],
            [side]: val === "" ? "" : num
          }
        }
      }
    }));
  };

  // ── result save (admin) ──
  const setResult = (matchId, side, val) => {
    if (!currentUser.isAdmin) return;
    const num = val === "" ? null : parseInt(val);
    setState(p => ({
      ...p,
      matches: p.matches.map(m => m.id === matchId ? { ...m, [side === "home" ? "homeScore" : "awayScore"]: (val === "" ? null : isNaN(num) ? null : num) } : m)
    }));
  };

  // ── payment toggle (apenas admin) ──
  const togglePayment = (userName) => {
    if (!currentUser.isAdmin) return;
    setState(p => ({
      ...p,
      payments: { ...p.payments, [userName]: !(p.payments?.[userName]) }
    }));
  };

  const updateSettings = (field, val) => {
    if (!currentUser.isAdmin) return;
    setState(p => ({ ...p, settings: { ...(p.settings || settings), [field]: val } }));
  };

  const addMatch = () => {
    if (!newMatch.home.trim() || !newMatch.away.trim() || !newMatch.date) return showToast("Preencha todos os campos");
    const id = Math.max(0, ...matches.map(m => m.id)) + 1;
    setState(p => ({ ...p, matches: [...p.matches, { ...newMatch, id, homeScore: null, awayScore: null }] }));
    setNewMatch({ home: "", away: "", date: "", time: "16:00", group: "A", phase: "Grupos" });
    showToast("Jogo adicionado!");
  };

  const deleteMatch = (id) => {
    if (!window.confirm("Remover este jogo?")) return;
    setState(p => ({ ...p, matches: p.matches.filter(m => m.id !== id) }));
    showToast("Jogo removido");
  };

  const sendMsg = () => {
    const text = (msgEmoji + " " + newMsg).trim();
    if (!text) return;
    setState(p => ({
      ...p,
      messages: [...p.messages, { author: currentUser.name, text, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]
    }));
    setNewMsg(""); setMsgEmoji("");
  };

  // ── group table ──
  const groups = [...new Set(matches.filter(m => m.phase === "Grupos").map(m => m.group))].sort();
  const groupStandings = (grp) => {
    const teams = [...new Set(matches.filter(m => m.group === grp).flatMap(m => [m.home, m.away]))];
    return teams.map(team => {
      let pts = 0, gf = 0, ga = 0, p = 0;
      matches.filter(m => m.group === grp && (m.home === team || m.away === team)).forEach(m => {
        if (m.homeScore === null) return;
        p++;
        const isHome = m.home === team;
        const mygf = isHome ? m.homeScore : m.awayScore;
        const myga = isHome ? m.awayScore : m.homeScore;
        gf += mygf; ga += myga;
        if (mygf > myga) pts += 3;
        else if (mygf === myga) pts += 1;
      });
      return { team, pts, gd: gf - ga, gf, ga, p };
    }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  };

  // upcoming match
  const now = new Date();
  const upcoming = matches.filter(m => m.homeScore === null).sort((a, b) => new Date(a.date + "T" + a.time) - new Date(b.date + "T" + b.time))[0];

  // ── renders ──────────────────────────────────────────────────────────────────
  const renderHome = () => (
    <div>
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#3ecb96", fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>COPA DO MUNDO 2026</div>
        <div className="countdown">
          {[["Dias", countdown.d], ["Horas", countdown.h], ["Min", countdown.m], ["Seg", countdown.s]].map(([l, v]) => (
            <div key={l} className="cd-block"><div className="cd-num">{String(v ?? "--").padStart(2, "0")}</div><div className="cd-label">{l}</div></div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#7a6a8a" }}>Abertura: México × África do Sul · 11 Jun · 16h00</div>
      </div>

      <div className="pay-card">
        <div className="pay-header">
          <div className="pay-title">💳 Pagamento da Cota</div>
          <div className="pay-cota-badge">R$ {Number(settings.cota).toFixed(2).replace(".", ",")} / pessoa</div>
        </div>
        <div className="pay-pix-row">
          <span className="pay-pix-label">PIX:</span>
          <span className="pay-pix-value">{settings.pixKey}</span>
        </div>
        <div className="pay-recebedor">{settings.payeeName} · {settings.bank}</div>
        {currentUser.isAdmin ? (
          <button
            className={`pay-status-btn ${payments[currentUser.name] ? "pay-status-paid" : "pay-status-pending"}`}
            onClick={() => togglePayment(currentUser.name)}
          >
            {payments[currentUser.name] ? "✅ Pago" : "⏳ Pendente"}
          </button>
        ) : (
          <span className={`pay-status-btn ${payments[currentUser.name] ? "pay-status-paid" : "pay-status-pending"}`} style={{ cursor: "default" }}>
            {payments[currentUser.name] ? "✅ Pago" : "⏳ Pendente"}
          </span>
        )}
        {!currentUser.isAdmin && (
          <div style={{ fontSize: 11, color: "#5a4a6a", marginTop: 8 }}>O status de pagamento é confirmado pelo administrador.</div>
        )}
      </div>

      {upcoming && (
        <div className="card">
          <div className="card-title">📅 Próximo Jogo</div>
          <div className="match-meta"><span className="match-badge">{upcoming.group ? `Grupo ${upcoming.group}` : upcoming.phase}</span><span>{formatDate(upcoming.date)} · {upcoming.time}</span></div>
          <div className="match-row">
            <div className="team"><div className="team-flag">{fl(upcoming.home)}</div><div className="team-name">{upcoming.home}</div></div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#5a4a6a" }}>×</div>
            <div className="team"><div className="team-flag">{fl(upcoming.away)}</div><div className="team-name">{upcoming.away}</div></div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">📊 Classificação</div>
        {rankData.slice(0, 5).map((u, i) => (
          <div key={u.name} className="rank-row">
            <div className={`rank-pos ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>{i + 1}</div>
            <div className="avatar" style={{ fontSize: 12 }}>{u.name[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div className="rank-name">{u.name} {u.name === currentUser.name ? <span style={{ fontSize: 10, color: "#3ecb96" }}>(você)</span> : null}</div>
              <div className="rank-detail"><span>✅ {u.exact}</span><span>🎯 {u.wins}</span><span>🤝 {u.draws}</span></div>
            </div>
            <div className="rank-pts">{u.pts}</div>
          </div>
        ))}
        {rankData.length === 0 && <div style={{ color: "#7a6a8a", fontSize: 13, textAlign: "center", padding: 16 }}>Nenhum participante ainda</div>}
      </div>

      <div className="card">
        <div className="card-title">📋 Regras</div>
        {[[4, "Placar Exato", "pts-4"], [3, "Vencedor certo", "pts-3"], [1, "Empate sem placar exato", "pts-1"], [0, "Errou", "pts-0"]].map(([p, l, c]) => (
          <div key={p} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <div className={`cd-block ${c}`} style={{ minWidth: 36, height: 36, padding: "4px 0", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, fontWeight: 900 }}>{p}</span>
            </div>
            <div style={{ fontSize: 13 }}>{l}</div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "#7a6a8a", marginTop: 8 }}>Apostas fecham 1h antes. Vale apenas tempo regulamentar.</div>
      </div>
    </div>
  );

  const renderPalpites = () => {
    const grouped = PHASES.reduce((acc, ph) => {
      const g = matches.filter(m => m.phase === ph);
      if (g.length) acc[ph] = g;
      return acc;
    }, {});
    return (
      <div>
        {Object.entries(grouped).map(([phase, ms]) => (
          <div key={phase}>
            <div className="section-header">⚽ {phase}</div>
            {ms.map(m => {
              const pred = myPred(m.id) || {};
              const pts = calcPoints({ home: pred.home ?? "", away: pred.away ?? "" }, m);
              const ptsClass = pts === 4 ? "pts-4" : pts === 3 ? "pts-3" : pts === 1 ? "pts-1" : pts === 0 ? "pts-0" : "pts-null";
              return (
                <div key={m.id} className="match-card">
                  <div className="match-meta">
                    <span className="match-badge">{m.group ? `Grupo ${m.group}` : m.phase}</span>
                    <span>{formatDate(m.date)} · {m.time}</span>
                    {m.homeScore !== null && <span className="match-badge" style={{ background: "#16331f", color: "#3ecb96" }}>Encerrado</span>}
                  </div>
                  <div className="match-row">
                    <div className="team"><div className="team-flag">{fl(m.home)}</div><div className="team-name">{m.home}</div></div>
                    <div className="score-box">
                      <input className="score-input" type="number" min="0" max="99" value={pred.home ?? ""} disabled={m.homeScore !== null} onChange={e => setPred(m.id, "home", e.target.value)} />
                      <span className="score-sep">:</span>
                      <input className="score-input" type="number" min="0" max="99" value={pred.away ?? ""} disabled={m.homeScore !== null} onChange={e => setPred(m.id, "away", e.target.value)} />
                    </div>
                    <div className="team"><div className="team-flag">{fl(m.away)}</div><div className="team-name">{m.away}</div></div>
                  </div>
                  {m.homeScore !== null && (
                    <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#7a6a8a" }}>
                      Resultado: {m.homeScore} × {m.awayScore}
                    </div>
                  )}
                  <div className={`pts-chip ${ptsClass}`}>
                    {pts === null ? (pred.home !== undefined && pred.away !== undefined && pred.home !== "" && pred.away !== "" ? "✅ Palpite salvo" : "— sem palpite") : `${pts} pts`}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderRanking = () => (
    <div>
      <div className="card">
        <div className="card-title">🏆 Classificação Geral</div>
        {rankData.map((u, i) => (
          <div key={u.name} className="rank-row">
            <div className={`rank-pos ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>{i + 1}</div>
            <div className="avatar">{u.name[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div className="rank-name">{u.name} {u.isAdmin ? <span className="tag">admin</span> : null} {u.name === currentUser.name ? <span style={{ fontSize: 10, color: "#3ecb96" }}>(você)</span> : null}</div>
              <div className="rank-detail"><span>🎯 {u.exact} exatos</span><span>✅ {u.wins} acertos</span><span>🤝 {u.draws} empates</span></div>
            </div>
            <div className="rank-pts">{u.pts}</div>
          </div>
        ))}
        {rankData.length === 0 && <div style={{ color: "#7a6a8a", fontSize: 13, textAlign: "center", padding: 16 }}>Nenhum participante ainda</div>}
      </div>
      {myPoints && (
        <div className="card">
          <div className="card-title">📈 Seu Desempenho</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[["Pontos", myPoints.pts, "#14a36e"], ["Exatos", myPoints.exact, "#f2d680"], ["Acertos", myPoints.wins, "#3ecb96"], ["Empates", myPoints.draws, "#5bc4e8"]].map(([l, v, c]) => (
              <div key={l} style={{ background: "#170f1f", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 26, fontWeight: 900, color: c }}>{v}</div>
                <div style={{ fontSize: 10, color: "#7a6a8a", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, textAlign: "center", fontFamily: "'Fredoka',sans-serif", fontSize: 14, color: "#7a6a8a" }}>
            Posição: <span style={{ color: "#f2d680", fontSize: 20, fontWeight: 900 }}>#{rankData.findIndex(u => u.name === currentUser.name) + 1}</span> de {rankData.length}
          </div>
        </div>
      )}
    </div>
  );

  const renderGrupos = () => (
    <div>
      {groups.map(grp => {
        const standings = groupStandings(grp);
        return (
          <div key={grp} className="card">
            <div className="card-title">🏴 Grupo {grp}</div>
            <table className="group-table">
              <thead><tr><th>Time</th><th>P</th><th>Pts</th><th>SG</th><th>GP</th></tr></thead>
              <tbody>
                {standings.map((t, i) => (
                  <tr key={t.team}>
                    <td style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className={`q-dot ${i < 2 ? "q-yes" : "q-no"}`}></span>
                      {fl(t.team)} {t.team}
                    </td>
                    <td>{t.p}</td>
                    <td style={{ fontWeight: 700, color: "#3ecb96" }}>{t.pts}</td>
                    <td style={{ color: t.gd >= 0 ? "#3ecb96" : "#e8607a" }}>{t.gd > 0 ? "+" : ""}{t.gd}</td>
                    <td>{t.gf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
      <div style={{ fontSize: 11, color: "#5a4a6a", textAlign: "center", padding: 8 }}>● verde = classifica</div>
    </div>
  );

  const renderMural = () => (
    <div>
      <div className="card">
        <div className="card-title">💬 Mural do Bolão</div>
        <div className="emoji-bar">
          {["🔥","🎯","😂","💀","🙏","🫡","😤","🤩","⚽","🏆","😭","👏"].map(e => (
            <button key={e} className="emoji-btn" onClick={() => setMsgEmoji(e)}>{e}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input className="inp" style={{ flex: 1 }} placeholder="Manda um recado…" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
          <button className="btn btn-green" onClick={sendMsg}>Enviar</button>
        </div>
        {messages.length === 0 && <div style={{ color: "#7a6a8a", fontSize: 13, textAlign: "center", padding: 16 }}>Nenhuma mensagem ainda. Seja o primeiro!</div>}
        {[...messages].reverse().map((msg, i) => (
          <div key={i} className="msg-card">
            <div className="msg-author">{msg.author}</div>
            <div className="msg-text">{msg.text}</div>
            <div className="msg-time">{msg.time}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!currentUser.isAdmin) return (
      <div className="card" style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ color: "#7a6a8a", marginTop: 12 }}>Área restrita ao administrador</div>
      </div>
    );
    return (
      <div>
        <div className="card">
          <div className="card-title">📋 Registrar Resultados</div>
          {matches.map(m => (
            <div key={m.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #382647" }}>
              <div style={{ fontSize: 11, color: "#7a6a8a", marginBottom: 6 }}>{m.home} × {m.away} · {formatDate(m.date)}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="score-input" style={{ flex: 1 }} type="number" min="0" placeholder="-" value={m.homeScore ?? ""} onChange={e => setResult(m.id, "home", e.target.value)} />
                <span style={{ color: "#7a6a8a", fontWeight: 900 }}>×</span>
                <input className="score-input" style={{ flex: 1 }} type="number" min="0" placeholder="-" value={m.awayScore ?? ""} onChange={e => setResult(m.id, "away", e.target.value)} />
                <button className="btn btn-red btn-sm" onClick={() => deleteMatch(m.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">➕ Adicionar Jogo</div>
          <div className="form-row">
            <input className="inp" placeholder="Time Casa" value={newMatch.home} onChange={e => setNewMatch(p => ({ ...p, home: e.target.value }))} />
            <input className="inp" placeholder="Time Visitante" value={newMatch.away} onChange={e => setNewMatch(p => ({ ...p, away: e.target.value }))} />
          </div>
          <div className="form-row">
            <input className="inp" type="date" value={newMatch.date} onChange={e => setNewMatch(p => ({ ...p, date: e.target.value }))} />
            <input className="inp" type="time" value={newMatch.time} onChange={e => setNewMatch(p => ({ ...p, time: e.target.value }))} />
          </div>
          <div className="form-row">
            <select className="sel" value={newMatch.phase} onChange={e => setNewMatch(p => ({ ...p, phase: e.target.value }))}>
              {PHASES.map(ph => <option key={ph}>{ph}</option>)}
            </select>
            <input className="inp" placeholder="Grupo (A, B…)" value={newMatch.group} onChange={e => setNewMatch(p => ({ ...p, group: e.target.value.toUpperCase() }))} />
          </div>
          <button className="btn btn-green btn-full" onClick={addMatch}>Adicionar Jogo</button>
        </div>

        <div className="card">
          <div className="card-title">💳 Configurações de Pagamento</div>
          <div className="form-row">
            <div>
              <div style={{ fontSize: 11, color: "#7a6a8a", marginBottom: 4 }}>Cota (R$)</div>
              <input className="inp" type="number" min="0" value={settings.cota} onChange={e => updateSettings("cota", e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#7a6a8a", marginBottom: 4 }}>Banco</div>
              <input className="inp" value={settings.bank} onChange={e => updateSettings("bank", e.target.value)} />
            </div>
          </div>
          <div className="form-full">
            <div style={{ fontSize: 11, color: "#7a6a8a", marginBottom: 4 }}>Chave PIX</div>
            <input className="inp" value={settings.pixKey} onChange={e => updateSettings("pixKey", e.target.value)} />
          </div>
          <div className="form-full">
            <div style={{ fontSize: 11, color: "#7a6a8a", marginBottom: 4 }}>Nome do recebedor</div>
            <input className="inp" value={settings.payeeName} onChange={e => updateSettings("payeeName", e.target.value)} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">👥 Participantes ({users.length})</div>
          {users.map(u => {
            const ud = rankData.find(r => r.name === u.name);
            const paid = !!payments[u.name];
            return (
              <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #382647" }}>
                <div className="avatar">{u.name[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name} {u.isAdmin ? <span className="tag">admin</span> : null}</div>
                  <div style={{ fontSize: 11, color: "#7a6a8a" }}>{ud?.pts ?? 0} pts</div>
                </div>
                <button
                  className={`pay-status-btn ${paid ? "pay-status-paid" : "pay-status-pending"}`}
                  style={{ padding: "4px 10px", fontSize: 11 }}
                  onClick={() => togglePayment(u.name)}
                >
                  {paid ? "✅ Pago" : "⏳ Pendente"}
                </button>
                {u.name !== currentUser.name && (
                  <button className="btn btn-sm" style={{ background: u.isAdmin ? "#c0392b22" : "#14a36e22", color: u.isAdmin ? "#e8607a" : "#3ecb96", border: `1px solid ${u.isAdmin ? "#e8607a" : "#3ecb96"}` }}
                    onClick={() => {
                      setState(p => ({ ...p, users: p.users.map(usr => usr.name === u.name ? { ...usr, isAdmin: !usr.isAdmin } : usr) }));
                      showToast(`${u.name} ${u.isAdmin ? "removido de" : "promovido a"} admin`);
                    }}>
                    {u.isAdmin ? "Remover admin" : "Promover"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">⚠️ Zona de Perigo</div>
          <button className="btn btn-red btn-full" onClick={() => {
            if (!window.confirm("Apagar TODOS os dados do bolão? Esta ação não pode ser desfeita.")) return;
            const reset = { users: [], matches: initialMatches, predictions: {}, messages: [], currentUser: null, payments: {}, settings: { cota: 50, pixKey: "185.624.458-00", payeeName: "Robson Campos", bank: "Nubank" } };
            setLocalUser(null);
            setState(reset);
            showToast("Bolão resetado");
          }}>Resetar bolão</button>
        </div>
      </div>
    );
  };

  const TABS = [
    { id: "home", icon: "🏠", label: "Início" },
    { id: "palpites", icon: "⚽", label: "Palpites" },
    { id: "ranking", icon: "🏆", label: "Ranking" },
    { id: "grupos", icon: "📊", label: "Grupos" },
    { id: "mural", icon: "💬", label: "Mural" },
    { id: "admin", icon: "⚙️", label: "Admin" },
  ];

  return (
    <div className="app">
      <style>{css}</style>
      {toast && <div className="toast">{toast}</div>}

      <div className="header">
        <div className="header-brand">
          <img src={NERSU_IMG} alt="Nersu da Capitinga" className="header-photo" />
          <div>
            <div className="header-title">Bolão dos Nersus</div>
            <div className="header-sub">Copa do Mundo 2026</div>
          </div>
        </div>
        <div className="header-user">
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{currentUser.name}</div>
            <div style={{ fontSize: 10, color: "#3ecb96" }}>{myPoints?.pts ?? 0} pts</div>
          </div>
          <div className="avatar" onClick={() => { setLocalUser(null); setState(p => ({ ...p, currentUser: null })); }} title="Sair">
            {currentUser.name[0].toUpperCase()}
          </div>
        </div>
      </div>

      <div className="main">
        {tab === "home" && renderHome()}
        {tab === "palpites" && renderPalpites()}
        {tab === "ranking" && renderRanking()}
        {tab === "grupos" && renderGrupos()}
        {tab === "mural" && renderMural()}
        {tab === "admin" && renderAdmin()}
      </div>

      <div className="nav">
        {TABS.map(t => (
          <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span className="icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
