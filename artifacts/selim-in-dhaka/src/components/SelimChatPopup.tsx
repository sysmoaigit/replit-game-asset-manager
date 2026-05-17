import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Stats, Flags } from "../types";

// ─── SELIM CHAT POPUP ───────────────────────────────────────────────────────
// Selim proactively messages the player from the corner, like a real friend
// pinging you on WhatsApp. Lines are picked from his current state. For the
// extra-emotional moods (girl_busy, heartbreak, pre_relapse) he sends a
// follow-up message a couple seconds later — that double-message rhythm is
// what makes a friend feel alive. Includes a real "typing..." indicator
// before each line lands.

export type CheckInMood = "normal" | "girl_busy" | "pre_relapse" | "heartbreak" | "touba" | "best_friend";

type CheckInBucket = {
  mood: CheckInMood;
  // First line is the opener; second line (if present) is the follow-up that
  // arrives ~2.5s later. We pick the pair deterministically per day.
  threads: Array<[string] | [string, string]>;
};

const CHECKINS: CheckInBucket[] = [
  {
    mood: "normal",
    threads: [
      ["Bhai, tui kemon achos? 🙂"],
      ["Kalke tor mood off lagchilo. Thik achos?"],
      ["Tor kaj kemon cholse? Bol bhai."],
      ["Tui amar jonno eto chinta koros, ami appreciate kori. ❤️"],
      ["Bhai, ekta cha khabi? Mama'r dokane?", "Ami ashtechi, tui ber ho."],
    ],
  },
  {
    mood: "girl_busy",
    threads: [
      ["Pore bol? Ektu busy. 📱", "Sorry bhai, ekta urgent matter."],
      ["Bhai, network issue. Kalke kotha bolbo."],
      ["Actually ekta urgent case, free hoye reply dibo.", "Tui rag korish na bhai."],
      ["Pinky'r message ase, ektu pore message dibo bhai."],
      ["Mental pressure jache, ektu space lagbe."],
    ],
  },
  {
    mood: "pre_relapse",
    threads: [
      ["Bhai, ami abar bhul korte jaitesi. Online achos? 😬", "Stop kor amake, ami nijeke parchi na."],
      ["Dost, ekta meye message dise. Amar brain suspiciously happy.", "Tor opinion lagbe."],
      ["Bhai, ei meyeta different mone hocche...", "...naki ami abar pagol?"],
      ["Tor kotha mone porlo. But ekbar try kori?"],
    ],
  },
  {
    mood: "heartbreak",
    threads: [
      ["Bhai... ektu time ase tor? Mood off. 💔", "Ami rooftop e boshe achi."],
      ["Pinky 2 din pore reply dilo: 'thanks friend.'", "Ar parchi na bhai."],
      ["Akashe taka kortesi. Bhalo lagche na."],
      ["Bhai, tui chere jash nai ami janar age. Eita mone thake. 🥲"],
      ["Ar kono meye na bhai. Career first.", "(eibar real, promise)"],
    ],
  },
  {
    mood: "touba",
    threads: [
      ["Notun Selim shuru. Ar recharge na. Promise. 🤝"],
      ["Phone wallpaper change korlam: 'Career First'.", "(heart emoji ta accidental, ignore kor)"],
      ["Pinky chat archive korlam.", "Restore button hide korte parchi na, but progress."],
      ["Bhai, gym join korbo bhabchi. Kalke theke. (or porshu)"],
      ["Self-respect install hoitese... 12% complete. ⏳"],
    ],
  },
  {
    mood: "best_friend",
    threads: [
      ["Bhai, tui na thakle ami onek age fail korte. ❤️"],
      ["Tor moto friend pawa luck er bepar. Sotti.", "Ekta cha amar tarof theke pending."],
      ["Pinky reply na dileo tui reply dish. Eita amar mone thake."],
      ["Bhai, eki shahor e na thakleo amar matha tor kache. 🤜🤛"],
      ["Tor advice ami ignore kori, but mone rakhi. Promise."],
    ],
  },
];

function pickMood(stats: Stats, flags: Flags): CheckInMood {
  if (flags.heartbreakCount >= 1 && stats.mood < 35) return "heartbreak";
  if (flags.promisesKept >= 1 && stats.selfRespect >= 50 && stats.romanticFever < 40) return "touba";
  if (stats.friendTrust >= 75) return "best_friend";
  if (stats.romanticFever >= 65) return "girl_busy";
  if (flags.promisesMade >= 1 && stats.romanticFever >= 50 && stats.selfRespect < 55) return "pre_relapse";
  return "normal";
}

function pickThread(mood: CheckInMood, seed: number): [string] | [string, string] {
  const bucket = CHECKINS.find((c) => c.mood === mood) ?? CHECKINS[0];
  return bucket.threads[seed % bucket.threads.length];
}

const MOOD_META: Record<CheckInMood, { label: string; color: string }> = {
  normal: { label: "Selim", color: "#FF8F00" },
  girl_busy: { label: "Selim · busy 📱", color: "#ec4899" },
  pre_relapse: { label: "Selim · sus 😬", color: "#facc15" },
  heartbreak: { label: "Selim · 💔", color: "#60a5fa" },
  touba: { label: "Selim · touba 🤝", color: "#10b981" },
  best_friend: { label: "Selim · bhai ❤️", color: "#a855f7" },
};

interface SelimChatPopupProps {
  stats: Stats;
  flags: Flags;
  day: number;
  reducedMotion?: boolean;
}

type Bubble = { text: string; key: number };

export default function SelimChatPopup({ stats, flags, day, reducedMotion = false }: SelimChatPopupProps) {
  const [visible, setVisible] = useState(false);
  const [mood, setMood] = useState<CheckInMood>("normal");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const timersRef = useRef<number[]>([]);
  // Last seen heartbreak count — fires an immediate post-heartbreak ping.
  const lastHeartbreakRef = useRef<number>(flags.heartbreakCount);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const fireCheckIn = (forcedMood?: CheckInMood, seed?: number) => {
    clearTimers();
    const m = forcedMood ?? pickMood(stats, flags);
    const thread = pickThread(m, seed ?? day);
    setMood(m);
    setBubbles([]);
    setTyping(false);

    // 1.2s delay → typing indicator → first bubble at 2.4s
    timersRef.current.push(
      window.setTimeout(() => setTyping(true), 1200) as unknown as number,
      window.setTimeout(() => {
        setTyping(false);
        setBubbles([{ text: thread[0], key: Date.now() }]);
        setVisible(true);
      }, 2400) as unknown as number,
    );

    // Optional follow-up message after the first lands.
    if (thread.length === 2) {
      timersRef.current.push(
        window.setTimeout(() => setTyping(true), 3600) as unknown as number,
        window.setTimeout(() => {
          setTyping(false);
          setBubbles((prev) => [...prev, { text: thread[1] as string, key: Date.now() + 1 }]);
        }, 4800) as unknown as number,
      );
    }

    // Auto-dismiss — longer for two-message threads.
    const dismissAt = thread.length === 2 ? 11500 : 9400;
    timersRef.current.push(
      window.setTimeout(() => setVisible(false), dismissAt) as unknown as number,
    );
  };

  // Day-change ping (skip day 1 so we don't pile onto onboarding).
  useEffect(() => {
    if (day < 2) return;
    fireCheckIn();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  // Reactive ping on heartbreak — fire an immediate sad message regardless of day.
  useEffect(() => {
    if (flags.heartbreakCount > lastHeartbreakRef.current) {
      lastHeartbreakRef.current = flags.heartbreakCount;
      // Use heartbreakCount as seed so each new break picks a different line.
      fireCheckIn("heartbreak", flags.heartbreakCount + day);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags.heartbreakCount]);

  useEffect(() => clearTimers, []);

  const meta = MOOD_META[mood];

  return (
    <AnimatePresence>
      {visible && (bubbles.length > 0 || typing) && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.92 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="fixed z-40 max-w-[290px] rounded-2xl shadow-2xl"
          style={{
            bottom: 96,
            right: 16,
            background: "linear-gradient(180deg, #1a0d22 0%, #0a0510 100%)",
            border: `1px solid ${meta.color}55`,
            padding: "10px 12px",
          }}
          role="status"
          aria-live="polite"
          onClick={() => setVisible(false)}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: meta.color, color: "#0a0510" }}
            >
              S
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: meta.color }}>
                {meta.label}
              </div>
              <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                {typing ? "typing..." : "online · just now"}
              </div>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
              }}
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {bubbles.map((b) => (
              <motion.p
                key={b.key}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="text-[13px] leading-snug"
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                {b.text}
              </motion.p>
            ))}
            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full self-start"
                style={{ background: "rgba(255,255,255,0.06)" }}
                aria-hidden
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: meta.color }}
                    animate={reducedMotion ? {} : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
