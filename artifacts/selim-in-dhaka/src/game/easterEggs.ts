/**
 * Easter egg system for Selim in Dhaka.
 *
 * Each egg is a hidden trigger that the player can stumble into. Unlocks
 * are persisted in localStorage and surfaced in the Selim Album under the
 * "Easter Eggs" tab. Locked eggs only show their hint, never the payoff.
 *
 * Triggers fire from the rest of the app (StartScreen tap counter,
 * App.tsx time-of-day check, etc.) by calling tryUnlockEgg(id).
 */

export type EasterEggId =
  | "tap_selim_7"
  | "tap_selim_30"
  | "name_pinky"
  | "name_selim"
  | "play_at_3am"
  | "play_at_dawn"
  | "broke_and_lonely"
  | "perfect_pinky"
  | "rich_and_sad"
  | "bogura_master"
  | "first_album_visit"
  | "humor_full_bogura";

export type EasterEgg = {
  id: EasterEggId;
  name: string;
  hint: string;            // shown when locked — vague clue
  reveal: string;          // shown when unlocked — the payoff one-liner
  rarity: "common" | "rare" | "legendary";
};

export const EASTER_EGGS: EasterEgg[] = [
  {
    id: "tap_selim_7",
    name: "Massage Bhai",
    hint: "Selim-কে বার বার touch করলে কিছু হয়?",
    reveal: "ভাই, ৭ বার tap করলা — Cha Mama-র massage parlor খুলবা নাকি?",
    rarity: "common",
  },
  {
    id: "tap_selim_30",
    name: "Tap Addict",
    hint: "Tap, tap, tap… কতো tap পর্যন্ত যাবে?",
    reveal: "৩০ বার! ভাই, Pinky-ও এতো বার dial করি না। তুমি OK তো?",
    rarity: "rare",
  },
  {
    id: "name_pinky",
    name: "Identity Crisis",
    hint: "নিজের নাম কী রাখলে Selim চমকে যাবে?",
    reveal: "ভাই, তোমার নাম Pinky? এই গল্পে এটা serious plot twist।",
    rarity: "rare",
  },
  {
    id: "name_selim",
    name: "Mirror Match",
    hint: "নিজের নাম protagonist-এর মতো রাখলে কিছু হয়?",
    reveal: "Selim talking to Selim। ভাই, এটা therapy-র চেয়েও সস্তা।",
    rarity: "common",
  },
  {
    id: "play_at_3am",
    name: "Insomnia Club",
    hint: "ঘুম না আসলে কখন খেলা হয়?",
    reveal: "রাত ৩টা। ভাই, Pinky-ও এই সময় ঘুমাচ্ছে। তুমি কী করতেছো?",
    rarity: "rare",
  },
  {
    id: "play_at_dawn",
    name: "Fajr Selim",
    hint: "সবার আগে কে উঠে?",
    reveal: "ভোর ৫টায় গেম? ভাই, Bogura-র মা proud হবে। অথবা confused।",
    rarity: "common",
  },
  {
    id: "broke_and_lonely",
    name: "Rock Bottom",
    hint: "টাকাও নাই, mood-ও নাই — তবু game চালু?",
    reveal: "ভাই, এই combo-তে Cha Mama infinite credit দেয়। গোপন rule।",
    rarity: "rare",
  },
  {
    id: "perfect_pinky",
    name: "Pinky-r Pet",
    hint: "Pinky-কে ১০০% খুশি রাখলে?",
    reveal: "Pinky 100/100। ভাই, congratulations — তুমি এখন officially একটা ATM।",
    rarity: "legendary",
  },
  {
    id: "rich_and_sad",
    name: "Dhaka Rich",
    hint: "টাকা আছে, মন নাই — কী হয়?",
    reveal: "Bank balance high, mood zero। ভাই, এটাকেই উন্নয়ন বলে।",
    rarity: "rare",
  },
  {
    id: "bogura_master",
    name: "Full Bogura",
    hint: "সবচেয়ে heavy accent চালু করলে?",
    reveal: "ভাই, এটাই আসল Selim। Dhaka-র polish removed। Bogura unlocked।",
    rarity: "common",
  },
  {
    id: "first_album_visit",
    name: "Curator",
    hint: "Album খুললে?",
    reveal: "ভাই, scrapbook দেখতে আসছো? Pinky-ও কখনো দেখে নাই।",
    rarity: "common",
  },
  {
    id: "humor_full_bogura",
    name: "Spice Lord",
    hint: "Humor slider সবচেয়ে spicy-তে নিলে?",
    reveal: "Full Bogura unlocked। সাবধান — এই level-এ আমি filter ছাড়া কথা বলি।",
    rarity: "common",
  },
];

const STORAGE_KEY = "selim_dhaka_easter_eggs_v1";

/** Load the unlocked-egg id set with hardened parsing. */
export function loadUnlockedEggs(): Set<EasterEggId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    const ids = arr.filter((x): x is EasterEggId =>
      typeof x === "string" && EASTER_EGGS.some((e) => e.id === x),
    );
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function persist(set: Set<EasterEggId>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

/**
 * Try to unlock an egg. Returns the egg if it was newly unlocked
 * (so the caller can show a toast), or null if it was already unlocked
 * or the id doesn't exist.
 */
export function tryUnlockEgg(id: EasterEggId): EasterEgg | null {
  const egg = EASTER_EGGS.find((e) => e.id === id);
  if (!egg) return null;
  const unlocked = loadUnlockedEggs();
  if (unlocked.has(id)) return null;
  unlocked.add(id);
  persist(unlocked);
  return egg;
}

export function isEggUnlocked(id: EasterEggId): boolean {
  return loadUnlockedEggs().has(id);
}

export const EGG_TOTAL = EASTER_EGGS.length;
