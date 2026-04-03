interface BatsmanStats {
  label: string;
  runs: number;
  balls: number;
  isStriker: boolean;
}

interface BatsmanStatsBarProps {
  batsmen: BatsmanStats[];
  currentRunRate: number;
}

export default function BatsmanStatsBar({ batsmen, currentRunRate }: BatsmanStatsBarProps) {
  return (
    <div className="flex justify-between items-center py-3 px-1">
      {batsmen.map((b, i) => (
        <div key={i} className="text-sm">
          <span className="text-gray-400 uppercase tracking-wide">{b.label}: </span>
          <span className="text-white font-bold">
            {b.runs}{b.isStriker ? "*" : ""}
          </span>
          <span className="text-amber-400 font-medium"> ({b.balls})</span>
        </div>
      ))}
      <div className="text-sm">
        <span className="text-gray-400 uppercase tracking-wide">CRR: </span>
        <span className="text-white font-bold">{currentRunRate.toFixed(2)}</span>
      </div>
    </div>
  );
}

export type { BatsmanStats };
