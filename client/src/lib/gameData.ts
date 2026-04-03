import type { Position } from "@/components/cricket/FieldRadar";
import type { BatsmanStats } from "@/components/cricket/BatsmanStatsBar";

export const defaultFielderPositions: Position[] = [
  { x: 50, y: 10, type: "fielder" },
  { x: 20, y: 25, type: "fielder" },
  { x: 80, y: 25, type: "fielder" },
  { x: 15, y: 50, type: "fielder" },
  { x: 85, y: 50, type: "fielder" },
  { x: 30, y: 70, type: "fielder" },
  { x: 70, y: 70, type: "fielder" },
  { x: 50, y: 85, type: "fielder" },
  { x: 10, y: 80, type: "fielder" },
  { x: 48, y: 42, type: "batsman" },
  { x: 52, y: 58, type: "bowler" },
];

export const defaultBatsmen: BatsmanStats[] = [
  { label: "BATSMAN 1", runs: 56, balls: 34, isStriker: true },
  { label: "BATSMAN 2", runs: 12, balls: 10, isStriker: false },
];

export const defaultScore = { runs: 156, wickets: 4 };
export const defaultOvers = { completed: 18, balls: 3 };
export const defaultRunRate = 8.51;
