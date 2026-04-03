import { motion } from "framer-motion";

interface TimingBarProps {
  position: number;
}

export default function TimingBar({ position }: TimingBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-[600px] py-1"
      role="meter"
      aria-valuenow={position}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Timing indicator"
    >
      <div className="relative w-full h-5 rounded-[10px]" style={{ background: "#1a1d2e" }}>
        <div
          className="absolute inset-0 rounded-[10px]"
          style={{
            background: "linear-gradient(to right, #3b82f6 0%, #22c55e 30%, #eab308 50%, #f97316 70%, #ef4444 100%)",
            opacity: 0.85,
          }}
        />
        <div
          className="absolute rounded pointer-events-none z-[1]"
          style={{
            top: "-2px",
            left: "45%",
            width: "10%",
            height: "24px",
            background: "rgba(34, 197, 94, 0.25)",
            border: "1px solid rgba(34, 197, 94, 0.4)",
          }}
        />
        <div
          className="absolute z-[2] rounded-sm"
          style={{
            top: "-4px",
            left: `${position}%`,
            width: "3px",
            height: "28px",
            background: "#ffffff",
            transform: "translateX(-50%)",
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
            transition: "left 0.016s linear",
          }}
        />
      </div>
    </motion.div>
  );
}
