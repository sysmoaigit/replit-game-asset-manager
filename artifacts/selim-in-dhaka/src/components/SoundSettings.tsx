import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { audioEngine, AudioSettings } from "../game/audioEngine";
import { ACCENT_LABELS, AccentMode } from "../game/accent";
import { HUMOR_LEVEL_LABELS, type HumorLevel } from "../game/humorContent";
import { tryUnlockEgg } from "../game/easterEggs";
import { notifyEggUnlock } from "./EggUnlockToast";
import { resetSeenHints, isHintsSuppressed, setHintsSuppressed } from "../lib/hintRegistry";
import {
  getAllVoices, getBanglaVoices, hasBanglaVoice,
  getVoicePrefs, updateVoicePrefs, testVoice,
} from "../lib/selimVoice";

interface SoundSettingsProps {
  onClose: () => void;
  reducedMotion?: boolean;
  onSettingsChange?: (partial: Partial<AudioSettings>) => void;
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: 12,
        border: "none",
        background: "rgba(0,0,0,0.06)",
        cursor: "pointer",
        fontFamily: "'Hind Siliguri', sans-serif",
        fontSize: 14,
        color: "#222",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          background: value ? "#22c55e" : "#9ca3af",
          color: "white",
          borderRadius: 8,
          padding: "2px 10px",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {value ? "চালু" : "বন্ধ"}
      </span>
    </button>
  );
}

export default function SoundSettings({
  onClose,
  reducedMotion = false,
  onSettingsChange,
}: SoundSettingsProps) {
  const [settings, setSettings] = useState<AudioSettings>(() => audioEngine.getSettings());
  const [showRecordInstructions, setShowRecordInstructions] = useState(false);
  const [voicePrefs, setVoicePrefs] = useState(() => getVoicePrefs());
  // Voices on most browsers load asynchronously — re-poll briefly so the
  // picker doesn't render an empty list on first open.
  const [voicesTick, setVoicesTick] = useState(0);
  useEffect(() => {
    const tries = [100, 300, 700, 1500];
    const timers = tries.map((ms) => window.setTimeout(() => setVoicesTick((t) => t + 1), ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);
  const banglaVoices = getBanglaVoices();
  const allVoices = getAllVoices();
  const hasBangla = hasBanglaVoice();
  // referenced so React re-renders when async voices arrive
  void voicesTick;

  const updateVoice = useCallback((partial: Parameters<typeof updateVoicePrefs>[0]) => {
    updateVoicePrefs(partial);
    setVoicePrefs(getVoicePrefs());
  }, []);

  const update = useCallback((partial: Partial<AudioSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    audioEngine.updateSettings(partial);
    onSettingsChange?.(partial);
  }, [settings, onSettingsChange]);

  const handleReset = () => {
    audioEngine.resetSettings();
    setSettings(audioEngine.getSettings());
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={reducedMotion ? {} : { scale: 0.92, y: 20 }}
        animate={reducedMotion ? {} : { scale: 1, y: 0 }}
        style={{
          width: "min(94vw, 400px)",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 24,
          background: "linear-gradient(135deg, #FFF8EE, #FFF3E0)",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #FF6B00, #FF8F00)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "white",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            🔊 অডিও সেটিংস
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: 8,
              color: "white",
              padding: "4px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Main toggles */}
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            মূল নিয়ন্ত্রণ
          </p>
          <Toggle label="সব শব্দ (Master Sound)" value={settings.masterEnabled}
            onChange={(v) => update({ masterEnabled: v })} />
          <Toggle label="কণ্ঠস্বর (Voice)" value={settings.voiceEnabled}
            onChange={(v) => update({ voiceEnabled: v })} />
          <Toggle label="সংগীত (Music)" value={settings.musicEnabled}
            onChange={(v) => update({ musicEnabled: v })} />
          <Toggle label="সাউন্ড ইফেক্ট (SFX)" value={settings.sfxEnabled}
            onChange={(v) => update({ sfxEnabled: v })} />
          <Toggle label="সাবটাইটেল (Subtitles)" value={settings.subtitlesEnabled}
            onChange={(v) => update({ subtitlesEnabled: v })} />
          <Toggle label="কম অ্যানিমেশন (Reduced Motion)" value={settings.reducedMotion}
            onChange={(v) => update({ reducedMotion: v })} />

          {/* Accent Mode */}
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            সেলিমের টান (Accent Flavor)
          </p>
          {(["light", "medium", "standard"] as AccentMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => update({ accentMode: mode })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: `2px solid ${settings.accentMode === mode ? "#FF6B00" : "transparent"}`,
                background: settings.accentMode === mode
                  ? "rgba(255,107,0,0.12)"
                  : "rgba(0,0,0,0.06)",
                cursor: "pointer",
                fontFamily: "'Hind Siliguri', sans-serif",
                fontSize: 13,
                color: settings.accentMode === mode ? "#FF6B00" : "#333",
                fontWeight: settings.accentMode === mode ? 700 : 400,
                textAlign: "left",
              }}
            >
              {ACCENT_LABELS[mode]}
            </button>
          ))}

          {/* Humor Level */}
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            😄 হিউমার লেভেল (Humor Level)
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["mild", "standard", "full"] as HumorLevel[]).map((val) => (
              <button
                key={val}
                onClick={() => {
                  update({ humorLevel: val });
                  if (val === "full") notifyEggUnlock(tryUnlockEgg("humor_full_bogura"));
                }}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 10,
                  border: `2px solid ${settings.humorLevel === val ? "#FF6B00" : "transparent"}`,
                  background: settings.humorLevel === val
                    ? "rgba(255,107,0,0.12)"
                    : "rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  fontFamily: "'Hind Siliguri', sans-serif",
                  fontSize: 12,
                  color: settings.humorLevel === val ? "#FF6B00" : "#333",
                  fontWeight: settings.humorLevel === val ? 700 : 400,
                }}
              >
                {HUMOR_LEVEL_LABELS[val]}
              </button>
            ))}
          </div>

          {/* Voice Frequency */}
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            কণ্ঠস্বরের ঘনত্ব (Voice Line Frequency)
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { val: "low", label: "কম" },
              { val: "normal", label: "স্বাভাবিক" },
              { val: "high", label: "বেশি" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => update({ voiceFrequency: val as AudioSettings["voiceFrequency"] })}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 10,
                  border: `2px solid ${settings.voiceFrequency === val ? "#FF6B00" : "transparent"}`,
                  background: settings.voiceFrequency === val
                    ? "rgba(255,107,0,0.12)"
                    : "rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  fontFamily: "'Hind Siliguri', sans-serif",
                  fontSize: 12,
                  color: settings.voiceFrequency === val ? "#FF6B00" : "#333",
                  fontWeight: settings.voiceFrequency === val ? 700 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Browser Bangla Voice (TTS) ────────────────────────────── */}
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            🗣️ ব্রাউজার ভয়েস (Browser TTS)
          </p>

          {!hasBangla && (
            <div
              data-testid="no-bangla-voice-warning"
              style={{
                background: "rgba(251,191,36,0.12)",
                border: "1px solid rgba(251,191,36,0.4)",
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 12,
                color: "#92400e",
                fontFamily: "'Hind Siliguri', sans-serif",
                lineHeight: 1.5,
              }}
            >
              ⚠️ আপনার ডিভাইসে Bangla ভয়েস পাওয়া যায়নি।
              <br />
              <span style={{ color: "#666", fontSize: 11 }}>
                Android: Settings → Language → Text-to-speech → Bangla install করুন।
                <br />
                iOS: Settings → Accessibility → Spoken Content → Voices → বাংলা।
                <br />
                Windows: Settings → Time &amp; Language → Speech → Add voice → Bangla।
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 11,
                color: "#666",
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
            >
              ভয়েস (Voice)
            </label>
            <select
              data-testid="voice-picker"
              value={voicePrefs.preferredVoiceName}
              onChange={(e) => updateVoice({ preferredVoiceName: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                fontFamily: "'Hind Siliguri', sans-serif",
                fontSize: 13,
                color: "#222",
              }}
            >
              <option value="">Auto (best Bangla voice available)</option>
              {banglaVoices.length > 0 && (
                <optgroup label="Bangla voices">
                  {banglaVoices.map((v) => (
                    <option key={v.name} value={v.name}>{v.name} · {v.lang}</option>
                  ))}
                </optgroup>
              )}
              {allVoices.length > banglaVoices.length && (
                <optgroup label="Other voices (may garble Bangla)">
                  {allVoices.filter((v) => !banglaVoices.includes(v))
                    .slice(0, 30)
                    .map((v) => (
                      <option key={v.name} value={v.name}>{v.name} · {v.lang}</option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label
              style={{
                fontSize: 11,
                color: "#666",
                fontFamily: "'Hind Siliguri', sans-serif",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>স্পিড (Speed)</span>
              <span style={{ color: "#FF6B00", fontWeight: 700 }}>
                {voicePrefs.rate.toFixed(2)}×
              </span>
            </label>
            <input
              data-testid="voice-rate"
              type="range"
              min={0.5}
              max={1.3}
              step={0.05}
              value={voicePrefs.rate}
              onChange={(e) => updateVoice({ rate: parseFloat(e.target.value) })}
              style={{ width: "100%", accentColor: "#FF6B00" }}
            />
          </div>

          <Toggle
            label="শুধু Bangla ভয়েস (skip if missing)"
            value={voicePrefs.strictBangla}
            onChange={(v) => updateVoice({ strictBangla: v })}
          />

          <button
            data-testid="btn-test-voice"
            onClick={() => testVoice(voicePrefs.preferredVoiceName)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,107,0,0.4)",
              background: "rgba(255,107,0,0.08)",
              cursor: "pointer",
              fontFamily: "'Hind Siliguri', sans-serif",
              fontSize: 13,
              color: "#FF6B00",
              fontWeight: 700,
            }}
          >
            🔊 ভয়েস টেস্ট করুন
          </button>

          {/* Record Your Own Selim Voice */}
          <button
            onClick={() => setShowRecordInstructions((v) => !v)}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px dashed #FF6B00",
              background: "rgba(255,107,0,0.05)",
              cursor: "pointer",
              fontFamily: "'Hind Siliguri', sans-serif",
              fontSize: 13,
              color: "#FF6B00",
              fontWeight: 600,
              textAlign: "left",
            }}
          >
            🎙️ নিজের Selim কণ্ঠ রেকর্ড করুন {showRecordInstructions ? "▲" : "▼"}
          </button>

          {showRecordInstructions && (
            <div
              style={{
                background: "rgba(255,107,0,0.08)",
                borderRadius: 12,
                padding: 14,
                fontSize: 12,
                color: "#444",
                fontFamily: "'Hind Siliguri', sans-serif",
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#FF6B00" }}>
                🎙️ কীভাবে করবেন:
              </p>
              <ol style={{ margin: 0, paddingLeft: 16 }}>
                <li>MP3 ফাইল রেকর্ড করুন (প্রতিটি ৫ সেকেন্ডের কম)</li>
                <li><code>public/audio/voice/selim/</code> ফোল্ডারে রাখুন</li>
                <li>ফাইলের নাম হবে line ID + ".mp3" (যেমন: <code>s_greet_morning_01.mp3</code>)</li>
                <li>সব line ID দেখতে: <code>src/game/voiceLines.ts</code></li>
              </ol>
              <p style={{ margin: "8px 0 0", color: "#888", fontSize: 11 }}>
                টিপস: বগুড়ার টানে বলুন। "ভাই" শব্দটা গরম করে বলুন। 44.1kHz, 128kbps MP3।
              </p>
            </div>
          )}

          {/* Hints controls */}
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <Toggle
              label="Hints বন্ধ রাখো"
              value={isHintsSuppressed()}
              onChange={(v) => { setHintsSuppressed(v); setSettings((s) => ({ ...s })); }}
            />
            <button
              data-testid="btn-reset-hints"
              onClick={() => { resetSeenHints(); setSettings((s) => ({ ...s })); }}
              style={{
                width: "100%",
                padding: "8px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,107,0,0.3)",
                background: "rgba(255,107,0,0.06)",
                cursor: "pointer",
                fontFamily: "'Hind Siliguri', sans-serif",
                fontSize: 12,
                color: "#FF6B00",
                fontWeight: 600,
              }}
            >
              💡 Hints আবার দেখাও (reset)
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "rgba(220,38,38,0.1)",
              cursor: "pointer",
              fontFamily: "'Hind Siliguri', sans-serif",
              fontSize: 13,
              color: "#dc2626",
              fontWeight: 600,
            }}
          >
            🔄 অডিও সেটিংস রিসেট করুন
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
