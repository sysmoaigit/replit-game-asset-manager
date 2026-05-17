import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface SelimChatRequest {
  playerMessage?: string;
  classification?: string;
  contextSummary?: string;
}

interface SelimChatResponse {
  reply?: string;
  moodAfter?: string;
  statEffects?: Record<string, number>;
  followUpPrompt?: string | null;
  isAskingPlayer?: boolean;
  suggestedVoiceTrigger?: string;
  useFallback?: boolean;
}

const RATE_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

const MAX_PLAYER_MESSAGE_LEN = 500;
const MAX_CONTEXT_SUMMARY_LEN = 900;
const MAX_CLASSIFICATION_LEN = 64;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_MAP.get(ip);
  if (!entry || now > entry.resetAt) {
    RATE_MAP.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const BLOCK_PATTERNS = [
  /\b(kill yourself|self.?harm)\b/i,
  /\bsex(ually)? explicit\b/i,
  /\b(real money|bank account|bkash transfer)\b/i,
  /\b(hate all women|all women are)\b/i,
];

function serverSafetyCheck(text: string): boolean {
  return !BLOCK_PATTERNS.some((p) => p.test(text));
}

function buildServerSystemPrompt(): string {
  return `You are Selim, a young man from Bogura living in Dhaka. You speak Bangla with a mix of English. You are loyal, emotional, sometimes delusional about love but always authentic.

Rules:
- Speak naturally in Bangla-English mix (Banglish)
- Reference past context naturally when relevant, not every time
- Be emotionally honest — grateful when trust is high, defensive when low
- Never ask for real money, never be explicit sexually, never be hateful
- Keep replies under 80 words
- Reply ONLY in valid JSON with keys: reply, moodAfter, statEffects, followUpPrompt, isAskingPlayer, suggestedVoiceTrigger`;
}

function buildServerUserPrompt(
  playerMessage: string,
  contextSummary: string,
  classification: string,
): string {
  const parts: string[] = [];
  if (contextSummary) {
    parts.push(`Context:\n${contextSummary}`);
  }
  parts.push(`[${classification}] ${playerMessage}`);
  return parts.join("\n\n");
}

interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  source: "replit_gemini_integration" | "manual_env";
}

function resolveLLMConfig(): LLMConfig | null {
  const geminiBase = process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"];
  const geminiKey = process.env["AI_INTEGRATIONS_GEMINI_API_KEY"];
  if (geminiBase && geminiKey) {
    return {
      provider: "gemini",
      apiKey: geminiKey,
      model: process.env["LLM_MODEL"] ?? "gemini-2.5-flash",
      baseUrl: geminiBase,
      source: "replit_gemini_integration",
    };
  }
  const provider = process.env["LLM_PROVIDER"];
  const apiKey = process.env["LLM_API_KEY"];
  const model = process.env["LLM_MODEL"];
  if (provider && apiKey && model) {
    return { provider, apiKey, model, source: "manual_env" };
  }
  return null;
}

async function callLLMProvider(
  systemPrompt: string,
  userPrompt: string,
  provider: string,
  apiKey: string,
  model: string,
  baseUrl?: string,
): Promise<SelimChatResponse | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7500);

  try {
    let url: string;
    let headers: Record<string, string>;
    let body: unknown;

    if (provider === "gemini") {
      const root = (baseUrl ?? "").replace(/\/+$/, "");
      url = `${root}/models/${model}:generateContent`;
      headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      };
      body = {
        systemInstruction: { parts: [{ text: systemPrompt + "\n\nReply ONLY with valid JSON." }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 800,
          temperature: 0.8,
        },
      };
    } else if (provider === "openai" || provider === "openrouter") {
      url = provider === "openai"
        ? "https://api.openai.com/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      };
      body = {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.8,
        response_format: { type: "json_object" },
      };
    } else if (provider === "anthropic") {
      url = "https://api.anthropic.com/v1/messages";
      headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      };
      body = {
        model,
        max_tokens: 200,
        system: systemPrompt + "\n\nAlways reply in JSON.",
        messages: [{ role: "user", content: userPrompt }],
      };
    } else {
      return null;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const json = await res.json() as Record<string, unknown>;

    let rawText: string | null = null;
    if (provider === "anthropic") {
      const content = (json.content as Array<{ type: string; text: string }>)?.[0];
      rawText = content?.text ?? null;
    } else if (provider === "gemini") {
      const candidates = json.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
      rawText = candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } else {
      const choices = json.choices as Array<{ message: { content: string } }>;
      rawText = choices?.[0]?.message?.content ?? null;
    }

    if (!rawText) return null;
    const parsed = JSON.parse(rawText) as SelimChatResponse;
    return parsed;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

router.get("/selim-chat/status", (_req, res) => {
  const config = resolveLLMConfig();
  if (!config) {
    res.json({ aiAvailable: false });
    return;
  }
  res.json({
    aiAvailable: true,
    provider: config.provider,
    model: config.model,
    source: config.source,
  });
});

router.post("/selim-chat", async (req, res) => {
  const ip = req.ip ?? "unknown";

  if (!checkRateLimit(ip)) {
    res.status(429).json({ useFallback: true });
    return;
  }

  const config = resolveLLMConfig();
  if (!config) {
    res.json({ useFallback: true });
    return;
  }

  const body = req.body as SelimChatRequest;

  if (!body.playerMessage || !body.contextSummary) {
    res.status(400).json({ useFallback: true });
    return;
  }

  const playerMessage = body.playerMessage.slice(0, MAX_PLAYER_MESSAGE_LEN);
  const contextSummary = body.contextSummary.slice(0, MAX_CONTEXT_SUMMARY_LEN);
  const classification = (body.classification ?? "general").slice(0, MAX_CLASSIFICATION_LEN);

  if (!serverSafetyCheck(playerMessage) || !serverSafetyCheck(contextSummary)) {
    const safeReply: SelimChatResponse = {
      reply: "ভাই, এইটা নিয়ে কথা বলা ঠিক না।",
      moodAfter: "defensive",
      statEffects: {},
      useFallback: false,
    };
    res.json(safeReply);
    return;
  }

  const systemPrompt = buildServerSystemPrompt();
  const userPrompt = buildServerUserPrompt(playerMessage, contextSummary, classification);

  const result = await callLLMProvider(
    systemPrompt,
    userPrompt,
    config.provider,
    config.apiKey,
    config.model,
    config.baseUrl,
  );

  if (!result || !result.reply) {
    res.json({ useFallback: true });
    return;
  }

  if (!serverSafetyCheck(result.reply)) {
    result.reply = "Hmm, একটু অন্যভাবে বলি।";
  }

  const clampedEffects: Record<string, number> = {};
  if (result.statEffects) {
    for (const [k, v] of Object.entries(result.statEffects)) {
      clampedEffects[k] = Math.max(-20, Math.min(20, Number(v) || 0));
    }
  }

  res.json({
    reply: result.reply,
    moodAfter: result.moodAfter ?? "confused",
    statEffects: clampedEffects,
    followUpPrompt: result.followUpPrompt ?? null,
    isAskingPlayer: result.isAskingPlayer ?? false,
    suggestedVoiceTrigger: result.suggestedVoiceTrigger,
    useFallback: false,
  });
});

export default router;
