import { motion } from "framer-motion";
import { useMemo } from "react";
import type { SelimMemoryStore } from "../ai/types";
import { toBn } from "../lib/utils";

interface Props {
  store: SelimMemoryStore;
  onClose: () => void;
  reducedMotion?: boolean;
}

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", sad: "😔", defensive: "😤", romantic: "💖",
  hopeful: "🌅", ashamed: "🫥", grateful: "🙏",
  silent: "🌑", angry: "😡", confused: "😵‍💫",
};

export default function SelimDiaryPanel({ store, onClose, reducedMotion = false }: Props) {
  const entries = useMemo(
    () => [...store.diaryEntries].sort((a, b) => b.timestamp - a.timestamp),
    [store.diaryEntries],
  );

  return (
    <motion.div
      data-testid="selim-diary-panel"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "100%" }}
      className="fixed inset-0 z-[110] flex flex-col"
      style={{ background: "linear-gradient(180deg,#1f1810 0%,#0a0805 100%)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,143,0,0.2)" }}>
        <span className="text-lg">📔</span>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white">Selim's Diary</h2>
          <p className="text-[11px]" style={{ color: "#fed7aa" }}>
            {entries.length} entries · oldest day first reversed
          </p>
        </div>
        <button onClick={onClose} className="px-3 py-1.5 rounded-full text-xs"
          style={{ background: "rgba(255,255,255,0.08)", color: "#fed7aa" }}>
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {entries.length === 0 ? (
          <div className="text-center mt-12 px-6">
            <p className="text-3xl mb-3">📔</p>
            <p className="text-sm text-white"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              এখনো কোনো diary entry নাই। কয়েকটা দিন খেলো — Selim লিখতে শুরু করবে।
            </p>
          </div>
        ) : (
          entries.map((e, i) => (
            <div key={i}
              className="rounded-2xl px-4 py-3"
              style={{
                background: "linear-gradient(135deg,rgba(255,140,40,0.08),rgba(255,107,0,0.04))",
                border: "1px solid rgba(255,143,0,0.18)",
                fontFamily: "'Hind Siliguri', sans-serif",
              }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{MOOD_EMOJI[e.mood] || "📝"}</span>
                <span className="text-[11px] font-bold" style={{ color: "#FFB347" }}>
                  দিন {toBn(e.day)}
                </span>
                <span className="ml-auto text-[10px]" style={{ color: "#a8a29e" }}>
                  {new Date(e.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-white">{e.text}</p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
