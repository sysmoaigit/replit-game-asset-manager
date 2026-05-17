import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSafeAsset, reportMissingImage, SELIM_ASSETS, SceneKey, Mood } from "../game/assets";
import { unlockScene } from "./SceneUnlockToast";

interface SceneArtProps {
  sceneKey: SceneKey | string;
  mood?: Mood | string;
  caption?: string;
  overlay?: "romantic" | "heartbreak" | "friendship" | "career" | "boss" | "silent" | "comedy" | "danger" | "none";
  showSelimBadge?: boolean;
  priority?: boolean;
  className?: string;
  height?: number | string;
  rounded?: boolean;
  reducedMotion?: boolean;
  fit?: "cover" | "contain";
  position?: string; // object-position
  /** When true, surfaces a one-shot toast the first time this scene appears. */
  trackUnlock?: boolean;
}

const overlayGradient: Record<string, string> = {
  romantic: "linear-gradient(180deg, rgba(236,72,153,0.05) 0%, rgba(0,0,0,0.55) 100%)",
  heartbreak: "linear-gradient(180deg, rgba(30,58,138,0.15) 0%, rgba(0,0,0,0.65) 100%)",
  friendship: "linear-gradient(180deg, rgba(180,83,9,0.08) 0%, rgba(0,0,0,0.55) 100%)",
  career: "linear-gradient(180deg, rgba(250,204,21,0.06) 0%, rgba(0,0,0,0.6) 100%)",
  boss: "linear-gradient(180deg, rgba(250,204,21,0.12) 0%, rgba(0,0,0,0.55) 100%)",
  silent: "linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(0,0,0,0.7) 100%)",
  comedy: "linear-gradient(180deg, rgba(255,153,51,0.08) 0%, rgba(0,0,0,0.5) 100%)",
  danger: "linear-gradient(180deg, rgba(220,38,38,0.18) 0%, rgba(0,0,0,0.65) 100%)",
  none: "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.55) 100%)",
};

// Mood-tinted gradients keyed by sceneKey prefix, used as a fallback when
// the real illustration for a scene isn't shipped yet.
const SCENE_GRADIENT_MAP: Array<[RegExp, string]> = [
  [/^rooftopSunset$/i, "linear-gradient(180deg, #FF8F00 0%, #CC3300 35%, #2d1a08 80%, #1a0f05 100%)"],
  [/^rooftopSilhouette$/i, "linear-gradient(180deg, #1a3a5a 0%, #2d1a08 60%, #0d0600 100%)"],
  [/^pinkyEffectWalk$/i, "linear-gradient(180deg, #FF69B4 0%, #FF8F00 40%, #2d1a08 90%)"],
  [/Heartbreak$/i, "linear-gradient(180deg, #1e3a8a 0%, #312e81 40%, #1a0f05 100%)"],
  [/^chaStall|FriendTalk$/i, "linear-gradient(180deg, #FFB347 0%, #B45309 50%, #2d1a08 100%)"],
  [/^career/i, "linear-gradient(180deg, #FACC15 0%, #B45309 45%, #1a0f05 100%)"],
  [/^bogura(Boss)?Rooftop$/i, "linear-gradient(180deg, #FFD700 0%, #FF6B00 40%, #2d1a08 95%)"],
  [/^characterSheet$/i, "linear-gradient(135deg, #FFF8EE 0%, #FFB347 100%)"],
  [/^eatingBiryani$/i, "linear-gradient(180deg, #C2410C 0%, #7C2D12 60%, #1a0f05 100%)"],
  [/^friendsCrushTeaStall$/i, "linear-gradient(180deg, #B45309 0%, #7C2D12 55%, #1a0f05 100%)"],
  [/^dreamingPinkyRooftop$/i, "linear-gradient(180deg, #831843 0%, #1e1b4b 60%, #0d0600 100%)"],
  [/^busDaydreamCrush$/i, "linear-gradient(180deg, #DB2777 0%, #7C3AED 55%, #1a0f05 100%)"],
  [/^brokeRentProblem$/i, "linear-gradient(180deg, #1f2937 0%, #292524 60%, #0d0600 100%)"],
  [/^campusDramaSlap$/i, "linear-gradient(180deg, #DC2626 0%, #7F1D1D 55%, #1a0f05 100%)"],
  [/^girlHappyHelp$/i, "linear-gradient(180deg, #F59E0B 0%, #B45309 55%, #1a0f05 100%)"],
  [/^askingMoneyFriend$/i, "linear-gradient(180deg, #B45309 0%, #57534E 55%, #1a0f05 100%)"],
  [/^workHustleMontage$/i, "linear-gradient(180deg, #1E3A8A 0%, #1F2937 60%, #0d0600 100%)"],
  [/^lifeChaosDashboard$/i, "linear-gradient(180deg, #7C3AED 0%, #1E40AF 50%, #0d0600 100%)"],
  [/^pinkyPhoneCall$/i, "linear-gradient(180deg, #DB2777 0%, #4C1D95 55%, #1a0f05 100%)"],
  [/^dhakaTraffic$/i, "linear-gradient(180deg, #F97316 0%, #B45309 50%, #1a0f05 100%)"],
  [/^messRoom$/i, "linear-gradient(180deg, #7C5E3A 0%, #3F3722 55%, #0d0600 100%)"],
  [/^jobInterview$/i, "linear-gradient(180deg, #1E3A8A 0%, #475569 55%, #0d0600 100%)"],
  [/^friendsLaughing$/i, "linear-gradient(180deg, #F59E0B 0%, #B45309 50%, #1a0f05 100%)"],
  [/^recoveryWalk$/i, "linear-gradient(180deg, #FCA5A5 0%, #FB923C 45%, #2d1a08 100%)"],
];

function gradientForScene(sceneKey: string): string {
  for (const [pattern, gradient] of SCENE_GRADIENT_MAP) {
    if (pattern.test(sceneKey)) return gradient;
  }
  return "linear-gradient(180deg, #2d1a08 0%, #1a0f05 60%, #0d0600 100%)";
}

function ProceduralSceneFallback({ sceneKey }: { sceneKey: string }) {
  const grad = gradientForScene(sceneKey);
  return (
    <div className="absolute inset-0" style={{ background: grad }} aria-hidden>
      {/* Soft horizon glow */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "55%",
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,107,0,0.25) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      {/* Skyline silhouette */}
      <svg
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 w-full"
        style={{ height: "32%", opacity: 0.55 }}
      >
        <path
          d="M0 80 V50 L20 50 L20 38 L42 38 L42 22 L70 22 L70 44 L96 44 L96 30 L130 30 L130 12 L168 12 L168 36 L200 36 L200 24 L232 24 L232 46 L264 46 L264 28 L298 28 L298 18 L332 18 L332 40 L366 40 L366 30 L400 30 L400 80 Z"
          fill="#0d0600"
        />
        {/* a few warm windows */}
        {[60, 110, 150, 210, 280, 340].map((x, i) => (
          <rect key={i} x={x} y={28 + (i % 3) * 6} width="3" height="3" fill="#FFD700" opacity="0.8" />
        ))}
      </svg>
    </div>
  );
}

export default function SceneArt({
  sceneKey,
  caption,
  overlay = "none",
  showSelimBadge = false,
  priority = false,
  className = "",
  height = 200,
  rounded = true,
  reducedMotion = false,
  fit = "cover",
  position = "center 30%",
  trackUnlock = false,
}: SceneArtProps) {
  const [err, setErr] = useState(false);
  const src = getSafeAsset(sceneKey);

  useEffect(() => {
    if (!trackUnlock) return;
    if (typeof sceneKey !== "string") return;
    if ((sceneKey as string) in SELIM_ASSETS) {
      unlockScene(sceneKey as SceneKey);
    }
  }, [trackUnlock, sceneKey]);

  return (
    <div
      className={`relative w-full overflow-hidden ${rounded ? "rounded-2xl" : ""} ${className}`}
      style={{ height, background: "linear-gradient(135deg, #1a0f05, #2d1a08)" }}
      data-testid={`scene-art-${sceneKey}`}
    >
      {src && !err ? (
        <motion.img
          src={src}
          alt={`Selim scene: ${sceneKey}`}
          loading={priority ? "eager" : "lazy"}
          onError={() => { setErr(true); if (src) reportMissingImage(src); }}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: fit, objectPosition: position }}
          initial={reducedMotion ? false : { scale: 1.05, opacity: 0 }}
          animate={reducedMotion ? {} : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ) : (
        <ProceduralSceneFallback sceneKey={String(sceneKey)} />
      )}

      {/* Overlay gradient for legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: overlayGradient[overlay] }}
      />

      {/* Bogura badge */}
      {showSelimBadge && (
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold z-10"
          style={{
            background: "linear-gradient(135deg, #FFD700, #FF8C00)",
            color: "#1a0f05",
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          🌾 Selim
        </div>
      )}

      {/* Caption */}
      {caption && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2 text-[11px] leading-snug"
          style={{
            color: "#FFE7B0",
            fontFamily: "'Hind Siliguri', sans-serif",
            background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)",
            textShadow: "0 1px 4px rgba(0,0,0,0.85)",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
