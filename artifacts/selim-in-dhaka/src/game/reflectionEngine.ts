import { SelimMood, MemoryItem } from "../ai/types";

const DIARY_TEMPLATES: Record<SelimMood, string[]> = {
  happy: [
    "আজকে বন্ধুর সাথে কথা বলে মনটা অনেক ভালো হলো। হয়তো সব ঠিক হয়ে যাবে।",
    "আজকের দিনটা একটু better ছিলো। Laugh করলাম, কথা বললাম।",
  ],
  sad: [
    "আজকে মনটা ভারী। সব কিছু একটু কঠিন লাগছে।",
    "Pinky-র কথা মনে পড়লো বার বার। কিন্তু বন্ধু ছিলো পাশে।",
  ],
  defensive: [
    "সবাই বলে আমি ভুল করছি। হয়তো। কিন্তু আমার মনে হচ্ছে আমি ঠিক।",
    "আজকে একটু argument হলো। কিন্তু আমার point আছে।",
  ],
  romantic: [
    "Pinky-র সাথে আজকে... ঠিক না। কিন্তু মনে পড়ছে।",
    "Love is complicated। কিন্তু feel করাটা থামানো যায় না।",
  ],
  hopeful: [
    "আজকে একটু hope দেখলাম। Career-এ কিছু হতে পারে।",
    "বন্ধু বললো believe করতে। Try করবো।",
  ],
  ashamed: [
    "আজকে কিছু ভুল করলাম। মনে লাগছে।",
    "Promise ভেঙে ফেললাম। কিন্তু পরে সামলাবো।",
  ],
  grateful: [
    "আজকে বন্ধুর জন্য অনেক grateful। এই friendship টা real।",
    "কিছু মানুষ আছে যারা সত্যিই care করে। বন্ধু তাদের একজন।",
  ],
  silent: [
    "আজকে কথা বলতে ইচ্ছে করলো না। নিজের মধ্যে ছিলাম।",
    "চুপ থাকাটাও একটা উত্তর।",
  ],
  angry: [
    "আজকে রাগ লাগছিলো। কারণ আছে।",
    "সব কিছু frustrating লাগছিলো। কিন্তু কাল নতুন দিন।",
  ],
  confused: [
    "আজকে অনেক কিছু গুলিয়ে গেলো। Pinky? Career? কী চাই আমি?",
    "Life-এর direction নিয়ে confused। কিন্তু চলছে।",
  ],
};

export function generateDiaryEntry(day: number, mood: SelimMood, memories: MemoryItem[]): string {
  const base = DIARY_TEMPLATES[mood]?.[Math.floor(Math.random() * 2)] ?? "আজকের দিন কেটে গেলো।";

  const memRef =
    memories.length > 0 && Math.random() < 0.4
      ? ` (আজকে মনে পড়লো: ${memories[0].content.slice(0, 50)}...)`
      : "";

  return `Day ${day}: ${base}${memRef}`;
}

const CONTINUITY_RECAPS: string[] = [
  "গতকাল যা কথা হয়েছিলো — মনে আছে তোর?",
  "কাল তুই বলেছিলি অনেক কিছু। ভাবছিলাম।",
  "গতকালের সেই moment-টা এখনো মাথায় আছে।",
];

const MEMORY_MOMENTS: string[] = [
  "Selim remembered something you said...",
  "সেলিম মনে করলো পুরনো কথা...",
  "একটা কথা মনে পড়ছে তোর...",
];

export function getDailyContinuityRecap(day: number, hasMemories: boolean): string | null {
  if (day === 1) return null;
  if (Math.random() > 0.6) return null;
  const base = CONTINUITY_RECAPS[Math.floor(Math.random() * CONTINUITY_RECAPS.length)];
  return base;
}

export function getMemoryMomentText(): string {
  return MEMORY_MOMENTS[Math.floor(Math.random() * MEMORY_MOMENTS.length)];
}
