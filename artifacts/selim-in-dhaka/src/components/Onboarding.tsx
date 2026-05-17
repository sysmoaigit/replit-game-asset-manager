import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SelimAvatar from "./SelimAvatar";
import { INITIAL_STATS } from "../game/engine";
import { tryUnlockEgg } from "../game/easterEggs";
import { notifyEggUnlock } from "./EggUnlockToast";
import { SELIM_LIFE_ASSETS, type LifeSceneKey } from "../game/assets";

const BEAT_BACKDROPS: LifeSceneKey[] = [
  "dreamingPinkyRooftop",
  "lifeChaosDashboard",
  "workHustleMontage",
  "friendsCrushTeaStall",
];

interface Props {
  onComplete: (data: { nickname: string; skipped: boolean }) => void;
  reducedMotion?: boolean;
}

type Beat = {
  title: string;
  text: string;
  emoji: string;
};

const BEATS: Beat[] = [
  {
    title: "আসসালামু আলাইকুম",
    text: "আমি Selim। Bogura থেকে এসেছি ঢাকায় — career-এর জন্য, Pinky-র জন্য, নিজেকে খোঁজার জন্য। তুমি আমার বন্ধু হবে?",
    emoji: "👋",
  },
  {
    title: "তুমি আমার Voice of Reason",
    text: "প্রতিদিন ৪টা card আসবে। তুমি advice দেবে — আমি কখনো শুনবো, কখনো না। ১৫ দিনে আমার ending decide হবে।",
    emoji: "🎴",
  },
  {
    title: "Stats balance রাখো",
    text: "Health, Mood, Money, IQ, Energy — সবই matter করে। Pinky-র Hope, Friend Trust, Self-Respect — এগুলোও। একটা breakdown হলে recovery mode আসবে।",
    emoji: "⚖️",
  },
  {
    title: "তোর নাম কী?",
    text: "Selim তোমাকে কী বলে ডাকবে? এই নামেই গল্পে থাকবে।",
    emoji: "✨",
  },
];

export default function Onboarding({ onComplete, reducedMotion = false }: Props) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const beat = BEATS[step];
  const isLast = step === BEATS.length - 1;

  const handleNext = () => {
    if (isLast) {
      const cleaned = nickname.trim() || "Bhai";
      const lower = cleaned.toLowerCase();
      if (lower === "pinky") notifyEggUnlock(tryUnlockEgg("name_pinky"));
      else if (lower === "selim") notifyEggUnlock(tryUnlockEgg("name_selim"));
      onComplete({ nickname: cleaned, skipped: false });
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    onComplete({ nickname: nickname.trim() || "Bhai", skipped: true });
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-hidden"
      style={{ background: "rgba(0,0,0,0.92)" }}
      data-testid="screen-onboarding"
    >
      {/* Cinematic backdrop — cross-fades per beat */}
      <AnimatePresence mode="wait">
        <motion.img
          key={BEAT_BACKDROPS[step] ?? BEAT_BACKDROPS[0]}
          src={SELIM_LIFE_ASSETS[BEAT_BACKDROPS[step] ?? BEAT_BACKDROPS[0]]}
          alt=""
          aria-hidden
          initial={reducedMotion ? { opacity: 0.25 } : { opacity: 0, scale: 1.05 }}
          animate={reducedMotion ? { opacity: 0.25 } : { opacity: 0.32, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ filter: "blur(1px)" }}
        />
      </AnimatePresence>
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5"
        style={{
          background: "linear-gradient(135deg, #1a0f05, #2d1a08)",
          border: "1px solid rgba(255,215,0,0.25)",
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
      >
        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {BEATS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 24 : 8,
                background: i <= step ? "#FF6B00" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <SelimAvatar stats={INITIAL_STATS} size="md" reducedMotion={reducedMotion} showStatus />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <div className="text-3xl mb-2">{beat.emoji}</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#FFD700" }}>
              {beat.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#FFB890" }}>
              {beat.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {isLast && (
          <input
            data-testid="onboarding-name-input"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="যেমন: Rakib, Rohan, Dost..."
            className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,215,0,0.3)" }}
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
            autoFocus
          />
        )}

        <div className="flex flex-col gap-2">
          <button
            data-testid="btn-onboarding-next"
            onClick={handleNext}
            className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF8F00)", color: "white" }}
          >
            {isLast ? "শুরু করি! 🚀" : "পরের কথা →"}
          </button>
          <button
            data-testid="btn-onboarding-skip"
            onClick={handleSkip}
            className="w-full py-2 rounded-xl text-xs font-semibold active:scale-95 transition-transform"
            style={{ background: "transparent", color: "#888" }}
          >
            Skip — সরাসরি খেলি
          </button>
        </div>
      </div>
    </motion.div>
  );
}
