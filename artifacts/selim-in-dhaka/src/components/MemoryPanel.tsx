import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelimMemoryStore, MemoryItem, MemoryKind } from "../ai/types";
import { pinMemory, deleteMemory, resetMemories, exportStore, importStore } from "../ai/memoryStore";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";

interface Props {
  store: SelimMemoryStore;
  onUpdate: (store: SelimMemoryStore) => void;
  onClose: () => void;
  onShowRecap?: () => void;
  reducedMotion?: boolean;
}

type Tab = "memories" | "promises" | "jokes" | "diary";

const KIND_CATEGORIES: Record<string, { label: string; emoji: string; kinds: MemoryKind[] }> = {
  tor_kotha: {
    label: "Tor Kotha",
    emoji: "💬",
    kinds: ["player_story", "player_heartbreak", "personal_story"],
  },
  promises: {
    label: "Selim er Promise",
    emoji: "🤝",
    kinds: ["promise"],
  },
  broken: {
    label: "Broken Promise Museum",
    emoji: "💔",
    kinds: ["broken_promise"],
  },
  jokes: {
    label: "Inside Joke",
    emoji: "😂",
    kinds: ["inside_joke"],
  },
  heartbreak: {
    label: "Heartbreak Notes",
    emoji: "🌧️",
    kinds: ["heartbreak_story"],
  },
  lessons: {
    label: "Life Lessons",
    emoji: "🧠",
    kinds: ["life_lesson", "repeated_advice", "best_friend_moment"],
  },
};

function MemoryCard({
  item,
  onPin,
  onDelete,
}: {
  item: MemoryItem;
  onPin: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-3 mb-2 flex flex-col gap-1"
      style={{
        background: item.pinned ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.05)",
        border: item.pinned ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-xs leading-relaxed" style={{ color: "#e5e7eb", fontFamily: "'Hind Siliguri', sans-serif" }}>
        {item.content}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "#6b7280" }}>
          {new Date(item.timestamp).toLocaleDateString()}
          {item.referenceCount > 0 && ` · ref: ${item.referenceCount}×`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onPin}
            className="text-xs px-2 py-0.5 rounded-full active:scale-90 transition-transform"
            style={{
              background: item.pinned ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.08)",
              color: item.pinned ? "#FFD700" : "#9ca3af",
            }}
          >
            {item.pinned ? "📌 Pinned" : "📌 Pin"}
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-2 py-0.5 rounded-full active:scale-90 transition-transform"
            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MemoryPanel({ store, onUpdate, onClose, onShowRecap, reducedMotion = false }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("tor_kotha");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const json = exportStore(store);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selim-memory.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const newStore = importStore(text);
        onUpdate(newStore);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const cat = KIND_CATEGORIES[activeCategory];
  const filteredMemories = store.memories.filter((m) => cat.kinds.includes(m.kind));

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: "linear-gradient(180deg, #0d0600, #1a0f05)", fontFamily: "'Hind Siliguri', sans-serif" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div>
          <h2 className="text-base font-bold" style={{ color: "#FFD700" }}>📖 Selim's Friend Diary</h2>
          <p className="text-[10px]" style={{ color: "#9ca3af" }}>{store.memories.length} memories saved</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <span style={{ color: "white" }}>✕</span>
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 px-4 py-2 flex-shrink-0" style={{ scrollbarWidth: "none" }}>
        {Object.entries(KIND_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-transform"
            style={{
              background: activeCategory === key ? "linear-gradient(135deg,#FF6B00,#FF8F00)" : "rgba(255,255,255,0.08)",
              color: activeCategory === key ? "white" : "#9ca3af",
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {activeCategory === "jokes" && store.insideJokes.length > 0 ? (
          <div className="flex flex-col gap-2">
            {store.insideJokes.map((joke) => (
              <div
                key={joke.phrase}
                className="rounded-2xl p-3"
                style={{
                  background: joke.active ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                  border: joke.active ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p className="text-sm" style={{ color: "#e5e7eb" }}>"{joke.phrase}"</p>
                <p className="text-[10px] mt-1" style={{ color: "#6b7280" }}>
                  Repeated {joke.repeatCount}× {joke.active ? "· 🟢 Active joke" : ""}
                </p>
              </div>
            ))}
          </div>
        ) : activeCategory === "diary" ? (
          <div className="flex flex-col gap-2">
            {store.diaryEntries.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: "#6b7280" }}>
                {getSystemLine(
                  audioEngine.getSettings().humorLevel,
                  "এখনো কোনো diary নাই। আরো একটু খেলো!",
                )}
              </p>
            )}
            {[...store.diaryEntries].reverse().map((entry, i) => (
              <div key={i} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs leading-relaxed" style={{ color: "#e5e7eb" }}>{entry.text}</p>
                <p className="text-[10px] mt-1" style={{ color: "#6b7280" }}>Day {entry.day} · {entry.mood}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredMemories.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: "#6b7280" }}>
                {cat.emoji} No {cat.label} memories yet.
              </p>
            )}
            {filteredMemories.map((item) => (
              <MemoryCard
                key={item.id}
                item={item}
                onPin={() => onUpdate(pinMemory(store, item.id))}
                onDelete={() => onUpdate(deleteMemory(store, item.id))}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className="flex flex-col gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {onShowRecap && (
          <button
            data-testid="btn-open-friendship-recap"
            onClick={onShowRecap}
            className="w-full py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #FF6B00, #FF8F00)",
              color: "white",
              border: "1px solid rgba(255,215,0,0.4)",
            }}
          >
            💛 Friendship Recap দেখো
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-transform"
            style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            📤 Export JSON
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-transform"
            style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}
          >
            📥 Import JSON
          </button>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-2 rounded-xl text-xs font-semibold active:scale-95 transition-transform"
          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          🗑️ Reset All Memories
        </button>
        {showResetConfirm && (
          <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <p className="text-xs mb-2" style={{ color: "#fca5a5" }}>সব memory মুছে যাবে। নিশ্চিত?</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => { onUpdate(resetMemories(store)); setShowResetConfirm(false); }}
                className="px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "#ef4444", color: "white" }}
              >
                হ্যাঁ, মুছে দাও
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.1)", color: "#9ca3af" }}
              >
                না
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
