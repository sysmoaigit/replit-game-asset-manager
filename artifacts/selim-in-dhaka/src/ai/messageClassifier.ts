import { MessageClassification } from "./types";

type Rule = { pattern: RegExp; label: MessageClassification; priority: number };

const RULES: Rule[] = [
  { pattern: /\b(heartbreak|broke up|breakup|ব্রেকআপ|ছেড়ে দিয়েছে|ভালোবাসা হারিয়েছি)\b/i, label: "heartbreak_story", priority: 10 },
  { pattern: /\b(career|job|freelance|fiverr|skill|চাকরি|ক্যারিয়ার|কাজ)\b/i, label: "career_advice", priority: 8 },
  { pattern: /\b(pinky|recharge|gift|money for|টাকা দিও না|invest|invest করিস না)\b/i, label: "relationship_warning", priority: 9 },
  { pattern: /\b(save money|budget|broke|টাকা নেই|save কর|debt|ঋণ|ধার)\b/i, label: "money_warning", priority: 8 },
  { pattern: /\b(you can do it|believe|তুই পারবি|তুমি পারবে|go for it|keep going|সাহস কর)\b/i, label: "encouragement", priority: 7 },
  { pattern: /\b(truth|reality|wake up|সত্যি কথা|honest|be real|মুখোশ খোলো)\b/i, label: "harsh_truth", priority: 6 },
  { pattern: /\b(ha ha|haha|lol|😂|হাহা|funny|joke|মজা|🤣)\b/i, label: "joke", priority: 5 },
  { pattern: /\b(my life|আমার জীবনে|আমিও|personal|share করি|boli)\b/i, label: "personal_story", priority: 4 },
  { pattern: /\b(angry|frustrated|রাগ|বিরক্ত|fed up|thikthik|stop|enough)\b/i, label: "anger", priority: 6 },
  { pattern: /\b(do this|koro|করো|তুই এখন|please|একটু)\b/i, label: "command", priority: 3 },
  { pattern: /\b(okay|theek|ভালো|good|fine|how are you|ki korcho|ki holo)\b/i, label: "support", priority: 2 },
];

export function classifyMessage(text: string): MessageClassification {
  let bestLabel: MessageClassification = "unknown";
  let bestPriority = -1;

  for (const rule of RULES) {
    if (rule.pattern.test(text) && rule.priority > bestPriority) {
      bestLabel = rule.label;
      bestPriority = rule.priority;
    }
  }

  return bestLabel;
}
