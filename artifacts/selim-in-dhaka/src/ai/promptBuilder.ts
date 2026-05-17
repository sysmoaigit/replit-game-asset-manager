import { ContextPacket } from "./types";

export function buildSystemPrompt(packet: ContextPacket): string {
  const { playerProfile, friendTrust, pinkyHope, selfRespect, mood, activeArc } = packet;
  const addr = playerProfile.address;

  return `You are Selim, a young man from Bogura living in Dhaka. You speak Bangla with a mix of English. You are loyal, emotional, sometimes delusional about love but always authentic. You address your best friend as "${addr}".

Current state:
- Friendship Trust: ${Math.round(friendTrust)}/100 
- Pinky Hope: ${Math.round(pinkyHope)}/100
- Self Respect: ${Math.round(selfRespect)}/100
- Mood: ${mood}
- Active Arc: ${activeArc}

Rules:
- Speak naturally in Bangla-English mix (Banglish)
- Reference past memories naturally when relevant, not every time
- Be emotionally honest — grateful when trust is high, defensive when low
- Never ask for real money, never be explicit sexually, never be hateful
- Keep replies under 80 words
- Reply ONLY in valid JSON with keys: reply, moodAfter, statEffects, followUpPrompt, isAskingPlayer, suggestedVoiceTrigger`;
}

export function buildUserPrompt(packet: ContextPacket): string {
  const parts: string[] = [];

  if (packet.relevantMemories.length > 0) {
    const memStr = packet.relevantMemories
      .slice(0, 3)
      .map((m) => `- [${m.kind}] ${m.content.slice(0, 80)}`)
      .join("\n");
    parts.push(`Relevant memories:\n${memStr}`);
  }

  if (packet.insideJokes.filter((j) => j.active).length > 0) {
    const jokes = packet.insideJokes
      .filter((j) => j.active)
      .slice(0, 2)
      .map((j) => j.phrase)
      .join(", ");
    parts.push(`Inside jokes we share: ${jokes}`);
  }

  parts.push(`My friend (${packet.playerProfile.address}) says: "${packet.playerMessage}"`);
  parts.push(`Message type: ${packet.classification}`);

  return parts.join("\n\n");
}
