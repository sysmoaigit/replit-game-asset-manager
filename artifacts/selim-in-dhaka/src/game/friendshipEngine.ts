import { FriendshipLevel } from "../ai/types";

export interface FriendshipInfo {
  level: FriendshipLevel;
  label: string;
  labelBangla: string;
  growthMeterLabel: string;
  nextThreshold: number | null;
  progress: number;
}

const LEVELS: Array<{
  level: FriendshipLevel;
  label: string;
  labelBangla: string;
  growthMeterLabel: string;
  threshold: number;
}> = [
  { level: "new_friend", label: "New Friend", labelBangla: "নতুন বন্ধু", growthMeterLabel: "Stranger Zone 🌐", threshold: 0 },
  { level: "mess_friend", label: "Mess Friend", labelBangla: "মেসের বন্ধু", growthMeterLabel: "Chai Buddy ☕", threshold: 25 },
  { level: "real_friend", label: "Real Friend", labelBangla: "আসল বন্ধু", growthMeterLabel: "Vibe Locked 🔒", threshold: 50 },
  { level: "best_friend", label: "Best Friend", labelBangla: "বেস্ট ফ্রেন্ড", growthMeterLabel: "Yeh Dosti 🤝", threshold: 75 },
  { level: "life_brother", label: "Life Brother", labelBangla: "জীবনের ভাই", growthMeterLabel: "Life Brother 💛", threshold: 90 },
];

export function getFriendshipInfo(friendTrust: number): FriendshipInfo {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (friendTrust >= lvl.threshold) current = lvl;
  }

  const currentIndex = LEVELS.findIndex((l) => l.level === current.level);
  const next = LEVELS[currentIndex + 1] ?? null;
  const progress = next
    ? Math.min(100, ((friendTrust - current.threshold) / (next.threshold - current.threshold)) * 100)
    : 100;

  return {
    level: current.level,
    label: current.label,
    labelBangla: current.labelBangla,
    growthMeterLabel: current.growthMeterLabel,
    nextThreshold: next?.threshold ?? null,
    progress,
  };
}

export const UNLOCK_EVENTS: Record<number, { dialogue: string; statEffects: Record<string, number> }> = {
  25: {
    dialogue: "ভাই, তুই একটু অন্যরকম। মেসের বাকিরা আড্ডা দেয়, তুই সত্যি কথা বলিস। চা খাবি? ☕",
    statEffects: { friendTrust: 2, mood: 6, loneliness: -8 },
  },
  50: {
    dialogue: "আজকে তোর সাথে কথা বলে মাথা পরিষ্কার হলো। তুই আসলে আমার real friend রে ভাই। 🔒",
    statEffects: { friendTrust: 3, selfRespect: 4, emotionalDelusion: -5, mood: 8 },
  },
  75: {
    dialogue: "ভাই, তুই না থাকলে আমি আরো নষ্ট হইতাম। Best Friend Mode — unlocked! 🤝",
    statEffects: { friendTrust: 3, selfRespect: 5, emotionalDelusion: -8, mood: 10 },
  },
  90: {
    dialogue: "Pinky important, but তুই আমার আসল friend। Pinky optional, তুই permanent। Life Brother certified। 💛",
    statEffects: { friendTrust: 5, selfRespect: 8, pinkyHope: -10, mood: 15 },
  },
};
