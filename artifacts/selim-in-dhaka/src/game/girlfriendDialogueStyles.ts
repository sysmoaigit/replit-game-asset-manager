// Per-character dialogue/voice style descriptors used by the Voice tab and
// LLM context builders. Pure data; no rendering.

export interface DialogueStyle {
  id: string;
  voiceStyle: string;
  flirtingStyle: string;
  signaturePhrase: string;
  bubbleTint: string; // tailwind-friendly rgba for GirlfriendDialogueBubble
  romanizedNote?: string;
}

export const DIALOGUE_STYLES: DialogueStyle[] = [
  { id: "pinky",   voiceStyle: "Soft, sweet, slightly teasing modern Dhaka tone.", flirtingStyle: "Ambiguous, indirect, 'maybe one day'.", signaturePhrase: "Maybe one day.",                bubbleTint: "rgba(236,72,153,0.18)" },
  { id: "sadia",   voiceStyle: "Cheerful, cute, casual Bangla teasing.",          flirtingStyle: "Friendly teasing Selim overreads.",      signaturePhrase: "Cha khaben?",                  bubbleTint: "rgba(244,114,182,0.16)" },
  { id: "tania",   voiceStyle: "Clear, confident, sharp but respectful.",         flirtingStyle: "Minimal — no games.",                    signaturePhrase: "Friend mane friend.",          bubbleTint: "rgba(59,130,246,0.16)" },
  { id: "sumaiya", voiceStyle: "Soft, slow, poetic, rainy-night vibe.",           flirtingStyle: "Subtle, emotional, unclear.",            signaturePhrase: "Brishti amar bhalo lage.",     bubbleTint: "rgba(168,85,247,0.16)" },
  { id: "nila",    voiceStyle: "Calm, mature, caring truth-teller.",              flirtingStyle: "Not flirty — direct and healthy.",       signaturePhrase: "Self-respect ego na.",         bubbleTint: "rgba(34,197,94,0.16)" },
  { id: "farzana", voiceStyle: "Confident, inspiring, calm.",                     flirtingStyle: "Encouraging — Selim misreads.",          signaturePhrase: "Career build koren.",          bubbleTint: "rgba(14,165,233,0.16)" },
  { id: "jannat",  voiceStyle: "Warm, sincere, gentle.",                          flirtingStyle: "Sweet but clear.",                       signaturePhrase: "Dhonnobad, ami ferot dilam.",  bubbleTint: "rgba(132,204,22,0.16)" },
  { id: "mitu",    voiceStyle: "Modern, playful, slightly spoiled, charming.",    flirtingStyle: "Cute requests, soft pressure.",          signaturePhrase: "Just ei last time.",           bubbleTint: "rgba(234,88,12,0.16)" },
  { id: "tabin",   voiceStyle: "Soft, grounded, sincere.",                        flirtingStyle: "Calm emotional intimacy, not flashy.",   signaturePhrase: "Love mane pressure na.",       bubbleTint: "rgba(20,184,166,0.16)" },
  { id: "asha",    voiceStyle: "Soft, mature, sad, careful.",                     flirtingStyle: "Emotional closeness, non-explicit.",     signaturePhrase: "Eta thik hocche na.",          bubbleTint: "rgba(220,38,38,0.16)" },
];

export function getDialogueStyle(id: string): DialogueStyle | undefined {
  return DIALOGUE_STYLES.find((s) => s.id === id);
}
