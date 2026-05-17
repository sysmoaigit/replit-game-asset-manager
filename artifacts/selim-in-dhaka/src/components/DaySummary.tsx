import { motion } from "framer-motion";
import { Stats, Flags } from "../types";
import type { DayForecast } from "../game/continuity";
import EventRecap from "./EventRecap";
import SceneArt from "./SceneArt";
import { getLifeSceneForDaySummary } from "../game/assets";
import { toBn } from "../lib/utils";
import { buildDayRecap } from "../chat/chatLog";

interface DaySummaryProps {
  day: number;
  stats: Stats;
  prevStats: Stats;
  flags: Flags;
  forecast?: DayForecast | null;
  onNext: () => void;
  reducedMotion?: boolean;
}

function getVerdict(stats: Stats, prevStats: Stats, flags: Flags): string {
  const dayBiryani = flags.biryaniCount;
  if (stats.pinkyHope > 80 && stats.selfRespect < 25) return "Pinky Hope সর্বোচ্চ। Self-Respect সর্বনিম্ন। সেলিম emotional ATM mode।";
  if (stats.selfRespect > 70) return "আজ সেলিম 'না' বলতে শিখেছে। Boundary বস।";
  if (stats.careerProgress > 50) return "আজ সেলিম career-এ মন দিয়েছে। ভবিষ্যৎ smile দিচ্ছে।";
  if (stats.health > 70 && stats.addiction < 20) return "আজ সেলিম নিজের উপর জিতেছে। ঢাকা হারেনি।";
  if (dayBiryani > 0 && stats.money < prevStats.money - 100) return "আজ সেলিম বিরিয়ানির কাছে হেরে গেছে। পকেট কাঁদছে।";
  if (flags.girlInvestment > 1500) return "আজকের ROI: seen। Dividend: 'you are nice'। Profit: 2 heart emoji।";
  if (stats.mood > 60) return "আজ সেলিম মোটামুটি মানুষ ছিলো।";
  if (stats.money < 200) return "আজ সেলিম পকেট বাঁচাতে বাঁচাতে হাঁপিয়ে গেছে।";
  if (stats.addiction > 50) return "আজ সেলিম একটু ধোঁয়ার পথে হেঁটেছে। সাবধান।";
  if (stats.iq > 60) return "আজ সেলিম মাথা খাটিয়েছে। স্মার্ট।";
  if (stats.energy < 30) return "আজ সেলিম ক্লান্ত ছিলো, কিন্তু টিকে আছে।";
  return "আজ সেলিম ঢাকার সাথে লড়াই করেছে।";
}

function getInvestmentRoast(invested: number): string {
  if (invested === 0) return "Selim invested ৳0। Market: untouched। Dignity: priceless।";
  if (invested < 200) return "Light investor। Risk: low। Heart: still functional।";
  if (invested < 800) return "Mid-cap lover। ROI: occasional 'thanks'। Future: uncertain।";
  if (invested < 1500) return "Heavy investor। Pinky portfolio expanding। Selim wallet shrinking।";
  return "Selim is now a Pinky-funded venture। IPO অনুসন্ধান চলছে। Loss: rent money।";
}

function StatChange({ label, icon, prev, curr }: { label: string; icon: string; prev: number; curr: number }) {
  const diff = Math.round(curr - prev);
  const isMoney = label === "Money";
  const displayPrev = isMoney ? `৳${toBn(Math.round(prev))}` : toBn(Math.round(prev));
  const displayCurr = isMoney ? `৳${toBn(Math.round(curr))}` : toBn(Math.round(curr));

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-black border-opacity-5">
      <div className="flex items-center gap-1.5">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-medium" style={{ color: "#444" }}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs opacity-60">{displayPrev}</span>
        <span className="text-xs opacity-40">→</span>
        <span className="text-xs font-bold" style={{ color: "#1a1a1a" }}>{displayCurr}</span>
        {diff !== 0 && (
          <span className={`text-xs font-bold ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
            {diff > 0 ? "+" : ""}{toBn(diff)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DaySummary({ day, stats, prevStats, flags, forecast, onNext, reducedMotion = false }: DaySummaryProps) {
  const verdict = getVerdict(stats, prevStats, flags);
  const dayScene = getLifeSceneForDaySummary({ stats: stats as unknown as Record<string, number>, flags: flags as unknown as Record<string, number> });
  const chatRecap = buildDayRecap(day);

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto px-4 py-6"
    >
      {/* Day's defining scene */}
      <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,140,40,0.25)" }}>
        <SceneArt
          sceneKey={dayScene}
          overlay="none"
          height={140}
          rounded={false}
          reducedMotion={reducedMotion}
          caption={`দিন ${toBn(day)} — ${verdict}`}
          trackUnlock
        />
      </div>

      {/* Day banner */}
      <div className="text-center mb-4">
        <motion.div
          initial={reducedMotion ? {} : { scale: 0.8 }}
          animate={reducedMotion ? {} : { scale: 1 }}
          className="inline-block rounded-2xl px-6 py-3 mb-2"
          style={{ background: "linear-gradient(135deg, #FF6B00, #FF8F00)" }}
        >
          <p className="text-white text-xs font-medium opacity-80">দিন {toBn(day)} শেষ</p>
          <h1 className="text-white text-xl font-bold">আজকের সেলিম রিপোর্ট</h1>
        </motion.div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: "rgba(255, 107, 0, 0.1)", border: "1px solid rgba(255, 107, 0, 0.2)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#FF6B00", fontFamily: "'Hind Siliguri', sans-serif" }}>
            🗣️ {verdict}
          </p>
        </div>
      </div>

      {forecast && <EventRecap forecast={forecast} />}

      {chatRecap && (
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "linear-gradient(135deg, #FFF8EE 0%, #FFE8D1 100%)",
            border: "1px solid rgba(255,107,0,0.18)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">💬</span>
            <h3 className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
              আজকের Chat Recap
            </h3>
            <span className="ml-auto text-xs opacity-60">{toBn(chatRecap.total)} messages</span>
          </div>
          <ul className="text-xs space-y-1" style={{ color: "#444", fontFamily: "'Hind Siliguri', sans-serif" }}>
            {chatRecap.warningsGiven > 0 && (
              <li>⚠️ তুই {toBn(chatRecap.warningsGiven)} বার warning দিছিলি।</li>
            )}
            {chatRecap.ignoredCount > 0 && (
              <li>📵 Selim {toBn(chatRecap.ignoredCount)} বার ignore করছে (Pinky cloud)।</li>
            )}
            {chatRecap.liesCaught > 0 && (
              <li>🤥 মিথ্যা ধরা পড়ছে {toBn(chatRecap.liesCaught)} বার।</li>
            )}
            {chatRecap.moneyAsked > 0 && (
              <li>💸 টাকা চাওয়া হইছে {toBn(chatRecap.moneyAsked)} বার।</li>
            )}
            {chatRecap.fakeIdRisks > 0 && (
              <li>🎭 Fake ID risk trigger হইছে {toBn(chatRecap.fakeIdRisks)} বার।</li>
            )}
            {chatRecap.memoriesSaved > 0 && (
              <li>📌 {toBn(chatRecap.memoriesSaved)} টা memory পিন করা হইছে।</li>
            )}
            {chatRecap.funniestLine && (
              <li className="pt-1 italic opacity-80">
                "{chatRecap.funniestLine.length > 90 ? chatRecap.funniestLine.slice(0, 90) + "…" : chatRecap.funniestLine}"
              </li>
            )}
            {chatRecap.warningsGiven === 0 && chatRecap.ignoredCount === 0 &&
              chatRecap.liesCaught === 0 && chatRecap.moneyAsked === 0 &&
              chatRecap.fakeIdRisks === 0 && chatRecap.memoriesSaved === 0 && (
              <li className="opacity-70">আজকের chat ছিলো calm। দুই বন্ধুর normal কথা।</li>
            )}
          </ul>
        </div>
      )}

      {/* Stats */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(135deg, #FFF8EE 0%, #FFF3E0 100%)", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        <StatChange label="Health" icon="❤️" prev={prevStats.health} curr={stats.health} />
        <StatChange label="Mood" icon="😊" prev={prevStats.mood} curr={stats.mood} />
        <StatChange label="Money" icon="৳" prev={prevStats.money} curr={stats.money} />
        <StatChange label="IQ" icon="🧠" prev={prevStats.iq} curr={stats.iq} />
        <StatChange label="Energy" icon="⚡" prev={prevStats.energy} curr={stats.energy} />
        <StatChange label="Reputation" icon="⭐" prev={prevStats.reputation} curr={stats.reputation} />
        <StatChange label="Addiction" icon="🚬" prev={prevStats.addiction} curr={stats.addiction} />
        <StatChange label="Temptation" icon="🔥" prev={prevStats.temptation} curr={stats.temptation} />
        <StatChange label="Self-Respect" icon="🛡️" prev={prevStats.selfRespect} curr={stats.selfRespect} />
        <StatChange label="Pinky Hope" icon="💖" prev={prevStats.pinkyHope} curr={stats.pinkyHope} />
        <StatChange label="Pinky Happy" icon="🎀" prev={prevStats.pinkyHappiness} curr={stats.pinkyHappiness} />
        <StatChange label="Career" icon="💼" prev={prevStats.careerProgress} curr={stats.careerProgress} />
        <StatChange label="Friend Trust" icon="🤝" prev={prevStats.friendTrust} curr={stats.friendTrust} />
        <StatChange label="Delusion" icon="🌫️" prev={prevStats.emotionalDelusion} curr={stats.emotionalDelusion} />
        <StatChange label="Attachment" icon="🔗" prev={prevStats.attachmentLevel} curr={stats.attachmentLevel} />
        <StatChange label="Loneliness" icon="🌑" prev={prevStats.loneliness} curr={stats.loneliness} />
        <StatChange label="Romantic Fever" icon="🔥" prev={prevStats.romanticFever} curr={stats.romanticFever} />
      </div>

      {/* Selim Obedience Report */}
      {(flags.playerAdviceFollowed + flags.playerAdviceIgnored + flags.halfObeys + flags.emotionalOverrides) > 0 && (
        <div
          className="rounded-2xl p-3 mb-4"
          style={{ background: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)", border: "1px solid rgba(139, 92, 246, 0.3)" }}
        >
          <p className="text-xs font-semibold mb-1.5" style={{ color: "#5b21b6" }}>🧠 আজকের Obedience Report</p>
          <div className="grid grid-cols-2 gap-1 text-[11px]" style={{ color: "#4c1d95", fontFamily: "'Hind Siliguri', sans-serif" }}>
            <span>✅ মেনেছে: <b>{flags.playerAdviceFollowed}</b></span>
            <span>🤷 অর্ধেক: <b>{flags.halfObeys}</b></span>
            <span>💔 Override: <b>{flags.emotionalOverrides}</b></span>
            <span>🙉 Ignored: <b>{flags.playerAdviceIgnored}</b></span>
          </div>
          {flags.emotionalOverrides >= 3 && (
            <p className="text-[11px] italic mt-1.5" style={{ color: "#5b21b6", fontFamily: "'Hind Siliguri', sans-serif" }}>
              "ভাই তুই বুঝবি না।" — সেলিম, {flags.emotionalOverrides} বার আজকে
            </p>
          )}
        </div>
      )}

      {/* Girl Investment ledger */}
      <div
        className="rounded-2xl p-3 mb-4"
        style={{ background: "linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)", border: "1px solid rgba(236, 72, 153, 0.3)" }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold" style={{ color: "#9d174d" }}>💸 Total Girl Investment</span>
          <span className="text-sm font-bold" style={{ color: "#9d174d" }}>৳{toBn(flags.girlInvestment.toLocaleString("en-US"))}</span>
        </div>
        <p className="text-[11px] italic" style={{ color: "#831843", fontFamily: "'Hind Siliguri', sans-serif" }}>
          {getInvestmentRoast(flags.girlInvestment)}
        </p>
        {flags.firstLoveCount > 0 && (
          <p className="text-[11px] mt-1" style={{ color: "#831843" }}>
            "এই বার সিরিয়াস" বলা হয়েছে: <b>{toBn(flags.firstLoveCount)}</b> বার
          </p>
        )}
      </div>

      {day < 15 ? (
        <button
          data-testid="btn-next-day"
          onClick={onNext}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #FF6B00, #FF8F00)", fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          দিন {toBn(day + 1)} শুরু হোক →
        </button>
      ) : (
        <button
          data-testid="btn-final-result"
          onClick={onNext}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #6B21A8, #7C3AED)", fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          চূড়ান্ত ফলাফল দেখো ✨
        </button>
      )}
    </motion.div>
  );
}
