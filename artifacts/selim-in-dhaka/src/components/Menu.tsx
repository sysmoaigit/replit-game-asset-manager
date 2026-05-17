import { motion } from "framer-motion";

interface MenuProps {
  onResume: () => void;
  onSave: () => void;
  onNewGame: () => void;
  onTutorial: () => void;
  isReducedMotion: boolean;
  isSoundEnabled: boolean;
  onToggleReducedMotion: () => void;
  onToggleSound: () => void;
  onOpenSoundSettings: () => void;
  onOpenAlbum?: () => void;
  onOpenStory?: () => void;
  onOpenChat: () => void;
  isAiModeEnabled?: boolean;
  onToggleAiMode?: () => void;
  reducedMotion?: boolean;
}

export default function Menu({
  onResume, onSave, onNewGame, onTutorial,
  isReducedMotion, isSoundEnabled,
  onToggleReducedMotion, onToggleSound,
  onOpenSoundSettings,
  onOpenAlbum,
  onOpenStory,
  onOpenChat,
  isAiModeEnabled,
  onToggleAiMode,
  reducedMotion = false,
}: MenuProps) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1 }}
      exit={reducedMotion ? {} : { opacity: 0 }}
      className="dhaka-modal-backdrop"
      data-testid="screen-menu"
    >
      <motion.div
        initial={reducedMotion ? {} : { scale: 0.9, y: 20 }}
        animate={reducedMotion ? {} : { scale: 1, y: 0 }}
        exit={reducedMotion ? {} : { scale: 0.9, y: 20 }}
        className="w-full max-w-xs mx-4 rounded-3xl overflow-hidden dhaka-card-warm"
      >
        <div className="dhaka-header-saffron px-6 pt-5 pb-3">
          <h2 className="text-white text-xl font-bold text-center font-bn">মেনু</h2>
        </div>
        <div className="p-4 space-y-2">
          <button
            data-testid="btn-resume"
            onClick={onResume}
            className="dhaka-btn-primary"
          >
            খেলা চালু রাখো ▶
          </button>

          {/* Talk to Selim — AI Chat entry */}
          <button
            data-testid="btn-talk-to-selim-menu"
            onClick={onOpenChat}
            className="w-full py-3 rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 font-bn"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,215,0,0.12))",
              border: "1.5px solid rgba(255,215,0,0.4)",
              color: "#B45309",
            }}
          >
            💬 Selim-এর সাথে কথা বলো
          </button>

          <button
            data-testid="btn-save"
            onClick={onSave}
            className="w-full py-3 rounded-2xl font-semibold active:scale-95 transition-transform font-bn"
            style={{ background: "rgba(0,0,0,0.08)", color: "#333" }}
          >
            সেভ করো 💾
          </button>
          <button
            data-testid="btn-how-to-play"
            onClick={onTutorial}
            className="w-full py-3 rounded-2xl font-semibold active:scale-95 transition-transform font-bn"
            style={{ background: "rgba(0,0,0,0.08)", color: "#333" }}
          >
            কীভাবে খেলবে? 📖
          </button>

          <button
            data-testid="btn-sound-settings"
            onClick={onOpenSoundSettings}
            className="dhaka-btn-ghost-warm"
          >
            🔊 অডিও সেটিংস
          </button>

          {onOpenAlbum && (
            <button
              data-testid="btn-open-album"
              onClick={onOpenAlbum}
              className="dhaka-btn-ghost-warm"
            >
              📓 Selim-এর অ্যালবাম
            </button>
          )}

          {onOpenStory && (
            <button
              data-testid="btn-open-story"
              onClick={onOpenStory}
              className="w-full py-3 rounded-2xl font-bold active:scale-95 transition-transform font-bn"
              style={{
                background: "rgba(168,85,247,0.12)",
                border: "1.5px solid rgba(168,85,247,0.35)",
                color: "#c084fc",
              }}
            >
              📖 Selim-এর গল্প
            </button>
          )}

          <button
            data-testid="btn-new-game-menu"
            onClick={onNewGame}
            className="dhaka-btn-danger"
          >
            নতুন খেলা শুরু 🔄
          </button>

          <div className="border-t pt-2 space-y-1" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <button
              data-testid="btn-toggle-motion"
              onClick={onToggleReducedMotion}
              className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-between px-3 active:scale-95 transition-transform"
              style={{ background: "rgba(0,0,0,0.05)", color: "#444" }}
            >
              <span>Reduced Motion</span>
              <span className="dhaka-toggle-pill" data-on={isReducedMotion}>
                {isReducedMotion ? "ON" : "OFF"}
              </span>
            </button>
            {onToggleAiMode && (
              <button
                data-testid="btn-toggle-ai-mode"
                onClick={onToggleAiMode}
                className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-between px-3 active:scale-95 transition-transform"
                style={{ background: "rgba(0,0,0,0.05)", color: "#444" }}
              >
                <span>AI Mode 🤖</span>
                <span className="dhaka-toggle-pill" data-on={!!isAiModeEnabled}>
                  {isAiModeEnabled ? "ON" : "OFF"}
                </span>
              </button>
            )}
            <button
              data-testid="btn-toggle-sound"
              onClick={onToggleSound}
              className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-between px-3 active:scale-95 transition-transform"
              style={{ background: "rgba(0,0,0,0.05)", color: "#444" }}
            >
              <span>Sound {isSoundEnabled ? "🔊" : "🔇"}</span>
              <span className="dhaka-toggle-pill" data-on={isSoundEnabled}>
                {isSoundEnabled ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
