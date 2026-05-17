// Chat Mode system for Selim — adds friend / male / female / fake-girl / career
// / roast / support personas on top of the existing harness. Each mode tweaks
// Selim's tone, generates persona-specific replies, and emits system event
// bubbles ("Selim opened bKash", "Fake ID Risk +10", etc.) that affect stats.

import type { Stats, Flags } from "../types";

export type ChatMode =
  | "friend"
  | "male_friend"
  | "female_friend"
  | "fake_girl_id"
  | "career_coach"
  | "roast_friend"
  | "emotional_support";

export type ChatModeMeta = {
  id: ChatMode;
  label: string;
  emoji: string;
  color: string;
  hint: string;
};

export const CHAT_MODES: ChatModeMeta[] = [
  { id: "friend",            label: "Friend",     emoji: "🤝", color: "#FFD700", hint: "Normal best-friend talk" },
  { id: "male_friend",       label: "Bro Mode",   emoji: "💪", color: "#60a5fa", hint: "Bro humor, money drama" },
  { id: "female_friend",     label: "Female Friend", emoji: "🌸", color: "#f472b6", hint: "Selim gets soft & confused" },
  { id: "fake_girl_id",      label: "Fake Girl ID", emoji: "🎭", color: "#a855f7", hint: "Test his weakness (fictional)" },
  { id: "career_coach",      label: "Career Coach", emoji: "📈", color: "#22c55e", hint: "Push him toward work" },
  { id: "roast_friend",      label: "Roast Mode", emoji: "🔥", color: "#FF6B00", hint: "Tease & roast Selim" },
  { id: "emotional_support", label: "Support",    emoji: "💛", color: "#FFB347", hint: "Comfort him" },
];

export function getChatModeMeta(id: ChatMode): ChatModeMeta {
  return CHAT_MODES.find((m) => m.id === id) ?? CHAT_MODES[0];
}

// ── Greetings shown when a mode is first activated ───────────────────────────
export function modeGreeting(mode: ChatMode, address: string): string {
  switch (mode) {
    case "male_friend":
      return `${address}, bol bhai. Tui ki abar amake gyan dite ashchis? 😏`;
    case "female_friend":
      return `Apni? Ohh… apnar message dekhe matha calm hoye gelo. 🌸 Bolen.`;
    case "fake_girl_id":
      return `Hi… apni ke? 👀 Amar sathe kotha bolte chan? Ami available. Mane normal available.`;
    case "career_coach":
      return `Ok coach, listening. (kintu Pinky online thakle attention split hobe, warning dilam)`;
    case "roast_friend":
      return `Roast me ${address}. Ami ready. Kintu beshi hard hoile oviman korbo. 😤`;
    case "emotional_support":
      return `${address}… ektu kotha bolbi? Mood off. 💔`;
    case "friend":
    default:
      return `${address}, ki obostha? Ajke amar matha mostly stable.`;
  }
}

// ── Persona post-processor: rewrites the brain's reply with mode flavor ──────
// We keep the brain's core sentence and prepend / wrap it with persona spice.
export function applyPersona(reply: string, mode: ChatMode): string {
  const trimmed = reply.trim();
  if (!trimmed || trimmed === "...") return reply;

  switch (mode) {
    case "fake_girl_id": {
      // Selim becomes customer-service premium for fake girls
      const intros = [
        "Apnar message dekhe bhalo laglo… ",
        "Apni bolle ami change hoye jabo. ",
        "DP nai but vibe real. ",
        "Apnar jonno time ase always. ",
      ];
      return intros[Math.floor(Math.random() * intros.length)] + trimmed;
    }
    case "female_friend": {
      const intros = [
        "Apni eto care koren keno… ",
        "Apnar kotha shunle matha thanda hoy. ",
        "Apni friend, but care ta dangerous… ",
      ];
      // Replace tui/tor with apni/apnar lightly
      const softened = trimmed.replace(/\btui\b/gi, "apni").replace(/\btor\b/gi, "apnar");
      return intros[Math.floor(Math.random() * intros.length)] + softened;
    }
    case "male_friend": {
      const intros = ["Bhai, ", "Dost, ", "Tui bujhbi na, "];
      return intros[Math.floor(Math.random() * intros.length)] + trimmed;
    }
    case "roast_friend": {
      // Selim either laughs or gets oviman — handled by event layer too
      return trimmed;
    }
    case "career_coach":
    case "emotional_support":
    case "friend":
    default:
      return reply;
  }
}

// ── System event bubbles ─────────────────────────────────────────────────────
export type ChatSystemEvent = {
  id: string;
  text: string;
  tone: "info" | "pink" | "warning" | "memory" | "danger";
  effects?: Partial<Stats>;
  flagDelta?: Partial<Flags>;
};

let evtCounter = 0;
function evtId() { return `evt_${Date.now()}_${evtCounter++}`; }

// Lightweight detection: did the player just ask Selim for money?
const ASK_MONEY_RE = /\b(taka|টাকা|borrow|ধার|recharge|lend|500|300|1000|২০০|৩০০|৫০০)\b/i;
const FLIRT_RE = /\b(cute|হ্যান্ডসাম|handsome|love|valobashi|valo lage|miss kori|miss you)\b/i;
const CATCH_LIE_RE = /\b(mittha|মিথ্যা|lie|lying|dhore felechi|caught)\b/i;

export function detectChatEvents(
  playerMessage: string,
  mode: ChatMode,
  stats: Stats,
): ChatSystemEvent[] {
  const events: ChatSystemEvent[] = [];

  // Fake Girl ID: every flirty / friendly message bumps risk
  if (mode === "fake_girl_id") {
    const bump = FLIRT_RE.test(playerMessage) ? 15 : 8;
    events.push({
      id: evtId(),
      text: `🎭 Fake ID Risk +${bump}. Selim's reply speed: instant.`,
      tone: "danger",
      effects: { temptation: bump * 0.4, emotionalDelusion: bump * 0.3, selfRespect: -bump * 0.2 },
      flagDelta: { fakeGirlMessagesBelieved: 1 },
    });
    if (ASK_MONEY_RE.test(playerMessage)) {
      events.push({
        id: evtId(),
        text: "💸 Selim opened bKash. (For a stranger. Of course.)",
        tone: "warning",
        effects: { money: -100, selfRespect: -3 },
      });
    }
  }

  // Male friend asking for money while Selim is girl-busy → he refuses
  if (mode === "male_friend" && ASK_MONEY_RE.test(playerMessage)) {
    const girlBusy = stats.pinkyHope > 60 || stats.romanticFever > 60;
    if (girlBusy) {
      events.push({
        id: evtId(),
        text: "🙄 Selim said he's broke. 2 minutes later he opened bKash for Pinky.",
        tone: "warning",
        effects: { friendTrust: -3 },
        flagDelta: { liesTold: 1, moneyAskedFromFriend: 1 },
      });
    } else {
      events.push({
        id: evtId(),
        text: "🤝 Selim sent the money. Real friend moment.",
        tone: "memory",
        effects: { friendTrust: 5, money: -50 },
        flagDelta: { bestFriendMoments: 1, moneyAskedFromFriend: 1 },
      });
    }
  }

  // Player catches Selim in a lie
  if (CATCH_LIE_RE.test(playerMessage)) {
    events.push({
      id: evtId(),
      text: "😳 Selim got caught. Apology incoming…",
      tone: "memory",
      effects: { selfRespect: 2, friendTrust: 1 },
      flagDelta: { liesCaught: 1 },
    });
  }

  // Female friend mode: confusion grows
  if (mode === "female_friend" && FLIRT_RE.test(playerMessage)) {
    events.push({
      id: evtId(),
      text: "🌸 Selim is reading too much into this. Heart confused.",
      tone: "pink",
      effects: { romanticFever: 4, emotionalDelusion: 3 },
    });
  }

  // Roast mode behavior
  if (mode === "roast_friend") {
    if (stats.friendTrust > 60) {
      events.push({
        id: evtId(),
        text: "😂 Selim laughed. Friend trust holding.",
        tone: "info",
        effects: { mood: 2, iq: 1 },
      });
    } else {
      events.push({
        id: evtId(),
        text: "😤 Selim got oviman. Roast hit too hard.",
        tone: "warning",
        effects: { mood: -3, friendTrust: -2 },
        flagDelta: { defensiveMoments: 1 },
      });
    }
  }

  // Career coach mode rewards
  if (mode === "career_coach") {
    events.push({
      id: evtId(),
      text: "📈 Career nudge logged. Selim is (maybe) listening.",
      tone: "info",
      effects: { careerProgress: 1.5, selfRespect: 1, romanticFever: -1 },
    });
  }

  // Emotional support
  if (mode === "emotional_support") {
    events.push({
      id: evtId(),
      text: "💛 Selim feels held. Mood +3.",
      tone: "memory",
      effects: { mood: 3, friendTrust: 3, loneliness: -3 },
    });
  }

  return events;
}

// ── Girl-busy detection: Selim is too distracted by Pinky/romance to reply
// properly. Mostly hits male_friend & friend modes. We return a delayed/dry
// canned reply so the brain is bypassed, then schedule a delayed apology.
export function isGirlBusy(stats: Stats): boolean {
  return stats.pinkyHope > 70 || stats.romanticFever > 65;
}

const GIRL_BUSY_REPLIES = [
  "Pore bol? Ektu busy. 📱",
  "Bhai, network issue. Kalke kotha bolbo.",
  "Ekta urgent matter ase, free hoye reply dibo.",
  "Mental pressure jache, ektu space lagbe.",
  "Pinky'r ekta emergency. Pore.",
];

const APOLOGY_REPLIES = [
  "Bhai, sorry. Tokhon matha kaj kortesilo na. 🙏",
  "Sorry dost. Ami janoyar. Tokhon Pinky cloud e chilam.",
  "Bhai, tokhon ignore korar jonno sorry. Tui amar best friend, vule jaina.",
  "Sorry re. Ami nije nije e nijeke gali ditesi ekhon.",
];

export function pickGirlBusyReply(): string {
  return GIRL_BUSY_REPLIES[Math.floor(Math.random() * GIRL_BUSY_REPLIES.length)];
}

export function pickApology(address: string): string {
  const line = APOLOGY_REPLIES[Math.floor(Math.random() * APOLOGY_REPLIES.length)];
  return line.replace(/^Bhai/, address);
}

// ── Player asking Selim for money → funny excuses ───────────────────────────
// Player-asks-for-money: requires explicit "give/lend to me" intent so we
// don't false-fire on "I'll give you 500" or "recharge phone".
const PLAYER_ASKS_MONEY_RE =
  /(taka\s*de(\s|$)|টাকা\s*দে|ধার\s*(dibi|de)|lend\s*me|borrow.{0,10}me|dibi.{0,10}(taka|টাকা)|amake.{0,12}(taka|টাকা)|kichu\s*taka.{0,10}(de|dibi)|টাকা\s*ধার|loan\s*de)/i;

export function playerIsAskingForMoney(text: string): boolean {
  return PLAYER_ASKS_MONEY_RE.test(text);
}

const SELIM_MONEY_EXCUSES = [
  "Bhai, amar obostha tight. Pinky'র recharge er por kichu nai. 😬",
  "Taka nai bhai. Heart ache. Tao tor jonno chesta korbo… kalke?",
  "Ami toh nije ধার e cholchi. Tui jane na?",
  "Actually Pinky'র ekta emergency ase eikhon. Sorry bhai.",
  "Bhai, mess rent দিতে hocche kalke. Bujhish toh.",
  "Bkash e 47 taka ase. Tao chash? 😅",
];

export function selimMoneyExcuse(stats: Stats): { text: string; helped: boolean } {
  // High friendTrust + not girl-busy + has money → he actually helps
  if (stats.friendTrust > 70 && !isGirlBusy(stats) && stats.money > 200) {
    return {
      text: "Bhai, kotota lagbe? bKash kortesi. Tui ase bole ami achi. 🤝",
      helped: true,
    };
  }
  return {
    text: SELIM_MONEY_EXCUSES[Math.floor(Math.random() * SELIM_MONEY_EXCUSES.length)],
    helped: false,
  };
}

// ── Selim's status badge per mode + stats ────────────────────────────────────
export function selimStatusLabel(mode: ChatMode, stats: Stats): string {
  if (stats.pinkyHope > 75) return "Pinky Effect — typing to her instead";
  if (stats.mood < 25) return "Heartbroken — seen by life";
  if (mode === "fake_girl_id") return "Fake ID Excited — instant reply mode";
  if (mode === "female_friend") return "Online, but emotionally unavailable";
  if (mode === "career_coach") return "Career mode loading… Bogura থেইকা ঢাকা স্পিডে";
  if (mode === "roast_friend") return "Friend Trust repairing";
  if (mode === "emotional_support") return "Listening";
  if (stats.romanticFever > 70) return "Girl-Busy";
  return "Online";
}

// ── Persistence ──────────────────────────────────────────────────────────────
const MODE_KEY = "selim_chat_mode_v1";
const UNREAD_KEY = "selim_chat_unread_v1";

export function loadChatMode(): ChatMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v && CHAT_MODES.some((m) => m.id === v)) return v as ChatMode;
  } catch {}
  return "friend";
}

export function saveChatMode(mode: ChatMode) {
  try { localStorage.setItem(MODE_KEY, mode); } catch {}
}

export function loadUnread(): number {
  try { return Number(localStorage.getItem(UNREAD_KEY) ?? "0") || 0; } catch { return 0; }
}

export function saveUnread(n: number) {
  try { localStorage.setItem(UNREAD_KEY, String(n)); } catch {}
}
