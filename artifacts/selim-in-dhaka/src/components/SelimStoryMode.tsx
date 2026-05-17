// SelimStoryMode.tsx — "Selim's Story" mode screen.
// Shows all 19 chapters as a chaptered gallery. Unlocked chapters can be
// re-read. After all 19 unlock, an auto-play cinematic option appears.

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SELIM_MOMENTS, type SelimMoment } from "../game/moments";
import {
  getSeenMomentIds, getMomentUnlockDay, isMomentSeen, TOTAL_MOMENTS,
} from "../game/storyProgress";
import { SELIM_ASSETS } from "../game/assets";
import StoryBeatModal from "./StoryBeatModal";
import { toBn } from "../lib/utils";

interface SelimStoryModeProps {
  onClose: () => void;
  reducedMotion?: boolean;
  isSoundEnabled?: boolean;
}

type View = "chapters" | "reader" | "cinematic";

export default function SelimStoryMode({ onClose, reducedMotion = false, isSoundEnabled = true }: SelimStoryModeProps) {
  const [view, setView] = useState<View>("chapters");
  const [activeMoment, setActiveMoment] = useState<SelimMoment | null>(null);
  const [replayMoment, setReplayMoment] = useState<SelimMoment | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => getSeenMomentIds());
  const [cinematicIdx, setCinematicIdx] = useState(0);
  const [cinematicPlaying, setCinematicPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unlockedCount = seenIds.size;
  const allUnlocked = unlockedCount >= TOTAL_MOMENTS;

  // Refresh seen IDs on mount
  useEffect(() => {
    setSeenIds(getSeenMomentIds());
  }, []);

  // Auto-advance cinematic
  useEffect(() => {
    if (view !== "cinematic" || !cinematicPlaying) return;
    timerRef.current = setTimeout(() => {
      const unlockedMoments = SELIM_MOMENTS.filter((m) => isMomentSeen(m.id));
      if (cinematicIdx < unlockedMoments.length - 1) {
        setCinematicIdx((i) => i + 1);
      } else {
        setCinematicPlaying(false);
      }
    }, 4500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [view, cinematicPlaying, cinematicIdx]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (view !== "chapters") setView("chapters"); else onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, onClose]);

  const startCinematic = () => {
    setCinematicIdx(0);
    setCinematicPlaying(true);
    setView("cinematic");
  };

  const openChapter = (moment: SelimMoment) => {
    if (!seenIds.has(moment.id)) return;
    setActiveMoment(moment);
    setView("reader");
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: "linear-gradient(180deg,#0d0600 0%,#1a0f05 50%,#2d1a08 100%)" }}
      data-testid="screen-story-mode"
      role="dialog"
      aria-modal="true"
      aria-label="Selim's Story"
    >
      {/* Header */}
      <div
        className="px-4 pt-safe pt-3 pb-3 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,107,0,0.25)", backdropFilter: "blur(6px)" }}
      >
        <button
          onClick={() => { if (view !== "chapters") setView("chapters"); else onClose(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "rgba(255,255,255,0.1)", color: "#FFB347", fontSize: 18 }}
          aria-label="Back"
        >
          ←
        </button>
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}>
            {view === "chapters" ? "Selim-এর গল্প" : view === "reader" ? activeMoment?.titleBangla : "Selim's Life So Far"}
          </p>
          <p className="text-[10px]" style={{ color: "#FFB347" }}>
            {unlockedCount}/{TOTAL_MOMENTS} chapters unlocked
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform text-base"
          style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === "chapters" && (
          <motion.div
            key="chapters"
            initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
            animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, x: 20 }}
            className="flex-1 overflow-y-auto"
          >
            {/* Progress bar */}
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px]" style={{ color: "#FFB347" }}>Story Progress</span>
                <span className="text-[10px] font-bold" style={{ color: "#FFD700" }}>
                  {Math.round((unlockedCount / TOTAL_MOMENTS) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#FF6B00,#FFD700)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / TOTAL_MOMENTS) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* All-chapters cinematic button */}
            {allUnlocked && (
              <div className="px-4 pt-2 pb-1">
                <button
                  onClick={startCinematic}
                  className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                    color: "#fff",
                    fontFamily: "'Hind Siliguri', sans-serif",
                    border: "1px solid rgba(255,215,0,0.25)",
                  }}
                >
                  🎬 Selim's Life So Far — সব দেখো
                </button>
              </div>
            )}

            {/* Chapter list */}
            <div className="px-4 pt-2 pb-6 space-y-2">
              {SELIM_MOMENTS.map((moment) => {
                const unlocked = seenIds.has(moment.id);
                const unlockDay = getMomentUnlockDay(moment.id);
                const img = SELIM_ASSETS[moment.sceneKey];
                return (
                  <motion.button
                    key={moment.id}
                    data-testid={`chapter-${moment.chapter}`}
                    onClick={() => openChapter(moment)}
                    disabled={!unlocked}
                    className="w-full text-left rounded-2xl overflow-hidden active:scale-98 transition-all disabled:cursor-default"
                    style={{
                      background: unlocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${unlocked ? "rgba(255,107,0,0.35)" : "rgba(255,255,255,0.08)"}`,
                      opacity: unlocked ? 1 : 0.6,
                    }}
                    initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
                    animate={reducedMotion ? {} : { opacity: unlocked ? 1 : 0.6, y: 0 }}
                    transition={{ delay: moment.chapter * 0.02 }}
                  >
                    <div className="flex items-stretch">
                      {/* Thumbnail */}
                      <div
                        className="w-20 flex-shrink-0 relative overflow-hidden"
                        style={{ minHeight: 72 }}
                      >
                        {unlocked && img ? (
                          <img
                            src={img}
                            alt={moment.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <span className="text-2xl">{unlocked ? "📸" : "🔒"}</span>
                          </div>
                        )}
                        {/* Chapter number badge */}
                        <div
                          className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background: unlocked ? "#FF6B00" : "rgba(0,0,0,0.6)", color: "#fff" }}
                        >
                          {moment.chapter}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 px-3 py-2 min-w-0">
                        <div
                          className="font-bold text-sm leading-tight"
                          style={{
                            color: unlocked ? "#FFD700" : "rgba(255,255,255,0.4)",
                            fontFamily: "'Hind Siliguri', sans-serif",
                          }}
                        >
                          {unlocked ? moment.titleBangla : `চ্যাপ্টার ${toBn(moment.chapter)}`}
                        </div>
                        {unlocked ? (
                          <>
                            <div
                              className="text-[10px] mt-0.5 leading-tight"
                              style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Hind Siliguri', sans-serif" }}
                            >
                              {moment.captionBangla}
                            </div>
                            {unlockDay && (
                              <div className="text-[9px] mt-1" style={{ color: "#FFB347" }}>
                                Unlocked Day {unlockDay}
                              </div>
                            )}
                            <div
                              className="text-[9px] mt-0.5 italic"
                              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Hind Siliguri', sans-serif" }}
                            >
                              "{moment.lessonBangla.slice(0, 55)}{moment.lessonBangla.length > 55 ? "…" : ""}"
                            </div>
                          </>
                        ) : (
                          <div
                            className="text-[10px] mt-1 italic"
                            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Hind Siliguri', sans-serif" }}
                          >
                            Day {moment.triggerDay}-এ unlock হবে — খেলতে থাকো
                          </div>
                        )}
                      </div>

                      {/* Replay + Arrow */}
                      {unlocked && (
                        <div className="flex flex-col items-stretch justify-center gap-1 pr-2 py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplayMoment(moment);
                            }}
                            className="px-2 py-1 rounded-full text-[10px] font-bold active:scale-90 transition-transform whitespace-nowrap"
                            style={{
                              background: "rgba(168,85,247,0.18)",
                              border: "1px solid rgba(168,85,247,0.5)",
                              color: "#c084fc",
                              fontFamily: "'Hind Siliguri', sans-serif",
                            }}
                            data-testid={`replay-${moment.chapter}`}
                            aria-label={`Replay chapter ${moment.chapter}`}
                          >
                            ▶ Replay
                          </button>
                          <span className="text-center text-base" style={{ color: "#FFB347" }}>›</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === "reader" && activeMoment && (
          <ChapterReader
            key={activeMoment.id}
            moment={activeMoment}
            reducedMotion={reducedMotion}
            onBack={() => setView("chapters")}
          />
        )}

        {replayMoment && (
          <StoryBeatModal
            key={`replay-${replayMoment.id}`}
            moment={replayMoment}
            day={getMomentUnlockDay(replayMoment.id) ?? 1}
            reducedMotion={reducedMotion}
            isSoundEnabled={isSoundEnabled}
            replayMode
            onDone={() => setReplayMoment(null)}
          />
        )}

        {view === "cinematic" && (
          <CinematicPlayer
            key="cinematic"
            currentIdx={cinematicIdx}
            playing={cinematicPlaying}
            reducedMotion={reducedMotion}
            onTogglePlay={() => setCinematicPlaying((p) => !p)}
            onNext={() => {
              const total = SELIM_MOMENTS.filter((m) => isMomentSeen(m.id)).length;
              if (cinematicIdx < total - 1) setCinematicIdx((i) => i + 1);
            }}
            onPrev={() => { if (cinematicIdx > 0) setCinematicIdx((i) => i - 1); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Chapter Reader ─────────────────────────────────────────────────────────

function ChapterReader({
  moment,
  reducedMotion,
  onBack,
}: {
  moment: SelimMoment;
  reducedMotion: boolean;
  onBack: () => void;
}) {
  const img = SELIM_ASSETS[moment.sceneKey];
  const unlockDay = getMomentUnlockDay(moment.id);
  const narrationLines = moment.narration.split("\n").filter(Boolean);

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, x: 20 }}
      animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
      exit={reducedMotion ? {} : { opacity: 0, x: -20 }}
      className="flex-1 overflow-y-auto"
    >
      {/* Hero image */}
      <div className="relative w-full" style={{ height: 220 }}>
        {img && (
          <img src={img} alt={moment.title} className="w-full h-full object-cover" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(13,6,0,1) 100%)" }}
        />
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className="text-[10px] uppercase tracking-wider font-bold mb-1"
            style={{ color: "#FFB347" }}
          >
            চ্যাপ্টার {toBn(moment.chapter)} · {unlockDay ? `দিন ${toBn(unlockDay)}-এ unlock` : ""}
          </div>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {moment.titleBangla}
          </h2>
          <p className="text-xs mt-0.5 italic" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Hind Siliguri', sans-serif" }}>
            {moment.captionBangla}
          </p>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {/* Backstory */}
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#FFB347" }}>
            📍 এর আগে কী হয়েছিলো
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Hind Siliguri', sans-serif" }}>
            {moment.backstory}
          </p>
        </div>

        {/* Narration */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#FFB347" }}>
            📖 Selim-এর গল্প
          </p>
          {narrationLines.map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: "#FFF8EE", fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Selim quote */}
        <div
          className="rounded-xl p-3 flex items-start gap-2"
          style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.35)" }}
        >
          <div
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "#FF6B00", color: "#fff" }}
          >
            স
          </div>
          <p
            className="text-sm italic flex-1 leading-snug"
            style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            "{moment.selimLine}"
          </p>
        </div>

        {/* Choices */}
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#FFB347" }}>
            ⚖️ Player-এর advice choices
          </p>
          <div className="space-y-2">
            {moment.choices.map((choice, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="font-semibold text-sm" style={{ color: "#FFF8EE", fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {choice.label}
                </div>
                {choice.sublabel && (
                  <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {choice.sublabel}
                  </div>
                )}
                <p
                  className="text-xs mt-1.5 italic"
                  style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  → "{choice.selimReaction}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson */}
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)" }}
        >
          <p className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#FFD700" }}>
            💡 শিক্ষা
          </p>
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {moment.lessonBangla}
          </p>
          <p
            className="text-xs mt-1 italic"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {moment.lesson}
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
          style={{
            background: "rgba(255,107,0,0.15)",
            border: "1px solid rgba(255,107,0,0.4)",
            color: "#FFB347",
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          ← সব Chapters
        </button>
      </div>
    </motion.div>
  );
}

// ─── Cinematic Player ────────────────────────────────────────────────────────

function CinematicPlayer({
  currentIdx,
  playing,
  reducedMotion,
  onTogglePlay,
  onNext,
  onPrev,
}: {
  currentIdx: number;
  playing: boolean;
  reducedMotion: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const unlockedMoments = SELIM_MOMENTS.filter((m) => isMomentSeen(m.id))
    .sort((a, b) => a.chapter - b.chapter);
  const moment = unlockedMoments[currentIdx];
  if (!moment) return null;
  const img = SELIM_ASSETS[moment.sceneKey];
  const narrationLines = moment.narration.split("\n").filter(Boolean);

  return (
    <motion.div
      key={`cinematic-${currentIdx}`}
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="flex-1 relative flex flex-col"
    >
      {/* Full-bleed photo */}
      <div className="absolute inset-0">
        {img && (
          <motion.img
            key={`img-${currentIdx}`}
            src={img}
            alt={moment.title}
            className="w-full h-full object-cover"
            initial={reducedMotion ? {} : { scale: 1.06, opacity: 0 }}
            animate={reducedMotion ? {} : { scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.2 }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0.7) 100%)" }}
        />
      </div>

      {/* Chapter progress dots */}
      <div className="relative z-10 pt-2 px-4 flex justify-center gap-1 flex-wrap">
        {unlockedMoments.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === currentIdx ? 16 : 5,
              height: 5,
              background: i === currentIdx ? "#FF6B00" : i < currentIdx ? "rgba(255,107,0,0.5)" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {/* Text content */}
      <motion.div
        key={`text-${currentIdx}`}
        initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 flex-1 flex flex-col justify-end px-5 pb-4 space-y-3"
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#FFB347" }}>
            Chapter {moment.chapter}
          </div>
          <h2
            className="text-xl font-bold leading-tight"
            style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {moment.titleBangla}
          </h2>
          <p className="text-xs mt-0.5 italic" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Hind Siliguri', sans-serif" }}>
            {moment.captionBangla}
          </p>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        >
          {narrationLines.slice(0, 3).map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: "#FFF8EE", fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {line}
            </p>
          ))}
          <p
            className="text-xs mt-2 italic"
            style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            "{moment.selimLine}"
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={currentIdx === 0}
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.12)", color: "#FFB347", fontSize: 18 }}
          >
            ‹
          </button>

          <button
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "linear-gradient(135deg,#FF6B00,#FFD700)", color: "#1a0f05", fontSize: 22 }}
          >
            {playing ? "⏸" : "▶"}
          </button>

          <button
            onClick={onNext}
            disabled={currentIdx >= unlockedMoments.length - 1}
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.12)", color: "#FFB347", fontSize: 18 }}
          >
            ›
          </button>
        </div>

        <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
          {currentIdx + 1} / {unlockedMoments.length} · {playing ? "Auto-playing" : "Paused"}
        </p>
      </motion.div>
    </motion.div>
  );
}
