import { motion } from "framer-motion";

interface Props {
  reducedMotion?: boolean;
}

export default function SelimTypingIndicator({ reducedMotion = false }: Props) {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Hind Siliguri', sans-serif" }}>
        Selim typing
      </span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#FFB347" }}
          animate={reducedMotion ? {} : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
