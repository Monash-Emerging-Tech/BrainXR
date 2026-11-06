import React from "react";
import type { TargetTelemetryRecord } from "../types";
import { detectRoundSplitIndex } from "./detectRoundSplitIndex";
import { GraphHeader } from "./GraphHeader";
import { GraphSvgChart } from "./GraphSvgChart";
import { GraphSummaryBar } from "./GraphSummaryBar";

interface TelemetryPerformanceGraphProps {
  telemetry: TargetTelemetryRecord[];
  meanRT: number;
  medianRT?: number;
  sdRT: number;
  cv: number;
  accuracy: number;
  precision?: number;
  focusLevel: string;
  showAllTrials?: boolean;
  className?: string;
}

export const TelemetryPerformanceGraph: React.FC<TelemetryPerformanceGraphProps> = ({
  telemetry,
  meanRT,
  medianRT = 0,
  sdRT,
  cv,
  accuracy,
  precision,
  focusLevel,
  showAllTrials = false,
  className = "",
}) => {
  const data = showAllTrials ? telemetry : telemetry.slice(-35);
  const count = data.length;
  const splitIndex = detectRoundSplitIndex(data, count, showAllTrials);

  return (
    <div className={`w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 shadow-2xl font-mono text-left ${className}`}>
      <GraphHeader focusLevel={focusLevel} cv={cv} sdRT={sdRT} />

      {/* SVG Graph Viewport */}
      <div className="w-full h-44 relative my-1">
        {data && data.length > 1 ? (
          <GraphSvgChart data={data} count={count} meanRT={meanRT} sdRT={sdRT} splitIndex={splitIndex} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 italic bg-black/30 rounded-xl border border-white/10">
            <span>Collecting live response telemetry...</span>
            <span className="text-[10px] text-slate-600 mt-1">Plotting moving average, dual SD bands, and accuracy</span>
          </div>
        )}
      </div>

      <GraphSummaryBar
        meanRT={meanRT}
        medianRT={medianRT}
        sdRT={sdRT}
        cv={cv}
        accuracy={accuracy}
        precision={precision}
        count={count}
      />
    </div>
  );
};
