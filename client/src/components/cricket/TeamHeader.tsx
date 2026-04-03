import { motion } from "framer-motion";

interface TeamHeaderProps {
  teamA: string;
  teamB: string;
}

export default function TeamHeader({ teamA, teamB }: TeamHeaderProps) {
  return (
    <div className="flex justify-center items-center gap-6 py-3">
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-[28px] font-bold uppercase tracking-wider text-white"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {teamA}
      </motion.span>
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-semibold text-amber-400"
      >
        VS
      </motion.span>
      <motion.span
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-[28px] font-bold uppercase tracking-wider text-teal-400"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {teamB}
      </motion.span>
    </div>
  );
}
