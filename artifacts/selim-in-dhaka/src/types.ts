export type Stats = {
  health: number;
  mood: number;
  money: number;
  iq: number;
  energy: number;
  reputation: number;
  addiction: number;
  temptation: number;
  selfRespect: number;
  pinkyHope: number;
  pinkyHappiness: number;
  careerProgress: number;
  friendTrust: number;
  emotionalDelusion: number;
  attachmentLevel: number;
  loneliness: number;
  romanticFever: number;
};

export type ReactionKind = "obey" | "half" | "override";

export type ReactionSubKind =
  | "normal"
  | "promise_made"
  | "promise_broken"
  | "silent"
  | "defensive"
  | "best_friend"
  | "relapse";

export type SelimReaction = {
  kind: ReactionKind;
  subKind: ReactionSubKind;
  label: string;
  excuse: string | null;
  outcomeText: string;
  appliedEffects: Partial<Stats>;
  appliedFlagUpdate: Partial<Flags>;
  obeyChancePercent: number;
};

export type Flags = {
  biryaniCount: number;
  cigaretteCount: number;
  noSmokeStreak: number;
  healthyMealCount: number;
  workCount: number;
  scamAvoided: number;
  rentPaid: number;
  nilaTrust: number;
  motherCallsAnswered: number;
  recoveryTriggered: boolean;
  recoverySuccess: boolean;
  influencerPoints: number;
  debtLevel: number;
  daysWithoutDebt: number;
  biryaniSkips: number;
  heartbreakCount: number;
  girlsTrustedAndBurned: number;
  girlInvestment: number;
  firstLoveCount: number;
  pinkyRechargeCount: number;
  pinkySeenCount: number;
  pinkyBoundaryWins: number;
  playerAdviceFollowed: number;
  playerAdviceIgnored: number;
  halfObeys: number;
  emotionalOverrides: number;
  rechargePromisesBroken: number;
  promisesMade: number;
  promisesKept: number;
  brokenPromiseCount: number;
  bestFriendMoments: number;
  silentMoments: number;
  defensiveMoments: number;
  randomCrushes: number;
  promiseModeTurnsLeft: number;
  friendshipMilestonesShown: number[];
  // New polish flags (Task 23)
  fakeGirlMessagesBelieved: number;
  moneyAskedFromFriend: number;
  liesTold: number;
  liesCaught: number;
  toubaStreakDays: number;
  lastBrokenPromiseCount: number;
  // Pharmacy "secret mission" + Tisha romance arc — Selim's hidden
  // vulnerability and his real relationship with Tisha. Tasteful adult-
  // themed beats about confidence, honesty, intimacy, and growing up.
  pharmacyVisited: number;
  shortcutShame: number;
  lifestyleProgress: number;
  partnerHonesty: number;
  // Tisha-specific romance arc trackers
  tishaMet: number;
  tishaTrust: number;
  tishaIntimacy: number;
  tishaFightCount: number;
  tishaMakeupCount: number;
  // Rooftop date / chaiwala plot twist arc
  rooftopDatePlanned: number;
  almostKissUnlocked: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

export type ChoiceKind = "do" | "avoid" | "smart" | "later";

export type Choice = {
  label: string;
  kind: ChoiceKind;
  effects: Partial<Stats>;
  resultText: string;
  flagUpdate?: Partial<Flags>;
  requires?: Partial<Stats>;
};

export type SceneKeyName =
  | "main" | "characterSheet" | "rooftopSunset" | "pinkyEffectWalk"
  | "rainyHeartbreak" | "chaStallFriendTalk" | "careerStruggle"
  | "boguraBossRooftop" | "rooftopSilhouette"
  | "eatingBiryani" | "friendsCrushTeaStall" | "dreamingPinkyRooftop"
  | "busDaydreamCrush" | "brokeRentProblem" | "campusDramaSlap"
  | "girlHappyHelp" | "askingMoneyFriend" | "workHustleMontage"
  | "lifeChaosDashboard" | "pharmacySecret" | "chaiwalaRooftopDate";

export type CardVisual = {
  sceneKey?: SceneKeyName;
  mood?: string;
  overlay?: "romantic" | "heartbreak" | "friendship" | "career" | "boss" | "silent" | "comedy" | "danger" | "none";
  focus?: "selim" | "phone" | "city" | "friendship" | "memory";
};

export type GameCard = {
  id: string;
  title: string;
  location: string;
  phase?: "Morning" | "Noon" | "Evening" | "Night";
  category: string;
  speaker?: string;
  text: string;
  choices: Choice[];
  condition?: (state: GameState) => boolean;
  weight?: number;
  tags?: string[];
  visual?: CardVisual;
};

export type GameScreen = "start" | "tutorial" | "game" | "daysum" | "recovery" | "ending" | "menu";

export type EventArc =
  | "pinky"
  | "random_crush"
  | "career"
  | "money"
  | "friendship"
  | "family"
  | "heartbreak"
  | "touba"
  | "recovery"
  | "dhaka_survival"
  | "self_respect"
  | "bogura_memory";

export type CrushGirlType =
  | "polite" | "kind" | "opportunistic" | "career_positive" | "foodie"
  | "uninterested" | "ambiguous" | "friend_only" | "unknown";

export type CrushSource = {
  id: string;
  label: string;
  location: string;
  triggerText: string;
  girlType: CrushGirlType;
  selimMisread: string[];
  wiseInterpretation: string[];
};

export type GameState = {
  screen: GameScreen;
  day: number;
  phaseIndex: number;
  stats: Stats;
  flags: Flags;
  achievements: Achievement[];
  recentCards: string[];
  currentCard: GameCard | null;
  lastResultText: string | null;
  recoveryTurns: number;
  endingId: string | null;
  isReducedMotion: boolean;
  isSoundEnabled: boolean;
};
