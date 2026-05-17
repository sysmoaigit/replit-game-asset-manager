// selimMoments.ts — 19 photo-driven story beats, one per photo asset.
// Each moment becomes a cinematic chapter in Selim's 15-day Dhaka story.

import type { SceneKey } from "./assets";
import type { Stats, Flags } from "../types";

export type MomentChoice = {
  label: string;
  sublabel?: string;
  effects: Partial<Stats>;
  selimReaction: string;
  flagUpdate?: Partial<Flags>;
};

export type SelimMoment = {
  id: string;
  sceneKey: SceneKey;
  chapter: number;
  title: string;
  titleBangla: string;
  caption: string;
  captionBangla: string;
  /** Day range when this moment naturally surfaces. */
  triggerDay: number;
  /** Brief setup: what just happened before this photo. */
  backstory: string;
  /** What's at stake for Selim in this moment. */
  atStake: string;
  /** 3-6 lines of narration in Selim's Banglish voice. */
  narration: string;
  /** Selim's spoken line shown in the subtitle bubble. */
  selimLine: string;
  /** 2-3 player advice choices. */
  choices: MomentChoice[];
  /** Short lesson / quote that lands in the Album. */
  lesson: string;
  lessonBangla: string;
};

export const SELIM_MOMENTS: SelimMoment[] = [
  // ─── CHAPTER 1 ───────────────────────────────────────────────────────────────
  {
    id: "moment_character_sheet",
    sceneKey: "characterSheet",
    chapter: 1,
    title: "Meet Selim",
    titleBangla: "সেলিমকে চেনো",
    caption: "Bogura's boy, Dhaka's new problem.",
    captionBangla: "বগুড়ার ছেলে, ঢাকার নতুন সমস্যা।",
    triggerDay: 1,
    backstory: "Selim has just stepped off the overnight bus from Bogura. He has ৳১২০০, one big bag, and a head full of unwritten futures.",
    atStake: "First impression of himself — confident hero or scared village boy?",
    narration: `নাম সেলিম। বগুড়ার ছেলে — গ্রাম না, শহর।
আব্বু বলেছিলেন 'ঢাকায় গেলে জীবন বদলে যাবে।'
মনে মনে ভেবেছিলাম career, টাকা, independence।
কিন্তু এখন কমলাপুর স্টেশনে দাঁড়িয়ে দেখছি —
ঢাকা আমার জন্য অপেক্ষা করেনি।
এটা আমাকে সে সুযোগও দেবে না।`,
    selimLine: "ঢাকা, আমি আইসা গেছি। তুই ready তো?",
    choices: [
      {
        label: "বড় স্বপ্ন নিয়ে এসেছি",
        sublabel: "Optimist mode",
        effects: { mood: 12, selfRespect: 8, emotionalDelusion: 10 },
        selimReaction: "আমি জানি আমি পারবো। Bogura Boss হওয়াটা শুধু সময়ের ব্যাপার।",
      },
      {
        label: "বাস্তববাদী থাকবো",
        sublabel: "Realist mode",
        effects: { iq: 8, selfRespect: 5, mood: 3 },
        selimReaction: "ঢাকা কঠিন। কিন্তু আমি prepared। এক স্টেপ এক সময়।",
      },
      {
        label: "আম্মুকে ফোন দিই",
        sublabel: "মায়ের দোয়া নিই",
        effects: { mood: 15, emotionalDelusion: -5, friendTrust: 3 },
        selimReaction: "আম্মু বললেন 'ভালো থেকো বাবা।' মনটা হালকা হয়ে গেলো।",
        flagUpdate: {},
      },
    ],
    lesson: "Every story starts with one brave step. Selim's step was getting on that bus.",
    lessonBangla: "প্রতিটা গল্প একটা সাহসী পদক্ষেপ দিয়ে শুরু হয়।",
  },

  // ─── CHAPTER 2 ───────────────────────────────────────────────────────────────
  {
    id: "moment_main",
    sceneKey: "main",
    chapter: 2,
    title: "Selim, The Protagonist",
    titleBangla: "সেলিম, নায়ক",
    caption: "He looks confident. He is not.",
    captionBangla: "দেখতে confident। আসলে না।",
    triggerDay: 1,
    backstory: "First night at the mess. The room smells of damp walls and old dreams. Selim stares at the ceiling.",
    atStake: "Who will Selim choose to be — the boy who left, or the man who arrives?",
    narration: `রাফিক বলেছিলো 'ভাই, ঢাকায় আসো, সব ঠিক হবে।'
ঢাকায় এলাম। সব ঠিক হয়নি — এখনো।
মেসের ছোট্ট রুমে শুয়ে বুঝলাম —
ঢাকা তোমাকে কিছু দেয় না বিনামূল্যে।
কিন্তু এই শহরে সবার জন্য একটা জায়গা আছে।
আমার জায়গাটা খুঁজে নিতে হবে।`,
    selimLine: "আমি hero না। কিন্তু আমার গল্পটা hero-র।",
    choices: [
      {
        label: "নতুন শুরুর জন্য excited",
        effects: { mood: 10, energy: 8, romanticFever: 5 },
        selimReaction: "ঢাকার রাতের আলোগুলো দেখলাম। মনে হলো সব সম্ভব।",
      },
      {
        label: "রাফিকের সাথে plan করি",
        effects: { friendTrust: 8, iq: 5, mood: 5 },
        selimReaction: "রাফিক বললো 'প্রথম সপ্তাহ কঠিন। পরে ঠিক হবে।' বিশ্বাস করলাম।",
        flagUpdate: { bestFriendMoments: 1 },
      },
      {
        label: "ঘুমাই, কাল থেকে শুরু",
        effects: { energy: 15, health: 5, mood: 3 },
        selimReaction: "ঘুম আসলো না। কিন্তু শুয়ে থাকলাম। এটাও একটা সিদ্ধান্ত।",
      },
    ],
    lesson: "Dhaka doesn't care who you were. It only asks what you'll do next.",
    lessonBangla: "ঢাকা জানতে চায় না তুমি কে ছিলে। শুধু জানতে চায় এরপর কী করবে।",
  },

  // ─── CHAPTER 3 ───────────────────────────────────────────────────────────────
  {
    id: "moment_eating_biryani",
    sceneKey: "eatingBiryani",
    chapter: 3,
    title: "Biryani Before Budget",
    titleBangla: "বিরিয়ানি আগে, বাজেট পরে",
    caption: "Love uncertain. Kacchi sure.",
    captionBangla: "প্রেম অনিশ্চিত। কাচ্চি নিশ্চিত।",
    triggerDay: 2,
    backstory: "Day 2. Selim has ৳১০০০ left. Then the biryani smell hits him like a prayer answered wrong.",
    atStake: "৳১৪০ vs dignity vs pure joy. Selim's wallet can't handle both.",
    narration: `পুরান ঢাকার এই গলিতে কেউ একজন বিরিয়ানি রান্না করছে।
সেই গন্ধ এসে আমার আত্মাকে সরাসরি ছুঁলো।
মাথায় ভাবলাম: budget। হৃদয় বললো: biryani।
বগুড়ায় মা রান্না করতেন। এই গন্ধটা মায়ের কথা মনে করিয়ে দেয়।
এক প্লেট খাবো। তারপর ১৫ দিন হিসাব করবো।
অথবা করবো না। এটাও একটা পরিকল্পনা।`,
    selimLine: "বিরিয়ানি আমার দিকে তাকায়, যেন ও-ই আমার future।",
    choices: [
      {
        label: "এক প্লেট খাই! 🍛",
        sublabel: "Life is short",
        effects: { mood: 18, money: -140, health: 2 },
        selimReaction: "প্রথম কামড়ে চোখ বন্ধ হয়ে গেলো। ঢাকায় আসাটা সার্থক।",
        flagUpdate: { biryaniCount: 1 },
      },
      {
        label: "না ভাই, budget আগে",
        sublabel: "Hero mode",
        effects: { selfRespect: 8, iq: 5, mood: -5 },
        selimReaction: "হাঁটতে লাগলাম। গন্ধ পিছু ছাড়লো না। কিন্তু টাকাটা বাঁচলো।",
      },
      {
        label: "হাফ প্লেট — smart decision",
        sublabel: "Compromise king",
        effects: { mood: 10, money: -70, iq: 5 },
        selimReaction: "হাফ প্লেট কিনলাম। ঢাকার MBA — বাজেটে biryani।",
        flagUpdate: { biryaniCount: 1 },
      },
    ],
    lesson: "Sometimes the best investment is one plate of biryani that reminds you why you're fighting.",
    lessonBangla: "কখনো কখনো একটা বিরিয়ানি মনে করিয়ে দেয় কেন লড়ছো।",
  },

  // ─── CHAPTER 4 ───────────────────────────────────────────────────────────────
  {
    id: "moment_pinky_effect_walk",
    sceneKey: "pinkyEffectWalk",
    chapter: 4,
    title: "The Pinky Effect",
    titleBangla: "পিংকি ইফেক্ট",
    caption: "One 'hmm' changed everything.",
    captionBangla: "একটা 'hmm'-এ সব বদলে গেলো।",
    triggerDay: 2,
    backstory: "Selim is walking near Dhanmondi Lake. A girl with a familiar laugh passes by. His feet stop without permission.",
    atStake: "One smile vs six months of wallet-draining hope.",
    narration: `শহরের মাঝে এই মেয়েকে দেখলাম হাঁটতে —
পিংকি। নামটা যেন গানের মতো মাথায় বাজে।
ও হেসে সরে গেলো। আমি দাঁড়িয়ে রইলাম।
রাস্তার ধুলো আর রিকশার হর্ন —
কিন্তু সব কিছু থেমে গেছে মনে হলো।
ঢাকায় এসেছিলাম career-এর জন্য।
কিন্তু এখন মনে হচ্ছে আমি এখানে অন্য কারণে।`,
    selimLine: "ভাই, আমি বুঝতে পারছি না — এটা love নাকি আমার loneliness?",
    choices: [
      {
        label: "হ্যালো বলে দিই",
        sublabel: "Bold move",
        effects: { mood: 12, selfRespect: 5, pinkyHope: 20, emotionalDelusion: 15 },
        selimReaction: "ও একটু হাসলো। ব্যস। আমার পুরো পরের সপ্তাহের plan হয়ে গেলো।",
        flagUpdate: { pinkyRechargeCount: 0 },
      },
      {
        label: "দূর থেকে দেখি — romantically",
        sublabel: "Distance is safe",
        effects: { pinkyHope: 30, emotionalDelusion: 20, mood: 8 },
        selimReaction: "ও চলে গেলো। আমি দাঁড়িয়ে রইলাম। এটাই প্রথম love story।",
      },
      {
        label: "Career মনে করি, সরে আসি",
        sublabel: "Wisdom",
        effects: { iq: 8, selfRespect: 10, pinkyHope: -5, careerProgress: 5 },
        selimReaction: "হাঁটতে লাগলাম। কঠিন ছিলো। কিন্তু career priority হওয়া উচিত।",
      },
    ],
    lesson: "First love in a new city hits different. But Dhaka runs on IQ, not Instagram hearts.",
    lessonBangla: "নতুন শহরের প্রথম প্রেম আলাদা। কিন্তু ঢাকা চলে IQ-তে, Instagram hearts-এ না।",
  },

  // ─── CHAPTER 5 ───────────────────────────────────────────────────────────────
  {
    id: "moment_friends_crush_tea_stall",
    sceneKey: "friendsCrushTeaStall",
    chapter: 5,
    title: "Cha Stall Debate",
    titleBangla: "চা স্টলে তর্ক",
    caption: "Friends advice দিচ্ছে, Selim destiny খুঁজছে।",
    captionBangla: "Friends advice দিচ্ছে, Selim destiny খুঁজছে।",
    triggerDay: 3,
    backstory: "Rafiq has dragged Selim to the local tea stall. Cha Mama is brewing. Everyone has opinions about Pinky.",
    atStake: "Selim's friendship or his delusion — both are being tested at this table.",
    narration: `চা স্টলে বসে রাফিক বললো: 'ভাই, পিংকির ব্যাপারটা ছাড়ো।'
Cha Mama চা দিলেন, সাথে একটা কড়া চোখ।
রাফিক বলে সে আমাকে চেনে। হয়তো ঠিকই বলছে।
কিন্তু ওরা কি জানে পিংকি কেমন হাসে?
চায়ের কাপে চুমুক দিলাম। গরম লাগলো।
মনে হলো সত্যটাও এভাবে গরম লাগে।`,
    selimLine: "রাফিক, তুই বুঝবি না। ও অন্য রকম।",
    choices: [
      {
        label: "রাফিকের কথা শুনি",
        sublabel: "Best friend wisdom",
        effects: { friendTrust: 12, selfRespect: 8, emotionalDelusion: -10, iq: 5 },
        selimReaction: "রাফিক ঠিকই বলেছে। আমি সত্যি একটু over-attached হয়ে গেছি।",
        flagUpdate: { bestFriendMoments: 1 },
      },
      {
        label: "Pinky-র পক্ষে argue করি",
        sublabel: "Defender mode",
        effects: { pinkyHope: 10, emotionalDelusion: 15, friendTrust: -5 },
        selimReaction: "রাফিক হাল ছেড়ে দিলো। আমি জিতলাম কিনা জানি না।",
      },
      {
        label: "আরেকটা চা নিই — topic change",
        sublabel: "Avoidance expert",
        effects: { mood: 5, money: -20, iq: -3 },
        selimReaction: "Cha Mama হাসলেন। আমি হাসলাম। রাফিক মাথা নাড়লো।",
      },
    ],
    lesson: "Real friends give hard truths. Tea makes the truth easier to swallow.",
    lessonBangla: "আসল বন্ধু কঠিন সত্য বলে। চা সেই সত্যটা গিলতে সাহায্য করে।",
  },

  // ─── CHAPTER 6 ───────────────────────────────────────────────────────────────
  {
    id: "moment_bus_daydream_crush",
    sceneKey: "busDaydreamCrush",
    chapter: 6,
    title: "Bus Daydream",
    titleBangla: "বাসে দিবাস্বপ্ন",
    caption: "She asked for route. Selim saw wedding.",
    captionBangla: "ও জিজ্ঞেস করলো রাস্তা। সেলিম দেখলো বিয়ে।",
    triggerDay: 4,
    backstory: "Crowded Dhaka bus. A girl beside Selim asks which stop to get off. Selim's brain immediately writes a 3-chapter love story.",
    atStake: "One innocent question vs three months of Selim's emotional investment.",
    narration: `বাসে ভিড়। পাশে এক মেয়ে।
'এক্সকিউজ মি, পল্টন কোন স্টপ?'
আমি বললাম, 'পরেরটা।' মাথায় ভাবলাম — 'এটাই সেই মুহূর্ত।'
ও নেমে গেলো। পিছনে তাকালো না।
কিন্তু আমার মনে সে-ই এখন Pinky-র চেয়ে বড়।
এটা কি love? নাকি শুধু loneliness একটু shape নিয়েছে?`,
    selimLine: "ভাই, বাসে দাঁড়িয়ে আমি বিয়ের planning করে ফেললাম।",
    choices: [
      {
        label: "পরিচয় দিই — সাহসী পদক্ষেপ",
        sublabel: "Introvert nightmare",
        effects: { selfRespect: 10, mood: 8, romanticFever: 15, emotionalDelusion: 10 },
        selimReaction: "বললাম হ্যালো। ও হাসলো। নামলো। আমার সপ্তাহ গেলো।",
        flagUpdate: {},
      },
      {
        label: "শুধু বাস route বলি, এগোই না",
        sublabel: "Wise restraint",
        effects: { selfRespect: 8, iq: 6, emotionalDelusion: -5 },
        selimReaction: "Route বললাম। ব্যস। কিন্তু ঐ পাঁচ সেকেন্ড মনে থাকবে।",
      },
      {
        label: "স্বপ্নে ডুবে থাকি",
        sublabel: "Daydream premium",
        effects: { mood: 12, romanticFever: 20, emotionalDelusion: 18, iq: -5 },
        selimReaction: "চোখ বন্ধ করলাম। বাসের হর্ন। কিন্তু মনে শুধু ওই হাসি।",
      },
    ],
    lesson: "Loneliness in a big city can disguise itself as love at first sight.",
    lessonBangla: "বড় শহরের একাকীত্ব নিজেকে প্রথম দর্শনের প্রেম হিসেবে দেখাতে পারে।",
  },

  // ─── CHAPTER 7 ───────────────────────────────────────────────────────────────
  {
    id: "moment_broke_rent_problem",
    sceneKey: "brokeRentProblem",
    chapter: 7,
    title: "Rent Due, Wallet Empty",
    titleBangla: "ভাড়া হবে না",
    caption: "Dhaka's first real test.",
    captionBangla: "ঢাকার প্রথম আসল পরীক্ষা।",
    triggerDay: 5,
    backstory: "Kuddus Bhai is at the door. ৳৭০০ rent is due. Selim has ৳৩৫০ left and a Pinky recharge history.",
    atStake: "Roof over his head vs habit of helping someone who doesn't ask.",
    narration: `কুদ্দুস ভাই দরজায় নক করলেন।
'ভাড়া?' এক শব্দে সব বলে দিলেন।
পকেটে হাত দিলাম — ৩৫০ টাকা।
পিংকির জন্য ৩ বার recharge। রিকশায় ভাড়া।
বিরিয়ানি একবার। এখন এই।
ঢাকা আমাকে প্রথমবার সত্যিকারের test করছে —
কার জন্য আমি এখানে আছি?`,
    selimLine: "টাকা নেই মানে এই না যে আমি হেরে গেছি। মানে next round শুরু হয়েছে।",
    choices: [
      {
        label: "পুরো ভাড়া দিই — যা থাকে থাকুক",
        sublabel: "Responsible move",
        effects: { money: -700, reputation: 8, selfRespect: 8, mood: -5 },
        selimReaction: "কুদ্দুস ভাই satisfied হলেন। Wi-Fi চললো। আমি পানিভাতে খেলাম।",
        flagUpdate: { rentPaid: 1 },
      },
      {
        label: "আরো এক সপ্তাহ সময় চাই",
        sublabel: "Buying time",
        effects: { reputation: -8, mood: -10, iq: 5 },
        selimReaction: "কুদ্দুস ভাই Wi-Fi বন্ধ করলেন। ডেটায় চললাম। একটু লজ্জা লাগলো।",
      },
      {
        label: "আম্মুকে ফোন করি — সাহায্য চাই",
        sublabel: "Call home",
        effects: { money: 500, mood: 10, selfRespect: -5, emotionalDelusion: -8 },
        selimReaction: "আম্মু পাঠিয়ে দিলেন। লজ্জা লাগলো। কিন্তু সমস্যা সমাধান হলো।",
      },
    ],
    lesson: "Money management is self-respect in Dhaka. Every taka is a decision.",
    lessonBangla: "ঢাকায় টাকার হিসাব মানে নিজেকে সম্মান দেওয়া। প্রতিটা টাকা একটা সিদ্ধান্ত।",
  },

  // ─── CHAPTER 8 ───────────────────────────────────────────────────────────────
  {
    id: "moment_dreaming_pinky_rooftop",
    sceneKey: "dreamingPinkyRooftop",
    chapter: 8,
    title: "The Pinky Dream",
    titleBangla: "পিংকির স্বপ্ন",
    caption: "One message. Entire future planned.",
    captionBangla: "একটা message। পুরো future plan।",
    triggerDay: 6,
    backstory: "Late night on the mess rooftop. Pinky sent 'okay' two days ago. Selim has been replaying it on loop.",
    atStake: "One word from Pinky vs Selim's grip on reality.",
    narration: `ছাদে বসে আছি। রাত ১১টা।
পিংকির last message: 'okay'।
Okay মানে কি সে রাজি?
Okay মানে কি সে ভাবছে?
Okay মানে কি future plan আছে?
না। Okay মানে 'okay'।
কিন্তু এই ছাদে বসে আকাশ দেখতে দেখতে —
মনে হচ্ছে পুরো ঢাকাটা শুধু আমার আর পিংকির।`,
    selimLine: "একটা 'okay'-তে আমি সারারাত জেগে থাকলাম।",
    choices: [
      {
        label: "Text করি: 'কাল দেখা হবে?'",
        sublabel: "High risk, high hope",
        effects: { pinkyHope: 20, emotionalDelusion: 20, mood: 8, selfRespect: -8 },
        selimReaction: "Seen হলো। Reply আসেনি। আমি ঘুমাইনি।",
        flagUpdate: { pinkyRechargeCount: 0 },
      },
      {
        label: "ফোন রেখে আকাশ দেখি",
        sublabel: "Peaceful detachment",
        effects: { mood: 10, selfRespect: 8, emotionalDelusion: -10, health: 5 },
        selimReaction: "তারা গুনলাম। মনে হলো পিংকি ছাড়াও আকাশটা সুন্দর।",
      },
      {
        label: "রাফিককে ফোন করি",
        sublabel: "Seek sanity",
        effects: { friendTrust: 8, emotionalDelusion: -15, mood: 5 },
        selimReaction: "রাফিক বললো 'ঘুম যা, ভাই।' এটাই দরকার ছিলো।",
        flagUpdate: { bestFriendMoments: 1 },
      },
    ],
    lesson: "Late night thoughts on a rooftop are not a plan. Sleep is.",
    lessonBangla: "ছাদে রাতের ভাবনা plan না। ঘুম হলো plan।",
  },

  // ─── CHAPTER 9 ───────────────────────────────────────────────────────────────
  {
    id: "moment_cha_stall_friend_talk",
    sceneKey: "chaStallFriendTalk",
    chapter: 9,
    title: "Rafiq's Hard Truth",
    titleBangla: "রাফিকের সত্যিকথা",
    caption: "চা দিয়ে বন্ধু। truth দিয়ে বেস্টফ্রেন্ড।",
    captionBangla: "চা দিয়ে বন্ধু। সত্য দিয়ে bestfriend।",
    triggerDay: 7,
    backstory: "Rafiq has pulled Selim into the old cha stall. He looks serious. This isn't a casual meet.",
    atStake: "Can Selim hear something uncomfortable and still choose the friendship?",
    narration: `রাফিক আজকে সরাসরি বললো।
'ভাই, তুমি পিংকির জন্য ৬ মাস নষ্ট করছো।
সে তোমাকে চেনে না। তুমি তাকে চেনো না।
তুমি শুধু তোমার idea of পিংকিকে ভালোবাসো।'
চায়ের কাপ ঠান্ডা হয়ে গেলো।
রাফিক ঠিক বলেছে। কিন্তু শুনতে ভালো লাগছে না।`,
    selimLine: "ভাই, সত্য শুনতে কষ্ট লাগে। কিন্তু মিথ্যা শুনলে আরো বেশি লাগে।",
    choices: [
      {
        label: "রাফিক ঠিক বলেছে — শুনি",
        sublabel: "Growth moment",
        effects: { selfRespect: 12, friendTrust: 15, emotionalDelusion: -20, iq: 8 },
        selimReaction: "মাথা নিচু করলাম। 'হ্যাঁ রাফিক, তুই ঠিকই বলেছিস।'",
        flagUpdate: { bestFriendMoments: 1 },
      },
      {
        label: "পিংকি ব্যাপারটা defend করি",
        sublabel: "Denial mode",
        effects: { pinkyHope: 10, emotionalDelusion: 15, friendTrust: -8 },
        selimReaction: "রাফিক হাল ছেড়ে দিলো। Cha Mama একটা extra চা দিলেন।",
      },
      {
        label: "মন খুলে বলি কেমন feel হচ্ছে",
        sublabel: "Vulnerability wins",
        effects: { friendTrust: 20, mood: 8, selfRespect: 8, emotionalDelusion: -10 },
        selimReaction: "রাফিক সব শুনলো। বললো 'ভাই তুই ঠিক আছিস। কিন্তু ঠিক থাকবি।'",
        flagUpdate: { bestFriendMoments: 1 },
      },
    ],
    lesson: "A friend who tells you the truth is worth more than a crush who replies with 'hmm'.",
    lessonBangla: "যে বন্ধু সত্য বলে সে অনেক মূল্যবান — যে 'hmm' reply দেয় তার চেয়ে।",
  },

  // ─── CHAPTER 10 ──────────────────────────────────────────────────────────────
  {
    id: "moment_campus_drama_slap",
    sceneKey: "campusDramaSlap",
    chapter: 10,
    title: "The Boundary Lesson",
    titleBangla: "সীমানার পাঠ",
    caption: "Fantasy is not consent. Reality taught him.",
    captionBangla: "কল্পনা মানে সম্মতি না। বাস্তবতা শেখালো।",
    triggerDay: 8,
    backstory: "Selim witnesses a scene on campus — a girl firmly rejects someone who didn't understand 'no'. The slap that follows is loud and clear.",
    atStake: "Understanding that 'no' is a complete sentence. This shapes how Selim treats Pinky.",
    narration: `ক্যাম্পাসে দেখলাম — এক ছেলে মেয়েটাকে কিছু বললো।
মেয়েটা 'না' বললো। ছেলেটা বুঝলো না।
যা হওয়ার হলো।
আমার মনে হলো — আমি কি পিংকির সাথে এই ছেলের মতো?
না। আমি ভালোবাসি।
কিন্তু... ভালোবাসা মানে কি তার 'hmm'-কে 'হ্যাঁ' ভাবা?
এটা নিয়ে ভাবতে হবে।`,
    selimLine: "ভালোবাসা মানে দেওয়া। কিন্তু সীমানা মানা মানেও ভালোবাসা।",
    choices: [
      {
        label: "এই মেয়ে সাহসী ছিলেন — respect",
        sublabel: "Clarity moment",
        effects: { selfRespect: 12, iq: 8, emotionalDelusion: -15, pinkyHope: -10 },
        selimReaction: "মাথায় একটা switch ঘুরলো। পিংকির 'hmm' মানে maybe না। মানে না।",
        flagUpdate: { pinkyBoundaryWins: 1 },
      },
      {
        label: "নিজের situation compare করি",
        sublabel: "Self-reflection",
        effects: { iq: 12, selfRespect: 8, emotionalDelusion: -12 },
        selimReaction: "ভাবলাম: আমি কি পিংকির জন্য সীমানা মেনে চলেছি?",
        flagUpdate: { pinkyBoundaryWins: 1 },
      },
      {
        label: "দূরে সরে যাই — দেখা উচিত হয়নি",
        sublabel: "Awkward exit",
        effects: { mood: -5, selfRespect: -3 },
        selimReaction: "চলে গেলাম। কিন্তু দৃশ্যটা মাথায় রয়ে গেলো।",
      },
    ],
    lesson: "Real love respects 'no'. Obsession redefines it as 'maybe'.",
    lessonBangla: "আসল ভালোবাসা 'না'-কে সম্মান করে। obsession সেটাকে 'maybe' বানায়।",
  },

  // ─── CHAPTER 11 ──────────────────────────────────────────────────────────────
  {
    id: "moment_girl_happy_help",
    sceneKey: "girlHappyHelp",
    chapter: 11,
    title: "Kindness or Trap?",
    titleBangla: "দয়া না ফাঁদ?",
    caption: "Help is good. Going broke helping is not.",
    captionBangla: "সাহায্য ভালো। সাহায্য করতে গিয়ে ফতুর হওয়া ভালো না।",
    triggerDay: 9,
    backstory: "A girl at the mobile recharge shop says she's stuck — her phone is dead and she needs ৳100. She has kind eyes and Selim has a soft heart.",
    atStake: "Real kindness vs enabling dependency vs financial self-respect.",
    narration: `মেয়েটা বললো 'ভাই, phone charge নেই, কেউ নেই।'
মুখে genuine কষ্টের ছাপ।
আমার পকেটে ৫০০ টাকা।
পিংকির জন্য কয়েকবার recharge দিয়েছি বিনা দ্বিধায়।
এই মেয়ে তো অপরিচিত।
কিন্তু দয়া কি চেনা-অচেনা দেখে?
নাকি দয়ার একটা সীমা থাকা উচিত?`,
    selimLine: "সাহায্য করবো — কিন্তু নিজেকে ফুরিয়ে দিয়ে না।",
    choices: [
      {
        label: "৫০ টাকার recharge দিই",
        sublabel: "Generous but measured",
        effects: { mood: 8, reputation: 8, money: -50, selfRespect: 5 },
        selimReaction: "দিলাম। ও thank you বললো। মনে ভালো লাগলো। পকেটও ঠিক আছে।",
        flagUpdate: { girlInvestment: 50 },
      },
      {
        label: "না, নিজের টাকা নিজের জন্য",
        sublabel: "Financial boundary",
        effects: { selfRespect: 10, money: 0, iq: 5, mood: -3 },
        selimReaction: "না বললাম। একটু খারাপ লাগলো। কিন্তু পকেট ঠিক আছে।",
        flagUpdate: { pinkyBoundaryWins: 1 },
      },
      {
        label: "কাছের দোকান দেখিয়ে দিই",
        sublabel: "Helpful without cost",
        effects: { iq: 8, reputation: 5, mood: 5 },
        selimReaction: "বললাম 'ঐ দোকানে বলুন।' ও গেলো। আমি smart move করলাম।",
      },
    ],
    lesson: "Kindness with boundaries is still kindness. Giving until you break is not love.",
    lessonBangla: "সীমানা সহ দয়াও দয়া। ভেঙে যাওয়া পর্যন্ত দেওয়া ভালোবাসা না।",
  },

  // ─── CHAPTER 12 ──────────────────────────────────────────────────────────────
  {
    id: "moment_rainy_heartbreak",
    sceneKey: "rainyHeartbreak",
    chapter: 12,
    title: "Pinky's Rain",
    titleBangla: "পিংকির বৃষ্টি",
    caption: "Seen. Not replied. Rained anyway.",
    captionBangla: "Seen হয়েছে। Reply আসেনি। বৃষ্টি এসেছে।",
    triggerDay: 10,
    backstory: "Pinky has been seen-zoning Selim for 4 days. Today the rain started. Both are metaphors.",
    atStake: "Selim's emotional health vs clinging to an idea of love that exists only in his head.",
    narration: `বৃষ্টি নামলো আচমকা।
পিংকির কোনো reply নেই — ৪ দিন।
রাস্তায় দাঁড়িয়ে ভিজলাম।
ছাতা নেওয়া উচিত ছিলো। নেইনি।
মনে হলো — ভিজলে কষ্ট একটু কমে।
কমলো না।
বগুড়ার বৃষ্টি মিষ্টি ছিলো।
ঢাকার বৃষ্টিতে শুধু ঠান্ডা লাগে।`,
    selimLine: "ভিজলাম। কিন্তু ভেতরের কষ্ট বৃষ্টি ধুতে পারে না।",
    choices: [
      {
        label: "বাসায় ফিরে যাই",
        sublabel: "Self-care first",
        effects: { health: 5, mood: -5, selfRespect: 5, emotionalDelusion: -8 },
        selimReaction: "ফিরলাম। শুকনো কাপড় পড়লাম। একটু ভালো লাগলো।",
        flagUpdate: { heartbreakCount: 1 },
      },
      {
        label: "আরেকটা text করি — last try",
        sublabel: "One more try",
        effects: { pinkyHope: 5, emotionalDelusion: 20, health: -8, selfRespect: -10 },
        selimReaction: "Sent করলাম। Seen হলো। Reply নেই। বৃষ্টি বাড়লো।",
        flagUpdate: { heartbreakCount: 1 },
      },
      {
        label: "রাফিকের বাসায় যাই",
        sublabel: "Friendship heals",
        effects: { friendTrust: 12, mood: 8, health: -3, emotionalDelusion: -12 },
        selimReaction: "রাফিক চা দিলো। কথা বললাম। একটু হালকা লাগলো।",
        flagUpdate: { bestFriendMoments: 1, heartbreakCount: 1 },
      },
    ],
    lesson: "Pain in the rain is still pain. But you can always go inside.",
    lessonBangla: "বৃষ্টিতে কষ্ট তবুও কষ্টই। কিন্তু ভেতরে চলে আসা যায়।",
  },

  // ─── CHAPTER 13 ──────────────────────────────────────────────────────────────
  {
    id: "moment_asking_money_friend",
    sceneKey: "askingMoneyFriend",
    chapter: 13,
    title: "Bhai, ৫০০ Taka Hobe?",
    titleBangla: "ভাই, ৫০০ টাকা হবে?",
    caption: "Reason: urgent. Real reason: Pinky.",
    captionBangla: "কারণ: urgent। আসল কারণ: পিংকি।",
    triggerDay: 10,
    backstory: "Selim is flat broke. He needs ৳500. Rafiq is his only option. The shame is real.",
    atStake: "Pride vs need vs friendship being tested at its most vulnerable.",
    narration: `রাফিককে বললাম 'ভাই, একটু সাহায্য লাগবে।'
ও একটু চুপ থাকলো।
আমি explain করলাম — rent, খাবার, urgent।
সত্যিটা বললাম না পুরোটা।
রাফিক টাকা দিলো। কিছু জিজ্ঞেস করলো না।
সেটাই সবচেয়ে বেশি কষ্ট দিলো।
সত্যিকারের বন্ধু মানে এই।`,
    selimLine: "টাকা চাইতে এসেছিলাম। friendship পেলাম।",
    choices: [
      {
        label: "সত্যিটা বলি — সব explain করি",
        sublabel: "Honest vulnerability",
        effects: { friendTrust: 18, selfRespect: 10, emotionalDelusion: -10, mood: 5 },
        selimReaction: "রাফিক সব শুনলো। দিলো। বললো 'ভাই, তুই ঠিক থাকলেই হয়।'",
        flagUpdate: { bestFriendMoments: 1 },
      },
      {
        label: "শুধু 'urgent' বলি",
        sublabel: "Half-truth",
        effects: { money: 500, friendTrust: 5, selfRespect: -5 },
        selimReaction: "রাফিক দিলো। জানতে চায়নি। আমি একটু অস্বস্তি নিয়ে গেলাম।",
      },
      {
        label: "না চাই, অন্য পথ খুঁজি",
        sublabel: "Self-reliance",
        effects: { selfRespect: 12, iq: 5, money: -100, mood: -8 },
        selimReaction: "ছোটখাটো কাজ করলাম। কষ্টে টাকা হলো। লজ্জা লাগলো না।",
        flagUpdate: { workCount: 1 },
      },
    ],
    lesson: "Asking for help from a real friend is strength, not weakness.",
    lessonBangla: "আসল বন্ধুর কাছে সাহায্য চাওয়া দুর্বলতা না — শক্তি।",
  },

  // ─── CHAPTER 14 ──────────────────────────────────────────────────────────────
  {
    id: "moment_career_struggle",
    sceneKey: "careerStruggle",
    chapter: 14,
    title: "Career or Pinky?",
    titleBangla: "ক্যারিয়ার না পিংকি?",
    caption: "Interview tomorrow. Pinky texted tonight.",
    captionBangla: "কাল interview। আজ রাতে পিংকি text করলো।",
    triggerDay: 11,
    backstory: "Tomorrow is the most important freelancing interview of Selim's Dhaka journey. Tonight, Pinky sent 'how r u?'",
    atStake: "Selim's future income vs one message that could spiral into nothing.",
    narration: `কাল interview। CV ready। notes ready।
রাত ১০টায় পিংকির message: 'কেমন আছো?'
মাথা বললো: পড়ো।
হৃদয় বললো: reply দাও।
বসে রইলাম।
এই সিদ্ধান্তটা আসলে অনেক বড়।
আমি কে হতে চাই — Pinky-obsessed সেলিম?
নাকি Bogura Boss সেলিম?`,
    selimLine: "আজকে career choose করলে Pinky-র জন্য আমি actually valuable হবো।",
    choices: [
      {
        label: "Phone রাখি, CV পড়ি",
        sublabel: "Priority check",
        effects: { careerProgress: 15, selfRespect: 12, iq: 8, pinkyHope: -5 },
        selimReaction: "Notification off করলাম। রাত ১২টা পর্যন্ত পড়লাম। Ready।",
        flagUpdate: { workCount: 1 },
      },
      {
        label: "Reply দিই, তারপর পড়বো",
        sublabel: "Multitasker (spoiler: won't)",
        effects: { pinkyHope: 12, emotionalDelusion: 15, careerProgress: -5, iq: -3 },
        selimReaction: "Reply দিলাম। Conversation চললো। রাত ২টা। Interview-এ ঘুমঘুম।",
      },
      {
        label: "একটু reply, বেশি পড়া",
        sublabel: "Balance attempt",
        effects: { careerProgress: 8, pinkyHope: 5, selfRespect: 5, iq: 3 },
        selimReaction: "সংক্ষিপ্ত reply দিলাম। তারপর পড়লাম। মোটামুটি ready।",
      },
    ],
    lesson: "Your career is the love story that always shows up on time.",
    lessonBangla: "তোমার career হলো সেই ভালোবাসার গল্প যেটা সবসময় সময়মতো আসে।",
  },

  // ─── CHAPTER 15 ──────────────────────────────────────────────────────────────
  {
    id: "moment_work_hustle_montage",
    sceneKey: "workHustleMontage",
    chapter: 15,
    title: "Hustle Montage",
    titleBangla: "হাসল মোনটাজ",
    caption: "Pinky reply uncertain. Work payment real.",
    captionBangla: "পিংকির reply অনিশ্চিত। কাজের টাকা নিশ্চিত।",
    triggerDay: 12,
    backstory: "Selim has three gigs — food delivery morning, tutoring afternoon, and a Fiverr deadline at night.",
    atStake: "Whether the work ethic survives Dhaka's distractions or crumbles under them.",
    narration: `সকালে delivery। দুপুরে tuition।
রাতে Fiverr deadline।
পিংকির কথা মাথায় আসলো ৩ বার।
৩ বারই কাজে ফিরে গেলাম।
এই একটা দিনে বুঝলাম —
কাজের মধ্যে একটা শান্তি আছে।
নিজের জন্য কিছু করার মধ্যে।
পিংকি না বললেও কাজ আমাকে না বলে না।`,
    selimLine: "কাজ আমাকে চেনে। Pinky আমাকে চেনে না — এখনো।",
    choices: [
      {
        label: "সব কাজ complete করি",
        sublabel: "Full hustle",
        effects: { money: 800, careerProgress: 15, selfRespect: 12, energy: -15 },
        selimReaction: "রাত ১২টায় শেষ করলাম। Exhausted। কিন্তু ৮০০ টাকা earned।",
        flagUpdate: { workCount: 1 },
      },
      {
        label: "দুটো করি, একটু rest নিই",
        sublabel: "Sustainable hustle",
        effects: { money: 500, careerProgress: 10, health: 5, selfRespect: 8 },
        selimReaction: "৫০০ টাকা। একটু rest। কাল আবার শুরু। এটাই real life।",
        flagUpdate: { workCount: 1 },
      },
      {
        label: "সব করি কিন্তু Pinky-কে update দিই",
        sublabel: "Sharing wins",
        effects: { money: 600, pinkyHope: 8, careerProgress: 8, emotionalDelusion: 5 },
        selimReaction: "Screenshot পাঠালাম। Seen হলো। কিন্তু কাজটা complete হলো।",
        flagUpdate: { workCount: 1 },
      },
    ],
    lesson: "Work never ghosts you. Every taka earned is proof you showed up.",
    lessonBangla: "কাজ কখনো ghost করে না। প্রতিটা earned টাকা প্রমাণ তুমি ছিলে।",
  },

  // ─── CHAPTER 16 ──────────────────────────────────────────────────────────────
  {
    id: "moment_life_chaos_dashboard",
    sceneKey: "lifeChaosDashboard",
    chapter: 16,
    title: "All At Once",
    titleBangla: "সব একসাথে",
    caption: "Mom, Pinky, rent, interview — all tabs open.",
    captionBangla: "আম্মু, পিংকি, ভাড়া, interview — সব tab খোলা।",
    triggerDay: 12,
    backstory: "Five notifications at once: Mom calling, Pinky DM, rent reminder, interview rescheduled, Rafiq needs help.",
    atStake: "Who Selim prioritizes reveals who he is — and who he wants to become.",
    narration: `Phone একসাথে পাঁচটা notification দিলো।
আম্মু calling।
পিংকির DM।
কুদ্দুস ভাইয়ের rent reminder।
Interview রescheduled।
রাফিকের 'urgent help।'
মাথা ঘুরলো।
এই হলো ঢাকার real game —
সবকিছু একসাথে আসে।
কাকে আগে দেবো?`,
    selimLine: "মাথায় ১% battery। কিন্তু জীবন ১০০% চার্জে চলছে।",
    choices: [
      {
        label: "আম্মুর call ধরি আগে",
        sublabel: "Family first",
        effects: { mood: 15, selfRespect: 8, emotionalDelusion: -10, friendTrust: 3 },
        selimReaction: "আম্মু বললেন 'ভালো থেকো।' সব ঠিক মনে হলো।",
        flagUpdate: {},
      },
      {
        label: "রাফিকের urgent-টা দেখি",
        sublabel: "Friendship duty",
        effects: { friendTrust: 15, mood: 5, careerProgress: -3 },
        selimReaction: "রাফিকের সমস্যা solve করলাম। ও ধন্যবাদ দিলো। ভালো লাগলো।",
        flagUpdate: { bestFriendMoments: 1 },
      },
      {
        label: "Pinky-র DM দেখি",
        sublabel: "Old habit",
        effects: { pinkyHope: 15, emotionalDelusion: 18, selfRespect: -8, mood: -5 },
        selimReaction: "DM খুললাম। 'okay'। আমি সব ভুলে গেলাম।",
      },
    ],
    lesson: "Life's chaos is a ranking test. What you choose first shows what you value most.",
    lessonBangla: "জীবনের chaos হলো ranking test। কোনটা আগে choose করলে সেটাই তোমার priority।",
  },

  // ─── CHAPTER 17 ──────────────────────────────────────────────────────────────
  {
    id: "moment_bogura_boss_rooftop",
    sceneKey: "boguraBossRooftop",
    chapter: 17,
    title: "Bogura Boss Rises",
    titleBangla: "Bogura Boss জেগে উঠলো",
    caption: "The version of Selim he came here to become.",
    captionBangla: "সেলিম যে হতে এসেছিলো — সে জেগে উঠলো।",
    triggerDay: 13,
    backstory: "Selim gets his first real freelancing payment. ৳3,500 in his bKash. He climbs to the rooftop.",
    atStake: "Will Selim celebrate himself, or immediately spend it on Pinky?",
    narration: `bKash notification: ৳৩,৫০০।
প্রথম বড় payment।
ছাদে উঠে গেলাম।
ঢাকার skyline দেখলাম।
এই শহর আমাকে ঠকিয়েছে।
পিংকি আমাকে ignore করেছে।
টাকা চলে গেছে।
কিন্তু আমি টিকে আছি।
Bogura Boss মানে এই।`,
    selimLine: "ঢাকা, তুই আমাকে ভাঙতে পারিসনি। আমি এখনো আছি।",
    choices: [
      {
        label: "নিজের জন্য celebrate করি",
        sublabel: "Earned victory",
        effects: { selfRespect: 15, mood: 18, careerProgress: 10, money: -100 },
        selimReaction: "ভালো একটা meal খেলাম। নিজেকে treat করলাম। গর্ব লাগলো।",
      },
      {
        label: "আম্মুকে কিছু পাঠাই",
        sublabel: "Family love",
        effects: { mood: 20, selfRespect: 15, money: -500, reputation: 10 },
        selimReaction: "bKash করলাম। আম্মু কাঁদলেন। আমিও একটু কাঁদলাম।",
      },
      {
        label: "রাফিকের loan শোধ করি",
        sublabel: "Integrity move",
        effects: { friendTrust: 20, selfRespect: 18, money: -500, mood: 12 },
        selimReaction: "রাফিক বললো 'ভাই, তোর দরকার ছিলো না।' আমি বললাম 'তোর সাহায্য ছিলো।'",
        flagUpdate: { bestFriendMoments: 1 },
      },
    ],
    lesson: "Bogura Boss isn't a title. It's the moment you stop surviving and start living.",
    lessonBangla: "Bogura Boss কোনো উপাধি না। এটা সেই মুহূর্ত যখন survive করা ছেড়ে জীবন যাপন শুরু হয়।",
  },

  // ─── CHAPTER 18 ──────────────────────────────────────────────────────────────
  {
    id: "moment_rooftop_sunset",
    sceneKey: "rooftopSunset",
    chapter: 18,
    title: "Dhaka Sunset",
    titleBangla: "ঢাকার সূর্যাস্ত",
    caption: "Day 14. Selim counts what he's gained.",
    captionBangla: "১৪তম দিন। সেলিম হিসাব করে কী পেলো।",
    triggerDay: 14,
    backstory: "Second-to-last evening. The sun is setting over the Dhaka skyline. Selim sits with chai and 14 days of memory.",
    atStake: "Who Selim chooses to be on the final day — it all comes down to this sunset.",
    narration: `১৪ দিন হয়ে গেলো।
ছাদে বসে chai খাচ্ছি।
সূর্যটা ঢাকার ছাদের পেছনে ডুবছে।
কতকিছু হয়েছে।
Pinky-র 'hmm'। রাফিকের সত্যি কথা।
বৃষ্টিতে ভেজা। কাজের টাকা।
আম্মুর গলার স্বর।
ঢাকা আমাকে বদলে দিয়েছে।
আমি কি ভালো বদলেছি?`,
    selimLine: "১৪ দিনে ঢাকা যা শিখিয়েছে, বগুড়া ১৪ বছরে শেখায়নি।",
    choices: [
      {
        label: "আম্মুকে call করি",
        sublabel: "Home connection",
        effects: { mood: 18, selfRespect: 8, emotionalDelusion: -12, health: 5 },
        selimReaction: "আম্মু বললেন 'কবে আসবি?' মনে হলো ঢাকা আর এত বড় না।",
      },
      {
        label: "রাফিককে ধন্যবাদ দিই",
        sublabel: "Gratitude moment",
        effects: { friendTrust: 12, mood: 12, selfRespect: 8 },
        selimReaction: "রাফিক বললো 'আগামীকালটা ভালো হোক।' হবে।",
        flagUpdate: { bestFriendMoments: 1 },
      },
      {
        label: "Pinky-কে last message পাঠাই — closure",
        sublabel: "Letting go",
        effects: { selfRespect: 10, emotionalDelusion: -20, pinkyHope: -15, mood: 5 },
        selimReaction: "লিখলাম 'তোমার ভালো হোক।' Send করলাম। Phone রাখলাম।",
        flagUpdate: { pinkyBoundaryWins: 1 },
      },
    ],
    lesson: "Sunsets don't wait. Neither does your best version of yourself.",
    lessonBangla: "সূর্যাস্ত অপেক্ষা করে না। তোমার সেরা version-ও না।",
  },

  // ─── CHAPTER 19 ──────────────────────────────────────────────────────────────
  {
    id: "moment_rooftop_silhouette",
    sceneKey: "rooftopSilhouette",
    chapter: 19,
    title: "The Final Choice",
    titleBangla: "শেষ সিদ্ধান্ত",
    caption: "Selim. Dhaka. One last night.",
    captionBangla: "সেলিম। ঢাকা। শেষ রাত।",
    triggerDay: 15,
    backstory: "Day 15. The last night in Dhaka. Selim stands alone on the rooftop silhouette, looking at the city that tested him.",
    atStake: "Everything. Who Selim is. Who he'll be. What this whole journey was for.",
    narration: `এই ছাদে দাঁড়িয়ে আছি।
ঢাকার আলো ঝলমল করছে।
১৫ দিন। একটা lifetime।
আমি কি যা চেয়েছিলাম পেয়েছি?
না পুরোটা। হ্যাঁ অনেকটা।
Pinky আমাকে ভালোবাসেনি।
কিন্তু আমি নিজেকে একটু বেশি ভালোবাসতে শিখেছি।
এটাই কি ঢাকার শিক্ষা?`,
    selimLine: "Bogura-র ছেলে ঢাকায় এসে কী পেয়েছে? নিজেকে।",
    choices: [
      {
        label: "আগামীর জন্য determined",
        sublabel: "Forward gaze",
        effects: { selfRespect: 20, careerProgress: 10, emotionalDelusion: -20, mood: 15 },
        selimReaction: "ঢাকা আমাকে তৈরি করেছে। Bogura Boss হওয়া এখন কাছে।",
      },
      {
        label: "Pinky-র কথা ভুলে নতুন শুরু",
        sublabel: "Moving on",
        effects: { selfRespect: 15, emotionalDelusion: -25, pinkyHope: -20, mood: 12 },
        selimReaction: "মনে মনে বললাম: 'Good bye, idea of Pinky।' হালকা লাগলো।",
        flagUpdate: { pinkyBoundaryWins: 1 },
      },
      {
        label: "সব accept করি — journey টাই জয়",
        sublabel: "Acceptance",
        effects: { selfRespect: 18, mood: 18, emotionalDelusion: -15, friendTrust: 5 },
        selimReaction: "ঢাকা ভালো বা খারাপ ছিলো না। ঢাকা ছিলো। আমিও ছিলাম।",
      },
    ],
    lesson: "The boy who came chasing Pinky leaves having found himself. That's the real love story.",
    lessonBangla: "পিংকিকে খুঁজতে আসা ছেলেটা নিজেকে খুঁজে পেয়ে ফিরলো। এটাই আসল ভালোবাসার গল্প।",
  },

  // ─── CHAPTER 21 ──────────────────────────────────────────────────────────────
  {
    id: "moment_chaiwala_plot_twist",
    sceneKey: "chaiwalaRooftopDate",
    chapter: 21,
    title: "The Chaiwala Plot Twist",
    titleBangla: "চায়ওয়ালা মামার ঘটনা",
    caption: "Planned: romance. Delivered: chaos.",
    captionBangla: "Plan ছিলো: রোমান্স। হলো: disaster।",
    triggerDay: 8,
    backstory: "Selim has spent two days planning a candlelit rooftop meeting with Ritu — a girl from the next building whose number Rafiq passed along. Candles lit, rose in hand, chaiwala booked for 8 PM.",
    atStake: "Selim's first real shot at romance in Dhaka — and his ability to handle beautiful chaos with dignity.",
    narration: `ছাদে মোমবাতি জ্বাললাম। দুটো চেয়ার। একটা গোলাপ।
রিতু এলো — সাদা ওড়না, সন্ধ্যার আলোয় অসাধারণ।
কথা হলো। হাসি হলো। একটা moment তৈরি হচ্ছিলো।
তারপর... ছাদের দরজা খুললো। চায়ওয়ালা মামা।
'রিতু মা, তোমার জন্য extra চিনি দিছি।'
রিতু ফ্যাকাশে হলো। আমি ফ্যাকাশে হলাম।
চায়ওয়ালা মামা — রিতুর real মামা।
আমি রিতুর মামাকেই hire করেছিলাম।`,
    selimLine: "ভাই, চায়ওয়ালার নাম জানতাম না। জানতে পারলে ভালো হতো।",
    choices: [
      {
        label: "সাহস করে বলি — 'Mama, ami Ritu-ke pasand kori'",
        sublabel: "The brave confession",
        effects: { selfRespect: 15, romanticFever: 10, mood: -5, money: -50 },
        selimReaction: "মামা চায়ের কাপ হাতে তুলে নিলেন। রিতু আমার দিকে তাকিয়ে... একটু হাসলো। Almost।",
        flagUpdate: { almostKissUnlocked: 1 },
      },
      {
        label: "হাসতে হাসতে বলি — 'Uncle, enjoy the view!'",
        sublabel: "Diplomatic comedy",
        effects: { selfRespect: 5, mood: 12, reputation: 8 },
        selimReaction: "মামা confused হলেন। রিতু হাসলো। এক কাপ চা একসাথে খেলাম। Strange but sweet।",
      },
      {
        label: "লাফিয়ে উঠে বলি — 'Candle! Fire hazard! সরে যান!'",
        sublabel: "Legendary escape",
        effects: { selfRespect: -10, mood: 15, emotionalDelusion: 10 },
        selimReaction: "মামা candle খুঁজলেন। রিতু বুঝে গেলো। আমি সিঁড়ি দিয়ে দৌড়ালাম। রাফিক মেঝেতে হাসতে হাসতে পড়লো।",
      },
    ],
    lesson: "Life's best plot twists arrive unannounced — with extra sugar.",
    lessonBangla: "জীবনের সেরা plot twist আসে বিনা নোটিশে — extra চিনি সহ।",
  },

  // ─── CHAPTER 20 — PHARMACY SECRET MISSION ────────────────────────────────────
  // Tasteful adult-themed beat: Selim's hidden embarrassment about
  // confidence/health pressure in the relationship. Mirrors the user's
  // pharmacy story script, with Tisha (girlfriend) present and pharmacist coaching
  // lifestyle over shortcut. Lands in Story Mode + Album.
  {
    id: "moment_pharmacy_secret",
    sceneKey: "pharmacySecret",
    chapter: 20,
    title: "The Pharmacy Secret",
    titleBangla: "ওষুধের দোকানে গোপন মিশন",
    caption: "Hero mode is not a pill.",
    captionBangla: "Hero mode pill-এ আসে না।",
    triggerDay: 7,
    backstory:
      "সেলিমের girlfriend Tisha কয়েকদিন ধরে চুপচাপ। সেলিম বুঝতে পারছে — promise আর কথায় সে strong, real life pressure-এ nervous। কাউকে বলতে পারছে না। বন্ধুদের বললে roast করবে। তাই নিজেই pharmacy-তে এলো — পাশে Tisha, arms crossed, চোখে disappointment আর concern মেশানো।",
    atStake:
      "নিজের সততা বনাম দ্রুত fix। সম্পর্কের সততা বনাম pretend hero mode। সেলিম কি প্রথমবার চুপ করে শুনবে — না কি আবার shortcut?",
    narration: `Pharmacy-র glass counter। চারপাশে medicine shelf।
সেলিম মাথা চুলকায়, গলা শুকায়।
"ভাইয়া… মানে… ওই… শরীরে একটু confidence বাড়ানোর কিছু আছে?"
Pharmacist চশমার ওপর দিয়ে তাকায়।
"ডাক্তারের পরামর্শ ছাড়া এসব নেওয়া ঠিক না। আগে problem বুঝতে হবে।"
পাশ থেকে Tisha নরম গলায়:
"তুমি আমাকে impress করার জন্য না — নিজের জন্য ঠিক হও।"
সেলিম মাটির দিকে তাকায়। আজ অনেকদিন পরে honestly নিজেকে দেখলো।`,
    selimLine: "আমি try করবো। এই বার real।",
    choices: [
      {
        label: "Shortcut নিই — pill কিনি",
        sublabel: "Quick fix, slow regret",
        effects: { mood: 6, selfRespect: -15, health: -5, addiction: 5, emotionalDelusion: 8 },
        selimReaction: "Pill টা পকেটে। কিন্তু আয়নায় নিজের চোখে তাকাতে পারছি না।",
        flagUpdate: { pharmacyVisited: 1, shortcutShame: 1 },
      },
      {
        label: "Tisha-কে মিথ্যা বলি",
        sublabel: "Easier today, harder forever",
        effects: { selfRespect: -20, emotionalDelusion: 15, attachmentLevel: -12, mood: -6 },
        selimReaction: "সে কিছু বললো না — কিন্তু চোখটা সব বলে দিলো। সম্পর্কে একটা চুপচাপ ফাটল।",
        flagUpdate: { pharmacyVisited: 1, liesTold: 1 },
      },
      {
        label: "Lifestyle ঠিক করি — ঘুম, খাবার, doctor",
        sublabel: "Slow burn, real change",
        effects: { health: 10, selfRespect: 22, mood: 8, energy: 6, attachmentLevel: 12, romanticFever: -8 },
        selimReaction: "প্রথমবার মনে হলো — Bogura Boss মানে বাইরে hero না, ভেতরে শান্ত।",
        flagUpdate: { pharmacyVisited: 1, lifestyleProgress: 2, partnerHonesty: 1, healthyMealCount: 1 },
      },
    ],
    lesson:
      "Real confidence isn't bought from a counter. It's built in the quiet — sleep, food, honesty, time.",
    lessonBangla:
      "আসল confidence counter-এ বিক্রি হয় না। ঘুম, খাবার, সততা আর সময় — এগুলোই recipe।",
  },
];

export const MOMENT_BY_SCENE: Record<string, SelimMoment> = Object.fromEntries(
  SELIM_MOMENTS.map((m) => [m.sceneKey, m]),
);

export const MOMENT_BY_ID: Record<string, SelimMoment> = Object.fromEntries(
  SELIM_MOMENTS.map((m) => [m.id, m]),
);
