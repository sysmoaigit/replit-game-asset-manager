import { VoiceLine, VOICE_LINES } from "./voiceLines";

export type AccentMode = "light" | "medium" | "standard";

const LIGHT_BOGURA_REPLACEMENTS: Array<[RegExp, string]> = [
  [/করি/g, "করি"],
  [/বললো/g, "কইলো"],
  [/বলছে/g, "কইতাছে"],
  [/যাচ্ছি/g, "যাইতাছি"],
  [/আসছে/g, "আইতাছে"],
  [/হচ্ছে/g, "হইতাছে"],
  [/করছি/g, "করতাছি"],
  [/দেখছি/g, "দেখতাছি"],
  [/নিচ্ছে/g, "নিতাছে"],
];

const MEDIUM_BOGURA_REPLACEMENTS: Array<[RegExp, string]> = [
  ...LIGHT_BOGURA_REPLACEMENTS,
  [/আমি/g, "আমি"],
  [/তুমি/g, "তুমি"],
  [/কী/g, "কী"],
  [/না/g, "না"],
];

export function applyAccent(text: string, mode: AccentMode): string {
  if (mode === "standard") return text;
  const replacements = mode === "light"
    ? LIGHT_BOGURA_REPLACEMENTS
    : MEDIUM_BOGURA_REPLACEMENTS;
  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function getSelimLine(lineId: string, accentMode: AccentMode = "light"): VoiceLine | null {
  const line = VOICE_LINES.find((l) => l.id === lineId);
  if (!line) return null;
  if (line.speaker !== "selim") return line;
  return {
    ...line,
    text: line.boguraFlavor ? applyAccent(line.text, accentMode) : line.text,
  };
}

export function getRandomSelimLine(
  category: VoiceLine["category"],
  accentMode: AccentMode = "light"
): VoiceLine | null {
  const candidates = VOICE_LINES.filter(
    (l) => l.speaker === "selim" && l.category === category
  );
  if (candidates.length === 0) return null;
  const line = candidates[Math.floor(Math.random() * candidates.length)];
  return getSelimLine(line.id, accentMode);
}

export const DEFAULT_ACCENT: AccentMode = "light";
export const ACCENT_LABELS: Record<AccentMode, string> = {
  light:    "Light Bogura (আলতো বগুরা টান)",
  medium:   "Medium Bogura (মাঝারি বগুরা টান)",
  standard: "Standard Bangla (সাধারণ বাংলা)",
};
