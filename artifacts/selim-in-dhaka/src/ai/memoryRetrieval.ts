import { MemoryItem, MessageClassification } from "./types";

const KIND_SCORE_BONUS: Record<string, number> = {
  promise: 30,
  broken_promise: 25,
  best_friend_moment: 20,
  heartbreak_story: 15,
  player_heartbreak: 15,
  life_lesson: 10,
  inside_joke: 10,
  personal_story: 5,
  player_story: 5,
  repeated_advice: 0,
};

function ageScore(timestamp: number): number {
  const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
  if (ageHours < 1) return 20;
  if (ageHours < 24) return 10;
  if (ageHours < 72) return 5;
  return 0;
}

function relevanceScore(memory: MemoryItem, classification: MessageClassification): number {
  let score = 0;
  if (classification === "relationship_warning" && memory.tags.includes("heartbreak")) score += 20;
  if (classification === "money_warning" && memory.tags.includes("promise")) score += 15;
  if (classification === "encouragement" && memory.tags.includes("friendship")) score += 20;
  if (classification === "joke" && memory.kind === "inside_joke") score += 25;
  if (classification === "personal_story" && memory.tags.includes("player_life")) score += 15;
  if (classification === "harsh_truth" && memory.kind === "life_lesson") score += 20;
  return score;
}

export function retrieveRelevantMemories(
  memories: MemoryItem[],
  classification: MessageClassification,
  friendTrust: number,
  limit = 4,
): MemoryItem[] {
  if (memories.length === 0) return [];

  const scored = memories.map((m) => {
    let total = m.score;
    total += KIND_SCORE_BONUS[m.kind] ?? 0;
    total += ageScore(m.timestamp);
    total += relevanceScore(m, classification);
    total += m.pinned ? 25 : 0;
    total += m.referenceCount * 2;
    if (friendTrust > 70) total += 10;
    return { memory: m, total };
  });

  scored.sort((a, b) => b.total - a.total);

  const topN = scored.slice(0, limit * 2);

  const selected: MemoryItem[] = [];
  const kindSeen = new Set<string>();
  for (const { memory } of topN) {
    if (selected.length >= limit) break;
    if (!kindSeen.has(memory.kind) || memory.pinned) {
      selected.push(memory);
      kindSeen.add(memory.kind);
    }
  }
  return selected;
}

export function shouldReferenceMemory(friendTrust: number, turnCount: number): boolean {
  if (friendTrust < 30) return false;
  const chance = friendTrust > 70 ? 0.4 : friendTrust > 50 ? 0.25 : 0.15;
  const turnModifier = turnCount % 4 === 0 ? 0.15 : 0;
  return Math.random() < chance + turnModifier;
}
