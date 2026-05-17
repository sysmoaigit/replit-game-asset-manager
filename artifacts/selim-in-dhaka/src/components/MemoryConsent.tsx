import { motion } from "framer-motion";
import { PlayerProfile } from "../ai/types";

interface Props {
  onChoice: (choice: "enable" | "disable" | "reset") => void;
  currentProfile: PlayerProfile;
  reducedMotion?: boolean;
}

export default function MemoryConsent({ onChoice, currentProfile, reducedMotion = false }: Props) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
        style={{
          background: "linear-gradient(135deg, #1a0f05, #2d1a08)",
          border: "1px solid rgba(255,215,0,0.25)",
          boxShadow: "0 0 40px rgba(255,107,0,0.2)",
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "#FFD700" }}>
            Selim's Memory
          </h2>
          <p className="text-sm" style={{ color: "#FFB347" }}>
            সেলিম কি তোর কথা মনে রাখবে?
          </p>
        </div>

        <div
          className="rounded-2xl p-4 text-sm leading-relaxed"
          style={{ background: "rgba(255,255,255,0.06)", color: "#e5e7eb" }}
        >
          <p className="mb-2">
            <span style={{ color: "#22c55e" }}>✓ Enable করলে:</span> Selim তোর গল্প, advice, inside jokes মনে রাখবে। Memory শুধু এই ডিভাইসে থাকবে।
          </p>
          <p className="mb-2">
            <span style={{ color: "#FFB347" }}>○ Disable করলে:</span> Selim প্রতিবার fresh শুরু করবে। কোনো data save হবে না।
          </p>
          <p className="text-xs mt-2 opacity-60">
            🔒 কোনো data server-এ যাবে না, AI mode চালু না করলে।
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onChoice("enable")}
            className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
            }}
          >
            🧠 Enable Local Memory
          </button>
          <button
            onClick={() => onChoice("disable")}
            className="w-full py-3 rounded-2xl font-semibold text-sm active:scale-95 transition-transform"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#9ca3af",
            }}
          >
            Play Without Memory
          </button>
          {currentProfile.firstRunSeen && (
            <button
              onClick={() => onChoice("reset")}
              className="w-full py-2 rounded-xl font-semibold text-xs active:scale-95 transition-transform"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444",
              }}
            >
              🗑️ Reset All Memory
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
