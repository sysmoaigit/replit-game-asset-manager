import { motion } from "framer-motion";
import { useState } from "react";
import { RELATIONSHIP_PROFILES, type RelationshipProfile } from "../game/relationshipProfiles";
import GirlfriendProfileDetail from "./GirlfriendProfileDetail";
import RelationshipStatusBadge from "./RelationshipStatusBadge";
import type { Stats as GameStats } from "../types";

interface Props {
  onClose: () => void;
  reducedMotion?: boolean;
  stats: GameStats;
  onProfileOpen?: (profile: RelationshipProfile) => void;
}

export default function GirlfriendProfileList({ onClose, reducedMotion = false, stats, onProfileOpen }: Props) {
  const [selected, setSelected] = useState<RelationshipProfile | null>(null);

  return (
    <motion.div
      data-testid="girlfriend-profile-list"
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
          <h2 className="text-sm font-bold text-white">Selim's Relationships</h2>
          <p className="text-[11px]" style={{ color: "#cbd5e1" }}>
            {RELATIONSHIP_PROFILES.length} people · all profiles fictional
          </p>
        </div>
        <button onClick={onClose} aria-label="Close girls list" className="px-3 py-1.5 rounded-full text-xs"
          style={{ background: "rgba(255,255,255,0.08)", color: "#fde2f3" }}>
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 grid grid-cols-2 gap-2">
        {RELATIONSHIP_PROFILES.map((p) => (
          <button
            key={p.id}
            data-testid={`girl-card-${p.id}`}
            onClick={() => setSelected(p)}
            className="rounded-2xl overflow-hidden text-left active:scale-95 transition-transform"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="w-full"
              style={{
                aspectRatio: "1/1",
                backgroundImage: `url(${p.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            />
            <div className="p-2">
              <p className="text-[13px] font-bold text-white">{p.name}</p>
              <div className="mt-0.5"><RelationshipStatusBadge status={p.status} size="xs" /></div>
              <p className="text-[10px] mt-1 line-clamp-2" style={{ color: "#9ca3af" }}>
                {p.role}
              </p>
            </div>
          </button>
        ))}
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
