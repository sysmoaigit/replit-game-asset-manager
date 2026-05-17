// Centralized reply-delay engine. Maps Selim's high-level human state to a
// realistic typing delay window. Used by the chat panel intercepts to keep
// pacing varied without making the UI annoying.

import type { Stats } from "../types";
import type { ChatMode } from "../chat/chatModes";

export type SelimHumanState =
  | "normal" | "happy" | "lonely" | "girl_busy" | "hyper_lover"
  | "lying" | "caught" | "ashamed" | "oviman" | "angry"
  | "heartbroken" | "touba" | "relapse" | "apology" | "best_friend"
  | "dark_side" | "career_focused" | "bogura_boss";

const RANGES: Record<SelimHumanState, [number, number]> = {
  normal: [800, 1800],
  happy: [700, 1500],
  lonely: [1200, 2400],
  girl_busy: [4000, 12000],
  hyper_lover: [500, 1200],
  lying: [1500, 2800],
  caught: [1800, 3000],
  ashamed: [3000, 7000],
  oviman: [5000, 15000],
  angry: [1000, 3000],
  heartbroken: [1500, 4000],
  touba: [1000, 2000],
  relapse: [2000, 4000],
  apology: [1500, 3000],
  best_friend: [700, 1400],
  dark_side: [1500, 3500],
  career_focused: [900, 1800],
  bogura_boss: [800, 1600],
};

/** Pick a delay (ms) for the given state, with a hard cap so the UI never feels broken. */
export function calculateReplyDelay(state: SelimHumanState, opts: { mode?: ChatMode } = {}): number {
  let [lo, hi] = RANGES[state] ?? RANGES.normal;
  // Hyper-lover replies fast to female/fake girl, slow to male friend.
  if (state === "hyper_lover" && (opts.mode === "friend" || opts.mode === "male_friend")) {
    [lo, hi] = [5000, 10000];
  }
  // Girl-busy: female_friend / fake_girl_id still gets quick replies.
  if (state === "girl_busy" && (opts.mode === "female_friend" || opts.mode === "fake_girl_id")) {
    [lo, hi] = [600, 1400];
  }
  const ms = lo + Math.random() * (hi - lo);
  return Math.min(15000, Math.round(ms));
}

/** Derive Selim's high-level human state from current stats + mode. */
export function deriveHumanState(stats: Stats, mode: ChatMode): SelimHumanState {
  if (stats.romanticFever > 80) return "hyper_lover";
  if (stats.pinkyHope > 70) return "girl_busy";
  if (stats.mood < 25) return "heartbroken";
  if (stats.loneliness > 65) return "lonely";
  if (stats.selfRespect > 75) return "best_friend";
  if (stats.careerProgress > 60 && mode === "career_coach") return "career_focused";
  if (stats.addiction > 60) return "dark_side";
  if (stats.friendTrust > 80) return "best_friend";
  return "normal";
}
