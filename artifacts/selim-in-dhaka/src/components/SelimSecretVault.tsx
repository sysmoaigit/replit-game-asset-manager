import { motion } from "framer-motion";
import { useMemo } from "react";
import { SECRETS, loadRevealedSecrets, type Secret } from "../game/selimSecrets";
import type { Stats } from "../types";

interface Props {
  stats: Stats;
  onClose: () => void;
  reducedMotion?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  love_secret: "Love",
  money_secret: "Money",
  pinky_secret: "Pinky",
  fake_id_secret: "Fake ID",
  lie_secret: "Lie",
  asha_secret: "Asha",
  tabin_secret: "Tabin",
  shame_secret: "Shame",
  promise_secret: "Promise",
  career_secret: "Career",
};

export default function SelimSecretVault({ stats, onClose, reducedMotion = false }: Props) {
  const revealed = useMemo(() => loadRevealedSecrets(), []);

  const grouped = useMemo(() => {
    const map = new Map<string, Secret[]>();
    for (const s of SECRETS) {
      const arr = map.get(s.type) || [];
      arr.push(s);
      map.set(s.type, arr);
    }
    return map;
  }, []);

  return (
    <motion.div
      data-testid="selim-secret-vault"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
      className="fixed inset-0 z-[110] flex flex-col"
      style={{ background: "linear-gradient(180deg,#1a1224 0%,#0a0612 100%)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(236,72,153,0.18)" }}>
        <span className="text-lg">🔐</span>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white">Selim's Secret Vault</h2>
          <p className="text-[11px]" style={{ color: "#cbd5e1" }}>
            {revealed.size}/{SECRETS.length} unlocked · Friend Trust: {Math.round(stats.friendTrust)}
          </p>
        </div>
        <button onClick={onClose} className="px-3 py-1.5 rounded-full text-xs"
          style={{ background: "rgba(255,255,255,0.08)", color: "#fde2f3" }}>
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {Array.from(grouped.entries()).map(([type, list]) => (
          <section key={type}>
            <h3 className="text-[10px] uppercase tracking-wider mb-1.5 px-1"
              style={{ color: "#f9a8d4" }}>
              {TYPE_LABEL[type] || type}
            </h3>
            <div className="space-y-2">
              {list.map((s) => {
                const isRevealed = revealed.has(s.id);
                const trustOk = stats.friendTrust >= s.trustRequired;
                return (
                  <div key={s.id}
                    className="rounded-xl px-3 py-2.5"
                    style={{
                      background: isRevealed
                        ? "linear-gradient(135deg,rgba(236,72,153,0.18),rgba(124,58,237,0.18))"
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isRevealed ? "rgba(236,72,153,0.35)" : "rgba(255,255,255,0.08)"}`,
                      fontFamily: "'Hind Siliguri', sans-serif",
                    }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{isRevealed ? "🔓" : "🔒"}</span>
                      <span className="text-[10px] uppercase tracking-wider"
                        style={{ color: isRevealed ? "#fde2f3" : "#9ca3af" }}>
                        re: {s.related}
                      </span>
                      <span className="ml-auto text-[10px]"
                        style={{ color: trustOk ? "#86efac" : "#9ca3af" }}>
                        Trust ≥ {s.trustRequired}
                      </span>
                    </div>
                    <p className="text-[13px] leading-snug"
                      style={{ color: isRevealed ? "white" : "#6b7280" }}>
                      {isRevealed ? s.text : "🔒 Locked. Build Friend Trust through real conversation."}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
}
