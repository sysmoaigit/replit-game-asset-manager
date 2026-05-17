// Lightweight per-day chat log used for the Day Summary recap.
// Stored in localStorage so it survives reloads but is cheap to update.

import type { ChatMode } from "./chatModes";

export type ChatLogEntry = {
  day: number;
  sender: "player" | "selim" | "system";
  text: string;
  mode: ChatMode;
  ts: number;
  tag?:
    | "warning"
    | "advice"
    | "lie"
    | "lie_caught"
    | "apology"
    | "ignored"
    | "funny"
    | "memory_saved"
    | "money_refused"
    | "money_helped"
    | "fake_id_risk";
};

const KEY = "selim_chat_log_v1";
const MAX_ENTRIES = 400;

export function loadChatLog(): ChatLogEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as ChatLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendChatLog(entry: ChatLogEntry) {
  try {
    const list = loadChatLog();
    list.push(entry);
    const trimmed = list.length > MAX_ENTRIES ? list.slice(list.length - MAX_ENTRIES) : list;
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {}
}

export function clearChatLog() {
  try { localStorage.removeItem(KEY); } catch {}
}

export type DailyChatRecap = {
  day: number;
  total: number;
  warningsGiven: number;
  ignoredCount: number;
  liesCaught: number;
  funniestLine: string | null;
  memoriesSaved: number;
  moneyAsked: number;
  fakeIdRisks: number;
};

export function buildDayRecap(day: number): DailyChatRecap | null {
  const log = loadChatLog().filter((e) => e.day === day);
  if (log.length === 0) return null;

  const playerWarnings = log.filter(
    (e) => e.sender === "player" && (e.tag === "warning" || e.tag === "advice"),
  ).length;
  const ignored = log.filter((e) => e.tag === "ignored").length;
  const liesCaught = log.filter((e) => e.tag === "lie_caught").length;
  const memoriesSaved = log.filter((e) => e.tag === "memory_saved").length;
  const moneyAsked = log.filter((e) => e.tag === "money_refused" || e.tag === "money_helped").length;
  const fakeIdRisks = log.filter((e) => e.tag === "fake_id_risk").length;

  const funny = log
    .filter((e) => e.sender === "selim" && (e.tag === "funny" || /😂|😅|haha|হাহা/.test(e.text)))
    .at(-1)?.text
    ?? log.filter((e) => e.sender === "selim").at(-1)?.text
    ?? null;

  return {
    day,
    total: log.length,
    warningsGiven: playerWarnings,
    ignoredCount: ignored,
    liesCaught,
    funniestLine: funny,
    memoriesSaved,
    moneyAsked,
    fakeIdRisks,
  };
}
