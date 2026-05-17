/**
 * Dhaka Sound Engine — procedurally generated SFX, ambience, and music loops.
 *
 * Every sound the player hears today is synthesized here through the Web
 * Audio API; no external sample files are required. The engine exposes:
 *
 *   - Named convenience methods (rickshawBell, cardFlip, …) used by older
 *     call sites.
 *   - playSfxById(id) — the unified router used by AudioEngine to play any
 *     SFX trigger procedurally when no MP3 ships for that id.
 *   - startMusic(mood) — looping pad / arpeggio music bed.
 *
 * Refreshed for Task #8 (Sound Overhaul):
 *   - Master DynamicsCompressor smooths peaks and prevents clipping when
 *     several SFX overlap.
 *   - Dedicated SFX gain bus so per-SFX volume can be sync'd from the
 *     AudioSettings sliders.
 *   - Warmer default timbres (triangle / sine instead of square / sawtooth).
 *   - New sounds: lucky-pull sparkle, rare-cameo sting, four Selim
 *     non-verbal blips (ack / laugh / sigh / surprise), UI hover / toggle
 *     / back, soft confirm / cancel pair.
 */

type OscType = OscillatorType;

class DhakaSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private enabled = true;
  private musicNodes: OscillatorNode[] = [];
  private musicTimer: number | null = null;
  private tablaTimer: number | null = null;
  private patternSwapTimer: number | null = null;
  private currentMusicTrack: string | null = null;

  // Procedural ambience bed state (separate from music so the two can layer).
  // ambBus: long-lived gain node wired to the master bus, controlled by the
  // user's master * music sliders (ambience inherits the music slider, same
  // as the HTMLAudioElement ambience path which uses musicVolume * 0.6).
  // ambSceneGain: per-scene gain that lives only as long as the current
  // ambience preset; lets us cleanly dispose nodes between scene changes.
  private ambNodes: AudioScheduledSourceNode[] = [];
  private ambBus: GainNode | null = null;
  private ambSceneGain: GainNode | null = null;
  private ambTimer: number | null = null;
  private currentAmbTrack: string | null = null;

  private ensureCtx(): boolean {
    if (this.ctx) return true;
    try {
      const Ctor = (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      this.ctx = new Ctor();

      // Master compressor → keeps overlapping SFX from clipping the bus.
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 18;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.18;
      comp.connect(this.ctx.destination);
      this.compressor = comp;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.45;
      this.masterGain.connect(comp);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.12;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.9;
      this.sfxGain.connect(this.masterGain);

      // Dedicated ambience bus — slider-controlled, independent from music
      // so we can duck them together but adjust separately if ever needed.
      this.ambBus = this.ctx.createGain();
      this.ambBus.gain.value = 0.6 * 0.3; // matches HTMLAudio ambience factor
      this.ambBus.connect(this.masterGain);
      return true;
    } catch {
      return false;
    }
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) this.stopMusic();
  }

  /** Adjust the SFX bus gain (0..1) — wired from AudioSettings.sfxVolume. */
  setSfxGain(v: number) {
    if (!this.ensureCtx() || !this.sfxGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), t, 0.05);
  }

  /** Adjust the music bus gain (0..1) — wired from AudioSettings.musicVolume. */
  setMusicGain(v: number) {
    if (!this.ensureCtx() || !this.musicGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.3, t, 0.05);
  }

  /**
   * Adjust the ambience bus gain (0..1). AudioEngine drives this with
   * masterVolume * musicVolume * 0.6 so the procedural ambience bed
   * obeys the same Settings sliders (master + music) as the
   * HTMLAudioElement ambience path. Ambience also fully mutes when
   * either slider is at 0.
   */
  setAmbienceGain(v: number) {
    if (!this.ensureCtx() || !this.ambBus || !this.ctx) return;
    const t = this.ctx.currentTime;
    // 0.3 baseline factor keeps the procedural noise bed from being too loud
    // even at slider=1; matches the music bus scaling used above.
    this.ambBus.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.3, t, 0.05);
  }

  /**
   * Smoothly duck both the music AND ambience buses to a target
   * multiplier for `durationMs` and then restore them. Used by
   * AudioEngine while a voice line is speaking so dialogue stays
   * intelligible over the bed.
   */
  duckMusic(durationMs: number, target = 0.35) {
    if (!this.ensureCtx() || !this.ctx) return;
    const t = this.ctx.currentTime;
    const dipBus = (g: GainNode | null) => {
      if (!g) return;
      const original = g.gain.value;
      const lowered = original * target;
      g.gain.cancelScheduledValues(t);
      g.gain.setTargetAtTime(lowered, t, 0.08);
      g.gain.setTargetAtTime(original, t + durationMs / 1000, 0.18);
    };
    dipBus(this.musicGain);
    dipBus(this.ambBus);
  }

  /** Must be called from a user gesture (click) to unlock audio on iOS/mobile */
  unlock() {
    if (!this.ensureCtx()) return;
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  // ── Low-level helpers ────────────────────────────────────────────────────
  private bus(): AudioNode | null {
    return this.sfxGain ?? this.masterGain;
  }

  private tone(
    freq: number,
    dur: number,
    type: OscType = "sine",
    vol = 0.3,
    delay = 0,
    target?: AudioNode,
  ) {
    if (!this.enabled || !this.ctx) return;
    const dest = target ?? this.bus();
    if (!dest) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = this.ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(gain).connect(dest);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  /** Pitch-bend tone — useful for sweeps (lucky sparkle, sigh, etc.). */
  private sweep(
    fromFreq: number,
    toFreq: number,
    dur: number,
    type: OscType = "sine",
    vol = 0.25,
    delay = 0,
  ) {
    if (!this.enabled || !this.ctx) return;
    const dest = this.bus();
    if (!dest) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    const t0 = this.ctx.currentTime + delay;
    osc.frequency.setValueAtTime(fromFreq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, toFreq), t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(gain).connect(dest);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noiseBurst(dur: number, vol: number, highpass = 800) {
    if (!this.enabled || !this.ctx) return;
    const dest = this.bus();
    if (!dest) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * vol;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = highpass;
    src.connect(filter).connect(dest);
    src.start();
  }

  // ── DHAKA STREET SFX ─────────────────────────────────────────────────────
  rickshawBell() {
    this.tone(2200, 0.18, "triangle", 0.32);
    this.tone(2400, 0.22, "triangle", 0.25, 0.13);
  }

  carHorn() {
    this.tone(380, 0.25, "sawtooth", 0.22);
    this.tone(420, 0.25, "square", 0.15);
  }

  teaStall() {
    this.tone(1800, 0.4, "sine", 0.18);
    this.tone(2400, 0.35, "sine", 0.12, 0.05);
  }

  azan() {
    this.tone(330, 1.4, "sine", 0.18);
    this.tone(392, 1.6, "sine", 0.14, 0.9);
    this.tone(294, 1.3, "sine", 0.12, 2.2);
  }

  rain() {
    this.noiseBurst(0.6, 0.18, 1500);
  }

  // ── UI / GAMEPLAY SFX ────────────────────────────────────────────────────
  choiceTap() { this.tone(660, 0.06, "sine", 0.14); }

  cardFlip() {
    this.tone(880, 0.05, "triangle", 0.12);
    this.tone(1100, 0.07, "triangle", 0.1, 0.04);
  }

  /** Soft, non-shouty UI tap — used for primary clicks. */
  uiClick() {
    this.tone(720, 0.04, "sine", 0.18);
    this.tone(1080, 0.06, "sine", 0.10, 0.02);
  }

  /** Subtle hover whisper — used on focus / pointer-over for important controls. */
  uiHover() {
    this.tone(1320, 0.04, "sine", 0.06);
  }

  /** Toggle on/off — pitch direction encodes the state. */
  uiToggle(on: boolean) {
    if (on) {
      this.tone(660, 0.05, "triangle", 0.16);
      this.tone(990, 0.07, "triangle", 0.14, 0.03);
    } else {
      this.tone(880, 0.05, "triangle", 0.12);
      this.tone(523, 0.08, "triangle", 0.12, 0.04);
    }
  }

  /** Back / cancel — soft descending pair. */
  uiBack() {
    this.tone(523, 0.05, "sine", 0.14);
    this.tone(392, 0.08, "sine", 0.12, 0.04);
  }

  /** Confirm — bright two-note up. */
  uiConfirm() {
    this.tone(784, 0.06, "triangle", 0.18);
    this.tone(1175, 0.1, "triangle", 0.16, 0.05);
  }

  /** Error — warning blip pair. */
  uiError() {
    this.tone(330, 0.14, "square", 0.18);
    this.tone(247, 0.18, "square", 0.16, 0.08);
  }

  coinGain() {
    this.tone(880, 0.08, "triangle", 0.18);
    this.tone(1320, 0.12, "triangle", 0.18, 0.06);
  }

  coinLoss() {
    this.tone(440, 0.1, "triangle", 0.18);
    this.tone(330, 0.14, "triangle", 0.18, 0.07);
  }

  statUp() {
    this.tone(880, 0.1, "sine", 0.2);
    this.tone(1100, 0.1, "sine", 0.2, 0.08);
  }

  statDown() {
    this.tone(440, 0.12, "triangle", 0.2);
    this.tone(330, 0.12, "triangle", 0.2, 0.08);
  }

  /** Sad descending chord — for heartbreak */
  heartbreak() {
    const notes = [587.33, 523.25, 466.16, 392.0]; // D5, C5, A#4, G4
    notes.forEach((f, i) => this.tone(f, 0.7, "triangle", 0.28, i * 0.22));
  }

  /** Soft butterfly chime — when a love card appears */
  loveChime() {
    this.tone(880, 0.18, "sine", 0.18);
    this.tone(1108, 0.22, "sine", 0.18, 0.08);
    this.tone(1318, 0.3, "sine", 0.18, 0.18);
  }

  /** Lucky-pull sparkle — fast bright cascade for rare positive draws. */
  sparkleLucky() {
    [1320, 1760, 2093, 2637].forEach((f, i) =>
      this.tone(f, 0.16, "sine", 0.22 - i * 0.03, i * 0.05),
    );
    this.noiseBurst(0.08, 0.06, 4000);
  }

  /** Rare cameo sting — short cinematic hit for surprise interruptions. */
  cameoSting() {
    this.tone(196, 0.35, "triangle", 0.32);
    this.tone(294, 0.32, "triangle", 0.24, 0.04);
    this.tone(392, 0.45, "sine", 0.22, 0.1);
    this.noiseBurst(0.15, 0.08, 600);
  }

  /** Promise-made — soft chime + ascending pair. */
  promiseMade() {
    this.tone(659, 0.18, "sine", 0.22);
    this.tone(880, 0.22, "sine", 0.2, 0.1);
  }

  /** Promise-broken — glassy crack. */
  promiseBroken() {
    this.tone(660, 0.08, "square", 0.2);
    this.sweep(880, 220, 0.35, "sawtooth", 0.18, 0.02);
  }

  /** Best-friend chime — warm major triad. */
  bestFriendChime() {
    [523.25, 659.25, 783.99].forEach((f, i) =>
      this.tone(f, 0.3, "sine", 0.22, i * 0.06),
    );
  }

  daySummary() {
    const notes = [523.25, 659.25, 783.99]; // C-E-G
    notes.forEach((f, i) => this.tone(f, 0.25, "sine", 0.24, i * 0.11));
  }

  achievement() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, 0.18, "triangle", 0.26, i * 0.08));
  }

  recoveryStart() {
    this.tone(220, 0.5, "sine", 0.28);
    this.tone(196, 0.7, "sine", 0.26, 0.3);
    this.tone(174.61, 0.9, "sine", 0.24, 0.65);
  }

  endingVictory() {
    const notes = [392, 493.88, 587.33, 783.99, 987.77];
    notes.forEach((f, i) => this.tone(f, 0.4, "triangle", 0.3, i * 0.15));
  }

  endingDefeat() {
    const notes = [392, 369.99, 329.63, 246.94, 196];
    notes.forEach((f, i) => this.tone(f, 0.55, "triangle", 0.24, i * 0.22));
  }

  emotionalOverrideAlarm() {
    this.tone(200, 0.3, "triangle", 0.28);
    this.tone(180, 0.3, "triangle", 0.28, 0.18);
  }

  // ── SELIM NON-VERBAL BLIPS ───────────────────────────────────────────────
  // These cue alongside subtitles when no voice MP3 ships for a line.
  selimAck()      { this.tone(523, 0.08, "sine", 0.18); this.tone(659, 0.08, "sine", 0.18, 0.05); }
  selimLaugh()    { [659, 784, 659, 784].forEach((f, i) => this.tone(f, 0.06, "triangle", 0.14, i * 0.05)); }
  selimSigh()     { this.sweep(440, 220, 0.45, "sine", 0.14); }
  selimSurprise() { this.tone(880, 0.06, "triangle", 0.18); this.tone(1320, 0.1, "triangle", 0.18, 0.05); }

  // ── VIRAL / MEME-STYLE SFX (myinstants-flavored) ─────────────────────────
  // Synthesized in-house so we ship zero audio assets and stay copyright-clean.

  /** Vine boom — deep dramatic BOOM with noise tail. Drops on big shocks. */
  vineBoom() {
    if (!this.enabled || !this.ctx) return;
    const dest = this.bus(); if (!dest) return;
    // Sub-bass sine sweep 120Hz -> 35Hz
    this.sweep(120, 35, 0.55, "sine", 0.5);
    // Punchy noise transient
    const t0 = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 2);
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 180;
    src.buffer = buf;
    g.gain.setValueAtTime(0.45, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
    src.connect(lp).connect(g).connect(dest);
    src.start(t0); src.stop(t0 + 0.22);
  }

  /** "Bruh" — descending vowel-ish tone for cringe / failure moments. */
  bruh() {
    // Triangle sweep with two harmonics, mimics the lazy "bruh" cadence.
    this.sweep(180, 95, 0.32, "triangle", 0.32);
    this.sweep(360, 190, 0.30, "sine", 0.10, 0.02);
  }

  /** Sad violin — sliding string-like notes for despair/rock-bottom beats. */
  sadViolin() {
    // Descending sawtooth glide hits four "notes" with vibrato feel.
    const notes: [number, number][] = [[660, 0], [550, 0.32], [440, 0.62], [330, 0.95]];
    for (const [f, d] of notes) {
      this.sweep(f * 1.05, f * 0.97, 0.45, "sawtooth", 0.14, d);
    }
  }

  /** Air horn — three loud blasts. Hype celebration cue. */
  airHorn() {
    if (!this.enabled || !this.ctx) return;
    const blast = (delay: number) => {
      this.tone(440, 0.18, "sawtooth", 0.30, delay);
      this.tone(660, 0.18, "sawtooth", 0.22, delay);
      this.tone(880, 0.18, "square", 0.14, delay);
    };
    blast(0); blast(0.22); blast(0.44);
  }

  /** Discord-style notification ping — two-note rising bell. */
  discordPing() {
    this.tone(880, 0.12, "sine", 0.32);
    this.tone(1320, 0.18, "sine", 0.28, 0.08);
  }

  /** Owen-Wilson-"wow" — rising vowel sweep. */
  wowMeme() {
    this.sweep(330, 700, 0.45, "sawtooth", 0.22);
    this.sweep(660, 1400, 0.45, "sine", 0.10, 0.02);
  }

  /** Bonk — comical low thud for hard refusals / overrides. */
  bonk() {
    this.sweep(220, 60, 0.18, "sine", 0.45);
    this.tone(180, 0.06, "triangle", 0.20, 0.01);
  }

  /** Tada — quick C-major arpeggio, victory micro-fanfare. */
  tada() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, "triangle", 0.25, i * 0.08));
  }

  /** Nope — descending buzzer "wrong answer" two-tone. */
  nope() {
    this.tone(220, 0.16, "square", 0.28);
    this.tone(110, 0.22, "square", 0.30, 0.16);
  }

  // ── SFX router ───────────────────────────────────────────────────────────
  /**
   * Single entry point used by AudioEngine to play any registered SFX
   * procedurally. Returns true if the id was handled, false otherwise so
   * the caller can decide whether to log a missing-asset warning.
   */
  playSfxById(id: string): boolean {
    switch (id) {
      // UI
      case "ui_click":   this.uiClick(); return true;
      case "ui_hover":   this.uiHover(); return true;
      case "ui_toggle":     this.uiToggle(true); return true;
      case "ui_toggle_off": this.uiToggle(false); return true;
      case "ui_back":    this.uiBack(); return true;
      case "ui_confirm": this.uiConfirm(); return true;
      case "ui_error":   this.uiError(); return true;
      // Card flow
      case "card_flip":  this.cardFlip(); return true;
      case "sparkle_lucky": this.sparkleLucky(); return true;
      case "cameo_sting": this.cameoSting(); return true;
      // Stats / economy
      case "stat_up":    this.statUp(); return true;
      case "stat_down":  this.statDown(); return true;
      case "coin_gain":  this.coinGain(); return true;
      case "coin_loss":  this.coinLoss(); return true;
      // Story beats
      case "heartbreak": this.heartbreak(); return true;
      case "love_chime": this.loveChime(); return true;
      case "promise_made":   this.promiseMade(); return true;
      case "promise_broken": this.promiseBroken(); return true;
      case "best_friend_chime": this.bestFriendChime(); return true;
      case "recovery_start": this.recoveryStart(); return true;
      case "achievement_unlock": this.achievement(); return true;
      case "emotional_override_alarm": this.emotionalOverrideAlarm(); return true;
      case "day_summary": this.daySummary(); return true;
      case "ending_victory": this.endingVictory(); return true;
      case "ending_defeat": this.endingDefeat(); return true;
      // Ambience cues
      case "tea_stall":  this.teaStall(); return true;
      case "rickshaw_bell": this.rickshawBell(); return true;
      case "car_horn":   this.carHorn(); return true;
      case "azan":       this.azan(); return true;
      case "rain":       this.rain(); return true;
      // Selim non-verbal blips
      case "selim_ack":      this.selimAck(); return true;
      case "selim_laugh":    this.selimLaugh(); return true;
      case "selim_sigh":     this.selimSigh(); return true;
      case "selim_surprise": this.selimSurprise(); return true;
      // Viral / meme SFX
      case "vine_boom":    this.vineBoom(); return true;
      case "bruh":         this.bruh(); return true;
      case "sad_violin":   this.sadViolin(); return true;
      case "air_horn":     this.airHorn(); return true;
      case "discord_ping": this.discordPing(); return true;
      case "wow_meme":     this.wowMeme(); return true;
      case "bonk":         this.bonk(); return true;
      case "tada":         this.tada(); return true;
      case "nope":         this.nope(); return true;
      default: return false;
    }
  }

  // ── AMBIENT MUSIC LOOPS ──────────────────────────────────────────────────
  /**
   * Looping music bed based on raga-inspired pentatonic scales. Accepts
   * either a high-level mood OR a manifest track id (heartbreak,
   * pinky_mission, day_dhaka, …) — track ids are mapped onto the
   * underlying mood palettes so the audio manifest stays the source of
   * truth for trigger names.
   */
  /**
   * Procedural music bed — BD raga-flavored melodies + tampura drone + tabla.
   *
   * Each playback is unique:
   *   - random key transposition (±3 semitones)
   *   - random tempo jitter (±15%)
   *   - random melodic phrase from the mood's pattern bank
   *   - phrase swaps to a new random pattern every ~16 notes so the same
   *     mood never loops identically
   *
   * Moods map to classical raga scales tuned for the emotional beat:
   *   - Yaman   → romantic evening (pinky / love / menu)
   *   - Bhairavi→ regret / heartbreak (tense, defeat, rock_bottom)
   *   - Bhairav → morning / spiritual (intro, recovery)
   *   - Khamaj  → light romance (best_friend, pinky_anthem)
   *   - Bhupali → peaceful pentatonic (chad, victory)
   *   - Desh    → folk / day_dhaka (Tagore-flavor casual day)
   */
  startMusic(track: string) {
    if (!this.ensureCtx() || !this.enabled || !this.ctx || !this.musicGain) return;
    if (this.currentMusicTrack === track) return;
    this.stopMusic();
    this.currentMusicTrack = track;

    type Mood =
      | "intro" | "menu" | "day" | "night" | "love" | "tense" | "recovery"
      | "victory" | "defeat" | "boss" | "simp" | "rock_bottom" | "chad" | "pinky_anthem";

    type TablaCycle = "teental" | "dadra" | "kaharwa" | "none";

    type TrackDef = {
      scale: number[];
      base: OscType;
      tempoMs: number;
      patterns: number[][];
      drone?: number;        // root drone Hz
      droneFifth?: boolean;  // add tampura-style perfect 5th
      tabla: TablaCycle;
      noteDecay?: number;    // how fast the note fades (sec)
    };

    // ── BD raga scales (Sa = C4, ~261.63 Hz) ────────────────────────────────
    const C = 261.63;
    const RAGAS = {
      // Bhairavi: all komal — full of regret & longing
      bhairavi: [C, C * 1.0595, C * 1.1892, C * 1.3348, C * 1.4983, C * 1.5874, C * 1.7818, C * 2],
      // Yaman: shuddha + tivra Ma — romantic evening, the king of ragas
      yaman:    [C, C * 1.1225, C * 1.2599, C * 1.4142, C * 1.4983, C * 1.6818, C * 1.8877, C * 2],
      // Bhairav: morning, devotional, komal Re/Dha
      bhairav:  [C, C * 1.0595, C * 1.2599, C * 1.3348, C * 1.4983, C * 1.5874, C * 1.8877, C * 2],
      // Khamaj: light romance, komal Ni — Bangla folk feel
      khamaj:   [C, C * 1.1225, C * 1.2599, C * 1.3348, C * 1.4983, C * 1.6818, C * 1.7818, C * 2],
      // Bhupali: pentatonic, peaceful & noble — boss-mode
      bhupali:  [C, C * 1.1225, C * 1.2599, C * 1.4983, C * 1.6818, C * 2, C * 2.245, C * 2.52],
      // Desh: Tagore-flavor folk, Bangla casual
      desh:     [C, C * 1.1225, C * 1.3348, C * 1.4983, C * 1.7818, C * 2, C * 2.245, C * 2.67],
    };

    const TRACKS: Record<Mood, TrackDef> = {
      // ── Intro fanfare — Selim's signature theme ──────────────────────────
      intro: {
        scale: RAGAS.yaman, base: "triangle", tempoMs: 520,
        drone: C / 2, droneFifth: true, tabla: "teental", noteDecay: 1.4,
        patterns: [
          // "Bogura theke Dhaka" hook — climbing then resolving
          [0, 2, 4, 3, 2, 1, 0, -3, 0, 2, 4, 5, 4, 2, 0],
          [4, 3, 2, 1, 0, 1, 2, 4, 5, 4, 2, 0, -3, 0],
          [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, -3, 0, 2, 4],
        ],
      },
      // ── Main menu — Yaman, gentle, hopeful ───────────────────────────────
      menu: {
        scale: RAGAS.yaman, base: "sine", tempoMs: 720,
        drone: C / 2, droneFifth: true, tabla: "dadra", noteDecay: 1.8,
        patterns: [
          [0, 2, 1, 4, 3, 2, 0, -3],
          [2, 4, 5, 4, 2, 1, 0, 1, 2],
          [0, 1, 2, 3, 2, 1, 4, 2, 0],
          [4, 5, 7, 5, 4, 2, 0, 2, 4],
          [0, 2, 4, 5, 4, 2, 1, 0, -3, 0],
        ],
      },
      // ── Day — Desh raga, walking-around-Dhaka folk feel ──────────────────
      day: {
        scale: RAGAS.desh, base: "sine", tempoMs: 640,
        drone: C / 2, tabla: "kaharwa", noteDecay: 1.4,
        patterns: [
          [0, 1, 2, 3, 4, 3, 2, 1, 0],
          [3, 4, 3, 1, 0, 1, 2, 0, -3],
          [0, 2, 4, 2, 0, -2, 0, 2, 4],
          [1, 2, 3, 4, 3, 4, 5, 3, 1, 0],
          [0, 1, 3, 4, 5, 4, 3, 1, 0],
        ],
      },
      // ── Night — Bhairav, slow, lonely, rooftop in Dhaka ──────────────────
      night: {
        scale: RAGAS.bhairav, base: "sine", tempoMs: 980,
        drone: C / 4, tabla: "none", noteDecay: 2.4,
        patterns: [
          [0, 1, 2, 3, 2, 1, 0, -2],
          [2, 3, 4, 3, 2, 1, 0, -1, 0],
          [0, -1, -2, -1, 0, 2, 1, 0],
          [4, 3, 2, 1, 0, 1, 2, 1, 0, -2],
        ],
      },
      // ── Love — Yaman, romantic, slightly drunk on hope ───────────────────
      love: {
        scale: RAGAS.yaman, base: "triangle", tempoMs: 760,
        drone: C / 2, droneFifth: true, tabla: "dadra", noteDecay: 1.9,
        patterns: [
          [4, 3, 2, 4, 5, 4, 2, 0, -3],
          [2, 4, 5, 4, 7, 5, 4, 2, 0],
          [0, 2, 4, 5, 4, 2, 1, 0, 1, 2],
          [3, 4, 5, 7, 5, 4, 3, 2, 0],
        ],
      },
      // ── Tense — Bhairavi sawtooth, "ki kortesi ami" ──────────────────────
      tense: {
        scale: RAGAS.bhairavi, base: "sawtooth", tempoMs: 480,
        drone: C / 2, tabla: "teental", noteDecay: 1.2,
        patterns: [
          [0, 1, 0, -2, 0, 1, 2, 1, 0],
          [-2, 0, 1, 2, 1, 0, -1, -2, 0],
          [3, 2, 1, 0, -1, 0, 1, 2, 3],
          [0, 1, 2, 3, 2, 1, 0, -2, -3, -2, 0],
        ],
      },
      // ── Recovery — Bhupali pentatonic, calm, hopeful ─────────────────────
      recovery: {
        scale: RAGAS.bhupali, base: "sine", tempoMs: 1050,
        drone: C / 2, tabla: "none", noteDecay: 2.6,
        patterns: [
          [0, 1, 2, 3, 4, 3, 2, 1, 0],
          [2, 3, 4, 3, 2, 1, 0, -2, 0],
          [0, 2, 3, 2, 0, -2, 0, 2, 3],
          [4, 3, 2, 1, 0, 2, 4, 3, 1, 0],
        ],
      },
      // ── Victory — Bhupali bright, triumphant ─────────────────────────────
      victory: {
        scale: RAGAS.bhupali, base: "triangle", tempoMs: 460,
        drone: C, tabla: "teental", noteDecay: 1.3,
        patterns: [
          [0, 2, 4, 5, 4, 2, 0, 4, 5, 7, 5, 4],
          [4, 5, 7, 5, 4, 2, 0, 2, 4, 7],
          [0, 4, 7, 4, 5, 7, 5, 4, 0, 2, 4],
          [2, 4, 7, 5, 4, 7, 5, 4, 2, 0],
        ],
      },
      // ── Defeat — Bhairavi descending, "Selim phone ulta kore rakhlo" ─────
      defeat: {
        scale: RAGAS.bhairavi, base: "sine", tempoMs: 1200,
        drone: C / 4, tabla: "none", noteDecay: 2.8,
        patterns: [
          [0, -1, -2, -3, -2, -1, 0],
          [3, 2, 1, 0, -1, -2, -3],
          [0, 1, 0, -2, -3, -2, 0],
        ],
      },
      // ── Bogura Boss — Khamaj, swaggering, "ami Bogura-r chele" ───────────
      boss: {
        scale: RAGAS.khamaj, base: "triangle", tempoMs: 460,
        drone: C / 2, droneFifth: true, tabla: "teental", noteDecay: 1.4,
        patterns: [
          [0, 2, 4, 5, 7, 5, 4, 2, 0, 4, 5, 7],
          [4, 5, 7, 5, 4, 7, 5, 2, 0, 4],
          [0, 4, 7, 5, 4, 2, 0, 5, 4, 2],
          [7, 5, 4, 7, 5, 4, 2, 0, 2, 4, 7, 5],
        ],
      },
      // ── Simp / Pinky longing — Yaman slow, sweet, sad ────────────────────
      simp: {
        scale: RAGAS.yaman, base: "triangle", tempoMs: 880,
        drone: C / 2, droneFifth: true, tabla: "dadra", noteDecay: 2.2,
        patterns: [
          [0, 2, 4, 5, 4, 2, 0, -3, 0, 2],
          [5, 4, 2, 1, 0, 2, 1, 0, -3, 0],
          [4, 5, 7, 5, 4, 2, 4, 5, 4, 2, 0],
          [0, 2, 4, 5, 4, 7, 5, 4, 2, 0],
        ],
      },
      // ── Rock bottom — Bhairavi sawtooth, very slow, broken ───────────────
      rock_bottom: {
        scale: RAGAS.bhairavi, base: "sawtooth", tempoMs: 1450,
        drone: C / 4, tabla: "none", noteDecay: 3.0,
        patterns: [
          [0, -1, -2, -1, 0, -2, -3, -2, 0],
          [-3, -2, -1, 0, -1, -2, -3, -2],
          [3, 2, 1, 0, -1, -2, -3],
        ],
      },
      // ── Chad — Bhupali confident, wide intervals ─────────────────────────
      chad: {
        scale: RAGAS.bhupali, base: "triangle", tempoMs: 580,
        drone: C / 2, tabla: "teental", noteDecay: 1.5,
        patterns: [
          [0, 4, 7, 4, 0, 5, 4, 0],
          [0, 2, 4, 7, 5, 4, 2, 0, 4],
          [4, 7, 5, 4, 2, 0, 4, 7, 5],
          [0, 7, 5, 4, 2, 0, 5, 4, 0],
        ],
      },
      // ── Pinky anthem — Khamaj, soaring romantic, "Pinky-r jonno" ────────
      pinky_anthem: {
        scale: RAGAS.khamaj, base: "triangle", tempoMs: 680,
        drone: C / 2, droneFifth: true, tabla: "kaharwa", noteDecay: 1.8,
        patterns: [
          [0, 2, 4, 5, 4, 2, 1, 0, 4, 5, 7, 5, 4, 2, 0],
          [4, 5, 4, 2, 0, 2, 4, 5, 7, 4, 2, 0],
          [2, 4, 5, 7, 5, 4, 5, 7, 5, 4, 2, 0, -3, 0],
        ],
      },
    };

    // Map manifest track ids → mood palette
    const TRACK_TO_MOOD: Record<string, Mood> = {
      intro: "intro", viral_intro: "intro", selim_theme: "intro",
      menu: "menu",
      day: "day", day_dhaka: "day",
      night: "night", night_dhaka: "night",
      love: "love", best_friend: "love",
      tense: "tense", heartbreak: "tense",
      recovery: "recovery",
      ending_good: "victory", bogura_boss: "boss", chad_mode: "chad",
      ending_bad: "defeat", rock_bottom: "rock_bottom", silent_selim: "rock_bottom",
      pinky_mission: "simp", pinky_simp: "simp", pinky_anthem: "pinky_anthem",
    };

    const mood: Mood = TRACK_TO_MOOD[track] ?? "menu";
    const def = TRACKS[mood];
    const scale = def.scale;

    // Random key transposition (±3 semitones) for variation across plays
    const semitones = Math.floor(Math.random() * 7) - 3;
    const transpose = Math.pow(2, semitones / 12);
    // Tempo jitter (±15%) so identical-mood runs feel different
    const tempo = def.tempoMs * (0.88 + Math.random() * 0.28);
    const decay = def.noteDecay ?? 1.6;

    let currentPattern: number[] = def.patterns[Math.floor(Math.random() * def.patterns.length)];

    // ── Tampura-style drone (root + 5th + slight detune for warmth) ─────────
    if (def.drone) {
      const rootHz = def.drone * transpose;
      const drone1 = this.ctx.createOscillator();
      drone1.type = "sine";
      drone1.frequency.value = rootHz;
      const dGain1 = this.ctx.createGain();
      dGain1.gain.value = 0.30;
      drone1.connect(dGain1).connect(this.musicGain);
      drone1.start();
      this.musicNodes.push(drone1);

      const drone2 = this.ctx.createOscillator();
      drone2.type = "sine";
      drone2.frequency.value = rootHz + 0.5; // detuned for chorus warmth
      const dGain2 = this.ctx.createGain();
      dGain2.gain.value = 0.18;
      drone2.connect(dGain2).connect(this.musicGain);
      drone2.start();
      this.musicNodes.push(drone2);

      if (def.droneFifth) {
        const drone3 = this.ctx.createOscillator();
        drone3.type = "sine";
        drone3.frequency.value = rootHz * 1.5; // perfect 5th
        const dGain3 = this.ctx.createGain();
        dGain3.gain.value = 0.16;
        drone3.connect(dGain3).connect(this.musicGain);
        drone3.start();
        this.musicNodes.push(drone3);
      }
    }

    // ── Melodic line ────────────────────────────────────────────────────────
    let step = 0;
    const playNote = () => {
      if (!this.ctx || !this.musicGain || !this.enabled) return;
      const idx = currentPattern[step % currentPattern.length];
      const noteIdx = ((idx % scale.length) + scale.length) % scale.length;
      const octave = idx >= scale.length ? 2 : idx < 0 ? 0.5 : 1;
      const f = scale[noteIdx] * octave * transpose;

      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = def.base;
      osc.frequency.value = f;

      // Subtle gamak (slide) — characteristic raga ornament
      const t0 = this.ctx.currentTime;
      if (Math.random() < 0.28) {
        const nextIdx = ((idx + 1) % scale.length + scale.length) % scale.length;
        const slideTo = scale[nextIdx] * octave * transpose;
        osc.frequency.setValueAtTime(f, t0);
        osc.frequency.linearRampToValueAtTime(slideTo, t0 + 0.18);
      }

      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.20, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + decay);
      osc.connect(g).connect(this.musicGain);
      osc.start(t0);
      osc.stop(t0 + decay + 0.1);
      step++;
    };

    // ── Pattern swap — every 12-16 notes pick a fresh phrase ────────────────
    const swapPattern = () => {
      if (def.patterns.length < 2) return;
      let next = currentPattern;
      let tries = 0;
      while (next === currentPattern && tries++ < 4) {
        next = def.patterns[Math.floor(Math.random() * def.patterns.length)];
      }
      currentPattern = next;
      step = 0;
    };

    // ── Tabla — light percussion bed (low tom-ish thumps) ──────────────────
    const tablaPattern: number[] | null = (() => {
      switch (def.tabla) {
        case "teental": return [1, 0, 0, 0.6, 1, 0, 0.5, 0.6, 1, 0, 0, 0.6, 1, 0, 0.5, 0]; // 16-beat
        case "dadra":   return [1, 0, 0.5, 1, 0, 0.5];                                      // 6-beat
        case "kaharwa": return [1, 0, 0.5, 0, 1, 0, 0.5, 0];                                // 8-beat
        default: return null;
      }
    })();

    let beatStep = 0;
    const playTabla = () => {
      if (!tablaPattern || !this.ctx || !this.musicGain || !this.enabled) return;
      const v = tablaPattern[beatStep % tablaPattern.length];
      if (v > 0) {
        const t0 = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(180 - (v >= 1 ? 20 : 0), t0);
        osc.frequency.exponentialRampToValueAtTime(70, t0 + 0.1);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(v * 0.16, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.13);
        osc.connect(g).connect(this.musicGain);
        osc.start(t0);
        osc.stop(t0 + 0.16);
      }
      beatStep++;
    };

    playNote();
    this.musicTimer = window.setInterval(playNote, tempo);
    if (tablaPattern) {
      this.tablaTimer = window.setInterval(playTabla, tempo / 2);
    }
    // Swap melodic phrase every 12-16 notes for true variation
    this.patternSwapTimer = window.setInterval(swapPattern, tempo * (12 + Math.floor(Math.random() * 5)));
  }

  stopMusic() {
    if (this.musicTimer !== null) { clearInterval(this.musicTimer); this.musicTimer = null; }
    if (this.tablaTimer !== null) { clearInterval(this.tablaTimer); this.tablaTimer = null; }
    if (this.patternSwapTimer !== null) { clearInterval(this.patternSwapTimer); this.patternSwapTimer = null; }
    for (const n of this.musicNodes) {
      try { n.stop(); } catch { /* already stopped */ }
    }
    this.musicNodes = [];
    this.currentMusicTrack = null;
  }

  // ── PROCEDURAL AMBIENCE BEDS ─────────────────────────────────────────────
  /**
   * Continuous filtered noise bed used to evoke a real Dhaka location.
   * Built from a long looping noise buffer + a periodic accent SFX
   * (rickshaw bell, tea kettle, distant horn, …) so the player never
   * hears the same exact second twice.
   */
  startAmbience(track: string) {
    if (!this.ensureCtx() || !this.enabled || !this.ctx || !this.ambBus) return;
    if (this.currentAmbTrack === track) return;
    this.stopAmbience();
    this.currentAmbTrack = track;

    type AmbPreset = {
      filterType: BiquadFilterType;
      filterFreq: number;
      noiseGain: number;
      accent?: () => void;
      accentEveryMs?: number;
      drone?: number; // optional sub-bass drone
    };
    // Each manifest ambience id maps to a hand-tuned preset.
    const PRESETS: Record<string, AmbPreset> = {
      // Home / Bogura morning — gentle hiss + distant rickshaw bell + sub drone.
      mess_bari:     { filterType: "lowpass",  filterFreq: 600,  noiseGain: 0.025, drone: 110, accent: () => this.rickshawBell(), accentEveryMs: 11000 },
      bogura_memory: { filterType: "lowpass",  filterFreq: 500,  noiseGain: 0.02,  drone: 98,  accent: () => this.tone(1760, 0.4, "sine", 0.07), accentEveryMs: 9000 },
      // Dhaka streets — mid traffic noise + occasional horn.
      street:        { filterType: "bandpass", filterFreq: 700,  noiseGain: 0.045, accent: () => this.carHorn(), accentEveryMs: 4500 },
      bus_stand:     { filterType: "bandpass", filterFreq: 600,  noiseGain: 0.06,  accent: () => this.carHorn(), accentEveryMs: 3500 },
      rickshaw:      { filterType: "bandpass", filterFreq: 800,  noiseGain: 0.04,  accent: () => this.rickshawBell(), accentEveryMs: 5000 },
      station:       { filterType: "bandpass", filterFreq: 650,  noiseGain: 0.05,  accent: () => this.tone(1600, 0.5, "sine", 0.08), accentEveryMs: 6000 },
      market:        { filterType: "bandpass", filterFreq: 900,  noiseGain: 0.05,  accent: () => this.tone(900 + Math.random() * 400, 0.2, "triangle", 0.06), accentEveryMs: 2500 },
      // Tea stall — kettle + chatter texture.
      cha_stall:     { filterType: "lowpass",  filterFreq: 1200, noiseGain: 0.04,  accent: () => this.teaStall(), accentEveryMs: 6500 },
      food_lane:     { filterType: "lowpass",  filterFreq: 1100, noiseGain: 0.035, accent: () => this.teaStall(), accentEveryMs: 8000 },
      // Quiet / interior.
      office:        { filterType: "highpass", filterFreq: 60,   noiseGain: 0.012, drone: 60 },
      clinic:        { filterType: "highpass", filterFreq: 80,   noiseGain: 0.01,  drone: 55 },
      rooftop:       { filterType: "lowpass",  filterFreq: 800,  noiseGain: 0.03,  drone: 80, accent: () => this.azan(), accentEveryMs: 18000 },
      lake:          { filterType: "lowpass",  filterFreq: 700,  noiseGain: 0.025, drone: 90, accent: () => this.tone(2200, 0.18, "triangle", 0.05), accentEveryMs: 7000 },
    };
    const preset = PRESETS[track] ?? PRESETS.street;

    // 4-second looping noise buffer through a colored filter.
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * 4);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1);

    // Per-scene mixer gain (between the noise/drone and the slider-controlled
    // ambBus). Disposed in stopAmbience so we don't leak between scenes.
    const sceneGain = ctx.createGain();
    sceneGain.gain.value = 1;
    sceneGain.connect(this.ambBus);
    this.ambSceneGain = sceneGain;

    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = preset.filterType;
    filter.frequency.value = preset.filterFreq;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = preset.noiseGain;
    noise.connect(filter).connect(noiseGain).connect(sceneGain);
    noise.start();
    this.ambNodes.push(noise);

    // Optional sub-bass drone for warmth.
    if (preset.drone) {
      const drone = ctx.createOscillator();
      const dGain = ctx.createGain();
      drone.type = "sine";
      drone.frequency.value = preset.drone;
      dGain.gain.value = 0.04;
      drone.connect(dGain).connect(sceneGain);
      drone.start();
      this.ambNodes.push(drone);
    }

    // Periodic accent SFX (rickshaw bell, horn, kettle, …) — these route
    // through the SFX bus by default (via the sound helpers), which is
    // intentional: accents are foreground events, not part of the bed.
    if (preset.accent && preset.accentEveryMs) {
      const fire = () => {
        if (!this.enabled || this.currentAmbTrack !== track) return;
        try { preset.accent!(); } catch { /* ignore */ }
      };
      const schedule = () => {
        if (this.currentAmbTrack !== track) return;
        const base = preset.accentEveryMs!;
        // Jitter ±35% so it never feels metronomic.
        const next = base * (0.65 + Math.random() * 0.7);
        this.ambTimer = window.setTimeout(() => {
          fire();
          schedule();
        }, next);
      };
      schedule();
    }
  }

  stopAmbience() {
    if (this.ambTimer !== null) {
      clearTimeout(this.ambTimer);
      this.ambTimer = null;
    }
    for (const n of this.ambNodes) {
      try { n.stop(); } catch { /* already stopped */ }
    }
    this.ambNodes = [];
    if (this.ambSceneGain) {
      try { this.ambSceneGain.disconnect(); } catch { /* ignore */ }
      this.ambSceneGain = null;
    }
    this.currentAmbTrack = null;
  }
}

export const sounds = new DhakaSoundEngine();
