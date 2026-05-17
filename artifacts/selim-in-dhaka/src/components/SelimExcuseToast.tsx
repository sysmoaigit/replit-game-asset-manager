import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Flags } from "../types";

// ─── SELIM EXCUSE TOAST ─────────────────────────────────────────────────────
// From the spec's "Male friend vs girl behavior" section. Whenever the player
// (or anyone) gets money out of Selim — flagged by moneyAskedFromFriend — we
// pop a small floating quote of one of his classic excuses, the contrast
// joke against MoneyHypocrisyToast for the girl side. The two toasts are
// the comedy receipt of Selim's wallet logic.

const EXCUSES = [
  "Bhai, amar obostha tight. 😬",
  "Taka nai, heart ache. 💔",
  "Kalke bol? Aj ektu pressure.",
  "Actually Pinky'r ekta urgent matter.",
  "Tor jonno jaan ache, taka ekhon locked.",
  "Bhai, ami nijey borrow korar mood e.",
  "Rent pending, but Pinky'r data urgent.",
  "Tui amar friend, bujhbi.",
];

interface SelimExcuseToastProps {
  flags: Flags;
  reducedMotion?: boolean;
}

export default function SelimExcuseToast({ flags, reducedMotion = false }: SelimExcuseToastProps) {
  const [visible, setVisible] = useState(false);
  const [line, setLine] = useState<string>(EXCUSES[0]);
  const lastCountRef = useRef<number>(flags.moneyAskedFromFriend);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (flags.moneyAskedFromFriend > lastCountRef.current) {
      const idx = flags.moneyAskedFromFriend % EXCUSES.length;
      setLine(EXCUSES[idx]);
      lastCountRef.current = flags.moneyAskedFromFriend;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.setTimeout(() => setVisible(true), 700);
      timerRef.current = window.setTimeout(() => setVisible(false), 4800) as unknown as number;
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [flags.moneyAskedFromFriend]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="fixed left-1/2 z-40 -translate-x-1/2 rounded-2xl shadow-xl"
          style={{
            top: 72,
            maxWidth: "92vw",
            background: "linear-gradient(180deg, #1a1408 0%, #0d0a04 100%)",
            border: "1px solid rgba(250, 204, 21, 0.45)",
            padding: "8px 14px",
          }}
          role="status"
          aria-live="polite"
          onClick={() => setVisible(false)}
        >
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>💬</span>
            <p
              className="text-[12px] italic font-medium leading-tight"
              style={{ color: "#fde68a", fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              Selim: "{line}"
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
