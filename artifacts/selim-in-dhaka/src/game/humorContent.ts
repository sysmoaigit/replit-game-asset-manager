/**
 * Humor & charm content for Selim in Dhaka.
 *
 * This is data-only: text strings the rest of the app pulls in for
 * taglines, idle quips, low-stat reactions, system messages, etc.
 * Nothing here ships audio — playback flows through audioEngine which
 * will fall back to subtitles when no MP3 exists.
 *
 * Spice levels:
 *   - mild     → safe, family-friendly, no Bogura accent
 *   - standard → default — light Bogura flavor, Selim's normal voice
 *   - full     → spiciest one-liners, heaviest accent, savage zingers
 *
 * The Settings → Humor Level slider gates which lines are eligible.
 */

export type HumorLevel = "mild" | "standard" | "full";

export const HUMOR_LEVEL_LABELS: Record<HumorLevel, string> = {
  mild: "Mild",
  standard: "Standard",
  full: "Full Bogura",
};

const ORDER: HumorLevel[] = ["mild", "standard", "full"];

/** Returns true when the line's required level is <= the user's chosen level. */
export function lineAllowedAtLevel(lineLevel: HumorLevel, userLevel: HumorLevel): boolean {
  return ORDER.indexOf(lineLevel) <= ORDER.indexOf(userLevel);
}

export type HumorLine = { level: HumorLevel; text: string };

/** Witty taglines that rotate on the home screen. */
export const TAGLINES: HumorLine[] = [
  { level: "mild",     text: "Bogura থেকে Dhaka — স্বপ্ন বড়, রিকশা ছোট।" },
  { level: "mild",     text: "Pinky reply দিসে 'hmm'। ভাই, এটা কি green signal?" },
  { level: "mild",     text: "Recharge দিলাম, মন দিলাম, টাকা দিলাম। Return gift: seen." },
  { level: "mild",     text: "এই বার সিরিয়াস। আগেরগুলা ছিলো practice।" },
  { level: "standard", text: "Bogura থেইকা ঢাকা আসছি, কিন্তু Pinky আমার মাথার ভিতরে already flat নিয়ে ফেলছে।" },
  { level: "standard", text: "আমি loyal। কিন্তু situation অনুযায়ী multiple loyalty manage করতে হয়।" },
  { level: "standard", text: "রিকশা ভাড়া শুনে মনে হলো spaceship বুক করছি।" },
  { level: "standard", text: "ঢাকায় বাসে উঠা মানে boss fight।" },
  { level: "standard", text: "ভাই, আমি use হই না। আমি emotionally available।" },
  { level: "standard", text: "Cha মামার কাছে দুই কাপ চায়ের ধার আছে — relationship status: complicated।" },
  { level: "standard", text: "Mess-এর Wi-Fi password এর চেয়েও Pinky-র last seen বেশি unstable।" },
  { level: "full",     text: "ভাই, friend zone-এ আছি, কিন্তু rent zone-এও pending।" },
  { level: "full",     text: "Pinky-র জন্য 100% effort, salary-র জন্য 30% — এই imbalance ঠিক করতে হবে।" },
  { level: "full",     text: "Dating app-এ swipe করি না — bKash app-এ recharge করি। Same dopamine।" },
  { level: "full",     text: "Bhai, Bogura-তে থাকলে এতো heart attack হইতো না।" },
];

/** Categories used by the rest of the game to fetch a contextual quip. */
export type HumorCategory =
  | "idle_too_long"      // player hasn't tapped in a while
  | "tap_selim"           // player keeps tapping the avatar
  | "low_health"          // health < 25
  | "low_money"           // money < 200
  | "low_mood"            // mood < 25
  | "perfect_day"         // ended the day with great stats
  | "disaster_day"        // ended the day in shambles
  | "first_card_of_day"   // first card a new day shows
  | "ending_zinger"       // post-ending one-liner
  | "system";             // loading/empty/error UI strings

const POOL: Record<HumorCategory, HumorLine[]> = {
  idle_too_long: [
    { level: "mild",     text: "ভাই, আছো? নাকি Pinky-র last seen check করতে গেলা?" },
    { level: "standard", text: "চা ঠান্ডা হয়ে গেলো এতক্ষণে। একটা কিছু press করো।" },
    { level: "standard", text: "এই silence-টা suspicious। তুমি কি আমার ফোন নম্বর ভুলে গেলা?" },
    { level: "full",     text: "ভাই, scroll-ই করতেছো নাকি ভাবতেছো? Bogura-তে এতো ভাবা যাইতো না।" },
  ],
  tap_selim: [
    { level: "mild",     text: "এই, কাতুকুতু লাগে! 😅" },
    { level: "standard", text: "ভাই, আমি tap করার জিনিস না। আমি একজন সংবেদনশীল মানুষ।" },
    { level: "standard", text: "Pinky-ও এতো বার touch করে না। Show some respect।" },
    { level: "full",     text: "Bhai, free massage খুঁজতেছো? Cha মামার কাছে যাও।" },
    { level: "full",     text: "এতো বার tap কইরা কী হবে? Achievement আনলক হবে না, ব্যথাই দিবা।" },
  ],
  low_health: [
    { level: "mild",     text: "শরীর ভালো না। একটা বিরিয়ানি… না না, একটা পানি খাই।" },
    { level: "standard", text: "মাথা ঘুরতেছে। এটা love না, এটা low blood pressure।" },
    { level: "full",     text: "ভাই, শরীর crash দিচ্ছে। Bogura-র মা শুনলে rickshaw ভাড়া পাঠাবে।" },
  ],
  low_money: [
    { level: "mild",     text: "পকেটে শুধু lint আর dreams।" },
    { level: "standard", text: "bKash balance এতো কম যে app খুলতেও লজ্জা লাগে।" },
    { level: "full",     text: "ATM-এ গিয়ে balance দেখলে মেশিন হাসবে। ভাই, আমি যাবো না।" },
  ],
  low_mood: [
    { level: "mild",     text: "মনটা ভারি। চা চাই।" },
    { level: "standard", text: "আজকে কোনো reels-ও হাসায় না। এটা serious।" },
    { level: "full",     text: "Bhai, mood এমন যে Pinky reply দিলেও উত্তর দিবো 'k'।" },
  ],
  perfect_day: [
    { level: "mild",     text: "আজকের দিনটা মন্দ ছিলো না!" },
    { level: "standard", text: "ভাই, আজকে Selim জিতছে। Note করে রাখো — rare event।" },
    { level: "full",     text: "এক দিনে এতো ভালো? Bogura-তে থাকলে মা মিষ্টি বানাইতো এই news-এ।" },
  ],
  disaster_day: [
    { level: "mild",     text: "আজকের দিনটা… চলে যাক।" },
    { level: "standard", text: "ভাই, restart button কই? জীবনে দরকার ছিলো।" },
    { level: "full",     text: "এই দিনটা এতো বাজে যে rickshaw-ও আমাকে দেখে গতি কমাইলো।" },
  ],
  first_card_of_day: [
    { level: "mild",     text: "নতুন দিন। নতুন drama। চা?" },
    { level: "standard", text: "ভাই, ঘুম থেকে উঠেই Pinky-র last seen — addiction এটাকেই বলে।" },
    { level: "full",     text: "Bogura-তে ভোর মানে পাখির ডাক। এখানে মানে notification-এর pile।" },
  ],
  ending_zinger: [
    { level: "mild",     text: "এই গল্পের শেষ হলো — পরের আবার আছে।" },
    { level: "standard", text: "ভাই, ending দেখে মনে হইলো trailer-ই ভালো ছিলো।" },
    { level: "full",     text: "এই ending dedicate করলাম Pinky-কে। ও পড়বে না, কিন্তু symbolism-টা matter করে।" },
  ],
  system: [
    // Used for loading / empty / error UI text. Shown as-is, no playback.
    // Mix covers loading (waiting), empty (nothing here), and error (broken).
    { level: "mild",     text: "একটু wait করো, চা গরম হচ্ছে…" },
    { level: "mild",     text: "এখনো কিছু নাই — Pinky-র DP-র মতো। পরে check কইরো।" },
    { level: "mild",     text: "Loading… ঢাকার traffic-এর মতো ধীরে।" },
    { level: "mild",     text: "একটু সময় দাও, রিকশা খুঁজতেছি।" },
    { level: "mild",     text: "এখানে কিছু নাই। চা খেয়ে আবার আসো।" },
    { level: "mild",     text: "একটু ঝামেলা হলো — আবার try করো।" },
    { level: "standard", text: "Bhai, internet-এ load shedding হইছে। চা খাও, আবার আসো।" },
    { level: "standard", text: "এখানে কিছু নাই। Pinky-র last seen এর মতো — খালি।" },
    { level: "standard", text: "Buffer হচ্ছে — Bogura থেইকা ঢাকা আসতে যেমন সময় লাগে।" },
    { level: "standard", text: "এই screen Pinky-র reply-র মতো — wait চলতেছে।" },
    { level: "standard", text: "ভাই, error হইছে। আমার career-র মতো — restart দিতে হবে।" },
    { level: "standard", text: "শূন্য। Mess-এর fridge-এর মতো — কিছু নাই, আশাও নাই।" },
    { level: "full",     text: "Bhai, এই button কাজ করতেছে না। আমার relationship-ও না। দুইটাই accept করতে হবে।" },
    { level: "full",     text: "Loading… Pinky-র feelings-এর মতো — কখন আসবে কেউ জানে না।" },
    { level: "full",     text: "Empty। আমার bKash-এর মতো। দেখলে লজ্জা লাগে।" },
    { level: "full",     text: "Error। ভাই, আজকে app-ও আমার সাথে breakup করলো।" },
  ],
};

/**
 * Convenience for system UI surfaces (loading / empty / error). Returns a
 * randomly picked line text for the chosen humor level, falling back to the
 * provided string if the pool somehow yields nothing (defensive — should not
 * happen because each level has at least one line).
 */
export function getSystemLine(level: HumorLevel, fallback: string): string {
  return getHumorLine("system", level)?.text ?? fallback;
}

/**
 * Pick a random humor line for a category, respecting the user's level.
 * Returns null if no line is available at the chosen level (defensive).
 */
export function getHumorLine(category: HumorCategory, level: HumorLevel): HumorLine | null {
  const pool = POOL[category].filter((l) => lineAllowedAtLevel(l.level, level));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Pick a random tagline at or below the user's level. */
export function getTaglinesForLevel(level: HumorLevel): HumorLine[] {
  return TAGLINES.filter((l) => lineAllowedAtLevel(l.level, level));
}

/** Total counts for the album / debug surfaces. */
export const HUMOR_LINE_TOTAL =
  Object.values(POOL).reduce((sum, arr) => sum + arr.length, 0) + TAGLINES.length;
