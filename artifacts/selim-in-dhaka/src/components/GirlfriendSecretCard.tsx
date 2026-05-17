import { useState } from "react";
import type { RelationshipProfile } from "../game/relationshipProfiles";
import GirlfriendDialogueBubble from "./GirlfriendDialogueBubble";

interface Props {
  profile: RelationshipProfile;
  friendTrust: number;
  /** Trust threshold that unlocks the secret. Default 30. */
  unlockTrust?: number;
}

// Per-girl "secret memory" reveal card. Locked behind FriendTrust until the
// player has earned enough listening to deserve the inside view.
export default function GirlfriendSecretCard({
  profile, friendTrust, unlockTrust = 30,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const unlocked = friendTrust >= unlockTrust;

  return (
    <div
      data-testid={`girl-secret-${profile.id}`}
      className="rounded-2xl p-3 mb-3"
      style={{
        background: "linear-gradient(135deg,rgba(124,58,237,0.10),rgba(236,72,153,0.08))",
        border: "1px solid rgba(196,181,253,0.25)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] uppercase tracking-wider" style={{ color: "#c4b5fd" }}>
          🔐 Secret Memory · {profile.name}
        </p>
        <span className="text-[10px]" style={{ color: unlocked ? "#86efac" : "#fbbf24" }}>
          Trust {friendTrust}/{unlockTrust}
        </span>
      </div>

      {!unlocked && (
        <p className="text-[12px] leading-snug" style={{ color: "#cbd5e1" }}>
          Selim doesn't trust you with this one yet. Listen more, judge less.
        </p>
      )}

      {unlocked && !revealed && (
        <button
          data-testid={`reveal-secret-${profile.id}`}
          onClick={() => setRevealed(true)}
          className="mt-1 w-full rounded-xl py-2 text-[12px] font-semibold active:scale-95 transition"
          style={{
            background: "rgba(168,85,247,0.18)",
            color: "#e9d5ff",
            border: "1px solid rgba(168,85,247,0.45)",
          }}
        >
          Tap to reveal Selim's secret about {profile.name}
        </button>
      )}

      {unlocked && revealed && (
        <>
          <p className="text-[13px] leading-snug text-white mb-2"
             style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            {profile.secretMemory}
          </p>
          <GirlfriendDialogueBubble
            characterId={profile.id}
            characterName="Selim"
            text={profile.selimComment ?? "Eta amar nijer kotha. Bujhish."}
          />
        </>
      )}
    </div>
  );
}
