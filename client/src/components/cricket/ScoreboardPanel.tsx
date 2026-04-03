import { motion } from "framer-motion";
import TeamHeader from "./TeamHeader";
import ScoreDisplay from "./ScoreDisplay";
import BatsmanStatsBar, { type BatsmanStats } from "./BatsmanStatsBar";

interface ScoreboardPanelProps {
  teamA: string;
  teamB: string;
  score: { runs: number; wickets: number };
  overs: { completed: number; balls: number };
  batsmen: BatsmanStats[];
  currentRunRate: number;
}

export default function ScoreboardPanel(props: ScoreboardPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl px-8 py-5 flex flex-col border border-white/[0.08]"
      style={{
        background: "rgba(42, 45, 62, 0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <TeamHeader teamA={props.teamA} teamB={props.teamB} />
      <ScoreDisplay score={props.score} overs={props.overs} />
      <BatsmanStatsBar batsmen={props.batsmen} currentRunRate={props.currentRunRate} />
    </motion.div>
  );
}
