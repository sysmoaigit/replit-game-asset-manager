import { SelimBrainResponse, SelimMood } from "./types";

export function parseRawResponse(raw: unknown): SelimBrainResponse | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  if (obj.useFallback === true) {
    return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true };
  }

  const reply = typeof obj.reply === "string" ? obj.reply.trim() : "";
  if (!reply) return null;

  const VALID_MOODS: SelimMood[] = [
    "happy", "sad", "defensive", "romantic", "hopeful", "ashamed", "grateful", "silent", "angry", "confused",
  ];
  const mood: SelimMood = VALID_MOODS.includes(obj.moodAfter as SelimMood)
    ? (obj.moodAfter as SelimMood)
    : "confused";

  const statEffects: SelimBrainResponse["statEffects"] = {};
  if (typeof obj.statEffects === "object" && obj.statEffects !== null) {
    const se = obj.statEffects as Record<string, unknown>;
    const keys = ["friendTrust", "selfRespect", "emotionalDelusion", "mood", "pinkyHope", "careerProgress", "iq"] as const;
    for (const k of keys) {
      if (typeof se[k] === "number") {
        statEffects[k] = Math.max(-20, Math.min(20, se[k] as number));
      }
    }
  }

  return {
    reply,
    moodAfter: mood,
    statEffects,
    suggestedVoiceTrigger: typeof obj.suggestedVoiceTrigger === "string" ? obj.suggestedVoiceTrigger : undefined,
    followUpPrompt: typeof obj.followUpPrompt === "string" ? obj.followUpPrompt : null,
    isAskingPlayer: typeof obj.isAskingPlayer === "boolean" ? obj.isAskingPlayer : false,
  };
}
