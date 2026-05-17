import { ContextPacket, SelimBrainResponse } from "./types";
import { runLocalSelimBrain } from "./localSelimBrain";
import { callLLMBackend, fetchLLMStatus, type LLMStatus } from "./llmClient";
import { callBrowserGemma, isGemmaReady } from "./browserGemmaClient";

let cachedStatus: LLMStatus | null = null;
let statusCheckedAt = 0;
const STATUS_TTL_MS = 60_000;

export async function getCachedLLMStatus(): Promise<LLMStatus> {
  const now = Date.now();
  if (cachedStatus && now - statusCheckedAt < STATUS_TTL_MS) {
    return cachedStatus;
  }
  cachedStatus = await fetchLLMStatus();
  statusCheckedAt = now;
  return cachedStatus;
}

export type BrainMode = "local" | "ai_enhanced";
export type BrainSource = "local" | "gemini" | "gemma_browser";

function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

export async function runSelimBrain(
  packet: ContextPacket,
  mode: BrainMode,
  llmConsentEnabled: boolean,
): Promise<{ response: SelimBrainResponse; modeUsed: BrainMode; source: BrainSource }> {
  if (mode === "ai_enhanced" && llmConsentEnabled) {
    // 1. Try Gemini first when online (best Bangla quality).
    if (isOnline()) {
      try {
        const geminiResponse = await callLLMBackend(packet);
        if (!geminiResponse.useFallback && geminiResponse.reply) {
          return { response: geminiResponse, modeUsed: "ai_enhanced", source: "gemini" };
        }
      } catch {
        // fall through
      }
    }

    // 2. Offline OR Gemini failed → try browser Gemma if downloaded.
    if (isGemmaReady()) {
      try {
        const gemmaResponse = await callBrowserGemma(packet);
        if (!gemmaResponse.useFallback && gemmaResponse.reply) {
          return { response: gemmaResponse, modeUsed: "ai_enhanced", source: "gemma_browser" };
        }
      } catch {
        // fall through
      }
    }
  }

  const localResponse = runLocalSelimBrain(packet);
  return { response: localResponse, modeUsed: "local", source: "local" };
}
