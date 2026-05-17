import { motion, AnimatePresence } from "framer-motion";

// ─── TOUBA TIMER HUD ────────────────────────────────────────────────────────
// The spec's iconic UI: "Love Finished: estimated duration 7 minutes." A small
// floating chip in the top-left that mocks Selim's promise-mode countdown.
// Driven entirely by gs.flags.promiseModeTurnsLeft, which the engine already
// decrements each turn. When it hits 0 the chip vanishes (relapse loading…).

interface TobaTimerHUDProps {
  turnsLeft: number;
  reducedMotion?: boolean;
}

function status(turnsLeft: number): { label: string; color: string; sub: string } {
  if (turnsLeft >= 4) return { label: "❤️‍🩹 Love Finished", color: "#10b981", sub: `relapse in ${turnsLeft} turns` };
  if (turnsLeft >= 2) return { label: "🤝 Touba Active", color: "#facc15", sub: `promise unstable · ${turnsLeft} turns` };
  return { label: "⚠️ Relapse Loading", color: "#fb7185", sub: "1 turn left · Pinky typing…" };
}

export default function TobaTimerHUD({ turnsLeft, reducedMotion = false }: TobaTimerHUDProps) {
  const visible = turnsLeft > 0;
  const s = status(turnsLeft);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -16, scale: 0.92 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="fixed z-30 rounded-full shadow-lg pointer-events-none"
          style={{
            top: 64,
            left: 12,
            background: "linear-gradient(180deg, #0d1a14 0%, #050a07 100%)",
            border: `1px solid ${s.color}66`,
            padding: "5px 11px",
          }}
          role="status"
          aria-live="polite"
          aria-label={`Touba timer: ${s.label}, ${s.sub}`}
        >
          <div className="flex items-center gap-2">
            <motion.span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: s.color }}
              animate={reducedMotion ? {} : { opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              aria-hidden
            />
            <div className="flex flex-col leading-tight">
              <span
                className="text-[10px] font-bold tracking-wide"
                style={{ color: s.color, fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                {s.label}
              </span>
              <span className="text-[8.5px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                {s.sub}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
