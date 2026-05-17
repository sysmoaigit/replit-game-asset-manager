import { useMemo, useRef, useState } from "react";
import { getLinesFor, type GirlfriendVoiceLine, type VoiceMood } from "../game/girlfriendVoiceLines";
import { speakSelim, stopSelim, hasBanglaVoice } from "../lib/selimVoice";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";

const MOOD_EMOJI: Record<VoiceMood, string> = {
  cute: "🌸", playful: "😉", teasing: "😏", serious: "🫢", sad: "🌧️",
  boundary: "🛑", mysterious: "🌙", career: "💼", kind: "🤍", danger: "⚠️", truth: "🎯",
};

const MOOD_LABEL: Record<VoiceMood, string> = {
  cute: "Cute", playful: "Playful", teasing: "Teasing", serious: "Serious", sad: "Sad",
  boundary: "Boundary", mysterious: "Mystery", career: "Career", kind: "Kind",
  danger: "Pressure", truth: "Truth",
};

interface Props {
  characterId: string;
  characterName: string;
}

// Voice clip preview — tap a chip to play the audio clip, or read the
// subtitle if the clip hasn't been recorded/uploaded yet. Per spec: do
// not crash on missing audio; show subtitle + a polite notice.
export default function GirlfriendVoicePreview({ characterId, characterName }: Props) {
  const lines = useMemo(() => getLinesFor(characterId), [characterId]);
  const [active, setActive] = useState<GirlfriendVoiceLine | null>(lines[0] ?? null);
  const [audioMissing, setAudioMissing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (lines.length === 0) return null;

  const speakViaTTS = (text: string) => {
    // Female-flavored TTS fallback so the bubble feels alive even with no
    // recorded clip. Slightly higher pitch reads more "girl-coded" on the
    // synth voices that don't carry true gender metadata.
    speakSelim(text, { speaker: "girl", pitch: 1.15, rate: 0.88 });
  };

  const play = (line: GirlfriendVoiceLine) => {
    setActive(line);
    setAudioMissing(false);
    stopSelim();
    // Always stop whatever is currently playing first, even if the new line
    // has no audioPath — otherwise an old clip would keep playing while the
    // subtitle bubble switches to a silent line.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    if (!line.audioPath) {
      setAudioMissing(true);
      speakViaTTS(line.text);
      return;
    }
    if (audioRef.current) {
      audioRef.current.src = line.audioPath;
      audioRef.current.play().catch(() => {
        setAudioMissing(true);
        speakViaTTS(line.text);
      });
    }
  };

  return (
    <div data-testid={`voice-preview-${characterId}`} className="mt-2 mb-3">
      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#fbcfe8" }}>
        Voice Preview
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {lines.map((line) => {
          const isActive = active?.id === line.id;
          return (
            <button
              key={line.id}
              data-testid={`voice-chip-${line.id}`}
              onClick={() => play(line)}
              aria-label={`Play ${MOOD_LABEL[line.mood]} voice line from ${characterName}`}
              aria-pressed={isActive}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold active:scale-95 transition"
              style={{
                background: isActive ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.06)",
                color: isActive ? "#fde2f3" : "#e5e7eb",
                border: `1px solid ${isActive ? "rgba(236,72,153,0.55)" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              {MOOD_EMOJI[line.mood]} {MOOD_LABEL[line.mood]}
            </button>
          );
        })}
      </div>

      {active && (
        <div
          className="rounded-xl px-3 py-2.5"
          style={{
            background: "linear-gradient(135deg,rgba(236,72,153,0.10),rgba(168,85,247,0.08))",
            border: "1px solid rgba(236,72,153,0.22)",
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          <p className="text-[11px] mb-1" style={{ color: "#f9a8d4" }}>
            {characterName} · {MOOD_LABEL[active.mood]}
          </p>
          <p className="text-[14px] text-white leading-snug">"{active.text}"</p>
          {audioMissing && (
            <p className="text-[10px] mt-1.5" style={{ color: "#fed7aa" }}>
              🎙️ <span className="italic">
                {getSystemLine(
                  audioEngine.getSettings().humorLevel,
                  "একটু ঝামেলা হলো — clip নাই।",
                )}
              </span>{" "}
              {hasBanglaVoice()
                ? "Browser-এর Bangla voice দিয়ে চালাচ্ছি।"
                : "Spoken preview-র জন্য OS-এ Bangla voice install করো।"}
            </p>
          )}
        </div>
      )}

      {/* Single hidden audio element, reused across chips. */}
      <audio
        ref={audioRef}
        preload="none"
        onError={() => setAudioMissing(true)}
        style={{ display: "none" }}
      />
    </div>
  );
}
