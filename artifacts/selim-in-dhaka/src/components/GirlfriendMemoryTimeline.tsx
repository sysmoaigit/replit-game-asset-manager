import { useMemo } from "react";
import { loadChatLog } from "../chat/chatLog";
import type { RelationshipProfile } from "../game/relationshipProfiles";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";

interface Props {
  profile: RelationshipProfile;
}

// Chronological strip of past chat moments where this girl was the topic.
// Pulled from the existing per-day chat log — no new persistence.
export default function GirlfriendMemoryTimeline({ profile }: Props) {
  const moments = useMemo(() => {
    const log = loadChatLog();
    const needle = profile.name.toLowerCase();
    return log
      .filter((e) => e.text.toLowerCase().includes(needle))
      .slice(-12)
      .reverse();
  }, [profile.name]);

  if (moments.length === 0) {
    const selimLine = getSystemLine(
      audioEngine.getSettings().humorLevel,
      "এখনো কিছু নাই — Pinky-র DP-র মতো। পরে check কইরো।",
    );
    return (
      <div
        data-testid={`girl-timeline-empty-${profile.id}`}
        className="rounded-xl p-3 text-[12px]"
        style={{
          background: "rgba(255,255,255,0.04)",
          color: "#cbd5e1",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="italic mb-1" style={{ color: "#fed7aa" }}>{selimLine}</p>
        Chat-এ <span style={{ color: "#fbcfe8" }}>{profile.name}</span>-র নাম বলো,
        এখানে moment গুলা জমা হবে।
      </div>
    );
  }

  return (
    <div data-testid={`girl-timeline-${profile.id}`} className="flex flex-col gap-2">
      {moments.map((m, i) => (
        <div
          key={`${m.ts}-${i}`}
          className="rounded-xl px-3 py-2"
          style={{
            background: m.sender === "player"
              ? "rgba(255,140,66,0.10)"
              : m.sender === "selim"
                ? "rgba(99,102,241,0.10)"
                : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] uppercase tracking-wider"
                  style={{ color: m.sender === "player" ? "#FFB347" : m.sender === "selim" ? "#a5b4fc" : "#9ca3af" }}>
              Day {m.day} · {m.sender}
              {m.tag ? ` · ${m.tag}` : ""}
            </span>
          </div>
          <p className="text-[12px] leading-snug text-white"
             style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            {m.text}
          </p>
        </div>
      ))}
    </div>
  );
}
