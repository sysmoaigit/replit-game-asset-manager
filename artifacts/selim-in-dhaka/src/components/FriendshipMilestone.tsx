import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface Props {
  milestone: number | null;
  reducedMotion?: boolean;
  onDismiss: () => void;
  /** Optional Selim quote from UNLOCK_EVENTS — shown as a celebration line. */
  unlockDialogue?: string | null;
  /** When true, render with extra fanfare (sparkles + scale pop) for unlock events. */
  isUnlockEvent?: boolean;
}

const MILESTONE_LINES: Record<number, { line: string; vibe: string; color: string }> = {
  25: {
    line: "তুই সব সময় negative কেন?",
    vibe: "Selim's first push-back. Friendship is forming.",
    color: "#fbbf24",
  },
  50: {
    line: "তুই কিছু কিছু ঠিক বলিস।",
    vibe: "Selim is starting to trust your advice.",
    color: "#22c55e",
  },
  75: {
    line: "ভাই, তুই না থাকলে আমি আরো নষ্ট হইতাম।",
    vibe: "Best Friend Mode unlocked. Selim listens more.",
    color: "#3b82f6",
  },
  90: {
    line: "Pinky important, but তুই আমার আসল friend।",
    vibe: "Yeh dosti vibe — friendship over everything.",
    color: "#ec4899",
  },
};

export default function FriendshipMilestone({
  milestone,
  reducedMotion = false,
  onDismiss,
  unlockDialogue = null,
  isUnlockEvent = false,
}: Props) {
  useEffect(() => {
    if (milestone == null) return;
    const t = setTimeout(onDismiss, isUnlockEvent ? 7500 : 5500);
    return () => clearTimeout(t);
  }, [milestone, onDismiss, isUnlockEvent]);

  const meta = milestone != null ? MILESTONE_LINES[milestone] : undefined;
  const showUnlock = isUnlockEvent && unlockDialogue && unlockDialogue.trim().length > 0;
  const headerLabel = milestone === 75
    ? "🤝 Best Friend Mode — Unlocked!"
    : milestone === 90
    ? "💛 Life Brother — Certified!"
    : `🤝 Friendship Trust ${milestone}`;

  return (
    <AnimatePresence>
      {milestone != null && meta && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -30, scale: showUnlock ? 0.7 : 0.9 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: showUnlock ? 260 : 220, damping: showUnlock ? 14 : 18 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm"
          onClick={onDismiss}
          data-testid={showUnlock ? "friendship-unlock-toast" : "friendship-milestone-toast"}
        >
          <div
            className="rounded-2xl px-4 py-3 cursor-pointer relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(20, 5, 30, 0.96), rgba(40, 10, 50, 0.96))",
              border: `2px solid ${meta.color}`,
              boxShadow: showUnlock
                ? `0 12px 48px ${meta.color}66, inset 0 0 32px ${meta.color}33`
                : `0 8px 32px ${meta.color}44, inset 0 0 20px ${meta.color}22`,
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            {showUnlock && !reducedMotion && (
              <>
                <motion.div
                  aria-hidden
                  className="absolute -top-2 -left-2 text-2xl pointer-events-none"
                  initial={{ opacity: 0, scale: 0, rotate: -30 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1, 0.8], rotate: [0, 15, -10, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.4 }}
                >
                  ✨
                </motion.div>
                <motion.div
                  aria-hidden
                  className="absolute -bottom-1 -right-1 text-2xl pointer-events-none"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.8], rotate: [0, -20, 10] }}
                  transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.6, delay: 0.5 }}
                >
                  🎉
                </motion.div>
              </>
            )}
            <div className="flex items-center justify-between mb-1">
              <div
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: meta.color }}
              >
                {headerLabel}
              </div>
              <div className="text-[10px] opacity-60" style={{ color: "white" }}>
                tap to close
              </div>
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: "white" }}>
              সেলিম বললো:
            </div>
            <div
              className="text-base italic mb-2"
              style={{ color: meta.color, lineHeight: 1.4 }}
            >
              "{showUnlock ? unlockDialogue : meta.line}"
            </div>
            <div className="text-[11px] opacity-80" style={{ color: "#e5e7eb" }}>
              {meta.vibe}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
