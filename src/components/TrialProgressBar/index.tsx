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
    {/* Guidance banner in EEG node region colors - elevated 3.5rem higher */}
    <div className="flex justify-center items-center w-full select-none text-center px-2 mb-14">
      <span className="eeg-node-gradient-text font-mono text-[11px] md:text-xs font-black uppercase tracking-[0.22em] leading-relaxed drop-shadow-sm">
        pinch and click nodes to explore what EEG headsets do
      </span>
    </div>

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

      <div className="justify-self-end font-mono text-slate-700 whitespace-nowrap text-xs font-semibold">
        {formatTime(trialElapsed)} / {formatTime(TOTAL_DURATION)}
      </div>
    </div>
  </div>
);

export default TrialProgressBar;
