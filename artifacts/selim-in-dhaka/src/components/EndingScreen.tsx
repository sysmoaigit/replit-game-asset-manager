import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Stats, Flags } from "../types";
import { ENDINGS, GOOD_ENDING_IDS } from "../game/endings";
import SelimAvatar from "./SelimAvatar";
import { toBn } from "../lib/utils";
import SceneArt from "./SceneArt";
import { getSceneImageForEnding } from "../game/assets";
import Icon, { IconName } from "./ui/Icon";

interface EndingScreenProps {
  endingId: string;
  stats: Stats;
  flags: Flags;
  onRestart: () => void;
  onMainMenu: () => void;
  onFreeMode?: () => void;
  onShare?: () => void;
  onShowRecap?: () => void;
  onNewGamePlus?: () => void;
  reducedMotion?: boolean;
  isDailyChallenge?: boolean;
  dailyBestScore?: number;
  dailyScore?: number;
}

function Confetti({ count = 40 }: { count?: number }) {
  const colors = ["#FF6B00", "#FFD700", "#FF3333", "#33FF57", "#3399FF", "#FF33FF"];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{ left: `${(i * 37 + 5) % 100}%`, top: "-8px", background: colors[i % colors.length] }}
          animate={{ y: ["0vh", "110vh"], x: [`${((i * 17) % 100) - 50}px`], rotate: [0, 720], opacity: [1, 1, 0] }}
          transition={{ duration: 2 + (i % 10) * 0.2, delay: (i % 15) * 0.1, ease: "linear" }}
        />
      ))}
    </div>
  );
}

export default function EndingScreen({
  endingId, stats, flags, onRestart, onMainMenu, onFreeMode, onShare, onShowRecap, onNewGamePlus,
  reducedMotion = false, isDailyChallenge = false, dailyBestScore, dailyScore,
}: EndingScreenProps) {
  const ending = ENDINGS.find((e) => e.id === endingId) ?? ENDINGS[ENDINGS.length - 1];
  const isGoodEnding = GOOD_ENDING_IDS.has(endingId);
  const isBestEnding = endingId === "smart_survivor" || endingId === "bogura_boss";
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (reducedMotion || !isGoodEnding) return;
    try {
      const ctx = new AudioContext();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch { /* ignore */ }
    return () => { audioRef.current?.close(); };
  }, [isGoodEnding, reducedMotion]);

  return (
    <div
      className="min-h-full w-full flex flex-col items-center relative overflow-y-auto"
      style={{
        minHeight: "100dvh",
        background: isGoodEnding ? "linear-gradient(180deg, #1a0f05 0%, #2d1a08 100%)" : "linear-gradient(180deg, #0a0a0a 0%, #1a0505 100%)",
      }}
      data-testid="screen-ending"
    >
      {!reducedMotion && isGoodEnding && <Confetti count={isBestEnding ? 60 : 30} />}

      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <SceneArt
          sceneKey={getSceneImageForEnding(endingId)}
          overlay={isGoodEnding ? "boss" : "silent"}
          height="100%"
          rounded={false}
          priority
          reducedMotion={reducedMotion}
          position="center 25%"
          trackUnlock
        />
      </div>

      <div className="relative z-10 w-full max-w-sm px-5 pt-8 pb-8 flex flex-col items-center gap-4">
        {/* Title */}
        <motion.div
          initial={reducedMotion ? {} : { scale: 0.5, opacity: 0 }}
          animate={reducedMotion ? {} : { scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center"
        >
          <h1
            className="text-xl font-bold"
            style={{
              background: isGoodEnding ? "linear-gradient(90deg, #FFD700, #FF6B00)" : "linear-gradient(90deg, #888, #aaa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            {ending.name}
          </h1>
        </motion.div>

        {/* Avatar */}
        <SelimAvatar stats={stats} size="md" reducedMotion={reducedMotion} />

        {/* Ending story */}
        <motion.div
          initial={reducedMotion ? {} : { y: 20, opacity: 0 }}
          animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-4 w-full text-center"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {ending.messageBangla}
          </p>
        </motion.div>

        {/* Why you got this */}
        <motion.div
          initial={reducedMotion ? {} : { y: 20, opacity: 0 }}
          animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="rounded-xl px-4 py-3 w-full"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)" }}
        >
          <p className="text-[10px] font-bold mb-1" style={{ color: "#FFB347" }}>
            🔍 কেন এই ending পেলে?
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "#ccaa77", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {ending.whyBangla}
          </p>
        </motion.div>

        {/* Final stats */}
        <div className="w-full rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-xs font-bold text-center mb-2" style={{ color: "#FFB347" }}>
            চূড়ান্ত Stats
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {([
              ["heart", "Health", stats.health, "#ef4444"],
              ["smile", "Mood", stats.mood, "#eab308"],
              ["brain", "IQ", stats.iq, "#3b82f6"],
              ["bolt", "Energy", stats.energy, "#06b6d4"],
              ["star", "Rep", stats.reputation, "#a855f7"],
              ["smoke", "Addiction", stats.addiction, "#6b7280"],
              ["shield", "Self-Respect", stats.selfRespect, "#10b981"],
              ["briefcase", "Career", stats.careerProgress, "#8b5cf6"],
              ["handshake", "Friend Trust", stats.friendTrust, "#22c55e"],
              ["pinky", "Pinky Hope", stats.pinkyHope, "#ec4899"],
            ] as Array<[IconName, string, number, string]>).map(([icon, label, val, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon name={icon} size={14} style={{ color }} title={label} />
                <span className="text-xs" style={{ color: "#aaa" }}>{label}</span>
                <span className="text-xs font-bold ml-auto" style={{ color: "#FFD700" }}>
                  {Math.round(val)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white border-opacity-10 flex items-center gap-1.5">
            <Icon name="money" size={14} style={{ color: stats.money >= 0 ? "#22c55e" : "#ef4444" }} title="Money" />
            <span className="text-xs" style={{ color: "#aaa" }}>Money</span>
            <span
              className="text-xs font-bold ml-auto"
              style={{ color: stats.money >= 0 ? "#22c55e" : "#ef4444" }}
            >
              ৳{toBn(stats.money.toLocaleString("en-US"))}
            </span>
          </div>
        </div>

        {/* Flags summary */}
        <div className="w-full text-xs text-center leading-relaxed" style={{ color: "#888" }}>
          বিরিয়ানি: {toBn(flags.biryaniCount)}x | মায়ের ফোন: {toBn(flags.motherCallsAnswered)}x |
          কাজ: {toBn(flags.workCount)}x | প্রতিশ্রুতি ভেঙেছে: {toBn(flags.brokenPromiseCount)}x
        </div>

        {/* Daily challenge result */}
        {isDailyChallenge && typeof dailyScore === "number" && (
          <div
            className="w-full rounded-xl px-4 py-2 text-center"
            style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,215,0,0.3)" }}
            data-testid="daily-result"
          >
            <p className="text-[10px]" style={{ color: "#FFB347" }}>আজকের Daily Challenge</p>
            <p className="text-sm font-bold" style={{ color: "#FFD700" }}>
              Score: {dailyScore}
              {typeof dailyBestScore === "number" && dailyBestScore >= dailyScore && (
                <span className="text-[10px] ml-2" style={{ color: "#22c55e" }}>
                  Best: {dailyBestScore}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="w-full space-y-2">
          {onShare && (
            <button
              data-testid="btn-share"
              onClick={onShare}
              className="dhaka-btn-primary"
            >
              📤 Share Card বানাও
            </button>
          )}

          {onShowRecap && (
            <button
              data-testid="btn-friendship-recap"
              onClick={onShowRecap}
              className="dhaka-btn-secondary"
            >
              💛 Friendship Recap দেখো
            </button>
          )}

          <button
            data-testid="btn-restart"
            onClick={onRestart}
            className="dhaka-btn-secondary"
          >
            আবার খেলি! 🔄
          </button>

          {onNewGamePlus && (
            <button
              data-testid="btn-new-game-plus"
              onClick={onNewGamePlus}
              className="dhaka-btn-secondary"
            >
              ⭐ New Game+ (album/eggs রাখো)
            </button>
          )}

          {onFreeMode && (
            <button
              data-testid="btn-free-mode"
              onClick={onFreeMode}
              className="dhaka-btn-ghost"
            >
              Free Mode-এ চালিয়ে যাও 🌟
            </button>
          )}

          <button
            data-testid="btn-main-menu"
            onClick={onMainMenu}
            className="dhaka-btn-ghost"
          >
            মেইন মেনু
          </button>
        </div>
      </div>
    </div>
  );
}
