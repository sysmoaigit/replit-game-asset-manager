export type MemoryKind =
  | "personal_story"
  | "player_story"
  | "player_heartbreak"
  | "repeated_advice"
  | "inside_joke"
  | "promise"
  | "broken_promise"
  | "best_friend_moment"
  | "heartbreak_story"
  | "life_lesson";

export type SelimMood =
  | "happy"
  | "sad"
  | "defensive"
  | "romantic"
  | "hopeful"
  | "ashamed"
  | "grateful"
  | "silent"
  | "angry"
  | "confused";

export type MessageClassification =
  | "support"
  | "harsh_truth"
  | "career_advice"
  | "relationship_warning"
  | "money_warning"
  | "joke"
  | "personal_story"
  | "heartbreak_story"
  | "anger"
  | "encouragement"
  | "command"
  | "unknown";

export type FriendshipLevel =
  | "new_friend"
  | "mess_friend"
  | "real_friend"
  | "best_friend"
  | "life_brother";

export type AddressStyle = "Bhai" | "Bondhu" | "Dost" | "Vai" | string;

export interface PlayerProfile {
  nickname: string;
  address: AddressStyle;
  memoryEnabled: boolean;
  llmConsentEnabled: boolean;
  setupComplete: boolean;
  firstRunSeen: boolean;
  onboardingSeen: boolean;
  ngPlusCount: number;
}

export interface MemoryItem {
  id: string;
  kind: MemoryKind;
  content: string;
  timestamp: number;
  pinned: boolean;
  score: number;
  tags: string[];
  referenceCount: number;
  jokeRepeatCount?: number;
}

export interface InsideJoke {
  phrase: string;
  repeatCount: number;
  firstSeen: number;
  lastSeen: number;
  active: boolean;
}

export interface SavedPromise {
  id: string;
  text: string;
  timestamp: number;
  reminded: boolean;
}

export interface SelimMemoryStore {
  memories: MemoryItem[];
  insideJokes: InsideJoke[];
  savedPromises: SavedPromise[];
  diaryEntries: DiaryEntry[];
  continuityRecap: string | null;
  lastDay: number;
}

export interface DiaryEntry {
  day: number;
  text: string;
  timestamp: number;
  mood: SelimMood;
}

export interface ContextPacket {
  playerMessage: string;
  classification: MessageClassification;
  relevantMemories: MemoryItem[];
  insideJokes: InsideJoke[];
  activeArc: string;
  friendTrust: number;
  pinkyHope: number;
  selfRespect: number;
  mood: SelimMood;
  playerProfile: PlayerProfile;
  currentDay: number;
}

export interface SelimBrainResponse {
  reply: string;
  moodAfter: SelimMood;
  statEffects: {
    friendTrust?: number;
    selfRespect?: number;
    emotionalDelusion?: number;
    mood?: number;
    pinkyHope?: number;
    careerProgress?: number;
    iq?: number;
  };
  memoryExtracted?: Partial<MemoryItem>;
  suggestedVoiceTrigger?: string;
  followUpPrompt?: string | null;
  isAskingPlayer?: boolean;
  useFallback?: boolean;
}

export interface AISettings {
  brainMode: "local" | "ai_enhanced";
  memoryEnabled: boolean;
  llmConsentEnabled: boolean;
}
