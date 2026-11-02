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
  <div className="flex flex-col gap-2 w-full text-slate-800 relative">
    {/* Stationary Phase Indicator Badge anchored directly above the baseline of Trial 1 */}
    <div className="absolute -top-6 left-0 flex items-center pointer-events-none select-none z-30">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border shadow-md backdrop-blur-xl whitespace-nowrap transition-all duration-300 ${
          phase === "stimulus"
            ? "border-emerald-400/60 bg-slate-950/90 text-emerald-300 shadow-emerald-950/40"
            : "border-indigo-400/60 bg-slate-950/90 text-indigo-300 shadow-indigo-950/40"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            phase === "stimulus"
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
              : "bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse"
          }`}
        />
        {phase === "stimulus" ? "Stimulus Phase" : "Baseline Phase"}
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
      <div className="flex flex-col items-start gap-0.5">
        <span className="font-mono text-slate-800 font-bold whitespace-nowrap">
          Trial {(trialIndex ?? 0) + 1} of 40
        </span>
        <div className="flex items-center gap-1.5">
          <a
            href="https://ieeexplore.ieee.org/document/5871728/"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto text-[10px] font-mono tracking-wider uppercase text-slate-400 hover:text-indigo-600 transition-colors"
            title="DEAP Dataset (IEEE)"
          >
            DEAP Dataset
          </a>
          <a
            href="https://ieeexplore.ieee.org/document/5871728/"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-[9px] font-bold font-serif leading-none shadow-xs"
            title="Read IEEE paper on DEAP dataset (opens in new tab)"
            aria-label="DEAP Dataset IEEE Paper"
          >
            i
          </a>
        </div>
        <span className="text-[9.5px] font-mono tracking-wider text-slate-400">
          participant #7
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
