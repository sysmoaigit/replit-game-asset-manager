export type VoiceMood =
  | "happy" | "sad" | "excited" | "nervous" | "defensive" | "confused"
  | "romantic" | "regret" | "determined" | "playful" | "angry" | "hopeful"
  | "tired" | "proud" | "embarrassed" | "philosophical";

export type VoiceCategory =
  | "greeting" | "morning" | "pinky_recharge" | "pinky_message" | "pinky_refuse"
  | "heartbreak" | "override" | "obey" | "half_obey" | "promise_made"
  | "promise_broken" | "best_friend" | "recovery" | "career" | "food"
  | "money" | "advice" | "silent" | "angry" | "apology" | "day_end"
  | "new_crush" | "bogura_memory" | "achievement" | "trust_up" | "trust_down"
  | "ending_good" | "ending_bad";

/**
 * Optional contextual conditions for a voice line.
 * Used by the audio engine to pick lines that match the current game state
 * (e.g. tired-sounding lines when energy is low). A line with no conditions
 * is always eligible. A line whose conditions partially match scores
 * proportionally so it can still be chosen when a perfect match isn't found.
 */
export type VoiceConditions = {
  /** Each listed stat must be >= the given value. */
  minStats?: Partial<Record<VoiceStatKey, number>>;
  /** Each listed stat must be <= the given value. */
  maxStats?: Partial<Record<VoiceStatKey, number>>;
  /** Line is preferred at one of these locations (soft match — adds score). */
  locations?: string[];
  /** Line is preferred for one of these card IDs (soft match — adds score). */
  cardIds?: string[];
  /** Bogura flavor preference: true → only when accent is on; false → only when off. */
  requiresBoguraAccent?: boolean;
};

/** Stat keys that voice line conditions are allowed to reference. */
export type VoiceStatKey =
  | "health" | "mood" | "money" | "iq" | "energy" | "reputation"
  | "addiction" | "temptation" | "selfRespect"
  | "pinkyHope" | "pinkyHappiness" | "careerProgress"
  | "friendTrust" | "emotionalDelusion" | "attachmentLevel"
  | "loneliness" | "romanticFever";

/** Lightweight context the engine passes when choosing a contextual line. */
export type VoiceContext = {
  stats?: Partial<Record<VoiceStatKey, number>>;
  location?: string;
  cardId?: string;
  boguraAccent?: boolean;
};

export type VoiceLine = {
  id: string;
  speaker: "selim" | "pinky" | "rafiq" | "nila" | "cha-mama" | "kuddus-bhai";
  category: VoiceCategory;
  mood: VoiceMood;
  text: string;
  boguraFlavor?: boolean;
  cooldownMs?: number;
  /** Optional conditions used by the smart line picker. */
  conditions?: VoiceConditions;
};

export const VOICE_LINES: VoiceLine[] = [
  // ─── SELIM — GREETING / MORNING (A) ────────────────────────────────────────
  { id: "s_greet_morning_01", speaker: "selim", category: "greeting", mood: "happy", text: "ভাই, সকাল হইছে! ঢাকায় নতুন দিন মানে নতুন সমস্যা।", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_greet_morning_02", speaker: "selim", category: "morning", mood: "tired", text: "রাতে ঘুম হয়নি। Pinky-র last seen দেখতে দেখতে ভোর হয়ে গেছে।", boguraFlavor: true, cooldownMs: 30000, conditions: { maxStats: { energy: 35 } } },
  { id: "s_greet_morning_03", speaker: "selim", category: "morning", mood: "hopeful", text: "আজকে একটু ভালো থাকার চেষ্টা করবো। সত্যিই।", boguraFlavor: false },
  { id: "s_greet_morning_04", speaker: "selim", category: "morning", mood: "philosophical", text: "Bogura-তে ভোর মানে পাখির ডাক। এখানে মানে horn।", boguraFlavor: true },
  { id: "s_greet_morning_05", speaker: "selim", category: "morning", mood: "determined", text: "আজকে কোনো excuse নাই। কাজ করবো।", boguraFlavor: false, cooldownMs: 20000 },
  { id: "s_greet_morning_06", speaker: "selim", category: "morning", mood: "nervous", text: "মেসের ভাড়ার deadline কাল। ভাই, tension হচ্ছে।", boguraFlavor: true, conditions: { maxStats: { money: 1500 } } },
  { id: "s_greet_morning_07", speaker: "selim", category: "morning", mood: "playful", text: "চা না খাইলে মাথা চলে না। এটা বিজ্ঞান।", boguraFlavor: true },

  // ─── SELIM — PINKY RECHARGE (B) ─────────────────────────────────────────────
  { id: "s_pinky_recharge_01", speaker: "selim", category: "pinky_recharge", mood: "romantic", text: "Pinky-র জন্য recharge দেওয়া মানে love invest করা।", boguraFlavor: true, cooldownMs: 15000 },
  { id: "s_pinky_recharge_02", speaker: "selim", category: "pinky_recharge", mood: "defensive", text: "ভাই, টাকা আবার আসবে। Pinky-র smile এক বার মিস করলে আসবে না।", boguraFlavor: true },
  { id: "s_pinky_recharge_03", speaker: "selim", category: "pinky_recharge", mood: "confused", text: "এটা last time। Seriously এই বার last।", boguraFlavor: false, cooldownMs: 15000, conditions: { minStats: { pinkyHope: 40 } } },
  { id: "s_pinky_recharge_04", speaker: "selim", category: "pinky_recharge", mood: "hopeful", text: "ও আমার কথা মনে রাখে। শুধু express করে না।", boguraFlavor: true },
  { id: "s_pinky_recharge_05", speaker: "selim", category: "pinky_recharge", mood: "philosophical", text: "Recharge মানে connection maintain। এটা relationship cost।", boguraFlavor: false },
  { id: "s_pinky_recharge_06", speaker: "selim", category: "pinky_recharge", mood: "nervous", text: "ও যদি reply না দেয়… না, দেবে। দিতেই হবে।", boguraFlavor: true },
  { id: "s_pinky_recharge_07", speaker: "selim", category: "pinky_recharge", mood: "excited", text: "Pinky বলসে 'please'। ভাই, 'please' মানে ভালোবাসার invitation!", boguraFlavor: true },
  { id: "s_pinky_recharge_08", speaker: "selim", category: "pinky_recharge", mood: "embarrassed", text: "হ্যাঁ, আবার দিলাম। কী করবো, মন মানে না।", boguraFlavor: false },

  // ─── SELIM — PINKY MESSAGE (C) ──────────────────────────────────────────────
  { id: "s_pinky_msg_01", speaker: "selim", category: "pinky_message", mood: "excited", text: "Pinky message দিসে! ভাই, heart race করতেছে!", boguraFlavor: true, cooldownMs: 20000 },
  { id: "s_pinky_msg_02", speaker: "selim", category: "pinky_message", mood: "confused", text: "'Hmm' মানে কী? ইন্টার্নেট এর কাছে জিজ্ঞেস করবো।", boguraFlavor: true },
  { id: "s_pinky_msg_03", speaker: "selim", category: "pinky_message", mood: "hopeful", text: "Seen করেছে! দেখা মানে care। আমি নিশ্চিত।", boguraFlavor: false },
  { id: "s_pinky_msg_04", speaker: "selim", category: "pinky_message", mood: "nervous", text: "Reply কী দেবো? ২ ঘণ্টা ধরে ভাবছি।", boguraFlavor: true },
  { id: "s_pinky_msg_05", speaker: "selim", category: "pinky_message", mood: "romantic", text: "ও লিখসে 'okay'। 'okay' মানে ও agree! আমার সাথে সব কিছুতে!", boguraFlavor: true },
  { id: "s_pinky_msg_06", speaker: "selim", category: "pinky_message", mood: "sad", text: "Typing... বন্ধ হয়ে গেলো। আবার typing... আবার বন্ধ। ভাই, এটা কি love?", boguraFlavor: true },

  // ─── SELIM — PINKY REFUSE / BOUNDARY (D) ────────────────────────────────────
  { id: "s_pinky_refuse_01", speaker: "selim", category: "pinky_refuse", mood: "determined", text: "না। আজকে না। আমার নিজের জন্যও কিছু রাখতে হবে।", boguraFlavor: false, cooldownMs: 20000 },
  { id: "s_pinky_refuse_02", speaker: "selim", category: "pinky_refuse", mood: "sad", text: "Pinky, এই বার পারবো না। Budget tight।", boguraFlavor: true },
  { id: "s_pinky_refuse_03", speaker: "selim", category: "pinky_refuse", mood: "proud", text: "ভাই, আজকে নিজেকে respect দিলাম। ভালো লাগছে।", boguraFlavor: true, cooldownMs: 30000, conditions: { minStats: { selfRespect: 50 } } },
  { id: "s_pinky_refuse_04", speaker: "selim", category: "pinky_refuse", mood: "nervous", text: "ও রাগ করবে কিনা জানি না, কিন্তু টাকা নাই সত্যিই।", boguraFlavor: false },
  { id: "s_pinky_refuse_05", speaker: "selim", category: "pinky_refuse", mood: "philosophical", text: "Boundary দেওয়া love-র বিরুদ্ধে না। Boundary মানে নিজেকে ভালোবাসা।", boguraFlavor: false },

  // ─── SELIM — HEARTBREAK (E) ─────────────────────────────────────────────────
  { id: "s_heartbreak_01", speaker: "selim", category: "heartbreak", mood: "sad", text: "ভাই, ব্যথা লাগছে। এইটুকু admit করতে পারি।", boguraFlavor: true, cooldownMs: 25000 },
  { id: "s_heartbreak_02", speaker: "selim", category: "heartbreak", mood: "regret", text: "Use হলাম। জানতাম, তবু গেলাম।", boguraFlavor: false },
  { id: "s_heartbreak_03", speaker: "selim", category: "heartbreak", mood: "confused", text: "ও কি সত্যিই এমন? নাকি আমি বুঝিনি?", boguraFlavor: true },
  { id: "s_heartbreak_04", speaker: "selim", category: "heartbreak", mood: "angry", text: "চার মাস। চার মাস সব দিলাম। Reply পাইলাম 'K'।", boguraFlavor: true, conditions: { minStats: { attachmentLevel: 50 } } },
  { id: "s_heartbreak_05", speaker: "selim", category: "heartbreak", mood: "sad", text: "Bogura-তে কাউকে ভালোবাসলে এইরকম হইতো না। ঢাকা কঠিন।", boguraFlavor: true },
  { id: "s_heartbreak_06", speaker: "selim", category: "heartbreak", mood: "philosophical", text: "ভাই, first love মানে এই। শিক্ষাও এই।", boguraFlavor: false },
  { id: "s_heartbreak_07", speaker: "selim", category: "heartbreak", mood: "tired", text: "আর পারছি না। একটু চুপ থাকতে চাই।", boguraFlavor: false, cooldownMs: 30000, conditions: { maxStats: { mood: 25, energy: 35 } } },

  // ─── SELIM — EMOTIONAL OVERRIDE (F) ─────────────────────────────────────────
  { id: "s_override_01", speaker: "selim", category: "override", mood: "defensive", text: "ভাই তুই বুঝবি না। ও অন্য রকম।", boguraFlavor: true, cooldownMs: 10000 },
  { id: "s_override_02", speaker: "selim", category: "override", mood: "excited", text: "Heart বলছে পাঠাও। Heart-এর কথা শুনতে হয়।", boguraFlavor: false, conditions: { minStats: { romanticFever: 50 } } },
  { id: "s_override_03", speaker: "selim", category: "override", mood: "confused", text: "Logic পরে। এখন feel করছি।", boguraFlavor: true },
  { id: "s_override_04", speaker: "selim", category: "override", mood: "defensive", text: "তুই single বলে বুঝবি না।", boguraFlavor: true, cooldownMs: 15000 },
  { id: "s_override_05", speaker: "selim", category: "override", mood: "nervous", text: "আমি জানি এটা ভুল হতে পারে। তবু করতে হবে।", boguraFlavor: false },
  { id: "s_override_06", speaker: "selim", category: "override", mood: "romantic", text: "Pinky-র জন্য এটুকু করা আমার duty।", boguraFlavor: true },

  // ─── SELIM — OBEY / SELF RESPECT (G) ────────────────────────────────────────
  { id: "s_obey_01", speaker: "selim", category: "obey", mood: "proud", text: "ঠিক আছে ভাই। আজকে নিজেকে respect দিলাম।", boguraFlavor: true, cooldownMs: 15000 },
  { id: "s_obey_02", speaker: "selim", category: "obey", mood: "determined", text: "তোর কথা মনে হলো। তুই ঠিক বলছিলি।", boguraFlavor: false },
  { id: "s_obey_03", speaker: "selim", category: "obey", mood: "hopeful", text: "এই সিদ্ধান্ত নিলাম। Feeling good।", boguraFlavor: false },
  { id: "s_obey_04", speaker: "selim", category: "obey", mood: "philosophical", text: "Boundary দেওয়া মানে দুর্বল না। শক্তিশালী।", boguraFlavor: false },
  { id: "s_obey_05", speaker: "selim", category: "obey", mood: "proud", text: "ভাই, আজকে Selim জিতসে।", boguraFlavor: true, cooldownMs: 20000, conditions: { minStats: { selfRespect: 60 } } },
  { id: "s_obey_06", speaker: "selim", category: "obey", mood: "happy", text: "Bhai, thanks। এই reminder লাগতেছিল।", boguraFlavor: false },

  // ─── SELIM — HALF OBEY (H) ──────────────────────────────────────────────────
  { id: "s_half_01", speaker: "selim", category: "half_obey", mood: "confused", text: "মাঝামাঝি একটা রাস্তা বের করি।", boguraFlavor: false, cooldownMs: 10000 },
  { id: "s_half_02", speaker: "selim", category: "half_obey", mood: "nervous", text: "একটু দিলাম, সব না। এটা compromise।", boguraFlavor: true },
  { id: "s_half_03", speaker: "selim", category: "half_obey", mood: "philosophical", text: "ভাই, life মানে আসলে grey area।", boguraFlavor: false },
  { id: "s_half_04", speaker: "selim", category: "half_obey", mood: "embarrassed", text: "হ্যাঁ, পুরোটা মানিনি। কিন্তু একটু মানলাম।", boguraFlavor: false },

  // ─── SELIM — PROMISE MADE (I) ────────────────────────────────────────────────
  { id: "s_promise_made_01", speaker: "selim", category: "promise_made", mood: "determined", text: "Promise করছি। এই বার রাখবোই।", boguraFlavor: false, cooldownMs: 20000 },
  { id: "s_promise_made_02", speaker: "selim", category: "promise_made", mood: "hopeful", text: "ভাই, এই promise আমি রাখবো। দেখিস।", boguraFlavor: true },
  { id: "s_promise_made_03", speaker: "selim", category: "promise_made", mood: "nervous", text: "Pinky-র সামনে বলে ফেললাম। এখন রাখতেই হবে।", boguraFlavor: true },

  // ─── SELIM — PROMISE BROKEN (J) ─────────────────────────────────────────────
  { id: "s_promise_broken_01", speaker: "selim", category: "promise_broken", mood: "regret", text: "আবার হয়ে গেলো। নিজের উপর রাগ হচ্ছে।", boguraFlavor: false, cooldownMs: 20000 },
  { id: "s_promise_broken_02", speaker: "selim", category: "promise_broken", mood: "embarrassed", text: "ভাই, promise ভেঙ্গে ফেললাম। জানি, জানি।", boguraFlavor: true },
  { id: "s_promise_broken_03", speaker: "selim", category: "promise_broken", mood: "sad", text: "কেন যে করি এটা। নিজেও বুঝি না।", boguraFlavor: false },
  { id: "s_promise_broken_04", speaker: "selim", category: "promise_broken", mood: "defensive", text: "পরিস্থিতি ছিলো। উপায় ছিলো না।", boguraFlavor: false },

  // ─── SELIM — BEST FRIEND MOMENT (K) ────────────────────────────────────────
  { id: "s_bestfriend_01", speaker: "selim", category: "best_friend", mood: "happy", text: "ভাই, তুই না থাকলে কী করতাম।", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_bestfriend_02", speaker: "selim", category: "best_friend", mood: "philosophical", text: "Friendship মানে এই। পাশে থাকা।", boguraFlavor: false },
  { id: "s_bestfriend_03", speaker: "selim", category: "best_friend", mood: "happy", text: "Rafiq ভাই best! সত্যিই।", boguraFlavor: true },
  { id: "s_bestfriend_04", speaker: "selim", category: "best_friend", mood: "proud", text: "বন্ধু আছে মানে জীবনে কিছু একটা আছে।", boguraFlavor: false, cooldownMs: 25000 },
  { id: "s_bestfriend_05", speaker: "selim", category: "best_friend", mood: "hopeful", text: "Friend trust বাড়লে মনটাও হালকা লাগে।", boguraFlavor: false },

  // ─── SELIM — RECOVERY (L) ───────────────────────────────────────────────────
  { id: "s_recovery_01", speaker: "selim", category: "recovery", mood: "tired", text: "ভাই, শরীর আর নিচ্ছে না। কিছু একটা করতে হবে।", boguraFlavor: true, cooldownMs: 30000, conditions: { maxStats: { health: 35 } } },
  { id: "s_recovery_02", speaker: "selim", category: "recovery", mood: "determined", text: "Crisis mode। কিন্তু আমি হার মানবো না।", boguraFlavor: false },
  { id: "s_recovery_03", speaker: "selim", category: "recovery", mood: "hopeful", text: "এই crisis থেকে বের হলে আমি আরো strong হবো।", boguraFlavor: false },
  { id: "s_recovery_04", speaker: "selim", category: "recovery", mood: "sad", text: "Bogura-তে যেতাম। কিন্তু এখানেই সামলাতে হবে।", boguraFlavor: true },
  { id: "s_recovery_05", speaker: "selim", category: "recovery", mood: "determined", text: "একটু একটু করে। Step by step।", boguraFlavor: false },

  // ─── SELIM — CAREER / IQ (M) ────────────────────────────────────────────────
  { id: "s_career_01", speaker: "selim", category: "career", mood: "proud", text: "আজকে কাজে ভালো করলাম। গর্ব লাগছে।", boguraFlavor: false, cooldownMs: 20000, conditions: { minStats: { careerProgress: 40 } } },
  { id: "s_career_02", speaker: "selim", category: "career", mood: "determined", text: "Career build করতে হবে। Pinky পরে।", boguraFlavor: true },
  { id: "s_career_03", speaker: "selim", category: "career", mood: "excited", text: "নতুন কিছু শিখলাম। ঢাকায় টিকতে হলে শিখতেই হবে।", boguraFlavor: false },
  { id: "s_career_04", speaker: "selim", category: "career", mood: "philosophical", text: "Bogura boss হওয়ার স্বপ্ন ছিলো। এখন Dhaka-তে survive করাই লক্ষ্য।", boguraFlavor: true },
  { id: "s_career_05", speaker: "selim", category: "career", mood: "hopeful", text: "কাজ করলে টাকা আসে। টাকা আসলে সব আসে।", boguraFlavor: false },
  { id: "s_career_06", speaker: "selim", category: "career", mood: "tired", text: "Freelancing কঠিন। কিন্তু এটাই রাস্তা।", boguraFlavor: false },

  // ─── SELIM — FOOD (N) ───────────────────────────────────────────────────────
  { id: "s_food_01", speaker: "selim", category: "food", mood: "excited", text: "বিরিয়ানির গন্ধ! ভাই, মন দুর্বল হয়ে যাচ্ছে।", boguraFlavor: true, cooldownMs: 15000 },
  { id: "s_food_02", speaker: "selim", category: "food", mood: "happy", text: "এক প্লেট বিরিয়ানি মানে pure joy। পকেট কাঁদুক।", boguraFlavor: true },
  { id: "s_food_03", speaker: "selim", category: "food", mood: "sad", text: "মেসের ডাল এত পাতলা, নিজের reflection দেখা যাচ্ছে।", boguraFlavor: true },
  { id: "s_food_04", speaker: "selim", category: "food", mood: "determined", text: "আজকে বাজেটে থাকবো। খাবারেও।", boguraFlavor: false },
  { id: "s_food_05", speaker: "selim", category: "food", mood: "happy", text: "ভালো খাবার খাইলে mood ভালো হয়। এটা science।", boguraFlavor: true },

  // ─── SELIM — MONEY / BUDGET (O) ─────────────────────────────────────────────
  { id: "s_money_01", speaker: "selim", category: "money", mood: "nervous", text: "পকেট খালি হয়ে যাচ্ছে। Tension হচ্ছে।", boguraFlavor: true, cooldownMs: 15000, conditions: { maxStats: { money: 800 } } },
  { id: "s_money_02", speaker: "selim", category: "money", mood: "sad", text: "টাকা গেলো। Pinky-র কারণে। না মানে, ওর না, situation-এর কারণে।", boguraFlavor: true },
  { id: "s_money_03", speaker: "selim", category: "money", mood: "determined", text: "আজকে budget track করবো। Seriously।", boguraFlavor: false },
  { id: "s_money_04", speaker: "selim", category: "money", mood: "happy", text: "টাকা জমলো! একটু হলেও। ভালো লাগছে।", boguraFlavor: false, conditions: { minStats: { money: 3000 } } },
  { id: "s_money_05", speaker: "selim", category: "money", mood: "philosophical", text: "টাকা সব না, কিন্তু ঢাকায় টাকা ছাড়া কিছুই না।", boguraFlavor: false },
  { id: "s_money_06", speaker: "selim", category: "money", mood: "embarrassed", text: "ভাড়া দিতে পারলাম না। লজ্জা লাগছে।", boguraFlavor: true },

  // ─── SELIM — ADVICE RESPONSE (P) ────────────────────────────────────────────
  { id: "s_advice_01", speaker: "selim", category: "advice", mood: "hopeful", text: "ভাই, তুই যা বলছিস, মনে হচ্ছে ঠিকই আছিস।", boguraFlavor: true, cooldownMs: 15000 },
  { id: "s_advice_02", speaker: "selim", category: "advice", mood: "defensive", text: "হ্যাঁ হ্যাঁ, বুঝলাম। কিন্তু situation টা একটু আলাদা।", boguraFlavor: false },
  { id: "s_advice_03", speaker: "selim", category: "advice", mood: "confused", text: "তোর কথা মাথায় রাখলাম। দেখা যাক।", boguraFlavor: false },
  { id: "s_advice_04", speaker: "selim", category: "advice", mood: "determined", text: "এইবার সত্যিই তোর কথা শুনবো।", boguraFlavor: false },

  // ─── SELIM — SILENT MOOD (Q) ────────────────────────────────────────────────
  { id: "s_silent_01", speaker: "selim", category: "silent", mood: "sad", text: "...", boguraFlavor: false, cooldownMs: 60000 },
  { id: "s_silent_02", speaker: "selim", category: "silent", mood: "tired", text: "কিছু বলতে চাইছি না এখন।", boguraFlavor: false, cooldownMs: 45000 },
  { id: "s_silent_03", speaker: "selim", category: "silent", mood: "sad", text: "একটু একা থাকতে চাই।", boguraFlavor: true, cooldownMs: 45000 },

  // ─── SELIM — ANGRY (R) ──────────────────────────────────────────────────────
  { id: "s_angry_01", speaker: "selim", category: "angry", mood: "angry", text: "আর না! এই ঢাকায় সবাই ঠকায়!", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_angry_02", speaker: "selim", category: "angry", mood: "angry", text: "Pinky, তুমি বুঝো না।", boguraFlavor: false },
  { id: "s_angry_03", speaker: "selim", category: "angry", mood: "angry", text: "এই রিকশাওয়ালা তো চোর। সব চোর।", boguraFlavor: true, cooldownMs: 20000 },

  // ─── SELIM — APOLOGY (S) ────────────────────────────────────────────────────
  { id: "s_apology_01", speaker: "selim", category: "apology", mood: "regret", text: "ভাই, sorry। মাথা ঠিক ছিলো না।", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_apology_02", speaker: "selim", category: "apology", mood: "sad", text: "Rafiq ভাই, তোর সাথে ভুল করেছি।", boguraFlavor: false },
  { id: "s_apology_03", speaker: "selim", category: "apology", mood: "embarrassed", text: "আমি আসলে এমন না। Context ছিলো।", boguraFlavor: false },

  // ─── SELIM — DAY END / SUMMARY (T) ──────────────────────────────────────────
  { id: "s_day_end_01", speaker: "selim", category: "day_end", mood: "tired", text: "আরেকটা দিন শেষ হলো ঢাকায়।", boguraFlavor: true, cooldownMs: 25000 },
  { id: "s_day_end_02", speaker: "selim", category: "day_end", mood: "hopeful", text: "কাল আরেকটু ভালো করবো।", boguraFlavor: false },
  { id: "s_day_end_03", speaker: "selim", category: "day_end", mood: "happy", text: "আজকের দিন মন্দ ছিলো না।", boguraFlavor: false, conditions: { minStats: { mood: 60 } } },
  { id: "s_day_end_04", speaker: "selim", category: "day_end", mood: "sad", text: "আজকেও Pinky reply করেনি।", boguraFlavor: true, conditions: { minStats: { attachmentLevel: 40 }, maxStats: { pinkyHappiness: 35 } } },
  { id: "s_day_end_05", speaker: "selim", category: "day_end", mood: "philosophical", text: "Bogura-তে ফোন করা উচিত ছিলো।", boguraFlavor: true },

  // ─── SELIM — NEW CRUSH (U) ──────────────────────────────────────────────────
  { id: "s_new_crush_01", speaker: "selim", category: "new_crush", mood: "excited", text: "ভাই, আবার হইলো নাকি! এই বার সিরিয়াস কিন্তু।", boguraFlavor: true, cooldownMs: 20000 },
  { id: "s_new_crush_02", speaker: "selim", category: "new_crush", mood: "romantic", text: "এইটা আলাদা। আগেরগুলা ছিলো confusion।", boguraFlavor: false },
  { id: "s_new_crush_03", speaker: "selim", category: "new_crush", mood: "nervous", text: "মেয়েটার নাম জিজ্ঞেস করতে পারি? কীভাবে করবো?", boguraFlavor: true },
  { id: "s_new_crush_chaiwala_01", speaker: "selim", category: "new_crush", mood: "embarrassed", text: "ভাই, চায়ওয়ালার নাম জানতাম না। জানতে পারলে ভালো হতো।", boguraFlavor: true, cooldownMs: 30000, conditions: { cardIds: ["ritu_chaiwala_booking"] } },
  { id: "s_new_crush_chaiwala_02", speaker: "selim", category: "new_crush", mood: "romantic", text: "ভয় পাইলেই হারাইতাম। তাই বললাম — Ritu, তোমাকে ভালো লাগে।", boguraFlavor: false, cooldownMs: 30000, conditions: { minStats: { selfRespect: 50 } } },
  { id: "s_new_crush_chaiwala_03", speaker: "selim", category: "new_crush", mood: "philosophical", text: "ছাদে বসে শিখলাম — সব plan কাজ করে না, কিন্তু সাহস কাজ করে।", boguraFlavor: true, cooldownMs: 45000 },

  // ─── SELIM — BOGURA MEMORY (V) ──────────────────────────────────────────────
  { id: "s_bogura_01", speaker: "selim", category: "bogura_memory", mood: "sad", text: "ভাই, Bogura miss করছি। মায়ের হাতের রান্না।", boguraFlavor: true, cooldownMs: 45000, conditions: { minStats: { loneliness: 40 } } },
  { id: "s_bogura_02", speaker: "selim", category: "bogura_memory", mood: "philosophical", text: "গ্রামে গেলে মন শান্ত থাকতো। এখানে সব complicated।", boguraFlavor: true },
  { id: "s_bogura_03", speaker: "selim", category: "bogura_memory", mood: "hopeful", text: "একদিন Bogura ফিরবো। ভালো কিছু করে।", boguraFlavor: true, cooldownMs: 60000 },
  { id: "s_bogura_04", speaker: "selim", category: "bogura_memory", mood: "happy", text: "আমাদের মহল্লায় এই সময় চায়ের আড্ডা বসতো।", boguraFlavor: true },

  // ─── SELIM — ACHIEVEMENT (W) ────────────────────────────────────────────────
  { id: "s_achievement_01", speaker: "selim", category: "achievement", mood: "proud", text: "Oi! এটা হলো! ভাই, আমি পারছি!", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_achievement_02", speaker: "selim", category: "achievement", mood: "excited", text: "Achievement! মনে হচ্ছে boss fight জিতলাম।", boguraFlavor: false },
  { id: "s_achievement_03", speaker: "selim", category: "achievement", mood: "happy", text: "এইটা screenshot করা দরকার।", boguraFlavor: false },

  // ─── SELIM — FRIEND TRUST UP (X) ────────────────────────────────────────────
  { id: "s_trust_up_01", speaker: "selim", category: "trust_up", mood: "happy", text: "Rafiq ভাই বলসে আমার উপর trust আছে। ভালো লাগলো।", boguraFlavor: true, cooldownMs: 25000 },
  { id: "s_trust_up_02", speaker: "selim", category: "trust_up", mood: "hopeful", text: "বন্ধুত্ব বাড়ছে। Life আসলে এটাই।", boguraFlavor: false },

  // ─── SELIM — FRIEND TRUST DOWN (Y) ─────────────────────────────────────────
  { id: "s_trust_down_01", speaker: "selim", category: "trust_down", mood: "regret", text: "Rafiq ভাই আমার উপর হতাশ। Deserve করেছি।", boguraFlavor: false, cooldownMs: 25000 },
  { id: "s_trust_down_02", speaker: "selim", category: "trust_down", mood: "sad", text: "বন্ধু হারানো কঠিন।", boguraFlavor: false },

  // ─── SELIM — GOOD ENDING (Z1) ───────────────────────────────────────────────
  { id: "s_ending_good_01", speaker: "selim", category: "ending_good", mood: "proud", text: "ভাই, Bogura boss হয়ে গেলাম। Career আছে, respect আছে।", boguraFlavor: true },
  { id: "s_ending_good_02", speaker: "selim", category: "ending_good", mood: "happy", text: "ঢাকায় টিকে গেলাম! সত্যিই টিকে গেলাম!", boguraFlavor: false },
  { id: "s_ending_good_03", speaker: "selim", category: "ending_good", mood: "philosophical", text: "কষ্ট হয়েছিলো। কিন্তু শিক্ষাও হয়েছে।", boguraFlavor: false },

  // ─── SELIM — BAD ENDING (Z2) ────────────────────────────────────────────────
  { id: "s_ending_bad_01", speaker: "selim", category: "ending_bad", mood: "sad", text: "হারিয়ে গেলাম। কিন্তু কাল নতুন দিন।", boguraFlavor: false },
  { id: "s_ending_bad_02", speaker: "selim", category: "ending_bad", mood: "regret", text: "Pinky-র পিছনে এত ছুটলাম, নিজেকে হারিয়ে ফেললাম।", boguraFlavor: true },
  { id: "s_ending_bad_03", speaker: "selim", category: "ending_bad", mood: "determined", text: "Next time। পারবো।", boguraFlavor: false },

  // ─── ADDITIONAL SELIM LINES (to reach 120+) ─────────────────────────────────
  { id: "s_misc_01", speaker: "selim", category: "morning", mood: "playful", text: "ঢাকায় বাসে উঠা মানে boss fight।", boguraFlavor: true, cooldownMs: 60000 },
  { id: "s_misc_02", speaker: "selim", category: "advice", mood: "philosophical", text: "আমি loyal। কিন্তু multiple loyalty manage করতে হয়।", boguraFlavor: true, cooldownMs: 60000 },
  { id: "s_misc_03", speaker: "selim", category: "pinky_recharge", mood: "romantic", text: "Recharge দিলাম, মন দিলাম। Return gift: seen।", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_misc_04", speaker: "selim", category: "career", mood: "determined", text: "Freelance client পেলাম। ছোট, কিন্তু শুরু।", boguraFlavor: false, cooldownMs: 30000 },
  { id: "s_misc_05", speaker: "selim", category: "food", mood: "happy", text: "সিঙ্গারা + চা = ঢাকার happiness formula।", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_misc_06", speaker: "selim", category: "money", mood: "nervous", text: "কুদ্দুস ভাই ভাড়া চাইতে আসছে। Hide করবো?", boguraFlavor: true, cooldownMs: 20000 },
  { id: "s_misc_07", speaker: "selim", category: "pinky_message", mood: "excited", text: "Active দেখাচ্ছে! Message দেবো নাকি wait করবো?", boguraFlavor: true, cooldownMs: 15000 },
  { id: "s_misc_08", speaker: "selim", category: "override", mood: "confused", text: "ভাই, মন আর মাথা একই কথা বলছে না।", boguraFlavor: false, cooldownMs: 20000 },
  { id: "s_misc_09", speaker: "selim", category: "heartbreak", mood: "tired", text: "Pinky-র 'hmm' এর মধ্যে অর্থ খুঁজতে থাকি।", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_misc_10", speaker: "selim", category: "recovery", mood: "hopeful", text: "Comeback king হওয়ার এখনই সময়।", boguraFlavor: false, cooldownMs: 30000 },
  { id: "s_misc_11", speaker: "selim", category: "best_friend", mood: "happy", text: "একা একা হাসছি। Rafiq বলবে পাগল।", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_misc_12", speaker: "selim", category: "bogura_memory", mood: "philosophical", text: "মা জিজ্ঞেস করলেন 'খাচ্ছিস তো?' বললাম হ্যাঁ। মিথ্যা।", boguraFlavor: true, cooldownMs: 60000 },
  { id: "s_misc_13", speaker: "selim", category: "morning", mood: "hopeful", text: "নতুন দিন। নতুন chance। এবার ঠিকঠাক করবো।", boguraFlavor: false, cooldownMs: 20000 },
  { id: "s_misc_14", speaker: "selim", category: "trust_up", mood: "happy", text: "বন্ধু জিনিসটা লাইফে থাকা দরকার। Seriously।", boguraFlavor: false, cooldownMs: 30000 },
  { id: "s_misc_15", speaker: "selim", category: "achievement", mood: "excited", text: "Bogura-র ছেলে Dhaka-তে prove করলো!", boguraFlavor: true, cooldownMs: 60000 },
  { id: "s_misc_16", speaker: "selim", category: "day_end", mood: "philosophical", text: "আজকে যা হলো, তা হলো। কাল দেখা যাবে।", boguraFlavor: false, cooldownMs: 15000 },
  { id: "s_misc_17", speaker: "selim", category: "career", mood: "excited", text: "IQ বাড়লো! মানে শিখছি।", boguraFlavor: false, cooldownMs: 20000 },
  { id: "s_misc_18", speaker: "selim", category: "new_crush", mood: "philosophical", text: "First love প্রতিবারই first। এটাই আমার curse।", boguraFlavor: true, cooldownMs: 30000 },
  { id: "s_misc_19", speaker: "selim", category: "silent", mood: "philosophical", text: "কখনো কখনো চুপ থাকাই answer।", boguraFlavor: false, cooldownMs: 60000 },
  { id: "s_misc_20", speaker: "selim", category: "apology", mood: "regret", text: "ভুল হয়েছে। মানছি। পরের বার ঠিক করবো।", boguraFlavor: false, cooldownMs: 30000 },

  // ─── PINKY LINES ────────────────────────────────────────────────────────────
  { id: "p_hmm_01", speaker: "pinky", category: "pinky_message", mood: "confused", text: "Hmm।", boguraFlavor: false },
  { id: "p_hmm_02", speaker: "pinky", category: "pinky_message", mood: "confused", text: "Okay।", boguraFlavor: false },
  { id: "p_recharge_01", speaker: "pinky", category: "pinky_recharge", mood: "hopeful", text: "Balance শেষ, একটু recharge দিতে পারবে?", boguraFlavor: false },
  { id: "p_recharge_02", speaker: "pinky", category: "pinky_recharge", mood: "playful", text: "Please! Last time হবে।", boguraFlavor: false },
  { id: "p_thanks_01", speaker: "pinky", category: "pinky_message", mood: "happy", text: "Thanks! 😊", boguraFlavor: false },
  { id: "p_busy_01", speaker: "pinky", category: "pinky_message", mood: "nervous", text: "Busy আছি। পরে কথা হবে।", boguraFlavor: false },
  { id: "p_seen_01", speaker: "pinky", category: "pinky_message", mood: "confused", text: "[Seen]", boguraFlavor: false },

  // ─── RAFIQ LINES ────────────────────────────────────────────────────────────
  { id: "r_advice_01", speaker: "rafiq", category: "advice", mood: "philosophical", text: "ভাই সেলিম, Pinky-র পিছনে এত দৌড়াস না। নিজের জন্য ভাব।", boguraFlavor: false },
  { id: "r_bestfriend_01", speaker: "rafiq", category: "best_friend", mood: "happy", text: "ভাই, আমি আছি। চিন্তা করিস না।", boguraFlavor: false },
  { id: "r_morning_01", speaker: "rafiq", category: "morning", mood: "playful", text: "চা বানাইছি। উঠ।", boguraFlavor: false },
  { id: "r_food_01", speaker: "rafiq", category: "food", mood: "excited", text: "আজকে biryani পাটি দিচ্ছি। আমার treat।", boguraFlavor: false },
  { id: "r_money_01", speaker: "rafiq", category: "money", mood: "nervous", text: "ভাই, ভাড়ার টাকা দিছিস? কুদ্দুস ভাই জিজ্ঞেস করছিলো।", boguraFlavor: false },
  { id: "r_trust_01", speaker: "rafiq", category: "trust_up", mood: "happy", text: "তোর সাথে থাকলে ভালো লাগে। Good human।", boguraFlavor: false },

  // ─── NILA LINES ─────────────────────────────────────────────────────────────
  { id: "n_advice_01", speaker: "nila", category: "advice", mood: "determined", text: "সেলিম ভাই, career-এ focus করো। Love পরে হবে।", boguraFlavor: false },
  { id: "n_career_01", speaker: "nila", category: "career", mood: "happy", text: "আজকের কাজটা ভালো হয়েছে।", boguraFlavor: false },
  { id: "n_trust_01", speaker: "nila", category: "trust_up", mood: "philosophical", text: "Respect earn করতে হয়। তুমি করছো।", boguraFlavor: false },
  { id: "n_pinky_01", speaker: "nila", category: "pinky_refuse", mood: "determined", text: "Pinky তোমাকে use করছে, বুঝতে পারছো না?", boguraFlavor: false },

  // ─── SELIM — NEW CARD-SPECIFIC LINES (Task #24) ────────────────────────────
  // Money-ask / lie / catch / apology loop
  { id: "s_money_ask_rafiq_01", speaker: "selim", category: "money", mood: "embarrassed", text: "ভাই, একটু টাকা লাগবে। মাসের শেষ। লজ্জা লাগছে চাইতে।", boguraFlavor: true, cooldownMs: 25000, conditions: { cardIds: ["selim_asks_rafiq_money"] } },
  { id: "s_money_ask_rafiq_02", speaker: "selim", category: "money", mood: "nervous", text: "রাফিক, ৫০০ টাকা ধার দিবি? পরের সপ্তাহে শোধ করবো, promise।", boguraFlavor: false, cooldownMs: 25000, conditions: { cardIds: ["selim_asks_rafiq_money"] } },
  { id: "s_caught_lying_01", speaker: "selim", category: "apology", mood: "embarrassed", text: "ভাই, sorry। মিথ্যা বলেছিলাম। কুদ্দুস ভাই-এর কাছ থেকে শুনলি, না?", boguraFlavor: true, cooldownMs: 25000, conditions: { cardIds: ["selim_caught_lying"] } },
  { id: "s_caught_lying_02", speaker: "selim", category: "apology", mood: "regret", text: "জানি ভুল করেছি। তোর চোখে চোখ রাখতে পারছি না।", boguraFlavor: false, cooldownMs: 25000, conditions: { cardIds: ["selim_caught_lying"] } },
  { id: "s_apology_after_lie_01", speaker: "selim", category: "apology", mood: "regret", text: "চা নিয়ে আসছি। কথা বলবি একটু? কাল রাতের জন্য sorry।", boguraFlavor: true, cooldownMs: 25000, conditions: { cardIds: ["selim_apology_after_lie"] } },
  { id: "s_apology_after_lie_02", speaker: "selim", category: "apology", mood: "hopeful", text: "বন্ধুত্বের দাম এক কাপ চা না। কিন্তু শুরু এটাই।", boguraFlavor: false, cooldownMs: 25000, conditions: { cardIds: ["selim_apology_after_lie"] } },

  // Fake girl / catfish loop
  { id: "s_fake_girl_inbox_01", speaker: "selim", category: "pinky_message", mood: "excited", text: "ভাই! অজানা মেয়ে DM দিসে! Profile তো দারুণ। Reply দিবো?", boguraFlavor: true, cooldownMs: 25000, conditions: { cardIds: ["fake_girl_inbox"] } },
  { id: "s_fake_girl_inbox_02", speaker: "selim", category: "pinky_message", mood: "nervous", text: "এত সুন্দর মেয়ে আমাকেই কেন message দিলো? কিছু একটা গন্ধ পাচ্ছি।", boguraFlavor: false, cooldownMs: 25000, conditions: { cardIds: ["fake_girl_inbox"] } },
  { id: "s_fake_girl_money_01", speaker: "selim", category: "money", mood: "confused", text: "ভাই, ও ১৫০০ টাকা চাচ্ছে। বিপদে পড়েছে নাকি? হাত কাঁপছে।", boguraFlavor: true, cooldownMs: 25000, conditions: { cardIds: ["fake_girl_money_ask"] } },
  { id: "s_fake_girl_money_02", speaker: "selim", category: "money", mood: "defensive", text: "৩ দিন কথা হইছে। সে আমাকে বিশ্বাস করেছে। আমিও কি করবো?", boguraFlavor: false, cooldownMs: 25000, conditions: { cardIds: ["fake_girl_money_ask"] } },
  { id: "s_fake_girl_reveal_01", speaker: "selim", category: "pinky_message", mood: "regret", text: "Reverse image search। চুরি করা photo। আমি কতবড় বোকা ভাই।", boguraFlavor: true, cooldownMs: 30000, conditions: { cardIds: ["fake_girl_reveal"] } },
  { id: "s_fake_girl_reveal_02", speaker: "selim", category: "pinky_message", mood: "embarrassed", text: "৩ সপ্তাহের account, ১২ followers। চোখের সামনে red flag। দেখিনি।", boguraFlavor: false, cooldownMs: 30000, conditions: { cardIds: ["fake_girl_reveal"] } },

  // Touba timer cards (main + random comedy)
  { id: "s_touba_start_01", speaker: "selim", category: "pinky_message", mood: "determined", text: "আজ থেকে official Touba। ৭ দিন। No recharge, no text, no last seen check।", boguraFlavor: true, cooldownMs: 30000, conditions: { cardIds: ["touba_timer_start"] } },
  { id: "s_touba_start_02", speaker: "selim", category: "pinky_message", mood: "proud", text: "এবার serious। রাফিক, তুই witness। Timer শুরু।", boguraFlavor: false, cooldownMs: 30000, conditions: { cardIds: ["touba_timer_start"] } },
  { id: "s_touba_day3_01", speaker: "selim", category: "pinky_message", mood: "tired", text: "Day 3। ৪৭ বার phone তুলেছি। ৪৬ বার রেখেছি। এই ১টা বার...", boguraFlavor: true, cooldownMs: 30000, conditions: { cardIds: ["touba_timer_day3"] } },
  { id: "s_touba_day3_02", speaker: "selim", category: "pinky_message", mood: "nervous", text: "ওর story-তে green dot। আমি দেখবো না। দেখবো না। দেখবো...", boguraFlavor: false, cooldownMs: 30000, conditions: { cardIds: ["touba_timer_day3"] } },
  { id: "s_touba_notif_01", speaker: "selim", category: "pinky_message", mood: "nervous", text: "Notification এলো! Pinky হতে পারে। হাত নিজেই চলে যাচ্ছে phone-এ।", boguraFlavor: true, cooldownMs: 25000, conditions: { cardIds: ["re_touba_whatsapp_notification"] } },
  { id: "s_touba_excuse_01", speaker: "selim", category: "pinky_message", mood: "embarrassed", text: "ভাই, এবার excuse-টা শোন। Force majeure। Pinky online ছিলো!", boguraFlavor: true, cooldownMs: 25000, conditions: { cardIds: ["re_touba_broken_excuse_masterclass"] } },
  { id: "s_touba_excuse_02", speaker: "selim", category: "pinky_message", mood: "playful", text: "Touba timer-এর concept আসলে ভুল ছিলো। Theoretically।", boguraFlavor: false, cooldownMs: 25000, conditions: { cardIds: ["re_touba_broken_excuse_masterclass"] } },
  { id: "s_touba_record_01", speaker: "selim", category: "pinky_message", mood: "proud", text: "৬ দিন! Personal best ভাই! Touba জিতছি!", boguraFlavor: true, cooldownMs: 30000, conditions: { cardIds: ["re_touba_new_record"] } },
  { id: "s_touba_record_02", speaker: "selim", category: "pinky_message", mood: "happy", text: "মেসের সবাই হাততালি দিলো। আমি কাঁদবো নাকি হাসবো বুঝতেছি না।", boguraFlavor: false, cooldownMs: 30000, conditions: { cardIds: ["re_touba_new_record"] } },

  // ─── CHA MAMA LINES ─────────────────────────────────────────────────────────
  { id: "cm_morning_01", speaker: "cha-mama", category: "morning", mood: "happy", text: "বাবা, এক কাপ চা নিয়া যাও। দিন ভালো যাবে।", boguraFlavor: false },
  { id: "cm_advice_01", speaker: "cha-mama", category: "advice", mood: "philosophical", text: "মেয়ে মানুষের পিছনে টাকা ঢাললে কিছু হয় না, বাবা।", boguraFlavor: false },
  { id: "cm_food_01", speaker: "cha-mama", category: "food", mood: "happy", text: "আজকে সিঙ্গারা fresh আছে। একটু নাও।", boguraFlavor: false },
  { id: "cm_bogura_01", speaker: "cha-mama", category: "bogura_memory", mood: "happy", text: "Bogura-র ছেলে! আমিও সেখানকার। পরিচিত লাগে।", boguraFlavor: false },

  // ─── KUDDUS BHAI LINES ──────────────────────────────────────────────────────
  { id: "kb_rent_01", speaker: "kuddus-bhai", category: "money", mood: "angry", text: "ভাড়া কই? Wi-Fi বন্ধ করবো।", boguraFlavor: false },
  { id: "kb_rent_02", speaker: "kuddus-bhai", category: "money", mood: "nervous", text: "এই মাসেও দেরি? ভাই, আমারও সংসার আছে।", boguraFlavor: false },
  { id: "kb_happy_01", speaker: "kuddus-bhai", category: "money", mood: "happy", text: "সময়মতো দিছো। ভালো ছেলে। Wi-Fi password নতুন: 'bogura123'।", boguraFlavor: false },
  { id: "kb_water_01", speaker: "kuddus-bhai", category: "morning", mood: "tired", text: "পানির সমস্যা আছে। একটু ধৈর্য ধরো।", boguraFlavor: false },
];

const TRIGGER_TO_CATEGORIES: Record<string, VoiceCategory[]> = {
  game_start:       ["greeting", "morning"],
  ask_advice:       ["advice"],
  obey:             ["obey"],
  half_obey:        ["half_obey"],
  override:         ["override"],
  pinky_message:    ["pinky_message"],
  recharge:         ["pinky_recharge"],
  recharge_refuse:  ["pinky_refuse"],
  heartbreak:       ["heartbreak"],
  new_crush:        ["new_crush"],
  promise_made:     ["promise_made"],
  promise_broken:   ["promise_broken"],
  money_ask:        ["money"],
  trust_up:         ["trust_up"],
  trust_down:       ["trust_down"],
  silent:           ["silent"],
  anger:            ["angry"],
  apology:          ["apology"],
  best_friend:      ["best_friend"],
  recovery:         ["recovery"],
  day_end:          ["day_end"],
  achievement:      ["achievement"],
  ending_good:      ["ending_good"],
  ending_bad:       ["ending_bad"],
  bogura_memory:    ["bogura_memory"],
  career:           ["career"],
  food:             ["food"],
};

/**
 * Backward-compatible accessor: returns all candidate lines for a trigger.
 * Used by callers that don't need contextual filtering.
 */
export function getVoiceLinesForTrigger(
  trigger: string,
  speaker: VoiceLine["speaker"] = "selim"
): VoiceLine[] {
  const cats = TRIGGER_TO_CATEGORIES[trigger] ?? ["greeting"];
  return VOICE_LINES.filter(
    (l) => l.speaker === speaker && cats.includes(l.category)
  );
}

/**
 * Hard-check: returns false when the line declares conditions that the
 * current context violates (a min/max stat threshold). Soft preferences
 * (locations, cardIds, accent) are not enforced here — they only boost score.
 */
export function lineMatchesContext(line: VoiceLine, ctx: VoiceContext | undefined): boolean {
  const c = line.conditions;
  if (!c || !ctx) return true;
  const stats = ctx.stats;
  if (stats) {
    if (c.minStats) {
      for (const [k, v] of Object.entries(c.minStats) as [VoiceStatKey, number][]) {
        const cur = stats[k];
        if (typeof cur === "number" && cur < v) return false;
      }
    }
    if (c.maxStats) {
      for (const [k, v] of Object.entries(c.maxStats) as [VoiceStatKey, number][]) {
        const cur = stats[k];
        if (typeof cur === "number" && cur > v) return false;
      }
    }
  }
  if (c.requiresBoguraAccent !== undefined && ctx.boguraAccent !== undefined) {
    if (c.requiresBoguraAccent !== ctx.boguraAccent) return false;
  }
  return true;
}

/**
 * Soft score: higher is better. Lines that explicitly declare conditions
 * matching the context get a bonus so they out-rank generic lines. Lines
 * with no conditions stay viable (baseline score 1).
 */
export function scoreLineForContext(line: VoiceLine, ctx: VoiceContext | undefined): number {
  let score = 1;
  const c = line.conditions;
  if (!c || !ctx) return score;

  if (ctx.stats) {
    // Each satisfied min/max threshold adds weight (caller already ran
    // lineMatchesContext, so all listed thresholds are by definition satisfied).
    score += Object.keys(c.minStats ?? {}).length * 1.5;
    score += Object.keys(c.maxStats ?? {}).length * 1.5;
  }
  if (c.locations && ctx.location && c.locations.includes(ctx.location)) {
    score += 3;
  }
  if (c.cardIds && ctx.cardId && c.cardIds.includes(ctx.cardId)) {
    score += 5; // strongest signal — a line written for this exact card
  }
  if (c.requiresBoguraAccent !== undefined && ctx.boguraAccent === c.requiresBoguraAccent) {
    score += 1;
  }
  return score;
}

/**
 * Smart picker: filters trigger candidates by hard conditions, scores them by
 * context match, and returns a weighted-random pick. Returns null if no line
 * is eligible.
 */
export function pickContextualLine(
  trigger: string,
  ctx: VoiceContext | undefined,
  speaker: VoiceLine["speaker"] = "selim",
  isPlayable: (line: VoiceLine) => boolean = () => true,
): VoiceLine | null {
  const candidates = getVoiceLinesForTrigger(trigger, speaker);
  if (candidates.length === 0) return null;

  // Hard filter by conditions
  const matching = candidates.filter((l) => lineMatchesContext(l, ctx));
  // Then by playability (cooldown). Fall back gracefully if everything is on cooldown.
  const playable = matching.filter(isPlayable);
  const pool = playable.length > 0 ? playable : (matching.length > 0 ? matching : candidates);

  // Weighted random by score
  const weights = pool.map((l) => scoreLineForContext(l, ctx));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1] ?? null;
}
