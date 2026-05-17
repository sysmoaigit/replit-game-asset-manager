import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FriendshipRecapData, renderFriendshipRecap } from "../lib/friendshipRecap";
import {
  downloadCanvas,
  copyCanvasToClipboard,
  nativeShareCanvas,
} from "../lib/shareCard";

interface Props {
  data: FriendshipRecapData;
  onClose: () => void;
  reducedMotion?: boolean;
}

type Toast = { kind: "success" | "info"; text: string } | null;

export default function FriendshipRecap({ data, onClose, reducedMotion = false }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const canShareNative =
    typeof navigator !== "undefined" &&
    !!(navigator as Navigator & { share?: unknown }).share;

  useEffect(() => {
    const canvas = renderFriendshipRecap(data);
    canvasRef.current = canvas;
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const shareText = useMemo(
    () =>
      `Selim in Dhaka — ${data.playerName} ও Selim এখন ${data.friendship.labelBangla} (${data.friendTrust}/100)। ${data.totalMemories} memories, ${data.insideJokes.length} inside jokes ❤️`,
    [data],
  );

  const handleShare = async () => {
    if (!canvasRef.current) return;
    const ok = await nativeShareCanvas(canvasRef.current, shareText);
    if (ok) {
      setToast({ kind: "success", text: "Shared!" });
      return;
    }
    const copied = await copyCanvasToClipboard(canvasRef.current);
    if (copied) setToast({ kind: "success", text: "Image copied to clipboard" });
    else {
      downloadCanvas(canvasRef.current, "selim-friendship-recap.png");
      setToast({ kind: "info", text: "Image downloaded" });
    }
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    const ok = await copyCanvasToClipboard(canvasRef.current);
    if (ok) setToast({ kind: "success", text: "Image copied!" });
    else setToast({ kind: "info", text: "Copy not supported — try Download" });
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    downloadCanvas(canvasRef.current, "selim-friendship-recap.png");
    setToast({ kind: "info", text: "Downloaded" });
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 dhaka-modal-backdrop"
      style={{ background: "rgba(0,0,0,0.88)" }}
      data-testid="friendship-recap-modal"
      ref={containerRef}
      onClick={(e) => {
        if (e.target === containerRef.current) onClose();
      }}
    >
      <motion.div
        initial={reducedMotion ? {} : { scale: 0.92, opacity: 0 }}
        animate={reducedMotion ? {} : { scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-3xl p-4 flex flex-col gap-3 max-h-[95vh] overflow-y-auto"
        style={{
          background: "linear-gradient(135deg, #1a0f05, #2d1a08)",
          border: "1px solid rgba(255,215,0,0.3)",
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold" style={{ color: "#FFD700" }}>
              💛 Friendship Recap
            </h2>
            <p className="text-[10px]" style={{ color: "#FFB347" }}>
              {data.friendship.labelBangla} · দিন {data.day}
            </p>
          </div>
          <button
            data-testid="friendship-recap-close"
            onClick={onClose}
            aria-label="Close"
            className="text-white opacity-60 hover:opacity-100 text-lg px-2"
          >
            ✕
          </button>
        </div>

        {/* Quick text summary */}
        <div
          className="rounded-2xl p-3 text-xs leading-relaxed"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,215,0,0.2)",
            color: "#e5e7eb",
          }}
          data-testid="friendship-recap-summary"
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: "#FFD700", fontWeight: 700 }}>
              {data.friendship.label}
            </span>
            <span style={{ color: "#9ca3af" }}>·</span>
            <span style={{ color: "#22c55e", fontWeight: 700 }}>
              Trust {data.friendTrust}/100
            </span>
          </div>
          <p style={{ color: "#9ca3af" }}>
            🤝 Promises {data.promisesKept}/{data.promisesMade} kept · 💔 {data.promisesBroken} broken
          </p>
          <p style={{ color: "#9ca3af" }}>
            📖 {data.totalMemories} memories · 😂 {data.insideJokes.length} inside jokes · ⭐ {data.bestFriendMoments} best-friend moments
          </p>
        </div>

        {/* Top memories */}
        {data.topMemories.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#FFB347" }}>
              📖 Top Memories
            </p>
            <ul className="flex flex-col gap-1.5">
              {data.topMemories.map((m) => (
                <li
                  key={m.id}
                  className="text-[11px] leading-snug"
                  style={{ color: m.pinned ? "#FFD700" : "#e5e7eb" }}
                >
                  {m.pinned ? "📌 " : "• "}
                  {m.content}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Inside jokes */}
        {data.insideJokes.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#FFB347" }}>
              😂 Inside Jokes
            </p>
            <ul className="flex flex-col gap-1">
              {data.insideJokes.map((j) => (
                <li
                  key={j.phrase}
                  className="text-[11px] italic"
                  style={{ color: j.active ? "#22c55e" : "#FFB347" }}
                >
                  {j.active ? "🟢 " : "• "}"{j.phrase}" (×{j.repeatCount})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Diary highlights */}
        {data.diaryHighlights.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#FFB347" }}>
              📔 Diary Highlights
            </p>
            <ul className="flex flex-col gap-2">
              {data.diaryHighlights.map((d, i) => (
                <li key={i}>
                  <p className="text-[10px] font-bold" style={{ color: "#FFB347" }}>
                    Day {d.day} · {d.mood}
                  </p>
                  <p className="text-[11px] leading-snug" style={{ color: "#e5e7eb" }}>
                    {d.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Shareable image preview */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Friendship recap card"
            className="w-full rounded-2xl"
            style={{ background: "#000" }}
            data-testid="friendship-recap-preview"
          />
        )}

        {toast && (
          <div
            className="text-xs text-center py-1.5 rounded-lg"
            style={{
              background:
                toast.kind === "success" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
              color: toast.kind === "success" ? "#22c55e" : "#FFB347",
            }}
            data-testid="friendship-recap-toast"
          >
            {toast.text}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {canShareNative && (
            <button
              data-testid="btn-recap-share"
              onClick={handleShare}
              className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF8F00)",
                color: "white",
              }}
            >
              📤 Share Recap
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              data-testid="btn-recap-copy"
              onClick={handleCopy}
              className="py-3 rounded-xl font-semibold text-xs active:scale-95 transition-transform"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#FFD700",
                border: "1px solid rgba(255,215,0,0.3)",
              }}
            >
              📋 Copy Image
            </button>
            <button
              data-testid="btn-recap-download"
              onClick={handleDownload}
              className="py-3 rounded-xl font-semibold text-xs active:scale-95 transition-transform"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#FFD700",
                border: "1px solid rgba(255,215,0,0.3)",
              }}
            >
              ⬇️ Download
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
