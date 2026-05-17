// Lightweight inference of how each girl is "feeling toward Selim" right now.
// Uses only stats already tracked in the game store; no new persistence.
// This is character-flavor, not a real social simulation.

import type { Stats } from "../types";
type GameStats = Stats;

export type GirlMood =
  | "warm"        // friendly / open
  | "playful"     // teasing / cute
  | "neutral"     // default
  | "boundary"    // setting limits
  | "distant"     // pulling back
  | "concerned"   // worried about Selim
  | "annoyed"     // pressure rising
  | "complicated"; // emotionally heavy

export interface GirlMoodInfo {
  mood: GirlMood;
  emoji: string;
  hint: string; // one-line player-facing hint.
}

const EMOJI: Record<GirlMood, string> = {
  warm: "🌸", playful: "😉", neutral: "🙂", boundary: "🛑",
  distant: "🌫️", concerned: "🤍", annoyed: "😤", complicated: "🌧️",
};

// Pull commonly-used stat fields with safe defaults so callers don't need
// to perfectly match the engine's exact GameStats keys.
function get(stats: GameStats, key: string, fallback = 0): number {
  const v = (stats as unknown as Record<string, number | undefined>)[key];
  return typeof v === "number" ? v : fallback;
}

export function deriveGirlMood(girlId: string, stats: GameStats): GirlMoodInfo {
  const selfRespect = get(stats, "selfRespect");
  const friendTrust = get(stats, "friendTrust");
  // Note: the canonical stat name in src/types.ts is `reputation`. We accept
  // `reputationRisk` as a fallback for older saves, but never invert the value.
  const reputation = get(stats, "reputation", get(stats, "reputationRisk"));
  const pinkyHope = get(stats, "pinkyHope");
  const romanticFever = get(stats, "romanticFever");
  const delusion = get(stats, "emotionalDelusion");

  switch (girlId) {
    case "pinky":
      if (pinkyHope > 70 && selfRespect < 30) return info("annoyed", "Pinky's bored of the pressure.");
      if (selfRespect >= 60) return info("playful", "She notices Selim isn't begging anymore.");
      return info("neutral", "Same maybe-game as always.");
    case "sadia":
      if (romanticFever > 60) return info("distant", "She felt the over-attention.");
      return info("warm", "Still friendly — same smile for everyone.");
    case "tania":
      if (reputation > 40) return info("boundary", "She is reinforcing the line.");
      if (selfRespect >= 60) return info("neutral", "Respect noticed, distance still real.");
      return info("boundary", "Boundary is firm and fair.");
    case "sumaiya":
      if (delusion > 50) return info("distant", "She senses the fantasy spiral.");
      return info("complicated", "Mixed signals — even she isn't sure.");
    case "nila":
      if (friendTrust >= 60) return info("warm", "Glad Selim is finally listening.");
      if (friendTrust < 25) return info("concerned", "Worried Selim won't hear truth in time.");
      return info("neutral", "Truth-mode, on standby.");
    case "farzana":
      if (get(stats, "careerProgress") >= 50) return info("warm", "Impressed by the actual progress.");
      return info("playful", "Mentor-mode, mild encouragement.");
    case "jannat":
      return info("warm", "Polite, kind, equally to everyone.");
    case "mitu":
      if (selfRespect >= 55) return info("annoyed", "Doesn't like the new boundary.");
      return info("playful", "Sweet voice, small ask incoming.");
    case "tabin":
      return info("warm", "Patient. Wants honesty, not theater.");
    case "asha":
      return info("complicated", "Heavy, careful, lonely.");
    default:
      return info("neutral", "No strong signal.");
  }
}

function info(mood: GirlMood, hint: string): GirlMoodInfo {
  return { mood, emoji: EMOJI[mood], hint };
}
