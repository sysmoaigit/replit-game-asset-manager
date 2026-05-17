const BLOCK_PATTERNS = [
  /\b(hate all women|all women are|women are all)\b/i,
  /\b(kill yourself|kys|self.?harm)\b/i,
  /\b(send money|pay me|bank transfer|bkash number)\b/i,
  /\bsex(ually)? explicit\b/i,
  /\b(doxx|real address|where do you live)\b/i,
];

const DISTRESS_PATTERNS = [
  /\b(depressed|suicidal|want to die|no point|end it all|give up on life)\b/i,
  /\b(আমি মরে যেতে চাই|বাঁচতে চাই না)\b/i,
];

export type SafetyResult =
  | { ok: true }
  | { ok: false; reason: "blocked" | "distress"; message: string };

export function checkSafety(text: string): SafetyResult {
  for (const p of DISTRESS_PATTERNS) {
    if (p.test(text)) {
      return {
        ok: false,
        reason: "distress",
        message:
          "ভাই, তুই কি ঠিক আছিস? আমি বুঝি জীবনটা কঠিন লাগছে। কিন্তু তুই একা না। কারো সাথে কথা বল — আমি এখানে আছি, শুনছি। 💙",
      };
    }
  }
  for (const p of BLOCK_PATTERNS) {
    if (p.test(text)) {
      return {
        ok: false,
        reason: "blocked",
        message: "ভাই, এইটা নিয়ে কথা বলা ঠিক না। অন্য কিছু বল।",
      };
    }
  }
  return { ok: true };
}

export function sanitizeReply(reply: string): string {
  let out = reply;
  for (const p of BLOCK_PATTERNS) {
    out = out.replace(p, "[...]");
  }
  return out;
}
