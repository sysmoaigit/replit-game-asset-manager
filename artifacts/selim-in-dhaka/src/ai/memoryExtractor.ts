import { MemoryItem, MemoryKind, MessageClassification } from "./types";

interface ExtractionResult {
  kind: MemoryKind;
  content: string;
  tags: string[];
  score: number;
}

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function extractMemory(
  playerMessage: string,
  selimReply: string,
  classification: MessageClassification,
): ExtractionResult | null {
  const msg = playerMessage.toLowerCase();

  if (classification === "personal_story" || msg.includes("আমার জীবনে") || msg.includes("আমিও") || msg.includes("আমার ক্ষেত্রে")) {
    return {
      kind: "player_story",
      content: `Player said: "${playerMessage.slice(0, 120)}"`,
      tags: ["player_life"],
      score: 60,
    };
  }

  if (classification === "heartbreak_story" || msg.includes("heartbreak") || msg.includes("ব্রেকআপ") || msg.includes("ছেড়ে দিয়েছে")) {
    return {
      kind: "player_heartbreak",
      content: `Heartbreak story: "${playerMessage.slice(0, 120)}"`,
      tags: ["heartbreak", "player_life"],
      score: 75,
    };
  }

  if (classification === "harsh_truth" && selimReply.includes("সত্যি")) {
    return {
      kind: "life_lesson",
      content: `Advice that hit Selim: "${playerMessage.slice(0, 100)}"`,
      tags: ["advice", "truth"],
      score: 65,
    };
  }

  if (msg.includes("promise") || msg.includes("প্রমিস") || msg.includes("কথা দিলাম") || msg.includes("touba")) {
    return {
      kind: "promise",
      content: `Promise context: "${playerMessage.slice(0, 120)}"`,
      tags: ["promise"],
      score: 80,
    };
  }

  if (classification === "joke" || msg.includes("😂") || msg.includes("haha") || msg.includes("হাহা")) {
    return {
      kind: "inside_joke",
      content: playerMessage.slice(0, 80),
      tags: ["joke", "funny"],
      score: 50,
    };
  }

  if (classification === "encouragement" && selimReply.length > 20) {
    return {
      kind: "best_friend_moment",
      content: `Encouragement: "${playerMessage.slice(0, 100)}"`,
      tags: ["friendship", "support"],
      score: 70,
    };
  }

  return null;
}

export function buildMemoryItem(result: ExtractionResult): MemoryItem {
  return {
    id: generateId(),
    kind: result.kind,
    content: result.content,
    timestamp: Date.now(),
    pinned: false,
    score: result.score,
    tags: result.tags,
    referenceCount: 0,
  };
}
