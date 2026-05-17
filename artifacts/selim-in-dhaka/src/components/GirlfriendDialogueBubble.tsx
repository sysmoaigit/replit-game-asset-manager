import { getDialogueStyle } from "../game/girlfriendDialogueStyles";

interface Props {
  characterId: string;
  characterName: string;
  text: string;
  romanized?: string;
}

// A small "as-her" speech bubble used inside the Voice / Secrets tabs.
// Tints itself based on the per-character signature color.
export default function GirlfriendDialogueBubble({
  characterId, characterName, text, romanized,
}: Props) {
  const style = getDialogueStyle(characterId);
  const tint = style?.bubbleTint ?? "rgba(255,255,255,0.06)";
  return (
    <div
      data-testid={`dialogue-bubble-${characterId}`}
      className="rounded-2xl px-3 py-2 mb-2"
      style={{
        background: tint,
        border: `1px solid ${tint.replace("0.16", "0.35").replace("0.18", "0.35")}`,
        fontFamily: "'Hind Siliguri', sans-serif",
      }}
    >
      <p className="text-[10px] mb-0.5" style={{ color: "#f9a8d4" }}>{characterName}</p>
      <p className="text-[14px] leading-snug text-white">"{text}"</p>
      {romanized && romanized !== text && (
        <p className="text-[10px] mt-0.5" style={{ color: "#cbd5e1" }}>{romanized}</p>
      )}
    </div>
  );
}
