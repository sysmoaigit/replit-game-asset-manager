// One-time contextual hints registry. Each hint id is shown at most once
// across sessions (stored in localStorage). Settings can reset or suppress all.

const SEEN_KEY = "selim_seen_hints_v1";
const SUPPRESS_KEY = "selim_hints_suppressed_v1";

export type HintId =
  | "first_card"
  | "first_stat_drop"
  | "first_money_loss"
  | "first_promise"
  | "first_recovery"
  | "first_achievement"
  | "first_ending_choice"
  | "first_ending"
  | "first_album"
  | "first_chat";

export type HintDef = {
  id: HintId;
  title: string;
  text: string;
};

export const HINTS: Record<HintId, HintDef> = {
  first_card: {
    id: "first_card",
    title: "প্রতিটা card-এ ৪টা পথ",
    text: "করি / এড়াই / স্মার্ট মুভ / পরে — কোনটা বেছে নেবে সেটাই Selim-এর দিন ঘুরাবে।",
  },
  first_stat_drop: {
    id: "first_stat_drop",
    title: "Stats কমা মানে warning",
    text: "Energy বা Mood কমে গেলে পরের card-এ Selim দুর্বল হয়ে পড়বে। Recharge করো।",
  },
  first_money_loss: {
    id: "first_money_loss",
    title: "টাকা গেল 💸",
    text: "Money negative হলে debt বাড়বে। Influencer mode বা কাজ-এ যাও।",
  },
  first_promise: {
    id: "first_promise",
    title: "Promise track হচ্ছে",
    text: "Selim কথা দিলে Promise Mode চালু। ভাঙলে trust drop হবে — সাবধান।",
  },
  first_recovery: {
    id: "first_recovery",
    title: "Recovery Mode",
    text: "৫টা সঠিক choice — Selim আবার দাঁড়াবে। হার মেনো না।",
  },
  first_achievement: {
    id: "first_achievement",
    title: "Achievement unlock! 🏆",
    text: "Selim-এর Album-এ এটা যুক্ত হলো। আরও আছে — খেলতে থাকো।",
  },
  first_ending_choice: {
    id: "first_ending_choice",
    title: "Final দিন — শেষ choice!",
    text: "এই card-এর choice-ই Selim-এর ending decide করবে। ভেবে নাও।",
  },
  first_ending: {
    id: "first_ending",
    title: "Ending পেলে — share করো!",
    text: "তোমার playthrough-এর card বানাও, বন্ধুদের পাঠাও। Daily Challenge unlock হলো।",
  },
  first_album: {
    id: "first_album",
    title: "Selim-এর Album",
    text: "এখানে তোমার পাওয়া endings, easter eggs, achievements সব থাকবে।",
  },
  first_chat: {
    id: "first_chat",
    title: "Selim-এর সাথে কথা বলো",
    text: "Chat panel থেকে Selim-কে advice দাও — ও কখনো শুনবে, কখনো না।",
  },
};

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  try { localStorage.setItem(key, JSON.stringify(Array.from(set))); } catch { /* ignore */ }
}

export function isHintsSuppressed(): boolean {
  try { return localStorage.getItem(SUPPRESS_KEY) === "1"; } catch { return false; }
}

export function setHintsSuppressed(v: boolean): void {
  try {
    if (v) localStorage.setItem(SUPPRESS_KEY, "1");
    else localStorage.removeItem(SUPPRESS_KEY);
  } catch { /* ignore */ }
}

export function hasSeenHint(id: HintId): boolean {
  return readSet(SEEN_KEY).has(id);
}

/** Mark a hint as seen. Returns the hint def if it should be shown now (was unseen and not suppressed). */
export function tryShowHint(id: HintId): HintDef | null {
  if (isHintsSuppressed()) return null;
  const seen = readSet(SEEN_KEY);
  if (seen.has(id)) return null;
  seen.add(id);
  writeSet(SEEN_KEY, seen);
  return HINTS[id] ?? null;
}

export function resetSeenHints(): void {
  try { localStorage.removeItem(SEEN_KEY); } catch { /* ignore */ }
}
