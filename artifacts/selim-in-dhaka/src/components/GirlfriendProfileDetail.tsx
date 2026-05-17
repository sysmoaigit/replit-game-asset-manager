import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { RelationshipProfile } from "../game/relationshipProfiles";
import GirlfriendVoicePreview from "./GirlfriendVoicePreview";
import RelationshipStatusBadge from "./RelationshipStatusBadge";
import GirlfriendSecretCard from "./GirlfriendSecretCard";
import GirlfriendMemoryTimeline from "./GirlfriendMemoryTimeline";
import GirlfriendDialogueBubble from "./GirlfriendDialogueBubble";
import { getArcFor } from "../game/girlfriendArcs";
import { deriveGirlMood } from "../game/girlfriendMoodEngine";
import { recordProfileOpen, getOpenCount } from "../game/loveArchive";
import { getDialogueStyle } from "../game/girlfriendDialogueStyles";
import type { Stats as GameStats } from "../types";

interface Props {
  profile: RelationshipProfile;
  onClose: () => void;
  reducedMotion?: boolean;
  stats: GameStats;
  /** Fired once when the detail mounts so SelimChatPanel can push his comment. */
  onProfileOpen?: (profile: RelationshipProfile) => void;
}

type TabKey = "story" | "voice" | "secrets" | "timeline" | "fantasy" | "reality";

const TABS: { key: TabKey; label: string }[] = [
  { key: "story",    label: "Story" },
  { key: "voice",    label: "Voice" },
  { key: "secrets",  label: "Secrets" },
  { key: "timeline", label: "Timeline" },
  { key: "fantasy",  label: "Fantasy" },
  { key: "reality",  label: "Reality" },
];

const DANGER_TINT: Record<string, { bg: string; fg: string }> = {
  "Safe Truth":      { bg: "rgba(34,197,94,0.18)",  fg: "#86efac" },
  "Career Positive": { bg: "rgba(14,165,233,0.18)", fg: "#7dd3fc" },
  "Healthy":         { bg: "rgba(132,204,22,0.18)", fg: "#bef264" },
  "Low Overthinking":{ bg: "rgba(251,191,36,0.18)", fg: "#fde68a" },
  "Boundary":        { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
  "Fantasy":         { bg: "rgba(168,85,247,0.18)", fg: "#d8b4fe" },
  "Favor Risk":      { bg: "rgba(234,88,12,0.18)",  fg: "#fdba74" },
  "Honesty Risk":    { bg: "rgba(20,184,166,0.18)", fg: "#5eead4" },
  "High Emotional":  { bg: "rgba(236,72,153,0.20)", fg: "#fbcfe8" },
  "Reputation":      { bg: "rgba(220,38,38,0.20)",  fg: "#fca5a5" },
};

function Section({ title, body, color }: { title: string; body: string; color: string }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color }}>{title}</p>
      <p className="text-[13px] leading-snug text-white"
         style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{body}</p>
    </div>
  );
}

export default function GirlfriendProfileDetail({
  profile, onClose, reducedMotion, stats, onProfileOpen,
}: Props) {
  const [tab, setTab] = useState<TabKey>("story");
  const arc = useMemo(() => getArcFor(profile.id), [profile.id]);
  const mood = useMemo(() => deriveGirlMood(profile.id, stats), [profile.id, stats]);
  const style = useMemo(() => getDialogueStyle(profile.id), [profile.id]);
  const friendTrust = (stats as unknown as { friendTrust?: number }).friendTrust ?? 0;
  const danger = profile.dangerLevel;
  const dangerTint = danger ? DANGER_TINT[danger] : undefined;

  // Fire the "Selim sees you opened her profile" callback once per mount.
  // useRef guard makes this resilient to React 18 StrictMode double-invocation
  // of mount effects in dev — without it Selim's comment would be appended twice
  // and the open-counter would tick twice on every open.
  const firedRef = useRef<string | null>(null);
  useEffect(() => {
    if (firedRef.current === profile.id) return;
    firedRef.current = profile.id;
    recordProfileOpen(profile.id);
    onProfileOpen?.(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  return (
    <motion.div
      data-testid={`girl-detail-${profile.id}`}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
      className="fixed inset-0 z-[120] flex flex-col"
      style={{ background: "linear-gradient(180deg,#1a1126 0%,#070310 100%)" }}
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="relative flex-shrink-0"
        style={{
          height: "32vh", minHeight: 200,
          backgroundImage: `url(${profile.image})`,
          backgroundSize: "cover", backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0"
             style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.15) 50%,#1a1126 100%)" }} />
        <button onClick={onClose} aria-label="Close profile"
          className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs"
          style={{ background: "rgba(0,0,0,0.55)", color: "white", backdropFilter: "blur(8px)" }}>
          ✕
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs" style={{ color: "#f9a8d4" }}>{profile.role}</span>
            <RelationshipStatusBadge status={profile.status} />
            {danger && dangerTint && (
              <span
                data-testid={`danger-${profile.id}`}
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: dangerTint.bg, color: dangerTint.fg, border: `1px solid ${dangerTint.fg}40` }}
              >
                ⚠ {danger}
              </span>
            )}
            <span className="text-[10px]" style={{ color: "#cbd5e1" }}>
              · opened {getOpenCount(profile.id)}×
            </span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: "#fde68a" }}>
            {mood.emoji} {mood.hint}
          </p>
        </div>
      </div>

      {/* ── Tab strip ───────────────────────────────────────── */}
      <div className="flex-shrink-0 px-2 pt-2 pb-1 overflow-x-auto"
           style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-1.5">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                data-testid={`tab-${profile.id}-${t.key}`}
                onClick={() => setTab(t.key)}
                aria-pressed={active}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap active:scale-95 transition"
                style={{
                  background: active ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.05)",
                  color: active ? "#fde2f3" : "#e5e7eb",
                  border: `1px solid ${active ? "rgba(236,72,153,0.55)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === "story" && (
          <>
            <Section title="Selim Thinks" body={`"${profile.fantasy}"`} color="#f9a8d4" />
            <Section title="Reality" body={profile.reality} color="#86efac" />
            <Section title="Personality" body={profile.personality} color="#cbd5e1" />
            {profile.playerAdvice && profile.playerAdvice.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#fbbf24" }}>
                  Player Should Advise
                </p>
                <ul className="space-y-1">
                  {profile.playerAdvice.map((a, i) => (
                    <li key={i} className="text-[12px] text-white"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      • {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {arc && (
              <>
                <p className="text-[10px] uppercase tracking-wider mt-2 mb-1" style={{ color: "#7dd3fc" }}>
                  Good Path
                </p>
                {arc.goodSteps.map((s, i) => (
                  <ArcRow key={`g${i}`} title={s.title} body={s.body} accent="#7dd3fc" />
                ))}
                <p className="text-[10px] uppercase tracking-wider mt-3 mb-1" style={{ color: "#fca5a5" }}>
                  Bad Path
                </p>
                {arc.badSteps.map((s, i) => (
                  <ArcRow key={`b${i}`} title={s.title} body={s.body} accent="#fca5a5" />
                ))}
              </>
            )}
            <div className="mt-2 mb-3">
              <span className="inline-block text-[10px] px-2 py-1 rounded-full"
                style={{ background: "rgba(255,107,0,0.15)", color: "#FFB347", border: "1px solid rgba(255,107,0,0.3)" }}>
                Affects: {profile.relatedStat}
              </span>
            </div>
          </>
        )}

        {tab === "voice" && (
          <>
            {style && (
              <div className="mb-3 rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#fbcfe8" }}>
                  Voice Style
                </p>
                <p className="text-[12px] text-white" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {style.voiceStyle}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#cbd5e1" }}>
                  Flirting: {style.flirtingStyle}
                </p>
              </div>
            )}
            <GirlfriendVoicePreview characterId={profile.id} characterName={profile.name} />
            {style && (
              <GirlfriendDialogueBubble
                characterId={profile.id}
                characterName={profile.name}
                text={style.signaturePhrase}
              />
            )}
          </>
        )}

        {tab === "secrets" && (
          <GirlfriendSecretCard profile={profile} friendTrust={friendTrust} />
        )}

        {tab === "timeline" && (
          <GirlfriendMemoryTimeline profile={profile} />
        )}

        {tab === "fantasy" && (
          <>
            <Section title="Selim's Fantasy" body={`"${profile.fantasy}"`} color="#f9a8d4" />
            <p className="text-[12px] mt-2" style={{ color: "#cbd5e1" }}>
              This is the story he tells himself. The Reality tab is the part he avoids.
            </p>
          </>
        )}

        {tab === "reality" && (
          <>
            <Section title="Reality Check" body={profile.reality} color="#86efac" />
            {profile.safetyNote && (
              <div className="mt-3 p-3 rounded-xl text-[11px] leading-snug"
                style={{ background: "rgba(96,165,250,0.1)", color: "#bfdbfe", border: "1px solid rgba(96,165,250,0.25)" }}>
                ℹ️ {profile.safetyNote}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function ArcRow({ title, body, accent }: { title: string; body: string; accent: string }) {
  return (
    <div className="mb-1.5 rounded-lg px-2.5 py-1.5"
         style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${accent}30` }}>
      <p className="text-[11px] font-semibold" style={{ color: accent }}>{title}</p>
      <p className="text-[12px] text-white" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
        {body}
      </p>
    </div>
  );
}
