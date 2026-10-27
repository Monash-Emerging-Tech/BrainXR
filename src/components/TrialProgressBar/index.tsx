// Floating bottom timeline for Demo Mode: 40 connected trials (baseline
// circle -> stimulus bar), and the elapsed/total readout.
import React from "react";
import type { Frame } from "../../utils/signalSource";
import TrialSegment from "./TrialSegment";
import { formatTime } from "./formatTime";

interface TrialProgressBarProps {
  trialElapsed: number; // 0 to 63
  phase: Frame["phase"];
  trialIndex: number;
  onTrialSelect: (index: number, startOffset?: number) => void;
  controls?: React.ReactNode;
}

const TOTAL_DURATION = 63;

const TrialProgressBar: React.FC<TrialProgressBarProps> = ({
  trialElapsed,
  phase,
  trialIndex,
  onTrialSelect,
  controls,
}) => (
  <div className="flex flex-col gap-2 w-full text-slate-800">
    {/* 40 Connected Trials: Circle (Baseline) -> Bar (Stimulation) */}
    <div className="flex justify-between items-center w-full gap-[2px] select-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <TrialSegment
          key={i}
          index={i}
          isActive={i === trialIndex}
          isPast={i < trialIndex}
          phase={phase}
          trialElapsed={trialElapsed}
          onTrialSelect={onTrialSelect}
        />
      ))}
    </div>

    {/* Sub-label showing current trial details, center controls, and time readout with phase tag */}
    <div className="grid grid-cols-[1fr_auto_1fr] items-center text-[11px] text-slate-500 font-semibold select-none mt-1">
      <div className="flex items-center gap-2">
        <span className="font-mono text-slate-800 font-bold whitespace-nowrap">
          Trial {(trialIndex ?? 0) + 1} of 40
        </span>
      </div>

      <div className="pointer-events-auto justify-self-center">{controls}</div>

      <div className="flex flex-col items-stretch justify-self-end gap-1 min-w-[7.5rem]">
        <span className="font-mono text-slate-700 text-center whitespace-nowrap text-xs font-semibold">
          {formatTime(trialElapsed)} / {formatTime(TOTAL_DURATION)}
        </span>
        <span className={`flex items-center justify-center gap-1.5 rounded-full w-full py-0.5 text-[9px] font-black uppercase tracking-wider border shadow-sm backdrop-blur-xl transition-all duration-300 ${
          phase === "baseline"
            ? "border-indigo-400/50 bg-slate-950/85 text-indigo-200 shadow-indigo-950/20"
            : "border-emerald-400/50 bg-slate-950/85 text-emerald-200 shadow-emerald-950/20"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            phase === "baseline"
              ? "bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse"
              : "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
          }`} />
          <span>{phase === "baseline" ? "Baseline" : "Stimulus"}</span>
        </span>
      </div>
    </div>
  </div>
);

export default TrialProgressBar;
