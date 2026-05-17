import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ShareCardData, renderShareCard, downloadCanvas,
  copyCanvasToClipboard, nativeShareCanvas,
} from "../lib/shareCard";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";

interface Props {
  data: ShareCardData;
  onClose: () => void;
  reducedMotion?: boolean;
}

type Toast = { kind: "success" | "info"; text: string } | null;

export default function ShareCard({ data, onClose, reducedMotion = false }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  // Re-pick when the user changes Humor Level, but stay stable across
  // unrelated rerenders (toast, etc.) so the caption doesn't flicker.
  const humorLevel = audioEngine.getSettings().humorLevel;
  const loadingLine = useMemo(
    () => getSystemLine(humorLevel, "একটু wait করো, চা গরম হচ্ছে…"),
    [humorLevel],
  );
  const canShareNative = typeof navigator !== "undefined" && !!(navigator as Navigator & { share?: unknown }).share;

  useEffect(() => {
    const canvas = renderShareCard(data);
    canvasRef.current = canvas;
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const shareText = `Selim in Dhaka — আমি ${data.endingName} ending পেয়েছি! ${data.playerName}-এর playthrough।`;

  const handleShare = async () => {
    if (!canvasRef.current) return;
    const ok = await nativeShareCanvas(canvasRef.current, shareText);
    if (ok) {
      setToast({ kind: "success", text: "Shared!" });
    } else {
      const copied = await copyCanvasToClipboard(canvasRef.current);
      if (copied) setToast({ kind: "success", text: "Image copied to clipboard" });
      else { downloadCanvas(canvasRef.current); setToast({ kind: "info", text: "Image downloaded" }); }
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
    downloadCanvas(canvasRef.current, `selim-${data.endingName.replace(/\s+/g, "-").toLowerCase()}.png`);
    setToast({ kind: "info", text: "Downloaded" });
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 dhaka-modal-backdrop"
      style={{ background: "rgba(0,0,0,0.85)" }}
      data-testid="share-card-modal"
      ref={containerRef}
      onClick={(e) => { if (e.target === containerRef.current) onClose(); }}
    >
      <motion.div
        initial={reducedMotion ? {} : { scale: 0.92, opacity: 0 }}
        animate={reducedMotion ? {} : { scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-3xl p-4 flex flex-col gap-3"
        style={{
          background: "linear-gradient(135deg, #1a0f05, #2d1a08)",
          border: "1px solid rgba(255,215,0,0.25)",
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "#FFD700" }}>
            🎴 Share Card
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white opacity-60 hover:opacity-100 text-lg"
          >
            ✕
          </button>
        </div>

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Share card preview"
            className="w-full rounded-2xl"
            style={{ aspectRatio: "9 / 16", objectFit: "contain", background: "#000" }}
            data-testid="share-card-preview"
          />
        ) : (
          <div
            className="w-full rounded-2xl flex items-center justify-center"
            style={{ aspectRatio: "9 / 16", background: "rgba(0,0,0,0.6)", color: "#888" }}
          >
            {loadingLine}
          </div>
        )}

        {toast && (
          <div
            className="text-xs text-center py-1.5 rounded-lg"
            style={{
              background: toast.kind === "success" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
              color: toast.kind === "success" ? "#22c55e" : "#FFB347",
            }}
            data-testid="share-card-toast"
          >
            {toast.text}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {canShareNative && (
            <button
              data-testid="btn-share-native"
              onClick={handleShare}
              className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF8F00)", color: "white" }}
            >
              📤 Share
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              data-testid="btn-share-copy"
              onClick={handleCopy}
              className="py-3 rounded-xl font-semibold text-xs active:scale-95 transition-transform"
              style={{ background: "rgba(255,255,255,0.08)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}
            >
              📋 Copy Image
            </button>
            <button
              data-testid="btn-share-download"
              onClick={handleDownload}
              className="py-3 rounded-xl font-semibold text-xs active:scale-95 transition-transform"
              style={{ background: "rgba(255,255,255,0.08)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}
            >
              ⬇️ Download
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
