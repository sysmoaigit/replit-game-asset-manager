import { GameState } from "../types";

export type Ending = {
  id: string;
  name: string;
  messageBangla: string;
  whyBangla: string;
  isGood?: boolean;
  condition: (state: GameState) => boolean;
};

// Ending IDs considered good outcomes — used for confetti, music, and screen styling.
export const GOOD_ENDING_IDS = new Set([
  "bogura_boss", "friendship_saved", "finally_listened", "smart_survivor",
  "healthy_selim", "healthy_love_ready", "recovery_hero", "biryani_king",
  "influencer", "career_before_dear", "permanent_girl", "self_respect_reborn",
  "heartbreak_recovery", "mature_selim", "tisha_real_love", "almost_kiss",
]);

// Evaluated in order — first match wins. Best/most specific conditions first,
// fallback last. Add new endings ABOVE the fallback.
export const ENDINGS: Ending[] = [
  // ── BEST ENDINGS ─────────────────────────────────────────────────────────
  {
    id: "bogura_boss",
    name: "Bogura Boss 👑",
    messageBangla:
      "সেলিম ঢাকায় এসেছিলো স্বপ্ন নিয়ে। ১৫ দিন পরে সেই স্বপ্ন ঠিকানা পেয়েছে। Career গরম, Self-Respect পূর্ণ — এটাই আসল Bogura Boss। Wallet ICU-তে যায়নি, মাথা নিচু হয়নি।",
    whyBangla:
      "Career Progress ৭৫+ এবং Self Respect ৭০+ পৌঁছে গেছ। Selim নিজের পথ নিজে বেছে নিয়েছে।",
    isGood: true,
    condition: (s) => s.stats.careerProgress >= 75 && s.stats.selfRespect >= 70,
  },
  // ── ROOFTOP ROMANCE ARC: THE ALMOST-KISS ─────────────────────────────────
  // Placed early (before broad selfRespect/money endings) so the specific
  // almostKissUnlocked flag reliably wins when earned.
  {
    id: "almost_kiss",
    name: "The Almost-Kiss 💋",
    messageBangla:
      "সেলিম জানতো সেই মুহূর্তে সব ভুলে যাওয়া মানে কী। মামার হাতের চায়ের কাপ, রিতুর চোখের ভাষা, ছাদের মোমবাতি — সব chaos-এর মাঝে ও সত্যি কথা বললো। Almost-kiss হলো না — মামা আগেই চায়ের কাপ তুললেন। কিন্তু রিতু সেদিন নামতে নামতে একবার পিছনে তাকিয়েছিলো। সেটাই যথেষ্ট।",
    whyBangla:
      "Rooftop date-এর chaos-এ সাহস করে সত্যি কথা বলেছ। Almost-Kiss path choose করেছ। Self Respect ৫০+।",
    isGood: true,
    condition: (s) =>
      s.flags.almostKissUnlocked >= 1 &&
      s.stats.selfRespect >= 50,
  },
  {
    id: "friendship_saved",
    name: "Friendship Saved Him 🌟",
    messageBangla:
      "Pinky-র 'hmm' সেলিমকে ভাঙতে পারেনি কারণ রাফিক ছিলো। বন্ধু টাকা না — সময় দিয়েছে। সেলিম বুঝলো: real friendship > first love। Recharge-এর চেয়ে বেশি দামি।",
    whyBangla:
      "Friend Trust ৮৫+ এবং Best Friend Moments ৫+। রাফিকের সাথে সৎ থেকে বারবার সাহায্য নিয়েছ।",
    isGood: true,
    condition: (s) => s.stats.friendTrust >= 85 && s.flags.bestFriendMoments >= 5,
  },
  {
    id: "finally_listened",
    name: "Selim Finally Listened ✅",
    messageBangla:
      "৭ বার override, ১২ বার 'তুই বুঝবি না' — তবু শেষে সেলিম শুনলো। বন্ধু সব বোঝে না, কিন্তু তোমার চেয়ে বেশি দেখে। Selim phone সোজা করে রাখলো।",
    whyBangla:
      "Player Advice ১০+ বার মানা হয়েছে। Self Respect ৬০+ এবং Emotional Delusion ৪৫-এর নিচে।",
    isGood: true,
    condition: (s) =>
      s.flags.playerAdviceFollowed >= 10 &&
      s.stats.selfRespect >= 60 &&
      s.stats.emotionalDelusion <= 45,
  },
  {
    id: "smart_survivor",
    name: "স্মার্ট সারভাইভার 🏆",
    messageBangla:
      "সেলিম এখন ঢাকার আসল বস! পকেটও গরম, মাথাও ঠান্ডা। বিরিয়ানি খেয়েছে, Pinky দেখেছে, রিকশা negotiate করেছে — এবং টিকে গেছে।",
    whyBangla:
      "Health ৬০+, Money ৫০০+, IQ ৫৫+, Addiction ৩০-এর নিচে। সব দিক balanced রেখেছ।",
    isGood: true,
    condition: (s) =>
      s.stats.health >= 60 &&
      s.stats.money >= 500 &&
      s.stats.iq >= 55 &&
      s.stats.addiction <= 30,
  },
  {
    id: "healthy_selim",
    name: "সুস্থ সেলিম 💪",
    messageBangla:
      "ঢাকার ধুলোবালি আর ভেজাল খাবার সেলিমের কিছুই করতে পারেনি। একদম ফিট এক যুবক! 'Health is wealth' — এই কথা এখন সে বোঝে।",
    whyBangla:
      "Health ৭৫+ এবং Addiction ২০-এর নিচে। নিজের শরীরকে ভালোবেসেছ।",
    isGood: true,
    condition: (s) => s.stats.health >= 75 && s.stats.addiction <= 20,
  },
  {
    id: "healthy_love_ready",
    name: "Healthy Love Ready 💚",
    messageBangla:
      "Pinky ছিলো obsession — Nila হলো connection। সেলিম বুঝলো ভালোবাসা মানে recharge না, বোঝাপড়া। এখন সে ready — সত্যিকারের সম্পর্কের জন্য।",
    whyBangla:
      "Self Respect ৬৫+ এবং Pinky Hope ৩০-এর নিচে। Friend Trust ৫৫+। নতুন শুরুর জন্য তৈরি।",
    isGood: true,
    condition: (s) =>
      s.stats.selfRespect >= 65 &&
      s.stats.pinkyHope <= 30 &&
      s.stats.friendTrust >= 55,
  },
  {
    id: "recovery_hero",
    name: "কামব্যাক হিরো 💎",
    messageBangla:
      "খাদে পড়ে গিয়েও যে উঠে দাঁড়াতে পারে, সে-ই তো আসল হিরো! সেলিম তার প্রমাণ। Recovery মানে দুর্বলতা না — সাহস।",
    whyBangla:
      "Recovery Mode complete করেছ। Health ৫৫+ এ ফিরে এসেছ। Addiction ৪৫-এর নিচে।",
    isGood: true,
    condition: (s) =>
      s.flags.recoveryTriggered &&
      s.stats.health >= 55 &&
      s.stats.addiction <= 45,
  },
  {
    id: "biryani_king",
    name: "বিরিয়ানি কিং 🍛",
    messageBangla:
      "পুরান ঢাকার এমন কোনো দোকান নাই যেখানে সেলিম বিরিয়ানি খায় নাই। Wallet কাঁদলেও Mood সবসময় happy। জীবনে ছোট আনন্দ বড় কথা।",
    whyBangla:
      "৫+ বার বিরিয়ানি খেয়েছ এবং Mood ৫০+। পুরো ঢাকার খাদ্য-সংস্কৃতি উপভোগ করেছ।",
    isGood: true,
    condition: (s) =>
      s.flags.biryaniCount >= 5 && s.stats.mood >= 50 && s.stats.money > -500,
  },
  {
    id: "influencer",
    name: "ভাইরাল সেলিম ⭐",
    messageBangla:
      "পুরো এলাকা সেলিমের নামে পাগল! সবাই চিনে, সবাই ভালোবাসে। ১৫ দিনে Bogura-র ছেলে Dhaka-র face হয়ে গেলো।",
    whyBangla:
      "Reputation ৭৫+ পৌঁছে গেছে। এলাকায় নিজের পরিচয় তৈরি করেছ।",
    isGood: true,
    condition: (s) => s.stats.reputation >= 75,
  },

  // ── BITTERSWEET / NEUTRAL ─────────────────────────────────────────────────
  {
    id: "career_before_dear",
    name: "Career Before Dear 💼",
    messageBangla:
      "Pinky কে? সেলিম এখন Fiverr top rated। প্রেম হবে — সঠিক সময়ে, সঠিক মানুষের সাথে। এখন career আগে। মা গর্বিত।",
    whyBangla:
      "Career Progress ৫৫+ এবং IQ ৫৫+। সেলিম আবেগের আগে বুদ্ধি রেখেছে।",
    isGood: true,
    condition: (s) =>
      s.stats.careerProgress >= 55 &&
      s.stats.iq >= 55 &&
      s.stats.pinkyHope <= 55,
  },
  {
    id: "permanent_girl",
    name: "Permanent Girl After Stability 💍",
    messageBangla:
      "সেলিম শেষমেশ বুঝলো — stable না হলে relationship টেকে না। ঠিকঠাক ঘর, ঠিকঠাক কাজ, তারপর 'শেষ প্রেম।' গল্প শেষ না, শুরু মাত্র।",
    whyBangla:
      "Money ৮০০+ এবং Career Progress ৪৫+। Self Respect ৫০+। সেলিমের ভিত তৈরি হয়েছে।",
    condition: (s) =>
      s.stats.money >= 800 &&
      s.stats.careerProgress >= 45 &&
      s.stats.selfRespect >= 50,
  },
  {
    id: "self_respect_reborn",
    name: "Self Respect Reborn 🛡️",
    messageBangla:
      "সেলিম শিখলো — ভালোবাসা ভিক্ষা না। Pinky Hope নাই, কিন্তু নিজের প্রতি সম্মান full bar। ঢাকা মাথা নিচু করলো। Selim মাথা তুললো।",
    whyBangla:
      "Self Respect ৭০+ এবং Pinky Boundary Wins ২+। 'না' বলতে শিখেছ।",
    condition: (s) =>
      s.stats.selfRespect >= 70 &&
      s.flags.pinkyBoundaryWins >= 2,
  },
  {
    id: "heartbreak_recovery",
    name: "Heartbreak Recovery 🌱",
    messageBangla:
      "Pinky চলে গেছে। কিন্তু সেলিম থেকে গেছে। কষ্ট ছিলো — সত্যি। কিন্তু কষ্টও শেষে হয়। ছাদে দাঁড়িয়ে ঢাকার আলো দেখলো। নতুন দিন।",
    whyBangla:
      "Heartbreak হয়েছে কিন্তু Self Respect ৫০+ নিয়ে ফিরে এসেছ। Mood ৪৫+।",
    condition: (s) =>
      s.flags.heartbreakCount >= 1 &&
      s.stats.selfRespect >= 50 &&
      s.stats.mood >= 45,
  },

  // ── FUNNY-BAD / CAUTIONARY ────────────────────────────────────────────────
  {
    id: "touba_loop",
    name: "Touba Loop 🔄",
    messageBangla:
      "সেলিম ১১ বার Touba করেছে। ১১ বার ভেঙেছে। ১২তম Touba চলছে। 'এইবার সত্যি সত্যি।' পরের Touba-র তারিখ: TBD।",
    whyBangla:
      "Promise Broken ৫+ বার এবং Recharge Promise ২+ বার ভেঙেছ। Touba loop চলছেই।",
    condition: (s) =>
      s.flags.brokenPromiseCount >= 5 && s.flags.rechargePromisesBroken >= 2,
  },
  {
    id: "recharge_romeo",
    name: "Recharge Romeo Legendary 📲",
    messageBangla:
      "সেলিমের wallet এখন একটা monthly subscription। Pinky-র জন্য recharge, data, খাবার, রিকশা। ROI: 'tumi valo aso'। Legendary investment strategy। Wallet ICU-তে।",
    whyBangla:
      "Pinky-কে ৫+ বার recharge দিয়েছ। Girl Investment ১৫০০+। Emotional Delusion ৭০+।",
    condition: (s) =>
      s.flags.pinkyRechargeCount >= 5 &&
      s.flags.girlInvestment >= 1500 &&
      s.stats.emotionalDelusion >= 70,
  },
  {
    id: "emotional_atm",
    name: "Emotional ATM Premium 💸",
    messageBangla:
      "সেলিম এখন একটা monthly recharge plan। Pinky happy, Selim broke। Wedding plan শুধু সেলিমের মাথায় সাজানো হয়েছে — Pinky-র profile-এ 'Single' লেখা।",
    whyBangla:
      "Pinky Happiness ৬০+ কিন্তু Self Respect ৩০-এর নিচে। Girl Investment ১৫০০+।",
    condition: (s) =>
      s.stats.pinkyHappiness >= 60 &&
      s.flags.girlInvestment >= 1500 &&
      s.stats.selfRespect <= 30,
  },
  {
    id: "first_love_unlimited",
    name: "First Love Unlimited 💘",
    messageBangla:
      "সেলিম জীবনে ১০+ বার 'এই বার সিরিয়াস' বলেছে। প্রতিবার নতুন crush, প্রতিবার নতুন 'last recharge।' Loyalty defined: enthusiastically confused।",
    whyBangla:
      "First Love Count ৮+ বার। Random Crush ৪+। Romantic Fever সবসময় high।",
    condition: (s) =>
      s.flags.firstLoveCount >= 8 && s.stats.romanticFever >= 60,
  },
  {
    id: "pinky_maybe_forever",
    name: "Pinky Maybe Forever 💭",
    messageBangla:
      "Pinky বললো 'maybe।' সেলিম এই 'maybe'-তে মাস পার করলো। এখনো বিশ্বাস করে। 'Maybe মানে hope আছে।' Statistics agree করে না। কিন্তু সেলিম কি মানে?",
    whyBangla:
      "Pinky Hope ৮০+ এবং Emotional Delusion ৭৫+। 'maybe'-এর উপর টিকে আছে।",
    condition: (s) =>
      s.stats.pinkyHope >= 80 && s.stats.emotionalDelusion >= 75,
  },
  {
    id: "pinky_game_over",
    name: "Pinky Effect Game Over 💔",
    messageBangla:
      "সেলিম phone ulta kore rakhlo। Notification off। এক সপ্তাহ পর Pinky-র নতুন profile picture — অন্য কেউ। সেলিম শুধু বললো: 'এটা expect করাই উচিত ছিলো।'",
    whyBangla:
      "Pinky Hope ৭০+ ছিলো কিন্তু Heartbreak Count ৩+। আশা বেশি ছিলো, বাস্তবতা কম।",
    condition: (s) =>
      s.flags.heartbreakCount >= 3 &&
      s.stats.pinkyHope >= 70 &&
      s.stats.selfRespect <= 35,
  },
  {
    id: "silent_selim",
    name: "Silent Selim 🤐",
    messageBangla:
      "সেলিম এখন আর কিছু বলে না। Phone রাখে, conversation এড়ায়। Selim phone ulta kore rakhlo — permanently। ভেতরে কী চলছে, সে নিজেও জানে না।",
    whyBangla:
      "Silent Moments ৫+ এবং Mood ৩০-এর নিচে। Friend Trust ৩৫-এর নিচে। একা থেকে গেছে।",
    condition: (s) =>
      s.flags.silentMoments >= 5 &&
      s.stats.mood <= 30 &&
      s.stats.friendTrust <= 35,
  },
  {
    id: "bestfriend_broke",
    name: "Best Friend But Broke 🤝💸",
    messageBangla:
      "রাফিক সেলিমকে বাঁচিয়েছে। আর সেলিম রাফিকের জন্য ভেঙেছে। টাকা নেই, কিন্তু যা আছে তা অনেক। সত্যিকারের বন্ধুত্ব — অর্থহীন কিনা?",
    whyBangla:
      "Friend Trust ৭৫+ কিন্তু Money ০ বা নেগেটিভ। ভালো বন্ধু পেয়েছ, বাজেট হারিয়েছ।",
    condition: (s) => s.stats.friendTrust >= 75 && s.stats.money <= 0,
  },

  // ── TISHA ROMANCE ARC ──────────────────────────────────────────────────────
  {
    id: "tisha_real_love",
    name: "Tisha & Selim — Real Love 💞",
    messageBangla:
      "Tisha শুধু একটা girlfriend ছিলো না — সে সেলিমের আয়না ছিলো। ছাদের সেই রাতে দুজনে কাঁদলো, একসাথে হাসলো, একসাথে চুপ থাকলো। সেলিম প্রথমবার বুঝলো ভালোবাসা মানে recharge না, presence। এই বার সত্যি real।",
    whyBangla:
      "Tisha Trust ২০+, Tisha Intimacy ৬+, Partner Honesty ৩+, Self Respect ৬০+। Pinky-কে boundary দিয়েছ এবং Tisha-র সাথে সৎ থেকেছ।",
    isGood: true,
    condition: (s) =>
      s.flags.tishaTrust >= 20 &&
      s.flags.tishaIntimacy >= 6 &&
      s.flags.partnerHonesty >= 3 &&
      s.stats.selfRespect >= 60,
  },
  {
    id: "tisha_drift",
    name: "Tisha Drifted Away 🥀",
    messageBangla:
      "Tisha অপেক্ষা করেছিলো — phone ধরবে, honest থাকবে, present থাকবে। হলো না। সে এক রাতে message করলো — 'তুমি ভালো মানুষ, কিন্তু এখনো ready না। আমি অপেক্ষা করতে পারবো না।' সেলিম reply টাইপ করলো, পাঠালো না।",
    whyBangla:
      "Tisha-র সাথে ৩+ বার মিথ্যা বা defensive moment হয়েছে, Tisha Trust ৫-এর নিচে। প্রতিটা ছোট choice যোগ হয়েছে।",
    condition: (s) =>
      s.flags.tishaMet >= 1 &&
      s.flags.tishaTrust < 5 &&
      (s.flags.liesTold + s.flags.defensiveMoments) >= 3,
  },

  // ── PHARMACY ARC: MATURE SELIM ─────────────────────────────────────────────
  {
    id: "mature_selim",
    name: "Mature Selim 🌱",
    messageBangla:
      "Pharmacy-র সেই রাতে সেলিম প্রথমবার চুপ করে শুনলো। তারপর সত্যি sleep, সত্যি খাবার, সত্যি কথা — সব ঠিক করলো। Tisha বুঝলো — এই ছেলেটা আর hero pretend করছে না, এই ছেলেটা সত্যি grow করছে। 'Ei bar real' — এই বার সত্যি হলো।",
    whyBangla:
      "Pharmacy ঘটনার পর Lifestyle Progress ৩+ এবং Partner Honesty ২+। Self Respect ৬৫+। Selim shortcut বেছে নেয়নি — সে নিজেকে বেছে নিয়েছে।",
    isGood: true,
    condition: (s) =>
      s.flags.pharmacyVisited >= 1 &&
      s.flags.lifestyleProgress >= 3 &&
      s.flags.partnerHonesty >= 2 &&
      s.stats.selfRespect >= 65,
  },

  // ── FALLBACK ────────────────────────────────────────────────────────────────
  {
    id: "lost_selim",
    name: "হারিয়ে যাওয়া সেলিম 😔",
    messageBangla:
      "ঢাকা শহরের জ্যাম আর জীবনযুদ্ধে সেলিম একটু খেই হারিয়ে ফেললো। তবে কাল নতুন দিন। আবার শুরু করা যায়।",
    whyBangla:
      "কোনো নির্দিষ্ট ending-এর condition পূরণ হয়নি। Selim-এর জীবন complex — আবার চেষ্টা করো।",
    condition: () => true,
  },
];
