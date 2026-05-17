import type { RelationshipStatus } from "../game/relationshipProfiles";

const COLORS: Record<RelationshipStatus, { bg: string; fg: string }> = {
  "Unknown":              { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
  "Crush":                { bg: "rgba(236,72,153,0.18)",  fg: "#f9a8d4" },
  "Fantasy Mode":         { bg: "rgba(168,85,247,0.18)",  fg: "#d8b4fe" },
  "Mixed Signal":         { bg: "rgba(244,114,182,0.18)", fg: "#f9a8d4" },
  "Girl-Busy Trigger":    { bg: "rgba(236,72,153,0.22)",  fg: "#fbcfe8" },
  "Boundary Test":        { bg: "rgba(59,130,246,0.18)",  fg: "#93c5fd" },
  "Healthy Friend":       { bg: "rgba(34,197,94,0.18)",   fg: "#86efac" },
  "Career Motivation":    { bg: "rgba(14,165,233,0.18)",  fg: "#7dd3fc" },
  "Convenience Risk":     { bg: "rgba(234,88,12,0.18)",   fg: "#fdba74" },
  "Secret Attention":     { bg: "rgba(124,58,237,0.18)",  fg: "#c4b5fd" },
  "Same-Gender Truth":    { bg: "rgba(20,184,166,0.18)",  fg: "#5eead4" },
  "Forbidden Attention":  { bg: "rgba(220,38,38,0.18)",   fg: "#fca5a5" },
  "Respectful Distance":  { bg: "rgba(100,116,139,0.18)", fg: "#cbd5e1" },
  "Heartbreak":           { bg: "rgba(239,68,68,0.18)",   fg: "#fca5a5" },
  "Mature Closure":       { bg: "rgba(132,204,22,0.18)",  fg: "#bef264" },
};

export default function RelationshipStatusBadge({
  status, size = "sm",
}: {
  status: RelationshipStatus;
  size?: "xs" | "sm";
}) {
  const c = COLORS[status] || COLORS.Unknown;
  const px = size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-block rounded-full font-semibold ${px}`}
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.fg}40` }}
    >
      {status}
    </span>
  );
}
