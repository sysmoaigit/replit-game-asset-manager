import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ensureGemmaLoaded,
  subscribeGemmaStatus,
  GemmaStatus,
  isWebGPUAvailable,
  hasGemmaBeenDownloaded,
} from "../ai/browserGemmaClient";
import { audioEngine } from "../game/audioEngine";
import { getSystemLine } from "../game/humorContent";

interface Props {
  onClose: () => void;
  reducedMotion?: boolean;
}

export default function OfflineGemmaPanel({ onClose, reducedMotion = false }: Props) {
  const [status, setStatus] = useState<GemmaStatus>({ kind: "idle" });
  const webgpu = isWebGPUAvailable();
  const previouslyDownloaded = hasGemmaBeenDownloaded();

  useEffect(() => subscribeGemmaStatus(setStatus), []);

  const startDownload = () => {
    ensureGemmaLoaded().catch(() => { /* status already updated */ });
  };

  const pct = status.kind === "loading" ? Math.round(status.progress * 100) : 0;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={reducedMotion ? {} : { scale: 0.95, y: 20 }}
        animate={reducedMotion ? {} : { scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
        style={{
          background: "linear-gradient(135deg, #1a0f05, #2d1a08)",
          border: "1px solid rgba(168,85,247,0.35)",
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📥</div>
          <h2 className="text-xl font-bold" style={{ color: "#a855f7" }}>Offline AI (Gemma)</h2>
          <p className="text-xs mt-1" style={{ color: "#FFB347" }}>
            Internet ছাড়াও Selim এর সাথে কথা বলো
          </p>
        </div>

        <div
          className="rounded-2xl p-3 text-xs leading-relaxed"
          style={{ background: "rgba(255,255,255,0.06)", color: "#d1d5db" }}
        >
          <p className="mb-2">
            <span style={{ color: "#22c55e" }}>✓</span> Browser-এ Google Gemma 2 (2B) model download হবে — <b>একবার ~১.৫ GB</b>।
          </p>
          <p className="mb-2">
            <span style={{ color: "#22c55e" }}>✓</span> এরপর সব AI conversation তোর phone/PC-তেই run হবে। কোনো server call না, কোনো cost না, internet না থাকলেও কাজ করবে।
          </p>
          <p>
            <span style={{ color: "#FFB347" }}>⚠</span> Online থাকলে Gemini-ই default থাকবে (Bangla quality ভালো)। Offline হলে Gemma kick-in করবে।
          </p>
        </div>

        {!webgpu && (
          <div
            className="rounded-2xl p-3 text-xs"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            ❌ এই browser-এ WebGPU support নেই। Chrome/Edge desktop বা iPhone iOS 18+ Safari লাগবে।
          </div>
        )}

        {status.kind === "idle" && webgpu && (
          <>
            {previouslyDownloaded && (
              <p className="text-xs text-center" style={{ color: "#22c55e" }}>
                ✓ আগে download হয়েছে। এখন reload করতে হবে।
              </p>
            )}
            <button
              onClick={startDownload}
              className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "white" }}
            >
              📥 {previouslyDownloaded ? "Reload Gemma" : "Download করো (~1.5 GB)"}
            </button>
          </>
        )}

        {status.kind === "loading" && (
          <div className="flex flex-col gap-2">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full transition-all"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
              />
            </div>
            <p className="text-xs text-center" style={{ color: "#a855f7" }}>{pct}%</p>
            <p className="text-[11px] text-center" style={{ color: "#9ca3af" }}>{status.text}</p>
            <p className="text-[10px] text-center mt-1" style={{ color: "#6b7280" }}>
              এই page বন্ধ করিস না — download চলছে
            </p>
          </div>
        )}

        {status.kind === "ready" && (
          <div
            className="rounded-2xl p-3 text-center text-sm"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}
          >
            ✓ Gemma ready! এখন offline-ও Selim এর সাথে কথা বলতে পারবি।
          </div>
        )}

        {status.kind === "error" && (
          <div
            className="rounded-2xl p-3 text-xs"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            <p className="italic mb-1" style={{ color: "#fed7aa" }}>
              {getSystemLine(
                audioEngine.getSettings().humorLevel,
                "একটু ঝামেলা হলো — আবার try করো।",
              )}
            </p>
            ❌ {status.message}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl font-semibold text-sm active:scale-95 transition-transform"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#9ca3af" }}
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
