// Daily Challenge — seeded daily run with a modifier.
// One attempt per local day; tracks personal best score across runs.

const STATE_KEY = "selim_daily_v1";

export type DailyModifier = {
  id: string;
  name: string;
  description: string;
  /** Stat tweaks applied at the start of the run. */
  initialStatDelta: {
    mood?: number;
    money?: number;
    energy?: number;
    loneliness?: number;
    addiction?: number;
    pinkyHope?: number;
  };
};

export const DAILY_MODIFIERS: DailyModifier[] = [
  {
    id: "no_tea",
    name: "চা ছাড়া দিন ☕❌",
    description: "Cha Mama আজ ছুটিতে। Mood -10 দিয়ে শুরু।",
    initialStatDelta: { mood: -10 },
  },
  {
    id: "double_rickshaw",
    name: "Double Rickshaw 🛺",
    description: "ভাড়া আজ double। Money -200 দিয়ে শুরু।",
    initialStatDelta: { money: -200 },
  },
  {
    id: "lonely_day",
    name: "Lonely Day 💔",
    description: "সবাই busy। Loneliness +25, Pinky Hope -10।",
    initialStatDelta: { loneliness: 25, pinkyHope: -10 },
  },
  {
    id: "low_battery",
    name: "Low Battery 🔋",
    description: "ঘুম হয়নি। Energy -25 দিয়ে শুরু।",
    initialStatDelta: { energy: -25 },
  },
  {
    id: "smoke_temptation",
    name: "Smoke Temptation 🚬",
    description: "Bogura-র দোস্ত phone দিয়েছে। Addiction +20।",
    initialStatDelta: { addiction: 20 },
  },
  {
    id: "rich_kid",
    name: "Salary Day 💰",
    description: "Account-এ extra ৳500। কী করবে?",
    initialStatDelta: { money: 500 },
  },
  {
    id: "pinky_silent",
    name: "Pinky Silent 📵",
    description: "Pinky-র phone বন্ধ। Pinky Hope -20।",
    initialStatDelta: { pinkyHope: -20 },
  },
];

type DailyState = {
  lastDateKey: string | null;
  lastEndingId: string | null;
  bestScore: number;
  bestEndingId: string | null;
  bestDateKey: string | null;
  attempts: number;
};

function defaultState(): DailyState {
  return { lastDateKey: null, lastEndingId: null, bestScore: 0, bestEndingId: null, bestDateKey: null, attempts: 0 };
}

function loadState(): DailyState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<DailyState>;
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function saveState(s: DailyState): void {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

/** Format today's date as YYYY-MM-DD using local timezone. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Deterministic hash of a date string → integer seed. */
export function dailySeed(d: Date = new Date()): number {
  const key = todayKey(d);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Pick today's modifier deterministically from the date. */
export function getTodayModifier(d: Date = new Date()): DailyModifier {
  return DAILY_MODIFIERS[dailySeed(d) % DAILY_MODIFIERS.length];
}

export function hasPlayedToday(): boolean {
  const s = loadState();
  return s.lastDateKey === todayKey();
}

/** Mark today as attempted at the moment a daily run begins (one-attempt gate). */
export function markDailyAttempt(): void {
  const s = loadState();
  if (s.lastDateKey === todayKey()) return;
  saveState({ ...s, lastDateKey: todayKey(), attempts: s.attempts + 1 });
}

export function getDailyState(): DailyState {
  return loadState();
}

/** Compute a simple comparable score for a daily run. */
export function computeDailyScore(stats: {
  health: number; mood: number; money: number; iq: number; energy: number;
  selfRespect: number; careerProgress: number; friendTrust: number; pinkyHope: number;
}): number {
  return Math.round(
    stats.health + stats.mood + stats.iq + stats.energy +
    stats.selfRespect + stats.careerProgress + stats.friendTrust + stats.pinkyHope +
    Math.max(-100, Math.min(200, stats.money / 10))
  );
}

/** Record a completed daily run. */
export function recordDailyRun(endingId: string, score: number): DailyState {
  const s = loadState();
  const key = todayKey();
  const next: DailyState = {
    lastDateKey: key,
    lastEndingId: endingId,
    bestScore: Math.max(s.bestScore, score),
    bestEndingId: score > s.bestScore ? endingId : s.bestEndingId,
    bestDateKey: score > s.bestScore ? key : s.bestDateKey,
    // attempts already bumped at start via markDailyAttempt; keep as-is.
    attempts: s.attempts,
  };
  saveState(next);
  return next;
}

export function clearDailyState(): void {
  try { localStorage.removeItem(STATE_KEY); } catch { /* ignore */ }
}
