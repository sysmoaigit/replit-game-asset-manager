import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Flags } from "../types";

// ─── MONEY HYPOCRISY TOAST ──────────────────────────────────────────────────
// The iconic spec moment: Selim tells the player he's broke, then 3 minutes
// later sends a recharge to a girl. We fire this satirical "transaction
// receipt" toast whenever pinkyRechargeCount ticks up — a reminder that
// Selim found money for love but not for rent. Strictly fictional in-game.

const HYPOCRISY_LINES = [
  "Bhai taka nai... 3 minutes later: Recharge sent to Pinky 💸",
  "Wallet ICU te gelo. Pinky'r data full speed.",
  "Friend advice ignored. Recharge delivered. ✅",
  "Rent pending. Pinky'r MB priority. Selim'r logic.",
  "Bhai ke 'tight' bollo. Pinky ke ৳300 pathalo. Multitasking.",
];

interface MoneyHypocrisyToastProps {
  flags: Flags;
  reducedMotion?: boolean;
}

export default function MoneyHypocrisyToast({ flags, reducedMotion = false }: MoneyHypocrisyToastProps) {
  const [visible, setVisible] = useState(false);
  const [line, setLine] = useState<string>(HYPOCRISY_LINES[0]);
  const lastCountRef = useRef<number>(flags.pinkyRechargeCount);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (flags.pinkyRechargeCount > lastCountRef.current) {
      const idx = flags.pinkyRechargeCount % HYPOCRISY_LINES.length;
      setLine(HYPOCRISY_LINES[idx]);
      lastCountRef.current = flags.pinkyRechargeCount;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      // Slight delay so it follows the card's own result text, not overlaps it.
      window.setTimeout(() => setVisible(true), 900);
      timerRef.current = window.setTimeout(() => setVisible(false), 5400) as unknown as number;
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [flags.pinkyRechargeCount]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="fixed left-1/2 z-40 -translate-x-1/2 rounded-full shadow-xl"
          style={{
            top: 24,
            maxWidth: "92vw",
            background: "linear-gradient(90deg, #2a0a14 0%, #3d0f1a 100%)",
            border: "1px solid rgba(236, 72, 153, 0.45)",
            padding: "8px 14px",
          }}
          role="status"
          aria-live="polite"
          onClick={() => setVisible(false)}
        >
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>🧾</span>
            <p
              className="text-[12px] font-medium leading-tight"
              style={{ color: "#ffd1e0", fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {line}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
