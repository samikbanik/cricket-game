import { motion } from "framer-motion";
import FieldRadar, { type Position } from "./FieldRadar";
import ShotSelector, { type ShotType } from "./ShotSelector";
import TimingBar from "./TimingBar";
import PowerMeter from "./PowerMeter";

interface ControlsPanelProps {
  fielderPositions: Position[];
  selectedShot: ShotType | null;
  onShotSelect: (shot: ShotType) => void;
  powerLevel: number;
  timingPosition: number;
}

export default function ControlsPanel(props: ControlsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl p-5 border border-white/[0.08]"
      style={{ background: "rgba(34, 37, 52, 0.95)" }}
    >
      <div className="grid grid-cols-[160px_1fr_160px] items-center gap-6 max-lg:grid-cols-[1fr_1fr] max-lg:justify-items-center">
        <div className="max-lg:col-span-1">
          <FieldRadar positions={props.fielderPositions} />
        </div>
        <div className="flex flex-col gap-4 items-center max-lg:col-span-2 max-lg:order-3">
          <ShotSelector selectedShot={props.selectedShot} onSelect={props.onShotSelect} />
          <TimingBar position={props.timingPosition} />
        </div>
        <div className="max-lg:col-span-1">
          <PowerMeter level={props.powerLevel} />
        </div>
      </div>
    </motion.div>
  );
}
