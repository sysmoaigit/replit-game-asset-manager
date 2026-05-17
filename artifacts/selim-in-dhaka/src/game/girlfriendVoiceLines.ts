// Per-character voice/dialogue bank. Audio paths follow the spec convention
// (`/audio/voice/girls/<id>/...mp3`). If a clip is missing on disk, the
// VoicePreview component shows the subtitle and a "not uploaded yet" notice
// instead of crashing — see `GirlfriendVoicePreview.tsx`.

export type VoiceMood =
  | "cute" | "playful" | "teasing" | "serious" | "sad"
  | "boundary" | "mysterious" | "career" | "kind" | "danger" | "truth";

export type VoiceTrigger =
  | "profile_open" | "story_card" | "selim_overthinks" | "player_asks"
  | "help_request" | "boundary" | "secret_reveal" | "ending";

export interface GirlfriendVoiceLine {
  id: string;
  characterId: string;
  mood: VoiceMood;
  text: string;
  romanized?: string;
  audioPath?: string;
  trigger: VoiceTrigger;
}

const audio = (id: string, slug: string) => `/audio/voice/girls/${id}/${id}_${slug}.mp3`;

export const VOICE_LINES: GirlfriendVoiceLine[] = [
  // ── Pinky ──────────────────────────────────────────────────────────────
  { id: "pinky_intro", characterId: "pinky", mood: "cute", text: "Selim, tumi onek bhalo.", romanized: "Selim, tumi onek bhalo.", audioPath: audio("pinky", "intro_01"), trigger: "profile_open" },
  { id: "pinky_cute", characterId: "pinky", mood: "playful", text: "Don't overthink, hmm?", audioPath: audio("pinky", "cute_01"), trigger: "selim_overthinks" },
  { id: "pinky_tease", characterId: "pinky", mood: "teasing", text: "Maybe one day.", audioPath: audio("pinky", "tease_01"), trigger: "selim_overthinks" },
  { id: "pinky_serious", characterId: "pinky", mood: "serious", text: "Tomar sathe kotha bolle bhalo lage, but please pressure dio na.", audioPath: audio("pinky", "serious_01"), trigger: "boundary" },
  { id: "pinky_help", characterId: "pinky", mood: "playful", text: "Can you help? Just this once?", audioPath: audio("pinky", "help_01"), trigger: "help_request" },
  { id: "pinky_secret", characterId: "pinky", mood: "sad", text: "Ami kokhon bolsi wait korte?", audioPath: audio("pinky", "secret_01"), trigger: "secret_reveal" },

  // ── Sadia ──────────────────────────────────────────────────────────────
  { id: "sadia_intro", characterId: "sadia", mood: "cute", text: "Cha khaben?", audioPath: audio("sadia", "intro_01"), trigger: "profile_open" },
  { id: "sadia_tease", characterId: "sadia", mood: "teasing", text: "Apni eto serious keno?", audioPath: audio("sadia", "tease_01"), trigger: "selim_overthinks" },
  { id: "sadia_truth", characterId: "sadia", mood: "playful", text: "Arre, smile korlei prem hoy na.", audioPath: audio("sadia", "truth_01"), trigger: "player_asks" },
  { id: "sadia_serious", characterId: "sadia", mood: "boundary", text: "Ek cup cha diye life decision niben na.", audioPath: audio("sadia", "serious_01"), trigger: "boundary" },

  // ── Tania ──────────────────────────────────────────────────────────────
  { id: "tania_intro", characterId: "tania", mood: "boundary", text: "Selim, please normal thakun.", audioPath: audio("tania", "intro_01"), trigger: "profile_open" },
  { id: "tania_clear", characterId: "tania", mood: "truth", text: "Friend mane friend.", audioPath: audio("tania", "clear_01"), trigger: "boundary" },
  { id: "tania_respect", characterId: "tania", mood: "serious", text: "Respect korle apnar value barbe.", audioPath: audio("tania", "respect_01"), trigger: "ending" },
  { id: "tania_warn", characterId: "tania", mood: "boundary", text: "Over-message korben na.", audioPath: audio("tania", "warn_01"), trigger: "boundary" },

  // ── Sumaiya ────────────────────────────────────────────────────────────
  { id: "sumaiya_intro", characterId: "sumaiya", mood: "mysterious", text: "Brishti amar bhalo lage.", audioPath: audio("sumaiya", "intro_01"), trigger: "profile_open" },
  { id: "sumaiya_soft", characterId: "sumaiya", mood: "cute", text: "Apni onek bhaben, tai na?", audioPath: audio("sumaiya", "soft_01"), trigger: "selim_overthinks" },
  { id: "sumaiya_truth", characterId: "sumaiya", mood: "serious", text: "Shob kichur meaning thake na.", audioPath: audio("sumaiya", "truth_01"), trigger: "player_asks" },
  { id: "sumaiya_warn", characterId: "sumaiya", mood: "boundary", text: "Destiny bolte taratari korben na.", audioPath: audio("sumaiya", "warn_01"), trigger: "boundary" },

  // ── Nila ───────────────────────────────────────────────────────────────
  { id: "nila_intro", characterId: "nila", mood: "truth", text: "Self-respect ego na.", audioPath: audio("nila", "intro_01"), trigger: "profile_open" },
  { id: "nila_advice", characterId: "nila", mood: "kind", text: "Stable life chara stable relationship hoy na.", audioPath: audio("nila", "advice_01"), trigger: "story_card" },
  { id: "nila_truth", characterId: "nila", mood: "truth", text: "Keu tomake choose na korle, nijeke choose koro.", audioPath: audio("nila", "truth_01"), trigger: "secret_reveal" },
  { id: "nila_pause", characterId: "nila", mood: "serious", text: "Jodi beg korte hoy, pause nao.", audioPath: audio("nila", "pause_01"), trigger: "boundary" },

  // ── Farzana ────────────────────────────────────────────────────────────
  { id: "farzana_intro", characterId: "farzana", mood: "career", text: "Apnar potential ache.", audioPath: audio("farzana", "intro_01"), trigger: "profile_open" },
  { id: "farzana_focus", characterId: "farzana", mood: "career", text: "Career build koren, relationship later.", audioPath: audio("farzana", "focus_01"), trigger: "story_card" },
  { id: "farzana_call", characterId: "farzana", mood: "playful", text: "Book kine photo dile hobe na, porte hobe.", audioPath: audio("farzana", "call_01"), trigger: "player_asks" },
  { id: "farzana_truth", characterId: "farzana", mood: "truth", text: "Consistency attractive.", audioPath: audio("farzana", "truth_01"), trigger: "ending" },

  // ── Jannat ─────────────────────────────────────────────────────────────
  { id: "jannat_intro", characterId: "jannat", mood: "kind", text: "Dhonnobad, ami taka ta ferot dilam.", audioPath: audio("jannat", "intro_01"), trigger: "profile_open" },
  { id: "jannat_warm", characterId: "jannat", mood: "cute", text: "Selim bhai, apni eto tension nen keno?", audioPath: audio("jannat", "warm_01"), trigger: "selim_overthinks" },
  { id: "jannat_truth", characterId: "jannat", mood: "truth", text: "Shob kindness love na, but respect important.", audioPath: audio("jannat", "truth_01"), trigger: "player_asks" },
  { id: "jannat_care", characterId: "jannat", mood: "kind", text: "Bhalo manush thakte gele nijer care-o korte hoy.", audioPath: audio("jannat", "care_01"), trigger: "story_card" },

  // ── Mitu ───────────────────────────────────────────────────────────────
  { id: "mitu_intro", characterId: "mitu", mood: "playful", text: "Selim, ekta small help lagbe.", audioPath: audio("mitu", "intro_01"), trigger: "profile_open" },
  { id: "mitu_charm", characterId: "mitu", mood: "cute", text: "Apni onek helpful.", audioPath: audio("mitu", "charm_01"), trigger: "help_request" },
  { id: "mitu_press", characterId: "mitu", mood: "danger", text: "Just ei last time, please na?", audioPath: audio("mitu", "press_01"), trigger: "help_request" },
  { id: "mitu_warn", characterId: "mitu", mood: "danger", text: "Apni na thakle ami ki kortam?", audioPath: audio("mitu", "warn_01"), trigger: "secret_reveal" },

  // ── Tabin ──────────────────────────────────────────────────────────────
  { id: "tabin_intro", characterId: "tabin", mood: "truth", text: "Selim, tor feelings niye moja korbo na.", audioPath: audio("tabin", "intro_01"), trigger: "profile_open" },
  { id: "tabin_calm", characterId: "tabin", mood: "kind", text: "Tui confused holeo ami shunbo.", audioPath: audio("tabin", "calm_01"), trigger: "selim_overthinks" },
  { id: "tabin_truth", characterId: "tabin", mood: "truth", text: "Love mane pressure na, clarity.", audioPath: audio("tabin", "truth_01"), trigger: "story_card" },
  { id: "tabin_serious", characterId: "tabin", mood: "serious", text: "Ami backup hote chai na, ami truth chai.", audioPath: audio("tabin", "serious_01"), trigger: "ending" },

  // ── Asha ───────────────────────────────────────────────────────────────
  { id: "asha_intro", characterId: "asha", mood: "sad", text: "Selim, tomar sathe kotha bolle halka lage.", audioPath: audio("asha", "intro_01"), trigger: "profile_open" },
  { id: "asha_truth", characterId: "asha", mood: "boundary", text: "Eta thik hocche na.", audioPath: audio("asha", "truth_01"), trigger: "boundary" },
  { id: "asha_warn", characterId: "asha", mood: "serious", text: "Tumi nijer life noshto koro na.", audioPath: audio("asha", "warn_01"), trigger: "secret_reveal" },
  { id: "asha_close", characterId: "asha", mood: "kind", text: "Respect korar jonno dhonnobad.", audioPath: audio("asha", "close_01"), trigger: "ending" },
];

export function getLinesFor(characterId: string): GirlfriendVoiceLine[] {
  return VOICE_LINES.filter((l) => l.characterId === characterId);
}
