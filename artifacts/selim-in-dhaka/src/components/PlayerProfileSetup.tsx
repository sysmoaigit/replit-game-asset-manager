import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerProfile, AddressStyle } from "../ai/types";
import { tryUnlockEgg } from "../game/easterEggs";
import { notifyEggUnlock } from "./EggUnlockToast";
import { SELIM_ASSETS } from "../game/assets";
import SelimTypingIndicator from "./SelimTypingIndicator";

interface Props {
  onComplete: (profile: Partial<PlayerProfile>) => void;
  reducedMotion?: boolean;
  initialNickname?: string;
}

type Sender = "selim" | "player" | "system";
type Step = "greet" | "ask_nickname" | "ask_address" | "ask_ai" | "done";

interface ChatLine {
  id: string;
  sender: Sender;
  text: string;
  isOption?: boolean;
}

const ADDRESS_OPTIONS: AddressStyle[] = ["Bhai", "Bondhu", "Dost", "Vai"];

let lineIdCounter = 0;
const makeId = () => `intro_${Date.now()}_${lineIdCounter++}`;

export default function PlayerProfileSetup({
  onComplete,
  reducedMotion = false,
  initialNickname = "",
}: Props) {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [step, setStep] = useState<Step>("greet");
  const [isTyping, setIsTyping] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(initialNickname);
  const [chosenNickname, setChosenNickname] = useState(initialNickname);
  const [chosenAddress, setChosenAddress] = useState<AddressStyle>("Bhai");
  const [customAddress, setCustomAddress] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingDelay = reducedMotion ? 200 : 900;
  // Guards against React StrictMode double-mount and rapid taps that would
  // otherwise duplicate Selim's lines or fire onComplete twice.
  const greetedRef = useRef(false);
  const completedRef = useRef(false);
  const advancingRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [lines, isTyping, reducedMotion]);

  const sendSelim = useCallback(
    async (texts: string[], nextStep?: Step) => {
      for (const text of texts) {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, typingDelay));
        setIsTyping(false);
        setLines((l) => [...l, { id: makeId(), sender: "selim", text }]);
        await new Promise((r) => setTimeout(r, reducedMotion ? 80 : 220));
      }
      if (nextStep) setStep(nextStep);
    },
    [typingDelay, reducedMotion],
  );

  // Greeting sequence (runs once on mount; guarded against StrictMode double-invoke).
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    sendSelim(
      [
        "Assalamu alaikum bhai 👋",
        "Ami Selim. Bogura theke Dhaka eseche life banate.",
        "Tor sathe parichoy hote chai — kichu jiggesh kori?",
      ],
      "ask_nickname",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When step transitions to ask_nickname / ask_address / ask_ai, send Selim's prompt.
  useEffect(() => {
    if (step === "ask_nickname") {
      sendSelim(["Tor naam ki bhai? Ami tor naam diye dakbo. ✏️"]);
    } else if (step === "ask_address") {
      sendSelim([
        `Beautiful, ${chosenNickname}!`,
        "Ar tui amake ki bole dakbi? Bhai, bondhu, dost — jeta tor moner kotha.",
      ]);
    } else if (step === "ask_ai") {
      sendSelim([
        "Last question 🤖",
        "Ami AI brain diye real, contextual replies dite pari — tor mood, history bujhe. Privacy: only compressed context jay, kono raw memory na.",
        "Tui chas?",
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleNicknameSubmit = async () => {
    if (advancingRef.current) return;
    const cleaned = nicknameInput.trim();
    if (cleaned.length < 1) return;
    advancingRef.current = true;
    setChosenNickname(cleaned);
    setLines((l) => [...l, { id: makeId(), sender: "player", text: cleaned }]);
    setNicknameInput("");
    await new Promise((r) => setTimeout(r, 300));
    setStep("ask_address");
    advancingRef.current = false;
  };

  const handleAddressPick = async (addr: AddressStyle | "Custom") => {
    if (advancingRef.current) return;
    const finalAddrRaw = addr === "Custom" ? (customAddress.trim() || "Bhai") : addr;
    const finalAddr = finalAddrRaw as AddressStyle;
    advancingRef.current = true;
    setChosenAddress(finalAddr);
    setLines((l) => [...l, { id: makeId(), sender: "player", text: finalAddr }]);
    await new Promise((r) => setTimeout(r, 300));
    await sendSelim([`Tahole ${finalAddr} bole dakbo, mathay rakhlam ✓`]);
    await new Promise((r) => setTimeout(r, 200));
    setStep("ask_ai");
    advancingRef.current = false;
  };

  const finish = (consent: boolean) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setLines((l) => [
      ...l,
      { id: makeId(), sender: "player", text: consent ? "Haan, AI diye kotha bol 🤖" : "Local brain-i thik 🧠" },
    ]);
    const lower = chosenNickname.toLowerCase();
    if (lower === "pinky") notifyEggUnlock(tryUnlockEgg("name_pinky"));
    else if (lower === "selim") notifyEggUnlock(tryUnlockEgg("name_selim"));
    setTimeout(() => {
      onComplete({
        nickname: chosenNickname || "Bhai",
        address: chosenAddress,
        llmConsentEnabled: consent,
      });
    }, 600);
    setStep("done");
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0d0600 0%, #1a0f05 100%)",
        fontFamily: "'Hind Siliguri', sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pb-3 flex-shrink-0"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <img
          src={SELIM_ASSETS.main}
          alt="Selim"
          className="w-11 h-11 rounded-full object-cover"
          style={{ border: "2px solid #FFD700" }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: "#FFD700" }}>Selim</p>
          <p className="text-[11px]" style={{ color: "#86efac" }}>● online · Bogura → Dhaka</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {lines.map((msg) => (
          <motion.div
            key={msg.id}
            initial={reducedMotion ? {} : { opacity: 0, y: 6, scale: 0.98 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
            className={`flex ${msg.sender === "player" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.sender === "selim" && (
              <img
                src={SELIM_ASSETS.main}
                alt=""
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 self-end"
                style={{ border: "1px solid rgba(255,215,0,0.4)" }}
              />
            )}
            <div
              className="max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
              style={{
                background: msg.sender === "player"
                  ? "linear-gradient(135deg, #FF6B00, #FF8F00)"
                  : "rgba(255,255,255,0.08)",
                color: msg.sender === "player" ? "white" : "#e5e7eb",
                borderBottomLeftRadius: msg.sender === "selim" ? 4 : undefined,
                borderBottomRightRadius: msg.sender === "player" ? 4 : undefined,
              }}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-center gap-2">
            <img
              src={SELIM_ASSETS.main}
              alt=""
              className="w-7 h-7 rounded-full object-cover"
              style={{ border: "1px solid rgba(255,215,0,0.4)" }}
            />
            <SelimTypingIndicator reducedMotion={reducedMotion} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input row depends on current step */}
      <AnimatePresence mode="wait">
        {step === "ask_nickname" && !isTyping && (
          <motion.div
            key="nick"
            initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: 12 }}
            className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.35)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
            }}
          >
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNicknameSubmit()}
              placeholder="তোর নাম লিখ..."
              autoFocus
              className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,215,0,0.25)",
              }}
            />
            <button
              onClick={handleNicknameSubmit}
              disabled={nicknameInput.trim().length < 1}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF8F00)" }}
              aria-label="Send"
            >
              <span style={{ color: "white", fontSize: 16 }}>➤</span>
            </button>
          </motion.div>
        )}

        {step === "ask_address" && !isTyping && (
          <motion.div
            key="addr"
            initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: 12 }}
            className="px-4 py-3 flex-shrink-0 flex flex-col gap-2"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.35)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {ADDRESS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAddressPick(opt)}
                  className="py-2.5 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,215,0,0.25)",
                    color: "#FFD27A",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="অথবা নিজের পছন্দের নাম..."
                className="flex-1 px-3 py-2 rounded-2xl text-xs text-white outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
              <button
                onClick={() => handleAddressPick("Custom")}
                disabled={customAddress.trim().length < 1}
                className="px-4 py-2 rounded-2xl text-xs font-bold active:scale-95 transition-transform disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #FF6B00, #FF8F00)", color: "white" }}
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}

        {step === "ask_ai" && !isTyping && (
          <motion.div
            key="ai"
            initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: 12 }}
            className="px-4 py-3 flex-shrink-0 flex flex-col gap-2"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.35)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
            }}
          >
            <button
              onClick={() => finish(true)}
              className="w-full py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "white",
              }}
            >
              🤖 হ্যাঁ, AI দিয়ে কথা বল
            </button>
            <button
              onClick={() => finish(false)}
              className="w-full py-2.5 rounded-2xl font-semibold text-sm active:scale-95 transition-transform"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#9ca3af",
              }}
            >
              🧠 না, local brain-ই থাক
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
