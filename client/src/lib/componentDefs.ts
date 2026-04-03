export interface ComponentDef {
  id: string;
  name: string;
  description: string;
  category: "scoreboard" | "controls" | "full";
  icon: string;
  code: string;
  props: PropDef[];
}

export interface PropDef {
  name: string;
  type: string;
  default: string;
  description: string;
}

export const componentDefs: ComponentDef[] = [
  {
    id: "full-ui",
    name: "Full Game UI",
    description: "The complete assembled cricket game interface with all components working together.",
    category: "full",
    icon: "🏏",
    code: `<CricketGameUI />

// Assembles ScoreboardPanel + ControlsPanel
// with animated timing bar and power meter`,
    props: [],
  },
  {
    id: "scoreboard",
    name: "Scoreboard Panel",
    description: "Glass-morphism card displaying team names, score, overs, and batsman statistics.",
    category: "scoreboard",
    icon: "📊",
    code: `<ScoreboardPanel
  teamA="INDIA"
  teamB="AUSTRALIA"
  score={{ runs: 156, wickets: 4 }}
  overs={{ completed: 18, balls: 3 }}
  batsmen={[
    { label: "BATSMAN 1", runs: 56, balls: 34, isStriker: true },
    { label: "BATSMAN 2", runs: 12, balls: 10, isStriker: false },
  ]}
  currentRunRate={8.51}
/>`,
    props: [
      { name: "teamA", type: "string", default: '"INDIA"', description: "Name of the batting team" },
      { name: "teamB", type: "string", default: '"AUSTRALIA"', description: "Name of the bowling team" },
      { name: "score.runs", type: "number", default: "156", description: "Total runs scored" },
      { name: "score.wickets", type: "number", default: "4", description: "Wickets fallen" },
      { name: "overs.completed", type: "number", default: "18", description: "Completed overs" },
      { name: "overs.balls", type: "number", default: "3", description: "Balls in current over" },
      { name: "currentRunRate", type: "number", default: "8.51", description: "Current run rate" },
    ],
  },
  {
    id: "team-header",
    name: "Team Header",
    description: "Displays team names with a gold VS divider. Animated entrance with staggered fade.",
    category: "scoreboard",
    icon: "⚔️",
    code: `<TeamHeader teamA="INDIA" teamB="AUSTRALIA" />`,
    props: [
      { name: "teamA", type: "string", default: '"INDIA"', description: "First team name" },
      { name: "teamB", type: "string", default: '"AUSTRALIA"', description: "Second team name" },
    ],
  },
  {
    id: "score-display",
    name: "Score Display",
    description: "Large score figure with overs count on a dark inner band. Uses tabular numerals.",
    category: "scoreboard",
    icon: "🔢",
    code: `<ScoreDisplay
  score={{ runs: 156, wickets: 4 }}
  overs={{ completed: 18, balls: 3 }}
/>`,
    props: [
      { name: "score.runs", type: "number", default: "156", description: "Runs scored" },
      { name: "score.wickets", type: "number", default: "4", description: "Wickets lost" },
      { name: "overs.completed", type: "number", default: "18", description: "Completed overs" },
      { name: "overs.balls", type: "number", default: "3", description: "Balls in current over (0-5)" },
    ],
  },
  {
    id: "batsman-stats",
    name: "Batsman Stats Bar",
    description: "Horizontal bar showing current batsmen stats and run rate.",
    category: "scoreboard",
    icon: "📈",
    code: `<BatsmanStatsBar
  batsmen={[
    { label: "BATSMAN 1", runs: 56, balls: 34, isStriker: true },
    { label: "BATSMAN 2", runs: 12, balls: 10, isStriker: false },
  ]}
  currentRunRate={8.51}
/>`,
    props: [
      { name: "batsmen", type: "BatsmanStats[]", default: "[]", description: "Array of batsman objects" },
      { name: "currentRunRate", type: "number", default: "8.51", description: "Current run rate" },
    ],
  },
  {
    id: "field-radar",
    name: "Field Radar",
    description: "SVG mini-map showing fielder positions, pitch, and boundary circles.",
    category: "controls",
    icon: "🎯",
    code: `<FieldRadar
  positions={[
    { x: 50, y: 10, type: "fielder" },
    { x: 20, y: 25, type: "fielder" },
    { x: 80, y: 25, type: "fielder" },
    { x: 48, y: 42, type: "batsman" },
    { x: 52, y: 58, type: "bowler" },
  ]}
  size={160}
/>`,
    props: [
      { name: "positions", type: "Position[]", default: "[]", description: "Array of player positions (x, y, type)" },
      { name: "size", type: "number", default: "160", description: "Diameter of the radar in pixels" },
    ],
  },
  {
    id: "shot-selector",
    name: "Shot Selector",
    description: "Five color-coded shot buttons with keyboard shortcuts (1-5) and glow effects.",
    category: "controls",
    icon: "🎮",
    code: `<ShotSelector
  selectedShot="drive"
  onSelect={(shot) => console.log(shot)}
/>`,
    props: [
      { name: "selectedShot", type: "ShotType | null", default: "null", description: "Currently selected shot" },
      { name: "onSelect", type: "(shot: ShotType) => void", default: "-", description: "Callback when a shot is selected" },
    ],
  },
  {
    id: "timing-bar",
    name: "Timing Bar",
    description: "Gradient timing strip with a sweeping cursor and sweet-spot zone.",
    category: "controls",
    icon: "⏱️",
    code: `<TimingBar position={50} />

// Use with useTimingSweep hook:
// const pos = useTimingSweep(2, true);
// <TimingBar position={pos} />`,
    props: [
      { name: "position", type: "number", default: "50", description: "Cursor position (0-100)" },
    ],
  },
  {
    id: "power-meter",
    name: "Power Meter",
    description: "SVG circular gauge with 240° arc, color segments, and animated needle.",
    category: "controls",
    icon: "⚡",
    code: `<PowerMeter level={65} size={160} />

// Use with usePowerSweep hook:
// const lvl = usePowerSweep(1.2, true);
// <PowerMeter level={lvl} />`,
    props: [
      { name: "level", type: "number", default: "65", description: "Power level (0-100)" },
      { name: "size", type: "number", default: "160", description: "Gauge diameter in pixels" },
    ],
  },
];
