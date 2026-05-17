// Tiny seedable RNG. Default backing is Math.random; daily-challenge mode
// swaps in a deterministic mulberry32 stream seeded from today's date so all
// card / weighted picks are repeatable for that day.

let backing: () => number = Math.random;

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rng(): number {
  return backing();
}

export function setSeededRng(seed: number): void {
  backing = mulberry32(seed);
}

export function clearSeededRng(): void {
  backing = Math.random;
}

export function isSeeded(): boolean {
  return backing !== Math.random;
}
