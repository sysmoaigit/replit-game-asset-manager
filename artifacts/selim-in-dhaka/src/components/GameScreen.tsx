import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState, Choice, Achievement, SelimReaction } from "../types";
import SelimAvatar from "./SelimAvatar";
import SceneArt from "./SceneArt";
import StatBars from "./StatBars";
import DecisionCard from "./DecisionCard";
import { resolveSelimReaction } from "../game/reaction";
import { getSceneImageForEvent, getSceneImageForLocation, SceneKey } from "../game/assets";
import { ChaLoadingSpot } from "./ui/SpotArt";
import Icon, { IconName } from "./ui/Icon";
import { toBn } from "../lib/utils";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";

interface GameScreenProps {
  state: GameState;
  prevStats: GameState["stats"] | undefined;
  onChoice: (choice: Choice, reaction: SelimReaction) => void;
  onNextCard: () => void;
  onOpenMenu: () => void;
  onOpenChat: () => void;
  newAchievement: Achievement | null;
  reducedMotion?: boolean;
}

const REACTION_STYLE: Record<SelimReaction["kind"], { bg: string; border: string; accent: string }> = {
  obey: { bg: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", border: "#10b981", accent: "#047857" },
  half: { bg: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "#f59e0b", accent: "#92400e" },
  override: { bg: "linear-gradient(135deg, #FCE7F3, #FBCFE8)", border: "#ec4899", accent: "#9d174d" },
};

const phaseNames = ["সকাল ☀️", "দুপুর 🌤️", "বিকেল 🌆", "রাত 🌙"];

export default function GameScreen({
  state,
  prevStats,
  onChoice,
  onNextCard,
  onOpenMenu,
  onOpenChat,
  newAchievement,
  reducedMotion = false,
}: GameScreenProps) {
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [reaction, setReaction] = useState<SelimReaction | null>(null);
  // Selim quip while the next card is loading. Memoized on humor level
  // so the line stays stable across unrelated rerenders but updates if
  // the player changes Humor Level mid-session.
  const humorLevel = audioEngine.getSettings().humorLevel;
  const loadingCaption = useMemo(
    () => getSystemLine(humorLevel, "এক কাপ চা… loading"),
    [humorLevel],
  );

  const handleChoice = (choice: Choice) => {
    if (!state.currentCard) return;
    const r = resolveSelimReaction(state, state.currentCard, choice);
    setReaction(r);
    setShowResult(true);
    onChoice(choice, r);
    setTimeout(() => {
      setShowResult(false);
      setReaction(null);
      onNextCard();
    }, r.kind === "obey" && !r.excuse ? 2200 : 3400);
  };

  const { stats, currentCard, day, phaseIndex } = state;

  const sceneKey: SceneKey =
    (currentCard?.visual?.sceneKey as SceneKey | undefined) ??
    (currentCard ? getSceneImageForEvent(currentCard.category) : undefined) ??
    (currentCard ? getSceneImageForLocation(currentCard.location) : undefined) ??
    "rooftopSunset";

  const overlay = (currentCard?.visual?.overlay ??
    (currentCard?.category === "love" || currentCard?.category === "crush" ? "romantic"
    : currentCard?.category === "addiction" ? "danger"
    : currentCard?.category === "career" || currentCard?.category === "work" ? "career"
    : currentCard?.category === "social" ? "friendship"
    : "none")) as
    | "romantic" | "heartbreak" | "friendship" | "career" | "boss" | "silent" | "comedy" | "danger" | "none";

  return (
    <div
      className="min-h-full w-full flex flex-col relative"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #1a0f05 0%, #2d1a08 80%, #3d2010 100%)",
      }}
      data-testid="screen-game"
    >
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <SceneArt
          key={sceneKey}
          sceneKey={sceneKey}
          overlay={overlay}
          height="100%"
          rounded={false}
          priority
          reducedMotion={reducedMotion}
          position="center 30%"
          trackUnlock
        />
      </div>

      {/* Achievement toast */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            key={newAchievement.id}
            initial={reducedMotion ? {} : { y: 60, opacity: 0 }}
            animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
            exit={reducedMotion ? {} : { y: 60, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-50 rounded-2xl px-4 py-3 shadow-xl"
            style={{
              transform: "translateX(-50%)",
              background: "linear-gradient(135deg, #FF6B00, #FFD700)",
              minWidth: 220,
            }}
          >
            <p className="text-white text-xs font-bold text-center">🏆 Achievement!</p>
            <p className="text-white text-sm font-bold text-center" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {newAchievement.name}
            </p>
            <p className="text-yellow-100 text-xs text-center">{newAchievement.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.45)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(4px)" }}
      >
        <div>
          <p className="text-xs font-bold" style={{ color: "#FFD700" }}>দিন {toBn(day)}/১৫</p>
          <p className="text-xs" style={{ color: "#FFB347" }}>{phaseNames[phaseIndex]}</p>
        </div>
        <div className="text-center">
          <p className="text-xs" style={{ color: "#FF9933" }}>
            ৳{toBn(stats.money.toLocaleString("en-US"))}
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            <span style={{ color: "#ef4444" }} className="inline-flex items-center gap-0.5">
              <Icon name="heart" size={12} title="Health" />{toBn(Math.round(stats.health))}
            </span>
            <span style={{ color: "#eab308" }} className="inline-flex items-center gap-0.5">
              <Icon name="smile" size={12} title="Mood" />{toBn(Math.round(stats.mood))}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Talk to Selim button */}
          <button
            data-testid="btn-talk-to-selim"
            onClick={onOpenChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold active:scale-90 transition-transform"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,0,0.3), rgba(255,215,0,0.2))",
              border: "1px solid rgba(255,215,0,0.35)",
              color: "#FFD700",
            }}
            aria-label="Talk to Selim"
          >
            💬 Selim
          </button>
          <button
            data-testid="btn-menu"
            onClick={onOpenMenu}
            className="w-9 h-9 rounded-full flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform"
            style={{ background: "rgba(255,255,255,0.1)" }}
            aria-label="Menu"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className="block w-4 h-0.5 rounded" style={{ background: "#FFD700" }} />
            ))}
          </button>
        </div>
      </div>

      {/* Stat bars — collapsible */}
      <div className="relative z-10 flex-shrink-0">
        <button
          data-testid="btn-toggle-stats"
          onClick={() => setStatsExpanded((x) => !x)}
          className="w-full py-1 text-center active:opacity-70"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}
        >
          {statsExpanded ? "Stats লুকাও ▲" : "Stats দেখো ▼"}
        </button>
        <AnimatePresence>
          {statsExpanded && (
            <motion.div
              initial={reducedMotion ? {} : { height: 0, opacity: 0 }}
              animate={reducedMotion ? {} : { height: "auto", opacity: 1 }}
              exit={reducedMotion ? {} : { height: 0, opacity: 0 }}
              className="overflow-hidden px-3 pb-2"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              <StatBars stats={stats} previousStats={prevStats} reducedMotion={reducedMotion} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 gap-3">
        <div className="flex-shrink-0">
          <SelimAvatar
            stats={stats}
            size="sm"
            reducedMotion={reducedMotion}
            reaction={reaction}
            showStatus
          />
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {showResult && reaction ? (
              <motion.div
                key="result"
                initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
                exit={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                className="rounded-2xl p-4 text-center"
                style={{
                  background: REACTION_STYLE[reaction.kind].bg,
                  border: `2px solid ${REACTION_STYLE[reaction.kind].border}`,
                }}
                data-testid="result-overlay"
              >
                <div className="flex items-center justify-center mb-2">
                  <span
                    className="text-[11px] font-bold px-3 py-1 rounded-full"
                    style={{
                      background: REACTION_STYLE[reaction.kind].border,
                      color: "white",
                      fontFamily: "'Hind Siliguri', sans-serif",
                    }}
                    data-testid={`reaction-${reaction.kind}`}
                  >
                    {reaction.label}
                  </span>
                  {reaction.obeyChancePercent < 100 && (
                    <span className="text-[10px] ml-2 opacity-60" style={{ color: REACTION_STYLE[reaction.kind].accent }}>
                      obey চান্স ছিলো {toBn(reaction.obeyChancePercent)}%
                    </span>
                  )}
                </div>

                {reaction.excuse && (
                  <div
                    className="rounded-xl px-3 py-2 mb-2 text-left"
                    style={{ background: "rgba(255,255,255,0.6)", border: `1px dashed ${REACTION_STYLE[reaction.kind].border}` }}
                  >
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: REACTION_STYLE[reaction.kind].accent }}>
                      Selim বলে:
                    </p>
                    <p
                      className="text-sm italic leading-snug"
                      style={{ color: "#1f2937", fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      "{reaction.excuse}"
                    </p>
                  </div>
                )}

                <p
                  className="text-sm font-medium leading-relaxed"
                  style={{ color: "#1a1a1a", fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  {reaction.outcomeText}
                </p>

                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  {Object.entries(reaction.appliedEffects)
                    .filter(([, v]) => typeof v === "number" && v !== 0)
                    .map(([k, v]) => {
                      const icons: Record<string, string> = {
                        health: "❤️", mood: "😊", money: "৳",
                        iq: "🧠", energy: "⚡", reputation: "⭐",
                        addiction: "🚬", temptation: "🔥",
                        selfRespect: "🛡️", pinkyHope: "💖",
                        pinkyHappiness: "🎀", careerProgress: "💼",
                        friendTrust: "🤝", emotionalDelusion: "🌫️", attachmentLevel: "🔗", loneliness: "🌑", romanticFever: "🔥",
                      };
                      const positive = (v as number) > 0;
                      const inverse = k === "addiction" || k === "temptation" || k === "emotionalDelusion" || k === "attachmentLevel" || k === "loneliness" || k === "romanticFever";
                      const good = inverse ? !positive : positive;
                      return (
                        <span
                          key={k}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: good ? "rgba(34, 197, 94, 0.18)" : "rgba(239, 68, 68, 0.18)",
                            color: good ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {icons[k] ?? ""}{positive ? "+" : ""}{v}
                        </span>
                      );
                    })}
                </div>
                <p className="text-[10px] mt-2 opacity-50" style={{ color: REACTION_STYLE[reaction.kind].accent }}>
                  পরের ঘটনা লোড হচ্ছে...
                </p>
              </motion.div>
            ) : currentCard ? (
              <DecisionCard
                key={currentCard.id}
                card={currentCard}
                stats={stats}
                onChoice={handleChoice}
                reducedMotion={reducedMotion}
              />
            ) : (
              <div className="flex items-center justify-center p-6">
                <ChaLoadingSpot
                  reducedMotion={reducedMotion}
                  caption={loadingCaption}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {!statsExpanded && (
          <div className="w-full max-w-sm">
            <div className="flex justify-between text-xs px-1">
              {([
                { icon: "heart", label: "Health", val: stats.health, color: "#ef4444" },
                { icon: "smile", label: "Mood", val: stats.mood, color: "#eab308" },
                { icon: "brain", label: "IQ", val: stats.iq, color: "#3b82f6" },
                { icon: "bolt", label: "Energy", val: stats.energy, color: "#06b6d4" },
                { icon: "smoke", label: "Addiction", val: stats.addiction, color: "#6b7280" },
              ] as Array<{ icon: IconName; label: string; val: number; color: string }>).map(({ icon, label, val, color }) => (
                <div key={icon} className="flex items-center gap-0.5">
                  <Icon name={icon} size={12} style={{ color }} title={label} />
                  <div
                    className="w-8 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, val))}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
