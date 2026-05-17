import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ENDINGS, GOOD_ENDING_IDS } from "../game/endings";
import { EASTER_EGGS, loadUnlockedEggs, EGG_TOTAL } from "../game/easterEggs";
import { loadEndingHistory } from "../lib/endingHistory";
import { getDailyState } from "../lib/dailyChallenge";
import { INITIAL_ACHIEVEMENTS } from "../game/engine";
import { loadProfile } from "../game/playerProfile";
import { audioEngine } from "../game/audioEngine";
import type { Achievement } from "../types";

interface JourneyScreenProps {
  liveAchievements: Achievement[];
  onClose: () => void;
  reducedMotion?: boolean;
}

type TabId = "endings" | "achievements" | "eggs";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "endings",      label: "Endings",      emoji: "🏁" },
  { id: "achievements", label: "Trophies",     emoji: "🏆" },
  { id: "eggs",         label: "Easter Eggs",  emoji: "🥚" },
];

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export default function JourneyScreen({ liveAchievements, onClose, reducedMotion = false }: JourneyScreenProps) {
  const [tab, setTab] = useState<TabId>("endings");

  const history = useMemo(() => loadEndingHistory(), []);
  const unlockedEggs = useMemo(() => loadUnlockedEggs(), []);
  const dailyState = useMemo(() => getDailyState(), []);
  const profile = useMemo(() => loadProfile(), []);

  // Live achievements (from current run state) merged with the catalog so
  // permanent unlocks survive screen-mount even before next save.
  const achievementMap = useMemo(() => {
    const m = new Map<string, Achievement>();
    for (const a of INITIAL_ACHIEVEMENTS) m.set(a.id, a);
    for (const a of liveAchievements) m.set(a.id, a);
    return m;
  }, [liveAchievements]);
  const achievements = useMemo(() => Array.from(achievementMap.values()), [achievementMap]);

  // Aggregate metrics for the hero strip.
  const totals = useMemo(() => {
    const endingsTotal = ENDINGS.length;
    const endingsUnlocked = Object.keys(history).filter((id) => ENDINGS.some((e) => e.id === id)).length;
    const goodSeen = Object.keys(history).filter((id) => GOOD_ENDING_IDS.has(id)).length;
    const totalRuns = Object.values(history).reduce((sum, e) => sum + (e?.count ?? 0), 0);
    const ach = achievements.filter((a) => a.unlocked).length;
    return {
      endingsTotal, endingsUnlocked, goodSeen, totalRuns,
      ach, achTotal: achievements.length,
      eggs: unlockedEggs.size, eggsTotal: EGG_TOTAL,
      bestDaily: dailyState.bestScore,
      ngPlus: profile.ngPlusCount ?? 0,
    };
  }, [history, achievements, unlockedEggs, dailyState, profile]);

  const completion = useMemo(() => {
    const slice = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
    return Math.round(
      (slice(totals.endingsUnlocked, totals.endingsTotal) +
        slice(totals.ach, totals.achTotal) +
        slice(totals.eggs, totals.eggsTotal)) / 3,
    );
  }, [totals]);

  const close = () => { audioEngine.playSfx("ui_back"); onClose(); };
  const switchTab = (id: TabId) => { audioEngine.playSfx("ui_click"); setTab(id); };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0d0600 0%, #1a0f05 60%, #2d1a08 100%)",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
        fontFamily: "'Hind Siliguri', sans-serif",
      }}
      data-testid="screen-journey"
    >
      <div className="relative z-10 mx-auto max-w-md px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold dhaka-title-gradient leading-tight">My Journey</h2>
            <p className="text-[11px] text-amber-200/70">
              {profile.nickname ? `${profile.address || "Bhai"} ${profile.nickname}` : "Selim's chronicler"}
              {totals.ngPlus > 0 && <span className="ml-2 text-fuchsia-300">NG+ ×{totals.ngPlus}</span>}
            </p>
          </div>
          <button
            onClick={close}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-amber-100 border border-amber-300/20"
            data-testid="btn-journey-close"
          >
            ← Back
          </button>
        </div>

        {/* Hero progress card */}
        <div
          className="rounded-2xl p-4 mb-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,107,0,0.18), rgba(124,58,237,0.14))",
            border: "1px solid rgba(255,215,0,0.25)",
          }}
        >
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-200/70">Overall completion</div>
              <div className="text-3xl font-extrabold text-amber-100">{completion}%</div>
            </div>
            <div className="text-right text-[11px] text-amber-100/80">
              <div>🏁 {totals.endingsUnlocked}/{totals.endingsTotal}</div>
              <div>🏆 {totals.ach}/{totals.achTotal}</div>
              <div>🥚 {totals.eggs}/{totals.eggsTotal}</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-black/40 overflow-hidden">
            <motion.div
              initial={reducedMotion ? { width: `${completion}%` } : { width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full"
              style={{ background: "linear-gradient(90deg, #FF6B00, #FFD700, #FF69B4)" }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat label="Total runs" value={totals.totalRuns} />
            <Stat label="Good endings" value={`${totals.goodSeen}`} accent="#86efac" />
            <Stat label="Daily best" value={totals.bestDaily || "—"} accent="#c084fc" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3 p-1 rounded-xl bg-black/30 border border-amber-300/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors"
              style={{
                background: tab === t.id ? "rgba(255,215,0,0.18)" : "transparent",
                color: tab === t.id ? "#FFD700" : "#cbd5e1",
              }}
              data-testid={`tab-${t.id}`}
            >
              <span className="mr-1">{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={reducedMotion ? {} : { opacity: 0, y: 6 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "endings" && <EndingsWall history={history} />}
            {tab === "achievements" && <AchievementsWall achievements={achievements} />}
            {tab === "eggs" && <EggsWall unlocked={unlockedEggs} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, accent = "#FFD700" }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg bg-black/30 px-2 py-1.5 border border-white/5">
      <div className="text-base font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-amber-200/60">{label}</div>
    </div>
  );
}

function EndingsWall({ history }: { history: ReturnType<typeof loadEndingHistory> }) {
  return (
    <div className="space-y-2">
      {ENDINGS.map((e) => {
        const seen = history[e.id];
        const isGood = GOOD_ENDING_IDS.has(e.id);
        return (
          <div
            key={e.id}
            className="rounded-xl p-3 border"
            style={{
              background: seen ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
              borderColor: seen
                ? (isGood ? "rgba(134,239,172,0.4)" : "rgba(252,211,77,0.3)")
                : "rgba(255,255,255,0.06)",
              opacity: seen ? 1 : 0.55,
            }}
            data-testid={`ending-row-${e.id}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-sm" style={{ color: seen ? "#FFD700" : "#94a3b8" }}>
                {seen ? e.name : "??? Locked"}
              </div>
              {seen && (
                <div className="text-[10px] text-amber-200/70 whitespace-nowrap">
                  ×{seen.count} · {formatDate(seen.lastSeenAt)}
                </div>
              )}
            </div>
            <div className="text-[11px] text-stone-300/85 mt-1 leading-snug">
              {seen ? e.messageBangla.slice(0, 130) + (e.messageBangla.length > 130 ? "…" : "") : "Reach this ending to reveal Selim's story."}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AchievementsWall({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {achievements.map((a) => (
        <div
          key={a.id}
          className="rounded-xl p-2.5 border text-left"
          style={{
            background: a.unlocked ? "rgba(255,107,0,0.10)" : "rgba(255,255,255,0.03)",
            borderColor: a.unlocked ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.06)",
            opacity: a.unlocked ? 1 : 0.55,
          }}
          data-testid={`ach-${a.id}`}
        >
          <div className="text-sm font-bold" style={{ color: a.unlocked ? "#FFD700" : "#94a3b8" }}>
            {a.unlocked ? a.name : "🔒 Locked"}
          </div>
          <div className="text-[10.5px] text-stone-300/80 mt-0.5 leading-snug">
            {a.unlocked ? a.description : "Keep playing to unlock."}
          </div>
        </div>
      ))}
    </div>
  );
}

function EggsWall({ unlocked }: { unlocked: Set<string> }) {
  const rarityColor = (r: string) =>
    r === "legendary" ? "#f0abfc" : r === "rare" ? "#fbbf24" : "#7dd3fc";
  return (
    <div className="space-y-2">
      {EASTER_EGGS.map((e) => {
        const open = unlocked.has(e.id);
        return (
          <div
            key={e.id}
            className="rounded-xl p-3 border"
            style={{
              background: open ? "rgba(168,85,247,0.10)" : "rgba(255,255,255,0.03)",
              borderColor: open ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)",
              opacity: open ? 1 : 0.7,
            }}
            data-testid={`egg-${e.id}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-sm" style={{ color: open ? "#f0abfc" : "#94a3b8" }}>
                {open ? `🥚 ${e.name}` : "🔒 ??? Hidden"}
              </div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: rarityColor(e.rarity) }}>
                {e.rarity}
              </div>
            </div>
            <div className="text-[11px] text-stone-300/85 mt-1 leading-snug italic">
              {open ? e.reveal : e.hint}
            </div>
          </div>
        );
      })}
    </div>
  );
}
