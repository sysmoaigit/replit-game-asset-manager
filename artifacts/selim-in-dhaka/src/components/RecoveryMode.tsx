import { motion } from "framer-motion";
import { GameCard, Choice, Stats } from "../types";
import SelimAvatar from "./SelimAvatar";
import SceneArt from "./SceneArt";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";

interface RecoveryModeProps {
  card: GameCard | null;
  stats: Stats;
  recoveryTurns: number;
  onChoice: (choice: Choice) => void;
  reducedMotion?: boolean;
}

export default function RecoveryMode({ card, stats, recoveryTurns, onChoice, reducedMotion = false }: RecoveryModeProps) {
  const maxTurns = 5;
  const progress = (recoveryTurns / maxTurns) * 100;

  return (
    <div
      className="min-h-full w-full flex flex-col items-center relative"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #1a0000 0%, #2d0000 100%)",
      }}
      data-testid="screen-recovery"
    >
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <SceneArt
          sceneKey="rainyHeartbreak"
          overlay="danger"
          height="100%"
          rounded={false}
          priority
          reducedMotion={reducedMotion}
          position="center 25%"
        />
      </div>
      <div className="relative z-10 w-full max-w-sm px-4 pt-6 pb-4 flex flex-col gap-3">
        {/* Header */}
        <motion.div
          animate={reducedMotion ? {} : { scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center rounded-2xl p-4"
          style={{ background: "rgba(220, 20, 20, 0.2)", border: "2px solid rgba(220, 20, 20, 0.5)" }}
        >
          <p className="text-2xl font-bold text-red-400">🚨 Dry Selim Crisis</p>
          <p
            className="text-sm mt-1"
            style={{ color: "#FF9999", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            সেলিম ভাই, ভাইব গেছে। এখন লাইফ বাঁচাও।
          </p>
        </motion.div>

        {/* Recovery progress */}
        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Recovery Progress</span>
            <span className="text-xs font-bold text-green-400">{recoveryTurns}/{maxTurns} সম্পন্ন</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${progress}%` }}
              transition={reducedMotion ? {} : { duration: 0.5 }}
              style={{ background: "linear-gradient(90deg, #ef4444, #22c55e)" }}
            />
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <SelimAvatar stats={stats} size="md" reducedMotion={reducedMotion} />
        </div>

        {/* Recovery card */}
        {card ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #FFF8EE 0%, #FFF0E0 100%)" }}
          >
            <div className="px-4 pt-3 pb-2" style={{ background: "linear-gradient(90deg, #991B1B 0%, #B91C1C 100%)" }}>
              <span className="text-xs text-red-200 font-medium uppercase">Recovery Card</span>
              {card.speaker && <p className="text-xs text-red-100 mt-0.5">{card.speaker} বলছে:</p>}
            </div>
            <div className="p-4">
              <h3
                className="font-bold text-sm mb-2"
                style={{ color: "#1a1a1a", fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                {card.title}
              </h3>
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{ color: "#333", fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                {card.text}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {card.choices.map((choice, idx) => {
                  const colors: Record<string, string> = {
                    do: "#16a34a",
                    avoid: "#dc2626",
                    smart: "#2563eb",
                    later: "#6b7280",
                  };
                  return (
                    <button
                      key={idx}
                      data-testid={`recovery-choice-${idx}`}
                      onClick={() => onChoice(choice)}
                      className="rounded-xl p-2.5 text-white text-xs font-semibold active:scale-95 transition-transform min-h-[48px]"
                      style={{ background: colors[choice.kind], fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 p-8">
            <p style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {getSystemLine(
                audioEngine.getSettings().humorLevel,
                "Recovery শেষ — একটু wait করো, চা গরম হচ্ছে…",
              )}
            </p>
          </div>
        )}

        {/* Warning */}
        <p
          className="text-center text-xs opacity-60"
          style={{ color: "#FF9999", fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          ৫টি recovery step সম্পন্ন করো। সুস্থ সেলিম ফিরবে।
        </p>
      </div>
    </div>
  );
}
