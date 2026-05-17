import { ContextPacket } from "./types";

const MAX_CONTEXT_CHARS = 800;

export function compressContextForLLM(packet: ContextPacket): string {
  const parts: string[] = [];

  parts.push(`Arc: ${packet.activeArc}`);
  parts.push(`Trust: ${Math.round(packet.friendTrust)}, Pinky: ${Math.round(packet.pinkyHope)}, Self: ${Math.round(packet.selfRespect)}, Mood: ${packet.mood}`);

  if (packet.relevantMemories.length > 0) {
    const memKinds = packet.relevantMemories
      .slice(0, 3)
      .map((m) => m.kind)
      .join(", ");
    parts.push(`Mem(${packet.relevantMemories.slice(0, 3).length}): ${memKinds}`);
  }

  if (packet.insideJokes.length > 0) {
    const jokes = packet.insideJokes
      .filter((j) => j.active)
      .slice(0, 2)
      .map((j) => j.phrase)
      .join(", ");
    if (jokes) parts.push(`Jokes: ${jokes}`);
  }

  parts.push(`Address: ${packet.playerProfile.address}`);
  parts.push(`Day: ${packet.currentDay}`);

  let result = parts.join(" | ");
  if (result.length > MAX_CONTEXT_CHARS) {
    result = result.slice(0, MAX_CONTEXT_CHARS) + "...";
  }
  return result;
}
