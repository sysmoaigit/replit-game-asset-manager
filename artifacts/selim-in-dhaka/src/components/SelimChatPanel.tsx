import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState, Flags } from "../types";
import { SelimMemoryStore, PlayerProfile, SelimMood } from "../ai/types";
import { DialogueState } from "../game/dialogueState";
import { BrainMode } from "../ai/selimBrain";
import { runChatHarness } from "../ai/chatHarness";
import { getFriendshipInfo } from "../game/friendshipEngine";
import { getSmartQuickReplies, deriveActiveArc } from "../game/storyContinuity";
import { SELIM_ASSETS } from "../game/assets";
import SelimTypingIndicator from "./SelimTypingIndicator";
import SelimThinkingBubble from "./SelimThinkingBubble";
import MemoryPanel from "./MemoryPanel";
import SelimSecretVault from "./SelimSecretVault";
import LoveArchive from "./LoveArchive";
import type { RelationshipProfile } from "../game/relationshipProfiles";
import SelimDiaryPanel from "./SelimDiaryPanel";
import OfflineGemmaPanel from "./OfflineGemmaPanel";
import { loadStore, saveStore, addMemory, addDiaryEntry } from "../ai/memoryStore";
import { calculateReplyDelay, deriveHumanState } from "../game/replyDelayEngine";
import { isGemmaReady, subscribeGemmaStatus } from "../ai/browserGemmaClient";
import {
  ChatMode, CHAT_MODES, getChatModeMeta, modeGreeting, applyPersona,
  detectChatEvents, selimStatusLabel, loadChatMode, saveChatMode,
  ChatSystemEvent, isGirlBusy, pickGirlBusyReply, pickApology,
  playerIsAskingForMoney, selimMoneyExcuse,
} from "../chat/chatModes";
import { appendChatLog } from "../chat/chatLog";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";
import {
  pickSecretToReveal, loadRevealedSecrets, saveRevealedSecrets,
  isSecretQuestion, type Secret,
} from "../game/selimSecrets";
import SecretRevealCard from "./SecretRevealCard";

interface ChatMessage {
  id: string;
  sender: "player" | "selim" | "system" | "secret";
  text: string;
  timestamp: number;
  mood?: SelimMood;
  isAskingPlayer?: boolean;
  savedAsMemory?: boolean;
  systemTone?: ChatSystemEvent["tone"];
  secret?: Secret;
}

interface Props {
  gameState: GameState;
  profile: PlayerProfile;
  store: SelimMemoryStore;
  dialogueState: DialogueState;
  brainMode: BrainMode;
  onClose: () => void;
  onShowRecap?: () => void;
  onStoreUpdate: (store: SelimMemoryStore) => void;
  onDialogueStateUpdate: (ds: DialogueState) => void;
  onStatEffects: (effects: Record<string, number>) => void;
  onFlagDelta?: (delta: Partial<Flags>) => void;
  reducedMotion?: boolean;
}

const MOOD_EMOJI: Record<SelimMood, string> = {
  happy: "😄",
  sad: "😢",
  defensive: "😤",
  romantic: "😍",
  hopeful: "🌟",
  ashamed: "😳",
  grateful: "🙏",
  silent: "🤐",
  angry: "😠",
  confused: "😕",
};

let msgIdCounter = 0;
function makeId() { return `msg_${Date.now()}_${msgIdCounter++}`; }

const MODE_QUICK_REPLIES: Record<ChatMode, string[]> = {
  friend: ["Ki obostha?", "Pinky'r update ki?", "Tui paglami korchis?"],
  male_friend: ["Bhai, 300 taka dorkar.", "Tui mittha bolchis?", "Recharge dish na."],
  female_friend: ["Selim, tomar bhalo chai.", "Apni eto care korle confused hoy.", "Take care."],
  fake_girl_id: ["Hi Selim", "Apni single?", "Apnar voice cute", "Data shesh, recharge?"],
  career_coach: ["Career first.", "Interview ready hoo.", "Skill build kor.", "Today no last-seen check."],
  roast_friend: ["Recharge machine 😂", "No DP Queen detected", "Brain update lagbe", "Love finished for 7 min?"],
  emotional_support: ["Ami achi.", "Tui kharap na.", "Water kha, ghum de.", "Promise save kori?"],
};

export default function SelimChatPanel({
  gameState,
  profile,
  store,
  dialogueState,
  brainMode,
  onClose,
  onShowRecap,
  onStoreUpdate,
  onDialogueStateUpdate,
  onStatEffects,
  onFlagDelta,
  reducedMotion = false,
}: Props) {
  const [chatMode, setChatMode] = useState<ChatMode>(() => loadChatMode());
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  // Track if Selim ignored the player on this last turn — next time the player
  // sends anything, Selim opens with an apology before the brain reply.
  const [apologyDue, setApologyDue] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(() => loadRevealedSecrets());
  const playerName = (profile.nickname && profile.nickname.trim()) || profile.address || "Bhai";
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const arc = deriveActiveArc(gameState);
    const initialMode = loadChatMode();
    const addr = (profile.nickname && profile.nickname.trim()) || profile.address || "Bhai";
    const greeting = initialMode !== "friend"
      ? modeGreeting(initialMode, addr)
      : arc === "pinky"
      ? `${addr}, Pinky-র ব্যাপারে বলবো?`
      : arc === "career"
      ? `${addr}, career নিয়ে একটু কথা বলি?`
      : `${addr}, কেমন আছিস?`;
    return [{
      id: makeId(),
      sender: "selim",
      text: greeting,
      timestamp: Date.now(),
      mood: dialogueState.currentMood,
    }];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [followUpPrompt, setFollowUpPrompt] = useState<string | null>(null);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [showGemmaPanel, setShowGemmaPanel] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showGirls, setShowGirls] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  // Tracks the most recently opened girlfriend profile so the chat input row
  // can offer character-specific quick replies until the topic shifts.
  const [topicGirl, setTopicGirl] = useState<RelationshipProfile | null>(null);
  // Session-scoped set of profile ids whose Selim-comment has already fired.
  const profileOpenedRef = useRef<Set<string>>(new Set());
  const [gemmaReady, setGemmaReady] = useState(isGemmaReady());
  const [lastSource, setLastSource] = useState<"local" | "gemini" | "gemma_browser" | null>(null);
  const [localStore, setLocalStore] = useState(store);
  const [localDS, setLocalDS] = useState(dialogueState);
  // Resync local snapshots when parent props change so panels (diary, memory)
  // never show stale data after external updates.
  useEffect(() => { setLocalStore(store); }, [store]);
  useEffect(() => { setLocalDS(dialogueState); }, [dialogueState]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // True in-flight mutex — prevents overlapping intercepts when the user
  // mashes Enter before isTyping has been flipped on by an async branch.
  const sendInFlight = useRef(false);

  const friendInfo = getFriendshipInfo(gameState.stats.friendTrust);
  const arc = deriveActiveArc(gameState);
  const modeMeta = getChatModeMeta(chatMode);
  // Recompute when Selim's mood or relevant flags change so the chips track
  // the live conversation state, not a frozen snapshot from chat-open time.
  const liveSelimMood =
    messages.filter((m) => m.sender === "selim").at(-1)?.mood ?? localDS.currentMood;
  const baseQuickReplies = getSmartQuickReplies(arc, liveSelimMood, gameState);
  const modeQuickReplies = MODE_QUICK_REPLIES[chatMode] ?? [];
  const quickReplies = [...modeQuickReplies, ...baseQuickReplies].slice(0, 8);
  const statusLabel = selimStatusLabel(chatMode, gameState.stats);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, isTyping, reducedMotion]);

  useEffect(() => subscribeGemmaStatus((s) => setGemmaReady(s.kind === "ready")), []);

  // Listen for friendship unlock events fired by App.tsx so the unlock
  // dialogue also lands in chat as a real Selim message — not just a toast.
  useEffect(() => {
    const onUnlock = (e: Event) => {
      const detail = (e as CustomEvent<{ threshold: number; dialogue: string }>).detail;
      if (!detail || !detail.dialogue) return;
      const banner = detail.threshold === 90
        ? "💛 Life Brother — certified!"
        : "🤝 Best Friend Mode — unlocked!";
      setMessages((m) => [
        ...m,
        {
          id: makeId(),
          sender: "system",
          text: `${banner} (Friend Trust ${detail.threshold})`,
          timestamp: Date.now(),
          systemTone: "info",
        },
        {
          id: makeId(),
          sender: "selim",
          text: detail.dialogue,
          timestamp: Date.now(),
          mood: "grateful",
        },
      ]);
      appendChatLog({
        day: gameState.day, sender: "selim", text: detail.dialogue,
        mode: chatMode, ts: Date.now(), tag: "memory_saved",
      });
    };
    window.addEventListener("selim:friendship-unlock", onUnlock as EventListener);
    return () => window.removeEventListener("selim:friendship-unlock", onUnlock as EventListener);
  }, [gameState.day, chatMode]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;
    if (sendInFlight.current) return; // hard mutex against double-send
    sendInFlight.current = true;
    try {
    const trimmed = text.trim();
    setInput("");
    setFollowUpPrompt(null);

    const playerMsg: ChatMessage = {
      id: makeId(),
      sender: "player",
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, playerMsg]);
    appendChatLog({
      day: gameState.day, sender: "player", text: trimmed, mode: chatMode, ts: Date.now(),
      tag: /\b(don'?t|na|বন্ধ|stop|recharge dish na|career|kharap|warning)\b/i.test(trimmed) ? "warning"
         : /advice|bol|ভেবে|think/i.test(trimmed) ? "advice" : undefined,
    });

    // Mode-aware system events fire immediately (before brain reply)
    const events = detectChatEvents(trimmed, chatMode, gameState.stats);
    for (const evt of events) {
      const sysMsg: ChatMessage = {
        id: evt.id,
        sender: "system",
        text: evt.text,
        timestamp: Date.now(),
        systemTone: evt.tone,
      };
      setMessages((m) => [...m, sysMsg]);
      const tag = evt.text.includes("Fake ID Risk") ? "fake_id_risk"
        : evt.text.includes("opened bKash") ? "lie"
        : evt.text.includes("Selim said he's broke") ? "money_refused"
        : evt.text.includes("sent the money") ? "money_helped"
        : evt.text.includes("got caught") ? "lie_caught"
        : undefined;
      appendChatLog({
        day: gameState.day, sender: "system", text: evt.text, mode: chatMode,
        ts: Date.now(), tag,
      });
      if (evt.effects) onStatEffects(evt.effects as Record<string, number>);
      if (evt.flagDelta && onFlagDelta) onFlagDelta(evt.flagDelta);
      // Diary log for the heaviest events (lie caught / money hypocrisy).
      // Functional updater + parent notify *with the same next value* avoids
      // stale-closure lost updates when multiple writes happen this turn.
      if (tag === "lie_caught") {
        setLocalStore((prev) => {
          const next = addDiaryEntry(
            prev, gameState.day,
            `${playerName} amake dhore felse — mithya bolsilam. Lojja lagche, kintu thik bolse.`,
            "ashamed",
          );
          onStoreUpdate(next);
          return next;
        });
      }
    }

    // Helper: write a diary entry via functional updater so consecutive
    // writes within a single send turn don't overwrite each other.
    const writeDiary = (text: string, mood: Parameters<typeof addDiaryEntry>[3]) => {
      setLocalStore((prev) => {
        const next = addDiaryEntry(prev, gameState.day, text, mood);
        onStoreUpdate(next);
        return next;
      });
    };
    // Helper: realistic human-state-based delay (replaces fixed setTimeouts).
    const humanDelay = () =>
      calculateReplyDelay(deriveHumanState(gameState.stats, chatMode), { mode: chatMode });

    // ── Intercept 1: Player asks Selim for money — funny excuse / real help ──
    if (playerIsAskingForMoney(trimmed) && (chatMode === "friend" || chatMode === "male_friend")) {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, humanDelay()));
      const excuse = selimMoneyExcuse(gameState.stats);
      const reply: ChatMessage = {
        id: makeId(), sender: "selim",
        text: excuse.text, timestamp: Date.now(),
        mood: excuse.helped ? "grateful" : "ashamed",
      };
      setMessages((m) => [...m, reply]);
      appendChatLog({
        day: gameState.day, sender: "selim", text: reply.text, mode: chatMode,
        ts: Date.now(), tag: excuse.helped ? "money_helped" : "money_refused",
      });
      if (excuse.helped) onStatEffects({ friendTrust: 5, money: -20 });
      else onStatEffects({ friendTrust: -1 });
      setIsTyping(false);
      return;
    }

    // ── Intercept 2: Apology due (checked BEFORE girl-busy so apologies
    //    don't starve while Selim keeps getting pulled into Pinky drama). ──
    if (apologyDue) {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, calculateReplyDelay("apology")));
      const apology = pickApology(playerName);
      setMessages((m) => [...m, {
        id: makeId(), sender: "selim", text: apology,
        timestamp: Date.now(), mood: "ashamed",
      }]);
      appendChatLog({
        day: gameState.day, sender: "selim", text: apology, mode: chatMode,
        ts: Date.now(), tag: "apology",
      });
      writeDiary(`${playerName}-ke ignore kore felechilam. Ajke sorry bollam — tor moto bhai pawa kothin.`, "grateful");
      onStatEffects({ friendTrust: 2, selfRespect: 1 });
      setApologyDue(false);
      setIsTyping(false);
      // Brief pause then continue to brain reply for the actual message.
      await new Promise((r) => setTimeout(r, 400));
    }

    // ── Intercept 3: Selim is girl-busy — delayed dry reply, schedule apology
    const girlBusy = isGirlBusy(gameState.stats) &&
      (chatMode === "friend" || chatMode === "male_friend" || chatMode === "career_coach" || chatMode === "roast_friend");
    if (girlBusy) {
      // System: typing to Pinky
      setMessages((m) => [...m, {
        id: makeId(), sender: "system",
        text: "💌 Selim is typing to Pinky.",
        timestamp: Date.now(), systemTone: "pink",
      }]);
      setIsTyping(true);
      // Girl-busy delay: 4–12s per spec — feels real without being broken.
      await new Promise((r) => setTimeout(r, calculateReplyDelay("girl_busy", { mode: chatMode })));
      const dry = pickGirlBusyReply();
      setMessages((m) => [...m, {
        id: makeId(), sender: "selim", text: dry,
        timestamp: Date.now(), mood: "confused",
      }]);
      appendChatLog({
        day: gameState.day, sender: "selim", text: dry, mode: chatMode,
        ts: Date.now(), tag: "ignored",
      });
      writeDiary(`Ajke ${playerName} message disilo, kintu ami Pinky-r reply niye busy chilam. Bhai-r kotha pore poreshi.`, "ashamed");
      if (onFlagDelta) onFlagDelta({ silentMoments: 1 });
      onStatEffects({ friendTrust: -1 });
      setApologyDue(true);
      setIsTyping(false);
      return;
    }

    // ── Intercept 4: Secret reveal — gated by FriendTrust + keyword/secret-q ─
    const wantsSecret = isSecretQuestion(trimmed);
    const candidate = pickSecretToReveal(trimmed, gameState.stats, gameState.flags, revealedSecrets);
    if (candidate && (wantsSecret || gameState.stats.friendTrust >= candidate.trustRequired + 5)) {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, calculateReplyDelay("ashamed")));
      setIsTyping(false);
      // Selim's lead-in line
      const leadIn = wantsSecret
        ? `${playerName}, ekta kotha bolte chai… kau ke bolish na.`
        : `${playerName}, ekta jinish bolte chai. Tor upor bharosha ase.`;
      setMessages((m) => [...m, {
        id: makeId(), sender: "selim", text: leadIn,
        timestamp: Date.now(), mood: "ashamed",
      }]);
      // Secret card
      setMessages((m) => [...m, {
        id: makeId(), sender: "secret", text: candidate.text,
        timestamp: Date.now(), secret: candidate,
      }]);
      // Persist + apply effects
      const next = new Set(revealedSecrets);
      next.add(candidate.id);
      setRevealedSecrets(next);
      saveRevealedSecrets(next);
      onStatEffects(candidate.effect as Record<string, number>);
      appendChatLog({
        day: gameState.day, sender: "system",
        text: `Secret unlocked: ${candidate.id}`,
        mode: chatMode, ts: Date.now(), tag: "memory_saved",
      });
      writeDiary(`Ajke ${playerName}-ke ekta secret bollam — "${candidate.text.slice(0, 60)}…". Bhitor halka lagche.`, "grateful");
      return;
    }

    setShowThinking(true);
    await new Promise((r) => setTimeout(r, 400));
    setShowThinking(false);
    setIsTyping(true);

    const minDelay = Math.min(1200, 400 + text.length * 20);
    await new Promise((r) => setTimeout(r, minDelay));

    try {
      const result = await runChatHarness(
        text.trim(),
        localStore,
        profile,
        localDS,
        gameState,
        brainMode,
      );

      setLocalStore(result.updatedStore);
      setLocalDS(result.updatedDialogueState);
      onStoreUpdate(result.updatedStore);
      onDialogueStateUpdate(result.updatedDialogueState);
      saveStore(result.updatedStore);
      setLastSource(result.source);

      if (Object.keys(result.statEffects).length > 0) {
        onStatEffects(result.statEffects);
      }

      // Replace generic address tokens with player nickname when set.
      // Covers English "bhai" (case-preserving) and Bangla "ভাই".
      const hasNickname = !!(profile.nickname && profile.nickname.trim());
      const personaText = applyPersona(result.reply, chatMode)
        .replace(/\bbhai\b/gi, (match) =>
          hasNickname
            ? (match[0] === match[0].toUpperCase() ? playerName : playerName.toLowerCase())
            : match,
        )
        .replace(/ভাই/g, hasNickname ? playerName : "ভাই");
      const selimMsg: ChatMessage = {
        id: makeId(),
        sender: "selim",
        text: personaText,
        timestamp: Date.now(),
        mood: result.moodAfter,
        isAskingPlayer: result.isAskingPlayer,
      };
      setMessages((m) => [...m, selimMsg]);
      appendChatLog({
        day: gameState.day, sender: "selim", text: personaText, mode: chatMode,
        ts: Date.now(),
        tag: result.moodAfter === "happy" ? "funny" : undefined,
      });

      if (result.followUpPrompt) {
        setTimeout(() => setFollowUpPrompt(result.followUpPrompt), 800);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: makeId(),
        sender: "selim",
        text: getSystemLine(audioEngine.getSettings().humorLevel, "Hmm, একটু ভাবছি..."),
        timestamp: Date.now(),
        mood: "confused",
      };
      setMessages((m) => [...m, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
    } finally {
      // Always release the in-flight mutex, even if an early return above
      // skipped the brain reply path.
      sendInFlight.current = false;
    }
  }, [isTyping, localStore, localDS, profile, gameState, brainMode, chatMode, onStoreUpdate, onDialogueStateUpdate, onStatEffects, onFlagDelta]);

  const handleSelectMode = useCallback((m: ChatMode) => {
    setChatMode(m);
    saveChatMode(m);
    setShowModeSwitcher(false);
    const meta = getChatModeMeta(m);
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        sender: "system",
        text: `${meta.emoji} Mode switched: ${meta.label} — ${meta.hint}`,
        timestamp: Date.now(),
        systemTone: "info",
      },
      {
        id: makeId(),
        sender: "selim",
        text: modeGreeting(m, profile.address),
        timestamp: Date.now(),
        mood: localDS.currentMood,
      },
    ]);
  }, [profile.address, localDS.currentMood]);

  const handleSaveAsMemory = useCallback((msgId: string, text: string) => {
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, savedAsMemory: true } : m));
    const updated = addMemory(localStore, "best_friend_moment", `Chat: "${text.slice(0, 100)}"`, ["chat", chatMode], 70);
    setLocalStore(updated);
    onStoreUpdate(updated);
    saveStore(updated);
    setMessages((prev) => [...prev, {
      id: makeId(),
      sender: "system",
      text: "📌 Memory saved. Selim will remember this.",
      timestamp: Date.now(),
      systemTone: "memory",
    }]);
    appendChatLog({
      day: gameState.day, sender: "system",
      text: `Memory saved: ${text.slice(0, 60)}`,
      mode: chatMode, ts: Date.now(), tag: "memory_saved",
    });
  }, [localStore, chatMode, onStoreUpdate, gameState.day]);

  const handleSend = () => sendMessage(input);

  const handleStoreUpdate = (newStore: SelimMemoryStore) => {
    setLocalStore(newStore);
    onStoreUpdate(newStore);
    saveStore(newStore);
  };

  const selimMood = liveSelimMood;

  return (
    <>
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="fixed inset-0 z-[55] flex flex-col"
        style={{
          background: "linear-gradient(180deg, #0d0600 0%, #1a0f05 100%)",
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.3)" }}
        >
          <div className="relative">
            <img
              src={SELIM_ASSETS.main}
              alt="Selim"
              className="w-10 h-10 rounded-full object-cover"
              style={{ border: "2px solid #FFD700" }}
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 text-sm"
              title={selimMood}
            >
              {MOOD_EMOJI[selimMood]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-sm" style={{ color: "#FFD700" }}>Selim</p>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(255,107,0,0.2)", color: "#FF6B00" }}
              >
                {friendInfo.growthMeterLabel}
              </span>
              <button
                data-testid="btn-chat-mode"
                onClick={() => setShowModeSwitcher((v) => !v)}
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold active:scale-90 transition-transform"
                style={{
                  background: `${modeMeta.color}22`,
                  color: modeMeta.color,
                  border: `1px solid ${modeMeta.color}55`,
                }}
              >
                {modeMeta.emoji} {modeMeta.label} ▾
              </button>
            </div>
            <p className="text-[10px] truncate" style={{ color: "#9ca3af" }}>
              {statusLabel} · Trust {Math.round(gameState.stats.friendTrust)}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center justify-end max-w-[60%]">
            <button
              onClick={() => setShowGemmaPanel(true)}
              title={gemmaReady ? "Offline Gemma ready" : "Setup offline AI"}
              className="text-xs px-2 py-1 rounded-full active:scale-90 transition-transform"
              style={{
                background: gemmaReady ? "rgba(34,197,94,0.15)" : "rgba(168,85,247,0.12)",
                color: gemmaReady ? "#22c55e" : "#a855f7",
                border: `1px solid ${gemmaReady ? "rgba(34,197,94,0.3)" : "rgba(168,85,247,0.25)"}`,
              }}
            >
              {gemmaReady ? "📥✓" : "📥"}
            </button>
            <button
              data-testid="btn-girls"
              onClick={() => setShowGirls(true)}
              className="text-xs px-2 py-1 rounded-full active:scale-90 transition-transform"
              style={{ background: "rgba(236,72,153,0.12)", color: "#f9a8d4", border: "1px solid rgba(236,72,153,0.25)" }}
            >
              💞
            </button>
            <button
              data-testid="btn-vault"
              onClick={() => setShowVault(true)}
              className="text-xs px-2 py-1 rounded-full active:scale-90 transition-transform"
              style={{ background: "rgba(124,58,237,0.12)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.25)" }}
            >
              🔐
            </button>
            <button
              data-testid="btn-diary"
              onClick={() => setShowDiary(true)}
              className="text-xs px-2 py-1 rounded-full active:scale-90 transition-transform"
              style={{ background: "rgba(255,143,0,0.12)", color: "#fed7aa", border: "1px solid rgba(255,143,0,0.25)" }}
            >
              📔
            </button>
            <button
              onClick={() => setShowMemoryPanel(true)}
              className="text-xs px-2 py-1 rounded-full active:scale-90 transition-transform"
              style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.2)" }}
            >
              📖
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <span style={{ color: "white" }}>✕</span>
            </button>
          </div>
        </div>

        {profile.memoryEnabled && (
          <div
            className="px-4 py-1.5 text-[10px] flex items-center gap-1.5"
            style={{ background: "rgba(34,197,94,0.08)", borderBottom: "1px solid rgba(34,197,94,0.1)" }}
          >
            <span style={{ color: "#22c55e" }}>🧠</span>
            <span style={{ color: "#6b7280" }}>
              Selim Brain: <span style={{ color: "#22c55e" }}>{brainMode === "ai_enhanced" ? "AI Enhanced" : "Local"}</span>
              {" · "}Memory: <span style={{ color: "#22c55e" }}>On</span>
              {" · "}AI Consent: <span style={{ color: profile.llmConsentEnabled ? "#22c55e" : "#6b7280" }}>
                {profile.llmConsentEnabled ? "On" : "Off"}
              </span>
              {lastSource && (
                <>
                  {" · "}Last: <span style={{
                    color: lastSource === "gemini" ? "#a855f7"
                      : lastSource === "gemma_browser" ? "#22c55e"
                      : "#6b7280",
                  }}>
                    {lastSource === "gemini" ? "Gemini ☁" : lastSource === "gemma_browser" ? "Gemma 📥" : "Local"}
                  </span>
                </>
              )}
              {" · "}<span style={{ color: "#FFB347" }}>All money requests are fictional game events.</span>
            </span>
          </div>
        )}

        <AnimatePresence>
          {showModeSwitcher && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0"
              style={{
                background: "rgba(0,0,0,0.4)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                scrollbarWidth: "none",
              }}
            >
              {CHAT_MODES.map((m) => {
                const active = m.id === chatMode;
                return (
                  <button
                    key={m.id}
                    data-testid={`chat-mode-${m.id}`}
                    onClick={() => handleSelectMode(m.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold active:scale-95 transition-transform"
                    style={{
                      background: active ? `${m.color}33` : "rgba(255,255,255,0.06)",
                      color: active ? m.color : "#cbd5e1",
                      border: `1px solid ${active ? m.color : "rgba(255,255,255,0.12)"}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.emoji} {m.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {chatMode === "fake_girl_id" && (
          <div
            className="px-4 py-1.5 text-[10px] flex items-center gap-1.5"
            style={{ background: "rgba(168,85,247,0.1)", borderBottom: "1px solid rgba(168,85,247,0.2)" }}
          >
            <span style={{ color: "#a855f7" }}>🎭</span>
            <span style={{ color: "#cbd5e1" }}>
              Fake Girl ID is a fictional in-game test of Selim's weakness for attention. No real person involved.
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {messages.map((msg) => {
            if (msg.sender === "secret" && msg.secret) {
              return <SecretRevealCard key={msg.id} secret={msg.secret} reducedMotion={reducedMotion} />;
            }
            if (msg.sender === "system") {
              const toneColor = msg.systemTone === "danger" ? "#ef4444"
                : msg.systemTone === "warning" ? "#FFB347"
                : msg.systemTone === "memory" ? "#22c55e"
                : msg.systemTone === "pink" ? "#f472b6"
                : "#9ca3af";
              return (
                <div key={msg.id} className="flex justify-center">
                  <div
                    className="text-[11px] px-3 py-1.5 rounded-full max-w-[85%] text-center"
                    style={{
                      background: `${toneColor}15`,
                      color: toneColor,
                      border: `1px solid ${toneColor}33`,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            }
            return (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "player" ? "justify-end" : "justify-start"} gap-2`}
            >
              {msg.sender === "selim" && (
                <img
                  src={SELIM_ASSETS.main}
                  alt="Selim"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 self-end"
                  style={{ border: "1px solid rgba(255,215,0,0.4)" }}
                />
              )}
              <div className="max-w-[78%]">
                {msg.sender === "selim" && msg.isAskingPlayer && (
                  <p className="text-[10px] mb-0.5 px-1" style={{ color: "#FFB347" }}>
                    💬 Selim is asking you...
                  </p>
                )}
                <div
                  className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: msg.sender === "player"
                      ? "linear-gradient(135deg, #FF6B00, #FF8F00)"
                      : "rgba(255,255,255,0.08)",
                    color: msg.sender === "player" ? "white" : "#e5e7eb",
                    borderBottomLeftRadius: msg.sender === "selim" ? 4 : undefined,
                    borderBottomRightRadius: msg.sender === "player" ? 4 : undefined,
                  }}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-2 px-1">
                  {msg.sender === "selim" && msg.mood && (
                    <span className="text-[10px]" style={{ color: "#6b7280" }}>
                      {MOOD_EMOJI[msg.mood]} {msg.mood}
                    </span>
                  )}
                  {msg.sender === "selim" && !msg.savedAsMemory && (
                    <button
                      onClick={() => handleSaveAsMemory(msg.id, msg.text)}
                      className="text-[10px] active:scale-90 transition-transform"
                      style={{ color: "#FFB347" }}
                      title="Save as memory"
                    >
                      📌 save
                    </button>
                  )}
                  {msg.sender === "selim" && msg.savedAsMemory && (
                    <span className="text-[10px]" style={{ color: "#22c55e" }}>📌 saved</span>
                  )}
                </div>
              </div>
            </div>
            );
          })}

          {showThinking && (
            <div className="flex justify-start">
              <SelimThinkingBubble visible={showThinking} reducedMotion={reducedMotion} />
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start items-center gap-2">
              <img
                src={SELIM_ASSETS.main}
                alt="Selim"
                className="w-7 h-7 rounded-full object-cover"
                style={{ border: "1px solid rgba(255,215,0,0.4)" }}
              />
              <SelimTypingIndicator reducedMotion={reducedMotion} />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <AnimatePresence>
          {followUpPrompt && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: 8 }}
              className="px-4 py-2 flex-shrink-0"
            >
              <div
                className="rounded-2xl px-4 py-3 flex items-center justify-between"
                style={{ background: "rgba(255,179,71,0.1)", border: "1px solid rgba(255,179,71,0.25)" }}
              >
                <p className="text-sm flex-1" style={{ color: "#FFB347" }}>
                  💬 {followUpPrompt}
                </p>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => sendMessage(followUpPrompt!)}
                    className="text-xs px-3 py-1 rounded-full font-semibold active:scale-90 transition-transform"
                    style={{ background: "#FF6B00", color: "white" }}
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => { sendMessage("Skip, Selim."); setFollowUpPrompt(null); }}
                    className="text-xs px-3 py-1 rounded-full font-semibold active:scale-90 transition-transform"
                    style={{ background: "rgba(255,255,255,0.1)", color: "#9ca3af" }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 px-4 py-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
          {quickReplies.map((qr) => (
            <button
              key={qr}
              onClick={() => sendMessage(qr)}
              disabled={isTyping}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-transform disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#FFB347",
                border: "1px solid rgba(255,255,255,0.12)",
                whiteSpace: "nowrap",
              }}
            >
              {qr}
            </button>
          ))}
        </div>

        {topicGirl && topicGirl.quickReplies && topicGirl.quickReplies.length > 0 && (
          <div
            data-testid="quick-replies-strip"
            className="flex-shrink-0 px-3 py-2 overflow-x-auto"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(236,72,153,0.05)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] whitespace-nowrap" style={{ color: "#fbcfe8" }}>
                💞 {topicGirl.name}:
              </span>
              {topicGirl.quickReplies.map((q, i) => (
                <button
                  key={i}
                  data-testid={`quick-reply-${topicGirl.id}-${i}`}
                  onClick={() => sendMessage(q)}
                  disabled={isTyping}
                  className="px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap active:scale-95 transition disabled:opacity-40"
                  style={{
                    background: "rgba(236,72,153,0.15)",
                    color: "#fde2f3",
                    border: "1px solid rgba(236,72,153,0.35)",
                    fontFamily: "'Hind Siliguri', sans-serif",
                  }}
                >
                  {q}
                </button>
              ))}
              <button
                data-testid="quick-reply-clear"
                onClick={() => setTopicGirl(null)}
                aria-label="Clear topic"
                className="px-2 py-1 rounded-full text-[11px] active:scale-95 transition"
                style={{ background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <div
          className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.3)",
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
            placeholder={`${profile.address}-কে কিছু বলো...`}
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-white outline-none disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF8F00)" }}
          >
            <span style={{ color: "white", fontSize: 16 }}>➤</span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showMemoryPanel && (
          <MemoryPanel
            store={localStore}
            onUpdate={handleStoreUpdate}
            onClose={() => setShowMemoryPanel(false)}
            onShowRecap={onShowRecap ? () => { setShowMemoryPanel(false); onShowRecap(); } : undefined}
            reducedMotion={reducedMotion}
          />
        )}
        {showGemmaPanel && (
          <OfflineGemmaPanel
            onClose={() => setShowGemmaPanel(false)}
            reducedMotion={reducedMotion}
          />
        )}
        {showVault && (
          <SelimSecretVault
            stats={gameState.stats}
            onClose={() => setShowVault(false)}
            reducedMotion={reducedMotion}
          />
        )}
        {showGirls && (
          <LoveArchive
            onClose={() => setShowGirls(false)}
            reducedMotion={reducedMotion}
            stats={gameState.stats}
            onProfileOpen={(p) => {
              setTopicGirl(p);
              // Session-level dedupe: Selim only reacts the FIRST time you
              // peek at each girl per session. Avoids spamming his comment
              // every time you re-open the same profile.
              const seen = profileOpenedRef.current;
              if (seen.has(p.id)) return;
              seen.add(p.id);
              if (p.selimComment) {
                setMessages((m) => [...m, {
                  id: makeId(), sender: "selim",
                  text: p.selimComment as string,
                  timestamp: Date.now(), mood: "hopeful",
                }]);
                appendChatLog({
                  day: gameState.day, sender: "selim", text: p.selimComment as string,
                  mode: chatMode, ts: Date.now(),
                });
              }
            }}
          />
        )}
        {showDiary && (
          <SelimDiaryPanel
            store={localStore}
            onClose={() => setShowDiary(false)}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </>
  );
}
