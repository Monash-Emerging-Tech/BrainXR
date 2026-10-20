import React from "react";
import type { Frame } from "../../utils/signalSource";

interface PhaseIndicatorProps {
  isDemo: boolean;
  phase: Frame["phase"];
}

// Centered "Baseline / Stimulus Phase" pill, shown only in Demo Mode.
const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ isDemo, phase }) => (
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex justify-center">
    {isDemo && (
      <div className={`flex items-center gap-1.5 rounded-full border bg-slate-950/68 px-3 py-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-300 md:gap-2 md:px-4 md:py-2 ${phase === "baseline" ? "border-indigo-300/35" : "border-emerald-300/35"}`}>
        <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${phase === "baseline"
          ? "bg-indigo-500 shadow-[0_0_10px_#6366f1]"
          : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
          } animate-pulse`} />
        <span className={`text-[9px] md:text-xs font-black tracking-[0.1em] md:tracking-[0.2em] uppercase transition-all duration-300 ${phase === "baseline" ? "text-indigo-400" : "text-emerald-400"
          }`}>
          {phase === "baseline" ? "Baseline" : "Stimulus"}
          <span className="hidden sm:inline"> Phase</span>
        </span>
      </div>
    )}
  </div>
);

export default PhaseIndicator;
