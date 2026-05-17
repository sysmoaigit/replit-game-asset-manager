import {
  MemoryItem,
  MemoryKind,
  InsideJoke,
  SavedPromise,
  DiaryEntry,
  SelimMemoryStore,
  SelimMood,
} from "./types";

const STORE_KEY = "selim_memory_store_v1";
const PROFILE_KEY = "selim_player_profile_v1";

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function emptyStore(): SelimMemoryStore {
  return {
    memories: [],
    insideJokes: [],
    savedPromises: [],
    diaryEntries: [],
    continuityRecap: null,
    lastDay: 1,
  };
}

export function loadStore(): SelimMemoryStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<SelimMemoryStore>;
    const empty = emptyStore();
    return {
      memories: Array.isArray(parsed.memories) ? parsed.memories : empty.memories,
      insideJokes: Array.isArray(parsed.insideJokes) ? parsed.insideJokes : empty.insideJokes,
      savedPromises: Array.isArray(parsed.savedPromises) ? parsed.savedPromises : empty.savedPromises,
      diaryEntries: Array.isArray(parsed.diaryEntries) ? parsed.diaryEntries : empty.diaryEntries,
      continuityRecap: typeof parsed.continuityRecap === "string" ? parsed.continuityRecap : empty.continuityRecap,
      lastDay: typeof parsed.lastDay === "number" ? parsed.lastDay : empty.lastDay,
    };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: SelimMemoryStore): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch { /* ignore quota errors */ }
}

export function addMemory(
  store: SelimMemoryStore,
  kind: MemoryKind,
  content: string,
  tags: string[] = [],
  score = 50,
): SelimMemoryStore {
  const item: MemoryItem = {
    id: generateId(),
    kind,
    content,
    timestamp: Date.now(),
    pinned: false,
    score,
    tags,
    referenceCount: 0,
  };
  return { ...store, memories: [...store.memories, item] };
}

export function pinMemory(store: SelimMemoryStore, id: string): SelimMemoryStore {
  return {
    ...store,
    memories: store.memories.map((m) =>
      m.id === id ? { ...m, pinned: !m.pinned } : m
    ),
  };
}

export function deleteMemory(store: SelimMemoryStore, id: string): SelimMemoryStore {
  return { ...store, memories: store.memories.filter((m) => m.id !== id) };
}

export function resetMemories(store: SelimMemoryStore): SelimMemoryStore {
  return { ...store, memories: [], insideJokes: [], savedPromises: [], diaryEntries: [], continuityRecap: null };
}

export function exportStore(store: SelimMemoryStore): string {
  return JSON.stringify(store, null, 2);
}

export function importStore(json: string): SelimMemoryStore {
  try {
    const parsed = JSON.parse(json) as SelimMemoryStore;
    if (!parsed.memories) throw new Error("invalid");
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function trackInsideJoke(store: SelimMemoryStore, phrase: string): SelimMemoryStore {
  const existing = store.insideJokes.find(
    (j) => j.phrase.toLowerCase() === phrase.toLowerCase()
  );
  if (existing) {
    const updated = store.insideJokes.map((j) =>
      j.phrase.toLowerCase() === phrase.toLowerCase()
        ? { ...j, repeatCount: j.repeatCount + 1, lastSeen: Date.now(), active: j.repeatCount + 1 >= 3 }
        : j
    );
    return { ...store, insideJokes: updated };
  }
  const newJoke: InsideJoke = {
    phrase,
    repeatCount: 1,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    active: false,
  };
  return { ...store, insideJokes: [...store.insideJokes, newJoke] };
}

export function markJokeActive(store: SelimMemoryStore, phrase: string): SelimMemoryStore {
  return {
    ...store,
    insideJokes: store.insideJokes.map((j) =>
      j.phrase.toLowerCase() === phrase.toLowerCase() ? { ...j, active: true } : j
    ),
  };
}

export function savePromise(store: SelimMemoryStore, text: string): SelimMemoryStore {
  const p: SavedPromise = {
    id: generateId(),
    text,
    timestamp: Date.now(),
    reminded: false,
  };
  return { ...store, savedPromises: [...store.savedPromises, p] };
}

export function markPromiseReminded(store: SelimMemoryStore, id: string): SelimMemoryStore {
  return {
    ...store,
    savedPromises: store.savedPromises.map((p) =>
      p.id === id ? { ...p, reminded: true } : p
    ),
  };
}

export function addDiaryEntry(
  store: SelimMemoryStore,
  day: number,
  text: string,
  mood: SelimMood,
): SelimMemoryStore {
  const entry: DiaryEntry = { day, text, timestamp: Date.now(), mood };
  return { ...store, diaryEntries: [...store.diaryEntries, entry], lastDay: day };
}

export function setRecap(store: SelimMemoryStore, recap: string): SelimMemoryStore {
  return { ...store, continuityRecap: recap };
}

export function bumpReferenceCount(store: SelimMemoryStore, id: string): SelimMemoryStore {
  return {
    ...store,
    memories: store.memories.map((m) =>
      m.id === id ? { ...m, referenceCount: m.referenceCount + 1 } : m
    ),
  };
}

export function clearProfileData(): void {
  localStorage.removeItem(PROFILE_KEY);
}
