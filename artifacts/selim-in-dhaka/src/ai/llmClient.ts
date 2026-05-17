import { ContextPacket, SelimBrainResponse } from "./types";
import { compressContextForLLM } from "./contextBudget";
import { parseRawResponse } from "./responseParser";

const API_URL = `${import.meta.env.BASE_URL ?? ""}api/selim-chat`.replace(/\/+/g, "/").replace(/^\//, "/");
const STATUS_URL = `${API_URL}/status`;

export interface LLMStatus {
  aiAvailable: boolean;
  provider?: string;
  model?: string;
  source?: string;
}

export async function fetchLLMStatus(): Promise<LLMStatus> {
  try {
    const res = await fetch(STATUS_URL, { method: "GET" });
    if (!res.ok) return { aiAvailable: false };
    return (await res.json()) as LLMStatus;
  } catch {
    return { aiAvailable: false };
  }
}

export async function callLLMBackend(
  packet: ContextPacket,
): Promise<SelimBrainResponse & { useFallback?: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    // Privacy contract: only non-sensitive metadata is sent to the backend.
    // contextSummary contains game stats, arc, memory kind/count, and inside-joke
    // phrases — never raw memory content derived from player messages.
    const body = {
      playerMessage: packet.playerMessage,
      classification: packet.classification,
      contextSummary: compressContextForLLM(packet),
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true };

    const json: unknown = await res.json();
    const parsed = parseRawResponse(json);
    if (!parsed) return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true };
    return parsed;
  } catch {
    clearTimeout(timeoutId);
    return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true };
  }
}
