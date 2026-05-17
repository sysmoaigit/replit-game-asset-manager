import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Stats, SelimReaction } from "../types";

import { SELIM_ASSETS } from "../game/assets";
const SELIM_IMG = SELIM_ASSETS.main;

export type SelimMode =
  | "normal" | "romantic" | "rechargeRomeo" | "broke" | "heartbroken"
  | "drySelim" | "confused" | "confident" | "boguraBoss" | "recovery"
  | "emotionalOverride";

interface SelimAvatarProps {
  stats: Stats;
  size?: "sm" | "md" | "lg";
  reducedMotion?: boolean;
  reaction?: SelimReaction | null;
  showStatus?: boolean;
  showBadge?: boolean;
  modeOverride?: SelimMode;
}

function deriveMode(stats: Stats, reaction?: SelimReaction | null): SelimMode {
  if (reaction?.kind === "override") return "emotionalOverride";
  if (stats.health < 25 && stats.addiction > 50) return "drySelim";
  if (stats.careerProgress > 75 && stats.selfRespect > 70) return "boguraBoss";
  if (stats.romanticFever > 85 && stats.selfRespect < 40) return "rechargeRomeo";
  if (stats.pinkyHope > 80 && stats.selfRespect < 40) return "rechargeRomeo";
  if (stats.selfRespect > 70 && stats.iq > 60) return "confident";
  if (stats.emotionalDelusion > 75) return "confused";
  if (stats.loneliness > 75 && stats.mood < 35) return "heartbroken";
  if (stats.mood < 30) return "heartbroken";
  if (stats.money < 100) return "broke";
  if (stats.pinkyHappiness > 60 || stats.romanticFever > 70) return "romantic";
  return "normal";
}

function deriveStatus(stats: Stats, mode: SelimMode): string {
  if (mode === "emotionalOverride") return "Tui Bujhbi Na Mode";
  if (mode === "rechargeRomeo") return "Recharge Reflex";
  if (stats.emotionalDelusion > 75) return "Pinky Clouded";
  if (mode === "boguraBoss") return "Bogura Boss Mode";
  if (stats.iq > 70 && stats.selfRespect > 60) return "Logic Loading";
  if (stats.friendTrust < 35) return "Friend Advice Buffering";
  if (stats.selfRespect > 70) return "Self Respect Installing";
  if (mode === "heartbroken") return "Seen Zone Damage";
  if (stats.pinkyHappiness > 60) return "First Love Fever";
  if (mode === "recovery") return "Comeback Mode";
  return "Hmm Decoding";
}

const sizeMap = {
  sm: { w: 120, h: 168 },
  md: { w: 180, h: 250 },
  lg: { w: 220, h: 300 },
};

export default function SelimAvatar({
  stats,
  size = "md",
  reducedMotion = false,
  reaction = null,
  showStatus = false,
  showBadge = false,
  modeOverride,
}: SelimAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const mode = modeOverride ?? deriveMode(stats, reaction);
  const dims = sizeMap[size];
  const status = deriveStatus(stats, mode);

  const cssFilter =
    mode === "drySelim" ? "grayscale(60%) brightness(0.85) sepia(0.25)" :
    mode === "broke" ? "grayscale(35%) brightness(0.9)" :
    mode === "heartbroken" ? "brightness(0.85) saturate(0.7) hue-rotate(15deg)" :
    mode === "boguraBoss" ? "brightness(1.05) saturate(1.15)" :
    mode === "recovery" ? "brightness(1.05) saturate(0.95) hue-rotate(-5deg)" :
    "none";

  const glow =
    mode === "romantic" || mode === "rechargeRomeo" ? "rgba(236, 72, 153, 0.55)" :
    mode === "emotionalOverride" ? "rgba(239, 68, 68, 0.7)" :
    mode === "confident" ? "rgba(34, 197, 94, 0.5)" :
    mode === "boguraBoss" ? "rgba(250, 204, 21, 0.6)" :
    mode === "recovery" ? "rgba(34, 211, 238, 0.55)" :
    mode === "drySelim" ? "rgba(120, 120, 120, 0.55)" :
    mode === "heartbroken" ? "rgba(96, 165, 250, 0.45)" :
    "rgba(0, 0, 0, 0.35)";

  const idleAnim = !reducedMotion
    ? mode === "emotionalOverride"
      ? { x: [0, -2, 2, -2, 0], transition: { repeat: Infinity, duration: 0.4 } }
      : (mode === "normal" || mode === "romantic" || mode === "confident" || mode === "boguraBoss" || mode === "recovery")
      ? { y: [0, -4, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const } }
      : {}
    : {};

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: dims.w }}>
      <div className="relative" style={{ width: dims.w, height: dims.h }}>
        {/* Soft glow halo */}
        <div
          className="absolute inset-2 rounded-3xl pointer-events-none"
          style={{ boxShadow: `0 0 ${size === "lg" ? 36 : 22}px ${glow}` }}
        />

        {/* Bogura Boss golden frame */}
        {mode === "boguraBoss" && (
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none z-20"
            style={{ border: "3px solid #FFD700" }}
            animate={!reducedMotion ? { boxShadow: ["0 0 6px #FFD700", "0 0 22px #FFD700", "0 0 6px #FFD700"] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}

        {/* Override pulsing pink/red border */}
        {mode === "emotionalOverride" && (
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none z-20"
            style={{ border: "2px solid #ec4899" }}
            animate={!reducedMotion ? { borderColor: ["#ec4899", "#ef4444", "#ec4899"], scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.6 }}
          />
        )}

        {/* Confident shield glow ring */}
        {mode === "confident" && !reducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none z-10"
            style={{ border: "2px solid #22c55e" }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}

        {/* Smoke / dry warning overlay */}
        {mode === "drySelim" && (
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none z-15"
            style={{ background: "radial-gradient(ellipse, rgba(80,80,80,0.4) 0%, transparent 70%)" }}
            animate={!reducedMotion ? { opacity: [0.3, 0.7, 0.3] } : {}}
            transition={{ repeat: Infinity, duration: 2.2 }}
          />
        )}

        {/* Heartbroken atmosphere — blue tint + rain cloud */}
        {mode === "heartbroken" && (
          <>
            <div
              className="absolute inset-x-0 bottom-0 h-2/3 rounded-b-3xl pointer-events-none z-10"
              style={{ background: "linear-gradient(to top, rgba(30, 58, 138, 0.35), transparent)" }}
            />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30" style={{ fontSize: size === "sm" ? 22 : 30 }}>🌧️</div>
          </>
        )}

        {/* Main Selim image (center stage, never replaced) */}
        <motion.div animate={idleAnim} className="relative w-full h-full z-5">
          {!imgError ? (
            <img
              src={SELIM_IMG}
              alt="Selim, the main character from Bogura"
              onError={() => setImgError(true)}
              loading="eager"
              className="w-full h-full"
              style={{
                objectFit: "contain",
                maxWidth: "100%",
                maxHeight: "100%",
                filter: `${cssFilter} drop-shadow(0 6px 14px rgba(0,0,0,0.45))`,
              }}
              data-testid="selim-anime-img"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-center text-yellow-200 text-[11px] p-3 rounded-2xl"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px dashed rgba(250, 204, 21, 0.5)" }}
            >
              Selim anime image missing.<br />Please add public/assets/selim-anime-main.png
            </div>
          )}
        </motion.div>

        {/* Floating hearts — romantic / rechargeRomeo */}
        {(mode === "romantic" || mode === "rechargeRomeo") && !reducedMotion && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`heart-${i}`}
                className="absolute pointer-events-none z-30"
                style={{ left: `${15 + i * 28}%`, bottom: "55%", fontSize: size === "sm" ? 14 : 20 }}
                animate={{ y: [0, -50], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2.6, delay: i * 0.7 }}
              >
                💖
              </motion.div>
            ))}
          </>
        )}

        {/* Recharge Romeo: phone + crying wallet + flying taka */}
        {mode === "rechargeRomeo" && (
          <>
            <motion.div
              className="absolute top-2 right-1 z-30"
              style={{ fontSize: size === "sm" ? 18 : 26 }}
              animate={!reducedMotion ? { rotate: [-6, 6, -6] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              📱
            </motion.div>
            <div className="absolute bottom-2 right-1 z-30" style={{ fontSize: size === "sm" ? 16 : 22 }}>👛💧</div>
            {!reducedMotion && [0, 1].map((i) => (
              <motion.div
                key={`taka-${i}`}
                className="absolute z-30 font-bold text-yellow-300"
                style={{ bottom: "12%", right: "20%", fontSize: size === "sm" ? 12 : 16 }}
                animate={{ x: [0, 30 + i * 10], y: [0, -40 - i * 10], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
              >
                ৳
              </motion.div>
            ))}
          </>
        )}

        {/* Confused: bouncing question marks */}
        {mode === "confused" && !reducedMotion && (
          <motion.div
            className="absolute top-3 right-2 z-30"
            style={{ fontSize: size === "sm" ? 18 : 24 }}
            animate={{ y: [0, -6, 0], rotate: [0, 12, -12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            ❓
          </motion.div>
        )}

        {/* Confident: lightbulb + shield */}
        {mode === "confident" && (
          <>
            <motion.div
              className="absolute top-2 right-1 z-30"
              style={{ fontSize: size === "sm" ? 18 : 24 }}
              animate={!reducedMotion ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ repeat: Infinity, duration: 1.6 }}
            >
              💡
            </motion.div>
            <div className="absolute bottom-3 left-1 z-30" style={{ fontSize: size === "sm" ? 16 : 22 }}>🛡️</div>
          </>
        )}

        {/* Bogura Boss: crown + chart */}
        {mode === "boguraBoss" && (
          <>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30" style={{ fontSize: size === "sm" ? 20 : 28 }}>👑</div>
            <div className="absolute bottom-2 right-1 z-30" style={{ fontSize: size === "sm" ? 16 : 22 }}>📈</div>
          </>
        )}

        {/* Recovery: water + leaves */}
        {mode === "recovery" && (
          <>
            <div className="absolute top-2 left-1 z-30" style={{ fontSize: size === "sm" ? 16 : 20 }}>💧</div>
            <div className="absolute top-2 right-1 z-30" style={{ fontSize: size === "sm" ? 16 : 20 }}>🌿</div>
            <div className="absolute bottom-2 right-1 z-30" style={{ fontSize: size === "sm" ? 16 : 20 }}>😌</div>
          </>
        )}

        {/* Broke: shaking coin + empty wallet */}
        {mode === "broke" && (
          <motion.div
            className="absolute bottom-2 right-1 z-30"
            style={{ fontSize: size === "sm" ? 18 : 24 }}
            animate={!reducedMotion ? { rotate: [-4, 4, -4] } : {}}
            transition={{ repeat: Infinity, duration: 0.4 }}
          >
            🪙
          </motion.div>
        )}

        {/* Heartbroken: broken heart icon */}
        {mode === "heartbroken" && (
          <div className="absolute top-2 right-1 z-30" style={{ fontSize: size === "sm" ? 18 : 24 }}>💔</div>
        )}

        {/* Dry Selim: cough emoji */}
        {mode === "drySelim" && !reducedMotion && (
          <motion.div
            className="absolute top-3 right-2 z-30"
            style={{ fontSize: size === "sm" ? 16 : 22 }}
            animate={{ opacity: [0, 1, 0], x: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            💨
          </motion.div>
        )}

        {/* Emotional Override: vibrating phone + alarm + warning */}
        {mode === "emotionalOverride" && (
          <>
            <motion.div
              className="absolute top-2 right-1 z-30"
              style={{ fontSize: size === "sm" ? 20 : 28 }}
              animate={!reducedMotion ? { rotate: [-18, 18, -18] } : {}}
              transition={{ repeat: Infinity, duration: 0.15 }}
            >
              📲
            </motion.div>
            <div className="absolute bottom-3 left-1 z-30" style={{ fontSize: size === "sm" ? 18 : 24 }}>💔</div>
            {size !== "sm" && (
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
                style={{ background: "#ec4899", color: "white", fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                Selim ignored your advice!
              </div>
            )}
          </>
        )}
      </div>

      {/* Bogura badge */}
      {showBadge && (
        <div
          className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            background: "linear-gradient(135deg, #FFD700, #FF8C00)",
            color: "#1a0f05",
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          🌾 Selim from Bogura
        </div>
      )}

      {/* Dynamic emotional status label */}
      {showStatus && (
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={reducedMotion ? {} : { opacity: 0, y: 4 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -4 }}
            className="mt-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
            style={{
              background:
                mode === "emotionalOverride" ? "rgba(236, 72, 153, 0.25)"
                : mode === "boguraBoss" ? "rgba(250, 204, 21, 0.25)"
                : mode === "confident" ? "rgba(34, 197, 94, 0.22)"
                : mode === "rechargeRomeo" || mode === "romantic" ? "rgba(244, 114, 182, 0.22)"
                : mode === "recovery" ? "rgba(34, 211, 238, 0.22)"
                : "rgba(255,255,255,0.12)",
              color:
                mode === "emotionalOverride" ? "#fbcfe8"
                : mode === "boguraBoss" ? "#FCD34D"
                : mode === "confident" ? "#86efac"
                : mode === "rechargeRomeo" || mode === "romantic" ? "#fbcfe8"
                : mode === "recovery" ? "#a5f3fc"
                : "#FFB347",
              border: `1px solid ${
                mode === "emotionalOverride" ? "rgba(236, 72, 153, 0.5)"
                : mode === "boguraBoss" ? "rgba(250, 204, 21, 0.5)"
                : "rgba(255,255,255,0.2)"
              }`,
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
            data-testid="selim-status-label"
          >
            ⚡ {status}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
