import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameState, Achievement, GameScreen as GameScreenType, Choice } from "./types";
import {
  INITIAL_STATS, INITIAL_FLAGS, INITIAL_ACHIEVEMENTS,
  applyEffectsToStats, applyFlagUpdate, selectRecoveryCard,
  checkDangerConditions, evaluateEnding, checkAchievements,
  saveGame, loadGame, hasSave, clearSave, detectFriendshipMilestone,
} from "./game/engine";
import { ALL_CARDS as BASE_CARDS } from "./game/cards";
import { RANDOM_EVENT_CARDS } from "./game/randomEvents";
import { directorSelectCard, clearArcHistory, clearPromiseMemory, notePromiseMade } from "./game/eventDirector";
import { buildDayForecast } from "./game/continuity";
import { GOOD_ENDING_IDS as GOOD_ENDINGS } from "./game/endings";
import EventRecap from "./components/EventRecap";

const ALL_CARDS = [...BASE_CARDS, ...RANDOM_EVENT_CARDS];
import { sounds } from "./audio/sounds";
import { audioEngine } from "./game/audioEngine";
import { getLocationAmbience, MUSIC_FOR_CARD_CATEGORY } from "./game/soundEvents";
import type { VoiceLine, VoiceContext } from "./game/voiceLines";
import { tryUnlockEgg } from "./game/easterEggs";

import StartScreen from "./components/StartScreen";
import Tutorial from "./components/Tutorial";
import GameScreen from "./components/GameScreen";
import DaySummary from "./components/DaySummary";
import RecoveryMode from "./components/RecoveryMode";
import EndingScreen from "./components/EndingScreen";
import Menu from "./components/Menu";
import QAPanel from "./components/QAPanel";
import FriendshipMilestone from "./components/FriendshipMilestone";
import { speakSelim } from "./lib/selimVoice";
import VoiceSubtitle from "./components/VoiceSubtitle";
import SoundSettings from "./components/SoundSettings";
import AudioDebugPanel from "./components/AudioDebugPanel";
import SelimAlbum from "./components/SelimAlbum";
import SelimChatPopup from "./components/SelimChatPopup";
import MoneyHypocrisyToast from "./components/MoneyHypocrisyToast";
import SelimExcuseToast from "./components/SelimExcuseToast";
import TobaTimerHUD from "./components/TobaTimerHUD";
import JourneyScreen from "./components/JourneyScreen";
import SceneUnlockToast from "./components/SceneUnlockToast";
import EggUnlockToast, { notifyEggUnlock } from "./components/EggUnlockToast";
import { recordEnding } from "./lib/endingHistory";
import MemoryConsent from "./components/MemoryConsent";
import PlayerProfileSetup from "./components/PlayerProfileSetup";
import SelimChatPanel from "./components/SelimChatPanel";
import FloatingMessageIcon, { deriveFabState } from "./components/FloatingMessageIcon";
import { loadRevealedSecrets, SECRETS } from "./game/selimSecrets";
import type { GameState as _GS } from "./types";

// FAB wrapper — memoizes the secret-availability check so we don't hit
// localStorage on every parent re-render, and hides the FAB whenever a
// full-screen overlay is open.
function FabMount({
  gs, showChatPanel, showAlbum, showStoryMode, rm, onOpen,
}: {
  gs: _GS;
  showChatPanel: boolean;
  showAlbum: boolean;
  showStoryMode: boolean;
  rm: boolean;
  onOpen: () => void;
}) {
  const allowedScreen = gs.screen === "game" || gs.screen === "daysum"
    || gs.screen === "recovery" || gs.screen === "menu";
  const overlayOpen = showChatPanel || showAlbum || showStoryMode;
  const hasUnseenSecret = useMemo(() => {
    if (!allowedScreen || overlayOpen) return false;
    const revealed = loadRevealedSecrets();
    return SECRETS.some(
      (s) => gs.stats.friendTrust >= s.trustRequired && !revealed.has(s.id),
    );
    // Re-check when chat closes or trust crosses thresholds.
  }, [allowedScreen, overlayOpen, gs.stats.friendTrust, showChatPanel]);

  if (!allowedScreen || overlayOpen) return null;

  return (
    <FloatingMessageIcon
      state={deriveFabState(gs.stats, {
        unreadCount: 0,
        hasUnseenSecret,
        fakeIdRisk: gs.stats.romanticFever > 70 || gs.stats.emotionalDelusion > 60,
      })}
      onClick={onOpen}
      reducedMotion={rm}
    />
  );
}
import Onboarding from "./components/Onboarding";
import Coachmark from "./components/Coachmark";
import ShareCard from "./components/ShareCard";
import FriendshipRecap from "./components/FriendshipRecap";
import { buildFriendshipRecap } from "./lib/friendshipRecap";
import { tryShowHint, type HintDef } from "./lib/hintRegistry";
import { ENDINGS } from "./game/endings";
import {
  getTodayModifier, hasPlayedToday, recordDailyRun, computeDailyScore,
  markDailyAttempt, dailySeed, type DailyModifier, getDailyState,
} from "./lib/dailyChallenge";
import { setSeededRng, clearSeededRng } from "./lib/rng";

import { PlayerProfile } from "./ai/types";
import type { SelimMood } from "./ai/types";
import { loadProfile, saveProfile, defaultProfile } from "./game/playerProfile";
import { loadStore, saveStore, addDiaryEntry } from "./ai/memoryStore";
import type { SelimMemoryStore } from "./ai/types";
import { loadDialogueState, saveDialogueState, defaultDialogueState } from "./game/dialogueState";
import type { DialogueState } from "./game/dialogueState";
import type { BrainMode } from "./ai/selimBrain";
import { UNLOCK_EVENTS } from "./game/friendshipEngine";
import { MOMENT_BY_SCENE, type SelimMoment } from "./game/moments";
import { isMomentSeen, clearStoryProgress } from "./game/storyProgress";
import { getSceneImageForEvent, getSceneImageForLocation, type SceneKey } from "./game/assets";
import StoryBeatModal from "./components/StoryBeatModal";
import SelimStoryMode from "./components/SelimStoryMode";
import { generateDiaryEntry } from "./game/reflectionEngine";

function buildInitialState(): GameState {
  const base: GameState = {
    screen: "start",
    day: 1,
    phaseIndex: 0,
    stats: INITIAL_STATS,
    flags: INITIAL_FLAGS,
    achievements: INITIAL_ACHIEVEMENTS,
    recentCards: [],
    currentCard: null,
    lastResultText: null,
    recoveryTurns: 0,
    endingId: null,
    isReducedMotion: false,
    isSoundEnabled: true,
  };
  const firstCard = directorSelectCard(base, ALL_CARDS);
  return { ...base, currentCard: firstCard };
}

export default function App() {
  const [gs, setGs] = useState<GameState>(buildInitialState);
  const [prevStats, setPrevStats] = useState<GameState["stats"]>(INITIAL_STATS);
  const [dayStartStats, setDayStartStats] = useState<GameState["stats"]>(INITIAL_STATS);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [hasSaveState, setHasSaveState] = useState(hasSave);
  const [menuReturnScreen, setMenuReturnScreen] = useState<GameScreenType>("game");
  const [friendshipMilestone, setFriendshipMilestone] = useState<number | null>(null);
  const [friendshipUnlock, setFriendshipUnlock] = useState<{ threshold: number; dialogue: string } | null>(null);
  const [friendshipUnlockQueue, setFriendshipUnlockQueue] = useState<Array<{ threshold: number; dialogue: string }>>([]);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [showStoryMode, setShowStoryMode] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [pendingStoryBeat, setPendingStoryBeat] = useState<SelimMoment | null>(null);

  // AI Friendship System state
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(loadProfile);
  const [memoryStore, setMemoryStore] = useState<SelimMemoryStore>(loadStore);
  const [dialogueState, setDialogueState] = useState<DialogueState>(loadDialogueState);
  const [showConsentScreen, setShowConsentScreen] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingNickname, setPendingNickname] = useState<string>("");
  const [activeHint, setActiveHint] = useState<HintDef | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showFriendshipRecap, setShowFriendshipRecap] = useState(false);
  const [dailyMode, setDailyMode] = useState<DailyModifier | null>(null);
  const [dailyScoreFinal, setDailyScoreFinal] = useState<number | null>(null);
  // brainMode is "ai_enhanced" only when user has granted LLM consent AND profile is set up
  const brainMode: BrainMode = (playerProfile.llmConsentEnabled && playerProfile.setupComplete) ? "ai_enhanced" : "local";

  // Sync audioEngine.reducedMotion when toggled
  useEffect(() => {
    audioEngine.updateSettings({ reducedMotion: gs.isReducedMotion });
  }, [gs.isReducedMotion]);

  // Keep a ref to the latest game state so useCallback handlers (which capture
  // their dep array once) can build a fresh VoiceContext at call time without
  // becoming stale. Used by voiceCtx() below for context-aware line selection.
  const gsRef = useRef(gs);
  useEffect(() => { gsRef.current = gs; }, [gs]);
  const voiceCtx = useCallback((): VoiceContext => {
    const cur = gsRef.current;
    return {
      stats: cur.stats,
      location: cur.currentCard?.location,
      cardId: cur.currentCard?.id,
    };
  }, []);

  useEffect(() => {
    if (!newAchievement) return;
    sounds.achievement();
    audioEngine.playSfx("achievement_unlock");
    audioEngine.playVoiceForTrigger("achievement", "selim", voiceCtx());
    setTimeout(() => audioEngine.playSfx("air_horn"), 280);
    // First-achievement coachmark
    setTimeout(() => {
      const h = tryShowHint("first_achievement");
      if (h) setActiveHint(h);
    }, 600);
    const t = setTimeout(() => setNewAchievement(null), 3200);
    return () => clearTimeout(t);
  }, [newAchievement]);

  // First-card on entering game — also fire ending-choice hint on the final card.
  useEffect(() => {
    if (gs.screen !== "game" || !gs.currentCard) return;
    if (gs.day === 15 && gs.phaseIndex === 3) {
      const h = tryShowHint("first_ending_choice");
      if (h) { setActiveHint(h); return; }
    }
  }, [gs.screen, gs.day, gs.phaseIndex, gs.currentCard?.id]);

  // Sync sound enabled flag
  useEffect(() => {
    sounds.setEnabled(gs.isSoundEnabled);
    audioEngine.updateSettings({ masterEnabled: gs.isSoundEnabled });
  }, [gs.isSoundEnabled]);

  // Mood-aware music picker — Selim's actual emotional state drives the track,
  // not just the card category. Each track id maps to a raga-flavored
  // procedural bed in sounds.startMusic() that picks a fresh melodic phrase
  // and key on every play, so the same mood never sounds identical twice.
  // Drop your own .mp3 files into public/audio/music/<trackId>.mp3 and they
  // override the procedural version automatically.
  const musicTrack = useMemo<string>(() => {
    if (gs.screen === "start" || gs.screen === "tutorial") {
      // Rotate the menu bed across "intro", "menu", "selim_theme" so returning
      // players get a fresh tune every time they hit the title screen.
      const introVariants = ["intro", "menu", "selim_theme", "menu", "intro"];
      const seed = (Date.now() / 1000 / 30) | 0; // changes every ~30s
      return introVariants[seed % introVariants.length];
    }
    if (gs.screen === "recovery") return "recovery";
    if (gs.screen === "ending" && gs.endingId) {
      // Special ending tracks for the most flavorful endings
      if (gs.endingId === "bogura_boss" || gs.endingId === "biryani_king") return "bogura_boss";
      if (gs.endingId === "rock_bottom" || gs.endingId === "silent_selim") return "rock_bottom";
      if (gs.endingId === "pinky_endgame" || gs.endingId === "eternal_simp") return "pinky_anthem";
      return GOOD_ENDINGS.has(gs.endingId) ? "ending_good" : "ending_bad";
    }
    if (gs.screen === "game") {
      const s = gs.stats;
      const cat = gs.currentCard?.category;
      // Vibe-based routing — Selim's mood wins over the card's category
      if (s.addiction > 65 && s.selfRespect < 30) return "rock_bottom";
      if (s.selfRespect >= 75 && s.careerProgress >= 60) return "chad_mode";
      if (s.pinkyHope >= 75 && s.emotionalDelusion >= 65) return "pinky_anthem";
      if (s.romanticFever >= 70 || cat === "love") return "pinky_simp";
      if (cat === "addiction" || s.mood < 25) return "heartbreak";
      if (cat === "career" && s.careerProgress > 55) return "bogura_boss";
      if (gs.currentCard?.phase === "Night") return "night_dhaka";
      const cardTrack = cat ? MUSIC_FOR_CARD_CATEGORY[cat] : null;
      return cardTrack ?? "day_dhaka";
    }
    return "menu";
  }, [
    gs.screen, gs.endingId, gs.currentCard?.id, gs.currentCard?.category,
    gs.currentCard?.phase, gs.stats.addiction, gs.stats.selfRespect,
    gs.stats.careerProgress, gs.stats.pinkyHope, gs.stats.emotionalDelusion,
    gs.stats.romanticFever, gs.stats.mood,
  ]);

  useEffect(() => {
    if (!gs.isSoundEnabled) {
      sounds.stopMusic();
      audioEngine.stopMusic();
      return;
    }
    sounds.startMusic(musicTrack);
    audioEngine.playMusic(musicTrack);
  }, [musicTrack, gs.isSoundEnabled]);

  // Non-Selim speaker voice
  useEffect(() => {
    if (!gs.isSoundEnabled || gs.screen !== "game" || !gs.currentCard?.speaker) return;
    const speakerMap: Record<string, VoiceLine["speaker"]> = {
      "পিঙ্কি": "pinky",
      "Pinky": "pinky",
      "রাফিক": "rafiq",
      "Rafiq": "rafiq",
      "নিলা": "nila",
      "Nila": "nila",
      "চা মামা": "cha-mama",
      "কুদ্দুস ভাই": "kuddus-bhai",
    };
    const engineSpeaker = speakerMap[gs.currentCard.speaker];
    if (!engineSpeaker) return;
    const triggerMap: Record<VoiceLine["speaker"], string> = {
      pinky: "pinky_message",
      rafiq: "ask_advice",
      nila: "trust_up",
      "cha-mama": "food_biryani",
      "kuddus-bhai": "ask_advice",
      selim: "game_start",
    };
    const t = setTimeout(() => {
      audioEngine.playVoiceForTrigger(triggerMap[engineSpeaker] ?? "ask_advice", engineSpeaker, voiceCtx());
    }, 350);
    return () => clearTimeout(t);
  }, [gs.currentCard?.id, gs.screen, gs.isSoundEnabled, gs.currentCard?.speaker]);

  // Location-based ambience
  useEffect(() => {
    if (!gs.isSoundEnabled || gs.screen !== "game" || !gs.currentCard) {
      audioEngine.stopAmbience();
      return;
    }
    const loc = gs.currentCard.location;
    const phase = gs.currentCard.phase;
    const ambienceId = getLocationAmbience(loc);
    if (ambienceId) {
      audioEngine.playAmbience(ambienceId);
    } else {
      audioEngine.stopAmbience();
    }
    const t = setTimeout(() => {
      if (loc.includes("রাস্তা") || loc.includes("জ্যাম") || loc.includes("মতিঝিল")) sounds.carHorn();
      else if (loc.includes("রিকশা") || loc.includes("CNG")) sounds.rickshawBell();
      else if (loc.includes("চা") || loc.includes("ক্যাফে") || loc.includes("Gloria")) sounds.teaStall();
      else if (loc.includes("ধানমন্ডি") && phase === "Evening") sounds.azan();
      else if (loc.includes("ছাদ") && phase === "Night") sounds.azan();
    }, 350);
    return () => clearTimeout(t);
  }, [gs.currentCard?.id, gs.screen, gs.isSoundEnabled, gs.currentCard]);

  const triggerAchievement = (state: GameState) => {
    const { achievements, newIds } = checkAchievements(state);
    if (newIds.length > 0) {
      const unlocked = achievements.find((a) => a.id === newIds[0]);
      if (unlocked) setNewAchievement(unlocked);
    }
    return achievements;
  };

  // ── NEW GAME ─────────────────────────────────────────────────────────────────
  const handleNewGame = useCallback(() => {
    sounds.unlock();
    audioEngine.unlock();
    sounds.cardFlip();
    audioEngine.playSfx("card_flip");
    audioEngine.playVoiceForTrigger("game_start", "selim", voiceCtx());
    clearSave();
    clearArcHistory();
    clearPromiseMemory();
    clearStoryProgress();
    setHasSaveState(false);
    setDailyMode(null);
    setDailyScoreFinal(null);
    clearSeededRng();
    setPendingStoryBeat(null);
    const fresh = buildInitialState();
    setGs({ ...fresh, screen: "tutorial" });
    setDayStartStats(INITIAL_STATS);
    setPrevStats(INITIAL_STATS);
    setNewAchievement(null);

    // First-run flow: Onboarding → MemoryConsent → ProfileSetup
    if (!playerProfile.onboardingSeen) {
      setShowOnboarding(true);
    } else if (!playerProfile.firstRunSeen) {
      setShowConsentScreen(true);
    }
  }, [playerProfile.firstRunSeen, playerProfile.onboardingSeen]);

  // ── NEW GAME PLUS ────────────────────────────────────────────────────────────
  // Preserves album / easter eggs / ending history (already persisted in
  // localStorage), bumps NG+ counter on the profile, and resets the run.
  const handleNewGamePlus = useCallback(() => {
    const updated: PlayerProfile = { ...playerProfile, ngPlusCount: playerProfile.ngPlusCount + 1 };
    setPlayerProfile(updated);
    saveProfile(updated);
    sounds.unlock();
    audioEngine.unlock();
    sounds.cardFlip();
    audioEngine.playSfx("card_flip");
    clearSave();
    clearArcHistory();
    clearPromiseMemory();
    setHasSaveState(false);
    setDailyMode(null);
    setDailyScoreFinal(null);
    clearSeededRng();
    const fresh = buildInitialState();
    // Skip onboarding/tutorial — go straight to game.
    setGs({ ...fresh, screen: "game" });
    setDayStartStats(INITIAL_STATS);
    setPrevStats(INITIAL_STATS);
    setNewAchievement(null);
  }, [playerProfile]);

  // ── DAILY CHALLENGE ──────────────────────────────────────────────────────────
  const handleStartDaily = useCallback(() => {
    if (hasPlayedToday()) return;
    const modifier = getTodayModifier();
    // Strict one-attempt gate: lock the day immediately on start so the player
    // can't restart partway through to fish for a better seed.
    markDailyAttempt();
    // Seed the global RNG from today's date so card order / weighted picks are
    // deterministic for everyone playing on the same day.
    setSeededRng(dailySeed());
    setDailyMode(modifier);
    setDailyScoreFinal(null);
    sounds.unlock();
    audioEngine.unlock();
    audioEngine.playSfx("card_flip");
    clearSave();
    clearArcHistory();
    clearPromiseMemory();
    setHasSaveState(false);
    const fresh = buildInitialState();
    const tweakedStats = applyEffectsToStats(fresh.stats, modifier.initialStatDelta as Partial<GameState["stats"]>);
    const startState: GameState = { ...fresh, stats: tweakedStats, screen: "game" };
    const firstCard = directorSelectCard(startState, ALL_CARDS);
    setGs({ ...startState, currentCard: firstCard });
    setDayStartStats(tweakedStats);
    setPrevStats(tweakedStats);
    setNewAchievement(null);
  }, []);

  // ── CONTINUE ─────────────────────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    audioEngine.unlock();
    const saved = loadGame();
    if (saved) {
      setGs({ ...saved, screen: "game" });
      setDayStartStats(saved.stats);
      setPrevStats(saved.stats);
    }
  }, []);

  // ── START GAME FROM TUTORIAL ──────────────────────────────────────────────────
  const handleStartGame = useCallback(() => {
    setGs((s) => {
      const card = directorSelectCard(s, ALL_CARDS);
      return { ...s, screen: "game", currentCard: card };
    });
  }, []);

  // First-card coachmark when player begins playing for the first time.
  useEffect(() => {
    if (gs.screen !== "game" || !gs.currentCard) return;
    const hint = tryShowHint("first_card");
    if (hint) setActiveHint(hint);
    // We only want to attempt once per screen entry — registry guards rest.
  }, [gs.screen]);

  // Story Beat trigger: fire cinematic the FIRST TIME a photo scene appears
  // during active gameplay. Uses same sceneKey resolution as GameScreen.tsx.
  useEffect(() => {
    if (gs.screen !== "game" || !gs.currentCard || pendingStoryBeat) return;
    const card = gs.currentCard;
    const resolvedKey: SceneKey =
      (card.visual?.sceneKey as SceneKey | undefined) ??
      getSceneImageForEvent(card.category) ??
      getSceneImageForLocation(card.location) ??
      "rooftopSunset";
    const moment = MOMENT_BY_SCENE[resolvedKey];
    if (moment && !isMomentSeen(moment.id)) {
      setPendingStoryBeat(moment);
    }
  }, [gs.currentCard?.id, gs.screen]);

  // ── PLAYER MAKES A CHOICE ─────────────────────────────────────────────────────
  const handleChoice = useCallback((_choice: Choice, reaction: import("./types").SelimReaction) => {
    sounds.choiceTap();
    // Contextual hint triggers based on outcome of this choice.
    const moneyEffect = reaction.appliedEffects.money ?? 0;
    if (moneyEffect <= -100) {
      setTimeout(() => {
        const h = tryShowHint("first_money_loss");
        if (h) setActiveHint(h);
      }, 600);
    }
    if (reaction.subKind === "promise_made") {
      setTimeout(() => {
        const h = tryShowHint("first_promise");
        if (h) setActiveHint(h);
      }, 600);
    }
    const moodEffect = reaction.appliedEffects.mood ?? 0;
    const energyEffect = reaction.appliedEffects.energy ?? 0;
    if (moodEffect <= -10 || energyEffect <= -15) {
      setTimeout(() => {
        const h = tryShowHint("first_stat_drop");
        if (h) setActiveHint(h);
      }, 600);
    }
    if (reaction.excuse && reaction.excuse.trim() !== "" && reaction.excuse.trim() !== "...") {
      setTimeout(() => { try { speakSelim(reaction.excuse!); } catch { /* ignore */ } }, 350);
    }
    audioEngine.playSfx("ui_click");

    if (reaction.kind === "obey") {
      audioEngine.playVoiceForTrigger("obey", "selim", voiceCtx());
    } else if (reaction.kind === "half") {
      audioEngine.playVoiceForTrigger("half_obey", "selim", voiceCtx());
    } else if (reaction.kind === "override") {
      audioEngine.playSfx("emotional_override_alarm");
      audioEngine.playVoiceForTrigger("override", "selim", voiceCtx());
      setTimeout(() => audioEngine.playSfx("vine_boom"), 120);
      setTimeout(() => audioEngine.playSfx("bonk"), 480);
    }

    const moneyDelta = reaction.appliedEffects.money ?? 0;
    if (moneyDelta >= 500) {
      setTimeout(() => { sounds.coinGain(); audioEngine.playSfx("coin_gain"); }, 120);
      // Big payday → air horn celebration on top of the coin chime.
      if (moneyDelta >= 1000) setTimeout(() => audioEngine.playSfx("air_horn"), 320);
    } else if (moneyDelta <= -500) {
      setTimeout(() => { sounds.coinLoss(); audioEngine.playSfx("coin_loss"); }, 120);
      // Heavy loss → "nope" buzzer.
      if (moneyDelta <= -1000) setTimeout(() => audioEngine.playSfx("nope"), 320);
    }

    const moodDelta = reaction.appliedEffects.mood ?? 0;
    if (moodDelta <= -15) {
      setTimeout(() => { sounds.heartbreak(); audioEngine.playSfx("heartbreak"); audioEngine.playVoiceForTrigger("heartbreak", "selim", voiceCtx()); }, 200);
      // Severe mood drop → sad violin tail for full despair vibe.
      if (moodDelta <= -25) setTimeout(() => audioEngine.playSfx("sad_violin"), 600);
    }
    if (reaction.kind === "override") {
      setTimeout(() => sounds.heartbreak(), 250);
    }

    const trustDelta = reaction.appliedEffects.friendTrust ?? 0;
    if (trustDelta >= 4) {
      setTimeout(() => { audioEngine.playSfx("stat_up"); audioEngine.playVoiceForTrigger("trust_up", "selim", voiceCtx()); }, 300);
    } else if (trustDelta <= -4) {
      setTimeout(() => { audioEngine.playSfx("stat_down"); audioEngine.playVoiceForTrigger("trust_down", "selim", voiceCtx()); }, 300);
    }

    if (reaction.subKind === "promise_made") {
      setTimeout(() => audioEngine.playSfx("promise_made"), 400);
      setTimeout(() => audioEngine.playVoiceForTrigger("promise_made", "selim", voiceCtx()), 600);
    }
    if (reaction.subKind === "promise_broken") {
      setTimeout(() => audioEngine.playSfx("promise_broken"), 400);
      setTimeout(() => audioEngine.playVoiceForTrigger("promise_broken", "selim", voiceCtx()), 600);
      // "Bruh" stinger — Selim broke his word, mock the cringe.
      setTimeout(() => audioEngine.playSfx("bruh"), 900);
    }
    if (reaction.subKind === "best_friend") {
      setTimeout(() => { audioEngine.playSfx("best_friend_chime"); audioEngine.playVoiceForTrigger("best_friend", "selim", voiceCtx()); }, 400);
      // Tada micro-fanfare to celebrate the milestone.
      setTimeout(() => audioEngine.playSfx("tada"), 800);
    }
    if (reaction.subKind === "silent") {
      setTimeout(() => audioEngine.playVoiceForTrigger("silent", "selim", voiceCtx()), 400);
    }
    if (reaction.subKind === "defensive") {
      setTimeout(() => audioEngine.playVoiceForTrigger("anger", "selim", voiceCtx()), 400);
    }

    setGs((s) => {
      const newStats = applyEffectsToStats(s.stats, reaction.appliedEffects);
      let newFlags = reaction.appliedFlagUpdate ? applyFlagUpdate(s.flags, reaction.appliedFlagUpdate) : s.flags;
      if (reaction.subKind === "promise_broken" || reaction.subKind === "relapse") {
        newFlags = { ...newFlags, promiseModeTurnsLeft: 0 };
      }
      // If a fresh promise was started this turn, remember the turn for the director
      if (newFlags.promiseModeTurnsLeft > s.flags.promiseModeTurnsLeft) {
        notePromiseMade(s.day, s.phaseIndex);
      }

      const { moodSpiralTemptation } = checkDangerConditions({ ...s, stats: newStats });
      const finalStats = moodSpiralTemptation > 0
        ? { ...newStats, temptation: Math.min(100, newStats.temptation + moodSpiralTemptation) }
        : newStats;

      const milestone = detectFriendshipMilestone(s.stats.friendTrust, finalStats.friendTrust, newFlags.friendshipMilestonesShown);
      const milestonedFlags = milestone != null
        ? { ...newFlags, friendshipMilestonesShown: [...newFlags.friendshipMilestonesShown, milestone] }
        : newFlags;
      if (milestone != null) {
        setFriendshipMilestone(milestone);
      }
      const updated: GameState = { ...s, stats: finalStats, flags: milestonedFlags, lastResultText: reaction.outcomeText };
      const achievements = triggerAchievement(updated);
      setPrevStats(s.stats);
      return { ...updated, achievements };
    });
  }, []);

  // ── ADVANCE TO NEXT CARD/PHASE ────────────────────────────────────────────────
  const handleNextCard = useCallback(() => {
    setGs((s) => {
      const { triggerRecovery } = checkDangerConditions(s);

      if (triggerRecovery && !s.flags.recoveryTriggered) {
        sounds.recoveryStart();
        audioEngine.playSfx("recovery_start");
        audioEngine.playVoiceForTrigger("recovery", "selim", voiceCtx());
        setTimeout(() => {
          const h = tryShowHint("first_recovery");
          if (h) setActiveHint(h);
        }, 800);
        const recCard = selectRecoveryCard(ALL_CARDS, s.recentCards);
        return {
          ...s,
          screen: "recovery" as GameScreenType,
          flags: { ...s.flags, recoveryTriggered: true },
          currentCard: recCard,
          recoveryTurns: 0,
          recentCards: [...s.recentCards.slice(-8), recCard.id],
        };
      }

      const nextPhase = s.phaseIndex + 1;
      if (nextPhase >= 4) {
        sounds.daySummary();
        audioEngine.playSfx("day_summary");
        audioEngine.playVoiceForTrigger("day_end", "selim", voiceCtx());
        // Stat-extreme easter eggs evaluated at day-end snapshot.
        try {
          const st = s.stats;
          if (st.money < 100 && st.mood < 25) notifyEggUnlock(tryUnlockEgg("broke_and_lonely"));
          if (st.money > 800 && st.mood < 30) notifyEggUnlock(tryUnlockEgg("rich_and_sad"));
          if (st.pinkyHappiness >= 95) notifyEggUnlock(tryUnlockEgg("perfect_pinky"));
          if (audioEngine.getSettings().accentMode === "standard") notifyEggUnlock(tryUnlockEgg("bogura_master"));
        } catch { /* eggs are best-effort */ }
        return { ...s, screen: "daysum" as GameScreenType, phaseIndex: 3 };
      }

      const newRecent = s.currentCard
        ? [...s.recentCards.slice(-8), s.currentCard.id]
        : s.recentCards;
      const tickedFlags = s.flags.promiseModeTurnsLeft > 0
        ? { ...s.flags, promiseModeTurnsLeft: s.flags.promiseModeTurnsLeft - 1 }
        : s.flags;
      const nextState = { ...s, phaseIndex: nextPhase, recentCards: newRecent, flags: tickedFlags };
      const nextCard = directorSelectCard(nextState, ALL_CARDS);
      sounds.cardFlip();
      audioEngine.playSfx("card_flip");
      if (nextCard.category === "love") {
        setTimeout(() => { sounds.loveChime(); audioEngine.playSfx("love_chime"); audioEngine.playVoiceForTrigger("pinky_message", "selim", voiceCtx()); }, 200);
        // Pinky's "DM" landed — Discord-style ping right after the love chime.
        setTimeout(() => audioEngine.playSfx("discord_ping"), 520);
      }
      if (nextCard.category === "addiction") {
        setTimeout(() => audioEngine.playVoiceForTrigger("override", "selim", voiceCtx()), 400);
      }
      if (nextCard.category === "money") {
        setTimeout(() => { audioEngine.playSfx("coin_loss"); audioEngine.playVoiceForTrigger("money_ask", "selim", voiceCtx()); }, 200);
      }
      if (nextCard.category === "relationship") {
        setTimeout(() => audioEngine.playVoiceForTrigger("apology", "selim", voiceCtx()), 300);
      }
      return { ...nextState, currentCard: nextCard };
    });
  }, []);

  // ── RECOVERY CHOICE ───────────────────────────────────────────────────────────
  const handleRecoveryChoice = useCallback((choice: Choice) => {
    setGs((s) => {
      const newStats = applyEffectsToStats(s.stats, choice.effects);
      const newFlags = choice.flagUpdate ? applyFlagUpdate(s.flags, choice.flagUpdate) : s.flags;
      const nextTurns = s.recoveryTurns + 1;

      if (nextTurns >= 5) {
        sounds.achievement();
        audioEngine.playSfx("achievement_unlock");
        audioEngine.playVoiceForTrigger("recovery", "selim", voiceCtx());
        const bonusStats = applyEffectsToStats(newStats, { health: 20, mood: 10, addiction: -20 });
        const finalFlags = { ...newFlags, recoverySuccess: true };
        const bonusState: GameState = { ...s, stats: bonusStats, flags: finalFlags, recoveryTurns: nextTurns };
        const achievements = triggerAchievement(bonusState);
        const nextCard = directorSelectCard({ ...bonusState, screen: "game" as GameScreenType }, ALL_CARDS);
        setPrevStats(s.stats);
        return { ...bonusState, achievements, screen: "game" as GameScreenType, currentCard: nextCard };
      }

      const newRecent = s.currentCard
        ? [...s.recentCards.slice(-8), s.currentCard.id]
        : s.recentCards;
      const nextRecCard = selectRecoveryCard(ALL_CARDS, newRecent);
      setPrevStats(s.stats);
      return { ...s, stats: newStats, flags: newFlags, recoveryTurns: nextTurns, recentCards: newRecent, currentCard: nextRecCard };
    });
  }, []);

  // ── NEXT DAY ─────────────────────────────────────────────────────────────────
  const handleNextDay = useCallback(() => {
    setGs((s) => {
      const nextDay = s.day + 1;

      if (nextDay > 15) {
        const endingId = evaluateEnding(s);
        const isGood = endingId ? GOOD_ENDINGS.has(endingId) : false;
        setTimeout(() => {
          if (isGood) {
            sounds.endingVictory();
            audioEngine.playSfx("ending_victory");
            audioEngine.playVoiceForTrigger("ending_good", "selim", voiceCtx());
          } else {
            sounds.endingDefeat();
            audioEngine.playSfx("ending_defeat");
            audioEngine.playVoiceForTrigger("ending_bad", "selim", voiceCtx());
          }
        }, 300);
        if (endingId) {
          try { recordEnding(endingId); } catch { /* ignore */ }
          // First-ending coachmark — surfaces share-card + daily challenge cue.
          setTimeout(() => {
            const hint = tryShowHint("first_ending");
            if (hint) setActiveHint(hint);
          }, 1200);
        }
        // Record daily challenge result if this was a daily run.
        if (dailyMode && endingId) {
          try {
            const score = computeDailyScore(s.stats);
            recordDailyRun(endingId, score);
            setDailyScoreFinal(score);
          } catch { /* ignore */ }
        }
        return { ...s, screen: "ending" as GameScreenType, endingId };
      }

      const baseFlags = s.stats.money >= 0
        ? { ...s.flags, daysWithoutDebt: s.flags.daysWithoutDebt + 1 }
        : { ...s.flags };
      const brokeAPromiseToday = s.flags.brokenPromiseCount > s.flags.lastBrokenPromiseCount;
      const newFlags = {
        ...baseFlags,
        toubaStreakDays: brokeAPromiseToday ? 0 : s.flags.toubaStreakDays + 1,
        lastBrokenPromiseCount: s.flags.brokenPromiseCount,
      };

      const nextState: GameState = { ...s, day: nextDay, phaseIndex: 0, flags: newFlags };
      const nextCard = directorSelectCard(nextState, ALL_CARDS);

      setTimeout(() => audioEngine.playVoiceForTrigger("game_start", "selim", voiceCtx()), 500);

      setDayStartStats(s.stats);

      // Generate daily diary entry for AI memory
      const completedDay = nextDay - 1;
      const derivedMood: SelimMood =
        s.stats.addiction > 60 ? "ashamed"
        : s.stats.mood < 30 ? "sad"
        : s.stats.pinkyHope > 75 ? "romantic"
        : s.stats.selfRespect > 70 ? "hopeful"
        : s.stats.friendTrust > 65 ? "grateful"
        : s.stats.mood > 70 ? "happy"
        : "hopeful";
      setTimeout(() => {
        setMemoryStore((ms) => {
          const text = generateDiaryEntry(completedDay, derivedMood, ms.memories.slice(0, 3));
          const updated = addDiaryEntry(ms, completedDay, text, derivedMood);
          saveStore(updated);
          return updated;
        });
      }, 100);

      return { ...nextState, screen: "game" as GameScreenType, currentCard: nextCard };
    });
  }, []);

  // ── SAVE ─────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    saveGame(gs);
    setHasSaveState(true);
    audioEngine.playSfx("ui_click");
  }, [gs]);

  // ── MENU ─────────────────────────────────────────────────────────────────────
  const handleOpenMenu = useCallback(() => {
    setMenuReturnScreen(gs.screen);
    setGs((s) => ({ ...s, screen: "menu" as GameScreenType }));
    audioEngine.playSfx("ui_click");
  }, [gs.screen]);

  const handleResumeMenu = useCallback(() => {
    setGs((s) => ({ ...s, screen: menuReturnScreen }));
  }, [menuReturnScreen]);

  const handleToggleReducedMotion = useCallback(() => {
    setGs((s) => ({ ...s, isReducedMotion: !s.isReducedMotion }));
  }, []);

  const handleToggleSound = useCallback(() => {
    setGs((s) => {
      const next = !s.isSoundEnabled;
      audioEngine.updateSettings({ masterEnabled: next });
      return { ...s, isSoundEnabled: next };
    });
  }, []);

  // ── AI / MEMORY HANDLERS ──────────────────────────────────────────────────────
  const handleConsentChoice = useCallback((choice: "enable" | "disable" | "reset") => {
    if (choice === "reset") {
      const freshStore = { memories: [], insideJokes: [], savedPromises: [], diaryEntries: [], continuityRecap: null, lastDay: 1 };
      setMemoryStore(freshStore);
      saveStore(freshStore);
      setShowConsentScreen(false);
      return;
    }
    const updated: PlayerProfile = {
      ...playerProfile,
      memoryEnabled: choice === "enable",
      firstRunSeen: true,
    };
    setPlayerProfile(updated);
    saveProfile(updated);
    setShowConsentScreen(false);
    if (!updated.setupComplete) {
      setShowProfileSetup(true);
    }
  }, [playerProfile]);

  const handleProfileComplete = useCallback((partial: Partial<PlayerProfile>) => {
    const updated: PlayerProfile = {
      ...playerProfile,
      ...partial,
      setupComplete: true,
      firstRunSeen: true,
    };
    setPlayerProfile(updated);
    saveProfile(updated);
    setShowProfileSetup(false);
  }, [playerProfile]);

  const handleOnboardingComplete = useCallback((data: { nickname: string; skipped: boolean }) => {
    const updated: PlayerProfile = {
      ...playerProfile,
      nickname: data.nickname,
      onboardingSeen: true,
    };
    setPlayerProfile(updated);
    saveProfile(updated);
    setShowOnboarding(false);
    setPendingNickname(data.nickname);
    // After onboarding, show consent + profile flow if not yet completed.
    if (!updated.firstRunSeen) {
      setShowConsentScreen(true);
    }
  }, [playerProfile]);

  // Friendship unlock events at trust 75 and 90 — when chat stat effects push
  // friendTrust past these thresholds for the first time, fire the UNLOCK_EVENTS
  // dialogue + stat boosts as an animated celebration moment.
  const HANDLED_UNLOCKS = [75, 90] as const;
  const handleChatStatEffects = useCallback((effects: Record<string, number>) => {
    setGs((s) => {
      const partialStats = effects as Partial<GameState["stats"]>;
      const newStats = applyEffectsToStats(s.stats, partialStats);
      let finalStats = newStats;
      let finalFlags = s.flags;
      const unlocksToShow: Array<{ threshold: number; dialogue: string }> = [];
      for (const threshold of HANDLED_UNLOCKS) {
        if (
          s.stats.friendTrust < threshold &&
          newStats.friendTrust >= threshold &&
          !s.flags.friendshipMilestonesShown.includes(threshold)
        ) {
          const event = UNLOCK_EVENTS[threshold];
          if (event) {
            finalStats = applyEffectsToStats(finalStats, event.statEffects as Partial<GameState["stats"]>);
            unlocksToShow.push({ threshold, dialogue: event.dialogue });
          }
          finalFlags = { ...finalFlags, friendshipMilestonesShown: [...finalFlags.friendshipMilestonesShown, threshold] };
        }
      }
      if (unlocksToShow.length > 0) {
        setTimeout(() => {
          // Queue every threshold so both 75 and 90 fire when crossed in one update.
          setFriendshipUnlockQueue((q) => [...q, ...unlocksToShow]);
          // If chat is open, surface every unlock line as a Selim message.
          try {
            for (const u of unlocksToShow) {
              window.dispatchEvent(new CustomEvent("selim:friendship-unlock", {
                detail: { threshold: u.threshold, dialogue: u.dialogue },
              }));
            }
          } catch { /* ignore */ }
        }, 200);
      }
      return { ...s, stats: finalStats, flags: finalFlags };
    });
  }, []);

  // Drain the unlock queue: show each unlock toast in order. The next one
  // appears when the previous is dismissed (manually or by auto-timeout).
  useEffect(() => {
    if (friendshipUnlock != null) return; // a toast is already on screen
    if (friendshipUnlockQueue.length === 0) return;
    const [next, ...rest] = friendshipUnlockQueue;
    setFriendshipUnlockQueue(rest);
    setFriendshipUnlock(next);
    setFriendshipMilestone(next.threshold);
    try {
      audioEngine.playSfx("achievement_unlock");
      sounds.achievement();
      setTimeout(() => audioEngine.playSfx("air_horn"), 280);
      audioEngine.playVoiceForTrigger("trust_up", "selim", voiceCtx());
    } catch { /* audio is best-effort */ }
  }, [friendshipUnlock, friendshipUnlockQueue, voiceCtx]);

  const handleStoreUpdate = useCallback((store: SelimMemoryStore) => {
    setMemoryStore(store);
    saveStore(store);
  }, []);

  const handleDialogueStateUpdate = useCallback((ds: DialogueState) => {
    setDialogueState(ds);
    saveDialogueState(ds);
  }, []);

  // ── QA PANEL FORCE ACTIONS (dev only) ────────────────────────────────────────
  const handleForcePinkyCard = useCallback(() => {
    const pinkyCard = ALL_CARDS.find((c) => c.category === "love" || c.id.includes("pinky") || c.id.includes("recharge"));
    if (pinkyCard) setGs((s) => ({ ...s, currentCard: pinkyCard, screen: "game" as GameScreenType }));
  }, []);

  const handleForceRandomCrush = useCallback(() => {
    const crushCard = ALL_CARDS.find((c) => c.id.includes("crush") || c.id.includes("nila") || c.id.includes("random_encounter"));
    if (crushCard) setGs((s) => ({ ...s, currentCard: crushCard, screen: "game" as GameScreenType }));
  }, []);

  const handleForceHeartbreak = useCallback(() => {
    setGs((s) => ({
      ...s,
      screen: "game" as GameScreenType,
      stats: { ...s.stats, pinkyHope: Math.max(0, s.stats.pinkyHope - 30), mood: Math.max(0, s.stats.mood - 20) },
      flags: { ...s.flags, heartbreakCount: s.flags.heartbreakCount + 1 },
    }));
  }, []);

  const handleForceRecovery = useCallback(() => {
    const recCard = selectRecoveryCard(ALL_CARDS, gs.recentCards);
    setGs((s) => ({
      ...s,
      screen: "recovery" as GameScreenType,
      flags: { ...s.flags, recoveryTriggered: true },
      currentCard: recCard,
      recoveryTurns: 0,
    }));
  }, [gs.recentCards]);

  const handleForceBoguraBoss = useCallback(() => {
    setGs((s) => ({
      ...s,
      screen: "ending" as GameScreenType,
      endingId: "bogura_boss",
    }));
  }, []);

  const handleFreeMode = useCallback(() => {
    setDailyMode(null);
    setDailyScoreFinal(null);
    clearSeededRng();
    setGs((s) => {
      const freeState: GameState = { ...s, screen: "game" as GameScreenType, endingId: null, day: 1, phaseIndex: 0 };
      const nextCard = directorSelectCard(freeState, ALL_CARDS);
      return { ...freeState, currentCard: nextCard };
    });
  }, []);

  const handleQAResetSave = useCallback(() => {
    clearSave();
    setHasSaveState(false);
    setGs(buildInitialState());
  }, []);

  const handleQAResetMemory = useCallback(() => {
    setMemoryStore(loadStore());
    setDialogueState(defaultDialogueState());
  }, []);

  // ── QA PANEL: power tools (dev only) ─────────────────────────────────────────
  const handleQASetStats = useCallback((partial: Partial<GameState["stats"]>) => {
    setGs((s) => {
      const next = { ...s.stats };
      (Object.entries(partial) as [keyof GameState["stats"], number][]).forEach(([k, v]) => {
        if (typeof v !== "number" || isNaN(v)) return;
        if (k === "money") next[k] = Math.round(v);
        else next[k] = Math.max(0, Math.min(100, Math.round(v)));
      });
      return { ...s, stats: next };
    });
  }, []);

  const handleQASetFlags = useCallback((partial: Partial<GameState["flags"]>) => {
    setGs((s) => ({ ...s, flags: { ...s.flags, ...partial } }));
  }, []);

  const handleQAJumpToDay = useCallback((day: number) => {
    const clamped = Math.max(1, Math.min(15, Math.round(day)));
    setGs((s) => ({ ...s, day: clamped }));
  }, []);

  const handleQAForceEnding = useCallback((id: string) => {
    const ending = ENDINGS.find((e) => e.id === id);
    if (!ending) return;
    try { recordEnding(id); } catch { /* ignore */ }
    setGs((s) => ({ ...s, screen: "ending" as GameScreenType, endingId: id }));
  }, []);

  const handleQAForceCard = useCallback((id: string) => {
    const card = ALL_CARDS.find((c) => c.id === id);
    if (card) setGs((s) => ({ ...s, currentCard: card, screen: "game" as GameScreenType }));
  }, []);

  const handleQAForceScreen = useCallback((screen: GameScreenType) => {
    setGs((s) => ({ ...s, screen }));
  }, []);

  const handleQAChaos = useCallback(() => {
    setGs((s) => {
      const r = (lo: number, hi: number) => Math.round(lo + Math.random() * (hi - lo));
      const chaosStats: GameState["stats"] = {
        health: r(0, 100), mood: r(0, 100), money: r(-300, 1500),
        iq: r(0, 100), energy: r(0, 100), reputation: r(0, 100),
        addiction: r(0, 100), temptation: r(0, 100), selfRespect: r(0, 100),
        pinkyHope: r(0, 100), pinkyHappiness: r(0, 100), careerProgress: r(0, 100),
        friendTrust: r(0, 100), emotionalDelusion: r(0, 100), attachmentLevel: r(0, 100),
        loneliness: r(0, 100), romanticFever: r(0, 100),
      };
      const card = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)] ?? s.currentCard;
      return { ...s, stats: chaosStats, currentCard: card, screen: "game" as GameScreenType };
    });
  }, []);

  const rm = gs.isReducedMotion;

  return (
    <div className="app-shell">
      <div className="app-frame">
        <VoiceSubtitle reducedMotion={rm} />
        <AudioDebugPanel />

        {/* Floating mute button — only on the in-game screens.
            On the start screen it's redundant with the Settings tile and
            it competes with the title for attention. */}
        {gs.screen !== "start" && (
          <button
            aria-label={gs.isSoundEnabled ? "Mute sound" : "Unmute sound"}
            onClick={handleToggleSound}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 55,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.45)",
              color: "white",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {gs.isSoundEnabled ? "🔊" : "🔇"}
          </button>
        )}

      <AnimatePresence mode="wait">
        {gs.screen === "start" && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StartScreen
              onNewGame={handleNewGame}
              onContinue={handleContinue}
              onTutorial={() => setGs((s) => ({ ...s, screen: "tutorial" }))}
              onOpenAlbum={() => {
                setShowAlbum(true);
                const h = tryShowHint("first_album");
                if (h) setActiveHint(h);
              }}
              onOpenStory={() => setShowStoryMode(true)}
              onStartDaily={handleStartDaily}
              onOpenJourney={() => setShowJourney(true)}
              onOpenSettings={() => setShowSoundSettings(true)}
              hasSave={hasSaveState}
              reducedMotion={rm}
            />
          </motion.div>
        )}

        {gs.screen === "tutorial" && (
          <motion.div key="tutorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Tutorial onStart={handleStartGame} reducedMotion={rm} />
          </motion.div>
        )}

        {gs.screen === "game" && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameScreen
              state={gs}
              prevStats={prevStats}
              onChoice={handleChoice}
              onNextCard={handleNextCard}
              onOpenMenu={handleOpenMenu}
              onOpenChat={() => setShowChatPanel(true)}
              newAchievement={newAchievement}
              reducedMotion={rm}
            />
          </motion.div>
        )}

        {gs.screen === "daysum" && (
          <motion.div key="daysum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DaySummary
              day={gs.day}
              stats={gs.stats}
              prevStats={dayStartStats}
              flags={gs.flags}
              forecast={buildDayForecast(gs, dayStartStats)}
              onNext={handleNextDay}
              reducedMotion={rm}
            />
          </motion.div>
        )}

        {gs.screen === "recovery" && (
          <motion.div key="recovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RecoveryMode
              card={gs.currentCard}
              stats={gs.stats}
              recoveryTurns={gs.recoveryTurns}
              onChoice={handleRecoveryChoice}
              reducedMotion={rm}
            />
          </motion.div>
        )}

        {gs.screen === "ending" && gs.endingId && (
          <motion.div key="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EndingScreen
              endingId={gs.endingId}
              stats={gs.stats}
              flags={gs.flags}
              onRestart={handleNewGame}
              onMainMenu={() => setGs((s) => ({ ...s, screen: "start" }))}
              onFreeMode={handleFreeMode}
              onShare={() => setShowShareCard(true)}
              onShowRecap={() => setShowFriendshipRecap(true)}
              onNewGamePlus={handleNewGamePlus}
              isDailyChallenge={dailyMode !== null}
              dailyScore={dailyScoreFinal ?? undefined}
              dailyBestScore={getDailyState().bestScore}
              reducedMotion={rm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu overlay */}
      <AnimatePresence>
        {gs.screen === "menu" && (
          <Menu
            key="menu"
            onResume={handleResumeMenu}
            onSave={handleSave}
            onNewGame={handleNewGame}
            onTutorial={() => setGs((s) => ({ ...s, screen: "tutorial" }))}
            isReducedMotion={gs.isReducedMotion}
            isSoundEnabled={gs.isSoundEnabled}
            onToggleReducedMotion={handleToggleReducedMotion}
            onToggleSound={handleToggleSound}
            onOpenSoundSettings={() => setShowSoundSettings(true)}
            onOpenAlbum={() => setShowAlbum(true)}
            onOpenStory={() => { handleResumeMenu(); setShowStoryMode(true); }}
            onOpenChat={() => {
              handleResumeMenu();
              setShowChatPanel(true);
              const h = tryShowHint("first_chat");
              if (h) setActiveHint(h);
            }}
            isAiModeEnabled={playerProfile.llmConsentEnabled}
            onToggleAiMode={() => setPlayerProfile((p) => {
              const updated = { ...p, llmConsentEnabled: !p.llmConsentEnabled };
              saveProfile(updated);
              return updated;
            })}
            reducedMotion={rm}
          />
        )}
      </AnimatePresence>

      {/* Selim's friend check-in pings — fires once per day after day 2,
          plus reactive bursts on heartbreak events. */}
      {gs.screen === "game" && (
        <>
          <SelimChatPopup
            stats={gs.stats}
            flags={gs.flags}
            day={gs.day}
            reducedMotion={rm}
          />
          <MoneyHypocrisyToast flags={gs.flags} reducedMotion={rm} />
          <SelimExcuseToast flags={gs.flags} reducedMotion={rm} />
          <TobaTimerHUD turnsLeft={gs.flags.promiseModeTurnsLeft} reducedMotion={rm} />
        </>
      )}

      {/* Floating chat FAB — visible during gameplay screens, hidden during
          cinematic/start/tutorial/ending screens and during full-screen overlays. */}
      <FabMount
        gs={gs}
        showChatPanel={showChatPanel}
        showAlbum={showAlbum}
        showStoryMode={showStoryMode}
        rm={rm}
        onOpen={() => setShowChatPanel(true)}
      />

      {/* Selim Album overlay */}
      <AnimatePresence>
        {showAlbum && (
          <SelimAlbum
            key="selim-album"
            achievements={gs.achievements}
            flags={gs.flags}
            stats={gs.stats}
            onClose={() => setShowAlbum(false)}
            reducedMotion={rm}
            isSoundEnabled={gs.isSoundEnabled}
          />
        )}
      </AnimatePresence>

      {/* Story Mode overlay */}
      <AnimatePresence>
        {showStoryMode && (
          <SelimStoryMode
            key="story-mode"
            onClose={() => setShowStoryMode(false)}
            reducedMotion={rm}
            isSoundEnabled={gs.isSoundEnabled}
          />
        )}
      </AnimatePresence>

      {/* My Journey — player-facing progression screen */}
      <AnimatePresence>
        {showJourney && (
          <JourneyScreen
            key="journey"
            liveAchievements={gs.achievements}
            onClose={() => setShowJourney(false)}
            reducedMotion={rm}
          />
        )}
      </AnimatePresence>

      {/* Story Beat cinematic — first-time photo scene trigger */}
      <AnimatePresence>
        {pendingStoryBeat && (
          <StoryBeatModal
            key={`story-beat-${pendingStoryBeat.id}`}
            moment={pendingStoryBeat}
            day={gs.day}
            reducedMotion={rm}
            isSoundEnabled={gs.isSoundEnabled}
            onDone={(choiceIndex) => {
              const moment = pendingStoryBeat;
              if (moment && choiceIndex >= 0) {
                const choice = moment.choices[choiceIndex];
                if (choice) {
                  setGs((s) => {
                    setPrevStats(s.stats);
                    return {
                      ...s,
                      stats: applyEffectsToStats(
                        s.stats,
                        choice.effects as Partial<GameState["stats"]>,
                      ),
                      flags: choice.flagUpdate
                        ? applyFlagUpdate(s.flags, choice.flagUpdate)
                        : s.flags,
                    };
                  });
                }
              }
              setPendingStoryBeat(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Global one-shot scene unlock toast */}
      <SceneUnlockToast reducedMotion={rm} />

      {/* Global celebratory toast for hidden easter-egg unlocks */}
      <EggUnlockToast reducedMotion={rm} />

      {/* Sound Settings overlay */}
      <AnimatePresence>
        {showSoundSettings && (
          <SoundSettings
            key="sound-settings"
            onClose={() => setShowSoundSettings(false)}
            reducedMotion={rm}
            onSettingsChange={(partial) => {
              if ("masterEnabled" in partial) {
                setGs((s) => ({ ...s, isSoundEnabled: partial.masterEnabled ?? s.isSoundEnabled }));
              }
              if ("reducedMotion" in partial) {
                setGs((s) => ({ ...s, isReducedMotion: partial.reducedMotion ?? s.isReducedMotion }));
              }
            }}
          />
        )}
      </AnimatePresence>

      <FriendshipMilestone
        milestone={friendshipMilestone}
        reducedMotion={rm}
        onDismiss={() => { setFriendshipMilestone(null); setFriendshipUnlock(null); }}
        unlockDialogue={friendshipUnlock?.dialogue ?? null}
        isUnlockEvent={friendshipUnlock != null && friendshipUnlock.threshold === friendshipMilestone}
      />

      {/* Memory Consent Screen */}
      <AnimatePresence>
        {showConsentScreen && (
          <MemoryConsent
            key="consent"
            currentProfile={playerProfile}
            onChoice={handleConsentChoice}
            reducedMotion={rm}
          />
        )}
      </AnimatePresence>

      {/* Player Profile Setup */}
      <AnimatePresence>
        {showProfileSetup && (
          <PlayerProfileSetup
            key="profile-setup"
            onComplete={handleProfileComplete}
            initialNickname={pendingNickname || playerProfile.nickname}
            reducedMotion={rm}
          />
        )}
      </AnimatePresence>

      {/* First-run narrated onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding
            key="onboarding"
            onComplete={handleOnboardingComplete}
            reducedMotion={rm}
          />
        )}
      </AnimatePresence>

      {/* Daily Challenge active banner */}
      {dailyMode && gs.screen === "game" && (
        <div
          className="fixed top-2 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full text-[10px] font-bold pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            color: "white",
            border: "1px solid rgba(255,215,0,0.4)",
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
          data-testid="daily-banner"
        >
          🎯 Daily: {dailyMode.name}
        </div>
      )}

      {/* One-time contextual hints */}
      <Coachmark
        hint={activeHint}
        onDismiss={() => setActiveHint(null)}
        reducedMotion={rm}
      />

      {/* End-of-run share card */}
      <AnimatePresence>
        {showShareCard && gs.endingId && (() => {
          const ending = ENDINGS.find((e) => e.id === gs.endingId);
          if (!ending) return null;
          const quote = ending.messageBangla.split(/[।!?]/)[0]?.trim() + "।";
          return (
            <ShareCard
              key="share-card"
              data={{
                playerName: playerProfile.nickname || "Bhai",
                endingName: ending.name,
                endingMessage: ending.messageBangla,
                selimQuote: quote || ending.messageBangla.slice(0, 80),
                isGood: GOOD_ENDINGS.has(gs.endingId),
                stats: gs.stats,
                day: gs.day,
              }}
              onClose={() => setShowShareCard(false)}
              reducedMotion={rm}
            />
          );
        })()}
      </AnimatePresence>

      {/* Friendship Recap overlay */}
      <AnimatePresence>
        {showFriendshipRecap && (
          <FriendshipRecap
            key="friendship-recap"
            data={buildFriendshipRecap(
              memoryStore,
              gs.stats,
              gs.flags,
              gs.day,
              playerProfile.nickname || "Bhai",
            )}
            onClose={() => setShowFriendshipRecap(false)}
            reducedMotion={rm}
          />
        )}
      </AnimatePresence>

      {/* Dev-only QA Panel — gated behind ?qa=1 so it doesn't clutter the
          preview during normal development. Add `?qa=1` to bring it back. */}
      {import.meta.env.DEV
        && typeof window !== "undefined"
        && new URLSearchParams(window.location.search).get("qa") === "1" && (
        <QAPanel
          gs={gs}
          memoryCount={memoryStore.memories.length + memoryStore.diaryEntries.length}
          onForcePinkyCard={handleForcePinkyCard}
          onForceRandomCrush={handleForceRandomCrush}
          onForceHeartbreak={handleForceHeartbreak}
          onForceRecovery={handleForceRecovery}
          onForceBoguraBoss={handleForceBoguraBoss}
          onSetStats={handleQASetStats}
          onSetFlags={handleQASetFlags}
          onJumpToDay={handleQAJumpToDay}
          onForceEnding={handleQAForceEnding}
          onForceCard={handleQAForceCard}
          onForceScreen={handleQAForceScreen}
          onChaos={handleQAChaos}
          onResetSave={handleQAResetSave}
          onResetMemory={handleQAResetMemory}
        />
      )}

      {/* Selim Chat Panel */}
      <AnimatePresence>
        {showChatPanel && (
          <SelimChatPanel
            key="chat-panel"
            gameState={gs}
            profile={playerProfile.setupComplete ? playerProfile : { ...defaultProfile(), address: "Bhai" }}
            store={memoryStore}
            dialogueState={dialogueState}
            brainMode={brainMode}
            onClose={() => setShowChatPanel(false)}
            onShowRecap={() => setShowFriendshipRecap(true)}
            onStoreUpdate={handleStoreUpdate}
            onDialogueStateUpdate={handleDialogueStateUpdate}
            onStatEffects={handleChatStatEffects}
            onFlagDelta={(delta) => setGs((s) => ({ ...s, flags: applyFlagUpdate(s.flags, delta) }))}
            reducedMotion={rm}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
