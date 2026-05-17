// Love Archive — collection-level helpers and lightweight open-tracking
// for the girlfriend profiles.

import {
  RELATIONSHIP_PROFILES, type RelationshipProfile,
  type RelationshipStatus, type DangerLevel,
} from "./relationshipProfiles";

const OPEN_KEY = "selim_love_archive_opens_v1";

export type ProfileFilter =
  | { kind: "all" }
  | { kind: "status"; value: RelationshipStatus }
  | { kind: "danger"; value: DangerLevel };

export function filterProfiles(filter: ProfileFilter): RelationshipProfile[] {
  switch (filter.kind) {
    case "status": return RELATIONSHIP_PROFILES.filter((p) => p.status === filter.value);
    case "danger": return RELATIONSHIP_PROFILES.filter((p) => p.dangerLevel === filter.value);
    default:       return RELATIONSHIP_PROFILES;
  }
}

export function uniqueStatuses(): RelationshipStatus[] {
  return Array.from(new Set(RELATIONSHIP_PROFILES.map((p) => p.status)));
}

export function uniqueDangerLevels(): DangerLevel[] {
  return Array.from(new Set(
    RELATIONSHIP_PROFILES.map((p) => p.dangerLevel).filter((d): d is DangerLevel => !!d),
  ));
}

// ── Open tracking — used to surface "View Story Cards / Continue Arc" hooks. ──

type OpenMap = Record<string, number>;

function readOpens(): OpenMap {
  try {
    const raw = localStorage.getItem(OPEN_KEY);
    return raw ? (JSON.parse(raw) as OpenMap) : {};
  } catch { return {}; }
}

export function recordProfileOpen(id: string): number {
  try {
    const map = readOpens();
    map[id] = (map[id] ?? 0) + 1;
    localStorage.setItem(OPEN_KEY, JSON.stringify(map));
    return map[id];
  } catch { return 0; }
}

export function getOpenCount(id: string): number {
  return readOpens()[id] ?? 0;
}
