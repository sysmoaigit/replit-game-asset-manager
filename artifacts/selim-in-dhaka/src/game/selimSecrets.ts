import type { Stats, Flags } from "../types";

export type SecretType =
  | "love_secret"
  | "money_secret"
  | "pinky_secret"
  | "fake_id_secret"
  | "lie_secret"
  | "asha_secret"
  | "tabin_secret"
  | "shame_secret"
  | "promise_secret"
  | "career_secret";

export interface Secret {
  id: string;
  type: SecretType;
  text: string;
  related: string;
  trustRequired: number;
  effect: { friendTrust?: number; selfRespect?: number; mood?: number; pinkyHope?: number };
  triggerKeywords?: RegExp;
  requireStat?: (s: Stats, f: Flags) => boolean;
}

export const SECRETS: Secret[] = [
  {
    id: "pinky_hmm_screenshot",
    type: "pinky_secret",
    text: "Selim saved Pinky's 'hmm' screenshot. He looks at it before sleep.",
    related: "Pinky",
    trustRequired: 45,
    effect: { friendTrust: 3, mood: -2 },
    triggerKeywords: /pinky|screenshot|message|hmm/i,
  },
  {
    id: "studied_but_checked",
    type: "lie_secret",
    text: "Selim said he was studying, but he was checking Pinky's last seen every 4 minutes.",
    related: "Pinky",
    trustRequired: 50,
    effect: { friendTrust: 2, selfRespect: -1 },
    triggerKeywords: /lie|truth|study|last seen|miththa|মিথ্যা/i,
  },
  {
    id: "pinky_emergency_fund",
    type: "money_secret",
    text: "Selim has a hidden 'Pinky Emergency Fund' — ৳800 he won't touch even when broke.",
    related: "Pinky",
    trustRequired: 55,
    effect: { friendTrust: 4, mood: 1 },
    triggerKeywords: /money|taka|টাকা|fund|emergency|broke/i,
  },
  {
    id: "medicine_lie",
    type: "money_secret",
    text: "Selim borrowed money for a Pinky gift and told his mom it was for medicine.",
    related: "Family",
    trustRequired: 60,
    effect: { friendTrust: 3, selfRespect: -2 },
    triggerKeywords: /family|ma|mother|borrow|gift|medicine|ধার/i,
  },
  {
    id: "fake_id_real_feels",
    type: "fake_id_secret",
    text: "Selim still wonders if the fake girl ID conversation was emotionally real.",
    related: "Fake ID",
    trustRequired: 50,
    effect: { friendTrust: 2, mood: -1 },
    triggerKeywords: /fake|id|catfish|real/i,
  },
  {
    id: "tabin_calm",
    type: "tabin_secret",
    text: "Selim feels calm with Tabin, but he's afraid to admit the confusion.",
    related: "Tabin",
    trustRequired: 70,
    effect: { friendTrust: 5, selfRespect: 2 },
    triggerKeywords: /tabin/i,
  },
  {
    id: "asha_listened",
    type: "asha_secret",
    text: "Selim felt seen by Asha because she listened when Pinky ignored him. He knows it's complicated.",
    related: "Asha",
    trustRequired: 75,
    effect: { friendTrust: 4, mood: -1 },
    triggerKeywords: /asha|আশা|married|complicated/i,
  },
  {
    id: "career_shame",
    type: "career_secret",
    text: "Selim deleted his job application drafts three times. He's scared of his own rejection emails.",
    related: "Career",
    trustRequired: 55,
    effect: { friendTrust: 3, selfRespect: 1 },
    triggerKeywords: /career|job|chakri|চাকরি|future/i,
  },
  {
    id: "promise_kept",
    type: "promise_secret",
    text: "Selim still keeps the first 'amake bhulish na' note from Pinky in his wallet.",
    related: "Pinky",
    trustRequired: 65,
    effect: { friendTrust: 4, pinkyHope: 2, mood: 1 },
    triggerKeywords: /promise|wallet|note|vulis na|ভুলিস না/i,
  },
  {
    id: "shame_2am",
    type: "shame_secret",
    text: "Selim cried at 2 AM after recharging Pinky's phone with rent money. He hasn't told anyone.",
    related: "Pinky",
    trustRequired: 70,
    effect: { friendTrust: 5, selfRespect: -1, mood: -2 },
    triggerKeywords: /recharge|rent|cry|kanna|কান্না|2am|shame/i,
  },
];

const REVEALED_KEY = "selim_revealed_secrets_v1";

export function loadRevealedSecrets(): Set<string> {
  try {
    const raw = localStorage.getItem(REVEALED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}

export function saveRevealedSecrets(set: Set<string>): void {
  try { localStorage.setItem(REVEALED_KEY, JSON.stringify(Array.from(set))); } catch {}
}

export function clearRevealedSecrets(): void {
  try { localStorage.removeItem(REVEALED_KEY); } catch {}
}

/**
 * Pick the next eligible secret triggered by the player's message,
 * gated by FriendTrust and not previously revealed.
 */
export function pickSecretToReveal(
  playerMessage: string,
  stats: Stats,
  flags: Flags,
  revealed: Set<string>,
): Secret | null {
  const trust = stats.friendTrust;
  const candidates = SECRETS.filter((s) => {
    if (revealed.has(s.id)) return false;
    if (trust < s.trustRequired) return false;
    if (s.requireStat && !s.requireStat(stats, flags)) return false;
    if (s.triggerKeywords && !s.triggerKeywords.test(playerMessage)) return false;
    return true;
  });
  if (candidates.length === 0) return null;
  // Prefer the highest trust-requirement secret the player has earned
  candidates.sort((a, b) => b.trustRequired - a.trustRequired);
  return candidates[0];
}

export function isSecretQuestion(text: string): boolean {
  return /\b(secret|lukacchish|lukachhish|truth bol|kichu lukachhis|hidden|confess|kichu lukacchis|sotti bol|আসল|গোপন)\b/i.test(text);
}
