import { SelimMood } from "../ai/types";

export interface DialogueState {
  currentMood: SelimMood;
  turnCount: number;
  lastMessageTime: number;
  silentApologyDue: boolean;
  silentTurns: number;
}

export function defaultDialogueState(): DialogueState {
  return {
    currentMood: "confused",
    turnCount: 0,
    lastMessageTime: 0,
    silentApologyDue: false,
    silentTurns: 0,
  };
}

export function updateDialogueState(
  state: DialogueState,
  newMood: SelimMood,
  wasSilent: boolean,
): DialogueState {
  const silentTurns = wasSilent ? state.silentTurns + 1 : 0;
  const silentApologyDue = silentTurns >= 2;
  return {
    ...state,
    currentMood: newMood,
    turnCount: state.turnCount + 1,
    lastMessageTime: Date.now(),
    silentTurns,
    silentApologyDue,
  };
}

const DIALOGUE_STATE_KEY = "selim_dialogue_state_v1";

export function loadDialogueState(): DialogueState {
  try {
    const raw = localStorage.getItem(DIALOGUE_STATE_KEY);
    if (!raw) return defaultDialogueState();
    const parsed = JSON.parse(raw) as Partial<DialogueState>;
    const def = defaultDialogueState();
    return {
      currentMood: typeof parsed.currentMood === "string" ? parsed.currentMood as SelimMood : def.currentMood,
      turnCount: typeof parsed.turnCount === "number" ? parsed.turnCount : def.turnCount,
      lastMessageTime: typeof parsed.lastMessageTime === "number" ? parsed.lastMessageTime : def.lastMessageTime,
      silentApologyDue: typeof parsed.silentApologyDue === "boolean" ? parsed.silentApologyDue : def.silentApologyDue,
      silentTurns: typeof parsed.silentTurns === "number" ? parsed.silentTurns : def.silentTurns,
    };
  } catch {
    return defaultDialogueState();
  }
}

export function saveDialogueState(state: DialogueState): void {
  try {
    localStorage.setItem(DIALOGUE_STATE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export const SILENT_APOLOGY =
  "ভাই, আমি আগে চুপ ছিলাম। Sorry। তুই থাকিস, এটাই important।";
