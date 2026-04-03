import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ComponentDef } from "@/lib/componentDefs";
import CodeBlock from "./CodeBlock";

// Cricket components
import CricketGameUI from "./cricket/CricketGameUI";
import ScoreboardPanel from "./cricket/ScoreboardPanel";
import TeamHeader from "./cricket/TeamHeader";
import ScoreDisplay from "./cricket/ScoreDisplay";
import BatsmanStatsBar from "./cricket/BatsmanStatsBar";
import FieldRadar from "./cricket/FieldRadar";
import ShotSelector, { type ShotType } from "./cricket/ShotSelector";
import TimingBar from "./cricket/TimingBar";
import PowerMeter from "./cricket/PowerMeter";
import { useTimingSweep } from "@/hooks/useTimingSweep";
import { usePowerSweep } from "@/hooks/usePowerSweep";
import {
  defaultFielderPositions,
  defaultBatsmen,
  defaultScore,
  defaultOvers,
  defaultRunRate,
} from "@/lib/gameData";

import { Slider } from "@/components/ui/slider";
import { Code2, Eye, Settings2 } from "lucide-react";

interface ComponentStageProps {
  component: ComponentDef;
}

export default function ComponentStage({ component }: ComponentStageProps) {
  const [tab, setTab] = useState<"preview" | "code" | "props">("preview");
  const [selectedShot, setSelectedShot] = useState<ShotType | null>("drive");
  const [runs, setRuns] = useState(156);
  const [wickets, setWickets] = useState(4);
  const [oversCompleted, setOversCompleted] = useState(18);
  const [oversBalls, setOversBalls] = useState(3);
  const [powerLevel, setPowerLevel] = useState(65);
  const [timingPos, setTimingPos] = useState(50);
  const [radarSize, setRadarSize] = useState(160);
  const [teamA, setTeamA] = useState("INDIA");
  const [teamB, setTeamB] = useState("AUSTRALIA");

  const animatedTiming = useTimingSweep(2, component.id === "full-ui" || component.id === "timing-bar");
  const animatedPower = usePowerSweep(1.2, component.id === "full-ui" || component.id === "power-meter");

  const renderComponent = useMemo(() => {
    switch (component.id) {
      case "full-ui":
        return <CricketGameUI />;
      case "scoreboard":
        return (
          <ScoreboardPanel
            teamA={teamA}
            teamB={teamB}
            score={{ runs, wickets }}
            overs={{ completed: oversCompleted, balls: oversBalls }}
            batsmen={defaultBatsmen}
            currentRunRate={defaultRunRate}
          />
        );
      case "team-header":
        return <TeamHeader teamA={teamA} teamB={teamB} />;
      case "score-display":
        return (
          <ScoreDisplay
            score={{ runs, wickets }}
            overs={{ completed: oversCompleted, balls: oversBalls }}
          />
        );
      case "batsman-stats":
        return <BatsmanStatsBar batsmen={defaultBatsmen} currentRunRate={defaultRunRate} />;
      case "field-radar":
        return <FieldRadar positions={defaultFielderPositions} size={radarSize} />;
      case "shot-selector":
        return <ShotSelector selectedShot={selectedShot} onSelect={setSelectedShot} />;
      case "timing-bar":
        return <TimingBar position={animatedTiming} />;
      case "power-meter":
        return <PowerMeter level={animatedPower} size={160} />;
      default:
        return null;
    }
  }, [component.id, teamA, teamB, runs, wickets, oversCompleted, oversBalls, selectedShot, radarSize, animatedTiming, animatedPower]);

  const renderControls = () => {
    switch (component.id) {
      case "scoreboard":
      case "score-display":
        return (
          <div className="space-y-4">
            <ControlSlider label="Runs" value={runs} min={0} max={500} onChange={setRuns} />
            <ControlSlider label="Wickets" value={wickets} min={0} max={10} onChange={setWickets} />
            <ControlSlider label="Overs" value={oversCompleted} min={0} max={50} onChange={setOversCompleted} />
            <ControlSlider label="Balls" value={oversBalls} min={0} max={5} onChange={setOversBalls} />
            {component.id === "scoreboard" && (
              <>
                <ControlInput label="Team A" value={teamA} onChange={setTeamA} />
                <ControlInput label="Team B" value={teamB} onChange={setTeamB} />
              </>
            )}
          </div>
        );
      case "team-header":
        return (
          <div className="space-y-4">
            <ControlInput label="Team A" value={teamA} onChange={setTeamA} />
            <ControlInput label="Team B" value={teamB} onChange={setTeamB} />
          </div>
        );
      case "field-radar":
        return (
          <div className="space-y-4">
            <ControlSlider label="Size" value={radarSize} min={100} max={300} onChange={setRadarSize} />
          </div>
        );
      case "power-meter":
        return (
          <div className="space-y-4">
            <div className="text-xs text-gray-400">Power level animates automatically</div>
            <ControlSlider label="Manual Level" value={powerLevel} min={0} max={100} onChange={setPowerLevel} />
          </div>
        );
      case "timing-bar":
        return (
          <div className="space-y-4">
            <div className="text-xs text-gray-400">Cursor sweeps automatically</div>
            <ControlSlider label="Manual Position" value={timingPos} min={0} max={100} onChange={setTimingPos} />
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-500">
            This component uses default props. Interact directly with the preview.
          </div>
        );
    }
  };

  const tabs = [
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "code" as const, label: "Code", icon: Code2 },
    { id: "props" as const, label: "Controls", icon: Settings2 },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="mr-2">{component.icon}</span>
            {component.name}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{component.description}</p>
        </div>
        <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === t.id
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-gray-400 hover:text-gray-300 hover:bg-white/[0.04]"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {tab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center min-h-[300px] p-8 rounded-xl border border-white/[0.06]"
              style={{
                background: "radial-gradient(ellipse at center, rgba(34,197,94,0.03) 0%, rgba(13,17,23,0.8) 70%)",
              }}
            >
              <div className="w-full max-w-[900px]">{renderComponent}</div>
            </motion.div>
          )}
          {tab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CodeBlock code={component.code} title={`${component.name}.tsx`} language="tsx" />
              {component.props.length > 0 && (
                <div className="mt-4 rounded-lg border border-white/[0.06] overflow-hidden">
                  <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
                    <span className="text-xs font-medium text-gray-400" style={{ fontFamily: "var(--font-mono)" }}>
                      Props Interface
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="text-left px-4 py-2 text-gray-400 font-medium text-xs">Prop</th>
                          <th className="text-left px-4 py-2 text-gray-400 font-medium text-xs">Type</th>
                          <th className="text-left px-4 py-2 text-gray-400 font-medium text-xs">Default</th>
                          <th className="text-left px-4 py-2 text-gray-400 font-medium text-xs">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {component.props.map((p) => (
                          <tr key={p.name} className="border-b border-white/[0.04]">
                            <td className="px-4 py-2">
                              <code className="text-emerald-400 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                                {p.name}
                              </code>
                            </td>
                            <td className="px-4 py-2">
                              <code className="text-amber-400 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                                {p.type}
                              </code>
                            </td>
                            <td className="px-4 py-2">
                              <code className="text-gray-400 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                                {p.default}
                              </code>
                            </td>
                            <td className="px-4 py-2 text-gray-400 text-xs">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {tab === "props" && (
            <motion.div
              key="props"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div
                className="flex items-center justify-center min-h-[300px] p-6 rounded-xl border border-white/[0.06]"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(34,197,94,0.03) 0%, rgba(13,17,23,0.8) 70%)",
                }}
              >
                <div className="w-full max-w-[600px]">{renderComponent}</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3
                  className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <Settings2 className="w-4 h-4 text-emerald-400" />
                  Interactive Controls
                </h3>
                {renderControls()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper components
function ControlSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className="text-xs text-emerald-400 font-mono">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}

function ControlInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-400 block mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md bg-white/[0.06] border border-white/[0.08] text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
        style={{ fontFamily: "var(--font-mono)" }}
      />
    </div>
  );
}
