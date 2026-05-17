// Selim visual universe — central asset manifest + safe lookup helpers.
// All paths are absolute and served from /public/assets/selim/.

export const SELIM_ASSETS = {
  main: "/assets/selim/selim-anime-main.png",
  characterSheet: "/assets/selim/selim-character-sheet.png",
  rooftopSunset: "/assets/selim/selim-rooftop-sunset.png",
  pinkyEffectWalk: "/assets/selim/selim-city-walk-pinky-effect.png",
  rainyHeartbreak: "/assets/selim/selim-rainy-heartbreak.png",
  chaStallFriendTalk: "/assets/selim/selim-cha-stall-friend-talk.png",
  careerStruggle: "/assets/selim/selim-career-struggle.png",
  boguraBossRooftop: "/assets/selim/selim-bogura-boss-rooftop.png",
  rooftopSilhouette: "/assets/selim/selim-rooftop-silhouette.png",
  // Selim Life cinematic scenes (May 2026 drop)
  eatingBiryani: "/assets/selim-life/selim-eating-biryani.png",
  friendsCrushTeaStall: "/assets/selim-life/selim-friends-crush-tea-stall.png",
  dreamingPinkyRooftop: "/assets/selim-life/selim-dreaming-pinky-rooftop.png",
  busDaydreamCrush: "/assets/selim-life/selim-bus-daydream-crush.png",
  brokeRentProblem: "/assets/selim-life/selim-broke-rent-problem.png",
  campusDramaSlap: "/assets/selim-life/selim-campus-drama-slap.png",
  girlHappyHelp: "/assets/selim-life/selim-girl-happy-help.png",
  askingMoneyFriend: "/assets/selim-life/selim-asking-money-friend.png",
  workHustleMontage: "/assets/selim-life/selim-work-hustle-montage.png",
  lifeChaosDashboard: "/assets/selim-life/selim-life-chaos-dashboard.png",
  // Pharmacy "secret mission" — reuses asking-money-friend art (same
  // awkward-ask body language). Tasteful, fully-clothed, on-tone.
  pharmacySecret: "/assets/selim-life/selim-asking-money-friend.png",
  // New scene art (May 2026 art-pass) — distinct illustrations so frequently
  // shown moments stop reusing the same handful of images.
  pinkyPhoneCall: "/assets/selim-life/selim-pinky-phone-call.png",
  dhakaTraffic: "/assets/selim-life/selim-dhaka-traffic.png",
  messRoom: "/assets/selim-life/selim-mess-room.png",
  jobInterview: "/assets/selim-life/selim-job-interview.png",
  friendsLaughing: "/assets/selim-life/selim-friends-laughing.png",
  recoveryWalk: "/assets/selim-life/selim-recovery-walk.png",
  // Chaiwala rooftop date scene — dedicated illustration (Task #36):
  // candlelit rooftop with two chairs, rose, fairy lights, and the chaiwala
  // uncle arriving at the doorway just before the almost-kiss chaos.
  chaiwalaRooftopDate: "/assets/selim-life/selim-chaiwala-rooftop-date.png",
} as const;

// Convenience alias used by new life-scene callers.
export const SELIM_LIFE_ASSETS = {
  eatingBiryani: SELIM_ASSETS.eatingBiryani,
  friendsCrushTeaStall: SELIM_ASSETS.friendsCrushTeaStall,
  dreamingPinkyRooftop: SELIM_ASSETS.dreamingPinkyRooftop,
  busDaydreamCrush: SELIM_ASSETS.busDaydreamCrush,
  brokeRentProblem: SELIM_ASSETS.brokeRentProblem,
  campusDramaSlap: SELIM_ASSETS.campusDramaSlap,
  girlHappyHelp: SELIM_ASSETS.girlHappyHelp,
  askingMoneyFriend: SELIM_ASSETS.askingMoneyFriend,
  workHustleMontage: SELIM_ASSETS.workHustleMontage,
  lifeChaosDashboard: SELIM_ASSETS.lifeChaosDashboard,
  pinkyPhoneCall: SELIM_ASSETS.pinkyPhoneCall,
  dhakaTraffic: SELIM_ASSETS.dhakaTraffic,
  messRoom: SELIM_ASSETS.messRoom,
  jobInterview: SELIM_ASSETS.jobInterview,
  friendsLaughing: SELIM_ASSETS.friendsLaughing,
  recoveryWalk: SELIM_ASSETS.recoveryWalk,
} as const;

export type LifeSceneKey = keyof typeof SELIM_LIFE_ASSETS;

export type SceneKey = keyof typeof SELIM_ASSETS;

const warned = new Set<string>();

const _missingImages = new Set<string>();
export function reportMissingImage(src: string): void {
  if (!_missingImages.has(src)) {
    _missingImages.add(src);
    // eslint-disable-next-line no-console
    console.warn(`[SelimAssets] Missing image (load error): ${src}`);
  }
}
export function getMissingImages(): string[] { return Array.from(_missingImages); }

export function getSafeAsset(key: SceneKey | string | undefined | null): string | null {
  if (!key) return null;
  const v = (SELIM_ASSETS as Record<string, string>)[key as string];
  if (!v) {
    if (!warned.has(String(key))) {
      warned.add(String(key));
      // eslint-disable-next-line no-console
      console.warn(`[SelimAssets] Missing scene asset for key: ${String(key)}`);
    }
    return null;
  }
  return v;
}

// Map a card category / event id to a scene image. Returns undefined when no
// strong category match exists, so callers can fall back to location.
export function getSceneImageForEvent(idOrCategory: string | undefined): SceneKey | undefined {
  if (!idOrCategory) return undefined;
  const k = idOrCategory.toLowerCase();
  // New life-scene matches first (more specific topical art).
  if (k.includes("biryani") || k.includes("food") || k.includes("kacchi") || k === "eat") return "eatingBiryani";
  if (k.includes("rent") || k.includes("broke") || k.includes("wallet") || k === "money") return "brokeRentProblem";
  if (k.includes("bus") && (k.includes("crush") || k.includes("girl") || k.includes("daydream"))) return "busDaydreamCrush";
  if (k.includes("slap") || k.includes("boundary") || k.includes("campus_drama") || k.includes("rejection_campus")) return "campusDramaSlap";
  if (k.includes("recharge") || k.includes("bkash") || k.includes("girl_help") || k.includes("kindness")) return "girlHappyHelp";
  if (k.includes("loan") || k.includes("ask_money") || k.includes("urgent")) return "askingMoneyFriend";
  if (k.includes("hustle") || k.includes("delivery") || k.includes("tutoring") || k.includes("freelance")) return "workHustleMontage";
  if (k.includes("chaos") || k.includes("notification") || k.includes("overwhelm") || k.includes("dashboard")) return "lifeChaosDashboard";
  if (k.includes("rooftop") && k.includes("pinky")) return "dreamingPinkyRooftop";
  if (k.includes("adda") || k.includes("tea_stall_crush")) return "friendsCrushTeaStall";
  // New scene-art routing (May 2026 art-pass).
  if (k.includes("phone_call") || k.includes("phonecall") || k.includes("call_pinky") || (k.includes("pinky") && k.includes("call"))) return "pinkyPhoneCall";
  if (k.includes("traffic") || k.includes("jam") || k.includes("rickshaw") || k.includes("cng") || k.includes("street")) return "dhakaTraffic";
  if (k.includes("mess") || k.includes("bachelor_room") || k.includes("room_alone")) return "messRoom";
  if (k.includes("interview")) return "jobInterview";
  if (k.includes("laugh") || k.includes("friends_night") || k.includes("bromance")) return "friendsLaughing";
  if (k.includes("recovery") || k.includes("morning_walk") || k.includes("hatirjheel") || k.includes("healing")) return "recoveryWalk";
  // Existing routing.
  if (k.includes("pinky") || k.includes("crush") || k === "love") return "pinkyEffectWalk";
  if (k.includes("heartbreak") || k.includes("seen") || k.includes("breakup")) return "rainyHeartbreak";
  if (k.includes("friend") || k.includes("rafiq") || k.includes("cha") || k === "social") return "chaStallFriendTalk";
  if (k.includes("career") || k.includes("study") || k === "work" || k === "iq") return "careerStruggle";
  if (k.includes("boss") || k.includes("success") || k.includes("victory")) return "boguraBossRooftop";
  if (k.includes("silhouette") || k.includes("final") || k.includes("reflection")) return "rooftopSilhouette";
  if (k.includes("addiction") || k === "health") return "rainyHeartbreak";
  if (k.includes("profile") || k.includes("meet") || k.includes("character")) return "characterSheet";
  if (k.includes("family") || k.includes("mother")) return "rooftopSunset";
  return undefined;
}

export type Mood =
  | "romantic" | "heartbroken" | "defensive" | "ashamed" | "grateful"
  | "bestFriend" | "careerFocused" | "boguraBoss" | "silent" | "override"
  | "anger" | "sad" | "comedy" | "normal";

export function getSceneImageForMood(mood: Mood | string | undefined): SceneKey {
  switch ((mood ?? "normal") as Mood) {
    case "romantic":
    case "override":
      return "pinkyEffectWalk";
    case "heartbroken":
    case "sad":
      return "rainyHeartbreak";
    case "bestFriend":
    case "grateful":
      return "chaStallFriendTalk";
    case "careerFocused":
      return "careerStruggle";
    case "boguraBoss":
      return "boguraBossRooftop";
    case "silent":
    case "ashamed":
      return "rooftopSilhouette";
    default:
      return "rooftopSunset";
  }
}

export function getSceneImageForEnding(endingId: string | null | undefined): SceneKey {
  if (!endingId) return "rooftopSunset";
  switch (endingId) {
    case "bogura_boss":
    case "smart_survivor":
    case "self_respect_reborn":
    case "permanent_girl":
    case "finally_listened":
      return "boguraBossRooftop";
    case "career_before_dear":
    case "influencer":
      return "workHustleMontage";
    case "biryani_king":
      return "eatingBiryani";
    case "healthy_selim":
    case "healthy_love_ready":
    case "heartbreak_recovery":
      return "rooftopSunset";
    case "friendship_saved":
      return "askingMoneyFriend";
    case "recovery_hero":
    case "bestfriend_broke":
      return "chaStallFriendTalk";
    case "almost_kiss":
      return "chaiwalaRooftopDate";
    case "first_love_unlimited":
      return "busDaydreamCrush";
    case "pinky_maybe_forever":
      return "dreamingPinkyRooftop";
    case "recharge_romeo":
    case "emotional_atm":
      return "girlHappyHelp";
    case "pinky_game_over":
      return "pinkyEffectWalk";
    case "lost_selim":
    case "touba_loop":
      return "lifeChaosDashboard";
    case "silent_selim":
      return "rainyHeartbreak";
    default:
      return "rooftopSilhouette";
  }
}

// Pick a single defining life scene for a finished day, used by DaySummary.
// Higher entries take priority.
export function getLifeSceneForDaySummary(input: {
  stats: Partial<Record<string, number>>;
  flags: Partial<Record<string, number>>;
}): SceneKey {
  const s = input.stats as Record<string, number>;
  const f = input.flags as Record<string, number>;
  if ((f.brokenPromiseCount ?? 0) > 0 && (s.pinkyHope ?? 0) > 70) return "campusDramaSlap";
  if ((s.pinkyHope ?? 0) > 80) return "dreamingPinkyRooftop";
  if ((s.money ?? 1000) < 200 || (f.debtLevel ?? 0) > 0) return "brokeRentProblem";
  if ((s.careerProgress ?? 0) > 50 || (f.workCount ?? 0) >= 2) return "workHustleMontage";
  if ((f.girlInvestment ?? 0) > 800) return "girlHappyHelp";
  if ((f.randomCrushes ?? 0) > 0) return "busDaydreamCrush";
  if ((f.biryaniCount ?? 0) > 0) return "eatingBiryani";
  if ((f.bestFriendMoments ?? 0) > 0) return "chaStallFriendTalk";
  if ((s.emotionalDelusion ?? 0) > 60 || (s.romanticFever ?? 0) > 60) return "lifeChaosDashboard";
  return "rooftopSunset";
}

export function getSceneImageForLocation(loc: string | undefined): SceneKey {
  if (!loc) return "rooftopSunset";
  const l = loc;
  if (l.includes("ছাদ") || l.includes("rooftop")) return "rooftopSunset";
  if (l.includes("চা") || l.includes("ক্যাফে") || l.includes("Gloria")) return "chaStallFriendTalk";
  if (l.includes("রাস্তা") || l.includes("জ্যাম") || l.includes("রিকশা") || l.includes("CNG") || l.includes("বাস")) return "dhakaTraffic";
  if (l.includes("interview") || l.includes("ইন্টারভিউ")) return "jobInterview";
  if (l.includes("অফিস") || l.includes("মতিঝিল")) return "careerStruggle";
  if (l.includes("মেস") || l.includes("রুম") || l.includes("mess")) return "messRoom";
  if (l.includes("হাতিরঝিল") || l.includes("hatirjheel") || l.includes("walk")) return "recoveryWalk";
  return "rooftopSunset";
}
