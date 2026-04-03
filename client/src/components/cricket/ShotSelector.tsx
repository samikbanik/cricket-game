import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";

type ShotType = "defensive" | "drive" | "pull" | "sweep" | "loft";

interface ShotConfig {
  type: ShotType;
  label: string;
  color: string;
  key: string;
}

const SHOTS: ShotConfig[] = [
  { type: "defensive", label: "Defensive", color: "#3b82f6", key: "1" },
  { type: "drive", label: "Drive", color: "#22c55e", key: "2" },
  { type: "pull", label: "Pull", color: "#ef4444", key: "3" },
  { type: "sweep", label: "Sweep", color: "#f97316", key: "4" },
  { type: "loft", label: "Loft", color: "#a855f7", key: "5" },
];

interface ShotSelectorProps {
  selectedShot: ShotType | null;
  onSelect: (shot: ShotType) => void;
}

export default function ShotSelector({ selectedShot, onSelect }: ShotSelectorProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const shot = SHOTS.find((s) => s.key === e.key);
      if (shot) onSelect(shot.type);
    },
    [onSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div className="flex gap-3 justify-center flex-wrap" role="group" aria-label="Shot selection">
      {SHOTS.map((shot, i) => {
        const isActive = selectedShot === shot.type;
        return (
          <motion.button
            key={shot.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            whileHover={{ y: -2, filter: "brightness(1.15)" }}
            whileTap={{ scale: 0.95 }}
            className="w-[120px] h-12 border-none rounded-[10px] text-base font-semibold text-white transition-all duration-150"
            style={{
              backgroundColor: shot.color,
              boxShadow: isActive ? `0 0 20px ${shot.color}80, 0 0 40px ${shot.color}40` : "none",
              outline: isActive ? "2px solid rgba(255,255,255,0.4)" : "none",
              outlineOffset: "2px",
              transform: isActive ? "scale(1.05)" : undefined,
            }}
            onClick={() => onSelect(shot.type)}
            aria-pressed={isActive}
            aria-label={`${shot.label} shot, press ${shot.key}`}
          >
            {shot.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export type { ShotType };
export { SHOTS };
