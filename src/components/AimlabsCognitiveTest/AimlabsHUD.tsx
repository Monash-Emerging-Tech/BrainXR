import React from "react";
import type { CognitiveRoundType } from "./types";

interface AimlabsHUDProps {
  score: number;
  accuracy: number;
  round: CognitiveRoundType;
  recentFeedback: { text: string; color: string } | null;
  isPaused?: boolean;
  onExit: () => void;
  onSkipRound?: () => void;
  onTogglePause?: () => void;
  onMenu?: () => void;
}

export const AimlabsHUD: React.FC<AimlabsHUDProps> = ({
  score,
  accuracy,
  round,
  recentFeedback,
  isPaused = false,
  onExit,
  onSkipRound,
  onTogglePause,
  onMenu,
}) => {
  const isRound1 = round === 1;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-40 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between">
        {/* Left Actions: Back, Pause, Skip, Menu */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/60 backdrop-blur-md transition-all duration-200 shadow-sm hover:border-slate-500 active:scale-95 cursor-pointer text-xs font-mono uppercase tracking-wider"
            title="Back"
          >
            <span className="text-slate-400">←</span>
            <span>Back</span>
          </button>

          {/* Pause Button [SVG only] */}
          {onTogglePause && (
            <button
              onClick={onTogglePause}
              className={`p-2.5 rounded-full border backdrop-blur-md transition-all duration-200 shadow-sm active:scale-95 cursor-pointer flex items-center justify-center ${
                isPaused
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                  : "bg-slate-900/80 text-slate-300 hover:text-white border-slate-700/60 hover:bg-slate-800 hover:border-slate-500"
              }`}
              title={isPaused ? "Resume" : "Pause"}
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>
          )}

          {/* Skip Button */}
          {onSkipRound && (
            <button
              onClick={onSkipRound}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md transition-all duration-200 shadow-sm hover:border-amber-500/50 active:scale-95 cursor-pointer text-xs font-mono uppercase tracking-wider"
              title="Skip"
            >
              <span>Skip</span>
              <span className="text-amber-400">⇥</span>
            </button>
          )}

          {/* Menu Button [Hamburger SVG] */}
          <button
            onClick={onMenu || onExit}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md transition-all duration-200 shadow-sm hover:border-slate-500 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Menu"
            aria-label="Menu"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>

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
          /* Round 1 (CPT): Green = Press, Red = Avoid */
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md shadow-2xl">
            {/* Target 1: Green Sphere -> PRESS */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-green-950/70 border border-green-400/50 shadow-[0_0_12px_rgba(34,197,94,0.2)]">
              <span className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e] animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-green-300 leading-none">GREEN SPHERE</span>
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
          /* Round 2 (SART): Red = Press, Green = Avoid */
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md shadow-2xl">
            {/* Target 1: Red Box -> PRESS */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-rose-300 leading-none">RED BOX</span>
                <span className="text-xs font-offbit uppercase font-bold text-white tracking-widest leading-tight">PRESS</span>
              </div>
            </div>

            {/* Target 2: Green Sphere -> AVOID */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-green-950/70 border border-green-400/40 opacity-80">
              <span className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-[0_0_6px_#22c55e]" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-green-300 leading-none">GREEN SPHERE</span>
                <span className="text-xs font-offbit uppercase font-bold text-green-300 tracking-widest leading-tight">DO NOT PRESS</span>
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
