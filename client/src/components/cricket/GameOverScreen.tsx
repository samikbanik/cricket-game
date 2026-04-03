import { motion } from "framer-motion";
import type { MatchState } from "@/lib/gameEngine";
import { getOversString } from "@/lib/gameEngine";

interface GameOverScreenProps {
  state: MatchState;
  onRestart: () => void;
  onBack: () => void;
}

function getRating(state: MatchState): { label: string; color: string; emoji: string } {
  const runRate = state.currentRunRate;
  if (runRate >= 12) return { label: "LEGENDARY", color: "text-amber-400", emoji: "🏆" };
  if (runRate >= 9) return { label: "EXCELLENT", color: "text-emerald-400", emoji: "🌟" };
  if (runRate >= 7) return { label: "GREAT", color: "text-teal-400", emoji: "👏" };
  if (runRate >= 5) return { label: "GOOD", color: "text-blue-400", emoji: "👍" };
  if (runRate >= 3) return { label: "AVERAGE", color: "text-gray-400", emoji: "😐" };
  return { label: "POOR", color: "text-red-400", emoji: "😬" };
}

export default function GameOverScreen({ state, onRestart, onBack }: GameOverScreenProps) {
  const rating = getRating(state);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(13,17,23,0.95)", backdropFilter: "blur(12px)" }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: "rgba(42, 45, 62, 0.95)" }}>
          {/* Header */}
          <div className="text-center py-8 px-6" style={{ background: "linear-gradient(180deg, rgba(34,197,94,0.1) 0%, transparent 100%)" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl mb-3"
            >
              {rating.emoji}
            </motion.div>
            <h2
              className="text-3xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              INNINGS OVER
            </h2>
            <div className={`text-sm font-semibold uppercase tracking-widest ${rating.color}`}>
              {rating.label} Performance
            </div>
          </div>

          {/* Score */}
          <div className="text-center py-4 border-y border-white/[0.06]">
            <div
              className="text-6xl font-extrabold text-white"
              style={{ fontFamily: "var(--font-heading)", fontVariantNumeric: "tabular-nums" }}
            >
              {state.runs}<span className="text-gray-500">/</span>{state.wickets}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              in {getOversString(state.ballsBowled)} overs
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-0 border-b border-white/[0.06]">
            <StatCell label="Run Rate" value={state.currentRunRate.toFixed(2)} />
            <StatCell label="Fours" value={String(state.fours)} />
            <StatCell label="Sixes" value={String(state.sixes)} />
            <StatCell label="Dots" value={String(state.dots)} />
          </div>

          {/* Actions */}
          <div className="p-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRestart}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-400 transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Play Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/[0.04] transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Back to Home
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center py-3 border-r border-white/[0.06] last:border-r-0">
      <div className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
        {value}
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
