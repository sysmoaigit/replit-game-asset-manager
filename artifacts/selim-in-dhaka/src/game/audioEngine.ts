import { VOICE_LINES, VoiceLine, VoiceContext, getVoiceLinesForTrigger, pickContextualLine } from "./voiceLines";
import { AccentMode, getSelimLine } from "./accent";
import {
  ESSENTIAL_SFX,
  SHIPPED_SFX_FILES,
  SHIPPED_MUSIC_FILES,
  SHIPPED_AMBIENCE_FILES,
  SHIPPED_VOICE_FILES,
} from "./soundEvents";
import { sounds } from "../audio/sounds";
import type { HumorLevel } from "./humorContent";

/**
 * How long to duck the music/ambience bed for, in milliseconds, when a
 * voice line begins playing. The default value targets the typical 1.5–3s
 * Selim line; the actual duration is overridden per-line where we know
 * the audio length.
 */
const DEFAULT_DUCK_MS = 2200;
const DUCK_TARGET = 0.4; // dip music + ambience to 40% while speaking

export type VoiceFrequency = "low" | "normal" | "high";

export type AudioSettings = {
  masterEnabled: boolean;
  voiceEnabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  subtitlesEnabled: boolean;
  accentMode: AccentMode;
  voiceFrequency: VoiceFrequency;
  /** Humor & charm spice level — gates spicier humor lines and easter-egg copy. */
  humorLevel: HumorLevel;
  reducedMotion: boolean;
  masterVolume: number;
  voiceVolume: number;
  musicVolume: number;
  sfxVolume: number;
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterEnabled:    true,
  voiceEnabled:     true,
  musicEnabled:     true,
  sfxEnabled:       true,
  subtitlesEnabled: true,
  accentMode:       "light",
  voiceFrequency:   "normal",
  humorLevel:       "standard",
  reducedMotion:    false,
  masterVolume:     0.7,
  voiceVolume:      0.9,
  musicVolume:      0.4,
  sfxVolume:        0.7,
};

const AUDIO_SETTINGS_KEY = "selim_audio_settings";

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) } as AudioSettings;
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export type SubtitleEvent = {
  lineId: string;
  speaker: VoiceLine["speaker"];
  text: string;
  mood: VoiceLine["mood"];
  boguraFlavor: boolean;
};

type SubtitleListener = (event: SubtitleEvent | null) => void;

const FREQ_COOLDOWN: Record<VoiceFrequency, number> = {
  low:    20000,
  normal: 8000,
  high:   3000,
};

class AudioEngine {
  private settings: AudioSettings = loadAudioSettings();

  // HTMLAudio elements
  private musicEl: HTMLAudioElement | null = null;
  private ambienceEl: HTMLAudioElement | null = null;
  private currentMusicSrc: string | null = null;
  private currentAmbienceSrc: string | null = null;

  // Per-speaker voice audio elements (no overlap per speaker)
  private speakerAudio: Map<string, HTMLAudioElement> = new Map();

  // Cooldown tracking per line ID
  private lineCooldowns: Map<string, number> = new Map();

  // Global voice cooldown per speaker
  private speakerLastPlayed: Map<string, number> = new Map();

  // Missing file registry (warn once)
  private missingFiles: Set<string> = new Set();
  private warnedFiles: Set<string> = new Set();

  // Subtitle listeners
  private subtitleListeners: SubtitleListener[] = [];
  private subtitleTimer: number | null = null;

  // Web Audio for essential beeps
  private audioCtx: AudioContext | null = null;

  // Status for debug panel
  lastVoiceLine: SubtitleEvent | null = null;
  currentMusic: string | null = null;
  currentAmbience: string | null = null;

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings(): AudioSettings { return { ...this.settings }; }

  /** Alias for getSettings — satisfies the getAudioSettings API contract */
  getAudioSettings(): AudioSettings { return this.getSettings(); }

  updateSettings(partial: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...partial };
    saveAudioSettings(this.settings);
    if (!this.settings.masterEnabled || !this.settings.musicEnabled) {
      this.stopMusic();
      this.stopAmbience();
    }
    this.syncVolumes();
  }

  /** Set master volume (0–1) and sync all playing elements */
  setVolume(channel: "master" | "voice" | "music" | "sfx", value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    if (channel === "master") this.settings.masterVolume = clamped;
    else if (channel === "voice") this.settings.voiceVolume = clamped;
    else if (channel === "music") this.settings.musicVolume = clamped;
    else if (channel === "sfx") this.settings.sfxVolume = clamped;
    saveAudioSettings(this.settings);
    this.syncVolumes();
  }

  resetSettings(): void {
    this.settings = { ...DEFAULT_AUDIO_SETTINGS };
    saveAudioSettings(this.settings);
  }

  // ── Subtitle pub/sub ──────────────────────────────────────────────────────
  onSubtitle(listener: SubtitleListener): () => void {
    this.subtitleListeners.push(listener);
    return () => {
      this.subtitleListeners = this.subtitleListeners.filter((l) => l !== listener);
    };
  }

  private emitSubtitle(event: SubtitleEvent | null): void {
    if (this.subtitleTimer !== null) {
      window.clearTimeout(this.subtitleTimer);
      this.subtitleTimer = null;
    }
    this.subtitleListeners.forEach((l) => l(event));
    if (event) {
      const dur = event.text.length < 30 ? 3000 : 5000;
      this.subtitleTimer = window.setTimeout(() => {
        this.subtitleListeners.forEach((l) => l(null));
        this.subtitleTimer = null;
      }, dur);
    }
  }

  dismissSubtitle(): void {
    this.emitSubtitle(null);
  }

  // ── Missing file tracking ─────────────────────────────────────────────────
  getMissingFiles(): string[] { return Array.from(this.missingFiles); }

  private markMissing(src: string): void {
    this.missingFiles.add(src);
    if (!this.warnedFiles.has(src)) {
      console.warn(`[AudioEngine] Missing audio file: ${src}`);
      this.warnedFiles.add(src);
    }
  }

  // ── Web Audio context (for essential beeps) ───────────────────────────────
  private ensureCtx(): AudioContext | null {
    if (this.audioCtx) return this.audioCtx;
    try {
      const Ctor = (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      this.audioCtx = new Ctor();
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  unlock(): void {
    const ctx = this.ensureCtx();
    if (ctx?.state === "suspended") void ctx.resume();
  }

  private playBeep(freq: number, dur: number, vol = 0.2): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private essentialBeep(sfxId: string): void {
    switch (sfxId) {
      case "ui_click":             this.playBeep(660, 0.06); break;
      case "stat_up":              this.playBeep(880, 0.1);
                                   setTimeout(() => this.playBeep(1100, 0.1), 80); break;
      case "stat_down":            this.playBeep(440, 0.12);
                                   setTimeout(() => this.playBeep(330, 0.12), 80); break;
      case "achievement_unlock":   [523, 659, 784, 1047].forEach((f, i) =>
                                     setTimeout(() => this.playBeep(f, 0.15, 0.25), i * 70)); break;
      case "emotional_override_alarm":
                                   this.playBeep(200, 0.3, 0.3);
                                   setTimeout(() => this.playBeep(180, 0.3, 0.3), 200); break;
      default: break;
    }
  }

  // ── SFX ──────────────────────────────────────────────────────────────────
  /**
   * Play a registered SFX. Procedural-first as of Task #8.
   *
   * Policy:
   *   - If the id is listed in SHIPPED_SFX_FILES, attempt the MP3 first
   *     so real assets take precedence when Task #15 lands. On MP3
   *     failure, fall back to the procedural synth.
   *   - Otherwise (the default today) play the procedural synth
   *     directly — no network attempt, no console warning. This is
   *     the explicit "use the new synth palette" policy for the
   *     refreshed ids that ship with this overhaul.
   *   - Last-resort essentialBeep for any id without a synth match.
   */
  playSfx(sfxId: string): void {
    if (!this.settings.masterEnabled || !this.settings.sfxEnabled) return;

    // Keep the procedural SFX bus volume in sync with the user's slider.
    sounds.setSfxGain(this.settings.masterVolume * this.settings.sfxVolume);

    const useMp3 = SHIPPED_SFX_FILES.has(sfxId);
    if (!useMp3) {
      if (sounds.playSfxById(sfxId)) return;
      if (ESSENTIAL_SFX.has(sfxId)) this.essentialBeep(sfxId);
      return;
    }

    const src = `/audio/sfx/${sfxId}.mp3`;
    const audio = new Audio(src);
    audio.volume = this.settings.masterVolume * this.settings.sfxVolume;
    const fallback = () => {
      this.markMissing(src);
      if (sounds.playSfxById(sfxId)) return;
      if (ESSENTIAL_SFX.has(sfxId)) this.essentialBeep(sfxId);
    };
    audio.onerror = fallback;
    audio.play().catch(fallback);
  }

  // ── Music ducking ─────────────────────────────────────────────────────────
  /**
   * Ducks the music + ambience HTMLAudioElements to DUCK_TARGET for the
   * given duration so a voice line stays intelligible. Restores via a
   * scheduled timer; overlapping calls extend the duck window.
   */
  private duckTimer: number | null = null;
  private duckActive = false;
  private duckForVoice(durationMs: number = DEFAULT_DUCK_MS): void {
    // Procedural music bed: smooth ramp via Web Audio (handles cancel/restore).
    sounds.duckMusic(durationMs, DUCK_TARGET);

    // HTMLAudioElement music + ambience: linear dip + restore.
    const baseMusic = this.settings.masterVolume * this.settings.musicVolume;
    const baseAmb = this.settings.masterVolume * this.settings.musicVolume * 0.6;
    if (this.musicEl) this.musicEl.volume = baseMusic * DUCK_TARGET;
    if (this.ambienceEl) this.ambienceEl.volume = baseAmb * DUCK_TARGET;
    this.duckActive = true;
    if (this.duckTimer !== null) window.clearTimeout(this.duckTimer);
    this.duckTimer = window.setTimeout(() => {
      this.duckActive = false;
      this.duckTimer = null;
      this.syncVolumes();
    }, durationMs);
  }

  // ── Music ─────────────────────────────────────────────────────────────────
  /**
   * Play a music track. Tries the manifest MP3 first; if it fails to
   * play (404 / decode / autoplay block) we fall back to the procedural
   * Web Audio music bed so the scene is never silent.
   */
  playMusic(trackId: string): void {
    if (!this.settings.masterEnabled || !this.settings.musicEnabled) return;
    if (this.currentMusic === trackId) return;
    this.stopMusic();

    sounds.setMusicGain(this.settings.masterVolume * this.settings.musicVolume);

    // Procedural-first unless an MP3 has been registered for this id.
    if (!SHIPPED_MUSIC_FILES.has(trackId)) {
      sounds.startMusic(trackId);
      this.currentMusic = trackId;
      return;
    }

    const src = `/audio/music/${trackId}.mp3`;
    const el = new Audio(src);
    el.loop = true;
    el.volume = this.settings.masterVolume * this.settings.musicVolume;
    const fallback = () => {
      this.markMissing(src);
      sounds.startMusic(trackId);
      this.currentMusic = trackId;
    };
    el.onerror = fallback;
    el.play().then(() => {
      this.musicEl = el;
      this.currentMusicSrc = src;
      this.currentMusic = trackId;
    }).catch(fallback);
  }

  stopMusic(): void {
    if (this.musicEl) {
      this.musicEl.pause();
      this.musicEl.src = "";
      this.musicEl = null;
    }
    sounds.stopMusic();
    this.currentMusicSrc = null;
    this.currentMusic = null;
  }

  // ── Ambience ──────────────────────────────────────────────────────────────
  /**
   * Play a looping ambience bed for a location. Tries the manifest MP3
   * first; if missing, falls back to a procedural noise + accent bed
   * tuned per location (street horns, tea-stall kettles, etc.).
   */
  playAmbience(locationId: string): void {
    if (!this.settings.masterEnabled || !this.settings.musicEnabled) return;
    if (this.currentAmbience === locationId) return;
    this.stopAmbience();

    // Procedural-first unless an MP3 ambience bed has been registered.
    if (!SHIPPED_AMBIENCE_FILES.has(locationId)) {
      sounds.setAmbienceGain(this.settings.masterVolume * this.settings.musicVolume * 0.6);
      sounds.startAmbience(locationId);
      this.currentAmbience = locationId;
      return;
    }

    const src = `/audio/ambience/${locationId}.mp3`;
    const el = new Audio(src);
    el.loop = true;
    el.volume = this.settings.masterVolume * this.settings.musicVolume * 0.6;
    const fallback = () => {
      this.markMissing(src);
      sounds.setAmbienceGain(this.settings.masterVolume * this.settings.musicVolume * 0.6);
      sounds.startAmbience(locationId);
      this.currentAmbience = locationId;
    };
    el.onerror = fallback;
    el.play().then(() => {
      this.ambienceEl = el;
      this.currentAmbienceSrc = src;
      this.currentAmbience = locationId;
    }).catch(fallback);
  }

  stopAmbience(): void {
    if (this.ambienceEl) {
      this.ambienceEl.pause();
      this.ambienceEl.src = "";
      this.ambienceEl = null;
    }
    sounds.stopAmbience();
    this.currentAmbienceSrc = null;
    this.currentAmbience = null;
  }

  // ── Voice line playback ───────────────────────────────────────────────────
  private canPlayLine(line: VoiceLine): boolean {
    if (!this.settings.masterEnabled || !this.settings.voiceEnabled) return false;
    const freq = this.settings.voiceFrequency;
    const now = Date.now();

    // Per-line cooldown
    const lineCooldown = line.cooldownMs ?? 12000;
    const lastLine = this.lineCooldowns.get(line.id) ?? 0;
    if (now - lastLine < lineCooldown) return false;

    // Per-speaker cooldown based on frequency setting
    const speakerCooldown = FREQ_COOLDOWN[freq];
    const lastSpeaker = this.speakerLastPlayed.get(line.speaker) ?? 0;
    if (now - lastSpeaker < speakerCooldown) return false;

    return true;
  }

  playVoiceLine(lineId: string): void {
    const rawLine = VOICE_LINES.find((l) => l.id === lineId);
    if (!rawLine) return;

    const line = rawLine.speaker === "selim"
      ? (getSelimLine(lineId, this.settings.accentMode) ?? rawLine)
      : rawLine;

    if (!this.canPlayLine(line)) {
      // Still show subtitle if subtitles are on
      if (this.settings.subtitlesEnabled) {
        this.emitSubtitle({
          lineId: line.id,
          speaker: line.speaker,
          text: line.text,
          mood: line.mood,
          boguraFlavor: line.boguraFlavor ?? false,
        });
      }
      return;
    }

    const src = `/audio/voice/${line.speaker}/${line.id}.mp3`;
    const now = Date.now();

    // Stop previous audio for this speaker (no overlap)
    const prevAudio = this.speakerAudio.get(line.speaker);
    if (prevAudio) {
      prevAudio.pause();
      prevAudio.src = "";
    }

    // Synth-only path: when no MP3 ships for this voice line, skip the
    // network fetch entirely so the console isn't spammed with missing-
    // file warnings. Play a contextual non-verbal blip + the subtitle.
    const isShipped = SHIPPED_VOICE_FILES.has(`${line.speaker}/${line.id}`);
    if (!isShipped) {
      if (line.speaker === "selim") {
        const blip =
          line.mood === "happy" || line.mood === "excited" || line.mood === "playful" ? "selim_laugh" :
          line.mood === "sad" || line.mood === "tired" || line.mood === "regret" ? "selim_sigh" :
          line.mood === "angry" || line.mood === "defensive" || line.mood === "nervous" ? "selim_surprise" :
          "selim_ack";
        sounds.playSfxById(blip);
      }
      this.duckForVoice(DEFAULT_DUCK_MS);
      this.lineCooldowns.set(line.id, now);
      this.speakerLastPlayed.set(line.speaker, now);
      if (this.settings.subtitlesEnabled) {
        const evt: SubtitleEvent = {
          lineId: line.id,
          speaker: line.speaker,
          text: line.text,
          mood: line.mood,
          boguraFlavor: line.boguraFlavor ?? false,
        };
        this.lastVoiceLine = evt;
        this.emitSubtitle(evt);
      }
      return;
    }

    const audio = new Audio(src);
    audio.volume = this.settings.masterVolume * this.settings.voiceVolume;

    // When the voice file actually starts playing, duck the music bed
    // for the line's real duration (so short blips don't dip music for
    // the full default window).
    audio.onloadedmetadata = () => {
      const ms = isFinite(audio.duration) && audio.duration > 0
        ? Math.min(8000, audio.duration * 1000 + 250)
        : DEFAULT_DUCK_MS;
      this.duckForVoice(ms);
    };

    // For lines without a shipped MP3, play a tiny non-verbal blip from
    // the procedural engine so the subtitle has audible accompaniment,
    // and still duck the bed briefly.
    const onMissing = () => {
      this.markMissing(src);
      if (line.speaker === "selim") {
        const blip =
          line.mood === "happy" ? "selim_laugh" :
          line.mood === "sad" ? "selim_sigh" :
          line.mood === "angry" ? "selim_surprise" :
          "selim_ack";
        sounds.playSfxById(blip);
      }
      this.duckForVoice(DEFAULT_DUCK_MS);
    };
    audio.onerror = onMissing;
    audio.play().catch(onMissing);

    this.speakerAudio.set(line.speaker, audio);
    this.lineCooldowns.set(line.id, now);
    this.speakerLastPlayed.set(line.speaker, now);

    if (this.settings.subtitlesEnabled) {
      const evt: SubtitleEvent = {
        lineId: line.id,
        speaker: line.speaker,
        text: line.text,
        mood: line.mood,
        boguraFlavor: line.boguraFlavor ?? false,
      };
      this.lastVoiceLine = evt;
      this.emitSubtitle(evt);
    }
  }

  /**
   * Pick and play a voice line for a trigger. When `ctx` is provided, the
   * picker filters lines by stat thresholds and prefers lines tagged for
   * the current location/card. When `ctx` is omitted the legacy random
   * behavior is preserved (no regression to existing call sites).
   */
  playVoiceForTrigger(
    trigger: string,
    speaker: VoiceLine["speaker"] = "selim",
    ctx?: VoiceContext,
  ): void {
    if (!this.settings.masterEnabled || !this.settings.voiceEnabled) return;

    if (ctx) {
      // Smart pick: also tell the picker what's playable so cooldowns are respected.
      const fullCtx: VoiceContext = { ...ctx, boguraAccent: ctx.boguraAccent ?? (this.settings.accentMode !== "standard") };
      const line = pickContextualLine(trigger, fullCtx, speaker, (l) => this.canPlayLine(l));
      if (line) this.playVoiceLine(line.id);
      return;
    }

    // Legacy random path — unchanged behavior for callers that don't pass context.
    const candidates = getVoiceLinesForTrigger(trigger, speaker);
    if (candidates.length === 0) return;
    const playable = candidates.filter((l) => this.canPlayLine(l));
    const pool = playable.length > 0 ? playable : candidates;
    const line = pool[Math.floor(Math.random() * pool.length)];
    this.playVoiceLine(line.id);
  }

  // ── Volume sync ───────────────────────────────────────────────────────────
  syncVolumes(): void {
    const dip = this.duckActive ? DUCK_TARGET : 1;
    if (this.musicEl) {
      this.musicEl.volume = this.settings.masterVolume * this.settings.musicVolume * dip;
    }
    if (this.ambienceEl) {
      this.ambienceEl.volume = this.settings.masterVolume * this.settings.musicVolume * 0.6 * dip;
    }
    sounds.setSfxGain(this.settings.masterVolume * this.settings.sfxVolume);
    sounds.setMusicGain(this.settings.masterVolume * this.settings.musicVolume * dip);
    // Procedural ambience bed obeys master * music sliders too — same
    // factor (× 0.6) as the HTMLAudio ambience path so the two are
    // mix-equivalent. Dip applies during voice ducking.
    sounds.setAmbienceGain(this.settings.masterVolume * this.settings.musicVolume * 0.6 * dip);
  }
}

export const audioEngine = new AudioEngine();
