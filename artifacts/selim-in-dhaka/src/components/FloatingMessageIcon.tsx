import { motion, AnimatePresence } from "framer-motion";
import type { Stats } from "../types";

export type FabState =
  | { kind: "normal" }
  | { kind: "wants_to_talk"; count: number }
  | { kind: "girl_busy" }
  | { kind: "heartbroken" }
  | { kind: "secret_available" }
  | { kind: "fake_id_risk" };

interface Props {
  state: FabState;
  onClick: () => void;
  reducedMotion?: boolean;
  hidden?: boolean;
}

export function deriveFabState(stats: Stats, opts: {
  unreadCount?: number;
  hasUnseenSecret?: boolean;
  fakeIdRisk?: boolean;
}): FabState {
  if (opts.unreadCount && opts.unreadCount > 0) {
    return { kind: "wants_to_talk", count: opts.unreadCount };
  }
  if (opts.fakeIdRisk) return { kind: "fake_id_risk" };
  if (opts.hasUnseenSecret) return { kind: "secret_available" };
  if (stats.mood < 25) return { kind: "heartbroken" };
  if (stats.pinkyHope > 75 || stats.romanticFever > 65) return { kind: "girl_busy" };
  return { kind: "normal" };
}

function colorFor(state: FabState): { bg: string; ring: string; pulse: boolean } {
  switch (state.kind) {
    case "wants_to_talk":
      return { bg: "linear-gradient(135deg,#FF6B00,#FF8F00)", ring: "rgba(255,143,0,0.45)", pulse: true };
    case "girl_busy":
      return { bg: "linear-gradient(135deg,#ec4899,#a855f7)", ring: "rgba(236,72,153,0.55)", pulse: false };
    case "heartbroken":
      return { bg: "linear-gradient(135deg,#3b82f6,#1e40af)", ring: "rgba(59,130,246,0.45)", pulse: false };
    case "secret_available":
      return { bg: "linear-gradient(135deg,#7c3aed,#ec4899)", ring: "rgba(124,58,237,0.55)", pulse: true };
    case "fake_id_risk":
      return { bg: "linear-gradient(135deg,#dc2626,#f59e0b)", ring: "rgba(220,38,38,0.55)", pulse: true };
    default:
      return { bg: "linear-gradient(135deg,#FF6B00,#FF8F00)", ring: "rgba(255,107,0,0.35)", pulse: false };
  }
}

function badgeFor(state: FabState): { label: string; color: string } | null {
  switch (state.kind) {
    case "wants_to_talk":
      return { label: state.count > 9 ? "9+" : String(state.count), color: "#ef4444" };
    case "girl_busy":
      return { label: "busy", color: "#ec4899" };
    case "heartbroken":
      return { label: "💔", color: "#1e40af" };
    case "secret_available":
      return { label: "🔓", color: "#7c3aed" };
    case "fake_id_risk":
      return { label: "⚠️", color: "#dc2626" };
    default:
      return null;
  }
}

export default function FloatingMessageIcon({ state, onClick, reducedMotion, hidden }: Props) {
  const colors = colorFor(state);
  const badge = badgeFor(state);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          key="fab"
          data-testid="fab-talk-to-selim"
          onClick={onClick}
          aria-label="Open chat with Selim"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 20 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 20 }}
          whileTap={{ scale: 0.9 }}
          className="fixed z-40 rounded-full flex items-center justify-center"
          style={{
            right: "calc(1rem + env(safe-area-inset-right))",
            bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
            width: 60,
            height: 60,
            background: colors.bg,
            boxShadow: `0 10px 30px ${colors.ring}, 0 0 0 0 ${colors.ring}`,
            border: "2px solid rgba(255,255,255,0.18)",
            color: "white",
            cursor: "pointer",
          }}
        >
          {!reducedMotion && colors.pulse && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: colors.bg, opacity: 0.5 }}
              animate={{ scale: [1, 1.45, 1.45], opacity: [0.5, 0, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <span style={{ fontSize: 26, position: "relative" }}>💬</span>
          {badge && (
            <span
              className="absolute -top-1 -right-1 rounded-full font-bold flex items-center justify-center"
              style={{
                minWidth: 22,
                height: 22,
                padding: "0 6px",
                background: badge.color,
                color: "white",
                fontSize: badge.label.length > 2 ? 10 : 11,
                border: "2px solid rgba(0,0,0,0.35)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
              }}
            >
              {badge.label}
            </span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
