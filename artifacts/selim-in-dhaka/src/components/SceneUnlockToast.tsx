import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SELIM_ASSETS, type SceneKey } from "../game/assets";

const STORAGE_KEY = "selim_dhaka_scene_unlocks_v1";

function loadUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function saveUnlocked(set: Set<string>): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set))); } catch { /* ignore */ }
}

const TITLES: Partial<Record<SceneKey, string>> = {
  eatingBiryani: "Biryani Temptation",
  friendsCrushTeaStall: "Cha Stall Crush Alert",
  dreamingPinkyRooftop: "Pinky Rooftop Dream",
  busDaydreamCrush: "First Love Again",
  brokeRentProblem: "Rent Crisis",
  campusDramaSlap: "Boundary Lesson",
  girlHappyHelp: "Kindness Moment",
  askingMoneyFriend: "Emotional Loan",
  workHustleMontage: "Career Hustle",
  lifeChaosDashboard: "Full Life Chaos",
};

type Listener = (key: SceneKey) => void;
const listeners = new Set<Listener>();

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Programmatic API: call from anywhere to surface a one-shot toast.
 *  Only fires the first time a given scene unlocks per device. */
export function unlockScene(key: SceneKey): void {
  const seen = loadUnlocked();
  if (seen.has(key)) return;
  seen.add(key);
  saveUnlocked(seen);
  listeners.forEach((fn) => { try { fn(key); } catch { /* ignore */ } });
}

interface Props { reducedMotion?: boolean }

export default function SceneUnlockToast({ reducedMotion = false }: Props) {
  const [active, setActive] = useState<SceneKey | null>(null);

  useEffect(() => {
    return subscribe((key) => setActive(key));
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(null), 3200);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={active}
          initial={reducedMotion ? {} : { opacity: 0, y: -16, scale: 0.95 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 px-3 py-2 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(20,8,2,0.96), rgba(45,26,8,0.96))",
            border: "1px solid rgba(255,215,0,0.35)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            maxWidth: "92vw",
          }}
          data-testid="scene-unlock-toast"
        >
          <img
            src={SELIM_ASSETS[active]}
            alt=""
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            style={{ border: "1px solid rgba(255,215,0,0.4)" }}
          />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "#FFB347" }}>
              ✨ Scene Unlocked
            </div>
            <div
              className="text-sm font-bold truncate"
              style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {TITLES[active] ?? active}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
