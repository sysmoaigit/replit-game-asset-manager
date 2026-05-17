import { Achievement, Flags, GameCard, GameState, Stats } from "../types";
import { ENDINGS } from "./endings";
import { rng } from "../lib/rng";

export const INITIAL_STATS: Stats = {
  health: 80, mood: 65, money: 1200,
  iq: 35, energy: 70, reputation: 45,
  addiction: 0, temptation: 25,
  selfRespect: 35, pinkyHope: 75, pinkyHappiness: 20, careerProgress: 10,
  friendTrust: 45, emotionalDelusion: 65, attachmentLevel: 30,
  loneliness: 45, romanticFever: 70,
};

export const INITIAL_FLAGS: Flags = {
  biryaniCount: 0, cigaretteCount: 0, noSmokeStreak: 0,
  healthyMealCount: 0, workCount: 0, scamAvoided: 0,
  rentPaid: 0, nilaTrust: 0, motherCallsAnswered: 0,
  recoveryTriggered: false, recoverySuccess: false,
  influencerPoints: 0, debtLevel: 0,
  daysWithoutDebt: 0, biryaniSkips: 0,
  heartbreakCount: 0, girlsTrustedAndBurned: 0,
  girlInvestment: 0, firstLoveCount: 0,
  pinkyRechargeCount: 0, pinkySeenCount: 0, pinkyBoundaryWins: 0,
  playerAdviceFollowed: 0, playerAdviceIgnored: 0,
  halfObeys: 0, emotionalOverrides: 0, rechargePromisesBroken: 0,
  promisesMade: 0, promisesKept: 0, brokenPromiseCount: 0,
  bestFriendMoments: 0, silentMoments: 0, defensiveMoments: 0,
  randomCrushes: 0, promiseModeTurnsLeft: 0,
  friendshipMilestonesShown: [],
  // Task 23 polish flags
  fakeGirlMessagesBelieved: 0,
  moneyAskedFromFriend: 0,
  liesTold: 0,
  liesCaught: 0,
  toubaStreakDays: 0,
  lastBrokenPromiseCount: 0,
  pharmacyVisited: 0,
  shortcutShame: 0,
  lifestyleProgress: 0,
  partnerHonesty: 0,
  tishaMet: 0,
  tishaTrust: 0,
  tishaIntimacy: 0,
  tishaFightCount: 0,
  tishaMakeupCount: 0,
  rooftopDatePlanned: 0,
  almostKissUnlocked: 0,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "no_means_no", name: "না মানে না", description: "সিগারেট ৫ বার প্রত্যাখ্যান", unlocked: false },
  { id: "rickshaw_negotiator", name: "রিকশা Negotiator", description: "৩ বার স্ক্যাম এড়িয়েছ", unlocked: false },
  { id: "mothers_call", name: "মায়ের ফোন ধরেছি", description: "মাকে ৩ বার ফোন ধরেছ", unlocked: false },
  { id: "budget_boss", name: "Budget Boss", description: "৫ দিন ঋণ ছাড়া টিকে আছ", unlocked: false },
  { id: "smart_selim", name: "Smart Selim", description: "IQ ৭০-এর উপরে", unlocked: false },
  { id: "comeback_king", name: "Comeback King", description: "Crisis থেকে ফিরে এসেছ", unlocked: false },
  { id: "biryani_survivor", name: "Biryani Survivor", description: "বিরিয়ানি ৩ বার এড়িয়েছ", unlocked: false },
  { id: "broken_hearted", name: "ভাঙ্গা হৃদয়ের সেলিম", description: "৩ বার ব্যবহৃত হয়েছ", unlocked: false },
  { id: "wise_after_pain", name: "কষ্ট থেকে শিক্ষা", description: "Heartbreak-এর পরও IQ ৬০+", unlocked: false },
  { id: "first_love_x10", name: "First Love 10th Edition", description: "১০ বার 'এই বার সিরিয়াস' বলেছ", unlocked: false },
  { id: "pinky_subscription", name: "Pinky Premium Subscriber", description: "পিঙ্কিকে ৫ বার রিচার্জ দিয়েছ", unlocked: false },
  { id: "pinky_unsubscribed", name: "Pinky Unsubscribed", description: "পিঙ্কিকে ৩ বার না বলেছ", unlocked: false },
  { id: "self_respect_reborn", name: "Self Respect Reborn", description: "Self Respect ৭৫+", unlocked: false },
  { id: "career_builder", name: "Career Builder", description: "Career Progress ৬০+", unlocked: false },
  { id: "boundary_boss", name: "Boundary Boss", description: "Self Respect ৬০+ এবং Girl Investment ৫০০ এর কম", unlocked: false },
  { id: "advice_ignored_10", name: "Advice Ignored 10 Times", description: "সেলিম তোমার কথা ১০ বার শোনেনি", unlocked: false },
  { id: "tui_bujhbi_na", name: "ভাই তুই বুঝবি না", description: "৫ বার Emotional Override", unlocked: false },
  { id: "last_recharge_pro_max", name: "Last Recharge Pro Max", description: "৩ বার 'last recharge' promise breaking", unlocked: false },
  { id: "hmm_researcher", name: "Hmm Researcher", description: "Delusion ৮০+ পৌঁছেছে", unlocked: false },
  { id: "boundary_works", name: "Boundary Actually Worked", description: "৫ বার তোমার boundary advice মেনেছ", unlocked: false },
  { id: "best_friend_mode", name: "Best Friend Mode 🤝", description: "Friend Trust ৮৫+", unlocked: false },
  { id: "promise_broken_again", name: "Promise Broken Again 💔", description: "৫ বার promise ভেঙেছে", unlocked: false },
  { id: "bogura_boss", name: "Bogura Boss 👑", description: "Career ৭৫+ এবং Self Respect ৭০+", unlocked: false },
  { id: "friendship_saved_him", name: "Friendship Saved Him 🌟", description: "১০টি Best Friend Moment", unlocked: false },
  { id: "first_love_factory_reset", name: "First Love Factory Reset 🔄", description: "৫ জন random crush", unlocked: false },
  { id: "love_finished_7_minutes", name: "Love Finished For 7 Minutes ⏱️", description: "Promise mode trigger হয়েছে", unlocked: false },
  { id: "recharge_reflex", name: "Recharge Reflex 💸", description: "৩ বার Pinky-কে recharge পাঠিয়েছ", unlocked: false },
  { id: "money_hypocrisy_activated", name: "Bhai Taka Nai, Pinky Recharge Ache 🧾", description: "বন্ধুর কাছে taka নাই বলে Pinky-কে recharge", unlocked: false },
  { id: "lie_caught", name: "Lie Caught 🫣", description: "মিথ্যা ধরা পড়েছে", unlocked: false },
  { id: "romance_scammer_survivor", name: "Romance Scammer Survivor 🛡️", description: "Fake girl catfish ব্লক করেছ", unlocked: false },
  { id: "honest_selim", name: "Honest Selim 🤍", description: "ধরা পড়ে রফিকের কাছে সত্যি বলেছ", unlocked: false },
  { id: "touba_champion", name: "Touba Champion 🕊️", description: "৬ দিন তওবা ভাঙ্গনি", unlocked: false },
];

const SAVE_KEY = "selim_dhaka_save";

export function clampStats(stats: Stats): Stats {
  const c = (v: number) => Math.max(0, Math.min(100, v));
  return {
    health: c(stats.health),
    mood: c(stats.mood),
    money: stats.money,
    iq: c(stats.iq),
    energy: c(stats.energy),
    reputation: c(stats.reputation),
    addiction: c(stats.addiction),
    temptation: c(stats.temptation),
    selfRespect: c(stats.selfRespect),
    pinkyHope: c(stats.pinkyHope),
    pinkyHappiness: c(stats.pinkyHappiness),
    careerProgress: c(stats.careerProgress),
    friendTrust: c(stats.friendTrust),
    emotionalDelusion: c(stats.emotionalDelusion),
    attachmentLevel: c(stats.attachmentLevel),
    loneliness: c(stats.loneliness),
    romanticFever: c(stats.romanticFever),
  };
}

export function applyEffectsToStats(stats: Stats, effects: Partial<Stats>): Stats {
  return clampStats({
    health: stats.health + (effects.health ?? 0),
    mood: stats.mood + (effects.mood ?? 0),
    money: stats.money + (effects.money ?? 0),
    iq: stats.iq + (effects.iq ?? 0),
    energy: stats.energy + (effects.energy ?? 0),
    reputation: stats.reputation + (effects.reputation ?? 0),
    addiction: stats.addiction + (effects.addiction ?? 0),
    temptation: stats.temptation + (effects.temptation ?? 0),
    selfRespect: stats.selfRespect + (effects.selfRespect ?? 0),
    pinkyHope: stats.pinkyHope + (effects.pinkyHope ?? 0),
    pinkyHappiness: stats.pinkyHappiness + (effects.pinkyHappiness ?? 0),
    careerProgress: stats.careerProgress + (effects.careerProgress ?? 0),
    friendTrust: stats.friendTrust + (effects.friendTrust ?? 0),
    emotionalDelusion: stats.emotionalDelusion + (effects.emotionalDelusion ?? 0),
    attachmentLevel: stats.attachmentLevel + (effects.attachmentLevel ?? 0),
    loneliness: stats.loneliness + (effects.loneliness ?? 0),
    romanticFever: stats.romanticFever + (effects.romanticFever ?? 0),
  });
}

export function applyFlagUpdate(flags: Flags, update: Partial<Flags>): Flags {
  const result = { ...flags };
  for (const key in update) {
    const k = key as keyof Flags;
    const val = update[k];
    if (val === undefined) continue;
    const current = result[k];
    if (Array.isArray(current) && Array.isArray(val)) {
      (result as Record<string, unknown>)[k] = [...current, ...val];
    } else if (typeof current === "number" && typeof val === "number") {
      (result as Record<string, unknown>)[k] = current + val;
    } else {
      (result as Record<string, unknown>)[k] = val;
    }
  }
  return result;
}

export function selectCard(state: GameState, allCards: GameCard[]): GameCard {
  const phases = ["Morning", "Noon", "Evening", "Night"];
  const currentPhase = phases[state.phaseIndex] as "Morning" | "Noon" | "Evening" | "Night";

  const recent8 = state.recentCards.slice(-8);

  const available = allCards.filter((card) => {
    if (recent8.includes(card.id)) return false;
    if (card.category === "recovery") return false;
    if (card.tags?.includes("final") && state.day < 13) return false;
    if (card.phase && card.phase !== currentPhase) return false;
    if (card.condition && !card.condition(state)) return false;
    return true;
  });

  const pool = available.length > 0 ? available : allCards.filter(
    (c) => c.category !== "recovery" && (!c.condition || c.condition(state))
  );

  const weights = pool.map((card) => {
    let w = card.weight ?? 10;
    if (state.stats.temptation > 70 && (card.category === "addiction" || card.tags?.includes("temptation"))) {
      w = Math.floor(w * 2);
    }
    if (state.day >= 13 && card.tags?.includes("final")) {
      w = Math.floor(w * 3);
    }
    if (state.stats.money < 0 && card.tags?.includes("debt")) {
      w = Math.floor(w * 2);
    }
    if (state.stats.romanticFever > 70 && card.tags?.includes("crush")) {
      w = Math.floor(w * 2);
    }
    if (state.stats.friendTrust > 70 && card.tags?.includes("bestfriend")) {
      w = Math.floor(w * 2);
    }
    return w;
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let rand = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return pool[i];
  }
  return pool[pool.length - 1] ?? allCards[0];
}

export function selectRecoveryCard(allCards: GameCard[], recentCards: string[]): GameCard {
  const rec = allCards.filter((c) => c.category === "recovery" && !recentCards.includes(c.id));
  if (rec.length === 0) {
    const all = allCards.filter((c) => c.category === "recovery");
    return all[Math.floor(rng() * all.length)] ?? allCards[0];
  }
  return rec[Math.floor(rng() * rec.length)];
}

export function checkDangerConditions(state: GameState): {
  triggerRecovery: boolean;
  moodSpiralTemptation: number;
} {
  let triggerRecovery = false;
  let moodSpiralTemptation = 0;
  if ((state.stats.health < 25 && state.stats.addiction > 50) || state.stats.addiction >= 100) {
    triggerRecovery = true;
  }
  if (state.stats.mood < 20) {
    moodSpiralTemptation = 10;
  }
  return { triggerRecovery, moodSpiralTemptation };
}

export function evaluateEnding(state: GameState): string {
  for (const ending of ENDINGS) {
    if (ending.condition(state)) return ending.id;
  }
  return "lost_selim";
}

export function checkAchievements(state: GameState): { achievements: Achievement[]; newIds: string[] } {
  const newIds: string[] = [];
  const achievements = state.achievements.map((a) => {
    if (a.unlocked) return a;
    let unlocked = false;
    switch (a.id) {
      case "no_means_no": unlocked = state.flags.noSmokeStreak >= 5; break;
      case "rickshaw_negotiator": unlocked = state.flags.scamAvoided >= 3; break;
      case "mothers_call": unlocked = state.flags.motherCallsAnswered >= 3; break;
      case "budget_boss": unlocked = state.flags.daysWithoutDebt >= 5; break;
      case "smart_selim": unlocked = state.stats.iq >= 70; break;
      case "comeback_king": unlocked = state.flags.recoverySuccess; break;
      case "biryani_survivor": unlocked = state.flags.biryaniSkips >= 3; break;
      case "broken_hearted": unlocked = state.flags.girlsTrustedAndBurned >= 3; break;
      case "wise_after_pain": unlocked = state.flags.heartbreakCount >= 2 && state.stats.iq >= 60; break;
      case "first_love_x10": unlocked = state.flags.firstLoveCount >= 10; break;
      case "pinky_subscription": unlocked = state.flags.pinkyRechargeCount >= 5; break;
      case "pinky_unsubscribed": unlocked = state.flags.pinkyBoundaryWins >= 3; break;
      case "self_respect_reborn": unlocked = state.stats.selfRespect >= 75; break;
      case "career_builder": unlocked = state.stats.careerProgress >= 60; break;
      case "boundary_boss": unlocked = state.stats.selfRespect >= 60 && state.flags.girlInvestment < 500; break;
      case "advice_ignored_10": unlocked = state.flags.playerAdviceIgnored >= 10; break;
      case "tui_bujhbi_na": unlocked = state.flags.emotionalOverrides >= 5; break;
      case "last_recharge_pro_max": unlocked = state.flags.rechargePromisesBroken >= 3; break;
      case "hmm_researcher": unlocked = state.stats.emotionalDelusion >= 80; break;
      case "boundary_works": unlocked = state.flags.pinkyBoundaryWins >= 5; break;
      case "best_friend_mode": unlocked = state.stats.friendTrust >= 85; break;
      case "promise_broken_again": unlocked = state.flags.brokenPromiseCount >= 5; break;
      case "bogura_boss": unlocked = state.stats.careerProgress >= 75 && state.stats.selfRespect >= 70; break;
      case "friendship_saved_him": unlocked = state.flags.bestFriendMoments >= 10; break;
      case "first_love_factory_reset": unlocked = state.flags.randomCrushes >= 5; break;
      case "love_finished_7_minutes": unlocked = state.flags.promisesMade >= 1; break;
      case "recharge_reflex": unlocked = state.flags.pinkyRechargeCount >= 3; break;
      case "money_hypocrisy_activated": unlocked = state.flags.moneyAskedFromFriend >= 1 && state.flags.pinkyRechargeCount >= 1; break;
      case "lie_caught": unlocked = state.flags.liesCaught >= 1; break;
      case "romance_scammer_survivor":
        unlocked = state.flags.fakeGirlMessagesBelieved >= 1 && state.flags.scamAvoided >= 1;
        break;
      case "honest_selim":
        unlocked = state.flags.liesCaught >= 1 && state.flags.bestFriendMoments >= 1 && state.stats.friendTrust >= 70;
        break;
      case "touba_champion":
        unlocked = state.flags.pinkyBoundaryWins >= 4 && state.flags.toubaStreakDays >= 6;
        break;
    }
    if (unlocked) newIds.push(a.id);
    return unlocked ? { ...a, unlocked: true } : a;
  });
  return { achievements, newIds };
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    // Backfill new fields for older saves
    if (parsed.stats) {
      const s = parsed.stats as Partial<Stats>;
      if (s.loneliness === undefined) s.loneliness = 45;
      if (s.romanticFever === undefined) s.romanticFever = 70;
    }
    if (parsed.flags) {
      const f = parsed.flags as Partial<Flags>;
      if (f.promisesMade === undefined) f.promisesMade = 0;
      if (f.promisesKept === undefined) f.promisesKept = 0;
      if (f.brokenPromiseCount === undefined) f.brokenPromiseCount = 0;
      if (f.bestFriendMoments === undefined) f.bestFriendMoments = 0;
      if (f.silentMoments === undefined) f.silentMoments = 0;
      if (f.defensiveMoments === undefined) f.defensiveMoments = 0;
      if (f.randomCrushes === undefined) f.randomCrushes = 0;
      if (f.promiseModeTurnsLeft === undefined) f.promiseModeTurnsLeft = 0;
      if (f.friendshipMilestonesShown === undefined) f.friendshipMilestonesShown = [];
      if (f.fakeGirlMessagesBelieved === undefined) f.fakeGirlMessagesBelieved = 0;
      if (f.moneyAskedFromFriend === undefined) f.moneyAskedFromFriend = 0;
      if (f.liesTold === undefined) f.liesTold = 0;
      if (f.liesCaught === undefined) f.liesCaught = 0;
      if (f.toubaStreakDays === undefined) f.toubaStreakDays = 0;
      if (f.lastBrokenPromiseCount === undefined) f.lastBrokenPromiseCount = f.brokenPromiseCount ?? 0;
    }
    // Merge in any achievements added since the save was made (by id)
    if (Array.isArray(parsed.achievements)) {
      const savedById = new Map(parsed.achievements.map((a) => [a.id, a]));
      parsed.achievements = INITIAL_ACHIEVEMENTS.map((init) => savedById.get(init.id) ?? init);
    }
    return parsed as GameState;
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return !!localStorage.getItem(SAVE_KEY);
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

// ── FRIENDSHIP MILESTONE DETECTOR ─────────────────────────────────────────────
// Returns the milestone level just crossed (25/50/75/90), or null.
export function detectFriendshipMilestone(prevTrust: number, newTrust: number, alreadyShown: number[]): number | null {
  const levels = [25, 50, 75, 90];
  for (const lvl of levels) {
    if (prevTrust < lvl && newTrust >= lvl && !alreadyShown.includes(lvl)) {
      return lvl;
    }
  }
  return null;
}
