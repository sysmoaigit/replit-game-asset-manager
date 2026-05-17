import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type HintDef } from "../lib/hintRegistry";

interface Props {
  hint: HintDef | null;
  onDismiss: () => void;
  reducedMotion?: boolean;
  autoDismissMs?: number;
}

/** Floating one-time coachmark that surfaces at the top of the screen. */
export default function Coachmark({ hint, onDismiss, reducedMotion = false, autoDismissMs = 6000 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hint) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 200);
    }, autoDismissMs);
    return () => clearTimeout(t);
  }, [hint, autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {hint && visible && (
        <motion.div
          key={hint.id}
          initial={reducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          exit={reducedMotion ? {} : { opacity: 0, y: -20 }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-sm"
          data-testid="coachmark"
          data-hint-id={hint.id}
        >
          <div
            className="rounded-2xl p-3 flex gap-3 items-start cursor-pointer active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,0,0.95), rgba(255,143,0,0.95))",
              border: "1px solid rgba(255,215,0,0.6)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
            onClick={() => { setVisible(false); setTimeout(onDismiss, 200); }}
          >
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="font-bold text-sm text-white">{hint.title}</p>
              <p className="text-xs text-white opacity-90 mt-0.5 leading-snug">{hint.text}</p>
            </div>
            <button
              aria-label="Dismiss"
              className="text-white opacity-70 hover:opacity-100 text-xs"
              onClick={(e) => { e.stopPropagation(); setVisible(false); setTimeout(onDismiss, 200); }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
