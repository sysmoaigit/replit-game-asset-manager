import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SELIM_ASSETS, type SceneKey } from "../game/assets";
import { ENDINGS } from "../game/endings";
import type { Achievement, Flags, Stats } from "../types";
import { loadEndingHistory, type EndingHistory } from "../lib/endingHistory";
import { VOICE_LINES, type VoiceLine, type VoiceCategory } from "../game/voiceLines";
import { audioEngine } from "../game/audioEngine";
import { EASTER_EGGS, EGG_TOTAL, loadUnlockedEggs, tryUnlockEgg, type EasterEggId } from "../game/easterEggs";
import { notifyEggUnlock } from "./EggUnlockToast";
import { SELIM_MOMENTS, type SelimMoment } from "../game/moments";
import { getSeenMomentIds, getMomentUnlockDay, TOTAL_MOMENTS } from "../game/storyProgress";
import StoryBeatModal from "./StoryBeatModal";

interface SelimAlbumProps {
  achievements: Achievement[];
  flags?: Flags;
  stats?: Stats;
  onClose: () => void;
  reducedMotion?: boolean;
  isSoundEnabled?: boolean;
}

type Tab = "scenes" | "endings" | "achievements" | "quotes" | "eggs" | "story" | "secret";

// Selim voice lines that have real shipped MP3s in public/audio/voice/selim/.
// Keep this in sync with the files actually present on disk.
const SHIPPED_SELIM_AUDIO: ReadonlySet<string> = new Set([
  "s_greet_morning_01", "s_greet_morning_02", "s_greet_morning_03",
  "s_pinky_recharge_01", "s_pinky_recharge_03", "s_pinky_recharge_07",
  "s_pinky_msg_01", "s_pinky_msg_05",
  "s_pinky_refuse_01", "s_pinky_refuse_03",
  "s_heartbreak_01", "s_heartbreak_04", "s_heartbreak_07",
  "s_override_01", "s_override_02",
  "s_obey_01", "s_obey_05",
  "s_promise_made_01", "s_promise_broken_01",
  "s_bestfriend_01", "s_bestfriend_03",
  "s_recovery_02",
  "s_career_01", "s_food_01", "s_money_01",
  "s_day_end_01", "s_day_end_02",
  "s_new_crush_01", "s_bogura_01", "s_achievement_01",
  "s_ending_good_02", "s_ending_bad_02",
]);

const HEARD_KEY = "selim_dhaka_heard_quotes_v1";
function loadHeard(): Set<string> {
  try {
    const raw = localStorage.getItem(HEARD_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}
function saveHeard(set: Set<string>): void {
  try { localStorage.setItem(HEARD_KEY, JSON.stringify(Array.from(set))); } catch { /* ignore */ }
}

const CATEGORY_LABEL: Partial<Record<VoiceCategory, { label: string; emoji: string }>> = {
  greeting: { label: "Greetings", emoji: "👋" },
  morning: { label: "Morning", emoji: "🌅" },
  pinky_recharge: { label: "Pinky Recharge", emoji: "📲" },
  pinky_message: { label: "Pinky Messages", emoji: "💬" },
  pinky_refuse: { label: "Setting Boundaries", emoji: "🛑" },
  heartbreak: { label: "Heartbreak", emoji: "💔" },
  override: { label: "Emotional Override", emoji: "🔥" },
  obey: { label: "Self-Respect", emoji: "💪" },
  half_obey: { label: "Compromise", emoji: "⚖️" },
  promise_made: { label: "Promises Made", emoji: "🤝" },
  promise_broken: { label: "Promises Broken", emoji: "💢" },
  best_friend: { label: "Best Friend", emoji: "🤜🤛" },
  recovery: { label: "Recovery", emoji: "🩹" },
  career: { label: "Career", emoji: "💼" },
  food: { label: "Food", emoji: "🍛" },
  money: { label: "Money", emoji: "💸" },
  advice: { label: "Advice Response", emoji: "🗣️" },
  silent: { label: "Silent Moods", emoji: "🤐" },
  angry: { label: "Angry", emoji: "😡" },
  apology: { label: "Apology", emoji: "🙏" },
  day_end: { label: "Day End", emoji: "🌙" },
  new_crush: { label: "New Crush", emoji: "😍" },
  bogura_memory: { label: "Bogura Memories", emoji: "🏞️" },
  achievement: { label: "Achievements", emoji: "🏆" },
  trust_up: { label: "Friendship Up", emoji: "📈" },
  trust_down: { label: "Friendship Down", emoji: "📉" },
  ending_good: { label: "Good Ending", emoji: "🌟" },
  ending_bad: { label: "Bad Ending", emoji: "🥀" },
};

const SCENE_META: Record<SceneKey, { title: string; caption: string; mood: string }> = {
  main: { title: "Selim", caption: "ক্যানোনিকাল অবতার — Bogura থেকে Dhaka", mood: "🎯" },
  characterSheet: { title: "Character Sheet", caption: "Selim-এর পুরো রূপ ও ভঙ্গি", mood: "📓" },
  rooftopSunset: { title: "Rooftop Sunset", caption: "মেস বাড়ির ছাদে সূর্যাস্ত — হিসাব মেলানোর সময়", mood: "🌇" },
  pinkyEffectWalk: { title: "Pinky Effect Walk", caption: "শহরের রাস্তায় Pinky-এর hmm-এ ডুবে", mood: "💗" },
  rainyHeartbreak: { title: "Rainy Heartbreak", caption: "বৃষ্টিতে ভিজে seen-এর কষ্ট", mood: "💔" },
  chaStallFriendTalk: { title: "Cha Stall Talk", caption: "Cha Mama, Rafiq আর জীবন উপদেশ", mood: "☕" },
  careerStruggle: { title: "Career Struggle", caption: "Interview, freelance, late-night CV", mood: "💼" },
  boguraBossRooftop: { title: "Bogura Boss", caption: "নিজের পায়ে দাঁড়ানো Selim", mood: "👑" },
  rooftopSilhouette: { title: "Silent Reflection", caption: "একা ছাদে — কথা নাই, ভাব আছে", mood: "🌙" },
  eatingBiryani: { title: "Biryani Before Budget", caption: "Love uncertain, kacchi sure।", mood: "🍛" },
  friendsCrushTeaStall: { title: "Cha Stall Crush Alert", caption: "Friends advice দিচ্ছে, Selim destiny খুঁজছে।", mood: "👀" },
  dreamingPinkyRooftop: { title: "Pinky Rooftop Dream", caption: "একটা message-এ পুরো future plan।", mood: "💭" },
  busDaydreamCrush: { title: "First Love Again", caption: "She asked for route. Selim saw wedding.", mood: "🚌" },
  brokeRentProblem: { title: "Rent Due, Wallet Empty", caption: "Dhaka test শুরু — pocket vs Pinky।", mood: "💸" },
  campusDramaSlap: { title: "Boundary Lesson", caption: "Fantasy is not consent। Reality শিখিয়ে দিল।", mood: "🛑" },
  girlHappyHelp: { title: "Kindness or Trap?", caption: "Help bhalo। Bankrupt hoya bhalo na।", mood: "🎀" },
  askingMoneyFriend: { title: "Bhai, 500 Taka Hobe?", caption: "Reason: urgent। Real reason: suspicious।", mood: "🤝" },
  pharmacySecret: { title: "The Pharmacy Secret", caption: "Hero mode pill-এ আসে না — lifestyle-এ আসে।", mood: "💊" },
  workHustleMontage: { title: "Hustle Montage", caption: "Pinky reply uncertain। Work payment real।", mood: "💼" },
  lifeChaosDashboard: { title: "Brain 1% Battery", caption: "Mom, Pinky, rent, crush — সব একসাথে।", mood: "🌀" },
  pinkyPhoneCall: { title: "Pinky Phone Call", caption: "একটা ring-tone-এ পুরো রাত ঘুম নাই।", mood: "📞" },
  dhakaTraffic: { title: "Dhaka Traffic", caption: "জ্যাম, রিকশা, CNG — শহর-ই গল্প।", mood: "🛺" },
  messRoom: { title: "Mess Room", caption: "এক বাল্ব, এক fan, একশ চিন্তা।", mood: "🛏️" },
  jobInterview: { title: "Job Interview", caption: "Tie tight, palms wet, future uncertain।", mood: "👔" },
  friendsLaughing: { title: "Friends Laughing", caption: "Adda যখন থেরাপি হয়ে যায়।", mood: "😂" },
  recoveryWalk: { title: "Recovery Walk", caption: "Hatirjheel-এ ভোর — heart reset হচ্ছে।", mood: "🚶" },
  chaiwalaRooftopDate: { title: "Chaiwala Plot Twist", caption: "Plan ছিলো romance। হলো chaos — extra চিনি সহ।", mood: "🍵" },
};

// Tabs in the album are grouped — life scenes get their own section.
const LIFE_SCENE_KEYS: ReadonlyArray<SceneKey> = [
  "eatingBiryani", "friendsCrushTeaStall", "dreamingPinkyRooftop",
  "busDaydreamCrush", "brokeRentProblem", "campusDramaSlap",
  "girlHappyHelp", "askingMoneyFriend", "workHustleMontage", "lifeChaosDashboard",
  "pinkyPhoneCall", "dhakaTraffic", "messRoom", "jobInterview",
  "friendsLaughing", "recoveryWalk",
];

export default function SelimAlbum({ achievements, flags, stats, onClose, reducedMotion = false, isSoundEnabled = true }: SelimAlbumProps) {
  const [tab, setTab] = useState<Tab>("scenes");
  const history: EndingHistory = useMemo(() => loadEndingHistory(), []);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const [heard, setHeard] = useState<Set<string>>(() => loadHeard());
  const [unlockedEggs, setUnlockedEggs] = useState<Set<EasterEggId>>(() => loadUnlockedEggs());

  // Visiting the album is itself a hidden egg. Fire once on mount and
  // refresh the egg set so the new unlock shows immediately.
  useEffect(() => {
    const egg = tryUnlockEgg("first_album_visit");
    if (egg) {
      notifyEggUnlock(egg);
      setUnlockedEggs(loadUnlockedEggs());
    }
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const seenEndingsCount = Object.keys(history).length;
  const selimQuoteCount = useMemo(
    () => VOICE_LINES.filter((l) => l.speaker === "selim").length,
    [],
  );

  const playQuote = (line: VoiceLine) => {
    audioEngine.unlock();
    audioEngine.playVoiceLine(line.id);
    if (!heard.has(line.id)) {
      const next = new Set(heard);
      next.add(line.id);
      setHeard(next);
      saveHeard(next);
    }
  };

  // Close on Escape; focus the close button on open
  useEffect(() => {
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.88)" }}
      data-testid="screen-album"
      role="dialog"
      aria-modal="true"
      aria-label="Selim's Album"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={reducedMotion ? {} : { scale: 0.95, y: 20 }}
        animate={reducedMotion ? {} : { scale: 1, y: 0 }}
        exit={reducedMotion ? {} : { scale: 0.95, y: 20 }}
        className="w-full max-w-md mx-3 rounded-3xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "92vh",
          background: "linear-gradient(180deg, #1a0f08 0%, #2a1810 100%)",
          border: "1px solid rgba(255,140,40,0.3)",
        }}
      >
        {/* Header */}
        <div
          className="px-5 pt-4 pb-3 flex items-center justify-between"
          style={{ background: "linear-gradient(90deg, #FF6B00, #FF8F00)" }}
        >
          <div>
            <h2 className="text-white text-lg font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              Selim-এর অ্যালবাম
            </h2>
            <div className="text-white/85 text-[11px]">
              {unlockedCount}/{achievements.length} achievements · {seenEndingsCount}/{ENDINGS.length} endings · {heard.size}/{selimQuoteCount} quotes heard
            </div>
          </div>
          <button
            ref={closeBtnRef}
            data-testid="btn-album-close"
            onClick={onClose}
            aria-label="Close album"
            className="rounded-full w-8 h-8 flex items-center justify-center text-white text-lg"
            style={{ background: "rgba(0,0,0,0.25)" }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-2 pt-2 gap-0.5 flex-wrap" style={{ background: "rgba(0,0,0,0.4)" }}>
          {(["story", "scenes", "secret", "endings", "achievements", "quotes", "eggs"] as Tab[]).map((t) => {
            const label =
              t === "story" ? "📖 Story" :
              t === "scenes" ? "🎬 Scenes" :
              t === "secret" ? "💞 Secret" :
              t === "endings" ? "🏁 Endings" :
              t === "achievements" ? "🏆 Awards" :
              t === "quotes" ? "🎙️ Quotes" :
              "🥚 Eggs";
            const active = tab === t;
            return (
              <button
                key={t}
                data-testid={`tab-${t}`}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-t-xl text-xs font-semibold transition-colors"
                style={{
                  background: active ? "rgba(255,107,0,0.2)" : "transparent",
                  color: active ? "#FFB066" : "rgba(255,255,255,0.55)",
                  borderBottom: active ? "2px solid #FF8F00" : "2px solid transparent",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3" style={{ background: "rgba(0,0,0,0.45)" }}>
          {tab === "story" && <StoryTab reducedMotion={reducedMotion} isSoundEnabled={isSoundEnabled} />}
          {tab === "scenes" && <ScenesTab reducedMotion={reducedMotion} />}
          {tab === "secret" && <SecretAlbumTab flags={flags} stats={stats} reducedMotion={reducedMotion} />}
          {tab === "endings" && <EndingsTab history={history} />}
          {tab === "achievements" && <AchievementsTab achievements={achievements} />}
          {tab === "quotes" && <QuotesTab heard={heard} onPlay={playQuote} />}
          {tab === "eggs" && <EggsTab unlocked={unlockedEggs} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StoryTab({ reducedMotion, isSoundEnabled }: { reducedMotion: boolean; isSoundEnabled: boolean }) {
  const seenIds = getSeenMomentIds();
  const seenCount = seenIds.size;
  const [replayMoment, setReplayMoment] = useState<SelimMoment | null>(null);

  return (
    <div className="space-y-3">
      {replayMoment && (
        <StoryBeatModal
          key={`album-replay-${replayMoment.id}`}
          moment={replayMoment}
          day={getMomentUnlockDay(replayMoment.id) ?? 1}
          reducedMotion={reducedMotion}
          isSoundEnabled={isSoundEnabled}
          replayMode
          onDone={() => setReplayMoment(null)}
        />
      )}
      {/* Progress */}
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold" style={{ color: "#c084fc" }}>
            📖 Story Progress
          </span>
          <span className="text-xs font-bold" style={{ color: "#FFD700" }}>
            {seenCount}/{TOTAL_MOMENTS} chapters
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${(seenCount / TOTAL_MOMENTS) * 100}%`,
              background: "linear-gradient(90deg, #a855f7, #FFD700)",
              transition: "width 0.6s ease",
            }}
          />
        </div>
        {seenCount === 0 && (
          <p className="text-[10px] mt-1.5 italic" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Hind Siliguri', sans-serif" }}>
            খেলতে শুরু করো — প্রতিটি নতুন scene-এ একটি chapter unlock হবে।
          </p>
        )}
      </div>

      {/* Chapter list */}
      <div className="space-y-1.5">
        {SELIM_MOMENTS.map((moment) => {
          const unlocked = seenIds.has(moment.id);
          const unlockDay = getMomentUnlockDay(moment.id);
          const img = SELIM_ASSETS[moment.sceneKey];
          return (
            <motion.div
              key={moment.id}
              initial={reducedMotion ? {} : { opacity: 0, y: 6 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: moment.chapter * 0.03 }}
              className="rounded-xl overflow-hidden flex items-stretch"
              style={{
                background: unlocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${unlocked ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.06)"}`,
                opacity: unlocked ? 1 : 0.55,
              }}
            >
              {/* Thumbnail */}
              <div className="w-16 flex-shrink-0 relative overflow-hidden" style={{ minHeight: 64 }}>
                {unlocked && img ? (
                  <img src={img} alt={moment.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="text-xl">{unlocked ? "📸" : "🔒"}</span>
                  </div>
                )}
                <div
                  className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: unlocked ? "#a855f7" : "rgba(0,0,0,0.5)", color: "#fff" }}
                >
                  {moment.chapter}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 px-2.5 py-2 min-w-0">
                <div
                  className="text-xs font-bold leading-tight truncate"
                  style={{ color: unlocked ? "#FFD700" : "rgba(255,255,255,0.35)", fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  {unlocked ? moment.titleBangla : `Chapter ${moment.chapter}`}
                </div>
                {unlocked ? (
                  <>
                    <div
                      className="text-[10px] mt-0.5 leading-tight"
                      style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      {moment.captionBangla}
                    </div>
                    <div
                      className="text-[9px] mt-1 italic"
                      style={{ color: "#c084fc", fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      {unlockDay ? `Day ${unlockDay} unlocked · ` : ""}"{moment.lessonBangla.slice(0, 45)}{moment.lessonBangla.length > 45 ? "…" : ""}"
                    </div>
                  </>
                ) : (
                  <div
                    className="text-[9px] mt-1 italic"
                    style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    দিন {moment.triggerDay}-এ unlock হবে
                  </div>
                )}
              </div>

              {/* Replay button (unlocked only) */}
              {unlocked && (
                <div className="flex items-center pr-2">
                  <button
                    onClick={() => setReplayMoment(moment)}
                    className="px-2 py-1 rounded-full text-[10px] font-bold active:scale-90 transition-transform whitespace-nowrap"
                    style={{
                      background: "rgba(168,85,247,0.2)",
                      border: "1px solid rgba(168,85,247,0.5)",
                      color: "#c084fc",
                      fontFamily: "'Hind Siliguri', sans-serif",
                    }}
                    data-testid={`album-replay-${moment.chapter}`}
                    aria-label={`Replay chapter ${moment.chapter}`}
                  >
                    ▶ Replay
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SECRET ALBUM ────────────────────────────────────────────────────────────
// Selim's private album: portraits of the people he met in Dhaka, with bios
// and the arc each one carries. Cards unlock as the player triggers each
// character's storyline. Tasteful — like a real human's diary, not a hookup
// gallery. Each character has: portrait, age/role, how they entered Selim's
// life, the arc summary, and a "Selim's diary" line.
type CharacterCard = {
  id:
    | "selim"
    | "tisha"
    | "pinky"
    | "nila"
    | "sadia"
    | "tania"
    | "sumaiya"
    | "farzana"
    | "jannat"
    | "mitu"
    | "tabin"
    | "asha"
    | "ritu";
  name: string;
  nameBangla: string;
  age: string;
  role: string;
  portrait: string;
  // Single emoji used as a graceful fallback if the portrait file 404s — keeps
  // the album from crashing on missing assets per spec ("never crash if image missing").
  fallbackEmoji?: string;
  unlocked: (f?: Flags, s?: Stats) => boolean;
  unlockHint: string;
  bioBangla: string;
  arcBangla: string;
  diaryBangla: string;
  // Optional "first reaction" — 1-2 Bangla sentences in Selim's inner-monologue
  // voice, shown right under the portrait when the card opens. Ties the new
  // anime portraits emotionally to him instead of jumping straight into bio.
  firstReactionBangla?: string;
  // Optional "🤫 Secret" reveal line — Selim's private confession about this person.
  // Shown in the detail modal beneath the diary quote. Spec: love secrets, non-explicit.
  secretBangla?: string;
  accentColor: string;
};

const CHARACTERS: CharacterCard[] = [
  {
    id: "selim",
    name: "Selim",
    nameBangla: "সেলিম",
    age: "২২",
    role: "Bogura → Dhaka, hustler",
    // Use the canonical anime Selim avatar — same face used everywhere else
    // in the app, so identity stays consistent per spec ("preserve Selim's
    // official identity"). The older character-selim-portrait.png didn't
    // match.
    portrait: "/assets/selim/selim-anime-main.png",
    unlocked: () => true,
    unlockHint: "",
    bioBangla:
      "Bogura-র এক ছোট পাড়া থেকে আসা ছেলে। মা-বাবার আশা, বন্ধুদের roast, আর ঢাকার rent — তিনটার মাঝে balance খুঁজছে। কথায় hero, life-এ learner।",
    arcBangla:
      "Career, money, love, self-respect — চারদিকে টানাটানি। প্রতিদিন একটা choice — shortcut, না real road।",
    diaryBangla:
      "\"আজ আবার আয়নায় তাকালাম। এই ছেলেটাকে আমি চিনি, কিন্তু এখনো বিশ্বাস করতে পারি না।\"",
    accentColor: "#FF8F00",
  },
  {
    id: "tisha",
    name: "Tisha",
    nameBangla: "তিশা",
    age: "২২",
    role: "ঢাবি student, real love",
    portrait: "/assets/selim/character-tisha-portrait.png",
    unlocked: (f) => (f?.tishaMet ?? 0) >= 1,
    unlockHint: "Nilkhet cha stall-এ এক বিকেলে দেখা হবে।",
    bioBangla:
      "ঢাবি-র Bangla literature student। কথার মানুষ — promise ভাঙলে forgive করে, কিন্তু forget করে না। সাদা কামিজ, এক হাতে বই, অন্য হাতে চায়ের কাপ।",
    arcBangla:
      "প্রথম দেখা cha stall-এ → first date TSC → Pinky-র jealousy fight → রাত ২টা phone call → ছাদে প্রথম 'ভালোবাসি'। পুরো arc honesty-র উপর দাঁড়িয়ে।",
    diaryBangla:
      "\"ও আমাকে impress করতে বলে না। ও বলে — নিজের জন্য ঠিক হও। এই কথাটা আগে কেউ বলেনি।\"",
    accentColor: "#a855f7",
  },
  {
    id: "pinky",
    name: "Pinky",
    nameBangla: "পিংকি",
    age: "২১",
    role: "Crush, recharge mystery",
    portrait: "/assets/selim/character-pinky-portrait.png",
    unlocked: (f, s) =>
      (f?.pinkyRechargeCount ?? 0) >= 1 ||
      (f?.pinkySeenCount ?? 0) >= 1 ||
      (s?.pinkyHope ?? 0) >= 10,
    unlockHint: "Pinky-র প্রথম message-এ unlock হবে।",
    bioBangla:
      "ঢাকায় এক university student। Selim-এর first big crush। 'Net শেষ', 'খিদে লাগসে', 'tumi different' — words gentle, intentions unclear। Half hope, half hustle।",
    arcBangla:
      "Recharge → biryani order → 'tumi different' midnight text → distance → seen-only। প্রতিটা step-এ Selim test হয় — wallet, না self-respect?",
    diaryBangla:
      "\"ও কি আসলেই আমাকে দেখে? নাকি শুধু আমার balance? উত্তরটা আমি জানি, কিন্তু মানতে চাই না।\"",
    accentColor: "#ec4899",
  },
  {
    id: "nila",
    name: "Nila",
    nameBangla: "নিলা",
    age: "২০",
    role: "Old hometown friend",
    portrait: "/assets/selim/character-nila-portrait.png",
    unlocked: (f) => (f?.silentMoments ?? 0) >= 1 || (f?.healthyMealCount ?? 0) >= 2,
    unlockHint: "Bogura থেকে message আসবে — কিছু ভালো choice নাও আগে।",
    bioBangla:
      "Bogura-র পুরোনো friend। স্মার্ট, স্বাধীন, সরাসরি কথা বলে। ঢাকায় আসেনি, কিন্তু phone-এ Selim-এর সবচেয়ে honest mirror।",
    arcBangla:
      "মাঝে মাঝে message — 'কেমন আছো?', 'মিথ্যা না বলে বলো।' Romance না, কিন্তু এই presence-টাই অনেক রাতে Selim-কে বাঁচায়।",
    diaryBangla:
      "\"নিলা judge করে না। শুধু জিজ্ঞেস করে — তুমি honest আছো তো? এই প্রশ্নটাই কখনো কখনো সবচেয়ে কঠিন।\"",
    secretBangla:
      "Selim pretends Nila negative, but ও জানে ও-ই ঠিক বলে। এই কথাটা কাউকে বলে না।",
    accentColor: "#10b981",
  },
  // ─── 8 new characters from the design spec ────────────────────────────────
  // Portraits live at public/assets/selim-romance/* per the spec. Files may
  // not exist yet; the <img onError> hook swaps to fallbackEmoji so the album
  // never breaks. Unlock conditions are tied to existing flags so each one is
  // reachable through normal play.
  {
    id: "sadia",
    name: "Sadia",
    nameBangla: "সাদিয়া",
    age: "২১",
    role: "Tea-stall friendly crush",
    portrait: "/assets/selim-romance/02-sadia.png",
    fallbackEmoji: "☕",
    unlocked: (f) => (f?.biryaniCount ?? 0) >= 2 || (f?.healthyMealCount ?? 0) >= 3,
    unlockHint: "মামার দোকানে বার বার গেলে দেখা হবে।",
    firstReactionBangla:
      "\"একটা হাসি, ব্যস — আমার পুরো বিকেলটা কেমন গরম চায়ের মতো হয়ে গেলো। এই মেয়েটা জানেও না ও কী করেছে।\"",
    bioBangla:
      "মামার চায়ের দোকানের পাশের building-এ থাকে। হাসিটা হালকা, কথা কম। Selim ধরে নিয়েছে এই হাসি মানেই signal।",
    arcBangla:
      "তিন দিন একই সময়ে চা খেতে গেলো শুধু ওর হাসিটা দেখতে। চতুর্থ দিন ও অন্য কারো সাথে এসেছিলো — Selim চা না খেয়ে ফিরে গেলো।",
    diaryBangla:
      "\"হাসি মানে সবসময় ভালোবাসা না। কখনো হাসি মানে শুধু — চা টা ভালো ছিলো।\"",
    secretBangla:
      "Selim তিন দিন একই সময়ে চা খেতে গেছে শুধু ওকে দেখতে। কাউকে বলে নাই।",
    accentColor: "#fbbf24",
  },
  {
    id: "tania",
    name: "Tania",
    nameBangla: "তানিয়া",
    age: "২২",
    role: "Campus boundary girl",
    portrait: "/assets/selim-romance/03-tania.png",
    fallbackEmoji: "📚",
    unlocked: (f, s) => (f?.pinkyBoundaryWins ?? 0) >= 1 || (s?.selfRespect ?? 0) >= 55,
    unlockHint: "Self-respect একটু বাড়লে ও বুঝবে কথা বলা যায়।",
    firstReactionBangla:
      "\"ও যখন সোজা চোখে তাকালো, আমার ভেতরের সব cool line এক সেকেন্ডে গলে গেলো। এই মেয়ের সামনে acting চলবে না — সেটা প্রথম দেখাতেই বুঝে গেছি।\"",
    bioBangla:
      "ঢাবি-র sociology student। সরাসরি কথা বলে — 'না' মানে 'না'। Selim প্রথমে রাগ করেছিলো, পরে শিখেছে — clear boundary insult না, respect।",
    arcBangla:
      "Library-তে এক request — 'নাম্বার দিবা?' Tania বললো — 'না, কিন্তু রাগ কোরো না।' এই 'না' টা Selim-এর IQ-তে একটা update install করেছে।",
    diaryBangla:
      "\"ও বললো — না। আমি ভাবলাম দুনিয়া শেষ। পরে বুঝলাম — দুনিয়া শুরু।\"",
    secretBangla:
      "Tania-র সাথে কথা বলার আগে Selim আয়নার সামনে একটা 'cool line' ৫ বার practice করেছিলো।",
    accentColor: "#22d3ee",
  },
  {
    id: "sumaiya",
    name: "Sumaiya",
    nameBangla: "সুমাইয়া",
    age: "২৩",
    role: "Mysterious rainy crush",
    portrait: "/assets/selim-romance/04-sumaiya.png",
    fallbackEmoji: "🌧️",
    unlocked: (f, s) => (f?.randomCrushes ?? 0) >= 1 || (s?.emotionalDelusion ?? 0) >= 60,
    unlockHint: "একটা বৃষ্টির দিনে দেখা হবে — kintu mystery মানে destiny না।",
    firstReactionBangla:
      "\"বৃষ্টিতে ভিজে দাঁড়ানো এই মেয়েটাকে দেখে মনে হলো — এ তো গল্পের page থেকে নেমে আসছে। আমি কেন আবার মাথায় background music বাজাচ্ছি?\"",
    bioBangla:
      "এক বৃষ্টির বিকেলে bus stop-এ দেখা। দুইটা কথা, একটা smile, তারপর ও চলে গেলো। Selim-এর মাথায় পুরো wedding plan তৈরি হয়ে গেছে।",
    arcBangla:
      "একদিনের কথা, এক সপ্তাহের obsession। পরে জানা গেলো — ও Selim-কে চিনতেই পারে নাই দ্বিতীয়বার দেখে।",
    diaryBangla:
      "\"Mystery মানে destiny না — এই কথাটা শিখতে আমার দুই মাস লাগলো।\"",
    secretBangla:
      "এক conversation-এর পর Selim একটা rainy wedding-এর scene পুরো imagine করে ফেলেছিলো — কাকে invite করবে সেটাও।",
    accentColor: "#818cf8",
  },
  {
    id: "farzana",
    name: "Farzana",
    nameBangla: "ফারজানা",
    age: "২৪",
    role: "Career motivator",
    portrait: "/assets/selim-romance/06-farzana.png",
    fallbackEmoji: "📖",
    unlocked: (_f, s) => (s?.careerProgress ?? 0) >= 30,
    unlockHint: "Career progress একটু আগালে ও notice করবে।",
    firstReactionBangla:
      "\"ও desk-এর পাশে এসে দাঁড়াতেই আমি ভাবলাম — flirt শুরু। পরে বুঝলাম ও আসলে আমাকে adult হিসেবে treat করছে। এই feeling-টা নতুন, একটু ভয়ঙ্কর।\"",
    bioBangla:
      "অফিসের senior, কথা সরাসরি, advice ধারালো। Selim প্রথমে ভাবলো ও flirt করছে — পরে বুঝলো ও আসলে career mentor।",
    arcBangla:
      "'এই book টা পড়ো' — Selim book কিনলো, পড়লো না, কিন্তু desk-এ রেখে দিলো। Farzana এক দিন বললো — 'Read it, না হলে দিও।'",
    diaryBangla:
      "\"Career advice মানে flirt না। এই simple কথাটা আমি কেন বুঝতে পারি না?\"",
    secretBangla:
      "Selim Farzana-র recommended book টা কিনেছে, কিন্তু এক page-ও পড়ে নাই। Bookmark টা ১২ পাতায় আটকে আছে ৩ মাস।",
    accentColor: "#f97316",
  },
  {
    id: "jannat",
    name: "Jannat",
    nameBangla: "জান্নাত",
    age: "২২",
    role: "Healthy respect",
    portrait: "/assets/selim-romance/07-jannat.png",
    fallbackEmoji: "🌷",
    unlocked: (_f, s) => (s?.friendTrust ?? 0) >= 60,
    unlockHint: "Friend Trust ভালো হলে ও তোমার পরিচিত হবে।",
    firstReactionBangla:
      "\"ও যখন প্রথম 'ভালো আছো?' বললো, কোনো hidden meaning খুঁজলাম না। এই calm-টা আমার মাথায় কেমন একটা শব্দ থামিয়ে দিলো।\"",
    bioBangla:
      "Mutual বন্ধুর cousin। Calm, kind, fair। Selim-এর কাছ থেকে ৫০ taka ধার নিয়েছিলো — পরের দিন ফেরত দিয়েছে। Selim confused হয়ে গেছে।",
    arcBangla:
      "Healthy respect কেমন হয় — Selim প্রথমবার এই সংস্করণে দেখলো। Drama নাই, মজা আছে, boundary clear।",
    diaryBangla:
      "\"ও সময়মতো taka ফেরত দিলো। আমি ভেবেছিলাম এটা trick, পরে বুঝলাম এটা character।\"",
    secretBangla:
      "Selim Jannat-কে নিয়ে কোনো drama imagine করতে পারে নাই — এটা ওর জীবনে প্রথম। একটু uncomfortable লেগেছে।",
    accentColor: "#fb7185",
  },
  {
    id: "mitu",
    name: "Mitu",
    nameBangla: "মিতু",
    age: "২৩",
    role: "Convenience favor friend",
    portrait: "/assets/selim-romance/08-mitu.png",
    fallbackEmoji: "💼",
    unlocked: (f) => (f?.moneyAskedFromFriend ?? 0) >= 1 || (f?.girlInvestment ?? 0) >= 200,
    unlockHint: "একবার taka নিয়ে drama হলে ও message দিবে।",
    firstReactionBangla:
      "\"ও 'Selim, একটা favor?' বলতেই বুকে কেমন গর্ব লাগলো — ভাবলাম দরকারের সময় ও আমাকেই মনে রাখে। বুঝতে পারিনি দরকারটা শুধু আমার wallet মনে রাখছে।\"",
    bioBangla:
      "ঢাকার urban side-এর মেয়ে। যখন কাজ থাকে message দেয় — 'Selim, একটা favor?' কাজ শেষ হলে seen-zone। Repeat।",
    arcBangla:
      "Selim প্রতিবার ভাবে — 'এইবার ও শুধু আমার জন্য।' প্রতিবার গাড়ি ছেড়ে নামার পর realize হয় — ও আবার busy princess mode-এ।",
    diaryBangla:
      "\"সাহায্য চাওয়া মানে ভালোবাসা না। এই কথাটা wallet প্রতিবার মনে করিয়ে দেয়।\"",
    secretBangla:
      "Selim notes-এ Mitu-র নাম 'busy princess' রেখেছে — কিন্তু message এলেই ও সব ছেড়ে রাজি হয়ে যায়।",
    accentColor: "#c084fc",
  },
  {
    id: "tabin",
    name: "Tabin",
    nameBangla: "তাবিন",
    age: "২৪",
    role: "Honest, sincere friend",
    portrait: "/assets/selim-romance/09-tabin.png",
    fallbackEmoji: "🌿",
    unlocked: (_f, s) => (s?.friendTrust ?? 0) >= 70 && (s?.selfRespect ?? 0) >= 55,
    unlockHint: "Friend Trust আর Self-respect — দুইটাই ভালো হলে ও কাছে আসবে।",
    firstReactionBangla:
      "\"ও সামনে বসলে আমার ভেতরের performer চুপ হয়ে যায়। কত দিন পর কারো সামনে আমি 'Selim ভাই' না হয়ে শুধু সেলিম হতে পারলাম।\"",
    bioBangla:
      "Same neighborhood-এ থাকে। Quiet, careful, কথার মানুষ। Selim-এর সাথে যখন বসে — drama নাই, performance নাই, শুধু sincere কথা।",
    arcBangla:
      "এক রাতে Tabin বললো — 'তুমি যেমন আছো, তেমনই থাকো।' Selim প্রথমবার কোনো line শুনে replay-এ চালিয়ে রেখেছিলো ১০ মিনিট। কিছু feelings honesty চায়।",
    diaryBangla:
      "\"Tabin-এর সামনে আমি perform করি না। এই calm-টা আমি আগে কোথাও পাই নাই।\"",
    secretBangla:
      "Selim Tabin-এর সাথে calm feel করে এটা ও নিজেও মানতে ভয় পায়। Friendship হোক, ভালোবাসা হোক — sincerity আগে।",
    accentColor: "#34d399",
  },
  {
    id: "asha",
    name: "Asha",
    nameBangla: "আশা",
    age: "২৭",
    role: "Married, lonely night talker",
    portrait: "/assets/selim-romance/10-asha.png",
    fallbackEmoji: "🌙",
    unlocked: (f, s) =>
      (f?.heartbreakCount ?? 0) >= 2 && (s?.loneliness ?? 0) >= 60,
    unlockHint: "অনেক একাকীত্ব আর heartbreak-এর পর এই dark door খুলে যাবে।",
    firstReactionBangla:
      "\"রাত ১২টায় ওর message এলে বুকটা কেমন গরম হয়ে গেলো — মনে হলো অবশেষে কেউ আমাকে সত্যি দেখছে। পরে বুঝলাম এই উষ্ণতাটা ওর না, আমার একাকীত্বের।\"",
    bioBangla:
      "Same building-এ থাকে। Husband বিদেশে। রাত ১২টার পর message আসে — 'ঘুমাও নাই?' Selim-কে first time কেউ এতো মনোযোগ দিয়ে শুনছে।",
    arcBangla:
      "শোনার জন্য ও সব। কিন্তু কারো secret হওয়া মানে ভালোবাসা না। এই arc Selim-কে শেখায় — loneliness ভালোবাসা না, কারো লাইন কারো boundary।",
    diaryBangla:
      "\"কেউ শুনলেই সেটা ভালোবাসা না। এই কথাটা যত দ্রুত শিখি, তত ভালো — নিজের জন্য, ওর জন্য, ওর husband-এর জন্য।\"",
    secretBangla:
      "Pinky যখন ignore করতো, Asha listen করতো। Selim feel করতো 'আমাকে কেউ দেখছে' — সেটাই সবচেয়ে dangerous illusion ছিলো।",
    accentColor: "#94a3b8",
  },
  {
    id: "ritu",
    name: "Ritu",
    nameBangla: "ঋতু",
    age: "২১",
    role: "Chaiwala rooftop crush",
    portrait: "/assets/selim/character-ritu-portrait.png",
    fallbackEmoji: "🌹",
    unlocked: (f) =>
      (f?.almostKissUnlocked ?? 0) >= 1 || (f?.rooftopDatePlanned ?? 0) >= 3,
    unlockHint: "ছাদের date plan আগালে — বা প্রায়-চুমুর মুহূর্ত এলে — ও unlock হবে।",
    bioBangla:
      "ঢাবির maths student। মামার চায়ের দোকানে এক বিকেলে route জিজ্ঞেস করতে এসেছিলো — সেলিম পুরো wedding plan এঁকে ফেলেছিলো ৩ মিনিটে। হাসি soft, কথা সরাসরি, চায়ে extra চিনি।",
    arcBangla:
      "নম্বর save → 'কাল free আছি' → ছাদের plan → গোলাপ-মোমবাতি-fairy lights budget crash → প্রায়-চুমুর মুহূর্তে মোমবাতি কাত → ছাদে আগুনের ভয়। Romance ছিলো plan, chaos হলো reality — extra চিনি সহ।",
    diaryBangla:
      "\"ঋতু এসেছিলো একদিনের জন্য, কিন্তু আমার ছাদের গল্প পাল্টে দিলো। মোমবাতি নিভে গেলো, plan-ও — কিন্তু হাসিটা রয়ে গেলো।\"",
    secretBangla:
      "প্রায়-চুমুর আগে সেলিম চোখ বন্ধ করে ফেলেছিলো — Ritu দেখেছে, কিন্তু কিছু বলে নাই। এই কথাটা রাফিককেও বলে নাই।",
    accentColor: "#f43f5e",
  },
];

function SecretAlbumTab({
  flags,
  stats,
  reducedMotion,
}: {
  flags?: Flags;
  stats?: Stats;
  reducedMotion: boolean;
}) {
  const [selected, setSelected] = useState<CharacterCard | null>(null);
  const unlockedCount = CHARACTERS.filter((c) => c.unlocked(flags, stats)).length;

  return (
    <div className="space-y-3">
      {/* Hero cast poster — cinematic group shot of Selim and the 10 women in
          his orbit. Sets the tone before the player drills into individual
          cards. UI text below stays respectful per spec. */}
      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          border: "1px solid rgba(236,72,153,0.25)",
          background: "rgba(0,0,0,0.4)",
        }}
      >
        <img
          src="/assets/selim-life/cast-poster.png"
          alt="Selim in Dhaka — Pinky Mission cast poster"
          style={{ width: "100%", height: "auto", display: "block" }}
          loading="lazy"
          onError={(e) => {
            // If the poster ever goes missing, just hide the hero — the grid
            // below is the actual primary surface.
            const t = e.currentTarget;
            const wrap = t.parentElement;
            if (wrap) wrap.style.display = "none";
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#f9a8d4" }}>
            🎬 Cast · Pinky Mission
          </div>
          <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>
            ১২ জন মানুষ। ১২ টা গল্প। সবার সাথে Selim এক না।
          </div>
        </div>
      </div>

      {/* Intro / progress */}
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)" }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold" style={{ color: "#f9a8d4" }}>
            💞 Selim&apos;s Secret Album
          </span>
          <span className="text-xs font-bold" style={{ color: "#FFD700" }}>
            {unlockedCount}/{CHARACTERS.length} মানুষ
          </span>
        </div>
        <p
          className="text-[11px] italic leading-snug"
          style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          Selim-এর private album — যাদের সাথে দেখা হলো, কথা হলো, কেউ থেকে গেলো, কেউ চলে গেলো।
          প্রত্যেকের গল্প খেলে unlock হবে।
        </p>
      </div>

      {/* Character grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {CHARACTERS.map((c, idx) => {
          const unlocked = c.unlocked(flags, stats);
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => unlocked && setSelected(c)}
              initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl overflow-hidden text-left flex flex-col"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${unlocked ? c.accentColor + "55" : "rgba(255,255,255,0.06)"}`,
                opacity: unlocked ? 1 : 0.45,
                cursor: unlocked ? "pointer" : "default",
              }}
            >
              <div
                className="w-full"
                style={{
                  aspectRatio: "3/4",
                  background: "rgba(0,0,0,0.4)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {unlocked ? (
                  <img
                    src={c.portrait}
                    alt={c.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                    onError={(e) => {
                      // Graceful fallback when the portrait file is missing —
                      // swap to a colored emoji tile so the album never crashes.
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector("[data-portrait-fallback]")) {
                        const div = document.createElement("div");
                        div.setAttribute("data-portrait-fallback", "1");
                        div.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:64px;background:linear-gradient(135deg,${c.accentColor}33 0%, rgba(0,0,0,0.6) 100%);`;
                        div.textContent = c.fallbackEmoji ?? "👤";
                        parent.appendChild(div);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🔒</div>
                )}
                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}
                >
                  <div
                    className="text-sm font-bold"
                    style={{ color: unlocked ? c.accentColor : "rgba(255,255,255,0.4)", fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    {unlocked ? c.nameBangla : "???"}
                  </div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {unlocked ? c.role : c.unlockHint}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={reducedMotion ? {} : { scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #1a0d22 0%, #0a0510 100%)",
              border: `1px solid ${selected.accentColor}55`,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ position: "relative", aspectRatio: "3/4", flexShrink: 0 }}>
              <img
                src={selected.portrait}
                alt={selected.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector("[data-modal-fallback]")) {
                    const div = document.createElement("div");
                    div.setAttribute("data-modal-fallback", "1");
                    div.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:128px;background:linear-gradient(135deg,${selected.accentColor}44 0%, rgba(0,0,0,0.7) 100%);`;
                    div.textContent = selected.fallbackEmoji ?? "👤";
                    parent.appendChild(div);
                  }
                }}
              />
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                ✕
              </button>
              <div
                className="absolute bottom-0 left-0 right-0 px-4 py-3"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92), transparent)" }}
              >
                <div className="text-2xl font-bold" style={{ color: selected.accentColor, fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {selected.nameBangla}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {selected.name} · {selected.age} · {selected.role}
                </div>
              </div>
            </div>
            <div className="overflow-y-auto p-4 space-y-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {selected.firstReactionBangla && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: `${selected.accentColor}14`,
                    border: `1px solid ${selected.accentColor}55`,
                  }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: selected.accentColor }}
                  >
                    💭 First reaction · সেলিমের মনে
                  </div>
                  <p
                    className="text-sm italic leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.92)" }}
                  >
                    {selected.firstReactionBangla}
                  </p>
                </div>
              )}
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: selected.accentColor }}>
                  Bio
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {selected.bioBangla}
                </p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: selected.accentColor }}>
                  Arc
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
                  {selected.arcBangla}
                </p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderLeft: `3px solid ${selected.accentColor}`,
                }}
              >
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  📓 Selim&apos;s Diary
                </div>
                <p className="text-sm italic leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {selected.diaryBangla}
                </p>
              </div>
              {selected.secretBangla && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "rgba(236,72,153,0.08)",
                    border: "1px dashed rgba(236,72,153,0.35)",
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#f9a8d4" }}>
                    🤫 Secret · কাউকে বলে নাই
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {selected.secretBangla}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function ScenesTab({ reducedMotion }: { reducedMotion: boolean }) {
  const allKeys = Object.keys(SELIM_ASSETS) as SceneKey[];
  const lifeSet = new Set(LIFE_SCENE_KEYS);
  const coreKeys = allKeys.filter((k) => !lifeSet.has(k));
  const renderCard = (k: SceneKey) => {
    const meta = SCENE_META[k];
    return (
      <motion.div
        key={k}
        data-testid={`scene-${k}`}
        initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,140,40,0.18)" }}
      >
        <div className="aspect-square w-full overflow-hidden bg-black">
          <img
            src={SELIM_ASSETS[k]}
            alt={meta.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div className="px-2 py-1.5">
          <div className="text-white text-xs font-semibold flex items-center gap-1">
            <span>{meta.mood}</span>
            <span>{meta.title}</span>
          </div>
          <div className="text-white/65 text-[10px] leading-tight mt-0.5"
               style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            {meta.caption}
          </div>
        </div>
      </motion.div>
    );
  };
  return (
    <div className="space-y-3">
      <div>
        <div className="text-white/80 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
          <span>🎬</span><span>Selim Universe</span>
        </div>
        <div className="grid grid-cols-2 gap-2">{coreKeys.map(renderCard)}</div>
      </div>
      <div>
        <div className="text-white/80 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
          <span>📔</span><span>Selim Life Album</span>
          <span className="text-white/40 font-normal">({LIFE_SCENE_KEYS.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-2">{LIFE_SCENE_KEYS.map(renderCard)}</div>
      </div>
    </div>
  );
}

// Pulls the trailing emoji from an ending name like "Bogura Boss 👑" so we
// can show it as a separate icon. Falls back to a category-appropriate icon.
function extractEndingIcon(name: string, isGood: boolean): string {
  // Match a trailing emoji (or pair) at the end of the name.
  const match = name.match(/([\p{Emoji_Presentation}\p{Extended_Pictographic}](?:\u200D[\p{Emoji_Presentation}\p{Extended_Pictographic}])*)\s*$/u);
  if (match) return match[1];
  return isGood ? "🌟" : "🏁";
}

function EndingsTab({ history }: { history: EndingHistory }) {
  const seenCount = ENDINGS.filter((e) => history[e.id]?.count).length;
  const total = ENDINGS.length;

  return (
    <div className="space-y-3">
      {/* Progress header */}
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(255,140,40,0.1)", border: "1px solid rgba(255,140,40,0.3)" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold" style={{ color: "#FFB066" }}>
            🏁 Endings Collected
          </span>
          <span className="text-xs font-bold" style={{ color: "#FFD700" }}>
            {seenCount}/{total}
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${(seenCount / total) * 100}%`,
              background: "linear-gradient(90deg, #FF6B00, #FFD700)",
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <p
          className="text-[10px] mt-1.5 italic"
          style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          প্রতিটি ending Selim-এর একেকটি ভিন্ন path। নতুন choice → নতুন গল্প।
        </p>
      </div>

      {/* Endings list */}
      <div className="space-y-2">
        {ENDINGS.map((e) => {
          const seen = Boolean(history[e.id]?.count);
          const count = history[e.id]?.count ?? 0;
          const isGood = Boolean(e.isGood);
          const icon = extractEndingIcon(e.name, isGood);
          const accent = isGood ? "rgba(255,215,0,0.35)" : "rgba(255,140,40,0.35)";
          const accentBg = isGood ? "rgba(255,215,0,0.08)" : "rgba(255,140,40,0.08)";

          return (
            <div
              key={e.id}
              data-testid={`ending-row-${e.id}`}
              className="rounded-xl p-3 flex items-start gap-2.5"
              style={{
                background: seen ? accentBg : "rgba(255,255,255,0.03)",
                border: `1px solid ${seen ? accent : "rgba(255,255,255,0.08)"}`,
                opacity: seen ? 1 : 0.7,
              }}
            >
              {/* Icon / silhouette */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{
                  background: seen ? accentBg : "rgba(255,255,255,0.05)",
                  border: `1px solid ${seen ? accent : "rgba(255,255,255,0.1)"}`,
                  filter: seen ? "none" : "grayscale(1) brightness(0.5)",
                }}
                aria-hidden="true"
              >
                <span style={{ opacity: seen ? 1 : 0.4 }}>{seen ? icon : "🔒"}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="text-white font-semibold text-sm leading-tight"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    {seen ? e.name : "??? ???"}
                  </div>
                  {seen && count > 1 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: "rgba(255,140,40,0.25)", color: "#FFB066" }}
                    >
                      ×{count}
                    </span>
                  )}
                </div>

                {seen ? (
                  <>
                    <div
                      className="text-white/80 text-xs mt-1 leading-snug"
                      style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      {e.messageBangla}
                    </div>
                    <div
                      className="text-[10px] mt-1.5 italic leading-snug"
                      style={{ color: isGood ? "#FFD700" : "#FFB066", fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                      💡 {e.whyBangla}
                    </div>
                  </>
                ) : (
                  <div
                    className="text-[11px] mt-1 italic leading-snug"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    🔍 Hint: {e.whyBangla}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuotesTab({ heard, onPlay }: { heard: Set<string>; onPlay: (line: VoiceLine) => void }) {
  // Group Selim's lines by category, preserving voiceLines.ts order.
  const grouped = useMemo(() => {
    const map = new Map<VoiceCategory, VoiceLine[]>();
    for (const line of VOICE_LINES) {
      if (line.speaker !== "selim") continue;
      const arr = map.get(line.category) ?? [];
      arr.push(line);
      map.set(line.category, arr);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg p-2 text-[10px] leading-snug"
        style={{
          background: "rgba(255,140,40,0.08)",
          border: "1px solid rgba(255,140,40,0.25)",
          color: "rgba(255,210,170,0.9)",
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
      >
        🎙️ <span className="font-semibold">{SHIPPED_SELIM_AUDIO.size}টি লাইনে</span> Selim-এর আসল কণ্ঠ আছে। বাকিগুলোতে subtitle-এ পড়ো।
      </div>

      {grouped.map(([cat, lines]) => {
        const meta = CATEGORY_LABEL[cat] ?? { label: cat, emoji: "💬" };
        return (
          <div key={cat}>
            <div className="text-white/80 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
              <span className="text-white/40 font-normal">
                ({lines.filter((l) => heard.has(l.id)).length}/{lines.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {lines.map((line) => {
                const hasAudio = SHIPPED_SELIM_AUDIO.has(line.id);
                const wasHeard = heard.has(line.id);
                return (
                  <button
                    key={line.id}
                    data-testid={`quote-row-${line.id}`}
                    onClick={() => onPlay(line)}
                    className="w-full text-left rounded-lg p-2 flex items-start gap-2 transition-colors hover:brightness-110"
                    style={{
                      background: wasHeard ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        hasAudio
                          ? wasHeard ? "rgba(34,197,94,0.35)" : "rgba(255,140,40,0.35)"
                          : "rgba(255,255,255,0.08)"
                      }`,
                    }}
                    aria-label={`Play Selim quote: ${line.text}`}
                  >
                    <div
                      className="flex-shrink-0 rounded-full w-7 h-7 flex items-center justify-center text-xs"
                      style={{
                        background: hasAudio ? "rgba(255,140,40,0.25)" : "rgba(255,255,255,0.08)",
                        color: hasAudio ? "#FFB066" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {hasAudio ? "▶" : "📝"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-white text-[12px] leading-snug"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
                        {line.text}
                      </div>
                      <div className="text-white/45 text-[9px] mt-0.5 flex items-center gap-1.5">
                        <span>mood: {line.mood}</span>
                        {line.boguraFlavor && <span className="text-orange-300/80">· Bogura</span>}
                        {wasHeard && <span className="text-green-400/80">· heard ✓</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AchievementsTab({ achievements }: { achievements: Achievement[] }) {
  const sorted = [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
  return (
    <div className="space-y-1.5">
      {sorted.map((a) => (
        <div
          key={a.id}
          data-testid={`achievement-row-${a.id}`}
          className="rounded-lg p-2.5 flex items-start gap-2.5"
          style={{
            background: a.unlocked ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${a.unlocked ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)"}`,
            opacity: a.unlocked ? 1 : 0.6,
          }}
        >
          <div className="text-xl flex-shrink-0">{a.unlocked ? "🏆" : "🔒"}</div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {a.unlocked ? a.name : "???"}
            </div>
            <div
              className="text-white/65 text-[11px] leading-tight mt-0.5"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {a.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EggsTab({ unlocked }: { unlocked: Set<EasterEggId> }) {
  const total = EGG_TOTAL;
  const found = unlocked.size;
  const rarityColor: Record<"common" | "rare" | "legendary", string> = {
    common: "#9CA3AF",
    rare: "#FFB347",
    legendary: "#FF6B00",
  };
  return (
    <div>
      <div
        className="text-xs mb-2 px-1"
        style={{ color: "#FFB347", fontFamily: "'Hind Siliguri', sans-serif" }}
      >
        🥚 {found} / {total} hidden things found.
        {found < total && " খেলো, ঘাঁটো, tap করো — আরও আছে।"}
      </div>
      <div className="space-y-2">
        {EASTER_EGGS.map((egg) => {
          const isOpen = unlocked.has(egg.id);
          return (
            <div
              key={egg.id}
              data-testid={`egg-${egg.id}`}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: isOpen ? "rgba(255,107,0,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${isOpen ? "rgba(255,107,0,0.35)" : "rgba(255,255,255,0.08)"}`,
                opacity: isOpen ? 1 : 0.7,
              }}
            >
              <div className="text-xl flex-shrink-0">{isOpen ? "🥚" : "🔒"}</div>
              <div className="flex-1 min-w-0">
                <div
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", color: isOpen ? "#FFD700" : "#fff" }}
                >
                  <span>{isOpen ? egg.name : "???"}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{ color: rarityColor[egg.rarity], border: `1px solid ${rarityColor[egg.rarity]}` }}
                  >
                    {egg.rarity}
                  </span>
                </div>
                <div
                  className="text-[11px] leading-tight mt-1"
                  style={{
                    color: isOpen ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
                    fontFamily: "'Hind Siliguri', sans-serif",
                    fontStyle: isOpen ? "normal" : "italic",
                  }}
                >
                  {isOpen ? egg.reveal : egg.hint}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
