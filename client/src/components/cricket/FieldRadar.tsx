import { motion, AnimatePresence } from "framer-motion";
import type { ShotTrajectory } from "@/lib/gameEngine";

interface Position {
  x: number;
  y: number;
  type: "fielder" | "batsman" | "bowler";
}

interface FieldRadarProps {
  positions: Position[];
  size?: number;
  trajectory?: ShotTrajectory | null;
  showTrajectory?: boolean;
}

const colorMap: Record<Position["type"], string> = {
  fielder: "#eab308",
  batsman: "#ec4899",
  bowler: "#14b8a6",
};

function getTrajectoryColor(distance: number): string {
  if (distance >= 90) return "#f59e0b"; // six - amber
  if (distance >= 75) return "#22c55e"; // four - green
  if (distance >= 40) return "#3b82f6"; // runs - blue
  return "#9ca3af"; // dot/wicket - gray
}

export default function FieldRadar({
  positions,
  size = 160,
  trajectory = null,
  showTrajectory = false,
}: FieldRadarProps) {
  const center = size / 2;
  const radius = center - 8;

  // Convert trajectory coords (0-100) to SVG coords
  const trajStartX = center; // batsman is at center
  const trajStartY = center + 2; // slightly below center (batsman position)

  const trajEndX = trajectory
    ? 8 + (trajectory.endX / 100) * (size - 16)
    : center;
  const trajEndY = trajectory
    ? 8 + (trajectory.endY / 100) * (size - 16)
    : center;

  const trajColor = trajectory ? getTrajectoryColor(trajectory.distance) : "#fff";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "#1a1d2e",
        border: "3px solid #374151",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Boundary circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#4b5563" strokeWidth="3" />
        {/* Green field */}
        <circle cx={center} cy={center} r={radius - 4} fill="#3a7d44" />
        {/* Inner rings */}
        <circle
          cx={center} cy={center} r={radius * 0.7}
          fill="none" stroke="rgba(255,255,255,0.3)"
          strokeWidth="1" strokeDasharray="4 4"
        />
        <circle
          cx={center} cy={center} r={radius * 0.4}
          fill="none" stroke="rgba(255,255,255,0.3)"
          strokeWidth="1" strokeDasharray="4 4"
        />
        {/* Pitch strip */}
        <rect
          x={center - 5} y={center - 16}
          width={10} height={32}
          rx={2} fill="#c4915e"
        />

        {/* Fielder positions */}
        {positions.map((pos, i) => (
          <motion.circle
            key={i}
            initial={{ opacity: 0, r: 0 }}
            animate={{ opacity: 1, r: pos.type === "fielder" ? 4 : 5 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            cx={8 + (pos.x / 100) * (size - 16)}
            cy={8 + (pos.y / 100) * (size - 16)}
            fill={colorMap[pos.type]}
          />
        ))}

        {/* Shot trajectory visualization */}
        <AnimatePresence>
          {showTrajectory && trajectory && (
            <>
              {/* Trajectory line */}
              <motion.line
                x1={trajStartX}
                y1={trajStartY}
                x2={trajEndX}
                y2={trajEndY}
                stroke={trajColor}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />

              {/* Trajectory glow line (behind) */}
              <motion.line
                x1={trajStartX}
                y1={trajStartY}
                x2={trajEndX}
                y2={trajEndY}
                stroke={trajColor}
                strokeWidth="5"
                strokeLinecap="round"
                opacity={0.2}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />

              {/* Endpoint marker */}
              <motion.circle
                cx={trajEndX}
                cy={trajEndY}
                fill={trajColor}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: [0, 6, 4], opacity: [0, 1, 0.9] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />

              {/* Endpoint ripple */}
              <motion.circle
                cx={trajEndX}
                cy={trajEndY}
                fill="none"
                stroke={trajColor}
                strokeWidth="1.5"
                initial={{ r: 4, opacity: 0 }}
                animate={{ r: [4, 12], opacity: [0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.8,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />

              {/* Distance label at endpoint */}
              {trajectory.distance >= 75 && (
                <motion.text
                  x={trajEndX}
                  y={trajEndY - 10}
                  textAnchor="middle"
                  fill={trajColor}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="var(--font-heading)"
                  initial={{ opacity: 0, y: trajEndY - 5 }}
                  animate={{ opacity: 1, y: trajEndY - 10 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {trajectory.distance >= 90 ? "SIX!" : "FOUR!"}
                </motion.text>
              )}
            </>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
}

export type { Position };
