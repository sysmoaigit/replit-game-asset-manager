import { GameState } from "../types";
import { SelimMood } from "../ai/types";

export type ActiveArc =
  | "pinky"
  | "random_crush"
  | "career"
  | "heartbreak"
  | "recovery"
  | "friendship"
  | "money"
  | "promise"
  | "dhaka_survival"
  | "general";

export function deriveActiveArc(state: GameState): ActiveArc {
  const { stats, flags } = state;

  if (flags.recoveryTriggered && !flags.recoverySuccess) return "recovery";
  if (stats.careerProgress > 60 && stats.selfRespect > 55) return "career";
  if (flags.promiseModeTurnsLeft > 0) return "promise";
  if (stats.pinkyHope > 70 && stats.emotionalDelusion > 60) return "pinky";
  if (flags.randomCrushes > 0 && stats.romanticFever > 65) return "random_crush";
  if (flags.heartbreakCount > 1 && stats.mood < 40) return "heartbreak";
  if (stats.friendTrust > 70) return "friendship";
  if (stats.money < 100) return "money";
  if (state.day <= 3) return "dhaka_survival";
  return "general";
}

export function getQuickRepliesForArc(arc: ActiveArc): string[] {
  const MAP: Record<ActiveArc, string[]> = {
    pinky: ["Pinky-র ব্যাপারে কথা বলো", "Recharge দিবে না", "ও তোকে deserve করে না"],
    random_crush: ["নতুন crush?", "Pinky-কে ভুলে যাও", "Focus on yourself"],
    career: ["Career update দাও", "Freelancing কেমন চলছে?", "চালিয়ে যাও!"],
    heartbreak: ["তুই ঠিক আছিস?", "এটা pass হবে", "কষ্ট লাগছে জানি"],
    recovery: ["তুমি পারবে", "একদিন একটু ভালো হও", "Proud of you"],
    friendship: ["আমরা best friends!", "তোর কথা মনে পড়ে", "কি করছিস?"],
    money: ["Budget করো", "টাকা save করো", "কোনো income আছে?"],
    promise: ["Promise রেখো", "Touba মনে আছে?", "তুই পারবে"],
    dhaka_survival: ["ঢাকা কেমন লাগছে?", "মেসের খাবার খাও", "নতুন শহরে কেমন?"],
    general: ["কেমন আছিস?", "আজকে কি হলো?", "কিছু বলো"],
  };
  return MAP[arc] ?? MAP.general;
}

// ─── Smart Quick Replies (mood + arc + state aware) ───────────────────────
// Spec §"Smart Quick Replies" calls for contextual prompts that change with
// Selim's mood AND the active arc. Returns 4-6 deduped Bangla/Banglish chips
// drawn from the spec's canonical lines plus arc/mood-tuned extras. Order is
// deterministic so the same situation always produces the same chip order.

const MOOD_REPLIES: Partial<Record<SelimMood, string[]>> = {
  // Defensive — Selim is hiding something or pushing back
  defensive: ["সত্যি বল", "মিথ্যা বলিস না", "তুই কিছু লুকাচ্ছিস?"],
  // Romantic — Pinky/crush brain overheating
  romantic: ["Recharge দিবি না", "Career আগে", "Stop chasing"],
  // Ashamed — got caught, low after a relapse
  ashamed: ["আমি আছি", "Save this promise", "নিজেকে blame করিস না"],
  // Sad / heartbroken
  sad: ["আমি আছি, কাঁদিস না", "তুই strong", "এক step এক step"],
  // Silent / oviman
  silent: ["কথা বল ভাই", "চুপ থাকিস না", "আমি শুনছি"],
  // Angry
  angry: ["শান্ত হ", "কী হইছে বল", "আমি কোথাও যাচ্ছি না"],
  // Confused
  confused: ["আস্তে বল", "ঠিক করে বল", "কী হলো?"],
  // Happy / hopeful — push toward keeping it stable
  happy: ["এই vibe টা ধরে রাখ", "আজকের কথা মনে রাখিস", "Promise নে"],
  hopeful: ["এই momentum ধরে রাখ", "Promise নে", "Career আগে"],
  // Grateful — deepen trust
  grateful: ["তুই-ই আমার ভাই", "Truth বল এখন", "Secret share করবি?"],
};

export function getSmartQuickReplies(
  arc: ActiveArc,
  mood: SelimMood,
  state: GameState,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (s: string) => {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  // Layer 1: state-driven priority replies — these always come first when
  // the situation is critical, because they're the player's actual lever.
  if ((state.flags.promiseModeTurnsLeft ?? 0) > 0) push("Promise রাখ");
  if ((state.flags.pinkyRechargeCount ?? 0) >= 1 && state.stats.money < 200) {
    push("Recharge বন্ধ কর");
  }
  if (state.stats.romanticFever > 70) push("Stop chasing");
  if ((state.flags.liesCaught ?? 0) >= 1) push("সত্যি বল");
  if (state.stats.selfRespect < 35) push("নিজেকে respect কর");

  // Layer 2: mood-tuned replies from the spec's smart-quick-reply list
  for (const r of MOOD_REPLIES[mood] ?? []) push(r);

  // Layer 3: arc fallback so we always have ≥3 chips
  for (const r of getQuickRepliesForArc(arc)) push(r);

  // Cap at 6 chips to fit horizontal scroll on mobile without being noisy
  return out.slice(0, 6);
}
