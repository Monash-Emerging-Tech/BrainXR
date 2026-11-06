import React from "react";

interface GraphHeaderProps {
  focusLevel: string;
  cv: number;
  sdRT: number;
}

function focusBadgeColorFor(focusLevel: string): string {
  return focusLevel === "Optimal Focus"
    ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/40"
    : focusLevel === "Steady Focus"
    ? "text-cyan-400 bg-cyan-950/60 border-cyan-500/40"
    : focusLevel === "Variable Focus"
    ? "text-[#F3DA66] bg-[#F3DA66]/15 border-[#F3DA66]/40"
    : "text-slate-400 bg-slate-900/60 border-slate-700/40";
}

export const GraphHeader: React.FC<GraphHeaderProps> = ({ focusLevel, cv, sdRT }) => (
  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      <span className="text-xs text-white font-bold uppercase tracking-wider">Session Performance</span>
      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${focusBadgeColorFor(focusLevel)}`}>
        {focusLevel}
      </span>
      {cv > 0 && (
        <span className="text-[10px] text-[#F3DA66] bg-[#F3DA66]/15 border border-[#F3DA66]/30 px-2 py-0.5 rounded-full font-semibold">
          RT CV: {(cv * 100).toFixed(0)}% (±{sdRT}ms)
        </span>
      )}
    </div>

    {/* Legend */}
    <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] flex-wrap justify-end">
      <div className="flex items-center gap-1.5 text-cyan-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        <span>Trial RT (Hit)</span>
      </div>
      <div className="flex items-center gap-1.5 text-cyan-300">
        <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" />
        <span>Moving RT</span>
      </div>
      <div className="flex items-center gap-1.5 text-[#F3DA66]">
        <span className="w-2.5 h-2 rounded-xs bg-[#F3DA66]/40 border border-[#F3DA66]/70" />
        <span>±1.5x SD Band</span>
      </div>
      <div className="flex items-center gap-1.5 text-[#F3DA66]/80">
        <span className="w-2.5 h-0.5 border-b border-dashed border-[#F3DA66]" />
        <span>±1.5x SD Whisker</span>
      </div>
      <div className="flex items-center gap-1.5 text-emerald-300">
        <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" />
        <span>Accuracy %</span>
      </div>
      <div className="flex items-center gap-1.5 text-rose-400">
        <span className="w-2 h-2 rounded-full bg-rose-500 border border-white" />
        <span>Hit (Incorrect)</span>
      </div>
    </div>
  </div>
);
