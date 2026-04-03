import { useState } from "react";
import ScoreboardPanel from "./ScoreboardPanel";
import ControlsPanel from "./ControlsPanel";
import type { ShotType } from "./ShotSelector";
import { useTimingSweep } from "@/hooks/useTimingSweep";
import { usePowerSweep } from "@/hooks/usePowerSweep";
import {
  defaultFielderPositions,
  defaultBatsmen,
  defaultScore,
  defaultOvers,
  defaultRunRate,
} from "@/lib/gameData";

export default function CricketGameUI() {
  const [selectedShot, setSelectedShot] = useState<ShotType | null>(null);
  const timingPosition = useTimingSweep(2, true);
  const powerLevel = usePowerSweep(1.2, true);

  return (
    <div className="flex flex-col gap-4 w-full max-w-[1280px] mx-auto">
      <ScoreboardPanel
        teamA="TEAM A"
        teamB="TEAM B"
        score={defaultScore}
        overs={defaultOvers}
        batsmen={defaultBatsmen}
        currentRunRate={defaultRunRate}
      />
      <ControlsPanel
        fielderPositions={defaultFielderPositions}
        selectedShot={selectedShot}
        onShotSelect={setSelectedShot}
        powerLevel={powerLevel}
        timingPosition={timingPosition}
      />
    </div>
  );
}
