import { motion, AnimatePresence } from "framer-motion";

interface Props {
  thought?: string | null;
  visible: boolean;
  reducedMotion?: boolean;
}

const DEFAULT_THOUGHTS = [
  "Pinky-র কথা মাথায় আসছে...",
  "ভাই কি বলবে এখন?",
  "Career নাকি love?",
  "Hmm...",
  "এইটা নিয়ে ভাবছি...",
];

export default function SelimThinkingBubble({ thought, visible, reducedMotion = false }: Props) {
  const text = thought ?? DEFAULT_THOUGHTS[Math.floor(Math.random() * DEFAULT_THOUGHTS.length)];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 8 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 8 }}
          className="relative px-3 py-2 rounded-2xl max-w-[180px] text-xs italic"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px dashed rgba(255,179,71,0.4)",
            color: "#FFB347",
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          <span>💭 {text}</span>
          <div
            className="absolute -bottom-2 left-4 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid rgba(255,255,255,0.08)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
