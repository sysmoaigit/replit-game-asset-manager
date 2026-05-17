import { Choice, Flags, GameCard, GameState, ReactionSubKind, SelimReaction, Stats } from "../types";

const EXCUSES: string[] = [
  "ভাই, তুই বুঝবি না। ও অন্য রকম।",
  "Pinky আমার উপর depend করে।",
  "এটা love না, এটা responsibility।",
  "ও আমাকে special বলেছে। Special-দের responsibility থাকে।",
  "Recharge দিয়ে love কেনা যায় না, but care prove করা যায়।",
  "টাকা আবার আসবে, কিন্তু Pinky-র smile?",
  "ও reply কম দেয়, কারণ ও mature।",
  "ও seen করেছে মানে দেখেছে। দেখা মানে care।",
  "ও busy, তাই dry reply।",
  "আমি use হচ্ছি না, আমি supportive।",
  "Pinky বলসে maybe। Maybe মানে hope আছে।",
  "একদিন ও বুঝবে।",
  "আমি যদি না থাকি, ও কে থাকবে?",
  "ভাই, আজকে only last recharge।",
  "আর দিবো না, promise।",
  "ও আমার priority। আমি ওর optional হলেও problem নাই।",
  "First love-এ logic চলে না।",
  "এই বার সিরিয়াস। আগেরগুলা ছিলো confusion।",
  "Pinky-র 'hmm'-এর মধ্যে emotion আছে।",
  "তুই single বলে বুঝবি না।",
  "Pinky low feel করতেসে। Career wait করতে পারবে।",
  "Boundary দিয়ে কি love হয়?",
  "আমি ওর problem solve করলে একদিন ও বুঝবে।",
  "Friendzone হলো pre-marriage stage।",
  "Hmm-এর মধ্যে emotion আছে।",
  // Touba countdown specials
  "আজকের Touba আগামীকাল থেকে count করবো। আজকেটা grace period।",
  "Touba ভাঙলেও আত্মা টিকে আছে। এইটাই spiritual progress।",
  "ও 'okay' লিখেছে। Okay মানে আশা আছে। Hope নিয়ে বাঁচি।",
  "এই recharge-টা investment। ROI আসবে। Trust the process।",
  "আমি calculated risk নিচ্ছি। Startup founder-রাও এটা করে।",
  "আমার love একদিন PhD thesis হবে: 'Pinky Effect এবং Taka Loop'।",
  // Fake girl / online romance
  "ভাই, online-এ যা দেখায় সবটা মিথ্যা না।",
  "Profile pic তো real মানুষেরও থাকে।",
  "ও গরিব বলে photo নেই। Shy মানুষ camera এড়ায়।",
  // Money ask self-justification  
  "রাফিকের কাছে নিলে কী হয়? বন্ধু থেকে নেওয়াই তো natural।",
  "আমি শোধ করবোই। এটা loan, ভিক্ষা না।",
  "ভাই, circumstances। যে দিনটা গেলে টাকাটা গেলো।",
];

const RELAPSE_EXCUSES: string[] = [
  "ভাই, আমি promise করসিলাম, but eita different।",
  "Promise ছিলো কালকের জন্য, আজকের জন্য না।",
  "এই last time, এর পর সত্যি Touba।",
  "Bhai, eita exception। Pinky না, eita তো অন্য।",
  "Promise ভাঙ্গসি, but logic-টা আলাদা।",
  // Touba Timer countdown comedy
  "Touba timer ছিলো ৩ দিন। আজকে day ০। So technically এখনো শুরু হয়নি।",
  "Official Touba start করবো সোমবার। আজকে শুক্রবার, so weekend-টা free।",
  "আমার Touba app crash করেছে। Data loss হয়েছে।",
  "এটা Touba না, এটা controlled experiment।",
  "Pinky-র message পড়ে Touba cancel হয়ে গেছে। Force majeure।",
  "ভাই, আমি ভাঙ্গিনি। Touba-র definition আমার আলাদা ছিলো।",
];

const OBEY_LABELS = [
  "Selim Obeyed ✅",
  "Self Respect Won 🛡️",
  "Friend Advice Followed 🤝",
  "Boundary Loaded ✓",
];

const OBEY_PREFIX = [
  "ঠিক আছে ভাই। আজকে নিজেকে respect দিলাম।",
  "তুই ঠিক বলছিস। মাথা পরিষ্কার লাগছে।",
  "Bhai, thanks। এই reminder লাগতেছিল।",
  "OK, তোর কথাই শুনি আজকে।",
];

const PROMISE_MADE_PREFIX = [
  "ঠিক আছে ভাই — Touba। আর কোনো recharge না।",
  "Promise — Pinky chapter আজকে close।",
  "শোন, আজ থেকে career first, dear after।",
  "Bhai, আজকে থেকে last seen check করবো না।",
];

const BEST_FRIEND_PREFIX = [
  "ভাই, তুই না থাকলে আমি আজ আরো নষ্ট হইতাম।",
  "তোর জিত আমার জিত। এই জন্যই তুই আমার best friend।",
  "Pinky reply না দিলেও তুই reply দিস। এইটাই আসলে friendship।",
  "তুই আমার উপর রাগ করিস, কিন্তু ছেড়ে যাস না।",
];

const PROMISE_BROKEN_LABELS = [
  "Promise Broken 💔",
  "Touba Cancelled 🙃",
  "Recharge Reflex Returned 📲",
];

const SILENT_LABELS = [
  "Silent Mode 🤐",
  "Selim Stopped Talking ...",
  "Mood Offline 😶",
];

const DEFENSIVE_LABELS = [
  "Defensive Mode 😤",
  "Selim Snapped Back 🗯️",
  "তুই বুঝবি না 🙅",
];

const BEST_FRIEND_LABELS = [
  "Best Friend Moment 🤗",
  "Yeh Dosti Vibe 💛",
  "Trust Locked In 🔒",
];

const HALF_LABELS = [
  "Selim Half-Listened 🤷",
  "Negotiation Mode 🗣️",
  "Boundary Loading... ⏳",
  "Compromise Activated 🤝",
];

const OVERRIDE_LABELS = [
  "Selim Emotional Override 💔",
  "Pinky Effect Activated 💖",
  "First Love Brain Damage 🧠💥",
  "Recharge Reflex 📲",
  "Boundary Loading Failed ❌",
  "Friend Advice Rejected 🙉",
  "Delusion Critical ⚠️",
  "Tui Bujhbi Na Mode 🚫",
  "Hmm Theory Activated 💭",
];

const RELATIONSHIP_SPEAKERS = new Set([
  "পিঙ্কি", "Pinky", "মিম", "টানিয়া", "রুমি", "নিলা", "তিশা", "মিতু", "রুপা", "জান্নাত", "সালমা", "ফারজানা",
  "Random Crush", "র‍্যান্ডম ক্রাশ",
]);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isRelationshipCard(card: GameCard): boolean {
  if (card.category === "love" || card.category === "crush") return true;
  if (card.speaker && RELATIONSHIP_SPEAKERS.has(card.speaker)) return true;
  return false;
}

function isPinkyCard(card: GameCard): boolean {
  return card.speaker === "পিঙ্কি" || card.id.startsWith("pinky_");
}

function isRechargeCard(card: GameCard): boolean {
  return /recharge|gift|food|emergency|borrow|lift|treat|data/i.test(card.id);
}

export function computeObeyChance(state: GameState, card: GameCard, choice: Choice): number {
  const s = state.stats;
  const f = state.flags;
  let chance = 35;

  // Positive factors
  chance += s.iq / 4;
  chance += s.selfRespect / 3;
  chance += s.friendTrust / 3;
  chance += s.careerProgress / 5;
  chance += s.mood / 10;

  // Negative factors
  chance -= s.pinkyHope / 4;
  chance -= s.emotionalDelusion / 3;
  chance -= s.romanticFever / 4;
  chance -= s.loneliness / 5;
  chance -= s.temptation / 5;
  chance -= s.attachmentLevel / 4;

  // Card / phase modifiers
  if (card.phase === "Night") chance -= 10;
  if (isPinkyCard(card)) chance -= 15;
  if (isRechargeCard(card)) chance -= 10;
  if (s.mood < 25) chance -= 15;
  if (s.selfRespect < 20) chance -= 20;

  // Choice style modifiers
  if (choice.kind === "smart" && s.selfRespect > 60) chance += 15;
  if (choice.kind === "avoid" && f.promiseModeTurnsLeft > 0) chance += 20;
  if (s.friendTrust > 70) chance += 10;
  if (s.friendTrust < 40 && choice.kind === "avoid") chance -= 15;
  if (choice.kind === "later" && s.mood < 30) chance += 10;

  // Promise mode boost (post-rejection Selim listens more)
  if (f.promiseModeTurnsLeft > 0) chance += 15;

  return Math.max(10, Math.min(90, chance));
}

function blendEffects(safe: Partial<Stats>, reckless: Partial<Stats>, recklessRatio: number): Partial<Stats> {
  const out: Record<string, number> = {};
  const allKeys = new Set<string>([...Object.keys(safe), ...Object.keys(reckless)]);
  for (const k of allKeys) {
    const a = (safe as Record<string, number>)[k] ?? 0;
    const b = (reckless as Record<string, number>)[k] ?? 0;
    out[k] = Math.round(a * (1 - recklessRatio) + b * recklessRatio);
  }
  return out as Partial<Stats>;
}

function blendFlagsUpdate(safe: Partial<Flags> | undefined, reckless: Partial<Flags> | undefined, recklessRatio: number): Partial<Flags> {
  const a = safe ?? {};
  const b = reckless ?? {};
  const out: Record<string, number | boolean | number[]> = {};
  const allKeys = new Set<string>([...Object.keys(a), ...Object.keys(b)]);
  for (const k of allKeys) {
    const av = (a as Record<string, unknown>)[k];
    const bv = (b as Record<string, unknown>)[k];
    if (typeof av === "number" || typeof bv === "number") {
      const an = typeof av === "number" ? av : 0;
      const bn = typeof bv === "number" ? bv : 0;
      out[k] = Math.round(an * (1 - recklessRatio) + bn * recklessRatio);
    } else if (av !== undefined || bv !== undefined) {
      out[k] = (bv ?? av) as boolean;
    }
  }
  return out as Partial<Flags>;
}

function computeSubKind(
  kind: "obey" | "half" | "override",
  state: GameState,
  card: GameCard,
  choice: Choice,
): SelimReaction["subKind"] {
  const isRechargeCard = /recharge/i.test(card.id);
  const fu = choice.flagUpdate as Record<string, number | boolean | undefined> | undefined;

  if (kind === "override") {
    // Relapse: override on recharge after completing recovery
    if (isRechargeCard && state.flags.recoverySuccess) return "relapse";
    // Promise broken: override on recharge card when Selim had previously promised
    if (isRechargeCard && state.flags.promisesMade > 0) return "promise_broken";
    return "normal";
  }

  if (kind === "obey") {
    // Promise made: choice sets promisesMade flag
    if (fu?.promisesMade) return "promise_made";
    // Silent obey: very low mood, Selim doesn't argue
    if (state.stats.mood < 20) return "silent";
    // Best friend moment: high friendTrust
    if (state.stats.friendTrust > 75) return "best_friend";
    return "normal";
  }

  if (kind === "half") {
    // Defensive half-obey: Selim is deep in delusion
    if (state.stats.emotionalDelusion > 65) return "defensive";
    return "normal";
  }

  return "normal";
}

export function resolveSelimReaction(state: GameState, card: GameCard, choice: Choice): SelimReaction {
  const isRel = isRelationshipCard(card);
  const playerSaidRestraint = choice.kind === "avoid" || choice.kind === "smart";
  const recklessChoice = card.choices.find((c) => c.kind === "do");
  const obeyChance = computeObeyChance(state, card, choice);
  const inPromiseMode = state.flags.promiseModeTurnsLeft > 0;
  const wasRecharge = isRechargeCard(card);

  // No override path: not a relationship card, OR player chose the reckless option, OR no reckless alt exists
  if (!isRel || !playerSaidRestraint || !recklessChoice || recklessChoice === choice) {
    // Best Friend Moment: high trust + obey path
    if (state.stats.friendTrust >= 75 && choice.kind !== "do") {
      return {
        kind: "obey",
        subKind: "best_friend",
        label: pick(BEST_FRIEND_LABELS),
        excuse: pick(BEST_FRIEND_PREFIX),
        outcomeText: choice.resultText,
        appliedEffects: { ...choice.effects, friendTrust: (choice.effects.friendTrust ?? 0) + 3, loneliness: (choice.effects.loneliness ?? 0) - 5 },
        appliedFlagUpdate: { ...(choice.flagUpdate ?? {}), playerAdviceFollowed: 1, bestFriendMoments: 1 },
        obeyChancePercent: 100,
      };
    }
    const sk = computeSubKind("obey", state, card, choice);
    return {
      kind: "obey",
      subKind: sk,
      label: pick(OBEY_LABELS),
      excuse: null,
      outcomeText: choice.resultText,
      appliedEffects: { ...choice.effects, friendTrust: (choice.effects.friendTrust ?? 0) + 1 },
      appliedFlagUpdate: { ...(choice.flagUpdate ?? {}), playerAdviceFollowed: 1 },
      obeyChancePercent: 100,
    };
  }

  const roll = Math.random() * 100;

  // FULL OBEY
  if (roll < obeyChance) {
    let subKind: ReactionSubKind = "normal";
    let label = pick(OBEY_LABELS);
    let excuse = pick(OBEY_PREFIX);
    const flagUpdate: Partial<Flags> = {
      ...(choice.flagUpdate ?? {}),
      playerAdviceFollowed: 1,
      pinkyBoundaryWins: isPinkyCard(card) ? 1 : 0,
    };

    // Best Friend Moment trigger
    if (state.stats.friendTrust >= 75) {
      subKind = "best_friend";
      label = pick(BEST_FRIEND_LABELS);
      excuse = pick(BEST_FRIEND_PREFIX);
      flagUpdate.bestFriendMoments = 1;
    }
    // Promise Made trigger (recharge avoid → Selim makes a Touba promise)
    else if (wasRecharge && isPinkyCard(card)) {
      subKind = "promise_made";
      label = "Promise Made 🤝";
      excuse = pick(PROMISE_MADE_PREFIX);
      flagUpdate.promisesMade = 1;
      flagUpdate.promiseModeTurnsLeft = 3;
    }

    return {
      kind: "obey",
      subKind,
      label,
      excuse,
      outcomeText: choice.resultText,
      appliedEffects: {
        ...choice.effects,
        friendTrust: (choice.effects.friendTrust ?? 0) + 4,
        selfRespect: (choice.effects.selfRespect ?? 0) + 3,
        emotionalDelusion: (choice.effects.emotionalDelusion ?? 0) - 4,
        romanticFever: (choice.effects.romanticFever ?? 0) - (subKind === "promise_made" ? 10 : 3),
        loneliness: (choice.effects.loneliness ?? 0) - (subKind === "best_friend" ? 5 : 2),
      },
      appliedFlagUpdate: flagUpdate,
      obeyChancePercent: Math.round(obeyChance),
    };
  }

  // HALF OBEY
  if (roll < obeyChance + 25) {
    const blended = blendEffects(choice.effects, recklessChoice.effects, 0.4);
    const blendedFlags = blendFlagsUpdate(choice.flagUpdate, recklessChoice.flagUpdate, 0.4);
    const excuse = pick(EXCUSES);
    const sk = computeSubKind("half", state, card, choice);
    return {
      kind: "half",
      subKind: sk,
      label: pick(HALF_LABELS),
      excuse: pick(EXCUSES),
      outcomeText: `Selim partly listened — কিছু দিল, কিছু রাখলো। মাঝামাঝি compromise।`,
      appliedEffects: {
        ...blended,
        friendTrust: 0,
        emotionalDelusion: 2,
        attachmentLevel: 2,
        romanticFever: 1,
      },
      appliedFlagUpdate: { ...blendedFlags, halfObeys: 1 },
      obeyChancePercent: Math.round(obeyChance),
    };
  }

  // EMOTIONAL OVERRIDE — Selim does the reckless thing anyway
  let subKind: ReactionSubKind = "normal";
  let label = pick(OVERRIDE_LABELS);
  let excuse = pick(EXCUSES);

  // Sub-variants
  if (inPromiseMode) {
    subKind = "relapse";
    label = pick(PROMISE_BROKEN_LABELS);
    excuse = pick(RELAPSE_EXCUSES);
  } else if (state.stats.mood < 25 && state.stats.friendTrust < 35) {
    subKind = "silent";
    label = pick(SILENT_LABELS);
    excuse = "...";
  } else if (state.stats.friendTrust < 35) {
    subKind = "defensive";
    label = pick(DEFENSIVE_LABELS);
    excuse = "তুই বুঝবি না। আমি যা করি, ভেবে চিন্তে করি।";
  } else if (wasRecharge && state.flags.promisesMade > 0) {
    subKind = "promise_broken";
    label = pick(PROMISE_BROKEN_LABELS);
    excuse = pick(RELAPSE_EXCUSES);
  }

  const overrideFlagUpdate: Partial<Flags> = {
    ...(recklessChoice.flagUpdate ?? {}),
    emotionalOverrides: 1,
    playerAdviceIgnored: 1,
    rechargePromisesBroken: wasRecharge ? 1 : 0,
  };
  if (subKind === "silent") overrideFlagUpdate.silentMoments = 1;
  if (subKind === "defensive") overrideFlagUpdate.defensiveMoments = 1;
  if (subKind === "promise_broken" || subKind === "relapse") {
    overrideFlagUpdate.brokenPromiseCount = 1;
    overrideFlagUpdate.promiseModeTurnsLeft = 0;
  }

  return {
    kind: "override",
    subKind,
    label,
    excuse,
    outcomeText: recklessChoice.resultText,
    appliedEffects: {
      ...recklessChoice.effects,
      friendTrust: (recklessChoice.effects.friendTrust ?? 0) - (subKind === "defensive" ? 8 : 5),
      emotionalDelusion: (recklessChoice.effects.emotionalDelusion ?? 0) + 8,
      attachmentLevel: (recklessChoice.effects.attachmentLevel ?? 0) + (isPinkyCard(card) ? 6 : 3),
      romanticFever: (recklessChoice.effects.romanticFever ?? 0) + 5,
      loneliness: (recklessChoice.effects.loneliness ?? 0) + (subKind === "silent" ? 5 : 2),
    },
    appliedFlagUpdate: overrideFlagUpdate,
    obeyChancePercent: Math.round(obeyChance),
  };
}
