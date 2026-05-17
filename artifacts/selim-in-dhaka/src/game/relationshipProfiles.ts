import { SELIM_ASSETS } from "./assets";

export type RelationshipStatus =
  | "Unknown" | "Crush" | "Fantasy Mode" | "Mixed Signal" | "Girl-Busy Trigger"
  | "Boundary Test" | "Healthy Friend" | "Career Motivation" | "Convenience Risk"
  | "Secret Attention" | "Same-Gender Truth" | "Forbidden Attention"
  | "Respectful Distance" | "Heartbreak" | "Mature Closure";

export type DangerLevel =
  | "Safe Truth"
  | "Career Positive"
  | "Healthy"
  | "Low Overthinking"
  | "Boundary"
  | "Fantasy"
  | "Favor Risk"
  | "Honesty Risk"
  | "High Emotional"
  | "Reputation";

export interface RelationshipProfile {
  id: string;
  name: string;
  image: string;
  role: string;
  status: RelationshipStatus;
  personality: string;
  fantasy: string;
  reality: string;
  secretMemory: string;
  goodPath: string;
  badPath: string;
  relatedStat: string;
  safetyNote?: string;
  // ── New (spec-completion) fields. All optional so older code paths still work. ──
  voiceStyle?: string;        // one-line description for the Voice tab.
  dangerLevel?: DangerLevel;  // shown as a colored chip in the detail header.
  playerAdvice?: string[];    // bullet tips the player can act on.
  quickReplies?: string[];    // tap-to-send chat suggestions when this girl is the topic.
  selimComment?: string;      // Selim's in-character line when the player opens this profile.
}

export const RELATIONSHIP_PROFILES: RelationshipProfile[] = [
  {
    id: "pinky",
    name: "Pinky",
    image: "/assets/selim/character-pinky-portrait.png",
    role: "Main dream girl",
    status: "Fantasy Mode",
    personality: "Maybe-girl. Replies in 'hmm' and 6-hour silences.",
    fantasy: "Ekdin Pinky bujhbe.",
    reality: "Maybe is not commitment.",
    secretMemory: "Selim saved Pinky's 'hmm' as emotional proof.",
    goodPath: "Selim asks for clarity, builds self-respect, walks away from breadcrumbs.",
    badPath: "Recharge Romeo. Emotional ATM. Rent money for gifts.",
    relatedStat: "Pinky Hope ↔ Self-Respect",
    voiceStyle: "Soft, sweet, slightly teasing modern Dhaka tone.",
    dangerLevel: "High Emotional",
    playerAdvice: ["Ask for clarity.", "No recharge.", "'Maybe' is not commitment.", "Respect yourself."],
    quickReplies: ["Pinky ke clarity jiggesh kor.", "Aaj recharge dish na.", "Pinky'r 'maybe' commitment na."],
    selimComment: "Bhai, Pinky'r profile khulish na… amar brain abar reboot hocche.",
  },
  {
    id: "sadia",
    name: "Sadia",
    image: SELIM_ASSETS.friendsCrushTeaStall,
    role: "Tea-stall crush",
    status: "Crush",
    personality: "Friendly to everyone. Smiles politely.",
    fantasy: "Ekta hashi mane destiny.",
    reality: "Friendly smile is not love.",
    secretMemory: "Selim once spent 40 minutes choosing the 'right' tea cup near her.",
    goodPath: "Selim talks like a normal customer, no expectations.",
    badPath: "Selim builds entire timeline from one cha order.",
    relatedStat: "Romantic Fever",
    voiceStyle: "Cheerful, cute, casual Bangla teasing.",
    dangerLevel: "Low Overthinking",
    playerAdvice: ["Friendly smile only.", "Drink tea, don't plan wedding.", "Be normal."],
    quickReplies: ["Sadia just friendly, eta normal.", "Cha kheye chole asho.", "Smile mane prem na."],
    selimComment: "Sadia'r kotha ushlei amar mathay cha r dokan ghure.",
  },
  {
    id: "tania",
    name: "Tania",
    image: "/assets/selim/character-tisha-portrait.png",
    role: "Campus boundary girl",
    status: "Boundary Test",
    personality: "Says 'no' clearly. Means it.",
    fantasy: "She's hard to get.",
    reality: "Boundary means boundary.",
    secretMemory: "Selim told friends she's 'shy' — actually she set a clear no.",
    goodPath: "Selim respects boundary, levels up self-respect.",
    badPath: "Selim 'tries one more time'. Reputation cost.",
    relatedStat: "Self-Respect",
    voiceStyle: "Clear, confident, sharp but respectful.",
    dangerLevel: "Boundary",
    playerAdvice: ["Respect boundary.", "Don't over-message.", "Apologize if needed."],
    quickReplies: ["Tania boundary clear bolse, respect kor.", "Over-message kora bondho kor.", "Apologize kor jodi dorkar."],
    selimComment: "Tania'r kotha mone ashle amar self-respect ghum theke uthe.",
  },
  {
    id: "sumaiya",
    name: "Sumaiya",
    image: SELIM_ASSETS.busDaydreamCrush,
    role: "Mysterious replier",
    status: "Mixed Signal",
    personality: "Sends '🙂' at 2am, then ghosts for a week.",
    fantasy: "Mysterious mane interested.",
    reality: "Mysterious can mean bored.",
    secretMemory: "Selim wrote 3 voice notes for her, deleted all 3.",
    goodPath: "Selim asks directly, accepts the answer.",
    badPath: "Selim builds delusion castle. Attachment crash.",
    relatedStat: "Emotional Delusion",
    voiceStyle: "Soft, slow, poetic — rainy night vibe.",
    dangerLevel: "Fantasy",
    playerAdvice: ["Mystery is not destiny.", "Talk respectfully.", "No fantasy castles."],
    quickReplies: ["Mystery mane destiny na.", "Direct jiggesh kor.", "Castle banano bondho."],
    selimComment: "Sumaiya'r '🙂' ekhono amar mathay 4D movie chalay.",
  },
  {
    id: "nila",
    name: "Nila",
    image: "/assets/selim/character-nila-portrait.png",
    role: "Truth friend",
    status: "Healthy Friend",
    personality: "Direct, sharp, honest. Roasts with love.",
    fantasy: "She's negative.",
    reality: "She is usually right.",
    secretMemory: "Nila called Pinky's behaviour first. Selim ignored it. Twice.",
    goodPath: "Selim listens and grows IQ + self-respect.",
    badPath: "Selim labels her 'jealous' to dodge truth.",
    relatedStat: "IQ ↔ Friend Trust",
    voiceStyle: "Calm, mature, caring truth-teller.",
    dangerLevel: "Safe Truth",
    playerAdvice: ["Listen to her.", "She is telling truth.", "Self-respect first."],
    quickReplies: ["Nila r kotha shun.", "Sob truth, ignore korish na.", "Self-respect agey."],
    selimComment: "Bhai, Nila beshi truth bole. Tai lage. Kintu darkar.",
  },
  {
    id: "farzana",
    name: "Farzana",
    image: SELIM_ASSETS.workHustleMontage,
    role: "Career motivator",
    status: "Career Motivation",
    personality: "Ambitious. Talks goals, not gossip.",
    fantasy: "Ambitious meyera amake pochondo korbe.",
    reality: "Motivation is not flirting.",
    secretMemory: "She sent a job link. Selim read 'attention' instead of 'opportunity'.",
    goodPath: "Selim applies for the job. Career +.",
    badPath: "Selim reads the link as a love signal. Awkwardness.",
    relatedStat: "Career Progress",
    voiceStyle: "Confident, inspiring, calm.",
    dangerLevel: "Career Positive",
    playerAdvice: ["Career first.", "Read the book.", "Don't misread motivation."],
    quickReplies: ["Career build kor agey.", "Job link ta apply kor.", "Motivation flirt na."],
    selimComment: "Farzana'r message asle ami 5 min CV update kori. Ki feeling.",
  },
  {
    id: "jannat",
    name: "Jannat",
    image: SELIM_ASSETS.girlHappyHelp,
    role: "Healthy respect",
    status: "Respectful Distance",
    personality: "Kind to everyone equally.",
    fantasy: "Kindness mane special love.",
    reality: "Kindness can be normal.",
    secretMemory: "Selim almost confessed; her warm 'thanks for the help' saved him.",
    goodPath: "Selim accepts kindness as kindness, no agenda.",
    badPath: "Selim misreads it as a quiet yes.",
    relatedStat: "Mood",
    voiceStyle: "Warm, sincere, gentle.",
    dangerLevel: "Healthy",
    playerAdvice: ["Healthy respect.", "Don't over-invest.", "Kindness is normal."],
    quickReplies: ["Jannat just kind, eta normal.", "Over-invest korish na.", "Respect rakh."],
    selimComment: "Jannat thanks bolle ami 2 din confidence pai. Reality bhul.",
  },
  {
    id: "mitu",
    name: "Mitu",
    image: SELIM_ASSETS.askingMoneyFriend,
    role: "Convenience risk",
    status: "Convenience Risk",
    personality: "Asks for help often. Doesn't return calls otherwise.",
    fantasy: "She trusts me.",
    reality: "Help without boundary becomes exploitation.",
    secretMemory: "Selim covered her recharge twice in a week. She didn't notice.",
    goodPath: "Selim sets a polite boundary. Self-respect +.",
    badPath: "Selim becomes the on-call helper. Money & energy drain.",
    relatedStat: "Money ↔ Self-Respect",
    voiceStyle: "Modern, playful, slightly spoiled, charming.",
    dangerLevel: "Favor Risk",
    playerAdvice: ["Set a limit.", "No unnecessary help.", "Ask clearly what she needs."],
    quickReplies: ["Mitu ke limit set kor.", "Aar recharge kora bondho.", "Clearly jiggesh kor ki lagbe."],
    selimComment: "Mitu help chaile amar bKash app nijey open hoy. Trust issue.",
  },
  {
    id: "tabin",
    name: "Tabin",
    image: SELIM_ASSETS.chaStallFriendTalk,
    role: "Same-gender sincere arc",
    status: "Same-Gender Truth",
    personality: "Calm, listens fully, never performs.",
    fantasy: "Why do I feel calm with him?",
    reality: "Honesty matters. Confusion isn't a joke.",
    secretMemory: "Selim feels safe around Tabin and isn't sure how to name it.",
    goodPath: "Selim is honest with himself, treats Tabin with respect.",
    badPath: "Selim mocks it to deflect — hurts a real friendship.",
    relatedStat: "Self-Respect",
    safetyNote: "Same-gender feelings are treated with sincerity. No jokes at anyone's expense.",
    voiceStyle: "Soft, grounded, sincere.",
    dangerLevel: "Honesty Risk",
    playerAdvice: ["Be honest.", "Respect his feelings.", "Don't use him as a backup."],
    quickReplies: ["Honest hoye dekh.", "Tabin ke respect kor.", "Backup hisebe use korish na."],
    selimComment: "Tar sathe kotha bolle shanti lage. Eita ami easily explain korte pari na.",
  },
  {
    id: "asha",
    name: "Asha",
    image: SELIM_ASSETS.rooftopSilhouette,
    role: "Married woman / boundary arc",
    status: "Forbidden Attention",
    personality: "Listens patiently. Lonely in her own life.",
    fantasy: "She understands me.",
    reality: "Don't become someone's secret.",
    secretMemory: "Selim felt seen by Asha because she listened when Pinky ignored him.",
    goodPath: "Selim steps back, refers her to a real friend / counselor.",
    badPath: "Selim becomes the secret. Reputation, shame, regret.",
    relatedStat: "Self-Respect ↔ Reputation",
    safetyNote: "Non-explicit. Consequence-based arc — not glorified, not mocked.",
    voiceStyle: "Soft, mature, sad, careful.",
    dangerLevel: "Reputation",
    playerAdvice: ["Respect her marriage.", "Do not become a secret.", "Choose dignity."],
    quickReplies: ["Respect her marriage.", "Secret hoye jash na.", "Dignity choose kor."],
    selimComment: "Bhai, eta sensitive. Ami eikhane bhul korte chai na.",
  },
];

export function getProfileById(id: string): RelationshipProfile | undefined {
  return RELATIONSHIP_PROFILES.find((p) => p.id === id);
}
