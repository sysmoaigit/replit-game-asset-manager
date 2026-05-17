import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audioEngine, SubtitleEvent } from "../game/audioEngine";
import { VoiceMood } from "../game/voiceLines";

const MOOD_EMOJI: Record<VoiceMood, string> = {
  happy:         "😊",
  sad:           "😢",
  excited:       "🤩",
  nervous:       "😰",
  defensive:     "🛡️",
  confused:      "😕",
  romantic:      "💖",
  regret:        "😔",
  determined:    "💪",
  playful:       "😄",
  angry:         "😠",
  hopeful:       "🌟",
  tired:         "😴",
  proud:         "🏆",
  embarrassed:   "😳",
  philosophical: "🤔",
};

const SPEAKER_LABELS: Record<string, string> = {
  selim:       "সেলিম",
  pinky:       "পিঙ্কি",
  rafiq:       "রাফিক",
  nila:        "নিলা",
  "cha-mama":  "চা মামা",
  "kuddus-bhai": "কুদ্দুস ভাই",
};

const SPEAKER_COLORS: Record<string, string> = {
  selim:         "#FF6B00",
  pinky:         "#FF69B4",
  rafiq:         "#22c55e",
  nila:          "#3b82f6",
  "cha-mama":    "#f59e0b",
  "kuddus-bhai": "#8b5cf6",
};

interface VoiceSubtitleProps {
  reducedMotion?: boolean;
}

export default function VoiceSubtitle({ reducedMotion = false }: VoiceSubtitleProps) {
  const [current, setCurrent] = useState<SubtitleEvent | null>(null);
  const [displayText, setDisplayText] = useState("");
  const [typingIdx, setTypingIdx] = useState(0);

  useEffect(() => {
    const unsub = audioEngine.onSubtitle((evt) => {
      setCurrent(evt);
      setDisplayText(evt ? "" : "");
      setTypingIdx(0);
    });
    return unsub;
  }, []);

  // Typing animation
  useEffect(() => {
    if (!current) { setDisplayText(""); setTypingIdx(0); return; }
    if (reducedMotion) { setDisplayText(current.text); return; }
    if (typingIdx >= current.text.length) return;
    const timer = setTimeout(() => {
      setDisplayText(current.text.slice(0, typingIdx + 1));
      setTypingIdx((i) => i + 1);
    }, 28);
    return () => clearTimeout(timer);
  }, [current, typingIdx, reducedMotion]);

  const dismiss = useCallback(() => {
    audioEngine.dismissSubtitle();
    setCurrent(null);
  }, []);

  if (!current) return null;

  const color = SPEAKER_COLORS[current.speaker] ?? "#FF6B00";
  const speakerLabel = SPEAKER_LABELS[current.speaker] ?? current.speaker;
  const emoji = MOOD_EMOJI[current.mood] ?? "💬";
  const isSelim = current.speaker === "selim";

  return (
    <AnimatePresence>
      <motion.div
        key={current.lineId}
        initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        onClick={dismiss}
        style={{
          position: "fixed",
          bottom: 90,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(90vw, 400px)",
          zIndex: 60,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            background: "rgba(10, 5, 0, 0.88)",
            border: `2px solid ${color}`,
            borderRadius: 16,
            padding: "10px 14px",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* Speaker row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 15 }}>{emoji}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color,
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
            >
              {speakerLabel}
            </span>
            {isSelim && current.boguraFlavor && (
              <span
                style={{
                  fontSize: 9,
                  background: "rgba(255,107,0,0.2)",
                  border: "1px solid rgba(255,107,0,0.5)",
                  color: "#FFB347",
                  borderRadius: 6,
                  padding: "1px 5px",
                  fontWeight: 700,
                }}
              >
                বগুরা টান
              </span>
            )}
            <span
              style={{
                marginLeft: "auto",
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
              }}
            >
              ট্যাপ করে বন্ধ করো
            </span>
          </div>

          {/* Dialogue text */}
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.92)",
              fontFamily: "'Hind Siliguri', sans-serif",
              minHeight: 20,
            }}
          >
            {displayText}
            {!reducedMotion && typingIdx < (current?.text.length ?? 0) && (
              <span style={{ opacity: 0.5 }}>|</span>
            )}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
