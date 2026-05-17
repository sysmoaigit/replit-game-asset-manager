import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard, Choice, Stats } from "../types";

interface DecisionCardProps {
  card: GameCard;
  stats: Stats;
  onChoice: (choice: Choice) => void;
  reducedMotion?: boolean;
}

const kindColors: Record<string, string> = {
  do: "bg-orange-500 hover:bg-orange-600 border-orange-600",
  avoid: "bg-green-600 hover:bg-green-700 border-green-700",
  smart: "bg-blue-600 hover:bg-blue-700 border-blue-700",
  later: "bg-gray-500 hover:bg-gray-600 border-gray-600",
};

function formatEffect(key: string, val: number): string {
  const labels: Record<string, string> = {
    health: "Health", mood: "Mood", money: "৳Money",
    iq: "IQ", energy: "Energy", reputation: "Rep",
    addiction: "Addiction", temptation: "Tempt",
  };
  const sign = val > 0 ? "+" : "";
  return `${labels[key] ?? key} ${sign}${val}`;
}

function EffectPreview({ choice, iq }: { choice: Choice; iq: number }) {
  if (iq < 45) {
    const hasPos = Object.values(choice.effects).some((v) => (v ?? 0) > 0);
    const hasNeg = Object.values(choice.effects).some((v) => (v ?? 0) < 0);
    if (hasPos && hasNeg) return <span className="text-yellow-300 text-xs">হয়তো ভালো, হয়তো বিপদ</span>;
    if (hasPos) return <span className="text-green-300 text-xs">মনে হচ্ছে ভালো</span>;
    if (hasNeg) return <span className="text-red-300 text-xs">একটু ঝুঁকি আছে</span>;
    return <span className="text-gray-300 text-xs">বোঝা যাচ্ছে না</span>;
  }

  const parts = Object.entries(choice.effects)
    .filter(([, v]) => v !== 0 && v !== undefined)
    .map(([k, v]) => (
      <span key={k} className={`text-xs ${(v ?? 0) > 0 ? "text-green-300" : "text-red-300"}`}>
        {formatEffect(k, v as number)}
      </span>
    ));
  return <div className="flex flex-wrap gap-1">{parts}</div>;
}

export default function DecisionCard({ card, stats, onChoice, reducedMotion = false }: DecisionCardProps) {
  const [disabled, setDisabled] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChoice = (choice: Choice) => {
    if (disabled) return;
    setDisabled(true);

    const totalNeg = Object.values(choice.effects).reduce((acc, v) => acc + (v && v < 0 ? Math.abs(v) : 0), 0);
    if (totalNeg > 20 && !reducedMotion) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    setTimeout(() => {
      onChoice(choice);
      setDisabled(false);
    }, 150);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={card.id}
        initial={reducedMotion ? {} : { x: 80, opacity: 0 }}
        animate={reducedMotion ? {} : (shake
          ? { x: [-6, 6, -4, 4, 0], transition: { duration: 0.4 } }
          : { x: 0, opacity: 1, transition: { duration: 0.3 } }
        )}
        exit={reducedMotion ? {} : { x: -80, opacity: 0, transition: { duration: 0.2 } }}
        className="w-full max-w-sm mx-auto"
      >
        <div
          className="rounded-2xl shadow-xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FFF8EE 0%, #FFF3E0 100%)", border: "1px solid rgba(0,0,0,0.1)" }}
          data-testid={`card-${card.id}`}
        >
          {/* Header */}
          <div className="px-4 pt-3 pb-2" style={{ background: "linear-gradient(90deg, #FF6B00 0%, #FF8F00 100%)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-100 font-medium uppercase tracking-wide">{card.location}</span>
              <span className="text-xs bg-white bg-opacity-20 text-white rounded-full px-2 py-0.5">{card.category}</span>
            </div>
          </div>

          {/* Card body */}
          <div className="p-4">
            {card.speaker && (
              <p className="text-xs font-semibold mb-1" style={{ color: "#FF6B00" }}>
                {card.speaker} বলছে:
              </p>
            )}
            <h2 className="text-base font-bold mb-2" style={{ color: "#1a1a1a", lineHeight: 1.4 }}>
              {card.title}
            </h2>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#333", fontFamily: "'Hind Siliguri', sans-serif" }}>
              {card.text}
            </p>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-2">
              {card.choices.map((choice, idx) => (
                <button
                  key={idx}
                  data-testid={`choice-${card.id}-${choice.kind}`}
                  onClick={() => handleChoice(choice)}
                  disabled={disabled}
                  className={`relative text-white text-xs font-semibold rounded-xl p-2.5 min-h-[52px] transition-all active:scale-95 border ${kindColors[choice.kind]} disabled:opacity-60 disabled:cursor-not-allowed`}
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  <div className="flex flex-col gap-1">
                    <span>{choice.label}</span>
                    <div className="opacity-80">
                      <EffectPreview choice={choice} iq={stats.iq} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
