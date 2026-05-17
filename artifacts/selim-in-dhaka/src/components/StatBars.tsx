import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stats } from "../types";
import Icon, { IconName } from "./ui/Icon";
import { toBn } from "../lib/utils";

interface StatBarsProps {
  stats: Stats;
  previousStats?: Stats;
  reducedMotion?: boolean;
}

interface StatDelta {
  key: string;
  value: number;
  id: number;
}

let deltaIdCounter = 0;

export default function StatBars({ stats, previousStats, reducedMotion = false }: StatBarsProps) {
  const [deltas, setDeltas] = useState<StatDelta[]>([]);
  const prevRef = useRef<Stats | undefined>(previousStats);

  useEffect(() => {
    if (!previousStats) return;
    const prev = prevRef.current;
    if (!prev) { prevRef.current = previousStats; return; }

    const newDeltas: StatDelta[] = [];
    const keys: (keyof Stats)[] = ["health", "mood", "money", "iq", "energy", "reputation", "addiction", "temptation", "selfRespect", "pinkyHope", "pinkyHappiness", "careerProgress", "friendTrust", "emotionalDelusion", "attachmentLevel", "loneliness", "romanticFever"];
    for (const k of keys) {
      const diff = stats[k] - prev[k];
      if (Math.abs(diff) >= 1) {
        newDeltas.push({ key: k, value: Math.round(diff), id: deltaIdCounter++ });
      }
    }
    if (newDeltas.length > 0) {
      setDeltas((d) => [...d, ...newDeltas]);
      setTimeout(() => {
        setDeltas((d) => d.filter((x) => !newDeltas.find((n) => n.id === x.id)));
      }, 2000);
    }
    prevRef.current = previousStats;
  }, [previousStats, stats]);

  const bars: { key: keyof Stats; label: string; icon: IconName; color: string; dangerBelow?: number; dangerAbove?: number; isInverse?: boolean }[] = [
    { key: "health", label: "Health", icon: "heart", color: "#ef4444", dangerBelow: 25 },
    { key: "mood", label: "Mood", icon: "smile", color: "#eab308", dangerBelow: 20 },
    { key: "iq", label: "IQ", icon: "brain", color: "#3b82f6" },
    { key: "energy", label: "Energy", icon: "bolt", color: "#06b6d4", dangerBelow: 15 },
    { key: "reputation", label: "Rep", icon: "star", color: "#a855f7" },
    { key: "addiction", label: "Addiction", icon: "smoke", color: "#6b7280", dangerAbove: 60, isInverse: true },
    { key: "temptation", label: "Tempt", icon: "flame", color: "#f97316", dangerAbove: 70, isInverse: true },
    { key: "selfRespect", label: "Self-Respect", icon: "shield", color: "#10b981", dangerBelow: 20 },
    { key: "pinkyHope", label: "Pinky Hope", icon: "pinky", color: "#ec4899", dangerAbove: 80, isInverse: true },
    { key: "pinkyHappiness", label: "Pinky Happy", icon: "ribbon", color: "#f472b6" },
    { key: "careerProgress", label: "Career", icon: "briefcase", color: "#8b5cf6" },
    { key: "friendTrust", label: "Friend Trust", icon: "handshake", color: "#22c55e", dangerBelow: 25 },
    { key: "emotionalDelusion", label: "Delusion", icon: "fog", color: "#a78bfa", dangerAbove: 75, isInverse: true },
    { key: "attachmentLevel", label: "Attachment", icon: "link", color: "#fb7185", dangerAbove: 75, isInverse: true },
    { key: "loneliness", label: "Loneliness", icon: "moon", color: "#64748b", dangerAbove: 70, isInverse: true },
    { key: "romanticFever", label: "Romantic Fever", icon: "fever", color: "#f43f5e", dangerAbove: 80, isInverse: true },
  ];

  const isDanger = (bar: typeof bars[0]) => {
    const v = stats[bar.key] as number;
    if (bar.dangerBelow !== undefined && v < bar.dangerBelow) return true;
    if (bar.dangerAbove !== undefined && v > bar.dangerAbove) return true;
    return false;
  };

  return (
    <div className="w-full space-y-1 px-1">
      {/* Money row - special */}
      <div className="flex items-center gap-2 mb-1">
        <Icon name="money" size={14} className="flex-shrink-0" style={{ color: stats.money < 0 ? "#ef4444" : "#FFD700" }} title="Money" />
        <div className="flex-1">
          <motion.div
            className="text-sm font-bold"
            animate={stats.money < 0 ? (reducedMotion ? {} : { color: ["#ef4444", "#ff6b6b", "#ef4444"] }) : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ color: stats.money < 0 ? "#ef4444" : stats.money < 200 ? "#f97316" : "#22c55e" }}
          >
            ৳{toBn(stats.money.toLocaleString("en-US"))} টাকা
          </motion.div>
        </div>
        <AnimatePresence>
          {deltas.filter((d) => d.key === "money").map((d) => (
            <motion.span
              key={d.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="text-xs font-bold absolute right-4"
              style={{ color: d.value > 0 ? "#22c55e" : "#ef4444" }}
            >
              {d.value > 0 ? "+" : ""}{toBn(d.value)}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Stat bars */}
      {bars.map((bar) => {
        const val = stats[bar.key] as number;
        const pct = Math.max(0, Math.min(100, val));
        const danger = isDanger(bar);
        const delta = deltas.filter((d) => d.key === bar.key);

        return (
          <div key={bar.key} className="flex items-center gap-1.5 relative">
            <Icon name={bar.icon} size={14} className="flex-shrink-0" style={{ color: bar.color }} title={bar.label} />
            <div className="flex-1 relative">
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${pct}%` }}
                  transition={reducedMotion ? {} : { duration: 0.5, ease: "easeOut" }}
                  style={{
                    background: bar.color,
                    boxShadow: danger ? `0 0 6px ${bar.color}` : "none",
                  }}
                />
              </div>
              {danger && !reducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{ background: bar.color, borderRadius: 4 }}
                />
              )}
            </div>
            <span className="text-xs w-6 text-right flex-shrink-0 opacity-70">{toBn(Math.round(val))}</span>

            {/* Floating delta */}
            <AnimatePresence>
              {delta.map((d) => (
                <motion.span
                  key={d.id}
                  initial={{ opacity: 1, y: 0, x: 0 }}
                  animate={{ opacity: 0, y: -18 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute right-8 text-xs font-bold pointer-events-none z-30"
                  style={{ color: d.value > 0 ? "#22c55e" : "#ef4444" }}
                >
                  {d.value > 0 ? "+" : ""}{toBn(d.value)}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
