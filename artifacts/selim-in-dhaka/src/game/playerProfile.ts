import { PlayerProfile } from "../ai/types";

const PROFILE_KEY = "selim_player_profile_v1";

export function defaultProfile(): PlayerProfile {
  return {
    nickname: "Bhai",
    address: "Bhai",
    memoryEnabled: false,
    llmConsentEnabled: true,
    setupComplete: false,
    firstRunSeen: false,
    onboardingSeen: false,
    ngPlusCount: 0,
  };
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    const merged = { ...defaultProfile(), ...parsed };
    // Migration: legacy players who already finished first-run setup before
    // the onboarding flow existed should not be re-onboarded.
    if (merged.firstRunSeen && parsed.onboardingSeen === undefined) {
      merged.onboardingSeen = true;
    }
    return merged;
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}
