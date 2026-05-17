// Dynamic weight modifier — biases card selection by current state and arc.
// Pure function; consumed by the event director.

import type { GameState, EventArc } from "../types";

export const BASE_ARC_WEIGHTS: Record<EventArc, number> = {
  pinky: 25,
  random_crush: 18,
  career: 18,
  money: 14,
  friendship: 12,
  family: 8,
  heartbreak: 0,
  touba: 0,
  recovery: 0,
  dhaka_survival: 12,
  self_respect: 0,
  bogura_memory: 6,
};

// Map a card's category/tags to an event arc. Used to bucket existing cards.
export function inferArc(category: string | undefined, tags: string[] | undefined): EventArc {
  const c = (category ?? "").toLowerCase();
  const t = (tags ?? []).map((x) => x.toLowerCase());

  if (c.includes("pinky") || t.includes("pinky")) return "pinky";
  if (t.includes("crush") || c === "crush") return "random_crush";
  if (c === "career" || c === "work" || c === "iq" || t.includes("career")) return "career";
  if (c === "money" || t.includes("money") || t.includes("debt")) return "money";
  if (c === "social" || t.includes("friendship") || t.includes("friend") || t.includes("bestfriend")) return "friendship";
  if (c === "family" || t.includes("family") || t.includes("mother")) return "family";
  if (t.includes("heartbreak") || t.includes("rejection")) return "heartbreak";
  if (t.includes("touba") || t.includes("promise")) return "touba";
  if (c === "recovery" || c === "health" || t.includes("recovery")) return "recovery";
  if (c === "city" || c === "food" || c === "lifestyle") return "dhaka_survival";
  if (t.includes("selfrespect") || t.includes("self_respect")) return "self_respect";
  if (t.includes("bogura")) return "bogura_memory";
  if (c === "love") return "pinky";
  return "dhaka_survival";
}

// Returns modified weight per arc given the current state. Higher = more likely.
export function modifyArcWeights(
  state: GameState,
  recentArcs: EventArc[],
  recentPromiseTurnsAgo: number | null,
): Record<EventArc, number> {
  const w: Record<EventArc, number> = { ...BASE_ARC_WEIGHTS };
  const s = state.stats;
  const f = state.flags;
  const day = state.day;

  // Day-phase pacing
  if (day <= 3) {
    w.random_crush = Math.floor(w.random_crush * 0.4);
    w.heartbreak = 0;
    w.touba = 0;
    w.dhaka_survival += 6;
  } else if (day <= 7) {
    w.random_crush += 4;
    w.money += 4;
    w.career += 4;
  } else if (day <= 11) {
    w.career += 6;
    w.money += 6;
    w.pinky += 4;
    w.heartbreak += 6;
  } else if (day <= 14) {
    w.heartbreak += 10;
    w.recovery += 8;
    w.friendship += 6;
    w.self_respect += 6;
  } else {
    // day 15: bias toward final/self-respect, kill noise
    w.random_crush = 0;
    w.dhaka_survival = 0;
    w.self_respect += 20;
    w.career += 10;
    w.pinky += 5;
  }

  // Stat-driven modifiers
  if (s.pinkyHope > 75) { w.pinky += 20; w.random_crush += 5; w.career -= 5; }
  if (s.romanticFever > 70) w.random_crush += 25;
  if (recentPromiseTurnsAgo !== null && recentPromiseTurnsAgo <= 2) {
    w.random_crush += 20;
    w.touba += 20;
  }
  if (s.selfRespect > 70) { w.self_respect += 20; w.career += 15; w.pinky -= 10; }
  if (s.friendTrust > 75) { w.friendship += 20; }
  if (s.money < 200) { w.money += 25; w.random_crush += 5; }
  if (s.money < 0) { w.money += 30; w.dhaka_survival += 10; }
  if (s.careerProgress < 25 && day > 7) w.career += 25;
  if (s.mood < 25) { w.heartbreak += 25; w.pinky += 15; }
  if (s.health < 30) w.recovery += 35;
  if (f.heartbreakCount > 0 && s.selfRespect < 40) w.touba += 10;

  // Recent-arc dampening: same arc 3+ in a row → cut by 50%
  if (recentArcs.length >= 3) {
    const last3 = recentArcs.slice(-3);
    if (last3[0] === last3[1] && last3[1] === last3[2]) {
      w[last3[0]] = Math.floor(w[last3[0]] * 0.5);
    }
  }

  // Floor at 0
  for (const k of Object.keys(w) as EventArc[]) w[k] = Math.max(0, w[k]);
  return w;
}
