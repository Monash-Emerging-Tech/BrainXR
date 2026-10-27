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
        ? "flex-[30] min-w-[150px] md:min-w-[260px]"
        : "flex-[1] min-w-[10px] gap-0.5"
        }`}
    >
      {isActive ? (
        /* Unified Shape for Active Trial: Baseline Circle + Tapered Bridge + Emerald Bar */
        <div className="flex items-center w-full min-w-0 relative">
          {/* 1. Baseline Circle Component */}
          <button
            onClick={() => onTrialSelect(index, 0)}
            className={`w-4 h-4 rounded-full shrink-0 relative cursor-pointer z-20 transition-all duration-300 shadow-md ${
              phase === "baseline"
                ? "border-2 border-indigo-400 bg-slate-950/80 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                : "border border-indigo-400/70 bg-indigo-600 shadow-sm"
            }`}
            style={
              phase === "baseline"
                ? {
                    background: `linear-gradient(to right, #6366f1 ${baselinePercentage}%, rgba(2, 6, 23, 0.95) ${baselinePercentage}%)`,
                  }
                : undefined
            }
            title={`Trial ${index + 1} - Baseline (3s)`}
          >
            {phase === "baseline" && (
              <span className="absolute inset-[-4px] rounded-full bg-indigo-500/35 animate-pulse -z-10" />
            )}
          </button>

          {/* 2. Flush Tapered Neck / Bridge connecting Circle to Bar */}
          <div
            onClick={() => onTrialSelect(index, 0)}
            className={`w-2 shrink-0 relative -ml-1 -mr-1 z-10 cursor-pointer h-2.5 transition-colors duration-300 ${
              phase === "baseline"
                ? "bg-gradient-to-r from-indigo-500/80 to-slate-950/70"
                : "bg-gradient-to-r from-indigo-600 to-emerald-600/80"
            }`}
            style={{
              clipPath: "polygon(0% 0%, 100% 25%, 100% 75%, 0% 100%)",
            }}
            title={`Trial ${index + 1} - Transition`}
          />

          {/* 3. Emerald Stimulation Bar (smaller height, flush against neck) */}
          <button
            onClick={() => onTrialSelect(index, 3)}
            className="flex-grow h-2 relative cursor-pointer min-w-0 transition-all duration-300 rounded-r-full border-y border-r border-white/10 bg-slate-950/70 backdrop-blur-sm overflow-hidden hover:bg-slate-950/80"
            title={`Trial ${index + 1} - Stimulation (60s)`}
          >
            {/* Background track fill for completed baseline or progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all duration-100 ease-out rounded-r-full"
              style={{ width: `${stimulusPercentage}%` }}
            />
          </button>
        </div>
      ) : (
        /* Inactive or Past Trials: Compact circle and subtle bar */
        <>
          <button
            onClick={() => onTrialSelect(index, 0)}
            className={`rounded-full shrink-0 transition-[width,height,border-color] duration-300 relative cursor-pointer ${
              isPast
                ? "w-2.5 h-2.5 bg-indigo-600/78 border border-indigo-300/50 shadow-sm"
                : "w-2.5 h-2.5 bg-slate-950/65 border border-white/15"
            }`}
            title={`Trial ${index + 1} - Baseline (3s)`}
          />
          <button
            onClick={() => onTrialSelect(index, 3)}
            className={`flex-grow relative cursor-pointer min-w-0 transition-all duration-300 rounded-full h-[3px] ${
              isPast ? "bg-emerald-500/80" : "bg-slate-950/42"
            }`}
            title={`Trial ${index + 1} - Stimulation (60s)`}
          />
        </>
      )}
    </div>
  );
};

export default TrialSegment;
