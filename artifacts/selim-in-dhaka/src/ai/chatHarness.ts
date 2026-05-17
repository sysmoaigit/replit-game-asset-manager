import { SelimMemoryStore, PlayerProfile, SelimBrainResponse, SelimMood } from "./types";
import { classifyMessage } from "./messageClassifier";
import { retrieveRelevantMemories, shouldReferenceMemory } from "./memoryRetrieval";
import { extractMemory, buildMemoryItem } from "./memoryExtractor";
import { runSelimBrain, BrainMode, BrainSource } from "./selimBrain";
import { checkSafety } from "./safety";
import { trackInsideJoke } from "./memoryStore";
import { DialogueState, updateDialogueState, SILENT_APOLOGY } from "../game/dialogueState";
import { deriveActiveArc } from "../game/storyContinuity";
import { GameState } from "../types";

export interface HarnessResult {
  reply: string;
  moodAfter: SelimMood;
  statEffects: SelimBrainResponse["statEffects"];
  suggestedVoiceTrigger?: string;
  followUpPrompt: string | null;
  isAskingPlayer: boolean;
  updatedStore: SelimMemoryStore;
  updatedDialogueState: DialogueState;
  safetyBlocked: boolean;
  modeUsed: BrainMode;
  source: BrainSource;
}

export async function runChatHarness(
  playerMessage: string,
  store: SelimMemoryStore,
  profile: PlayerProfile,
  dialogueState: DialogueState,
  gameState: GameState,
  brainMode: BrainMode,
): Promise<HarnessResult> {
  const safety = checkSafety(playerMessage);
  if (!safety.ok) {
    return {
      reply: safety.message,
      moodAfter: "sad",
      statEffects: {},
      followUpPrompt: null,
      isAskingPlayer: false,
      updatedStore: store,
      updatedDialogueState: dialogueState,
      safetyBlocked: true,
      modeUsed: "local",
      source: "local",
    };
  }

  const classification = classifyMessage(playerMessage);

  const relevantMemories = shouldReferenceMemory(gameState.stats.friendTrust, dialogueState.turnCount)
    ? retrieveRelevantMemories(store.memories, classification, gameState.stats.friendTrust)
    : [];

  const activeInsideJokes = store.insideJokes.filter((j) => j.active);

  const currentMoodFromStats: SelimMood =
    gameState.stats.mood < 30 ? "sad"
    : gameState.stats.pinkyHope > 80 ? "romantic"
    : gameState.stats.selfRespect > 70 ? "hopeful"
    : gameState.stats.friendTrust > 75 ? "grateful"
    : "confused";

  const activeArc = deriveActiveArc(gameState);

  const contextPacket = {
    playerMessage,
    classification,
    relevantMemories,
    insideJokes: activeInsideJokes,
    activeArc,
    friendTrust: gameState.stats.friendTrust,
    pinkyHope: gameState.stats.pinkyHope,
    selfRespect: gameState.stats.selfRespect,
    mood: dialogueState.currentMood !== "confused" ? dialogueState.currentMood : currentMoodFromStats,
    playerProfile: profile,
    currentDay: gameState.day,
  };

  if (dialogueState.silentApologyDue) {
    const newDS = updateDialogueState(dialogueState, "ashamed", false);
    return {
      reply: SILENT_APOLOGY,
      moodAfter: "ashamed",
      statEffects: { friendTrust: 2 },
      followUpPrompt: null,
      isAskingPlayer: false,
      updatedStore: store,
      updatedDialogueState: { ...newDS, silentApologyDue: false },
      safetyBlocked: false,
      modeUsed: "local",
      source: "local",
    };
  }

  const { response, modeUsed, source } = await runSelimBrain(
    contextPacket,
    brainMode,
    profile.llmConsentEnabled,
  );

  let updatedStore = store;

  if (profile.memoryEnabled) {
    const extracted = extractMemory(playerMessage, response.reply, classification);
    if (extracted) {
      const item = buildMemoryItem(extracted);
      updatedStore = { ...updatedStore, memories: [...updatedStore.memories, item] };
    }

    const words = playerMessage.split(/\s+/).filter((w) => w.length > 3);
    if (words.length >= 2) {
      const phrase = words.slice(0, 3).join(" ");
      updatedStore = trackInsideJoke(updatedStore, phrase);
    }
  }

  const wasSilent = response.reply.trim() === "..." || response.reply.trim() === "";
  const finalReply = wasSilent ? "..." : response.reply;

  const newDialogueState = updateDialogueState(dialogueState, response.moodAfter, wasSilent);

  return {
    reply: finalReply,
    moodAfter: response.moodAfter,
    statEffects: response.statEffects,
    suggestedVoiceTrigger: response.suggestedVoiceTrigger,
    followUpPrompt: response.followUpPrompt ?? null,
    isAskingPlayer: response.isAskingPlayer ?? false,
    updatedStore,
    updatedDialogueState: newDialogueState,
    safetyBlocked: false,
    modeUsed,
    source,
  };
}
