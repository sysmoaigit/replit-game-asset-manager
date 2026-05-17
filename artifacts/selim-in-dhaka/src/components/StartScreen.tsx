import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SelimAvatar from "./SelimAvatar";
import SceneArt from "./SceneArt";
import { INITIAL_STATS } from "../game/engine";
import { audioEngine } from "../game/audioEngine";
import { getTaglinesForLevel, getHumorLine } from "../game/humorContent";
import { tryUnlockEgg, loadUnlockedEggs, EGG_TOTAL } from "../game/easterEggs";
import { notifyEggUnlock } from "./EggUnlockToast";
import { getTodayModifier, hasPlayedToday, getDailyState } from "../lib/dailyChallenge";
import { loadEndingHistory } from "../lib/endingHistory";
import { ENDINGS } from "../game/endings";
import { loadProfile } from "../game/playerProfile";

interface StartScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
  onTutorial: () => void;
  onOpenAlbum?: () => void;
  onOpenStory?: () => void;
  onStartDaily?: () => void;
  onOpenJourney?: () => void;
  onOpenSettings?: () => void;
  hasSave: boolean;
  reducedMotion?: boolean;
}

/**
 * Layered parallax skyline backdrop. Three SVG layers (back/mid/front) drift
 * subtly to give the home screen a "live" cinematic feel without burning CPU.
 */
function ParallaxSkyline({ reducedMotion }: { reducedMotion: boolean }) {
  const drift = (range: number, dur: number) =>
    reducedMotion ? {} : { x: [0, -range, 0], transition: { duration: dur, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <div className="absolute inset-x-0 bottom-0 z-[2] pointer-events-none">
      {/* Back layer — distant towers, slowest drift */}
      <motion.svg
        viewBox="0 0 400 80"
        className="w-full block"
        style={{ position: "absolute", bottom: 60, opacity: 0.45 }}
        animate={drift(8, 32)}
      >
        {[10, 50, 95, 140, 195, 250, 300, 350].map((x, i) => (
          <rect key={i} x={x} y={30 + (i % 3) * 8} width={28 + (i % 4) * 4} height={50} fill="#0e0703" />
        ))}
      </motion.svg>

      {/* Mid layer — main skyline + windows */}
      <motion.svg
        viewBox="0 0 400 120"
        className="w-full block"
        style={{ marginBottom: -2 }}
        animate={drift(4, 22)}
      >
        {[20, 60, 100, 150, 200, 250, 310, 360].map((x, i) => (
          <circle key={i} cx={x} cy={8 + (i % 3) * 6} r={1} fill="#FFD700" opacity={0.6} />
        ))}
        <circle cx="370" cy="20" r="14" fill="#FFF8DC" opacity="0.9" />
        <circle cx="376" cy="16" r="10" fill="#2a1a0a" />
        <rect x="0" y="60" width="45" height="60" fill="#1a0f05" />
        <rect x="48" y="45" width="30" height="75" fill="#251508" />
        <rect x="81" y="70" width="25" height="50" fill="#1a0f05" />
        <rect x="109" y="40" width="50" height="80" fill="#2d1a08" />
        <rect x="162" y="55" width="35" height="65" fill="#1a0f05" />
        <rect x="200" y="30" width="55" height="90" fill="#251508" />
        <rect x="258" y="50" width="40" height="70" fill="#1a0f05" />
        <rect x="301" y="65" width="30" height="55" fill="#2d1a08" />
        <rect x="334" y="45" width="40" height="75" fill="#1a0f05" />
        <rect x="377" y="60" width="23" height="60" fill="#251508" />
        {[[5,65],[15,65],[5,78],[15,78],[55,50],[68,50],[55,62],[68,62],
          [115,46],[128,46],[140,46],[115,60],[128,60],[140,60],
          [205,36],[220,36],[235,36],[205,50],[220,50],[235,50],[205,64],[220,64],
          [263,56],[275,56],[263,68],[275,68],[308,70],[320,70]].map(([x,y],i) => (
          <motion.rect
            key={i} x={x} y={y} width="7" height="5" rx="1"
            fill="#FF9933"
            initial={{ opacity: 0.7 + (i%3)*0.1 }}
            animate={reducedMotion ? {} : { opacity: [0.55, 0.95, 0.55] }}
            transition={{ duration: 2.4 + (i % 5) * 0.6, repeat: Infinity, delay: (i % 7) * 0.2 }}
          />
        ))}
        <line x1="80" y1="110" x2="80" y2="100" stroke="#888" strokeWidth="1.5" />
        <circle cx="80" cy="99" r="3" fill="#FFD700" opacity="0.8" />
        <line x1="200" y1="110" x2="200" y2="100" stroke="#888" strokeWidth="1.5" />
        <circle cx="200" cy="99" r="3" fill="#FFD700" opacity="0.8" />
        <line x1="320" y1="110" x2="320" y2="100" stroke="#888" strokeWidth="1.5" />
        <circle cx="320" cy="99" r="3" fill="#FFD700" opacity="0.8" />
        <path d="M 0 85 Q 50 80 100 85 Q 150 90 200 85 Q 250 80 300 85 Q 350 90 400 85" stroke="#333" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M 0 92 Q 70 88 140 92 Q 210 96 280 92 Q 350 88 400 92" stroke="#333" strokeWidth="0.8" fill="none" opacity="0.4" />
      </motion.svg>

      {/* Front layer — rickshaw drifting across road */}
      <motion.div
        className="absolute"
        style={{ bottom: 6, left: 0, width: "100%", height: 30, pointerEvents: "none" }}
      >
        <motion.svg
          viewBox="0 0 60 30"
          width="60"
          height="30"
          style={{ position: "absolute", bottom: 0 }}
          initial={{ x: -80 }}
          animate={reducedMotion ? { x: 80 } : { x: ["-80px", "calc(100vw + 80px)"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          <ellipse cx="14" cy="22" rx="6" ry="3" fill="#222" />
          <ellipse cx="40" cy="22" rx="6" ry="3" fill="#222" />
          <rect x="8" y="6" width="36" height="14" rx="4" fill="#CC3300" />
          <polygon points="8,6 26,-2 44,6" fill="#CC3300" />
          <circle cx="26" cy="9" r="2.2" fill="#FFD700" opacity="0.8" />
        </motion.svg>
      </motion.div>
    </div>
  );
}

type Tile = {
  id: string;
  testId: string;
  label: string;
  hint?: string;
  icon: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "feature" | "ghost";
  badge?: string;
  disabled?: boolean;
  span?: 1 | 2;
};

function TileButton({ tile, reducedMotion }: { tile: Tile; reducedMotion: boolean }) {
  const variants: Record<Tile["variant"], React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #FF6B00 0%, #FFA500 100%)",
      color: "white",
      borderColor: "rgba(255,215,0,0.35)",
      boxShadow: "0 6px 18px rgba(255,107,0,0.30)",
    },
    secondary: {
      background: "rgba(255,255,255,0.10)",
      color: "#FFD700",
      borderColor: "rgba(255,215,0,0.35)",
    },
    feature: {
      background: "linear-gradient(135deg, rgba(168,85,247,0.22), rgba(124,58,237,0.16))",
      color: "#e9d5ff",
      borderColor: "rgba(168,85,247,0.45)",
    },
    ghost: {
      background: "rgba(255,255,255,0.06)",
      color: "#e5e7eb",
      borderColor: "rgba(255,255,255,0.10)",
    },
  };
  const v = variants[tile.variant];
  return (
    <motion.button
      data-testid={tile.testId}
      onClick={tile.onClick}
      disabled={tile.disabled}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="relative rounded-2xl border text-left overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        ...v,
        gridColumn: tile.span === 2 ? "span 2" : "span 1",
        padding: "10px 12px",
        fontFamily: "'Hind Siliguri', sans-serif",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        minHeight: tile.span === 2 ? 64 : 58,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xl leading-none" aria-hidden>{tile.icon}</div>
        {tile.badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/40 text-amber-200 border border-amber-300/30 whitespace-nowrap">
            {tile.badge}
          </span>
        )}
      </div>
      <div className="mt-1 text-[12.5px] font-bold leading-tight">{tile.label}</div>
      {tile.hint && (
        <div className="text-[10px] opacity-75 mt-0.5 leading-tight">{tile.hint}</div>
      )}
    </motion.button>
  );
}

export default function StartScreen({
  onNewGame, onContinue, onTutorial, onOpenAlbum, onOpenStory, onStartDaily,
  onOpenJourney, onOpenSettings, hasSave, reducedMotion = false,
}: StartScreenProps) {
  // Daily Challenge unlocks once the player has reached at least one ending.
  const dailyUnlocked = useMemo(() => Object.keys(loadEndingHistory()).length > 0, []);
  const dailyModifier = useMemo(() => getTodayModifier(), []);
  const dailyDone = useMemo(() => hasPlayedToday(), []);
  const dailyBest = useMemo(() => getDailyState().bestScore, []);
  const profile = useMemo(() => loadProfile(), []);

  // Aggregate journey stats for the small status strip — gives the player a
  // sense of progression the moment they open the app, like a real game home.
  const journey = useMemo(() => {
    const history = loadEndingHistory();
    const eggs = loadUnlockedEggs();
    const endingsUnlocked = Object.keys(history).filter((id) => ENDINGS.some((e) => e.id === id)).length;
    const totalRuns = Object.values(history).reduce((sum, e) => sum + (e?.count ?? 0), 0);
    return {
      endings: endingsUnlocked,
      endingsTotal: ENDINGS.length,
      eggs: eggs.size,
      eggsTotal: EGG_TOTAL,
      totalRuns,
      ngPlus: profile.ngPlusCount ?? 0,
    };
  }, [profile]);

  const taglines = useMemo(() => {
    const level = audioEngine.getSettings().humorLevel;
    const pool = getTaglinesForLevel(level);
    return pool.length > 0 ? pool : getTaglinesForLevel("mild");
  }, []);

  const [lineIndex, setLineIndex] = useState(0);
  const [tapToast, setTapToast] = useState<string | null>(null);
  const tapCountRef = useRef(0);
  const lastTapAtRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [taglines.length]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 2 && h < 5) notifyEggUnlock(tryUnlockEgg("play_at_3am"));
    else if (h >= 5 && h < 7) notifyEggUnlock(tryUnlockEgg("play_at_dawn"));
  }, []);

  const handleAvatarTap = () => {
    const now = performance.now();
    if (now - lastTapAtRef.current < 160) return;
    lastTapAtRef.current = now;
    tapCountRef.current += 1;
    const n = tapCountRef.current;
    audioEngine.playSfx("ui_click");
    if (n === 7) {
      const egg = tryUnlockEgg("tap_selim_7");
      notifyEggUnlock(egg);
      const line = getHumorLine("tap_selim", audioEngine.getSettings().humorLevel);
      setTapToast(egg ? egg.reveal : line?.text ?? null);
      audioEngine.playSfx("wow_meme");
    } else if (n === 30) {
      const egg = tryUnlockEgg("tap_selim_30");
      notifyEggUnlock(egg);
      setTapToast(egg ? egg.reveal : null);
      audioEngine.playSfx("vine_boom");
    } else if (n % 3 === 0 && n < 30) {
      const line = getHumorLine("tap_selim", audioEngine.getSettings().humorLevel);
      if (line) setTapToast(line.text);
      audioEngine.playSfx("bonk");
    }
  };

  useEffect(() => {
    if (!tapToast) return;
    const t = setTimeout(() => setTapToast(null), 2400);
    return () => clearTimeout(t);
  }, [tapToast]);

  // Build the tile menu. Continue gets pole position only when a save exists,
  // otherwise New Game takes the hero slot — matches AAA mobile-game UX.
  const tiles: Tile[] = useMemo(() => {
    const list: Tile[] = [];
    if (hasSave) {
      list.push({
        id: "continue", testId: "btn-continue", label: "চালিয়ে যাও", hint: "আগের সেভ থেকে",
        icon: "▶️", onClick: onContinue, variant: "primary", span: 2,
      });
      list.push({
        id: "new-game", testId: "btn-new-game", label: "নতুন খেলা", hint: "Day 1 থেকে শুরু",
        icon: "🚀", onClick: onNewGame, variant: "secondary",
      });
    } else {
      list.push({
        id: "new-game", testId: "btn-new-game", label: "নতুন খেলা শুরু করো", hint: "Selim-এর গল্প শুরু",
        icon: "🚀", onClick: onNewGame, variant: "primary", span: 2,
      });
      list.push({
        id: "continue", testId: "btn-continue", label: "চালিয়ে যাও", hint: "কোনো সেভ নেই",
        icon: "💾", onClick: onContinue, variant: "ghost", disabled: true,
      });
    }

    if (dailyUnlocked && onStartDaily) {
      list.push({
        id: "daily", testId: "btn-daily-challenge",
        label: dailyDone ? "Daily শেষ" : "Daily Challenge",
        hint: dailyModifier.name,
        icon: "🎯", onClick: onStartDaily, variant: "feature",
        badge: dailyBest > 0 ? `Best ${dailyBest}` : (dailyDone ? "✓" : "NEW"),
        disabled: dailyDone,
      });
    } else {
      list.push({
        id: "daily-locked", testId: "btn-daily-locked", label: "Daily Challenge",
        hint: "একটা ending unlock করো",
        icon: "🔒", onClick: () => audioEngine.playSfx("ui_error"),
        variant: "ghost", disabled: true,
      });
    }

    if (onOpenJourney) {
      list.push({
        id: "journey", testId: "btn-journey", label: "My Journey", hint: "Endings · Trophies",
        icon: "📊", onClick: onOpenJourney, variant: "secondary",
        badge: `${journey.endings}/${journey.endingsTotal}`,
      });
    }
    if (onOpenAlbum) {
      list.push({
        id: "album", testId: "btn-album", label: "Album", hint: "Selim-এর photo book",
        icon: "📓", onClick: onOpenAlbum, variant: "secondary",
      });
    }
    if (onOpenStory) {
      list.push({
        id: "story", testId: "btn-story-mode", label: "গল্প পড়ো", hint: "Story moments",
        icon: "📖", onClick: onOpenStory, variant: "feature",
      });
    }
    list.push({
      id: "tutorial", testId: "btn-tutorial", label: "How to play", hint: "কীভাবে খেলবে?",
      icon: "🎓", onClick: onTutorial, variant: "ghost",
    });
    if (onOpenSettings) {
      list.push({
        id: "settings", testId: "btn-settings-tile", label: "Settings", hint: "Audio · Humor",
        icon: "⚙️", onClick: onOpenSettings, variant: "ghost",
      });
    }
    return list;
  }, [hasSave, onContinue, onNewGame, dailyUnlocked, dailyDone, dailyModifier.name, dailyBest, onStartDaily, onOpenJourney, journey, onOpenAlbum, onOpenStory, onTutorial, onOpenSettings]);

  return (
    <div
      className="min-h-full w-full flex flex-col items-center relative overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0d0600 0%, #1a0f05 40%, #2d1a08 100%)",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        minHeight: "100dvh",
      }}
      data-testid="screen-start"
    >
      {/* Cinematic backdrop — softened so the title reads cleanly */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <SceneArt
          sceneKey="rooftopSunset"
          overlay="silent"
          height="100%"
          rounded={false}
          priority
          reducedMotion={reducedMotion}
          position="center 25%"
        />
      </div>
      {/* Vignette over backdrop for premium feel and legibility */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <ParallaxSkyline reducedMotion={reducedMotion} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-4">
        {/* Title — compact two-line stack */}
        <motion.div
          initial={reducedMotion ? {} : { y: -12, opacity: 0 }}
          animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-1"
        >
          <h1
            className="font-bold leading-none font-bn dhaka-title-gradient pb-0.5"
            style={{ fontSize: 30, letterSpacing: "-0.3px" }}
          >
            Selim in Dhaka
          </h1>
          <p
            className="text-[11px] mt-0.5 font-bold tracking-wide"
            style={{ color: "#FF69B4", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            Pinky Mission 💔
          </p>
        </motion.div>

        {/* Avatar — tap surface for the hidden "tap Selim" easter egg.
            Use md (180x250) so the home screen fits a single viewport. */}
        <motion.div
          initial={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={reducedMotion ? {} : { scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="my-1 relative"
          onClick={handleAvatarTap}
          role="button"
          aria-label="Tap Selim"
          style={{ cursor: "pointer" }}
        >
          {!reducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: "0 0 32px 6px rgba(255,107,0,0.3)", margin: -10 }}
              animate={{ opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <SelimAvatar stats={INITIAL_STATS} size="sm" reducedMotion={reducedMotion} />
        </motion.div>

        {/* Floating tap-toast surfaces the hidden quips and egg reveals. */}
        <AnimatePresence>
          {tapToast && (
            <motion.div
              key={tapToast}
              initial={reducedMotion ? {} : { opacity: 0, y: -8, scale: 0.95 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -8, scale: 0.95 }}
              className="text-xs text-center px-3 py-2 rounded-xl mb-2"
              style={{
                background: "rgba(255, 107, 0, 0.18)",
                border: "1px solid rgba(255, 215, 0, 0.4)",
                color: "#FFD700",
                fontFamily: "'Hind Siliguri', sans-serif",
                maxWidth: "92%",
              }}
            >
              {tapToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tile grid menu — AAA mobile game home */}
        <motion.div
          initial={reducedMotion ? {} : { y: 16, opacity: 0 }}
          animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full grid grid-cols-2 gap-1.5 mb-2"
          data-testid="tile-grid"
        >
          {tiles.map((t) => (
            <TileButton key={t.id} tile={t} reducedMotion={reducedMotion} />
          ))}
        </motion.div>

        {/* Rotating one-liner — compact, no dead space below */}
        <div className="h-7 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={lineIndex}
              initial={reducedMotion ? {} : { opacity: 0, y: 6 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -6 }}
              className="text-[11px] text-center px-4 leading-tight"
              style={{ color: "#FF9933", fontFamily: "'Hind Siliguri', sans-serif", fontStyle: "italic" }}
            >
              "{taglines[lineIndex % taglines.length]?.text}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
