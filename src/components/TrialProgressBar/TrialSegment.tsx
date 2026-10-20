import React from "react";
import type { Frame } from "../../utils/signalSource";

const BASELINE_DURATION = 3;
const STIMULUS_DURATION = 60;

interface TrialSegmentProps {
  index: number;
  isActive: boolean;
  isPast: boolean;
  phase: Frame["phase"];
  trialElapsed: number;
  onTrialSelect: (index: number, startOffset?: number) => void;
}

// One trial's segment of the connected timeline: a baseline circle (3s)
// followed by a stimulus bar (60s). Only the active segment expands and
// shows live fill progress; past/future segments are compact indicators.
const TrialSegment: React.FC<TrialSegmentProps> = ({
  index,
  isActive,
  isPast,
  phase,
  trialElapsed,
  onTrialSelect,
}) => {
  const baselineProgress =
    isActive && phase === "baseline" ? Math.min(BASELINE_DURATION, Math.max(0, trialElapsed)) : 0;
  const baselinePercentage = (baselineProgress / BASELINE_DURATION) * 100;

  const stimulusProgress = isActive ? Math.max(0, trialElapsed - BASELINE_DURATION) : 0;
  const stimulusPercentage = (stimulusProgress / STIMULUS_DURATION) * 100;

  return (
    <div
      className={`flex items-center min-w-0 transition-all duration-500 ease-in-out ${isActive
        ? "flex-[30] min-w-[150px] md:min-w-[260px] gap-2"
        : "flex-[1] min-w-[10px]"
        }`}
    >
      <button
        onClick={() => onTrialSelect(index, 0)}
        className={`rounded-full shrink-0 transition-[width,height,border-color,box-shadow] duration-300 relative cursor-pointer z-10 ${
          isActive
            ? "w-4 h-4 shadow-md " +
              (phase === "baseline"
                ? "border-2 border-indigo-400/80 bg-slate-950/72 backdrop-blur-md"
                : "border border-indigo-300/60 bg-indigo-600/78 backdrop-blur-md")
            : isPast
              ? "w-2.5 h-2.5 bg-indigo-600/78 border border-indigo-300/50 shadow-sm backdrop-blur-sm"
              : "w-2.5 h-2.5 bg-slate-950/65 border border-white/15 backdrop-blur-sm"
        }`}
        style={
          isActive && phase === "baseline"
            ? {
                background: `linear-gradient(to right, #4f46e5 ${baselinePercentage}%, rgba(2, 6, 23, 0.95) ${baselinePercentage}%)`,
              }
            : undefined
        }
        title={`Trial ${index + 1} - Baseline (3s)`}
      >
        {isActive && phase === "baseline" && (
          <span className="absolute inset-[-4px] rounded-full bg-indigo-500/30 animate-pulse" />
        )}
      </button>

      <button
        onClick={() => onTrialSelect(index, 3)}
        className={`flex-grow relative cursor-pointer min-w-0 transition-all duration-300 rounded-full ${isActive
          ? "h-2 border border-white/10 bg-slate-950/68 backdrop-blur-sm hover:bg-slate-950/78"
          : "h-[3px] " + (isPast ? "bg-emerald-500/80" : "bg-slate-950/42")
          }`}
        title={`Trial ${index + 1} - Stimulation (60s)`}
      >
        {isActive && (
          <div
            className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all duration-100 ease-out rounded-full"
            style={{ width: `${stimulusPercentage}%` }}
          />
        )}
      </button>
    </div>
  );
};

export default TrialSegment;
