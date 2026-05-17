import { ContextPacket, SelimBrainResponse, SelimMood, MessageClassification } from "./types";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DIALOGUE_BANKS: Record<MessageClassification, Record<string, string[]>> = {
  support: {
    high_trust: [
      "ভাই, তোর কথা শুনলে মনে হয় কেউ সত্যিই care করে। Thanks।",
      "তুই যে আছিস — এটাই অনেক কিছু। সত্যিই।",
      "বন্ধু, তোর support ছাড়া এই শহরে টিকতাম না।",
    ],
    low_trust: [
      "Hmm। দেখি।",
      "Okay।",
      "হ্যাঁ।",
    ],
    default: [
      "Thanks ভাই। মনটা একটু ভালো লাগলো।",
      "তুই বুঝিস। সেটাই অনেক।",
      "হ্যাঁ, এইটুকু support-ই দরকার ছিলো।",
    ],
  },
  harsh_truth: {
    high_trust: [
      "ভাই, তুই সঠিক বলছিস। কিন্তু শুনতে কঠিন লাগছে।",
      "হ্যাঁ... আমি জানি। মাথায় ঢুকছে না কিন্তু।",
      "তুই যদি বলিস, তাহলে ভাবতে হবে। ঠিকাছে।",
    ],
    defensive: [
      "তুই বুঝবি না। আমার situation আলাদা।",
      "ভাই, এতো judgement দিস না।",
      "আমি জানি কি করছি। কিছুটা।",
    ],
    default: [
      "Hmm। এইটা নিয়ে ভাবতে হবে।",
      "কঠিন সত্যি। কিন্তু হয়তো ঠিক।",
      "তুই কি সব সময় এতো সিরিয়াস?",
    ],
  },
  career_advice: {
    high_career: [
      "হ্যাঁ ভাই, career-টা important। আমি চেষ্টা করছি।",
      "Freelancing-টা কাজে লাগছে। তুই বলছিলি তখন।",
      "Career first, Pinky later। আমিও এখন এটা মানি।",
    ],
    default: [
      "Career নিয়ে তুই ঠিকই বলিস। কিন্তু time দরকার।",
      "হ্যাঁ, skill build করাটা জরুরি। জানি।",
      "Fiverr-এ একটা proposal দিয়েছি। দেখা যাক।",
    ],
  },
  relationship_warning: {
    romantic: [
      "ভাই, Pinky-র ব্যাপারটা আলাদা। তুই বুঝবি না।",
      "ও আমার জন্য special। এইটা তুই feel করবি না।",
      "Seen করেছে মানে read করেছে। Read মানে care।",
    ],
    high_trust: [
      "তুই ঠিক বলছিস। কিন্তু এত সহজ না ছেড়ে দেওয়া।",
      "জানি, আমি একটু বেশি invest করছি। কিন্তু কি করবো?",
      "হয়তো Pinky সত্যিই right person না। কিন্তু...",
    ],
    default: [
      "Hmm। এইটা নিয়ে ভাববো।",
      "তুই কি সব সময় এতো realistic?",
      "একটু hopeful থাকতে দে।",
    ],
  },
  money_warning: {
    broke: [
      "হ্যাঁ ভাই, টাকার situation খারাপ। জানি।",
      "Budget করতে হবে। তুই ঠিকই বলিস।",
      "Pinky-কে recharge দেওয়া বন্ধ করবো। Promise।",
    ],
    default: [
      "টাকা manage করাটা কঠিন ঢাকায়।",
      "হ্যাঁ, save করার চেষ্টা করছি।",
      "Budget থাকলে ভালো হতো।",
    ],
  },
  joke: {
    happy: [
      "হাহাহা! ভাই, তুই না থাকলে এই জীবন boring হয়ে যেতো!",
      "😂 এইটা share করতে হবে মেসে!",
      "ভাই, তুই আমার best entertainer!",
    ],
    default: [
      "হাহা, ভালো joke!",
      "😄 দারুণ!",
      "তোর সাথে কথা বললে মন ভালো হয়।",
    ],
  },
  personal_story: {
    high_trust: [
      "তোর কথা শুনে মনে হলো তুইও অনেক কিছু গেছিস দিয়ে।",
      "ভাই, তুইও এই struggle করেছিস? তাহলে তুই সত্যিই বুঝিস।",
      "এইটা মনে রাখবো। তোর experience valuable।",
    ],
    default: [
      "তোর কথা শুনে ভালো লাগলো।",
      "সবার জীবনে এরকম হয়।",
      "তুই share করলি, thanks।",
    ],
  },
  heartbreak_story: {
    empathy: [
      "ভাই, তুইও heartbreak সামলেছিস? তাহলে জানিস কতটা কঠিন।",
      "সেটা শুনে কষ্ট লাগলো। সত্যিই।",
      "তুই এত কষ্ট পেয়েছিস, তবুও আমার পাশে আছিস — respect।",
    ],
    default: [
      "এই কষ্টটা real। বুঝি।",
      "ভাই, কষ্ট সামলানো সহজ না।",
      "তুই strong। এইটা দেখাচ্ছে।",
    ],
  },
  anger: {
    high_trust: [
      "ভাই, তুই রাগ করছিস আমার উপর। আমি বুঝি।",
      "তুই ঠিকই রাগ করছিস। আমি মাঝে মাঝে stupid decision নিই।",
      "Sorry ভাই। সত্যি।",
    ],
    defensive_selim: [
      "আমি কি ভুল করলাম? বল।",
      "তোর রাগ দেখে আমিও একটু upset।",
      "কিন্তু আমি যা করছি সেটা আমার জন্য best মনে হচ্ছে।",
    ],
    default: [
      "Okay। আমি বুঝলাম।",
      "ঠিকাছে, ঠিকাছে।",
      "তুই calm হ আগে।",
    ],
  },
  encouragement: {
    high_trust: [
      "ভাই, তোর এই কথা শুনে মনে হলো আমি পারবো।",
      "তুই believe করিস — এইটাই আমার fuel।",
      "Thanks। সত্যিই। তুই না থাকলে হতাশ হয়ে যেতাম।",
    ],
    default: [
      "ভালো লাগলো শুনে।",
      "তুই সব সময় এরকম positive।",
      "চেষ্টা করবো।",
    ],
  },
  command: {
    high_trust: [
      "ঠিকাছে ভাই, তুই যা বলছিস করবো।",
      "Okay, okay। মানলাম।",
      "তোর command follow করবো এই বার।",
    ],
    default: [
      "দেখি।",
      "চেষ্টা করবো।",
      "Hmm।",
    ],
  },
  unknown: {
    default: [
      "ভাই, exactly কি বলতে চাইছিস?",
      "একটু বিস্তারিত বল।",
      "Hmm, বুঝলাম না পুরো।",
    ],
  },
};

const MEMORY_REFERENCES: string[] = [
  "তুই একবার বলেছিলি — এখন মনে পড়ছে।",
  "আগে এই ব্যাপারটা নিয়ে কথা হয়েছিলো না?",
  "এইটা তোর সেই advice-এর মতোই।",
  "তোর কথা মনে আছে আমার।",
];

const ASK_PLAYER_PROMPTS: string[] = [
  "ভাই, তোর জীবনেও কি এরকম হইছে কোনোদিন?",
  "তুই কি কখনো এই situation-এ ছিলিস?",
  "তোর কি মনে হয় এইটা normal?",
  "তোর life-এ এরকম কেউ আছে?",
];

function getMoodFromContext(packet: ContextPacket): SelimMood {
  const { friendTrust, pinkyHope, selfRespect, classification } = packet;

  if (classification === "joke") return "happy";
  if (classification === "anger") return friendTrust > 60 ? "ashamed" : "defensive";
  if (classification === "heartbreak_story") return "grateful";
  if (classification === "encouragement") return "hopeful";
  if (classification === "harsh_truth") {
    if (friendTrust < 40) return "defensive";
    if (selfRespect > 60) return "grateful";
    return "confused";
  }
  if (classification === "relationship_warning") {
    if (pinkyHope > 70) return "romantic";
    return "confused";
  }
  if (pinkyHope > 80) return "romantic";
  if (selfRespect > 70) return "hopeful";
  if (friendTrust > 75) return "grateful";
  return "confused";
}

function getStatEffects(
  classification: MessageClassification,
  friendTrust: number,
  pinkyHope: number,
): SelimBrainResponse["statEffects"] {
  switch (classification) {
    case "support":
      return { friendTrust: friendTrust < 50 ? 2 : 3, mood: 3 };
    case "harsh_truth":
      return friendTrust > 60
        ? { selfRespect: 3, emotionalDelusion: -4, friendTrust: 1 }
        : { friendTrust: -2, emotionalDelusion: 2 };
    case "career_advice":
      return { careerProgress: 2, iq: 1 };
    case "relationship_warning":
      return pinkyHope > 70
        ? { friendTrust: -1, emotionalDelusion: 3 }
        : { selfRespect: 2, pinkyHope: -3 };
    case "money_warning":
      return { friendTrust: 1, mood: -2 };
    case "joke":
      return { mood: 5, friendTrust: 2, loneliness: -3 } as SelimBrainResponse["statEffects"];
    case "heartbreak_story":
      return { friendTrust: 4, emotionalDelusion: -2 };
    case "encouragement":
      return { mood: 5, friendTrust: 3, selfRespect: 2 };
    case "anger":
      return friendTrust > 60 ? { friendTrust: -3, mood: -5 } : { friendTrust: -5, mood: -8 };
    case "personal_story":
      return { friendTrust: 3 };
    default:
      return {};
  }
}

function selectDialogue(packet: ContextPacket): string {
  const { classification, friendTrust, pinkyHope, selfRespect, mood } = packet;
  const bank = DIALOGUE_BANKS[classification] ?? DIALOGUE_BANKS.unknown;

  if (classification === "support") {
    return friendTrust > 65 ? pick(bank.high_trust) : pick(bank.default);
  }
  if (classification === "harsh_truth") {
    if (mood === "defensive" || selfRespect < 35) return pick(bank.defensive);
    if (friendTrust > 65) return pick(bank.high_trust);
    return pick(bank.default);
  }
  if (classification === "career_advice") {
    return packet.activeArc === "career" ? pick(bank.high_career) : pick(bank.default);
  }
  if (classification === "relationship_warning") {
    if (pinkyHope > 75) return pick(bank.romantic);
    if (friendTrust > 65) return pick(bank.high_trust);
    return pick(bank.default);
  }
  if (classification === "money_warning") {
    const stats_money_low = packet.currentDay > 5;
    return stats_money_low ? pick(bank.broke) : pick(bank.default);
  }
  if (classification === "joke") {
    return mood === "happy" ? pick(bank.happy) : pick(bank.default);
  }
  if (classification === "personal_story") {
    return friendTrust > 65 ? pick(bank.high_trust) : pick(bank.default);
  }
  if (classification === "heartbreak_story") {
    return pick(bank.empathy ?? bank.default);
  }
  if (classification === "anger") {
    if (friendTrust > 65) return pick(bank.high_trust);
    if (selfRespect < 40) return pick(bank.defensive_selim ?? bank.default);
    return pick(bank.default);
  }
  if (classification === "encouragement") {
    return friendTrust > 65 ? pick(bank.high_trust) : pick(bank.default);
  }
  if (classification === "command") {
    return friendTrust > 65 ? pick(bank.high_trust) : pick(bank.default);
  }

  return pick(bank.default ?? ["Hmm।"]);
}

export function runLocalSelimBrain(packet: ContextPacket): SelimBrainResponse {
  const addr = packet.playerProfile.address;
  let reply = selectDialogue(packet);

  reply = reply.replace(/ভাই/g, addr);

  if (
    packet.relevantMemories.length > 0 &&
    packet.friendTrust > 45 &&
    Math.random() < 0.3
  ) {
    const memRef = pick(MEMORY_REFERENCES);
    reply = `${reply} ${memRef}`;
  }

  const shouldAsk =
    packet.friendTrust > 50 &&
    (packet.classification === "personal_story" ||
      packet.classification === "heartbreak_story" ||
      packet.classification === "encouragement") &&
    Math.random() < 0.25;

  const followUpPrompt = shouldAsk ? pick(ASK_PLAYER_PROMPTS) : null;

  const moodAfter = getMoodFromContext(packet);
  const statEffects = getStatEffects(packet.classification, packet.friendTrust, packet.pinkyHope);

  const voiceMap: Partial<Record<MessageClassification, string>> = {
    joke: "achievement",
    heartbreak_story: "heartbreak",
    encouragement: "trust_up",
    anger: "override",
    support: "trust_up",
  };
  const suggestedVoiceTrigger = voiceMap[packet.classification];

  return {
    reply,
    moodAfter,
    statEffects,
    suggestedVoiceTrigger,
    followUpPrompt,
    isAskingPlayer: shouldAsk,
  };
}
