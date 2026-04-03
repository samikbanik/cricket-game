import { motion } from "framer-motion";

interface PowerMeterProps {
  level: number;
  size?: number;
}

const segments = [
  { color: "#3b82f6", fraction: 0.2 },
  { color: "#22c55e", fraction: 0.2 },
  { color: "#eab308", fraction: 0.2 },
  { color: "#f97316", fraction: 0.2 },
  { color: "#ef4444", fraction: 0.2 },
];

function describeArc(
  center: number,
  radius: number,
  startDeg: number,
  endDeg: number
): string {
  const sRad = (startDeg * Math.PI) / 180;
  const eRad = (endDeg * Math.PI) / 180;
  const x1 = center + radius * Math.cos(sRad);
  const y1 = center + radius * Math.sin(sRad);
  const x2 = center + radius * Math.cos(eRad);
  const y2 = center + radius * Math.sin(eRad);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
}

export default function PowerMeter({ level, size = 160 }: PowerMeterProps) {
  const center = size / 2;
  const radius = 58;
  const startAngle = 150;
  const arcSpan = 240;

  const needleAngle = startAngle + (level / 100) * arcSpan;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = radius - 10;
  const needleX = center + needleLen * Math.cos(needleRad);
  const needleY = center + needleLen * Math.sin(needleRad);

  let angle = startAngle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex-shrink-0 flex flex-col items-center gap-1"
      style={{ width: size }}
      role="meter"
      aria-valuenow={level}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Power meter"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center} cy={center} r={radius + 8}
          fill="none" stroke="#374151" strokeWidth="3"
        />
        {segments.map((seg, i) => {
          const segStart = angle;
          const segEnd = angle + seg.fraction * arcSpan;
          angle = segEnd;
          return (
            <path
              key={i}
              d={describeArc(center, radius, segStart, segEnd)}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeLinecap="round"
            />
          );
        })}
        <motion.line
          x1={center} y1={center}
          x2={needleX} y2={needleY}
          initial={{ x2: needleX, y2: needleY }}
          animate={{ x2: needleX, y2: needleY }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={center} cy={center} r={6} fill="#6b7280" />
        <circle cx={center} cy={center} r={3} fill="#9ca3af" />
      </svg>
      <div
        className="text-xs font-bold text-white uppercase tracking-[2px]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        POWER
      </div>
    </motion.div>
  );
}
