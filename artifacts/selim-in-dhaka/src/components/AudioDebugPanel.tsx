import { useEffect, useMemo, useState } from "react";
import { audioEngine, type AudioSettings } from "../game/audioEngine";
import { VOICE_LINES, type VoiceLine } from "../game/voiceLines";
import { ESSENTIAL_SFX, LOCATION_AMBIENCE } from "../game/soundEvents";
import type { AccentMode } from "../game/accent";

// Audio Lab is a dev tool. It's gated behind both DEV mode AND a URL flag
// (`?dbg=1`) so the floating "🎵 DBG" badge does not clutter the home screen
// during normal development. Add `?dbg=1` to the URL to bring it back.
const IS_DEV = import.meta.env.DEV
  && typeof window !== "undefined"
  && new URLSearchParams(window.location.search).get("dbg") === "1";

const MUSIC_TRACKS = [
  "menu", "pinky_mission", "heartbreak", "best_friend",
  "recovery", "day_dhaka", "ending_good", "ending_bad",
];

const AMBIENCE_LOCATIONS: string[] = Array.from(
  new Set(
    Object.values(LOCATION_AMBIENCE).filter((v): v is NonNullable<typeof v> => v != null),
  ),
);

const SFX_LIST = Array.from(ESSENTIAL_SFX);

const SPEAKERS: VoiceLine["speaker"][] = ["selim", "pinky", "rafiq", "nila", "cha-mama", "kuddus-bhai"];
const CATEGORIES = Array.from(new Set(VOICE_LINES.map((l) => l.category)));

type DBGTab = "mix" | "music" | "voice" | "sfx" | "missing";

const TABS: { id: DBGTab; label: string; emoji: string }[] = [
  { id: "mix",     label: "Mix",     emoji: "🎚" },
  { id: "music",   label: "Bed",     emoji: "🎵" },
  { id: "voice",   label: "Voice",   emoji: "🎤" },
  { id: "sfx",     label: "SFX",     emoji: "💥" },
  { id: "missing", label: "Missing", emoji: "🔍" },
];

export default function AudioDebugPanel() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<DBGTab>("mix");
  const [missingFiles, setMissingFiles] = useState<string[]>([]);
  const [lastVoice, setLastVoice] = useState<string>("");
  const [currentMusic, setCurrentMusic] = useState<string>("");
  const [currentAmbience, setCurrentAmbience] = useState<string>("");
  const [settings, setSettings] = useState<AudioSettings>(audioEngine.getSettings());
  const [speakerFilter, setSpeakerFilter] = useState<VoiceLine["speaker"] | "all">("selim");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [voiceSearch, setVoiceSearch] = useState("");

  useEffect(() => {
    if (!IS_DEV) return;
    const interval = setInterval(() => {
      setMissingFiles(audioEngine.getMissingFiles());
      setLastVoice(audioEngine.lastVoiceLine
        ? `${audioEngine.lastVoiceLine.speaker}: ${audioEngine.lastVoiceLine.text.slice(0, 38)}…`
        : "—");
      setCurrentMusic(audioEngine.currentMusic ?? "—");
      setCurrentAmbience(audioEngine.currentAmbience ?? "—");
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const update = (partial: Partial<AudioSettings>) => {
    audioEngine.updateSettings(partial);
    setSettings(audioEngine.getSettings());
  };

  const filteredVoiceLines = useMemo(() => {
    const q = voiceSearch.trim().toLowerCase();
    return VOICE_LINES.filter((l) => {
      if (speakerFilter !== "all" && l.speaker !== speakerFilter) return false;
      if (categoryFilter !== "all" && l.category !== categoryFilter) return false;
      if (q && !l.text.toLowerCase().includes(q) && !l.id.toLowerCase().includes(q)) return false;
      return true;
    }).slice(0, 80);
  }, [speakerFilter, categoryFilter, voiceSearch]);

  if (!IS_DEV) return null;

  const sfxBtn = (color: string, bg: string): React.CSSProperties => ({
    background: bg, border: `1px solid ${color}`, borderRadius: 5, color,
    padding: "3px 6px", cursor: "pointer", fontSize: 10, fontFamily: "monospace",
    textAlign: "left",
  });

  return (
    <>
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          position: "fixed", top: 10, left: 10, zIndex: 9999,
          background: "rgba(0,0,0,0.7)", color: "#22c55e",
          border: "1px solid #22c55e", borderRadius: 8, padding: "4px 10px",
          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "monospace",
        }}
      >
        🎵 DBG
      </button>

      {visible && (
        <div
          style={{
            position: "fixed", top: 40, left: 10, zIndex: 9998,
            width: 320, maxHeight: "82vh", overflowY: "auto",
            background: "rgba(0,0,0,0.94)", border: "1px solid #22c55e",
            borderRadius: 12, padding: 10, fontFamily: "monospace",
            fontSize: 11, color: "#22c55e",
          }}
        >
          <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 12 }}>
            🎵 Audio Lab
          </p>

          {/* Now-playing strip */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 8, fontSize: 10 }}>
            <div><span style={{ color: "#999" }}>♪ </span><span style={{ color: "#FFD700" }}>{currentMusic}</span></div>
            <div><span style={{ color: "#999" }}>~ </span><span style={{ color: "#64d2ff" }}>{currentAmbience}</span></div>
            <div style={{ color: "#FF9933", fontSize: 9 }}>→ {lastVoice}</div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 8, borderBottom: "1px solid #14532d" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, background: tab === t.id ? "rgba(34,197,94,0.15)" : "transparent",
                  border: "none", borderBottom: tab === t.id ? "2px solid #22c55e" : "2px solid transparent",
                  color: tab === t.id ? "#22c55e" : "#666",
                  padding: "5px 2px", cursor: "pointer", fontSize: 10,
                  fontFamily: "monospace", fontWeight: tab === t.id ? "bold" : "normal",
                }}
              >
                {t.emoji}<br />{t.label}
              </button>
            ))}
          </div>

          {/* ── MIX TAB ──────────────────────────────────────── */}
          {tab === "mix" && (
            <>
              <div style={{ marginBottom: 6 }}>
                <button
                  onClick={() => update({ masterEnabled: !settings.masterEnabled })}
                  style={{
                    width: "100%", padding: "5px 8px", borderRadius: 6,
                    background: settings.masterEnabled ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                    border: `1px solid ${settings.masterEnabled ? "#22c55e" : "#ef4444"}`,
                    color: settings.masterEnabled ? "#22c55e" : "#ef4444",
                    cursor: "pointer", fontSize: 11, fontWeight: "bold",
                    fontFamily: "monospace",
                  }}
                >
                  {settings.masterEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF"}
                </button>
              </div>

              {([
                ["Master", "masterVolume", "#22c55e"],
                ["Voice", "voiceVolume", "#FF9933"],
                ["Music", "musicVolume", "#FFD700"],
                ["SFX", "sfxVolume", "#64d2ff"],
              ] as [string, keyof AudioSettings, string][]).map(([label, key, color]) => (
                <div key={key} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999" }}>
                    <span>{label}</span>
                    <span style={{ color }}>{Math.round((settings[key] as number) * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={settings[key] as number}
                    onChange={(e) => update({ [key]: Number(e.target.value) } as Partial<AudioSettings>)}
                    style={{ width: "100%", accentColor: color, height: 4 }}
                  />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
                {([
                  ["voiceEnabled", "Voice", "#FF9933"],
                  ["musicEnabled", "Music", "#FFD700"],
                  ["sfxEnabled", "SFX", "#64d2ff"],
                  ["subtitlesEnabled", "Subs", "#a5b4fc"],
                ] as [keyof AudioSettings, string, string][]).map(([key, label, color]) => {
                  const on = !!settings[key];
                  return (
                    <button key={key} onClick={() => update({ [key]: !on } as Partial<AudioSettings>)}
                      style={sfxBtn(on ? color : "#666", on ? `${color}22` : "transparent")}>
                      {on ? "✓" : "○"} {label}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ color: "#666", fontSize: 9, marginBottom: 3 }}>Voice frequency</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                  {(["low", "normal", "high"] as const).map((f) => (
                    <button key={f} onClick={() => update({ voiceFrequency: f })}
                      style={sfxBtn(settings.voiceFrequency === f ? "#22c55e" : "#666", settings.voiceFrequency === f ? "rgba(34,197,94,0.2)" : "transparent")}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ color: "#666", fontSize: 9, marginBottom: 3 }}>Accent / Humor</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, marginBottom: 3 }}>
                  {(["standard", "light", "medium"] as const satisfies readonly AccentMode[]).map((m) => (
                    <button key={m} onClick={() => update({ accentMode: m })}
                      style={sfxBtn(settings.accentMode === m ? "#22c55e" : "#666", settings.accentMode === m ? "rgba(34,197,94,0.2)" : "transparent")}>
                      {m}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                  {(["mild", "standard", "full"] as const).map((h) => (
                    <button key={h} onClick={() => update({ humorLevel: h })}
                      style={sfxBtn(settings.humorLevel === h ? "#FF9933" : "#666", settings.humorLevel === h ? "rgba(255,153,51,0.2)" : "transparent")}>
                      🌶 {h}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { audioEngine.stopMusic(); audioEngine.stopAmbience(); }}
                style={{ ...sfxBtn("#ef4444", "rgba(239,68,68,0.15)"), width: "100%", marginTop: 8, textAlign: "center" }}
              >
                ⏹ Stop Music + Ambience
              </button>
            </>
          )}

          {/* ── MUSIC TAB ──────────────────────────────────── */}
          {tab === "music" && (
            <>
              <p style={{ margin: "0 0 4px", color: "#999", fontSize: 10 }}>Music tracks</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 10 }}>
                {MUSIC_TRACKS.map((t) => (
                  <button key={t} onClick={() => audioEngine.playMusic(t)}
                    style={sfxBtn(currentMusic === t ? "#FFD700" : "#22c55e", currentMusic === t ? "rgba(255,215,0,0.15)" : "rgba(34,197,94,0.08)")}>
                    {currentMusic === t ? "▶ " : ""}{t}
                  </button>
                ))}
              </div>

              <p style={{ margin: "0 0 4px", color: "#999", fontSize: 10 }}>Ambience</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 10 }}>
                {AMBIENCE_LOCATIONS.map((loc) => (
                  <button key={loc} onClick={() => audioEngine.playAmbience(loc)}
                    style={sfxBtn(currentAmbience === loc ? "#64d2ff" : "#22c55e", currentAmbience === loc ? "rgba(100,210,255,0.15)" : "rgba(34,197,94,0.08)")}>
                    {currentAmbience === loc ? "▶ " : ""}{loc}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <button onClick={() => audioEngine.stopMusic()}
                  style={{ ...sfxBtn("#ef4444", "rgba(239,68,68,0.15)"), textAlign: "center" }}>
                  ⏹ Music
                </button>
                <button onClick={() => audioEngine.stopAmbience()}
                  style={{ ...sfxBtn("#ef4444", "rgba(239,68,68,0.15)"), textAlign: "center" }}>
                  ⏹ Ambience
                </button>
              </div>
            </>
          )}

          {/* ── VOICE TAB ──────────────────────────────────── */}
          {tab === "voice" && (
            <>
              <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                <select value={speakerFilter} onChange={(e) => setSpeakerFilter(e.target.value as typeof speakerFilter)}
                  style={{
                    flex: 1, background: "rgba(34,197,94,0.05)", border: "1px solid #14532d",
                    color: "#22c55e", borderRadius: 4, padding: "3px 4px", fontSize: 10, fontFamily: "monospace",
                  }}>
                  <option value="all">all speakers</option>
                  {SPEAKERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    flex: 1, background: "rgba(34,197,94,0.05)", border: "1px solid #14532d",
                    color: "#22c55e", borderRadius: 4, padding: "3px 4px", fontSize: 10, fontFamily: "monospace",
                  }}>
                  <option value="all">all categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input
                type="text" placeholder="search line text or id…" value={voiceSearch}
                onChange={(e) => setVoiceSearch(e.target.value)}
                style={{
                  width: "100%", background: "rgba(34,197,94,0.05)", border: "1px solid #14532d",
                  color: "#22c55e", borderRadius: 4, padding: "3px 6px", fontSize: 10, fontFamily: "monospace",
                  marginBottom: 4, boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 9, color: "#666", marginBottom: 4 }}>
                {filteredVoiceLines.length} lines{filteredVoiceLines.length === 80 ? " (max 80)" : ""}
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {filteredVoiceLines.map((l) => (
                  <button key={l.id} onClick={() => audioEngine.playVoiceLine(l.id)}
                    style={{
                      width: "100%", marginBottom: 2, padding: "3px 5px",
                      background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.2)",
                      borderRadius: 4, color: "#22c55e", cursor: "pointer", fontSize: 9,
                      textAlign: "left", fontFamily: "monospace",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#999" }}>
                      <span>▶ {l.speaker}·{l.category}</span>
                      <span style={{ color: "#FF9933" }}>{l.mood}</span>
                    </div>
                    <div style={{ color: "#22c55e", marginTop: 1 }}>{l.text}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── SFX TAB ──────────────────────────────────── */}
          {tab === "sfx" && (
            <>
              <p style={{ margin: "0 0 4px", color: "#999", fontSize: 10 }}>
                All registered SFX ({SFX_LIST.length})
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                {SFX_LIST.map((sfx) => (
                  <button key={sfx} onClick={() => audioEngine.playSfx(sfx)}
                    style={sfxBtn("#FF9933", "rgba(255,153,51,0.08)")}>
                    🔊 {sfx}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── MISSING TAB ───────────────────────────────── */}
          {tab === "missing" && (
            <>
              {missingFiles.length === 0 ? (
                <p style={{ color: "#22c55e", fontSize: 11 }}>
                  ✓ No missing files detected.
                </p>
              ) : (
                <>
                  <p style={{ margin: "0 0 4px", color: "#ef4444", fontSize: 10 }}>
                    {missingFiles.length} missing audio paths
                  </p>
                  <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 6, padding: 6, maxHeight: 320, overflowY: "auto" }}>
                    {missingFiles.map((f) => (
                      <div key={f} style={{ color: "#ef4444", fontSize: 9, marginBottom: 2, wordBreak: "break-all" }}>
                        {f}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
