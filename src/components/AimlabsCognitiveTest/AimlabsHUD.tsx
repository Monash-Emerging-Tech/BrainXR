import React from "react";
import type { CognitiveRoundType } from "./types";

interface AimlabsHUDProps {
  score: number;
  accuracy: number;
  round: CognitiveRoundType;
  recentFeedback: { text: string; color: string } | null;
  onExit: () => void;
}

export const AimlabsHUD: React.FC<AimlabsHUDProps> = ({
  score,
  accuracy,
  round,
  recentFeedback,
  onExit,
}) => {
  const isRound1 = round === 1;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-40 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between">
        {/* BrainXR Style Back Button */}
        <button
          onClick={onExit}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/60 backdrop-blur-md transition-all duration-200 shadow-sm hover:border-slate-500 active:scale-95 cursor-pointer text-xs font-mono uppercase tracking-wider"
          title="Exit to EEG Dashboard"
        >
          <span className="text-slate-400">←</span>
          <span>Exit to EEG</span>
        </button>

        {/* Compact Telemetry Readout (No trials completed/remaining) */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Cumulative RT</span>
            <span className="font-bold text-white">{score} <span className="text-[10px] font-normal text-slate-400">ms</span></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Acc</span>
            <span className="font-bold text-emerald-400">{Math.round(accuracy)}%</span>
          </div>
        </div>
      </div>

      {/* Center Top: High-Clarity Visual Rule Cards */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
        {isRound1 ? (
          /* Round 1 (CPT): Cyan = Press, Red = Avoid */
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md shadow-2xl">
            {/* Target 1: Cyan Sphere -> PRESS */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-300 leading-none">CYAN SPHERE</span>
                <span className="text-xs font-offbit uppercase font-bold text-white tracking-widest leading-tight">PRESS</span>
              </div>
            </div>

            {/* Target 2: Red Box -> AVOID */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 opacity-80">
              <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-rose-300 leading-none">RED BOX</span>
                <span className="text-xs font-offbit uppercase font-bold text-rose-300 tracking-widest leading-tight">DO NOT PRESS</span>
              </div>
            </div>
          </div>
        ) : (
          /* Round 2 (SART): Red = Press, Cyan = Avoid */
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md shadow-2xl">
            {/* Target 1: Red Box -> PRESS */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-rose-300 leading-none">RED BOX</span>
                <span className="text-xs font-offbit uppercase font-bold text-white tracking-widest leading-tight">PRESS</span>
              </div>
            </div>

            {/* Target 2: Cyan Sphere -> AVOID */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 opacity-80">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-300 leading-none">CYAN SPHERE</span>
                <span className="text-xs font-offbit uppercase font-bold text-cyan-300 tracking-widest leading-tight">DO NOT PRESS</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Central Hairline Fixation Cross (+) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center w-6 h-6">
          <div className="absolute w-4 h-[1.5px] bg-white/40" />
          <div className="absolute h-4 w-[1.5px] bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/90 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
        </div>
      </div>

      {/* Instant RT / Feedback Notification */}
      {recentFeedback && (
        <div className="absolute inset-x-0 top-1/2 mt-16 flex justify-center pointer-events-none">
          <div
            className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-lg animate-fade-in"
            style={{ color: recentFeedback.color }}
          >
            {recentFeedback.text}
          </div>
        </div>
      )}
    </div>
  );
};
