import type { MLCEngine, InitProgressReport } from "@mlc-ai/web-llm";
import { ContextPacket, SelimBrainResponse } from "./types";
import { compressContextForLLM } from "./contextBudget";
import { buildSystemPrompt } from "./promptBuilder";
import { parseRawResponse } from "./responseParser";

export const GEMMA_MODEL_ID = "gemma-2-2b-it-q4f16_1-MLC";

export type GemmaStatus =
  | { kind: "idle" }
  | { kind: "loading"; progress: number; text: string }
  | { kind: "ready" }
  | { kind: "error"; message: string };

type StatusListener = (s: GemmaStatus) => void;

let engine: MLCEngine | null = null;
let loadingPromise: Promise<MLCEngine> | null = null;
let currentStatus: GemmaStatus = { kind: "idle" };
const listeners = new Set<StatusListener>();

const READY_FLAG_KEY = "selim_gemma_ready_v1";

function setStatus(s: GemmaStatus) {
  currentStatus = s;
  for (const fn of listeners) fn(s);
}

export function getGemmaStatus(): GemmaStatus {
  return currentStatus;
}

export function subscribeGemmaStatus(fn: StatusListener): () => void {
  listeners.add(fn);
  fn(currentStatus);
  return () => listeners.delete(fn);
}

export function isGemmaReady(): boolean {
  return currentStatus.kind === "ready" && engine !== null;
}

export function hasGemmaBeenDownloaded(): boolean {
  try {
    return localStorage.getItem(READY_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function isWebGPUAvailable(): boolean {
  if (typeof navigator === "undefined") return false;
  return "gpu" in navigator && (navigator as Navigator & { gpu?: unknown }).gpu !== undefined;
}

export async function ensureGemmaLoaded(): Promise<MLCEngine> {
  if (engine) return engine;
  if (loadingPromise) return loadingPromise;

  if (!isWebGPUAvailable()) {
    const msg = "WebGPU not available in this browser. Try Chrome/Edge desktop or iOS 18+ Safari.";
    setStatus({ kind: "error", message: msg });
    throw new Error(msg);
  }

  setStatus({ kind: "loading", progress: 0, text: "Initializing engine..." });

  loadingPromise = (async () => {
    try {
      const webllm = await import("@mlc-ai/web-llm");
      const created = await webllm.CreateMLCEngine(GEMMA_MODEL_ID, {
        initProgressCallback: (report: InitProgressReport) => {
          setStatus({
            kind: "loading",
            progress: typeof report.progress === "number" ? report.progress : 0,
            text: report.text ?? "Loading model...",
          });
        },
      });
      engine = created;
      try { localStorage.setItem(READY_FLAG_KEY, "1"); } catch { /* ignore */ }
      setStatus({ kind: "ready" });
      return created;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus({ kind: "error", message: msg });
      loadingPromise = null;
      throw e;
    }
  })();

  return loadingPromise;
}

const SCHEMA_HINT = `Reply ONLY with valid JSON matching:
{"reply": "<Banglish text under 60 words>", "moodAfter": "happy|sad|defensive|romantic|hopeful|ashamed|grateful|silent|angry|confused", "statEffects": {"friendTrust": -10..10, "selfRespect": -10..10, "pinkyHope": -10..10, "mood": -10..10}, "followUpPrompt": "<short string or null>", "isAskingPlayer": false}`;

function extractJsonBlock(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return null;
}

export async function callBrowserGemma(
  packet: ContextPacket,
): Promise<SelimBrainResponse & { useFallback?: boolean }> {
  if (!engine) {
    return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true };
  }

  const systemPrompt = buildSystemPrompt(packet);
  const compressedContext = compressContextForLLM(packet);
  const userMessage = `Context: ${compressedContext}\n\nMy friend (${packet.playerProfile.address}) [${packet.classification}] says: "${packet.playerMessage.slice(0, 200)}"\n\n${SCHEMA_HINT}`;

  try {
    const completion = await engine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.85,
      max_tokens: 280,
      response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content ?? "";
    const jsonStr = extractJsonBlock(rawText);
    if (!jsonStr) return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true };

    let parsedJson: unknown;
    try { parsedJson = JSON.parse(jsonStr); }
    catch { return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true }; }

    const parsed = parseRawResponse(parsedJson);
    if (!parsed) return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true };
    return parsed;
  } catch {
    return { reply: "", moodAfter: "confused", statEffects: {}, useFallback: true };
  }
}
