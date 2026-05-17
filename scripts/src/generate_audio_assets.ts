/**
 * Procedural audio asset generator for Selim in Dhaka.
 *
 * Synthesises WAV PCM data in pure Node (no audio deps) for the
 * minimum SFX / music / ambience set called out in Task #15:
 *
 *   SFX:        card_flip, coin_gain, coin_loss, heartbreak
 *   Music:      menu, day_dhaka, night_dhaka, heartbreak (sting)
 *   Ambience:   street (light day loop), rickshaw (night-ish loop)
 *
 * Each WAV is then transcoded to MP3 via ffmpeg and dropped under
 * artifacts/selim-in-dhaka/public/audio/<bucket>/<id>.mp3.
 *
 * Run with:  pnpm --filter @workspace/scripts run gen:audio
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const SR = 44100;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_BASE = join(ROOT, "artifacts", "selim-in-dhaka", "public", "audio");
const TMP = join(tmpdir(), `audio-gen-${Date.now()}`);
mkdirSync(TMP, { recursive: true });

type Buf = Float32Array;

function buf(seconds: number): Buf {
  return new Float32Array(Math.floor(seconds * SR));
}

function add(dst: Buf, src: Buf, offset = 0, gain = 1) {
  const start = Math.max(0, Math.floor(offset * SR));
  const len = Math.min(src.length, dst.length - start);
  for (let i = 0; i < len; i++) dst[start + i] += src[i] * gain;
}

type Wave = "sine" | "triangle" | "square" | "sawtooth";

function osc(t: number, freq: number, type: Wave): number {
  const phase = (t * freq) % 1;
  switch (type) {
    case "sine": return Math.sin(phase * Math.PI * 2);
    case "triangle": return 4 * Math.abs(phase - 0.5) - 1;
    case "square": return phase < 0.5 ? 1 : -1;
    case "sawtooth": return 2 * phase - 1;
  }
}

/** ADSR-ish envelope: short attack, exponential decay to ~0 by `dur`. */
function tone(dur: number, freq: number, type: Wave = "sine", vol = 0.3): Buf {
  const out = buf(dur + 0.05);
  const atk = 0.012;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let env: number;
    if (t < atk) env = (t / atk) * vol;
    else env = vol * Math.exp(-(t - atk) * (5 / Math.max(0.05, dur)));
    out[i] = osc(t, freq, type) * env;
  }
  return out;
}

/** Pitch-bend tone (exponential glide). */
function sweep(
  dur: number,
  fromFreq: number,
  toFreq: number,
  type: Wave = "sine",
  vol = 0.25,
): Buf {
  const out = buf(dur + 0.05);
  const atk = 0.012;
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const k = Math.min(1, t / dur);
    const f = fromFreq * Math.pow(Math.max(40, toFreq) / fromFreq, k);
    phase += f / SR;
    let env: number;
    if (t < atk) env = (t / atk) * vol;
    else env = vol * Math.exp(-(t - atk) * (5 / Math.max(0.05, dur)));
    let s: number;
    const p = phase % 1;
    if (type === "sine") s = Math.sin(p * Math.PI * 2);
    else if (type === "triangle") s = 4 * Math.abs(p - 0.5) - 1;
    else if (type === "square") s = p < 0.5 ? 1 : -1;
    else s = 2 * p - 1;
    out[i] = s * env;
  }
  return out;
}

function noise(dur: number, vol = 0.2, highpass?: number): Buf {
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) out[i] = (Math.random() * 2 - 1) * vol;
  if (highpass) {
    // simple one-pole highpass
    const rc = 1 / (2 * Math.PI * highpass);
    const dt = 1 / SR;
    const a = rc / (rc + dt);
    let prevIn = 0;
    let prevOut = 0;
    for (let i = 0; i < out.length; i++) {
      const x = out[i];
      const y = a * (prevOut + x - prevIn);
      out[i] = y;
      prevIn = x;
      prevOut = y;
    }
  }
  return out;
}

function fadeInOut(b: Buf, fadeSec: number): Buf {
  const fade = Math.floor(fadeSec * SR);
  for (let i = 0; i < fade && i < b.length; i++) {
    const g = i / fade;
    b[i] *= g;
    b[b.length - 1 - i] *= g;
  }
  return b;
}

function normalize(b: Buf, peak = 0.9): Buf {
  let max = 0;
  for (let i = 0; i < b.length; i++) max = Math.max(max, Math.abs(b[i]));
  if (max === 0) return b;
  const k = peak / max;
  for (let i = 0; i < b.length; i++) b[i] *= k;
  return b;
}

function writeWav(path: string, samples: Buf) {
  const numSamples = samples.length;
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);              // PCM
  buffer.writeUInt16LE(1, 22);              // mono
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * bytesPerSample);
  }
  writeFileSync(path, buffer);
}

function toMp3(wavPath: string, mp3Path: string, bitrate = "96k") {
  mkdirSync(dirname(mp3Path), { recursive: true });
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", wavPath, "-codec:a", "libmp3lame", "-b:a", bitrate, mp3Path],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${mp3Path}`);
}

function render(name: string, samples: Buf, bucket: "sfx" | "music" | "ambience", bitrate = "96k") {
  const wav = join(TMP, `${name}.wav`);
  const mp3 = join(OUT_BASE, bucket, `${name}.mp3`);
  writeWav(wav, samples);
  toMp3(wav, mp3, bitrate);
  console.log(`✓ ${bucket}/${name}.mp3  (${(samples.length / SR).toFixed(2)}s)`);
}

// ── SFX ──────────────────────────────────────────────────────────────────
function sfxCardFlip(): Buf {
  const out = buf(0.18);
  add(out, tone(0.05, 880, "triangle", 0.35));
  add(out, tone(0.07, 1100, "triangle", 0.28), 0.04);
  add(out, noise(0.03, 0.12, 4000), 0.0);
  return normalize(out, 0.85);
}

function sfxCoinGain(): Buf {
  const out = buf(0.30);
  add(out, tone(0.10, 880, "triangle", 0.5));
  add(out, tone(0.14, 1320, "triangle", 0.5), 0.06);
  add(out, tone(0.18, 1760, "sine", 0.35), 0.13);
  return normalize(out, 0.9);
}

function sfxCoinLoss(): Buf {
  const out = buf(0.32);
  add(out, tone(0.12, 440, "triangle", 0.5));
  add(out, tone(0.16, 330, "triangle", 0.5), 0.08);
  add(out, tone(0.18, 247, "sine", 0.35), 0.16);
  return normalize(out, 0.9);
}

function sfxHeartbreak(): Buf {
  // Sad descending chord — D5 C5 A#4 G4
  const notes = [587.33, 523.25, 466.16, 392.0];
  const out = buf(2.4);
  notes.forEach((f, i) => {
    add(out, tone(0.85, f, "triangle", 0.35), i * 0.25);
    add(out, tone(0.85, f * 0.5, "sine", 0.18), i * 0.25);
  });
  // soft string-like sustained pad under it
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.3) * Math.exp(-Math.max(0, t - 1.0) * 1.6);
    out[i] += Math.sin(2 * Math.PI * 196 * t) * 0.06 * env;
    out[i] += Math.sin(2 * Math.PI * 293.66 * t) * 0.05 * env;
  }
  return normalize(out, 0.9);
}

// ── MUSIC LOOPS ──────────────────────────────────────────────────────────
/**
 * Helper to render a melodic loop over `dur` seconds.
 *  - drone: held root + fifth
 *  - melody: sequence of pentatonic notes with given step duration
 */
function musicLoop(opts: {
  dur: number;
  root: number;
  scale: number[];      // semitone offsets from root
  pattern: number[];    // indexes into scale
  stepSec: number;
  melodyType?: Wave;
  melodyVol?: number;
  droneVol?: number;
  noiseVol?: number;
}): Buf {
  const out = buf(opts.dur);
  const root = opts.root;
  const fifth = root * Math.pow(2, 7 / 12);
  const droneVol = opts.droneVol ?? 0.12;
  // Drone: sine root + fifth
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.5) * Math.min(1, (out.length - i) / SR / 0.5);
    out[i] += Math.sin(2 * Math.PI * root * t) * droneVol * env;
    out[i] += Math.sin(2 * Math.PI * fifth * t) * droneVol * 0.7 * env;
    // tiny octave shimmer
    out[i] += Math.sin(2 * Math.PI * root * 2 * t) * droneVol * 0.25 * env;
  }
  // Melody
  const melVol = opts.melodyVol ?? 0.18;
  let step = 0;
  for (let t = 0.05; t + opts.stepSec < opts.dur - 0.1; t += opts.stepSec) {
    const semis = opts.scale[opts.pattern[step % opts.pattern.length]];
    const f = root * Math.pow(2, semis / 12);
    const note = tone(opts.stepSec * 0.95, f, opts.melodyType ?? "sine", melVol);
    add(out, note, t);
    step++;
  }
  if (opts.noiseVol) add(out, fadeInOut(noise(opts.dur, opts.noiseVol, 2000), 1.0), 0);
  fadeInOut(out, 0.4);
  return normalize(out, 0.85);
}

function musicMenu(): Buf {
  // Yaman-ish evening, romantic. Root ~ A3 = 220.
  return musicLoop({
    dur: 16,
    root: 220,
    scale: [0, 2, 4, 6, 7, 9, 11, 12],          // Yaman
    pattern: [0, 2, 4, 6, 7, 6, 4, 2, 0, 4, 7, 12, 11, 7, 4, 2],
    stepSec: 0.45,
    melodyType: "sine",
    melodyVol: 0.16,
    droneVol: 0.10,
  });
}

function musicDayDhaka(): Buf {
  // Folk Desh-flavor major pentatonic, brisker tempo. Root ~ C4 = 261.63.
  return musicLoop({
    dur: 14,
    root: 261.63,
    scale: [0, 2, 5, 7, 9, 12],                  // pentatonic-ish
    pattern: [0, 2, 5, 7, 5, 2, 0, 2, 5, 9, 7, 5, 2, 0],
    stepSec: 0.32,
    melodyType: "triangle",
    melodyVol: 0.18,
    droneVol: 0.08,
  });
}

function musicNightDhaka(): Buf {
  // Bhairavi-flavor, slower, lower. Root ~ G3 = 196.
  return musicLoop({
    dur: 18,
    root: 196,
    scale: [0, 1, 3, 5, 7, 8, 10, 12],          // Bhairavi
    pattern: [0, 3, 5, 7, 5, 3, 1, 0, 3, 5, 8, 7, 5, 3, 1, 0],
    stepSec: 0.55,
    melodyType: "sine",
    melodyVol: 0.14,
    droneVol: 0.12,
    noiseVol: 0.012,
  });
}

function musicHeartbreak(): Buf {
  // Slow descending pad — 6s sting that loops moodily.
  const out = buf(8);
  const notes = [392, 349.23, 311.13, 261.63];   // G4 F4 D#4 C4
  notes.forEach((f, i) => {
    add(out, tone(2.0, f, "sine", 0.25), i * 1.3);
    add(out, tone(2.0, f * 0.5, "sine", 0.18), i * 1.3);
  });
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] += Math.sin(2 * Math.PI * 130.81 * t) * 0.08;     // C3 drone
  }
  fadeInOut(out, 0.6);
  return normalize(out, 0.85);
}

// ── AMBIENCE LOOPS ───────────────────────────────────────────────────────
function ambStreet(): Buf {
  // Light day-ambient: low-freq noise hum + occasional rickshaw bell pings + faint horn.
  const dur = 14;
  const out = buf(dur);
  // Low traffic rumble
  const rumble = noise(dur, 0.10);
  for (let i = 1; i < rumble.length; i++) rumble[i] = rumble[i - 1] * 0.95 + rumble[i] * 0.05;
  add(out, rumble, 0, 1.0);
  // Bell pings
  for (let t = 1.2; t < dur - 1; t += 2.1 + Math.random() * 1.5) {
    add(out, tone(0.16, 2200, "triangle", 0.18), t);
    add(out, tone(0.20, 2400, "triangle", 0.14), t + 0.12);
  }
  // Faint car horn
  for (let t = 3; t < dur - 2; t += 4.5 + Math.random() * 2) {
    add(out, tone(0.22, 380, "sawtooth", 0.10), t);
    add(out, tone(0.22, 420, "square", 0.06), t);
  }
  fadeInOut(out, 0.7);
  return normalize(out, 0.85);
}

function ambRickshaw(): Buf {
  // Rickshaw rolling: pedal-rhythm + bell + soft wind noise.
  const dur = 14;
  const out = buf(dur);
  const wind = noise(dur, 0.06, 600);
  add(out, wind);
  // Rhythmic pedal squeak ~ 1.6/sec
  for (let t = 0; t < dur; t += 0.62) {
    add(out, sweep(0.18, 220, 140, "triangle", 0.08), t);
  }
  // Occasional bells
  for (let t = 2.3; t < dur - 1; t += 3.2 + Math.random() * 1.4) {
    add(out, tone(0.14, 2200, "triangle", 0.16), t);
    add(out, tone(0.18, 2400, "triangle", 0.12), t + 0.11);
  }
  fadeInOut(out, 0.7);
  return normalize(out, 0.85);
}

// ── Main ─────────────────────────────────────────────────────────────────
function main() {
  console.log(`Generating audio assets → ${OUT_BASE}`);
  // SFX
  render("card_flip", sfxCardFlip(), "sfx");
  render("coin_gain", sfxCoinGain(), "sfx");
  render("coin_loss", sfxCoinLoss(), "sfx");
  render("heartbreak", sfxHeartbreak(), "sfx");
  // Music
  render("menu", musicMenu(), "music", "112k");
  render("day_dhaka", musicDayDhaka(), "music", "112k");
  render("night_dhaka", musicNightDhaka(), "music", "112k");
  render("heartbreak", musicHeartbreak(), "music", "112k");
  // Ambience
  render("street", ambStreet(), "ambience", "96k");
  render("rickshaw", ambRickshaw(), "ambience", "96k");

  rmSync(TMP, { recursive: true, force: true });
  console.log("Done.");
}

main();
