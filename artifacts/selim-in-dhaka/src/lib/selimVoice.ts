// Bangla Web Speech API wrapper.
//
// PROBLEM THIS FIXES (player feedback: "Bangla voice speaks the writtens
// but it is not clear"):
//   - Most browsers don't ship a Bangla voice. The previous version still
//     called speak() with `lang="bn-BD"` and the system default voice, so
//     a non-Bangla voice tried to phonetically read Bangla characters →
//     garbled, unintelligible noise.
//   - Emoji/punctuation prefixes ("🌸 Cute…") were spoken aloud.
//   - No way for the player to pick a voice, slow it down, or test it.
//
// FIXES:
//   - Reactive voice list (re-cached on `voiceschanged`).
//   - Strict-Bangla default: if no Bangla voice is available we SKIP the
//     speech instead of producing garbled output. The subtitle still shows.
//   - Per-speaker preference (Selim vs. girl) using common female-name hints.
//   - Player-controllable preferred voice + rate, persisted to localStorage.
//   - Text sanitization: strips emoji, "...", excessive punctuation.
//   - Long text is chunked on Bangla sentence enders for clearer prosody.
//   - Honors audioEngine settings (master + voice toggles, voice volume).

import { audioEngine } from "../game/audioEngine";

const PREFS_KEY = "selim_voice_prefs_v1";

interface VoicePrefs {
  /** Player-picked voice name. Empty string = auto-pick. */
  preferredVoiceName: string;
  /** Speech rate. Default 0.85 — slower = clearer for synthesised Bangla. */
  rate: number;
  /** Pitch. Default 1.0 (natural). */
  pitch: number;
  /**
   * When true, refuse to speak if no actual Bangla voice is installed,
   * rather than garbling Bangla through an English voice. Default true.
   */
  strictBangla: boolean;
}

const DEFAULT_PREFS: VoicePrefs = {
  preferredVoiceName: "",
  rate: 0.85,
  pitch: 1.0,
  strictBangla: true,
};

function loadPrefs(): VoicePrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<VoicePrefs>) };
  } catch { return { ...DEFAULT_PREFS }; }
}
function savePrefs(p: VoicePrefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

let prefs: VoicePrefs = loadPrefs();
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListenerAttached = false;

function refreshVoiceList() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const list = window.speechSynthesis.getVoices();
  if (list && list.length > 0) cachedVoices = list;
}

function ensureVoicesReactive() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  refreshVoiceList();
  if (!voicesListenerAttached && typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoiceList);
    voicesListenerAttached = true;
  }
}

function isBanglaVoice(v: SpeechSynthesisVoice): boolean {
  const lang = (v.lang || "").toLowerCase();
  return lang.startsWith("bn") || /bengali|bangla/i.test(v.name);
}

// Common female-name hints across the major TTS providers. Used as a soft
// signal when picking a voice for a girl character.
const FEMALE_HINTS = [
  "female", "woman", "girl",
  "samantha", "victoria", "moira", "tessa", "karen", "fiona",
  "anna", "ava", "allison", "google.*female",
  "zira", "hazel", "susan", "kalpana", "monica", "luciana",
  "amelie", "thomas", "veena",
];
const MALE_HINTS = [
  "male", "man", "boy",
  "alex", "daniel", "fred", "tom", "diego", "thomas",
  "google.*male", "ravi", "rishi", "hemant", "mark",
];

function pickVoiceFor(speaker: "selim" | "girl" | "auto"): SpeechSynthesisVoice | null {
  ensureVoicesReactive();
  if (cachedVoices.length === 0) return null;

  // 1. Honor the player's explicit preference first.
  if (prefs.preferredVoiceName) {
    const exact = cachedVoices.find((v) => v.name === prefs.preferredVoiceName);
    if (exact) return exact;
  }

  const banglas = cachedVoices.filter(isBanglaVoice);
  if (banglas.length === 0) return null;

  // 2. Prefer bn-BD over bn-IN over any bn-*.
  const sortedByLocale = [...banglas].sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) =>
      v.lang.toLowerCase() === "bn-bd" ? 0 :
      v.lang.toLowerCase() === "bn-in" ? 1 :
      v.lang.toLowerCase().startsWith("bn") ? 2 : 3;
    return score(a) - score(b);
  });

  // 3. Then prefer matching gender hints.
  if (speaker === "girl") {
    const female = sortedByLocale.find((v) => FEMALE_HINTS.some((h) => new RegExp(h, "i").test(v.name)));
    if (female) return female;
  } else if (speaker === "selim") {
    const male = sortedByLocale.find((v) => MALE_HINTS.some((h) => new RegExp(h, "i").test(v.name)));
    if (male) return male;
  }

  return sortedByLocale[0] ?? null;
}

/** Strip characters that pollute synthesised speech. */
function sanitize(text: string): string {
  return text
    // emoji + pictographic
    .replace(
      // eslint-disable-next-line no-misleading-character-class
      /[\u2600-\u27BF\uE000-\uF8FF\u{1F000}-\u{1FFFF}\u{1F1E6}-\u{1F1FF}\uFE0F]/gu,
      "",
    )
    // common chat artifacts
    .replace(/\.{2,}/g, ".")
    .replace(/[…—–]/g, ",")
    .replace(/["“”'']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a long line into shorter utterances on Bangla / Latin sentence
 * enders. Web Speech is noticeably clearer when given short utterances
 * one at a time rather than one giant string.
 */
function chunk(text: string): string[] {
  return text
    .split(/(?<=[।!?\.])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export interface SpeakOpts {
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Hint for voice selection. Defaults to "selim". */
  speaker?: "selim" | "girl" | "auto";
  /**
   * When true, ignore strictBangla and try to speak through any voice.
   * Used by the in-settings "Test voice" button.
   */
  forceAnyVoice?: boolean;
}

export function speakSelim(text: string, opts?: SpeakOpts) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!text) return;
  const cleaned = sanitize(text);
  if (!cleaned || cleaned === ".") return;

  // Honor global audio toggles.
  try {
    const s = audioEngine.getSettings();
    if (!s.masterEnabled || !s.voiceEnabled) return;
  } catch { /* audioEngine may not be ready in test envs */ }

  ensureVoicesReactive();
  const voice = pickVoiceFor(opts?.speaker ?? "selim");

  // Strict-Bangla guard: avoids the "English voice phonetically reading
  // Bangla characters" failure mode that produced the player's complaint.
  if (!voice && prefs.strictBangla && !opts?.forceAnyVoice) return;

  const synth = window.speechSynthesis;
  try { synth.cancel(); } catch { /* ignore */ }

  const baseVolume = (() => {
    try {
      const s = audioEngine.getSettings();
      return Math.max(0, Math.min(1, (s.masterVolume ?? 1) * (s.voiceVolume ?? 1)));
    } catch { return 0.9; }
  })();

  const parts = chunk(cleaned);
  for (const part of parts) {
    const utter = new SpeechSynthesisUtterance(part);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = "bn-BD";
    }
    utter.rate = opts?.rate ?? prefs.rate;
    utter.pitch = opts?.pitch ?? prefs.pitch;
    utter.volume = opts?.volume ?? baseVolume;
    try { synth.speak(utter); } catch { /* ignore */ }
  }
}

export function stopSelim() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
}

// ── Public settings API used by SoundSettings UI ─────────────────────────────

export function getAllVoices(): SpeechSynthesisVoice[] {
  ensureVoicesReactive();
  return cachedVoices.slice();
}

export function getBanglaVoices(): SpeechSynthesisVoice[] {
  ensureVoicesReactive();
  return cachedVoices.filter(isBanglaVoice);
}

export function hasBanglaVoice(): boolean {
  return getBanglaVoices().length > 0;
}

export function getVoicePrefs(): VoicePrefs { return { ...prefs }; }

export function updateVoicePrefs(partial: Partial<VoicePrefs>) {
  prefs = { ...prefs, ...partial };
  savePrefs(prefs);
}

/** Speak a short Bangla sample with the given voice — used by the picker. */
export function testVoice(voiceName: string, sample = "ভাই, এইটা টেস্ট। শুনতে পাচ্ছ?") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  ensureVoicesReactive();
  const v = cachedVoices.find((x) => x.name === voiceName);
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  const utter = new SpeechSynthesisUtterance(sample);
  if (v) { utter.voice = v; utter.lang = v.lang; } else { utter.lang = "bn-BD"; }
  utter.rate = prefs.rate;
  utter.pitch = prefs.pitch;
  utter.volume = 1;
  try { window.speechSynthesis.speak(utter); } catch { /* ignore */ }
}
