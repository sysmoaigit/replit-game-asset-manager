import type { DayForecast } from "../game/continuity";

interface EventRecapProps {
  forecast: DayForecast;
}

export default function EventRecap({ forecast }: EventRecapProps) {
  return (
    <div
      data-testid="event-recap"
      className="rounded-2xl p-3 mb-4 space-y-1.5"
      style={{
        background: "linear-gradient(135deg, #1a0f08 0%, #2a1810 100%)",
        border: "1px solid rgba(255, 140, 40, 0.3)",
      }}
    >
      <div className="text-orange-300 text-[11px] font-bold uppercase tracking-wide">
        🎬 কাল যা হলো · আজ যা হবে
      </div>

      <Row icon="✅" label="Best moment" text={forecast.yesterdayBest} color="#86efac" />
      <Row icon="⚠️" label="Worst moment" text={forecast.yesterdayWorst} color="#fca5a5" />

      {forecast.currentPromise && (
        <Row icon="🤝" label="Promise" text={forecast.currentPromise} color="#fde68a" />
      )}
      {forecast.emotionalDanger && (
        <Row icon="🚨" label="Danger" text={forecast.emotionalDanger} color="#fda4af" />
      )}

      <div
        className="text-center text-orange-200 text-xs font-semibold mt-2 pt-2"
        style={{ borderTop: "1px dashed rgba(255,140,40,0.25)", fontFamily: "'Hind Siliguri', sans-serif" }}
      >
        {forecast.forecast}
      </div>
    </div>
  );
}

function Row({ icon, label, text, color }: { icon: string; label: string; text: string; color: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase opacity-70" style={{ color }}>{label}</div>
        <div
          className="text-[12px] leading-snug"
          style={{ color: "#fff8ee", fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
