import { motion } from "framer-motion";
import SceneArt from "./SceneArt";

interface TutorialProps {
  onStart: () => void;
  reducedMotion?: boolean;
}

const tips = [
  { icon: "❤️", title: "Stats Balance রাখো", text: "Health, Mood, Money, IQ, Energy—সবই জরুরি। একটা কমে গেলে বাকিগুলো চাপে পড়ে।" },
  { icon: "🚬", title: "সিগারেট সর্বনাশ", text: "এক টানে মন ভালো, কিন্তু Health, Money, Energy কমে। Addiction বাড়তে থাকে। সাবধান!" },
  { icon: "🧠", title: "IQ বাড়াও", text: "IQ বেশি থাকলে পরিণতি আগে থেকেই দেখতে পাবে। Smart Move-এ ভালো ফল পাবে।" },
  { icon: "৳", title: "টাকা মানে সুযোগ", text: "ঢাকায় টাকা ছাড়া এক পা নড়া যায় না। বাজেট করো, দরদাম করো, স্ক্যাম এড়াও।" },
  { icon: "💪", title: "Recovery সম্ভব", text: "অনেক কিছু ভুল হলে Recovery Mode আসবে। পাঁচ ধাপে সুস্থ হওয়া যায়। হাল ছেড়ো না।" },
];

export default function Tutorial({ onStart, reducedMotion = false }: TutorialProps) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      className="min-h-full w-full flex flex-col items-center"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #1a0f05 0%, #2d1a08 100%)",
      }}
      data-testid="screen-tutorial"
    >
      <div className="w-full max-w-sm px-5 pt-8 pb-6 flex flex-col gap-4">
        {/* Meet Selim — character sheet intro */}
        <SceneArt
          sceneKey="characterSheet"
          overlay="silent"
          height={220}
          priority
          reducedMotion={reducedMotion}
          caption="সেলিম — Bogura'র ছেলে, Dhaka'র স্বপ্ন। তোমার বন্ধু।"
          showSelimBadge
          position="center top"
        />

        {/* Header */}
        <div className="text-center mb-2">
          <h1
            className="text-2xl font-bold"
            style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            কীভাবে খেলবে?
          </h1>
          <p className="text-sm mt-1" style={{ color: "#FFB347" }}>
            ঢাকায় টিকে থাকার গাইড
          </p>
        </div>

        {/* Tips */}
        {tips.map((tip, i) => (
          <motion.div
            key={tip.icon}
            initial={reducedMotion ? {} : { x: -20, opacity: 0 }}
            animate={reducedMotion ? {} : { x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-3 items-start rounded-2xl p-3"
            style={{ background: "rgba(255, 107, 0, 0.1)", border: "1px solid rgba(255, 107, 0, 0.2)" }}
          >
            <span className="text-2xl flex-shrink-0">{tip.icon}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "#FFD700", fontFamily: "'Hind Siliguri', sans-serif" }}>
                {tip.title}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#FFB890", fontFamily: "'Hind Siliguri', sans-serif" }}>
                {tip.text}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Example card */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: "#FFD700" }}>প্রতিটি কার্ডে ৪টি পছন্দ:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "করি!", color: "#FF6B00", desc: "সরাসরি কাজ" },
              { label: "এড়াই", color: "#16a34a", desc: "নিরাপদ পথ" },
              { label: "স্মার্ট মুভ", color: "#2563eb", desc: "বুদ্ধিমানের পথ" },
              { label: "পরে হবে", color: "#6b7280", desc: "অপেক্ষা করো" },
            ].map((b) => (
              <div
                key={b.label}
                className="rounded-xl p-2 text-center"
                style={{ background: b.color, opacity: 0.9 }}
              >
                <p className="text-white text-xs font-bold">{b.label}</p>
                <p className="text-white text-xs opacity-70">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          data-testid="btn-start-game"
          onClick={onStart}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform mt-2"
          style={{
            background: "linear-gradient(135deg, #FF6B00 0%, #FF8F00 100%)",
            fontFamily: "'Hind Siliguri', sans-serif",
            boxShadow: "0 4px 15px rgba(255, 107, 0, 0.4)",
          }}
        >
          খেলা শুরু করি! 🎮
        </button>
      </div>
    </motion.div>
  );
}
