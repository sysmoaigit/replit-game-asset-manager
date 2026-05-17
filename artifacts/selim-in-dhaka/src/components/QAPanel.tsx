import { useMemo, useRef, useState } from "react";
import type { GameState, GameScreen, Stats, Flags } from "../types";
import { ENDINGS } from "../game/endings";
import { audioEngine } from "../game/audioEngine";
import {
  getMissingImages,
  getSceneImageForEvent,
  getSceneImageForLocation,
  SELIM_ASSETS,
  type SceneKey,
} from "../game/assets";
import {
  EASTER_EGGS,
  loadUnlockedEggs,
  tryUnlockEgg,
  EGG_TOTAL,
  type EasterEggId,
} from "../game/easterEggs";
import { loadEndingHistory } from "../lib/endingHistory";
import { getDailyState } from "../lib/dailyChallenge";
import { loadProfile } from "../game/playerProfile";
import { unlockScene } from "./SceneUnlockToast";
import { ALL_CARDS } from "../game/cards";
import { RANDOM_EVENT_CARDS } from "../game/randomEvents";

interface QAPanelProps {
  gs: GameState;
  memoryCount: number;
  onForcePinkyCard: () => void;
  onForceRandomCrush: () => void;
  onForceHeartbreak: () => void;
  onForceRecovery: () => void;
  onForceBoguraBoss: () => void;
  onResetSave: () => void;
  onResetMemory: () => void;
  onSetStats: (partial: Partial<Stats>) => void;
  onSetFlags: (partial: Partial<Flags>) => void;
  onJumpToDay: (day: number) => void;
  onForceEnding: (id: string) => void;
  onForceCard: (id: string) => void;
  onForceScreen: (screen: GameScreen) => void;
  onChaos: () => void;
}

const MEMORY_KEYS = [
  "selim_memory_store_v1",
  "selim_player_profile_v1",
  "selim_dhaka_endings_seen_v1",
  "selim_dhaka_arc_history_v1",
  "selim_dhaka_promise_memory_v1",
  "selim_dialogue_state_v1",
  "selim_dhaka_heard_quotes_v1",
];

const SCENE_UNLOCK_KEY = "selim_dhaka_scene_unlocks_v1";

const PHASES = ["Morning", "Noon", "Evening", "Night"];

const SCREENS: GameScreen[] = ["start", "tutorial", "game", "daysum", "recovery", "ending", "menu"];

const QA_JOKES = [
  "ভাই, debug করতেছো? Pinky-ও জানে না।",
  "QA = god mode। মাথা গরম রাইখো না।",
  "Stats পাল্টাইলে Selim-এর মা টের পাবে না।",
  "Force ending মানে cheat না — পরীক্ষা।",
  "Chaos button টিপলে Bogura কাঁপে।",
  "Selim QA দেখে অবাক — 'ভাই, এতো power!'",
  "Recharge cheat নাই — life-এর মতোই।",
  "৳ negative হইলে Cha Mama emoji পাঠায়।",
];

type StatPreset = {
  id: string;
  emoji: string;
  label: string;
  tagline: string;
  stats: Partial<Stats>;
  flags?: Partial<Flags>;
};

const STAT_PRESETS: StatPreset[] = [
  {
    id: "pinky_simp", emoji: "🥺", label: "Pinky Simp",
    tagline: "Hope max, wallet min.",
    stats: { pinkyHope: 95, pinkyHappiness: 80, emotionalDelusion: 85, selfRespect: 15, money: 50, careerProgress: 10, romanticFever: 80 },
  },
  {
    id: "bogura_boss", emoji: "👑", label: "Bogura Boss",
    tagline: "Career hot, head cool.",
    stats: { selfRespect: 95, careerProgress: 90, money: 1500, iq: 80, addiction: 10, mood: 75, pinkyHope: 30 },
  },
  {
    id: "broke", emoji: "💸", label: "Broke Selim",
    tagline: "Wallet ICU-তে।",
    stats: { money: -200, mood: 25, energy: 30, careerProgress: 15, friendTrust: 40 },
  },
  {
    id: "chad", emoji: "🛡", label: "Chad Mode",
    tagline: "Boundary set, vibes elite.",
    stats: { selfRespect: 100, pinkyHope: 0, friendTrust: 80, mood: 70, addiction: 5, iq: 75 },
  },
  {
    id: "touba_loop", emoji: "🔄", label: "Touba Loop",
    tagline: "Promises broken, again.",
    stats: { addiction: 75, selfRespect: 25, emotionalDelusion: 70, mood: 35 },
    flags: { brokenPromiseCount: 11, rechargePromisesBroken: 5, promisesMade: 12 },
  },
  {
    id: "recharge_romeo", emoji: "📲", label: "Recharge Romeo",
    tagline: "Wallet = Pinky's plan.",
    stats: { pinkyHope: 80, emotionalDelusion: 80, money: 50, selfRespect: 20 },
    flags: { pinkyRechargeCount: 7, girlInvestment: 2500 },
  },
  {
    id: "healthy", emoji: "💪", label: "Healthy Mode",
    tagline: "ফিট সেলিম, পান নাই।",
    stats: { health: 90, addiction: 10, energy: 85, mood: 75, temptation: 15 },
  },
  {
    id: "galaxy_brain", emoji: "🧠", label: "Galaxy Brain",
    tagline: "IQ off the chart.",
    stats: { iq: 100, careerProgress: 60, selfRespect: 75, emotionalDelusion: 10 },
  },
  {
    id: "influencer", emoji: "⭐", label: "Influencer",
    tagline: "এলাকা চিনে।",
    stats: { reputation: 90, mood: 80, money: 1200, careerProgress: 50, friendTrust: 60 },
  },
  {
    id: "rock_bottom", emoji: "💀", label: "Rock Bottom",
    tagline: "Selim phone ulta kore rakhlo.",
    stats: { health: 15, mood: 10, money: -500, addiction: 90, selfRespect: 5, friendTrust: 10, energy: 10, loneliness: 95 },
  },
  {
    id: "biryani_king", emoji: "🍛", label: "Biryani King",
    tagline: "পুরান ঢাকার রাজা।",
    stats: { mood: 80, money: 800, health: 60, friendTrust: 70 },
    flags: { biryaniCount: 7 },
  },
  {
    id: "first_love", emoji: "💘", label: "Eternal Crush",
    tagline: "এইবার সিরিয়াস।",
    stats: { romanticFever: 95, pinkyHope: 70, attachmentLevel: 80 },
    flags: { firstLoveCount: 9, randomCrushes: 5 },
  },
];

type TabId = "state" | "force" | "presets" | "chaos" | "browse";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "state",   label: "State",   emoji: "🎯" },
  { id: "force",   label: "Force",   emoji: "⚡" },
  { id: "presets", label: "Presets", emoji: "🎨" },
  { id: "chaos",   label: "Chaos",   emoji: "🎲" },
  { id: "browse",  label: "Album",   emoji: "📚" },
];

function SnapStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", borderRadius: 4,
      padding: "3px 4px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ fontSize: 11, fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: 8, color: "#94a3b8", letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// Rough Selim mood derivation — for the "mood mirror" badge.
function deriveSelimMood(s: Stats): { emoji: string; label: string; color: string } {
  if (s.addiction > 65 && s.selfRespect < 30) return { emoji: "💀", label: "rock-bottom", color: "#fca5a5" };
  if (s.pinkyHope > 75 && s.emotionalDelusion > 65) return { emoji: "🥺", label: "pinky-simp", color: "#f9a8d4" };
  if (s.selfRespect > 75 && s.careerProgress > 60) return { emoji: "👑", label: "bogura-boss", color: "#fcd34d" };
  if (s.mood < 25) return { emoji: "😞", label: "down-bad", color: "#94a3b8" };
  if (s.mood > 70 && s.health > 60) return { emoji: "😎", label: "vibing", color: "#86efac" };
  if (s.romanticFever > 70) return { emoji: "💘", label: "love-fever", color: "#f472b6" };
  if (s.friendTrust > 75) return { emoji: "🤝", label: "loyal", color: "#7dd3fc" };
  if (s.iq > 70 && s.emotionalDelusion < 30) return { emoji: "🧠", label: "galaxy-brain", color: "#a5b4fc" };
  if (s.money < 0) return { emoji: "💸", label: "broke", color: "#fdba74" };
  return { emoji: "🚶", label: "just-walking", color: "#cbd5e1" };
}

const STAT_CONFIG: { key: keyof Stats; label: string; emoji: string; min: number; max: number }[] = [
  { key: "health",            emoji: "❤️", label: "Health",       min: 0, max: 100 },
  { key: "mood",              emoji: "😊", label: "Mood",         min: 0, max: 100 },
  { key: "energy",            emoji: "⚡", label: "Energy",       min: 0, max: 100 },
  { key: "iq",                emoji: "🧠", label: "IQ",           min: 0, max: 100 },
  { key: "selfRespect",       emoji: "🛡", label: "Self-Respect", min: 0, max: 100 },
  { key: "pinkyHope",         emoji: "💖", label: "Pinky Hope",   min: 0, max: 100 },
  { key: "pinkyHappiness",    emoji: "🌸", label: "Pinky Happy",  min: 0, max: 100 },
  { key: "emotionalDelusion", emoji: "🌫", label: "Delusion",     min: 0, max: 100 },
  { key: "careerProgress",    emoji: "💼", label: "Career",       min: 0, max: 100 },
  { key: "friendTrust",       emoji: "🤝", label: "Friend Trust", min: 0, max: 100 },
  { key: "addiction",         emoji: "🚬", label: "Addiction",    min: 0, max: 100 },
  { key: "temptation",        emoji: "🔥", label: "Temptation",   min: 0, max: 100 },
  { key: "reputation",        emoji: "⭐", label: "Reputation",   min: 0, max: 100 },
  { key: "loneliness",        emoji: "🌑", label: "Loneliness",   min: 0, max: 100 },
  { key: "romanticFever",     emoji: "💘", label: "Rom. Fever",   min: 0, max: 100 },
  { key: "attachmentLevel",   emoji: "🪢", label: "Attachment",   min: 0, max: 100 },
  { key: "money",             emoji: "৳",  label: "Money",        min: -1000, max: 5000 },
];

const KEY_FLAGS: { key: keyof Flags; emoji: string; label: string }[] = [
  { key: "biryaniCount",         emoji: "🍛", label: "Biryani" },
  { key: "cigaretteCount",       emoji: "🚬", label: "Cigs" },
  { key: "rentPaid",             emoji: "🏠", label: "Rent paid" },
  { key: "heartbreakCount",      emoji: "💔", label: "Heartbreaks" },
  { key: "pinkyRechargeCount",   emoji: "📲", label: "Recharges" },
  { key: "pinkySeenCount",       emoji: "👀", label: "Pinky seen" },
  { key: "pinkyBoundaryWins",    emoji: "🛡", label: "Boundaries" },
  { key: "playerAdviceFollowed", emoji: "✅", label: "Advice ✓" },
  { key: "playerAdviceIgnored",  emoji: "❌", label: "Advice ✗" },
  { key: "emotionalOverrides",   emoji: "🚨", label: "Overrides" },
  { key: "promisesMade",         emoji: "🤞", label: "Promises" },
  { key: "promisesKept",         emoji: "🌟", label: "Kept" },
  { key: "brokenPromiseCount",   emoji: "💥", label: "Broken" },
  { key: "bestFriendMoments",    emoji: "🤝", label: "BFF moments" },
  { key: "silentMoments",        emoji: "🤐", label: "Silent" },
  { key: "firstLoveCount",       emoji: "💘", label: "First-loves" },
  { key: "randomCrushes",        emoji: "😍", label: "Crushes" },
  { key: "girlInvestment",       emoji: "💸", label: "Girl ৳" },
];

export default function QAPanel({
  gs, memoryCount,
  onForcePinkyCard, onForceRandomCrush, onForceHeartbreak, onForceRecovery, onForceBoguraBoss,
  onResetSave, onResetMemory,
  onSetStats, onSetFlags, onJumpToDay, onForceEnding, onForceCard, onForceScreen, onChaos,
}: QAPanelProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("state");
  const [cardSearch, setCardSearch] = useState("");
  const [endingFilter, setEndingFilter] = useState<"all" | "good" | "eligible">("all");
  const [actionLog, setActionLog] = useState<string[]>([]);
  const jokeRef = useRef<string>(QA_JOKES[Math.floor(Math.random() * QA_JOKES.length)]);

  if (!import.meta.env.DEV) return null;

  const log = (msg: string) => setActionLog((prev) => [`${new Date().toLocaleTimeString().slice(0, 8)} ${msg}`, ...prev].slice(0, 6));

  const phase = PHASES[gs.phaseIndex] ?? "?";
  const mood = deriveSelimMood(gs.stats);

  const currentSceneKey =
    (gs.currentCard?.visual?.sceneKey as string | undefined) ??
    (gs.currentCard ? getSceneImageForEvent(gs.currentCard.category) : undefined) ??
    (gs.currentCard ? getSceneImageForLocation(gs.currentCard.location) : undefined) ??
    "rooftopSunset";

  const totalAssets = Object.keys(SELIM_ASSETS).length;
  const missingImages = getMissingImages();
  const missingAudio = audioEngine.getMissingFiles();

  const eligibleEndingIds = useMemo(
    () => new Set(ENDINGS.filter((e) => e.id !== "lost_selim" && e.condition(gs)).map((e) => e.id)),
    [gs],
  );

  const unlockedEggs = useMemo(() => loadUnlockedEggs(), [actionLog]); // re-read after toggles

  // Journey snapshot — mirrors what the player sees in JourneyScreen so the
  // dev can spot drift between debug state and player-facing progression.
  const journeySnapshot = useMemo(() => {
    const history = loadEndingHistory();
    const endingIds = Object.keys(history).filter((id) => ENDINGS.some((e) => e.id === id));
    const good = endingIds.filter((id) => ENDINGS.find((e) => e.id === id)?.isGood).length;
    const runs = Object.values(history).reduce((s, e) => s + (e?.count ?? 0), 0);
    const ach = gs.achievements.filter((a) => a.unlocked).length;
    const bestDaily = getDailyState().bestScore;
    const ngPlus = loadProfile().ngPlusCount ?? 0;
    const slice = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
    const completion = Math.round(
      (slice(endingIds.length, ENDINGS.length) +
        slice(ach, gs.achievements.length || 1) +
        slice(unlockedEggs.size, EGG_TOTAL)) / 3,
    );
    return { endings: endingIds.length, good, runs, ach, bestDaily, ngPlus, completion };
  }, [gs.achievements, unlockedEggs, actionLog]);

  const storedMemoryBytes = MEMORY_KEYS.reduce((total, key) => {
    const val = localStorage.getItem(key);
    return total + (val ? val.length : 0);
  }, 0);

  const filteredCards = useMemo(() => {
    if (!cardSearch.trim()) return [];
    const q = cardSearch.toLowerCase().trim();
    return [...ALL_CARDS, ...RANDOM_EVENT_CARDS]
      .filter((c) =>
        c.id.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [cardSearch]);

  const filteredEndings = useMemo(() => {
    if (endingFilter === "good") return ENDINGS.filter((e) => e.isGood);
    if (endingFilter === "eligible") return ENDINGS.filter((e) => eligibleEndingIds.has(e.id));
    return ENDINGS;
  }, [endingFilter, eligibleEndingIds]);

  const exportDebug = () => {
    const data = {
      day: gs.day, phase, stats: gs.stats, flags: gs.flags,
      currentCardId: gs.currentCard?.id ?? null, currentSceneKey,
      lastOutcome: gs.lastResultText, memoryCount, missingImages, missingAudio,
      eligibleEndings: Array.from(eligibleEndingIds), recentCards: gs.recentCards,
      achievements: gs.achievements.filter((a) => a.unlocked).map((a) => a.id),
      currentMusic: audioEngine.currentMusic, currentAmbience: audioEngine.currentAmbience,
      unlockedEggs: Array.from(unlockedEggs),
      derivedMood: mood.label,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `selim-debug-day${gs.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
    log("📤 exported debug JSON");
  };

  const applyPreset = (p: StatPreset) => {
    onSetStats(p.stats);
    if (p.flags) onSetFlags(p.flags);
    log(`🎨 preset → ${p.label}`);
  };

  const unlockAllScenes = () => {
    const all = Object.keys(SELIM_ASSETS) as SceneKey[];
    try { localStorage.setItem(SCENE_UNLOCK_KEY, JSON.stringify(all)); } catch { /* ignore */ }
    log(`🖼 unlocked ${all.length} scenes`);
  };

  const resetSceneUnlocks = () => {
    try { localStorage.removeItem(SCENE_UNLOCK_KEY); } catch { /* ignore */ }
    log("🖼 cleared scene unlocks");
  };

  const unlockAllEggs = () => {
    let count = 0;
    EASTER_EGGS.forEach((e) => { if (tryUnlockEgg(e.id)) count++; });
    log(`🥚 unlocked ${count}/${EGG_TOTAL} eggs`);
  };

  const resetEggs = () => {
    try { localStorage.removeItem("selim_dhaka_easter_eggs_v1"); } catch { /* ignore */ }
    log("🥚 cleared eggs");
  };

  const toggleEgg = (id: EasterEggId) => {
    if (unlockedEggs.has(id)) {
      // Manual remove from storage
      const next = new Set(unlockedEggs); next.delete(id);
      try { localStorage.setItem("selim_dhaka_easter_eggs_v1", JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      log(`🥚 - ${id}`);
    } else {
      tryUnlockEgg(id);
      log(`🥚 + ${id}`);
    }
  };

  const previewScene = (key: SceneKey) => {
    unlockScene(key);
    log(`🎬 preview ${key}`);
  };

  // ── styling helpers ────────────────────────────────────────────────────────
  const btn = (color: string, bg: string): React.CSSProperties => ({
    background: bg, border: `1px solid ${color}`, color, borderRadius: 4,
    padding: "3px 6px", cursor: "pointer", fontSize: 10, textAlign: "left",
    fontFamily: "inherit",
  });
  const sectionLabel = (txt: string): React.CSSProperties => ({
    color: "#94a3b8", fontSize: 10, marginBottom: 3, textTransform: "uppercase",
    letterSpacing: 0.5,
  });

  return (
    <div style={{ position: "fixed", bottom: 12, left: 8, zIndex: 9999, fontFamily: "monospace", fontSize: 11 }}>
      <button
        onClick={() => setOpen((x) => !x)}
        style={{
          background: open ? "#1e293b" : "rgba(30,41,59,0.85)",
          color: "#fbbf24", border: "1px solid #fbbf24", borderRadius: 6,
          padding: "3px 8px", cursor: "pointer", fontWeight: "bold", fontSize: 11,
          display: "flex", alignItems: "center", gap: 6,
        }}
        title="Toggle QA Panel"
      >
        🛠 QA <span style={{ color: mood.color, fontSize: 13 }}>{mood.emoji}</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute", bottom: 30, left: 0, width: 360, maxHeight: "85vh",
            overflowY: "auto", background: "rgba(15,23,42,0.97)",
            border: "1px solid #334155", borderRadius: 10, padding: 10,
            color: "#e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header: rotating joke + mood mirror */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fbbf24", fontWeight: "bold", margin: 0 }}>🛠 QA Playground</p>
              <p style={{ color: "#64748b", fontSize: 9, margin: "2px 0 0", fontStyle: "italic" }}>{jokeRef.current}</p>
            </div>
            <div style={{
              fontSize: 18, padding: "2px 6px", borderRadius: 6,
              background: "rgba(255,255,255,0.06)", border: `1px solid ${mood.color}`,
              color: mood.color, textAlign: "center", minWidth: 36,
            }} title={`Selim mood: ${mood.label}`}>
              {mood.emoji}
              <div style={{ fontSize: 8, fontWeight: "bold", letterSpacing: 0.3 }}>{mood.label}</div>
            </div>
          </div>

          {/* Quick status strip */}
          <div style={{ display: "flex", gap: 6, fontSize: 10, marginBottom: 6, color: "#cbd5e1" }}>
            <span>📅 D{gs.day}/15·{phase[0]}</span>
            <span>🎯 {gs.screen}</span>
            <span>🃏 {gs.currentCard?.id?.slice(0, 10) ?? "—"}</span>
            <span>🧠 {memoryCount}</span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 8, borderBottom: "1px solid #334155" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, background: tab === t.id ? "#1e293b" : "transparent",
                  border: "none", borderBottom: tab === t.id ? "2px solid #fbbf24" : "2px solid transparent",
                  color: tab === t.id ? "#fbbf24" : "#94a3b8",
                  padding: "5px 4px", cursor: "pointer", fontSize: 10, fontWeight: tab === t.id ? "bold" : "normal",
                  fontFamily: "inherit",
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* ── STATE TAB ──────────────────────────────────────── */}
          {tab === "state" && (
            <>
              <div style={sectionLabel("")}>── Live Stats (drag to edit) ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", marginBottom: 8 }}>
                {STAT_CONFIG.map(({ key, label, emoji, min, max }) => {
                  const v = gs.stats[key];
                  const color = key === "money"
                    ? (v < 0 ? "#fca5a5" : v > 800 ? "#86efac" : "#fbbf24")
                    : (v > 60 ? "#86efac" : v < 25 ? "#fca5a5" : "#fbbf24");
                  return (
                    <div key={key} style={{ fontSize: 9 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{emoji} {label}</span>
                        <b style={{ color }}>{Math.round(v)}</b>
                      </div>
                      <input
                        type="range" min={min} max={max} value={v}
                        onChange={(e) => onSetStats({ [key]: Number(e.target.value) } as Partial<Stats>)}
                        style={{ width: "100%", height: 4, accentColor: color }}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={sectionLabel("")}>── Key Flags ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, fontSize: 9, marginBottom: 8 }}>
                {KEY_FLAGS.map(({ key, label, emoji }) => (
                  <div key={key} style={{ background: "rgba(255,255,255,0.04)", padding: "2px 4px", borderRadius: 3 }}>
                    {emoji} {label}: <b style={{ color: "#7dd3fc" }}>{String(gs.flags[key] ?? 0)}</b>
                  </div>
                ))}
              </div>

              <div style={sectionLabel("")}>── Audio + Scene ──</div>
              <div style={{ fontSize: 10, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 8 }}>
                <div>🖼 Scene: <b style={{ color: "#86efac" }}>{currentSceneKey}</b></div>
                <div>🎵 Music: <b style={{ color: "#86efac" }}>{audioEngine.currentMusic ?? "—"}</b></div>
                <div>🌆 Ambience: <b style={{ color: "#86efac" }}>{audioEngine.currentAmbience ?? "—"}</b></div>
                <div>🧠 Mem: <b>{memoryCount}</b> entries ({(storedMemoryBytes / 1024).toFixed(1)} KB)</div>
              </div>

              {/* Journey snapshot — quick mirror of player-facing progression */}
              <div style={sectionLabel("")}>── Journey Snapshot ──</div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4,
                marginBottom: 8,
              }}>
                <SnapStat label="Endings" value={`${journeySnapshot.endings}/${ENDINGS.length}`} color="#fcd34d" />
                <SnapStat label="Good" value={`${journeySnapshot.good}`} color="#86efac" />
                <SnapStat label="Trophies" value={`${journeySnapshot.ach}/${gs.achievements.length}`} color="#7dd3fc" />
                <SnapStat label="Eggs" value={`${unlockedEggs.size}/${EGG_TOTAL}`} color="#f0abfc" />
                <SnapStat label="Runs" value={`${journeySnapshot.runs}`} color="#fbbf24" />
                <SnapStat label="Daily★" value={`${journeySnapshot.bestDaily || "—"}`} color="#c084fc" />
                <SnapStat label="Done %" value={`${journeySnapshot.completion}`} color="#FFD700" />
                <SnapStat label="NG+" value={`${journeySnapshot.ngPlus}`} color="#fb923c" />
              </div>

              {gs.lastResultText && (
                <div style={{
                  padding: "4px 6px", background: "rgba(255,255,255,0.06)", borderRadius: 4,
                  fontSize: 10, color: "#cbd5e1", lineHeight: 1.5, marginBottom: 8,
                }}>
                  📝 Last: {gs.lastResultText.slice(0, 140)}{gs.lastResultText.length > 140 ? "…" : ""}
                </div>
              )}

              {actionLog.length > 0 && (
                <>
                  <div style={sectionLabel("")}>── Action Log ──</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.5 }}>
                    {actionLog.map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── FORCE TAB ──────────────────────────────────────── */}
          {tab === "force" && (
            <>
              <div style={sectionLabel("")}>── Quick Force ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
                {([
                  ["💖 Pinky Card", () => { onForcePinkyCard(); log("⚡ pinky card"); }],
                  ["😍 Random Crush", () => { onForceRandomCrush(); log("⚡ crush"); }],
                  ["💔 Heartbreak", () => { onForceHeartbreak(); audioEngine.playSfx("heartbreak"); log("⚡ heartbreak"); }],
                  ["🚨 Recovery", () => { onForceRecovery(); log("⚡ recovery"); }],
                  ["👑 Bogura End", () => { onForceBoguraBoss(); log("⚡ bogura end"); }],
                ] as [string, () => void][]).map(([label, fn]) => (
                  <button key={label} onClick={fn} style={btn("#93c5fd", "#1e3a5f")}>{label}</button>
                ))}
              </div>

              <div style={sectionLabel("")}>── Jump to Screen ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3, marginBottom: 8 }}>
                {SCREENS.map((s) => (
                  <button key={s} onClick={() => { onForceScreen(s); log(`🎯 → ${s}`); }}
                    style={btn(gs.screen === s ? "#fbbf24" : "#cbd5e1", gs.screen === s ? "#3b2000" : "rgba(255,255,255,0.04)")}>
                    {s}
                  </button>
                ))}
              </div>

              <div style={sectionLabel("")}>── Force Ending ──</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {(["all", "good", "eligible"] as const).map((f) => (
                  <button key={f} onClick={() => setEndingFilter(f)}
                    style={btn(endingFilter === f ? "#fbbf24" : "#94a3b8", endingFilter === f ? "#3b2000" : "transparent")}>
                    {f}{f === "eligible" ? ` (${eligibleEndingIds.size})` : ""}
                  </button>
                ))}
              </div>
              <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 8 }}>
                {filteredEndings.map((e) => {
                  const eligible = eligibleEndingIds.has(e.id);
                  return (
                    <button key={e.id} onClick={() => { onForceEnding(e.id); log(`⚡ ending → ${e.id}`); }}
                      style={{
                        ...btn(eligible ? "#86efac" : (e.isGood ? "#7dd3fc" : "#fca5a5"),
                          eligible ? "rgba(134,239,172,0.08)" : "rgba(255,255,255,0.03)"),
                        width: "100%", marginBottom: 2, display: "flex", justifyContent: "space-between",
                      }}>
                      <span>{eligible ? "✓ " : "  "}{e.name}</span>
                      <span style={{ opacity: 0.6, fontSize: 9 }}>{e.id}</span>
                    </button>
                  );
                })}
              </div>

              <div style={sectionLabel("")}>── Force Card by ID ──</div>
              <input
                type="text" placeholder="search id / title / category…" value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid #334155",
                  borderRadius: 4, color: "#e2e8f0", padding: "4px 6px", fontSize: 10, fontFamily: "inherit",
                  marginBottom: 4, boxSizing: "border-box",
                }}
              />
              <div style={{ maxHeight: 140, overflowY: "auto" }}>
                {filteredCards.map((c) => (
                  <button key={c.id} onClick={() => { onForceCard(c.id); log(`🃏 → ${c.id}`); }}
                    style={{ ...btn("#a5b4fc", "rgba(165,180,252,0.05)"), width: "100%", marginBottom: 2 }}>
                    <b>{c.id}</b> · <span style={{ opacity: 0.7 }}>{c.category}</span>
                    {c.title ? <div style={{ opacity: 0.6, fontSize: 9 }}>{c.title.slice(0, 50)}</div> : null}
                  </button>
                ))}
                {cardSearch && filteredCards.length === 0 && (
                  <div style={{ color: "#64748b", fontSize: 10 }}>No cards match.</div>
                )}
              </div>
            </>
          )}

          {/* ── PRESETS TAB ──────────────────────────────────── */}
          {tab === "presets" && (
            <>
              <div style={sectionLabel("")}>── One-Click Vibes ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
                {STAT_PRESETS.map((p) => (
                  <button key={p.id} onClick={() => applyPreset(p)}
                    style={{ ...btn("#fde68a", "rgba(253,230,138,0.06)"), padding: "5px 6px" }}>
                    <div style={{ fontSize: 13 }}>{p.emoji} <b>{p.label}</b></div>
                    <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>{p.tagline}</div>
                  </button>
                ))}
              </div>

              <div style={sectionLabel("")}>── Day Travel ──</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8, alignItems: "center" }}>
                <button onClick={() => { onJumpToDay(gs.day - 1); log(`📅 day -1`); }} style={btn("#cbd5e1", "rgba(255,255,255,0.04)")}>◀ Day</button>
                <span style={{ color: "#fbbf24", fontWeight: "bold", flex: 1, textAlign: "center" }}>Day {gs.day}/15</span>
                <button onClick={() => { onJumpToDay(gs.day + 1); log(`📅 day +1`); }} style={btn("#cbd5e1", "rgba(255,255,255,0.04)")}>Day ▶</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, marginBottom: 10 }}>
                <button onClick={() => { onJumpToDay(1); log("📅 → day 1"); }} style={btn("#cbd5e1", "rgba(255,255,255,0.04)")}>Day 1</button>
                <button onClick={() => { onJumpToDay(7); log("📅 → day 7"); }} style={btn("#cbd5e1", "rgba(255,255,255,0.04)")}>Day 7</button>
                <button onClick={() => { onJumpToDay(15); log("📅 → day 15"); }} style={btn("#fbbf24", "#3b2000")}>Day 15</button>
              </div>

              <div style={sectionLabel("")}>── Wallet Cheats ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 3 }}>
                {[100, 500, 1000, -200].map((amt) => (
                  <button key={amt} onClick={() => { onSetStats({ money: gs.stats.money + amt }); log(`৳ ${amt > 0 ? "+" : ""}${amt}`); }}
                    style={btn(amt > 0 ? "#86efac" : "#fca5a5", amt > 0 ? "rgba(134,239,172,0.06)" : "rgba(252,165,165,0.06)")}>
                    {amt > 0 ? "+" : ""}৳{amt}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── CHAOS TAB ──────────────────────────────────── */}
          {tab === "chaos" && (
            <>
              <div style={sectionLabel("")}>── Chaos Mode ──</div>
              <button onClick={() => { onChaos(); log("🎲 CHAOS unleashed"); }}
                style={{
                  width: "100%", marginBottom: 10, padding: "8px 10px",
                  background: "linear-gradient(90deg, #ef4444, #f59e0b, #ec4899)",
                  color: "white", fontWeight: "bold", border: "none", borderRadius: 6,
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                }}>
                🎲 RANDOMIZE EVERYTHING
              </button>

              <div style={sectionLabel("")}>── Bulk Unlocks ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
                <button onClick={unlockAllScenes} style={btn("#86efac", "rgba(134,239,172,0.06)")}>🖼 All Scenes</button>
                <button onClick={resetSceneUnlocks} style={btn("#fca5a5", "rgba(252,165,165,0.06)")}>🗑 Reset Scenes</button>
                <button onClick={unlockAllEggs} style={btn("#fde68a", "rgba(253,230,138,0.06)")}>🥚 All Eggs</button>
                <button onClick={resetEggs} style={btn("#fca5a5", "rgba(252,165,165,0.06)")}>🗑 Reset Eggs</button>
              </div>

              <div style={sectionLabel("")}>── Easter Eggs ({unlockedEggs.size}/{EGG_TOTAL}) ──</div>
              <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
                {EASTER_EGGS.map((e) => {
                  const u = unlockedEggs.has(e.id);
                  return (
                    <button key={e.id} onClick={() => toggleEgg(e.id)}
                      style={{
                        ...btn(u ? "#86efac" : "#94a3b8", u ? "rgba(134,239,172,0.08)" : "transparent"),
                        width: "100%", marginBottom: 2, display: "flex", justifyContent: "space-between",
                      }}>
                      <span>{u ? "✓" : "○"} {e.name}</span>
                      <span style={{ fontSize: 8, opacity: 0.6 }}>{e.rarity}</span>
                    </button>
                  );
                })}
              </div>

              <div style={sectionLabel("")}>── Reset Bombs ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                <button onClick={() => { onResetSave(); log("🗑 save wiped"); }} style={btn("#fca5a5", "#450a0a")}>🗑 Save</button>
                <button onClick={() => {
                  MEMORY_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
                  onResetMemory(); log("🧠 mem wiped");
                }} style={btn("#fbbf24", "#3b2000")}>🧠 Mem</button>
                <button onClick={exportDebug} style={btn("#86efac", "#1a2e1a")}>📤 Export</button>
              </div>
            </>
          )}

          {/* ── BROWSE TAB (album-style scenes/missing) ───────── */}
          {tab === "browse" && (
            <>
              <div style={sectionLabel("")}>── Scenes ({totalAssets}) — click to preview-toast ──</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3, marginBottom: 10 }}>
                {(Object.keys(SELIM_ASSETS) as SceneKey[]).map((k) => (
                  <button key={k} onClick={() => previewScene(k)}
                    style={{ ...btn("#a5b4fc", "rgba(165,180,252,0.05)"), padding: 0, overflow: "hidden", aspectRatio: "1/1" }}
                    title={k}>
                    <img src={SELIM_ASSETS[k]} alt={k} loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>

              <div style={sectionLabel("")}>── Images Loaded: {totalAssets - missingImages.length}/{totalAssets} ──</div>
              {missingImages.length === 0
                ? <div style={{ color: "#86efac", fontSize: 10, marginBottom: 8 }}>✓ All loaded</div>
                : (
                  <div style={{ marginBottom: 8, maxHeight: 80, overflowY: "auto" }}>
                    {missingImages.map((f) => (
                      <div key={f} style={{ color: "#fca5a5", fontSize: 9, wordBreak: "break-all" }}>✗ {f}</div>
                    ))}
                  </div>
                )}

              <div style={sectionLabel("")}>── Missing Audio ({missingAudio.length}) ──</div>
              {missingAudio.length === 0
                ? <div style={{ color: "#86efac", fontSize: 10 }}>✓ None detected</div>
                : (
                  <div style={{ maxHeight: 120, overflowY: "auto" }}>
                    {missingAudio.slice(0, 20).map((f) => (
                      <div key={f} style={{ color: "#fca5a5", fontSize: 9, wordBreak: "break-all" }}>✗ {f}</div>
                    ))}
                    {missingAudio.length > 20 && (
                      <div style={{ color: "#64748b", fontSize: 9 }}>… +{missingAudio.length - 20} more</div>
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
