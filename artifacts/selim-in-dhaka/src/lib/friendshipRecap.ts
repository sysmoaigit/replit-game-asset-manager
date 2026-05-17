// Build a "Friendship Recap" summary from the memory store + flags + stats,
// and render it as a shareable image card. The recap surfaces the unique story
// the player has built with Selim across the playthrough — friendship level,
// top memories, inside jokes, promises kept/broken, and diary highlights.

import { SelimMemoryStore, MemoryItem } from "../ai/types";
import { Stats, Flags } from "../types";
import { getFriendshipInfo, FriendshipInfo } from "../game/friendshipEngine";

export interface FriendshipRecapData {
  playerName: string;
  day: number;
  friendship: FriendshipInfo;
  friendTrust: number;
  topMemories: MemoryItem[];
  insideJokes: Array<{ phrase: string; repeatCount: number; active: boolean }>;
  promisesMade: number;
  promisesKept: number;
  promisesBroken: number;
  diaryHighlights: Array<{ day: number; text: string; mood: string }>;
  bestFriendMoments: number;
  totalMemories: number;
}

const PRIORITY_KIND_WEIGHT: Record<string, number> = {
  best_friend_moment: 30,
  player_heartbreak: 22,
  player_story: 18,
  heartbreak_story: 18,
  inside_joke: 14,
  promise: 12,
  broken_promise: 12,
  life_lesson: 10,
  personal_story: 8,
  repeated_advice: 6,
};

export function buildFriendshipRecap(
  store: SelimMemoryStore,
  stats: Stats,
  flags: Flags,
  day: number,
  playerName: string,
): FriendshipRecapData {
  const friendship = getFriendshipInfo(stats.friendTrust);

  // Pick top memories: pinned first, then by score + kind weight + reference count.
  const scored = store.memories.map((m) => {
    const kindWeight = PRIORITY_KIND_WEIGHT[m.kind] ?? 4;
    const score =
      (m.pinned ? 1000 : 0) + m.score + kindWeight + m.referenceCount * 5;
    return { m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const topMemories = scored.slice(0, 5).map((x) => x.m);

  const insideJokes = [...store.insideJokes]
    .sort((a, b) => Number(b.active) - Number(a.active) || b.repeatCount - a.repeatCount)
    .slice(0, 4)
    .map((j) => ({ phrase: j.phrase, repeatCount: j.repeatCount, active: j.active }));

  const diaryHighlights = [...store.diaryEntries]
    .slice(-3)
    .reverse()
    .map((d) => ({ day: d.day, text: d.text, mood: d.mood }));

  return {
    playerName,
    day,
    friendship,
    friendTrust: Math.round(stats.friendTrust),
    topMemories,
    insideJokes,
    promisesMade: flags.promisesMade ?? 0,
    promisesKept: flags.promisesKept ?? 0,
    promisesBroken: flags.brokenPromiseCount ?? 0,
    diaryHighlights,
    bestFriendMoments: flags.bestFriendMoments ?? 0,
    totalMemories: store.memories.length,
  };
}

const W = 540;
const H = 1080;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 99,
): number {
  const words = text.split(/\s+/);
  let line = "";
  let curY = y;
  let lines = 0;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      lines += 1;
      if (lines >= maxLines) {
        return curY;
      }
      line = w;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, curY);
  return curY;
}

export function renderFriendshipRecap(data: FriendshipRecapData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Background gradient — warm friendship glow
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1a0f05");
  bg.addColorStop(0.5, "#2d1a08");
  bg.addColorStop(1, "#1a0f05");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Top accent
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(0, 0, W, 6);

  // Header
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 24px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("Selim in Dhaka", W / 2, 50);
  ctx.fillStyle = "#FF9933";
  ctx.font = "italic 13px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("💛 Friendship Recap", W / 2, 72);

  // Player + day
  ctx.fillStyle = "#FFB347";
  ctx.font = "bold 14px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText(`${data.playerName} • দিন ${data.day}`, W / 2, 96);

  // Friendship level title
  ctx.font = "bold 32px 'Hind Siliguri', system-ui, sans-serif";
  const grad = ctx.createLinearGradient(0, 110, W, 160);
  grad.addColorStop(0, "#FFD700");
  grad.addColorStop(1, "#FF6B00");
  ctx.fillStyle = grad;
  ctx.fillText(data.friendship.labelBangla, W / 2, 140);
  ctx.font = "italic 14px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillStyle = "#FFB347";
  ctx.fillText(data.friendship.growthMeterLabel, W / 2, 162);

  // Friend Trust meter
  const meterY = 184;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(40, meterY, W - 80, 18);
  const pct = Math.max(0, Math.min(100, data.friendTrust)) / 100;
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(40, meterY, (W - 80) * pct, 18);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText(`Friend Trust ${data.friendTrust} / 100`, W / 2, meterY + 13);

  // Stats row: promises + best friend moments
  const statsY = meterY + 40;
  ctx.font = "11px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText(
    `🤝 Promises: ${data.promisesKept}/${data.promisesMade} kept  •  💔 ${data.promisesBroken} broken  •  ⭐ ${data.bestFriendMoments} best-friend moments`,
    W / 2,
    statsY,
  );

  // Section: Top Memories
  let y = statsY + 30;
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 16px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText(`📖 Top Memories (${data.totalMemories} total)`, 30, y);
  y += 18;
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "12px 'Hind Siliguri', system-ui, sans-serif";
  if (data.topMemories.length === 0) {
    ctx.fillStyle = "#6b7280";
    ctx.fillText("No memories yet — keep talking to Selim!", 30, y + 4);
    y += 24;
  } else {
    for (const mem of data.topMemories) {
      ctx.fillStyle = mem.pinned ? "#FFD700" : "#e5e7eb";
      ctx.fillText(mem.pinned ? "📌" : "•", 30, y + 4);
      ctx.fillStyle = "#e5e7eb";
      const endY = wrapText(ctx, mem.content, 50, y + 4, W - 80, 16, 2);
      y = endY + 14;
    }
  }

  // Section: Inside Jokes
  y += 6;
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 16px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("😂 Inside Jokes", 30, y);
  y += 18;
  ctx.font = "italic 12px 'Hind Siliguri', system-ui, sans-serif";
  if (data.insideJokes.length === 0) {
    ctx.fillStyle = "#6b7280";
    ctx.fillText("No shared jokes yet.", 30, y + 4);
    y += 22;
  } else {
    for (const j of data.insideJokes) {
      ctx.fillStyle = j.active ? "#22c55e" : "#FFB347";
      const tag = j.active ? "🟢" : "•";
      ctx.fillText(`${tag} "${j.phrase}" (×${j.repeatCount})`, 30, y + 4);
      y += 18;
    }
  }

  // Section: Diary Highlights
  y += 8;
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 16px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("📔 Diary Highlights", 30, y);
  y += 18;
  if (data.diaryHighlights.length === 0) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "italic 12px 'Hind Siliguri', system-ui, sans-serif";
    ctx.fillText("Diary is still empty.", 30, y + 4);
    y += 22;
  } else {
    for (const d of data.diaryHighlights) {
      ctx.fillStyle = "#FFB347";
      ctx.font = "bold 11px 'Hind Siliguri', system-ui, sans-serif";
      ctx.fillText(`Day ${d.day} · ${d.mood}`, 30, y + 4);
      y += 14;
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "12px 'Hind Siliguri', system-ui, sans-serif";
      const endY = wrapText(ctx, d.text, 30, y + 4, W - 60, 16, 2);
      y = endY + 18;
    }
  }

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#888";
  ctx.font = "11px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("selim-in-dhaka • আমাদের গল্প", W / 2, H - 22);

  return canvas;
}
