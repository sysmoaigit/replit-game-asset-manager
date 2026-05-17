import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  RELATIONSHIP_PROFILES, type RelationshipProfile,
} from "../game/relationshipProfiles";
import {
  filterProfiles, uniqueDangerLevels, type ProfileFilter,
} from "../game/loveArchive";
import GirlfriendProfileDetail from "./GirlfriendProfileDetail";
import RelationshipStatusBadge from "./RelationshipStatusBadge";
import type { Stats as GameStats } from "../types";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";

interface Props {
  onClose: () => void;
  stats: GameStats;
  reducedMotion?: boolean;
  onProfileOpen?: (profile: RelationshipProfile) => void;
}

// Full Love Archive screen: filterable grid + per-girl detail. Used as the
// richer "💞 Girls" surface; SelimChatPanel can mount this in place of the
// simpler GirlfriendProfileList.
export default function LoveArchive({
  onClose, stats, reducedMotion = false, onProfileOpen,
}: Props) {
  const [filter, setFilter] = useState<ProfileFilter>({ kind: "all" });
  const [selected, setSelected] = useState<RelationshipProfile | null>(null);

  const dangers = useMemo(() => uniqueDangerLevels(), []);
  const visible = useMemo(() => filterProfiles(filter), [filter]);

  return (
    <motion.div
      data-testid="love-archive"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
      className="fixed inset-0 z-[110] flex flex-col"
      style={{ background: "linear-gradient(180deg,#171025 0%,#0a0612 100%)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(236,72,153,0.18)" }}>
        <span className="text-lg">💞</span>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white">Love Archive</h2>
          <p className="text-[11px]" style={{ color: "#cbd5e1" }}>
            {visible.length} of {RELATIONSHIP_PROFILES.length} · all profiles fictional
          </p>
        </div>
        <button onClick={onClose} aria-label="Close archive" className="px-3 py-1.5 rounded-full text-xs"
          style={{ background: "rgba(255,255,255,0.08)", color: "#fde2f3" }}>
          ✕
        </button>
      </div>

      {/* Filter chip strip */}
      <div className="flex-shrink-0 overflow-x-auto px-3 py-2"
           style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-1.5">
          <FilterChip
            label="All"
            active={filter.kind === "all"}
            onClick={() => setFilter({ kind: "all" })}
            testId="filter-all"
          />
          {dangers.map((d) => (
            <FilterChip
              key={d}
              label={`⚠ ${d}`}
              active={filter.kind === "danger" && filter.value === d}
              onClick={() => setFilter({ kind: "danger", value: d })}
              testId={`filter-danger-${d.replace(/\s+/g, "-").toLowerCase()}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 grid grid-cols-2 gap-2">
        {visible.map((p) => (
          <button
            key={p.id}
            data-testid={`archive-card-${p.id}`}
            onClick={() => setSelected(p)}
            className="rounded-2xl overflow-hidden text-left active:scale-95 transition-transform"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-full"
              style={{
                aspectRatio: "1/1",
                backgroundImage: `url(${p.image})`,
                backgroundSize: "cover", backgroundPosition: "center top",
              }} />
            <div className="p-2">
              <p className="text-[13px] font-bold text-white">{p.name}</p>
              <div className="mt-0.5"><RelationshipStatusBadge status={p.status} size="xs" /></div>
              <p className="text-[10px] mt-1 line-clamp-2" style={{ color: "#9ca3af" }}>{p.role}</p>
            </div>
          </button>
        ))}
        {visible.length === 0 && (
          <div className="col-span-2 text-center text-[12px] py-8" style={{ color: "#9ca3af" }}>
            {getSystemLine(
              audioEngine.getSettings().humorLevel,
              "এই filter-এ কেউ নাই — Pinky-র last seen এর মতো।",
            )}
          </div>
        )}
      </div>

      {selected && (
        <GirlfriendProfileDetail
          profile={selected}
          onClose={() => setSelected(null)}
          reducedMotion={reducedMotion}
          stats={stats}
          onProfileOpen={onProfileOpen}
        />
      )}
    </motion.div>
  );
}

function FilterChip({
  label, active, onClick, testId,
}: { label: string; active: boolean; onClick: () => void; testId: string }) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      aria-pressed={active}
      className="px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap active:scale-95 transition"
      style={{
        background: active ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.05)",
        color: active ? "#fde2f3" : "#e5e7eb",
        border: `1px solid ${active ? "rgba(236,72,153,0.55)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      {label}
    </button>
  );
}
