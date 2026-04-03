import { motion } from "framer-motion";

interface ScoreDisplayProps {
  score: { runs: number; wickets: number };
  overs: { completed: number; balls: number };
}

export default function ScoreDisplay({ score, overs }: ScoreDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/30 rounded-lg py-4 text-center my-2"
    >
      <div
        className="text-[56px] font-extrabold text-white leading-none"
        style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-heading)" }}
      >
        {score.runs}
        <span className="text-gray-400 mx-0.5">/</span>
        {score.wickets}
      </div>
      <div className="text-base font-medium text-gray-400 uppercase tracking-[2px] mt-1">
        {overs.completed}.{overs.balls} OVERS
      </div>
    </motion.div>
  );
}
