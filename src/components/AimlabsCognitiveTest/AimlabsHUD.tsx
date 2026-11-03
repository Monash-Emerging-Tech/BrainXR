import React from "react";
import type { CognitiveRoundType, LiveFocusMetrics, GameStatus } from "./types";
import { AccessibilityMenu } from "../common/AccessibilityMenu";

interface AimlabsHUDProps {
  score: number;
  accuracy: number;
  round: CognitiveRoundType;
  status?: GameStatus;
  recentFeedback: { text: string; color: string } | null;
  isPaused?: boolean;
  liveFocusMetrics?: LiveFocusMetrics;
  onExit: () => void;
  onTogglePause?: () => void;
}

export const AimlabsHUD: React.FC<AimlabsHUDProps> = ({
  score,
  accuracy,
  round,
  status,
  recentFeedback,
  isPaused = false,
  liveFocusMetrics,
  onExit,
  onTogglePause,
}) => {
  const isRound1 = round === 1;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-40 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="absolute top-5 left-8 right-8 flex items-center justify-between">
        {/* Left Actions: Back, Pause */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0d0d10]/90 hover:bg-[#1a1a24] text-white border border-white/15 backdrop-blur-md transition-all duration-200 shadow-sm hover:border-white/30 active:scale-95 cursor-pointer text-xs font-mono uppercase tracking-wider"
            title="Back"
          >
            <span className="text-slate-400">←</span>
            <span>Back</span>
          </button>

          {/* Pause Button [SVG only] */}
          {onTogglePause && (
            <button
              onClick={onTogglePause}
              className={`p-2.5 rounded-lg border backdrop-blur-md transition-all duration-200 shadow-sm active:scale-95 cursor-pointer flex items-center justify-center ${
                isPaused
                  ? "bg-[#F3DA66]/20 text-[#F3DA66] border-[#F3DA66]/50 hover:bg-[#F3DA66]/30 shadow-[0_0_10px_rgba(243,218,102,0.25)]"
                  : "bg-[#0d0d10]/90 text-slate-300 hover:text-white border-white/15 hover:bg-[#1a1a24] hover:border-white/30"
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
        </div>

        {/* Right Actions & Live Telemetry Readout (Strictly: Mean, Accuracy, Precision) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Live Telemetry Pill */}
          <div className="flex items-center gap-4 px-6 py-2.5 rounded-lg bg-[#0d0d10]/90 border border-white/15 backdrop-blur-md shadow-lg text-xs font-mono">
            {/* Mean Reaction Time */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mean</span>
              <span className="font-bold text-cyan-300">
                {liveFocusMetrics && liveFocusMetrics.meanRT > 0 ? `${liveFocusMetrics.meanRT}ms` : `${score}ms`}
              </span>
            </div>

            <span className="text-white/20">|</span>

            {/* Accuracy */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Acc</span>
              <span className="font-bold text-emerald-400">{Math.round(accuracy)}%</span>
            </div>

            <span className="text-white/20">|</span>

            {/* Precision */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Prec</span>
              <span className="font-bold text-purple-300">
                {Math.round(liveFocusMetrics?.precision ?? 100)}%
              </span>
            </div>

            <span className="text-white/20">|</span>

            {/* Omission Rate */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Omit</span>
              <span className="font-bold text-rose-400">
                {Math.round(liveFocusMetrics?.omissionRate ?? 0)}%
              </span>
            </div>
          </div>

          {/* Accessibility Settings Menu */}
          <AccessibilityMenu />
        </div>
      </div>

      {/* Center Top: High-Clarity Visual Rule Cards */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
        {isRound1 ? (
          /* Round 1 (CPT): Green = Press, Red = Avoid */
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0d0d10]/90 border border-white/15 backdrop-blur-md shadow-2xl">
            {/* Target 1: Green Sphere -> PRESS */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-300 leading-none">GREEN SPHERE</span>
                <span className="text-xs font-offbit uppercase font-bold text-white tracking-widest leading-tight">PRESS</span>
              </div>
            </div>

            {/* Target 2: Red Box -> AVOID */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 opacity-80">
              <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-rose-300 leading-none">RED BOX</span>
                <span className="text-xs font-offbit uppercase font-bold text-rose-300 tracking-widest leading-tight">DO NOT PRESS</span>
              </div>
            </div>
          </div>
        ) : (
          /* Round 2 (SART): Red = Press, Green = Avoid */
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0d0d10]/90 border border-white/15 backdrop-blur-md shadow-2xl">
            {/* Target 1: Red Box -> PRESS */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-rose-300 leading-none">RED BOX</span>
                <span className="text-xs font-offbit uppercase font-bold text-white tracking-widest leading-tight">PRESS</span>
              </div>
            </div>

            {/* Target 2: Green Sphere -> AVOID */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 opacity-80">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-300 leading-none">GREEN SPHERE</span>
                <span className="text-xs font-offbit uppercase font-bold text-emerald-300 tracking-widest leading-tight">DO NOT PRESS</span>
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
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/90 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
        </div>
      </div>

      {/* Instant RT / Feedback Notification */}
      {recentFeedback && (
        <div className="absolute inset-x-0 top-1/2 mt-16 flex justify-center pointer-events-none">
          <div
            className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-[#0d0d10]/90 backdrop-blur-md border border-white/15 shadow-lg animate-fade-in"
            style={{ color: recentFeedback.color }}
          >
            {recentFeedback.text}
          </div>
        </div>
      )}

      {/* Bottom HUD: Quick Pause Hint */}
      {(!status || status === "round1" || status === "round2") && (
        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0d0d10]/80 border border-white/15 backdrop-blur-md text-xs font-mono text-slate-300 shadow-md">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/20 text-[10px] font-bold text-cyan-300 uppercase tracking-wider shadow-xs">
              ESC
            </kbd>
            <span className="text-slate-300 tracking-normal">
              {isPaused ? "press esc to resume" : "press esc to pause"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
