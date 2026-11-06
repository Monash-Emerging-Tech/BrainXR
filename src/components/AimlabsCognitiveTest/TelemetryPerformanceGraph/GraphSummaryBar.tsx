import React from "react";

interface GraphSummaryBarProps {
  meanRT: number;
  medianRT: number;
  sdRT: number;
  cv: number;
  accuracy: number;
  precision?: number;
  count: number;
}

export const GraphSummaryBar: React.FC<GraphSummaryBarProps> = ({ meanRT, medianRT, sdRT, cv, accuracy, precision, count }) => (
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-300 pt-2.5 border-t border-white/10">
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-500 uppercase">Mean RT:</span>
      <span className="font-bold text-cyan-400">{meanRT}ms</span>
    </div>
    {medianRT > 0 ? (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500 uppercase">Median RT:</span>
        <span className="font-bold text-purple-300">{medianRT}ms</span>
      </div>
    ) : (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500 uppercase">Trials:</span>
        <span className="font-bold text-white">{count}</span>
      </div>
    )}
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-500 uppercase">Response Time CV:</span>
      <span className="font-bold text-[#F3DA66]">
        ±{sdRT}ms {cv > 0 ? `(${cv}x)` : ""}
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-500 uppercase">Accuracy:</span>
      <span className="font-bold text-emerald-400">{Math.round(accuracy)}%</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-500 uppercase">Precision:</span>
      <span className="font-bold text-purple-300">{Math.round(precision ?? accuracy)}%</span>
    </div>
  </div>
);
