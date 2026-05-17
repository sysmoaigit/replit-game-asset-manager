// storyProgress.ts — localStorage-backed tracking of which Selim Moments
// have been shown as cinematic beats vs just appeared as background art.

import { SELIM_MOMENTS, type SelimMoment } from "./moments";

const SEEN_KEY = "selim_dhaka_moments_seen_v1";
const CHOICE_KEY = "selim_dhaka_moment_choices_v1";
const UNLOCKED_DAY_KEY = "selim_dhaka_moment_days_v1";

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch { /* ignore */ }
}

function readDayMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(UNLOCKED_DAY_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

function writeDayMap(map: Record<string, number>): void {
  try {
    localStorage.setItem(UNLOCKED_DAY_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

/** Returns set of moment IDs that have been shown as cinematic beats. */
export function getSeenMomentIds(): Set<string> {
  return readSet(SEEN_KEY);
}

/** Mark a moment as having been shown as a cinematic beat. */
export function markMomentSeen(momentId: string, day: number): void {
  const seen = readSet(SEEN_KEY);
  seen.add(momentId);
  writeSet(SEEN_KEY, seen);

  const dayMap = readDayMap();
  if (!dayMap[momentId]) {
    dayMap[momentId] = day;
    writeDayMap(dayMap);
  }
}

/** Returns the day a moment was unlocked (or null). */
export function getMomentUnlockDay(momentId: string): number | null {
  return readDayMap()[momentId] ?? null;
}

/** Returns whether a moment has been seen as a cinematic beat. */
export function isMomentSeen(momentId: string): boolean {
  return readSet(SEEN_KEY).has(momentId);
}

/** Record the player's choice index for a moment (for album replay). */
export function saveMomentChoice(momentId: string, choiceIndex: number): void {
  try {
    const raw = localStorage.getItem(CHOICE_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[momentId] = choiceIndex;
    localStorage.setItem(CHOICE_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

/** Get the player's saved choice for a moment (or null). */
export function getMomentChoice(momentId: string): number | null {
  try {
    const raw = localStorage.getItem(CHOICE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return typeof map[momentId] === "number" ? map[momentId] : null;
  } catch {
    return null;
  }
}

/** Reset all story progress (called on new game). */
export function clearStoryProgress(): void {
  try {
    localStorage.removeItem(SEEN_KEY);
    localStorage.removeItem(CHOICE_KEY);
    localStorage.removeItem(UNLOCKED_DAY_KEY);
  } catch { /* ignore */ }
}

/** Returns the next unseen moment that should fire on a given day. */
export function getNextUnseenMomentForDay(day: number): SelimMoment | null {
  const seen = readSet(SEEN_KEY);
  return (
    SELIM_MOMENTS.find(
      (m) => !seen.has(m.id) && m.triggerDay <= day,
    ) ?? null
  );
}

/** Returns sorted list of all seen moments with unlock info. */
export function getSeenMoments(): Array<{ moment: SelimMoment; day: number }> {
  const seen = readSet(SEEN_KEY);
  const dayMap = readDayMap();
  return SELIM_MOMENTS.filter((m) => seen.has(m.id))
    .sort((a, b) => a.chapter - b.chapter)
    .map((m) => ({ moment: m, day: dayMap[m.id] ?? 0 }));
}

/** Total number of moments available. */
export const TOTAL_MOMENTS = SELIM_MOMENTS.length;
