// Event director — chooses the next card based on day pacing, current arc
// momentum, recent promise state, and dynamic weights. Wraps the existing
// selectCard signature so the engine can swap it in safely.

import type { GameCard, GameState, EventArc } from "../types";
import { inferArc, modifyArcWeights } from "./eventWeights";
import { rng } from "../lib/rng";

const ARC_HISTORY_KEY = "selim_dhaka_arc_history_v1";
const PROMISE_MEMORY_KEY = "selim_dhaka_promise_memory_v1";

type PromiseMemory = { lastPromiseTurn: number | null };

const PHASES_PER_DAY = 4;
const turnIndex = (day: number, phaseIndex: number) => day * PHASES_PER_DAY + phaseIndex;

function safeReadRaw(key: string): unknown {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

const VALID_ARCS: ReadonlySet<EventArc> = new Set<EventArc>([
  "pinky", "random_crush", "career", "money", "friendship", "family",
  "heartbreak", "touba", "recovery", "dhaka_survival", "self_respect", "bogura_memory",
]);

export function getArcHistory(): EventArc[] {
  const parsed = safeReadRaw(ARC_HISTORY_KEY);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
  const recent = (parsed as { recent?: unknown }).recent;
  if (!Array.isArray(recent)) return [];
  return recent.filter((x): x is EventArc => typeof x === "string" && VALID_ARCS.has(x as EventArc));
}

export function pushArcHistory(arc: EventArc): void {
  const existing = getArcHistory();
  const next = [...existing, arc].slice(-12);
  safeWrite(ARC_HISTORY_KEY, { recent: next });
}

export function clearArcHistory(): void {
  safeWrite(ARC_HISTORY_KEY, { recent: [] });
}

export function notePromiseMade(day: number, phaseIndex: number): void {
  safeWrite(PROMISE_MEMORY_KEY, { lastPromiseTurn: turnIndex(day, phaseIndex) });
}

export function getPromiseMemory(): PromiseMemory {
  const parsed = safeReadRaw(PROMISE_MEMORY_KEY);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { lastPromiseTurn: null };
  const v = (parsed as { lastPromiseTurn?: unknown }).lastPromiseTurn;
  return { lastPromiseTurn: typeof v === "number" && Number.isFinite(v) ? v : null };
}

export function clearPromiseMemory(): void {
  safeWrite(PROMISE_MEMORY_KEY, { lastPromiseTurn: null });
}

// Primary entry point. Mirrors selectCard(state, allCards) signature.
export function directorSelectCard(state: GameState, allCards: GameCard[]): GameCard {
  const phases = ["Morning", "Noon", "Evening", "Night"];
  const currentPhase = phases[state.phaseIndex] as "Morning" | "Noon" | "Evening" | "Night";
  const recent8 = state.recentCards.slice(-8);

  // Filter to playable cards
  const available = allCards.filter((card) => {
    if (recent8.includes(card.id)) return false;
    if (card.category === "recovery") return false;
    if (card.tags?.includes("final") && state.day < 13) return false;
    if (card.phase && card.phase !== currentPhase) return false;
    if (card.condition && !card.condition(state)) return false;
    return true;
  });
  const pool = available.length > 0
    ? available
    : allCards.filter((c) => c.category !== "recovery" && (!c.condition || c.condition(state)));

  if (pool.length === 0) return allCards[0];

  // Compute arc weights
  const promise = getPromiseMemory();
  const nowTurn = turnIndex(state.day, state.phaseIndex);
  // ~2 turns ≈ half a day; original spec was "last 2 turns"
  const turnsSincePromise = promise.lastPromiseTurn !== null ? nowTurn - promise.lastPromiseTurn : null;
  const arcWeights = modifyArcWeights(state, getArcHistory(), turnsSincePromise);

  // Per-card weight = base card weight × arcWeight × situational bumps.
  // arcWeight of 0 truly disables that arc; we just floor to 0.
  const weights = pool.map((card) => {
    const arc = inferArc(card.category, card.tags);
    const arcW = arcWeights[arc] ?? 0;
    if (arcW <= 0) return 0;
    let w = (card.weight ?? 10) * arcW;

    if (state.stats.temptation > 70 && (card.category === "addiction" || card.tags?.includes("temptation"))) w *= 2;
    if (state.day >= 13 && card.tags?.includes("final")) w *= 3;
    if (state.stats.money < 0 && card.tags?.includes("debt")) w *= 2;
    if (state.stats.romanticFever > 70 && card.tags?.includes("crush")) w *= 2;
    if (state.stats.friendTrust > 70 && card.tags?.includes("bestfriend")) w *= 2;

    return Math.max(0, Math.floor(w));
  });

  let total = weights.reduce((a, b) => a + b, 0);
  // Fallback: if all arcs zeroed (e.g. day 15 with only "off" arcs in pool), give every card weight 1
  if (total === 0) {
    for (let i = 0; i < weights.length; i++) weights[i] = 1;
    total = weights.length;
  }

  let rand = rng() * total;
  let chosen: GameCard = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) {
    if (weights[i] <= 0) continue;
    rand -= weights[i];
    if (rand <= 0) { chosen = pool[i]; break; }
  }

  pushArcHistory(inferArc(chosen.category, chosen.tags));
  return chosen;
}
