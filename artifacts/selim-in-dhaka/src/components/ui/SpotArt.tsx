import { motion } from "framer-motion";

// Spot illustrations for loading / empty / error states.
// Inline SVGs sized as accents (<=96px), tied to the brand palette.

interface SpotProps {
  size?: number;
  reducedMotion?: boolean;
  className?: string;
  caption?: string;
}

/* ── Loading: cha cup with rising steam ── */
export function ChaLoadingSpot({
  size = 84,
  reducedMotion = false,
  className = "",
  caption = "এক কাপ চা… loading",
}: SpotProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      data-testid="spot-loading"
    >
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        {/* Steam — three wisps */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M ${36 + i * 14} 30 q ${i % 2 === 0 ? 8 : -8} -10 0 -22`}
            stroke="#FFD700"
            strokeOpacity={0.6}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={reducedMotion ? false : { y: 0, opacity: 0.3 }}
            animate={
              reducedMotion
                ? {}
                : { y: [0, -6, 0], opacity: [0.3, 0.85, 0.3] }
            }
            transition={{
              repeat: Infinity,
              duration: 2.2,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
        {/* Saucer */}
        <ellipse cx="50" cy="86" rx="34" ry="6" fill="#3a2410" />
        <ellipse cx="50" cy="83" rx="34" ry="6" fill="#FFB347" />
        {/* Cup */}
        <path
          d="M 26 50 h 48 l -4 32 a 4 4 0 0 1 -4 4 H 34 a 4 4 0 0 1 -4 -4 Z"
          fill="#FFF8EE"
          stroke="#FF6B00"
          strokeWidth="2"
        />
        {/* Cup band */}
        <rect x="26" y="56" width="48" height="3" fill="#FF6B00" opacity="0.85" />
        {/* Handle */}
        <path
          d="M 74 60 q 10 0 10 10 t -10 10"
          stroke="#FFF8EE"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M 74 60 q 10 0 10 10 t -10 10"
          stroke="#FF6B00"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      {caption ? (
        <p className="text-xs font-bn text-center" style={{ color: "var(--brand-tea)" }}>
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/* ── Empty: paper boat (monsoon puddle, nothing yet) ── */
export function PaperBoatSpot({
  size = 84,
  reducedMotion = false,
  className = "",
  caption = "এখনো কিছু নেই",
}: SpotProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
      role="status"
      data-testid="spot-empty"
    >
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        {/* Puddle ripples */}
        <motion.ellipse
          cx="50"
          cy="78"
          rx="38"
          ry="6"
          fill="none"
          stroke="#3399FF"
          strokeWidth="1.5"
          opacity="0.5"
          animate={reducedMotion ? {} : { rx: [38, 42, 38], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
        <ellipse cx="50" cy="78" rx="30" ry="4" fill="#1a3a5a" opacity="0.6" />
        {/* Boat body */}
        <motion.g
          animate={reducedMotion ? {} : { rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
          style={{ transformOrigin: "50px 70px" }}
        >
          <path
            d="M 18 70 L 82 70 L 70 80 L 30 80 Z"
            fill="#FFF8EE"
            stroke="#FF6B00"
            strokeWidth="2"
          />
          {/* Sail */}
          <path
            d="M 50 28 L 50 70 L 26 70 Z"
            fill="#FFB347"
            stroke="#FF6B00"
            strokeWidth="2"
          />
          <path
            d="M 50 28 L 50 70 L 74 70 Z"
            fill="#FFD700"
            stroke="#FF6B00"
            strokeWidth="2"
            opacity="0.85"
          />
        </motion.g>
      </svg>
      {caption ? (
        <p className="text-xs font-bn text-center" style={{ color: "var(--brand-tea)" }}>
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/* ── Error: street lantern flickering on dark night ── */
export function LanternErrorSpot({
  size = 84,
  reducedMotion = false,
  className = "",
  caption = "একটু ঝামেলা হলো",
}: SpotProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
      role="alert"
      data-testid="spot-error"
    >
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        {/* Pole */}
        <rect x="48" y="30" width="4" height="60" fill="#3a2410" />
        <rect x="40" y="88" width="20" height="4" fill="#3a2410" />
        {/* Bulb halo */}
        <motion.circle
          cx="50"
          cy="22"
          r="18"
          fill="#FFD700"
          opacity="0.18"
          animate={reducedMotion ? {} : { opacity: [0.18, 0.05, 0.22, 0.08, 0.18] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        {/* Lantern hood */}
        <path
          d="M 36 14 L 64 14 L 60 22 L 40 22 Z"
          fill="#3a2410"
          stroke="#FF6B00"
          strokeWidth="1.5"
        />
        {/* Glass */}
        <motion.path
          d="M 40 22 L 60 22 L 58 34 L 42 34 Z"
          fill="#FFD700"
          stroke="#FF6B00"
          strokeWidth="1.5"
          animate={reducedMotion ? {} : { fillOpacity: [0.9, 0.4, 1, 0.5, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        {/* Hanger */}
        <path d="M 50 14 v -6" stroke="#3a2410" strokeWidth="2" />
      </svg>
      {caption ? (
        <p className="text-xs font-bn text-center" style={{ color: "var(--brand-warn, #ef4444)" }}>
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/* ── Convenience grouping ── */
const SpotArt = {
  Loading: ChaLoadingSpot,
  Empty: PaperBoatSpot,
  Error: LanternErrorSpot,
};

export default SpotArt;
