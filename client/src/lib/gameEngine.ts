import type { ShotType } from "@/components/cricket/ShotSelector";

// ─── Game State Machine ─────────────────────────────────────────────
export type GamePhase =
  | "idle"        // waiting to start
  | "selecting"   // player picks a shot
  | "runup"       // bowler running in towards the crease
  | "bowling"     // ball is being delivered (animation)
  | "timing"      // timing bar is active, player must click
  | "power"       // power meter is active, player must click
  | "result"      // showing the result of the ball
  | "over"        // game over

// ─── Ball Delivery Types ────────────────────────────────────────────
export type DeliveryType = "fast" | "spin" | "bouncer" | "yorker" | "full-toss";

export interface Delivery {
  type: DeliveryType;
  speed: number;       // timing bar speed multiplier
  difficulty: number;  // 0-1, affects sweet spot width
  label: string;
  pitchY: number;      // 0-100, where ball lands on pitch (0=bowler end, 100=batsman end)
  pitchX: number;      // -30 to 30, lateral offset from center
}

// pitchY: lower = shorter ball, higher = fuller ball
// pitchX: negative = outside off, positive = outside leg
const DELIVERY_TEMPLATES: Omit<Delivery, 'pitchX'>[] = [
  { type: "fast",      speed: 3.5, difficulty: 0.6, label: "Fast Ball",     pitchY: 60 },
  { type: "spin",      speed: 2.0, difficulty: 0.5, label: "Spin Delivery", pitchY: 55 },
  { type: "bouncer",   speed: 4.0, difficulty: 0.8, label: "Short Bouncer", pitchY: 35 },
  { type: "yorker",    speed: 3.0, difficulty: 0.75, label: "Yorker",       pitchY: 78 },
  { type: "full-toss", speed: 2.5, difficulty: 0.3, label: "Full Toss",     pitchY: 85 },
];

export function getRandomDelivery(): Delivery {
  const template = DELIVERY_TEMPLATES[Math.floor(Math.random() * DELIVERY_TEMPLATES.length)];
  // Add random lateral variation and slight Y jitter
  const pitchX = (Math.random() - 0.5) * 40; // -20 to +20
  const pitchY = template.pitchY + (Math.random() - 0.5) * 10; // +/- 5 jitter
  return { ...template, pitchX, pitchY: Math.max(25, Math.min(85, pitchY)) };
}

// ─── Timing Accuracy ────────────────────────────────────────────────
export type TimingRating = "perfect" | "good" | "okay" | "mistimed" | "missed";

export function getTimingRating(position: number): TimingRating {
  // Sweet spot is 45-55 (center of bar)
  const distFromCenter = Math.abs(position - 50);
  if (distFromCenter <= 3) return "perfect";
  if (distFromCenter <= 8) return "good";
  if (distFromCenter <= 15) return "okay";
  if (distFromCenter <= 25) return "mistimed";
  return "missed";
}

const TIMING_MULTIPLIER: Record<TimingRating, number> = {
  perfect: 1.0,
  good: 0.75,
  okay: 0.5,
  mistimed: 0.2,
  missed: 0.0,
};

// ─── Shot Effectiveness ─────────────────────────────────────────────
// Each shot has different effectiveness against different deliveries
const SHOT_VS_DELIVERY: Record<ShotType, Record<DeliveryType, number>> = {
  defensive:  { fast: 0.8, spin: 0.9, bouncer: 0.5, yorker: 0.7, "full-toss": 0.6 },
  drive:      { fast: 0.7, spin: 0.8, bouncer: 0.3, yorker: 0.4, "full-toss": 0.9 },
  pull:       { fast: 0.6, spin: 0.5, bouncer: 0.9, yorker: 0.2, "full-toss": 0.7 },
  sweep:      { fast: 0.3, spin: 0.9, bouncer: 0.2, yorker: 0.5, "full-toss": 0.6 },
  loft:       { fast: 0.5, spin: 0.7, bouncer: 0.6, yorker: 0.3, "full-toss": 0.95 },
};

// ─── Result Calculation ─────────────────────────────────────────────
export type BallResult = "dot" | "1" | "2" | "3" | "4" | "6" | "wicket";

export interface ShotTrajectory {
  angle: number;      // 0-360 degrees, direction ball travels on field (0=straight, 90=square leg)
  distance: number;   // 0-100, how far ball travels (100 = over boundary)
  endX: number;       // 0-100, final x position on radar
  endY: number;       // 0-100, final y position on radar
}

export interface BallOutcome {
  result: BallResult;
  runs: number;
  isWicket: boolean;
  isBoundary: boolean;
  isSix: boolean;
  timingRating: TimingRating;
  shotEffectiveness: number;
  commentary: string;
  trajectory: ShotTrajectory;
}

export function calculateOutcome(
  shot: ShotType,
  delivery: Delivery,
  timingPosition: number,
  powerLevel: number
): BallOutcome {
  const timingRating = getTimingRating(timingPosition);
  const timingMult = TIMING_MULTIPLIER[timingRating];
  const shotEff = SHOT_VS_DELIVERY[shot][delivery.type];
  const powerMult = powerLevel / 100;

  // Combined quality score (0-1)
  const quality = timingMult * 0.45 + shotEff * 0.35 + powerMult * 0.20;

  // Add some randomness
  const luck = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
  const finalScore = quality * luck;

  let result: BallResult;
  let commentary: string;

  if (timingRating === "missed") {
    // Missed timing = high wicket chance
    if (Math.random() < 0.7) {
      result = "wicket";
      commentary = getWicketCommentary(shot, delivery);
    } else {
      result = "dot";
      commentary = "Completely missed! Lucky to survive that one.";
    }
  } else if (finalScore < 0.15) {
    // Very poor = likely wicket
    if (Math.random() < 0.6) {
      result = "wicket";
      commentary = getWicketCommentary(shot, delivery);
    } else {
      result = "dot";
      commentary = getMistimeCommentary(shot);
    }
  } else if (finalScore < 0.3) {
    result = "dot";
    commentary = getDotCommentary(delivery);
  } else if (finalScore < 0.45) {
    result = "1";
    commentary = getSingleCommentary(shot);
  } else if (finalScore < 0.55) {
    result = "2";
    commentary = "Good running between the wickets! Two runs taken.";
  } else if (finalScore < 0.65) {
    result = Math.random() < 0.4 ? "3" : "2";
    commentary = result === "3" ? "Excellent placement! Three runs!" : "Quick running, two more added.";
  } else if (finalScore < 0.8) {
    result = "4";
    commentary = getBoundaryCommentary(shot);
  } else {
    // Excellent quality = six potential
    if (shot === "defensive") {
      result = "4";
      commentary = "Even the defensive shot races to the boundary! Four runs!";
    } else {
      result = "6";
      commentary = getSixCommentary(shot);
    }
  }

  const runs = result === "wicket" || result === "dot" ? 0 : parseInt(result);

  const trajectory = calculateTrajectory(shot, result, powerLevel);

  return {
    result,
    runs,
    isWicket: result === "wicket",
    isBoundary: result === "4",
    isSix: result === "6",
    timingRating,
    shotEffectiveness: shotEff,
    commentary,
    trajectory,
  };
}

// ─── Commentary Templates ───────────────────────────────────────────
function getWicketCommentary(shot: ShotType, delivery: Delivery): string {
  const templates = [
    `Bowled! The ${delivery.label.toLowerCase()} was too good for that ${shot}!`,
    `OUT! Caught! The ${shot} shot didn't have enough behind it.`,
    `Edged and gone! That ${delivery.label.toLowerCase()} found the outside edge.`,
    `Clean bowled! The stumps are rattled!`,
    `What a delivery! The batter had no answer to that one.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getMistimeCommentary(shot: ShotType): string {
  const templates = [
    `Mistimed ${shot} shot, but it drops safely.`,
    `Not the best connection, but survives.`,
    `Lucky! That ${shot} was almost a catching chance.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getDotCommentary(delivery: Delivery): string {
  const templates = [
    `Dot ball. Good ${delivery.label.toLowerCase()} from the bowler.`,
    `Defended solidly. No run there.`,
    `Beaten! The ball goes through to the keeper.`,
    `Left alone outside off stump. Good judgment.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getSingleCommentary(shot: ShotType): string {
  const templates = [
    `Pushed into the gap for a single.`,
    `Quick single taken with a neat ${shot}.`,
    `Tapped to the off side, one run.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getBoundaryCommentary(shot: ShotType): string {
  const templates = [
    `FOUR! Beautiful ${shot} shot races to the boundary!`,
    `That's a boundary! Perfectly placed ${shot}!`,
    `FOUR RUNS! The ${shot} finds the gap and beats the fielder!`,
    `Cracking shot! The ball hits the rope for four!`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getSixCommentary(shot: ShotType): string {
  const templates = [
    `SIX! Massive ${shot}! That's gone into the stands!`,
    `HUGE SIX! What a ${shot} shot! Out of the ground!`,
    `That's in the crowd! Incredible ${shot} for six runs!`,
    `SIX! The ball sails over the boundary! Magnificent!`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// ─── Shot Trajectory Calculation ────────────────────────────────────
const SHOT_ANGLE_RANGES: Record<ShotType, [number, number]> = {
  defensive: [-15, 15],     // straight back down the ground
  drive:     [-40, 10],     // cover to mid-on (off side bias)
  pull:      [30, 80],      // square leg to deep mid-wicket
  sweep:     [50, 100],     // fine leg to square leg
  loft:      [-30, 30],     // over the bowler's head area
};

function calculateTrajectory(shot: ShotType, result: BallResult, power: number): ShotTrajectory {
  const [minAngle, maxAngle] = SHOT_ANGLE_RANGES[shot];
  const angle = minAngle + Math.random() * (maxAngle - minAngle);

  // Distance based on result
  let distance: number;
  switch (result) {
    case "6":     distance = 95 + Math.random() * 5; break;
    case "4":     distance = 80 + Math.random() * 15; break;
    case "3":     distance = 65 + Math.random() * 10; break;
    case "2":     distance = 50 + Math.random() * 15; break;
    case "1":     distance = 30 + Math.random() * 15; break;
    case "wicket": distance = 5 + Math.random() * 20; break;
    default:      distance = 5 + Math.random() * 10; break; // dot
  }

  // Convert angle + distance to radar x,y (center = 50,50)
  const angleRad = ((angle - 90) * Math.PI) / 180; // -90 so 0deg = straight up
  const radarDist = (distance / 100) * 42; // max radius ~42 in 0-100 space
  const endX = 50 + radarDist * Math.cos(angleRad);
  const endY = 50 + radarDist * Math.sin(angleRad);

  return {
    angle,
    distance,
    endX: Math.max(2, Math.min(98, endX)),
    endY: Math.max(2, Math.min(98, endY)),
  };
}

// ─── Match State ────────────────────────────────────────────────────
export interface MatchState {
  runs: number;
  wickets: number;
  ballsBowled: number;
  totalBalls: number;
  totalWickets: number;
  fours: number;
  sixes: number;
  dots: number;
  ballHistory: BallOutcome[];
  currentOver: BallResult[];
  currentRunRate: number;
}

export function createInitialMatchState(totalBalls: number = 30, totalWickets: number = 5): MatchState {
  return {
    runs: 0,
    wickets: 0,
    ballsBowled: 0,
    totalBalls,
    totalWickets,
    fours: 0,
    sixes: 0,
    dots: 0,
    ballHistory: [],
    currentOver: [],
    currentRunRate: 0,
  };
}

export function applyOutcome(state: MatchState, outcome: BallOutcome): MatchState {
  const newState = { ...state };
  newState.runs += outcome.runs;
  newState.ballsBowled += 1;
  newState.ballHistory = [...state.ballHistory, outcome];

  if (outcome.isWicket) newState.wickets += 1;
  if (outcome.isBoundary) newState.fours += 1;
  if (outcome.isSix) newState.sixes += 1;
  if (outcome.result === "dot") newState.dots += 1;

  // Current over tracking
  const ballInOver = newState.ballsBowled % 6;
  if (ballInOver === 1) {
    newState.currentOver = [outcome.result];
  } else {
    newState.currentOver = [...state.currentOver, outcome.result];
  }

  // Run rate
  const overs = newState.ballsBowled / 6;
  newState.currentRunRate = overs > 0 ? newState.runs / overs : 0;

  return newState;
}

export function isMatchOver(state: MatchState): boolean {
  return state.ballsBowled >= state.totalBalls || state.wickets >= state.totalWickets;
}

export function getOversString(balls: number): string {
  const completedOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${completedOvers}.${remainingBalls}`;
}
