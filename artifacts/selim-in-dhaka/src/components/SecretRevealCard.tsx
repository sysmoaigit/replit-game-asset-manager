import { motion } from "framer-motion";
import type { Secret } from "../game/selimSecrets";

interface Props {
  secret: Secret;
  reducedMotion?: boolean;
}

const TYPE_ICON: Record<string, string> = {
  love_secret: "💞",
  money_secret: "💸",
  pinky_secret: "🎀",
  fake_id_secret: "🎭",
  lie_secret: "🤥",
  asha_secret: "🌙",
  tabin_secret: "🤝",
  shame_secret: "🫥",
  promise_secret: "🤞",
  career_secret: "💼",
};

export default function SecretRevealCard({ secret, reducedMotion = false }: Props) {
  const icon = TYPE_ICON[secret.type] || "🔓";
  const effects = Object.entries(secret.effect)
    .filter(([, v]) => typeof v === "number" && v !== 0)
    .map(([k, v]) => `${k} ${v! > 0 ? "+" : ""}${v}`);

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, scale: 0.92, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 18, stiffness: 220 }}
      className="my-2 mx-auto w-full max-w-[88%] rounded-2xl px-4 py-3"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(236,72,153,0.18))",
        border: "1px solid rgba(236,72,153,0.45)",
        boxShadow: "0 4px 18px rgba(124,58,237,0.25)",
        fontFamily: "'Hind Siliguri', sans-serif",
      }}
      data-testid="secret-reveal-card"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#f9a8d4" }}>
          Secret Unlocked
        </span>
        <span className="ml-auto text-[10px] opacity-70" style={{ color: "#fde2f3" }}>
          re: {secret.related}
        </span>
      </div>
      <p className="text-[13px] leading-snug text-white">{secret.text}</p>
      {effects.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {effects.map((e) => (
            <span
              key={e}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fde2f3",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {e}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
