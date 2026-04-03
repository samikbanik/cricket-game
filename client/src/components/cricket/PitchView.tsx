import { motion, AnimatePresence } from "framer-motion";
import type { GamePhase, Delivery, BallOutcome } from "@/lib/gameEngine";
import type { ShotType } from "@/components/cricket/ShotSelector";

export type Handedness = "right" | "left";

interface PitchViewProps {
  phase: GamePhase;
  delivery: Delivery | null;
  outcome: BallOutcome | null;
  selectedShot: ShotType | null;
  handedness?: Handedness;
  ballCount?: number; // Used as React key to force batsman remount each delivery
}

/* ─── Pitch coordinate helpers ──────────────────────────────────────
   The pitch strip occupies ~60px wide centered, from top 10% to 90%.
   pitchY 0 = bowler's end (top), 100 = batsman's end (bottom).
   We map delivery.pitchY → CSS top% within the pitch strip.
   pitchX -20..+20 → slight lateral offset from center.
──────────────────────────────────────────────────────────────────── */
function pitchYToTop(pitchY: number): string {
  const minTop = 14;
  const maxTop = 74;
  return `${minTop + (pitchY / 100) * (maxTop - minTop)}%`;
}

function pitchXToLeft(pitchX: number): string {
  return `calc(50% + ${pitchX * 0.5}px)`;
}

/* ─── Concentric Ripple Component ──────────────────────────────── */
function LandingSpotRipple({ pitchX, pitchY }: { pitchX: number; pitchY: number }) {
  const top = pitchYToTop(pitchY);
  const left = pitchXToLeft(pitchX);

  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      style={{ top, left, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderColor: i === 0 ? "rgba(239, 68, 68, 0.9)" : `rgba(239, 68, 68, ${0.6 - i * 0.15})`,
          }}
          initial={{ width: 6, height: 6, opacity: 0 }}
          animate={{
            width: [6, 12 + i * 16],
            height: [6, 12 + i * 16],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 8,
          height: 8,
          background: "radial-gradient(circle, #ef4444 40%, #dc2626 100%)",
          boxShadow: "0 0 12px rgba(239,68,68,0.7), 0 0 24px rgba(239,68,68,0.3)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          boxShadow: [
            "0 0 12px rgba(239,68,68,0.7), 0 0 24px rgba(239,68,68,0.3)",
            "0 0 18px rgba(239,68,68,0.9), 0 0 36px rgba(239,68,68,0.5)",
            "0 0 12px rgba(239,68,68,0.7), 0 0 24px rgba(239,68,68,0.3)",
          ],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute whitespace-nowrap"
        style={{ top: -22, left: "50%", transform: "translateX(-50%)" }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span
          className="text-[10px] font-bold text-red-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {getLengthLabel(pitchY)}
        </span>
      </motion.div>
    </motion.div>
  );
}

function getLengthLabel(pitchY: number): string {
  if (pitchY < 35) return "Short";
  if (pitchY < 50) return "Back of Length";
  if (pitchY < 65) return "Good Length";
  if (pitchY < 75) return "Full";
  return "Yorker Length";
}

/* ─── Ball Trajectory on Pitch ─────────────────────────────────── */
function BallTrajectoryLine({ delivery }: { delivery: Delivery }) {
  const startTop = 14;
  const landTop = 14 + (delivery.pitchY / 100) * 60;
  const endTop = 76;
  const centerX = 50;
  const landX = centerX + delivery.pitchX * 0.015;

  return (
    <svg
      className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <motion.line
        x1={centerX}
        y1={startTop}
        x2={landX}
        y2={landTop}
        stroke="rgba(239, 68, 68, 0.5)"
        strokeWidth="0.4"
        strokeDasharray="1 1"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.line
        x1={landX}
        y1={landTop}
        x2={centerX}
        y2={endTop}
        stroke="rgba(239, 68, 68, 0.3)"
        strokeWidth="0.3"
        strokeDasharray="0.8 0.8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
      />
      <motion.circle
        cx={landX}
        cy={landTop}
        r="0.8"
        fill="rgba(239, 68, 68, 0.8)"
        initial={{ r: 0, opacity: 0 }}
        animate={{ r: [0, 2, 0.8], opacity: [0, 1, 0.6] }}
        transition={{ duration: 0.5, delay: 0.7 }}
      />
    </svg>
  );
}

/* ─── Result Trajectory on Pitch (after shot) ──────────────────── */
function ShotTrajectoryOnPitch({ outcome }: { outcome: BallOutcome }) {
  if (!outcome.trajectory) return null;

  const batsmanY = 76;
  const batsmanX = 50;
  const angleRad = ((outcome.trajectory.angle) * Math.PI) / 180;
  const dist = (outcome.trajectory.distance / 100) * 30;
  const exitX = batsmanX + dist * Math.sin(angleRad);
  const exitY = batsmanY - dist * Math.cos(angleRad);

  const color = outcome.isSix
    ? "rgba(245, 158, 11, 0.8)"
    : outcome.isBoundary
    ? "rgba(34, 197, 94, 0.8)"
    : outcome.isWicket
    ? "rgba(239, 68, 68, 0.5)"
    : "rgba(255, 255, 255, 0.5)";

  return (
    <svg
      className="absolute inset-0 w-full h-full z-[6] pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <motion.line
        x1={batsmanX}
        y1={batsmanY}
        x2={exitX}
        y2={exitY}
        stroke={color}
        strokeWidth="0.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      />
      {!outcome.isWicket && outcome.runs > 0 && (
        <motion.circle
          cx={exitX}
          cy={exitY}
          fill={color}
          initial={{ r: 0, opacity: 0 }}
          animate={{ r: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
          transition={{ duration: 0.4, delay: 0.7 }}
        />
      )}
    </svg>
  );
}

/* ─── Bowler Run-Up Animation ──────────────────────────────────── */
function BowlerRunUp() {
  return (
    <motion.div
      className="absolute z-[12] pointer-events-none"
      style={{ left: "calc(50% - 28px)", transform: "translateX(-50%)" }}
      initial={{ top: "-8%" }}
      animate={{
        top: ["-8%", "6%", "10%", "10%"],
      }}
      transition={{
        duration: 1.0,
        times: [0, 0.55, 0.75, 1],
        ease: "easeInOut",
      }}
    >
      <svg width="36" height="52" viewBox="0 0 36 52" fill="none" overflow="visible">
        <motion.ellipse
          cx="18" cy="50"
          rx="10" ry="2.5"
          fill="rgba(0,0,0,0.25)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0.4, 0.3] }}
          transition={{ duration: 1.0, times: [0, 0.5, 0.75, 1] }}
        />
        <motion.g
          animate={{
            y: [0, -2, 0, -3, -1, 0],
          }}
          transition={{
            duration: 1.0,
            times: [0, 0.15, 0.3, 0.55, 0.75, 1],
            ease: "easeInOut",
          }}
        >
          {/* Head */}
          <motion.circle
            cx="18" cy="8" r="5.5"
            fill="#e8d5b7"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.5"
          />
          <rect x="13" y="4" width="10" height="5" rx="2" fill="#4a6fa5" opacity="0.7" />
          <rect x="14" y="7" width="8" height="2" rx="1" fill="#2d4a7a" opacity="0.5" />

          {/* Torso */}
          <motion.rect
            x="13" y="13" width="10" height="14" rx="3"
            fill="#f0f0f0"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
          <rect x="13" y="17" width="10" height="2" fill="#3b82f6" opacity="0.6" rx="1" />

          {/* Left leg */}
          <motion.line
            x1="16" y1="27" x2="14" y2="44"
            stroke="#e8d5b7" strokeWidth="3" strokeLinecap="round"
            animate={{
              x2: [14, 10, 14, 12, 16],
              y2: [44, 40, 44, 38, 44],
            }}
            transition={{
              duration: 1.0,
              times: [0, 0.2, 0.4, 0.6, 0.8],
              ease: "easeInOut",
            }}
          />
          <motion.ellipse
            rx="3" ry="1.5" fill="#333"
            animate={{
              cx: [14, 10, 14, 12, 16],
              cy: [45, 41, 45, 39, 45],
            }}
            transition={{
              duration: 1.0,
              times: [0, 0.2, 0.4, 0.6, 0.8],
              ease: "easeInOut",
            }}
          />

          {/* Right leg */}
          <motion.line
            x1="20" y1="27" x2="22" y2="44"
            stroke="#e8d5b7" strokeWidth="3" strokeLinecap="round"
            animate={{
              x2: [22, 26, 22, 24, 20],
              y2: [44, 38, 44, 40, 44],
            }}
            transition={{
              duration: 1.0,
              times: [0, 0.2, 0.4, 0.6, 0.8],
              ease: "easeInOut",
            }}
          />
          <motion.ellipse
            rx="3" ry="1.5" fill="#333"
            animate={{
              cx: [22, 26, 22, 24, 20],
              cy: [45, 39, 45, 41, 45],
            }}
            transition={{
              duration: 1.0,
              times: [0, 0.2, 0.4, 0.6, 0.8],
              ease: "easeInOut",
            }}
          />

          {/* Bowling arm — swings over at the end */}
          <motion.line
            x1="22" y1="16"
            stroke="#e8d5b7" strokeWidth="2.5" strokeLinecap="round"
            animate={{
              x2: [24, 26, 28, 22, 18],
              y2: [24, 20, 6, -4, 8],
            }}
            transition={{
              duration: 1.0,
              times: [0, 0.3, 0.6, 0.8, 1],
              ease: "easeInOut",
            }}
          />
          {/* Ball in hand — fades at release */}
          <motion.circle
            r="3"
            fill="#c0392b"
            stroke="#8b0000"
            strokeWidth="0.5"
            animate={{
              cx: [24, 26, 28, 22, 18],
              cy: [24, 20, 6, -4, 8],
              opacity: [1, 1, 1, 0, 0],
            }}
            transition={{
              duration: 1.0,
              times: [0, 0.3, 0.6, 0.8, 1],
              ease: "easeInOut",
            }}
          />

          {/* Non-bowling arm */}
          <motion.line
            x1="14" y1="16"
            stroke="#e8d5b7" strokeWidth="2.5" strokeLinecap="round"
            animate={{
              x2: [10, 8, 10, 12],
              y2: [24, 20, 22, 24],
            }}
            transition={{
              duration: 1.0,
              times: [0, 0.4, 0.7, 1],
              ease: "easeInOut",
            }}
          />

          {/* Dust particles */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={`dust-${i}`}
              r="1.5"
              fill="rgba(180,160,120,0.5)"
              animate={{
                cx: [18 + i * 3, 16 + i * 4, 14 + i * 5],
                cy: [48, 46, 44],
                opacity: [0, 0.4, 0],
                r: [0.5, 2, 0.5],
              }}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.15,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.g>
      </svg>
    </motion.div>
  );
}

/* ─── Shot Keyframes ──────────────────────────────────────────────
   Each shot type defines keyframes for body rotation, legs, arms, bat.
   These are for a LEFT-HANDED batsman (bat on the right side).
   For RIGHT-HANDED, we mirror X values around center (cx=24 in 48-wide SVG).
──────────────────────────────────────────────────────────────────── */
interface ShotKeyframes {
  bodyRotate: number[];
  frontLegX2: number[];
  frontLegY2: number[];
  backLegX2: number[];
  backLegY2: number[];
  batBladeX2: number[];
  batBladeY2: number[];
  batHandleX2: number[];
  batHandleY2: number[];
  armFrontX2: number[];
  armFrontY2: number[];
  armBackX2: number[];
  armBackY2: number[];
  headCx: number[];
}

/* Left-handed keyframes (bat on right side of body, facing off-side to the right) */
const LEFT_SHOT_KEYFRAMES: Record<string, ShotKeyframes> = {
  defensive: {
    bodyRotate: [0, -5, -8, -5],
    frontLegX2: [28, 30, 32, 30],
    frontLegY2: [46, 44, 42, 44],
    backLegX2: [19, 19, 18, 19],
    backLegY2: [46, 46, 46, 46],
    batBladeX2: [38, 34, 32, 32],
    batBladeY2: [18, 22, 30, 30],
    batHandleX2: [33, 32, 30, 30],
    batHandleY2: [30, 28, 26, 26],
    armFrontX2: [30, 31, 30, 30],
    armFrontY2: [24, 23, 24, 24],
    armBackX2: [28, 29, 28, 28],
    armBackY2: [22, 22, 23, 23],
    headCx: [24, 25, 26, 25],
  },
  drive: {
    bodyRotate: [0, 10, 20, 15],
    frontLegX2: [28, 32, 36, 34],
    frontLegY2: [46, 44, 42, 43],
    backLegX2: [19, 18, 16, 17],
    backLegY2: [46, 46, 44, 45],
    batBladeX2: [38, 42, 48, 44],
    batBladeY2: [18, 14, 18, 20],
    batHandleX2: [33, 34, 36, 34],
    batHandleY2: [30, 26, 22, 24],
    armFrontX2: [30, 34, 38, 36],
    armFrontY2: [24, 22, 20, 22],
    armBackX2: [28, 32, 36, 34],
    armBackY2: [22, 20, 18, 20],
    headCx: [24, 26, 28, 27],
  },
  pull: {
    bodyRotate: [0, -10, -25, -15],
    frontLegX2: [28, 26, 24, 26],
    frontLegY2: [46, 44, 42, 44],
    backLegX2: [19, 18, 16, 18],
    backLegY2: [46, 44, 42, 44],
    batBladeX2: [38, 44, 10, 12],
    batBladeY2: [18, 12, 10, 14],
    batHandleX2: [33, 32, 26, 28],
    batHandleY2: [30, 24, 18, 20],
    armFrontX2: [30, 28, 22, 24],
    armFrontY2: [24, 20, 16, 18],
    armBackX2: [28, 26, 24, 26],
    armBackY2: [22, 18, 14, 16],
    headCx: [24, 22, 20, 22],
  },
  sweep: {
    bodyRotate: [0, 15, 30, 20],
    frontLegX2: [28, 32, 36, 34],
    frontLegY2: [46, 48, 50, 48],
    backLegX2: [19, 18, 16, 18],
    backLegY2: [46, 48, 48, 48],
    batBladeX2: [38, 46, 10, 14],
    batBladeY2: [18, 28, 34, 32],
    batHandleX2: [33, 34, 28, 30],
    batHandleY2: [30, 32, 34, 32],
    armFrontX2: [30, 34, 26, 28],
    armFrontY2: [24, 28, 30, 28],
    armBackX2: [28, 32, 28, 30],
    armBackY2: [22, 26, 30, 28],
    headCx: [24, 26, 28, 27],
  },
  loft: {
    bodyRotate: [0, -5, -15, -10],
    frontLegX2: [28, 28, 26, 28],
    frontLegY2: [46, 44, 42, 44],
    backLegX2: [19, 18, 16, 18],
    backLegY2: [46, 44, 40, 42],
    batBladeX2: [38, 40, 16, 18],
    batBladeY2: [18, 8, -2, 4],
    batHandleX2: [33, 32, 24, 26],
    batHandleY2: [30, 22, 14, 16],
    armFrontX2: [30, 28, 22, 24],
    armFrontY2: [24, 18, 12, 14],
    armBackX2: [28, 26, 22, 24],
    armBackY2: [22, 16, 10, 12],
    headCx: [24, 23, 21, 22],
  },
};

/* Right-handed keyframes (bat on left side of body, facing off-side to the left) */
const RIGHT_SHOT_KEYFRAMES: Record<string, ShotKeyframes> = {
  defensive: {
    bodyRotate: [0, 5, 8, 5],
    frontLegX2: [18, 16, 14, 16],
    frontLegY2: [46, 44, 42, 44],
    backLegX2: [27, 27, 28, 27],
    backLegY2: [46, 46, 46, 46],
    batBladeX2: [8, 12, 14, 14],
    batBladeY2: [18, 22, 30, 30],
    batHandleX2: [13, 14, 16, 16],
    batHandleY2: [30, 28, 26, 26],
    armFrontX2: [16, 15, 16, 16],
    armFrontY2: [24, 23, 24, 24],
    armBackX2: [18, 17, 18, 18],
    armBackY2: [22, 22, 23, 23],
    headCx: [22, 21, 20, 21],
  },
  drive: {
    bodyRotate: [0, -10, -20, -15],
    frontLegX2: [18, 14, 10, 12],
    frontLegY2: [46, 44, 42, 43],
    backLegX2: [27, 28, 30, 29],
    backLegY2: [46, 46, 44, 45],
    batBladeX2: [8, 4, -2, 2],
    batBladeY2: [18, 14, 18, 20],
    batHandleX2: [13, 12, 10, 12],
    batHandleY2: [30, 26, 22, 24],
    armFrontX2: [16, 12, 8, 10],
    armFrontY2: [24, 22, 20, 22],
    armBackX2: [18, 14, 10, 12],
    armBackY2: [22, 20, 18, 20],
    headCx: [22, 20, 18, 19],
  },
  pull: {
    bodyRotate: [0, 10, 25, 15],
    frontLegX2: [18, 20, 22, 20],
    frontLegY2: [46, 44, 42, 44],
    backLegX2: [27, 28, 30, 28],
    backLegY2: [46, 44, 42, 44],
    batBladeX2: [8, 2, 36, 34],
    batBladeY2: [18, 12, 10, 14],
    batHandleX2: [13, 14, 20, 18],
    batHandleY2: [30, 24, 18, 20],
    armFrontX2: [16, 18, 24, 22],
    armFrontY2: [24, 20, 16, 18],
    armBackX2: [18, 20, 22, 20],
    armBackY2: [22, 18, 14, 16],
    headCx: [22, 24, 26, 24],
  },
  sweep: {
    bodyRotate: [0, -15, -30, -20],
    frontLegX2: [18, 14, 10, 12],
    frontLegY2: [46, 48, 50, 48],
    backLegX2: [27, 28, 30, 28],
    backLegY2: [46, 48, 48, 48],
    batBladeX2: [8, 0, 36, 32],
    batBladeY2: [18, 28, 34, 32],
    batHandleX2: [13, 12, 18, 16],
    batHandleY2: [30, 32, 34, 32],
    armFrontX2: [16, 12, 20, 18],
    armFrontY2: [24, 28, 30, 28],
    armBackX2: [18, 14, 18, 16],
    armBackY2: [22, 26, 30, 28],
    headCx: [22, 20, 18, 19],
  },
  loft: {
    bodyRotate: [0, 5, 15, 10],
    frontLegX2: [18, 18, 20, 18],
    frontLegY2: [46, 44, 42, 44],
    backLegX2: [27, 28, 30, 28],
    backLegY2: [46, 44, 40, 42],
    batBladeX2: [8, 6, 30, 28],
    batBladeY2: [18, 8, -2, 4],
    batHandleX2: [13, 14, 22, 20],
    batHandleY2: [30, 22, 14, 16],
    armFrontX2: [16, 18, 24, 22],
    armFrontY2: [24, 18, 12, 14],
    armBackX2: [18, 20, 24, 22],
    armBackY2: [22, 16, 10, 12],
    headCx: [22, 23, 25, 24],
  },
};

/* ─── Batsman Default Stance (idle / non-swinging) ────────────── */
interface BatsmanStance {
  offsetLeft: string;      // CSS left position
  headCx: number;
  torsoX: number;
  frontLegX: number;
  backLegX: number;
  frontFootCx: number;
  backFootCx: number;
  armFrontElbowX: number;
  armFrontGripX: number;
  armBackElbowX: number;
  armBackGripX: number;
  batHandleTopX: number;
  batHandleBottomX: number;
  batHandleBottomY: number;
  batBladeX: number;
  batBladeY: number;
  batHighlightX: number;
  batHighlightY: number;
  gloveTopCx: number;
  gloveBottomCx: number;
  visorX: number;
  visorW: number;
  transformOrigin: string;
}

const RIGHT_STANCE: BatsmanStance = {
  offsetLeft: "calc(50% + 10px)",
  headCx: 22,
  torsoX: 22,
  frontLegX: 18,
  backLegX: 27,
  frontFootCx: 18,
  backFootCx: 27,
  armFrontElbowX: 16,
  armFrontGripX: 14,
  armBackElbowX: 18,
  armBackGripX: 14,
  batHandleTopX: 14,
  batHandleBottomX: 13,
  batHandleBottomY: 30,
  batBladeX: 8,
  batBladeY: 18,
  batHighlightX: 8.5,
  batHighlightY: 19,
  gloveTopCx: 14,
  gloveBottomCx: 14,
  visorX: 17,
  visorW: 10,
  transformOrigin: "22px 30px",
};

const LEFT_STANCE: BatsmanStance = {
  offsetLeft: "calc(50% - 10px)",
  headCx: 24,
  torsoX: 24,
  frontLegX: 28,
  backLegX: 19,
  frontFootCx: 28,
  backFootCx: 19,
  armFrontElbowX: 30,
  armFrontGripX: 32,
  armBackElbowX: 28,
  armBackGripX: 32,
  batHandleTopX: 32,
  batHandleBottomX: 33,
  batHandleBottomY: 30,
  batBladeX: 38,
  batBladeY: 18,
  batHighlightX: 37.5,
  batHighlightY: 19,
  gloveTopCx: 32,
  gloveBottomCx: 32,
  visorX: 19,
  visorW: 10,
  transformOrigin: "24px 30px",
};

/* ─── Animated Batsman Component ─────────────────────────────── */
function AnimatedBatsman({
  isSwinging,
  showBowlerRunUp,
  selectedShot,
  handedness,
}: {
  isSwinging: boolean;
  showBowlerRunUp: boolean;
  selectedShot: ShotType | null;
  handedness: Handedness;
}) {
  const isRight = handedness === "right";
  // The pitch view is from behind the stumps (bowler's end), so the batsman
  // appears mirrored compared to a front-on view. A right-hander's bat is on
  // the LEFT when viewed from the front, but on the RIGHT when viewed from behind.
  // Therefore we swap stances: right-handed → LEFT stance, left-handed → RIGHT stance.
  // The keyframes must stay paired with their matching stance (they animate FROM
  // those positions), but the bodyRotate direction needs to be negated for the
  // rear view since rotation appears reversed when viewed from behind.
  const stance = isRight ? LEFT_STANCE : RIGHT_STANCE;
  const baseKeyframes = isRight ? LEFT_SHOT_KEYFRAMES : RIGHT_SHOT_KEYFRAMES;
  // Negate bodyRotate for behind-the-stumps perspective
  const shotKeyframes: Record<string, ShotKeyframes> = {};
  for (const [shot, kf] of Object.entries(baseKeyframes)) {
    shotKeyframes[shot] = {
      ...kf,
      bodyRotate: kf.bodyRotate.map(r => -r),
    };
  }
  const kf = (isSwinging && selectedShot) ? shotKeyframes[selectedShot] : null;
  const dur = 0.5;
  const times = [0, 0.3, 0.65, 1];

  return (
    <motion.div
      className="absolute"
      style={{ top: "66%", left: stance.offsetLeft, transform: "translateX(-50%)" }}
      animate={
        showBowlerRunUp
          ? { y: [0, -1, 0, -1, 0], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } }
          : {}
      }
    >
      <svg width="48" height="56" viewBox="0 0 48 56" fill="none" overflow="visible">
        {/* Shadow */}
        <ellipse cx="24" cy="54" rx="12" ry="2" fill="rgba(0,0,0,0.2)" />

        {/* Body group — rotates during shot */}
        <motion.g
          style={{ transformOrigin: stance.transformOrigin }}
          animate={kf ? { rotate: kf.bodyRotate } : { rotate: 0 }}
          transition={{ duration: dur, times, ease: "easeOut" }}
        >
          {/* Helmet */}
          <motion.circle
            cy="7" r="5.5"
            fill="rgba(255,255,255,0.55)"
            animate={kf ? { cx: kf.headCx } : { cx: stance.headCx }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />
          <path
            d={`M${stance.headCx - 5} 5 Q${stance.headCx} 2 ${stance.headCx + 5} 5`}
            stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none"
          />
          {/* Visor */}
          <rect x={stance.visorX} y="7" width={stance.visorW} height="2.5" rx="1" fill="rgba(100,150,220,0.4)" />

          {/* Torso */}
          <line x1={stance.torsoX} y1="12" x2={stance.torsoX} y2="30" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Front leg */}
          <motion.line
            x1={stance.torsoX} y1="30"
            stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"
            animate={kf ? { x2: kf.frontLegX2, y2: kf.frontLegY2 } : { x2: stance.frontLegX, y2: 46 }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />
          <motion.ellipse
            rx="3.5" ry="1.5" fill="rgba(255,255,255,0.35)"
            animate={kf ? { cx: kf.frontLegX2, cy: kf.frontLegY2.map(y => y + 1) } : { cx: stance.frontFootCx, cy: 47 }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />

          {/* Back leg */}
          <motion.line
            x1={stance.torsoX} y1="30"
            stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round"
            animate={kf ? { x2: kf.backLegX2, y2: kf.backLegY2 } : { x2: stance.backLegX, y2: 46 }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />
          <motion.ellipse
            rx="3.5" ry="1.5" fill="rgba(255,255,255,0.3)"
            animate={kf ? { cx: kf.backLegX2, cy: kf.backLegY2.map(y => y + 1) } : { cx: stance.backFootCx, cy: 47 }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />

          {/* Front arm (bottom hand) */}
          <motion.line
            x1={stance.torsoX} y1="17"
            stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"
            animate={kf ? { x2: kf.armFrontX2, y2: kf.armFrontY2 } : { x2: stance.armFrontElbowX, y2: 24 }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />
          <motion.line
            stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"
            animate={
              kf
                ? { x1: kf.armFrontX2, y1: kf.armFrontY2, x2: kf.batHandleX2, y2: kf.batHandleY2 }
                : { x1: stance.armFrontElbowX, y1: 24, x2: stance.armFrontGripX, y2: 28 }
            }
            transition={{ duration: dur, times, ease: "easeOut" }}
          />

          {/* Back arm (top hand) */}
          <motion.line
            x1={stance.torsoX} y1="17"
            stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round"
            animate={kf ? { x2: kf.armBackX2, y2: kf.armBackY2 } : { x2: stance.armBackElbowX, y2: 22 }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />
          <motion.line
            stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round"
            animate={
              kf
                ? { x1: kf.armBackX2, y1: kf.armBackY2, x2: kf.batHandleX2, y2: kf.batHandleY2.map(y => y - 1) }
                : { x1: stance.armBackElbowX, y1: 22, x2: stance.armBackGripX, y2: 27 }
            }
            transition={{ duration: dur, times, ease: "easeOut" }}
          />

          {/* Bat handle */}
          <motion.line
            stroke="rgba(200,170,120,0.7)" strokeWidth="2" strokeLinecap="round"
            animate={
              kf
                ? { x1: kf.batHandleX2, y1: kf.batHandleY2.map(y => y - 2), x2: kf.batHandleX2, y2: kf.batHandleY2 }
                : { x1: stance.batHandleTopX, y1: 26, x2: stance.batHandleBottomX, y2: stance.batHandleBottomY }
            }
            transition={{ duration: dur, times, ease: "easeOut" }}
          />

          {/* Bat blade */}
          <motion.line
            stroke="rgba(220,190,130,0.8)" strokeWidth="3.5" strokeLinecap="round"
            animate={
              kf
                ? { x1: kf.batHandleX2, y1: kf.batHandleY2, x2: kf.batBladeX2, y2: kf.batBladeY2 }
                : { x1: stance.batHandleBottomX, y1: stance.batHandleBottomY, x2: stance.batBladeX, y2: stance.batBladeY }
            }
            transition={{ duration: dur, times, ease: "easeOut" }}
          />
          {/* Bat blade highlight */}
          <motion.line
            stroke="rgba(240,220,170,0.3)" strokeWidth="1.5" strokeLinecap="round"
            animate={
              kf
                ? { x1: kf.batHandleX2, y1: kf.batHandleY2, x2: kf.batBladeX2.map(x => x + (isRight ? 0.5 : -0.5)), y2: kf.batBladeY2.map(y => y + 1) }
                : { x1: stance.batHandleBottomX, y1: stance.batHandleBottomY, x2: stance.batHighlightX, y2: stance.batHighlightY }
            }
            transition={{ duration: dur, times, ease: "easeOut" }}
          />

          {/* Gloves at grip */}
          <motion.circle
            r="1.8" fill="rgba(255,255,255,0.4)"
            animate={kf ? { cx: kf.batHandleX2, cy: kf.batHandleY2.map(y => y - 1) } : { cx: stance.gloveTopCx, cy: 27 }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />
          <motion.circle
            r="1.8" fill="rgba(255,255,255,0.35)"
            animate={kf ? { cx: kf.batHandleX2, cy: kf.batHandleY2.map(y => y + 1) } : { cx: stance.gloveBottomCx, cy: 29 }}
            transition={{ duration: dur, times, ease: "easeOut" }}
          />
        </motion.g>

        {/* Bat swing trail effect */}
        {isSwinging && selectedShot && shotKeyframes[selectedShot] && (
          <motion.path
            d={`M ${shotKeyframes[selectedShot].batHandleX2[2]} ${shotKeyframes[selectedShot].batHandleY2[2]} L ${shotKeyframes[selectedShot].batBladeX2[2]} ${shotKeyframes[selectedShot].batBladeY2[2]}`}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: [0, 0.4, 0], pathLength: [0, 1, 1] }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          />
        )}
      </svg>
    </motion.div>
  );
}

/* ─── Main PitchView Component ─────────────────────────────────── */
export default function PitchView({ phase, delivery, outcome, selectedShot, handedness = "right", ballCount = 0 }: PitchViewProps) {
  const showLandingSpot = (phase === "selecting" || phase === "runup" || phase === "bowling" || phase === "timing" || phase === "power") && delivery;
  const showBowlingTrajectory = (phase === "bowling" || phase === "timing" || phase === "power") && delivery;
  const showShotTrajectory = (phase === "result" || phase === "over") && outcome;
  const showBowlerRunUp = phase === "runup";
  const isSwinging = phase === "power" || phase === "result" || phase === "over";

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/[0.06]"
      style={{
        height: 320,
        background: "linear-gradient(180deg, #1a2e1a 0%, #2d4a2d 40%, #3a5c3a 100%)",
      }}
    >
      {/* Pitch strip */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded"
        style={{
          top: "10%",
          width: 60,
          height: "80%",
          background: "linear-gradient(180deg, #c4a56e 0%, #b8965a 50%, #a88548 100%)",
          boxShadow: "0 0 20px rgba(196,165,110,0.2)",
        }}
      />

      {/* Crease lines */}
      <div
        className="absolute left-1/2 -translate-x-1/2 h-[2px] bg-white/60"
        style={{ top: "22%", width: 80 }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 h-[2px] bg-white/60"
        style={{ top: "78%", width: 80 }}
      />

      {/* Stumps at bowler's end */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "18%" }}>
        <svg width="24" height="20" viewBox="0 0 24 20">
          <rect x="4" y="0" width="2" height="18" fill="#d4a574" rx="1" />
          <rect x="11" y="0" width="2" height="18" fill="#d4a574" rx="1" />
          <rect x="18" y="0" width="2" height="18" fill="#d4a574" rx="1" />
          <rect x="3" y="0" width="18" height="2" fill="#c49464" rx="1" />
        </svg>
      </div>

      {/* Stumps at batsman's end */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "76%" }}>
        <svg width="24" height="20" viewBox="0 0 24 20">
          <rect x="4" y="2" width="2" height="18" fill="#d4a574" rx="1" />
          <rect x="11" y="2" width="2" height="18" fill="#d4a574" rx="1" />
          <rect x="18" y="2" width="2" height="18" fill="#d4a574" rx="1" />
          <rect x="3" y="0" width="18" height="2" fill="#c49464" rx="1" />
        </svg>
      </div>

      {/* Animated Batsman — key forces remount each delivery so position resets cleanly */}
      <AnimatedBatsman
        key={`batsman-${ballCount}`}
        isSwinging={isSwinging}
        showBowlerRunUp={showBowlerRunUp}
        selectedShot={selectedShot}
        handedness={handedness}
      />

      {/* ── Bowler Run-Up Animation ── */}
      <AnimatePresence>
        {showBowlerRunUp && (
          <motion.div
            key="bowler-runup"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <BowlerRunUp />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ball Landing Spot Preview ── */}
      <AnimatePresence>
        {showLandingSpot && delivery && (
          <LandingSpotRipple
            key={`landing-${delivery.pitchX}-${delivery.pitchY}`}
            pitchX={delivery.pitchX}
            pitchY={delivery.pitchY}
          />
        )}
      </AnimatePresence>

      {/* ── Ball Trajectory Lines on Pitch (bowling phase onward) ── */}
      <AnimatePresence>
        {showBowlingTrajectory && delivery && (
          <motion.div
            key="bowl-traj"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <BallTrajectoryLine delivery={delivery} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Shot Trajectory on Pitch (result phase) ── */}
      <AnimatePresence>
        {showShotTrajectory && outcome && (
          <motion.div
            key="shot-traj"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <ShotTrajectoryOnPitch outcome={outcome} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ball animation */}
      <AnimatePresence>
        {phase === "bowling" && delivery && (
          <motion.div
            key="ball"
            initial={{
              top: "15%",
              left: pitchXToLeft(0),
              scale: 0.5,
              opacity: 0,
            }}
            animate={{
              top: pitchYToTop(delivery.pitchY),
              left: pitchXToLeft(delivery.pitchX),
              scale: 1.2,
              opacity: 1,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-[8]"
          >
            <div
              className="w-5 h-5 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, #e74c3c, #8b0000)",
                boxShadow: "0 0 12px rgba(231,76,60,0.6), 0 2px 4px rgba(0,0,0,0.4)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery label — positioned to the LEFT side of the pitch, not covering the bowler */}
      <AnimatePresence>
        {(phase === "selecting" || phase === "runup" || phase === "bowling") && delivery && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 left-3 z-20"
          >
            <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
              <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-heading)" }}>
                Delivery
              </div>
              <span
                className="text-sm font-semibold text-amber-400 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {delivery.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Run-up phase label */}
      <AnimatePresence>
        {phase === "runup" && (
          <motion.div
            key="runup-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
              <span
                className="text-sm font-semibold text-blue-400"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Bowler running in...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result overlay */}
      <AnimatePresence>
        {(phase === "result" || phase === "over") && outcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-[15]"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-center"
            >
              {outcome.isSix && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-7xl font-black text-amber-400 mb-2"
                  style={{ fontFamily: "var(--font-heading)", textShadow: "0 0 40px rgba(245,158,11,0.5)" }}
                >
                  SIX!
                </motion.div>
              )}
              {outcome.isBoundary && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl font-black text-emerald-400 mb-2"
                  style={{ fontFamily: "var(--font-heading)", textShadow: "0 0 40px rgba(34,197,94,0.5)" }}
                >
                  FOUR!
                </motion.div>
              )}
              {outcome.isWicket && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl font-black text-red-500 mb-2"
                  style={{ fontFamily: "var(--font-heading)", textShadow: "0 0 40px rgba(239,68,68,0.5)" }}
                >
                  OUT!
                </motion.div>
              )}
              {!outcome.isSix && !outcome.isBoundary && !outcome.isWicket && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                  className="text-5xl font-black text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {outcome.runs === 0 ? "DOT" : `${outcome.runs} RUN${outcome.runs > 1 ? "S" : ""}`}
                </motion.div>
              )}
              <div className="text-sm text-gray-300 mt-2 max-w-xs">
                Timing: <span className={`font-semibold ${
                  outcome.timingRating === "perfect" ? "text-emerald-400" :
                  outcome.timingRating === "good" ? "text-green-400" :
                  outcome.timingRating === "okay" ? "text-amber-400" :
                  "text-red-400"
                }`}>{outcome.timingRating.toUpperCase()}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase instruction overlay */}
      <AnimatePresence>
        {phase === "timing" && (
          <motion.div
            key="timing-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
              <span className="text-sm font-semibold text-emerald-400 animate-pulse">
                CLICK or SPACE to time your shot!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase === "power" && (
          <motion.div
            key="power-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="px-4 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30">
              <span className="text-sm font-semibold text-amber-400 animate-pulse">
                CLICK or SPACE to set power!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
