// StoryBeatModal.tsx — Full-screen cinematic story beat for a Selim Moment.
// Shown the FIRST time each of the 19 photos appears in gameplay.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SELIM_ASSETS } from "../game/assets";
import type { SelimMoment, MomentChoice } from "../game/moments";
import { markMomentSeen, saveMomentChoice } from "../game/storyProgress";
import { speakSelim, stopSelim } from "../lib/selimVoice";
import { audioEngine } from "../game/audioEngine";
import { toBn } from "../lib/utils";

/**
 * Speak a Bangla narration line. Honors the game's master sound toggle
 * (gs.isSoundEnabled) AND the per-channel audio engine settings — if either
 * is off we no-op cleanly. TTS is best-effort and never throws.
 */
function speakIfAllowed(
  text: string,
  isSoundEnabled: boolean,
  opts?: { rate?: number; pitch?: number },
) {
  if (!isSoundEnabled) return;
  try {
    const s = audioEngine.getSettings();
    if (!s.masterEnabled || !s.voiceEnabled) return;
    speakSelim(text, opts);
  } catch {
    /* TTS is best-effort */
  }
}

interface StoryBeatModalProps {
  moment: SelimMoment;
  day: number;
  reducedMotion?: boolean;
  /** Game-level sound toggle (gs.isSoundEnabled). When false, no narration. */
  isSoundEnabled?: boolean;
  /**
   * When true, this is a replay from the Album / Story mode. No stat
   * effects are applied, no progress is written, and any choice can be
   * tapped freely to re-hear Selim's reaction.
   */
  replayMode?: boolean;
  onDone: (choiceIndex: number) => void;
}

type Phase = "narration" | "choice" | "reaction";

export default function StoryBeatModal({
  moment,
  day,
  reducedMotion = false,
  isSoundEnabled = true,
  replayMode = false,
  onDone,
}: StoryBeatModalProps) {
  const [phase, setPhase] = useState<Phase>("narration");
  const [selectedChoice, setSelectedChoice] = useState<MomentChoice | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [narrationPage, setNarrationPage] = useState(0);

  const imageSrc = SELIM_ASSETS[moment.sceneKey];
  const narrationLines = moment.narration.split("\n").filter(Boolean);
  const linesPerPage = 3;
  const totalPages = Math.ceil(narrationLines.length / linesPerPage);
  const currentLines = narrationLines.slice(narrationPage * linesPerPage, narrationPage * linesPerPage + linesPerPage);
  const isLastPage = narrationPage >= totalPages - 1;

  // ── Voice narration ──────────────────────────────────────────────────────
  // Speak the visible narration when the page changes. On the last page we
  // also follow up with Selim's spoken signature line so the cinematic feels
  // alive. Speech is cancelled on every transition (incl. unmount) so we
  // never get overlapping voices.
  useEffect(() => {
    if (phase !== "narration") return;
    const pageLines = narrationLines.slice(
      narrationPage * linesPerPage,
      narrationPage * linesPerPage + linesPerPage,
    );
    const lastPage = narrationPage >= totalPages - 1;
    const pageText = pageLines.join(" ");
    const tail = lastPage && moment.selimLine ? `   ${moment.selimLine}` : "";
    const full = `${pageText}${tail}`.trim();
    if (!isSoundEnabled) {
      stopSelim();
      return;
    }
    if (full) speakIfAllowed(full, isSoundEnabled);
    return () => stopSelim();
  }, [phase, narrationPage, moment.id, totalPages, isSoundEnabled]);

  // Speak Selim's reaction when a choice has been made.
  useEffect(() => {
    if (phase !== "reaction" || !selectedChoice) return;
    if (!isSoundEnabled) {
      stopSelim();
      return;
    }
    speakIfAllowed(selectedChoice.selimReaction, isSoundEnabled, { rate: 0.95 });
    return () => stopSelim();
  }, [phase, selectedChoice, isSoundEnabled]);

  // Always cancel any in-flight speech when the modal unmounts entirely.
  useEffect(() => () => stopSelim(), []);

  const handleNarrationNext = () => {
    if (!isLastPage) {
      setNarrationPage((p) => p + 1);
    } else {
      setPhase("choice");
    }
  };

  const handleChoice = (choice: MomentChoice, idx: number) => {
    setSelectedChoice(choice);
    setSelectedIdx(idx);
    setPhase("reaction");
    // Replay mode: skip side effects entirely (no stat changes,
    // no overwriting saved choice, no marking seen).
    if (!replayMode) {
      markMomentSeen(moment.id, day);
      saveMomentChoice(moment.id, idx);
    }
  };

  const handlePickAgain = () => {
    setSelectedChoice(null);
    setSelectedIdx(-1);
    setPhase("choice");
  };

  const handleContinue = () => {
    onDone(selectedIdx);
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: "#000" }}
      data-testid="story-beat-modal"
    >
      {/* Full bleed photo */}
      <div className="absolute inset-0">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={moment.title}
            className="w-full h-full object-cover"
            style={{ opacity: 0.55 }}
          />
        )}
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.85) 100%)",
          }}
        />
      </div>

      {/* Chapter badge */}
      <div className="relative z-10 pt-safe pt-4 px-4 flex items-center justify-between gap-2">
        <div
          className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase"
          style={{
            background: "rgba(255,107,0,0.85)",
            color: "#fff",
            backdropFilter: "blur(4px)",
          }}
        >
          চ্যাপ্টার {toBn(moment.chapter)} / ১৯
        </div>
        <div className="flex items-center gap-2">
          {replayMode && (
            <div
              className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
              style={{
                background: "rgba(168,85,247,0.85)",
                color: "#fff",
                backdropFilter: "blur(4px)",
              }}
            >
              ▶ Replay
            </div>
          )}
          <div
            className="px-3 py-1 rounded-full text-[10px]"
            style={{
              background: "rgba(0,0,0,0.6)",
              color: "#FFB347",
              backdropFilter: "blur(4px)",
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            {replayMode ? `Day ${day} memory` : `Day ${day}`}
          </div>
          {replayMode && (
            <button
              onClick={() => onDone(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-base"
              style={{ background: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(4px)" }}
              aria-label="Close replay"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-6 px-4">
        <AnimatePresence mode="wait">
          {phase === "narration" && (
            <motion.div
              key={`narration-${narrationPage}`}
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Title */}
              <div>
                <h1
                  className="text-2xl font-bold leading-tight"
                  style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  {moment.titleBangla}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "#FFB347" }}>
                  {moment.title}
                </p>
                <p
                  className="text-xs mt-1 italic"
                  style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  {moment.captionBangla}
                </p>
              </div>

              {/* Narration lines */}
              <div
                className="rounded-2xl p-4 space-y-1.5"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  border: "1px solid rgba(255,107,0,0.3)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {currentLines.map((line, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed"
                    style={{ color: "#FFF8EE", fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* Selim's spoken line (on last page) */}
              {isLastPage && (
                <div
                  className="flex items-start gap-2 rounded-xl p-3"
                  style={{
                    background: "rgba(255,107,0,0.15)",
                    border: "1px solid rgba(255,107,0,0.4)",
                  }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "#FF6B00", color: "#fff" }}
                  >
                    স
                  </div>
                  <p
                    className="text-sm italic leading-snug flex-1"
                    style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    "{moment.selimLine}"
                  </p>
                </div>
              )}

              {/* Page dots */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all"
                      style={{
                        width: i === narrationPage ? 16 : 6,
                        height: 6,
                        background: i === narrationPage ? "#FF6B00" : "rgba(255,255,255,0.3)",
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={handleNarrationNext}
                className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FFD700)",
                  color: "#1a0f05",
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                {isLastPage ? "তোমার advice কী? →" : "আরো পড়ো →"}
              </button>
            </motion.div>
          )}

          {phase === "choice" && (
            <motion.div
              key="choice"
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div>
                <p
                  className="text-xs uppercase tracking-wider font-bold mb-1"
                  style={{ color: "#FFB347" }}
                >
                  ⚖️ তোমার advice কী?
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  {moment.atStake}
                </p>
              </div>

              <div className="space-y-2">
                {moment.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice, idx)}
                    className="w-full text-left rounded-2xl p-3 active:scale-95 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,107,0,0.35)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      className="font-bold text-sm"
                      style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      {choice.label}
                    </div>
                    {choice.sublabel && (
                      <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {choice.sublabel}
                      </div>
                    )}
                    {/* Effect preview */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {Object.entries(choice.effects)
                        .filter(([, v]) => v !== 0)
                        .slice(0, 4)
                        .map(([k, v]) => {
                          const bad = ["emotionalDelusion", "addiction", "temptation"];
                          const good = (v as number) > 0 ? !bad.includes(k) : bad.includes(k);
                          const icons: Record<string, string> = {
                            health: "❤️", mood: "😊", money: "৳", iq: "🧠",
                            energy: "⚡", reputation: "⭐", selfRespect: "🛡️",
                            pinkyHope: "💖", careerProgress: "💼", friendTrust: "🤝",
                            emotionalDelusion: "🌫️", addiction: "🚬",
                          };
                          return (
                            <span
                              key={k}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: good ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                                color: good ? "#4ade80" : "#f87171",
                              }}
                            >
                              {icons[k] ?? ""}{(v as number) > 0 ? "+" : ""}{v}
                            </span>
                          );
                        })}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "reaction" && selectedChoice && (
            <motion.div
              key="reaction"
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
              exit={reducedMotion ? {} : { opacity: 0 }}
              className="space-y-4"
            >
              {/* Selim reacts */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: "rgba(0,0,0,0.75)",
                  border: "1px solid rgba(255,215,0,0.35)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "linear-gradient(135deg,#FF6B00,#FFD700)", color: "#1a0f05" }}
                  >
                    স
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs font-bold mb-1"
                      style={{ color: "#FFB347" }}
                    >
                      Selim বললো:
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#FFF8EE", fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      "{selectedChoice.selimReaction}"
                    </p>
                  </div>
                </div>

                {/* Lesson */}
                <div
                  className="rounded-xl p-3"
                  style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)" }}
                >
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#FFB347" }}>
                    📖 এই মুহূর্তের শিক্ষা
                  </p>
                  <p
                    className="text-xs leading-snug"
                    style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    {moment.lessonBangla}
                  </p>
                  <p className="text-[10px] mt-1 italic" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {moment.lesson}
                  </p>
                </div>

                {/* Scene unlocked / replayed badge */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,215,0,0.3)" }}
                  />
                  <span className="text-[10px] font-bold" style={{ color: replayMode ? "#c084fc" : "#FFD700" }}>
                    {replayMode
                      ? `📼 চ্যাপ্টার ${toBn(moment.chapter)} Memory · effects don't apply`
                      : `✨ চ্যাপ্টার ${toBn(moment.chapter)} Unlocked`}
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,215,0,0.3)" }}
                  />
                </div>
              </div>

              {replayMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={handlePickAgain}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                    style={{
                      background: "rgba(168,85,247,0.18)",
                      border: "1px solid rgba(168,85,247,0.5)",
                      color: "#c084fc",
                      fontFamily: "'Hind Siliguri', sans-serif",
                    }}
                  >
                    ↻ অন্য advice দাও
                  </button>
                  <button
                    onClick={handleContinue}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                    style={{
                      background: "linear-gradient(135deg,#FF6B00,#FFD700)",
                      color: "#1a0f05",
                      fontFamily: "'Hind Siliguri', sans-serif",
                    }}
                  >
                    ✓ বন্ধ করো
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleContinue}
                  className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                  style={{
                    background: "linear-gradient(135deg,#FF6B00,#FFD700)",
                    color: "#1a0f05",
                    fontFamily: "'Hind Siliguri', sans-serif",
                  }}
                >
                  খেলা চালু রাখো →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
