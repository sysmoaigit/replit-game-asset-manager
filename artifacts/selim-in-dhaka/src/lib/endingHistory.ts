// Tracks endings the player has reached across all playthroughs.
// Stored locally; safe against malformed JSON.

const KEY = "selim_dhaka_endings_seen_v1";

export type EndingHistory = Record<string, { count: number; firstSeenAt: number; lastSeenAt: number }>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function sanitizeEntry(v: unknown): EndingHistory[string] | null {
  if (!isPlainObject(v)) return null;
  const count = Number((v as { count?: unknown }).count);
  if (!Number.isFinite(count) || count <= 0) return null;
  const firstSeenAt = Number((v as { firstSeenAt?: unknown }).firstSeenAt) || Date.now();
  const lastSeenAt = Number((v as { lastSeenAt?: unknown }).lastSeenAt) || firstSeenAt;
  return { count: Math.floor(count), firstSeenAt, lastSeenAt };
}

export function loadEndingHistory(): EndingHistory {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) return {};
    const out: EndingHistory = {};
    for (const [k, v] of Object.entries(parsed)) {
      const entry = sanitizeEntry(v);
      if (entry) out[k] = entry;
    }
    return out;
  } catch {
    return {};
  }
}

export function recordEnding(endingId: string): EndingHistory {
  if (!endingId || typeof endingId !== "string") return loadEndingHistory();
  const history = loadEndingHistory();
  const now = Date.now();
  const existing = history[endingId];
  const prevCount = Math.max(0, Number(existing?.count) || 0);
  history[endingId] = existing
    ? { ...existing, count: prevCount + 1, lastSeenAt: now }
    : { count: 1, firstSeenAt: now, lastSeenAt: now };
  try {
    localStorage.setItem(KEY, JSON.stringify(history));
  } catch {
    /* ignore quota errors */
  }
  return history;
}

export function clearEndingHistory(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function hasSeenEnding(id: string, history?: EndingHistory): boolean {
  const h = history ?? loadEndingHistory();
  return Boolean(h[id]?.count);
}
