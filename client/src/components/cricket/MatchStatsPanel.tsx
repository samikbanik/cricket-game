import { motion } from "framer-motion";
import type { MatchState, BallResult } from "@/lib/gameEngine";
import { getOversString } from "@/lib/gameEngine";

interface MatchStatsPanelProps {
  state: MatchState;
}

const resultColor: Record<BallResult, string> = {
  dot: "#6b7280",
  "1": "#9ca3af",
  "2": "#60a5fa",
  "3": "#818cf8",
  "4": "#22c55e",
  "6": "#f59e0b",
  wicket: "#ef4444",
};

const resultLabel: Record<BallResult, string> = {
  dot: "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "6": "6",
  wicket: "W",
};

export default function MatchStatsPanel({ state }: MatchStatsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border border-white/[0.08] p-5 h-full"
      style={{ background: "rgba(42, 45, 62, 0.85)", backdropFilter: "blur(8px)" }}
    >
      {/* Score */}
      <div className="text-center mb-4">
        <div
          className="text-4xl font-extrabold text-white leading-none"
          style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-heading)" }}
        >
          {state.runs}
          <span className="text-gray-500 mx-0.5">/</span>
          {state.wickets}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {getOversString(state.ballsBowled)} / {getOversString(state.totalBalls)} overs
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatBox label="Run Rate" value={state.currentRunRate.toFixed(2)} color="text-teal-400" />
        <StatBox label="Fours" value={String(state.fours)} color="text-emerald-400" />
        <StatBox label="Sixes" value={String(state.sixes)} color="text-amber-400" />
      </div>

      {/* Balls remaining */}
      <div className="text-center mb-4 py-2 rounded-lg bg-white/[0.04]">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Balls Left: </span>
        <span className="text-sm font-bold text-white">
          {state.totalBalls - state.ballsBowled}
        </span>
        <span className="text-xs text-gray-500 mx-2">|</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider">Wickets Left: </span>
        <span className="text-sm font-bold text-white">
          {state.totalWickets - state.wickets}
        </span>
      </div>

      {/* Current over */}
      <div className="mb-4">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">
          This Over
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {state.currentOver.map((result, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: resultColor[result] }}
            >
              {resultLabel[result]}
            </motion.div>
          ))}
          {Array.from({ length: Math.max(0, 6 - state.currentOver.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Ball history (last 12) */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">
          Recent Balls
        </div>
        <div className="flex gap-1 flex-wrap">
          {state.ballHistory.slice(-12).map((ball, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: resultColor[ball.result], opacity: 0.8 }}
            >
              {resultLabel[ball.result]}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center py-2 rounded-lg bg-white/[0.04]">
      <div className={`text-lg font-bold ${color}`} style={{ fontFamily: "var(--font-heading)" }}>
        {value}
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
