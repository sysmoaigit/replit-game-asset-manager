import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EasterEgg } from "../game/easterEggs";

/**
 * Global celebratory toast that fires when a hidden easter egg unlocks.
 * Call sites use {@link notifyEggUnlock} to push a freshly-unlocked egg
 * onto the queue; the mounted <EggUnlockToast/> displays them one at a
 * time so simultaneous unlocks (e.g. day-end stat checks) don't overlap.
 */

type Listener = (egg: EasterEgg) => void;
const listeners = new Set<Listener>();

/** Programmatic API: pass the result of tryUnlockEgg directly.
 *  Null/undefined is a no-op so callers can write
 *  `notifyEggUnlock(tryUnlockEgg("foo"))` without a guard. */
export function notifyEggUnlock(egg: EasterEgg | null | undefined): void {
  if (!egg) return;
  listeners.forEach((fn) => {
    try { fn(egg); } catch { /* ignore */ }
  });
}

const RARITY_STYLE: Record<EasterEgg["rarity"], { accent: string; label: string; glow: string }> = {
  common: {
    accent: "#FFB347",
    label: "Common Egg",
    glow: "0 8px 24px rgba(255,179,71,0.35)",
  },
  rare: {
    accent: "#7CC8FF",
    label: "Rare Egg",
    glow: "0 8px 28px rgba(124,200,255,0.45)",
  },
  legendary: {
    accent: "#FFD700",
    label: "Legendary Egg",
    glow: "0 10px 32px rgba(255,215,0,0.55)",
  },
};

const SPARKLES = [
  { x: -28, y: -10, delay: 0.05 },
  { x: 32, y: -14, delay: 0.18 },
  { x: -18, y: 24, delay: 0.30 },
  { x: 24, y: 22, delay: 0.42 },
];

interface Props { reducedMotion?: boolean }

export default function EggUnlockToast({ reducedMotion = false }: Props) {
  const [queue, setQueue] = useState<EasterEgg[]>([]);
  const active = queue[0] ?? null;

  // Subscribe once to the module-level pub/sub.
  useEffect(() => {
    const fn: Listener = (egg) => {
      setQueue((q) => (q.some((e) => e.id === egg.id) ? q : [...q, egg]));
    };
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  // Auto-advance the queue.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 3800);
    return () => clearTimeout(t);
  }, [active?.id]);

  if (!active) return null;
  const style = RARITY_STYLE[active.rarity];

  return (
    <AnimatePresence>
      <motion.div
        key={active.id}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.85 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
        transition={
          reducedMotion
            ? { duration: 0.18 }
            : { type: "spring", stiffness: 320, damping: 20 }
        }
        className="fixed left-1/2 -translate-x-1/2 z-[95] flex items-start gap-3 px-3.5 py-2.5 rounded-2xl"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 14px)",
          background: "linear-gradient(135deg, rgba(20,8,2,0.97), rgba(45,26,8,0.97))",
          border: `1px solid ${style.accent}66`,
          boxShadow: style.glow,
          maxWidth: "92vw",
        }}
        data-testid="egg-unlock-toast"
        role="status"
        aria-live="polite"
      >
        {/* Egg icon with sticker bounce + sparkles */}
        <div className="relative flex-shrink-0" style={{ width: 42, height: 42 }}>
          <motion.div
            initial={reducedMotion ? {} : { rotate: -10, scale: 0.6 }}
            animate={
              reducedMotion
                ? {}
                : { rotate: [-10, 8, -4, 0], scale: [0.6, 1.15, 0.95, 1] }
            }
            transition={reducedMotion ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
            className="w-full h-full flex items-center justify-center rounded-xl text-[26px]"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${style.accent}33, transparent 70%)`,
              border: `1px solid ${style.accent}55`,
            }}
            aria-hidden
          >
            🥚
          </motion.div>
          {!reducedMotion && SPARKLES.map((s, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0.4, 1, 0.6] }}
              transition={{ duration: 1.1, delay: s.delay, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] pointer-events-none"
              style={{ color: style.accent }}
              aria-hidden
            >
              ✦
            </motion.span>
          ))}
        </div>

        {/* Text body */}
        <div className="min-w-0" style={{ maxWidth: "70vw" }}>
          <div
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: style.accent }}
          >
            ✨ Easter Egg Unlocked · {style.label}
          </div>
          <div
            className="text-sm font-bold leading-tight mt-0.5"
            style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {active.name}
          </div>
          <div
            className="text-[12px] leading-snug mt-0.5"
            style={{ color: "#f4e4c1", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {active.reveal}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
