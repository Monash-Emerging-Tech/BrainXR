import React from "react";
import type { CognitiveRoundType, LiveFocusMetrics } from "../types";
import { AccessibilityMenu } from "../../common/AccessibilityMenu";
import { TelemetryPerformanceGraph } from "../TelemetryPerformanceGraph";
import { ModalDecorativeField } from "./ModalDecorativeField";
import { SpannedText } from "./SpannedText";
import { transitionClasses, type ScreenTransitionProps } from "./screenTransition";

interface PauseModalProps extends ScreenTransitionProps {
  currentRound: CognitiveRoundType;
  accuracy: number;
  soundEnabled: boolean;
  liveFocusMetrics?: LiveFocusMetrics;
  onResume?: () => void;
  onSkipRound?: () => void;
  onToggleSound?: () => void;
}

const EMPTY_LIVE_METRICS = (accuracy: number): LiveFocusMetrics => ({
  reactionTimes: [],
  meanRT: 0,
  medianRT: 0,
  sdRT: 0,
  cv: 0,
  focusLevel: "Calibrating",
  focusDescription: "Collecting baseline response times",
  boxesHit: 0,
  boxesMissed: 0,
  spheresHit: 0,
  spheresMissed: 0,
  accuracy: Math.round(accuracy),
  precision: 100,
  telemetryTable: [],
});

export const PauseModal: React.FC<PauseModalProps> = ({
  currentRound,
  accuracy,
  soundEnabled,
  liveFocusMetrics,
  onResume,
  onSkipRound,
  onToggleSound,
  mounted,
  isFadingOut,
  handleAction,
}) => {
  const isRound1 = currentRound === 1;
  const roundTitle = isRound1 ? "ROUND 1 · CPT" : "ROUND 2 · SART";
  const roundFullName = isRound1
    ? "Continuous Performance Test"
    : "Sustained Attention to Response Task";

  const m: LiveFocusMetrics = liveFocusMetrics || EMPTY_LIVE_METRICS(accuracy);

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md px-4 font-sans select-none overflow-y-auto py-5 transition-all duration-300 ease-out ${transitionClasses(mounted, isFadingOut)}`}
    >
      <ModalDecorativeField />

      <div className="relative z-10 max-w-2xl sm:max-w-3xl w-full flex flex-col items-center text-center px-6 py-6 bg-[#0d0d10]/90 border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#F3DA66]/10 px-3.5 py-1.5 text-xs font-mono tracking-wider text-[#F3DA66] border border-[#F3DA66]/30 backdrop-blur-md mb-2 uppercase font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#F3DA66] animate-pulse shadow-[0_0_8px_#F3DA66]" />
          GAME PAUSED
        </div>

        <div className="w-full px-4 mb-1">
          <SpannedText
            text="PAUSE MENU"
            className="text-white text-2xl sm:text-3xl font-black font-offbit uppercase tracking-wider"
          />
        </div>

        <p className="text-xs text-slate-400 font-mono mb-3">
          {roundTitle} · <span className="text-cyan-300">{roundFullName}</span>
        </p>

        {/* Top HUD Rule Buttons communicating stimulus rules */}
        <div className="flex items-center justify-center w-full my-2.5">
          <div className="inline-flex items-center gap-2 sm:gap-2.5 p-1.5 rounded-xl bg-[#0d0d10]/90 border border-white/15 backdrop-blur-md shadow-2xl">
            {isRound1 ? (
              <>
                {/* Target 1: Green Sphere -> PRESS */}
                <div className="flex items-center gap-2 sm:gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-300 leading-none">GREEN SPHERE</span>
                    <span className="text-xs font-offbit uppercase font-bold text-white tracking-widest leading-tight">PRESS</span>
                  </div>
                </div>

                {/* Target 2: Red Box -> AVOID */}
                <div className="flex items-center gap-2 sm:gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 opacity-80">
                  <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-rose-300 leading-none">RED BOX</span>
                    <span className="text-xs font-offbit uppercase font-bold text-rose-300 tracking-widest leading-tight">DO NOT PRESS</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Target 1: Red Box -> PRESS */}
                <div className="flex items-center gap-2 sm:gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
                  <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-rose-300 leading-none">RED BOX</span>
                    <span className="text-xs font-offbit uppercase font-bold text-white tracking-widest leading-tight">PRESS</span>
                  </div>
                </div>

                {/* Target 2: Green Sphere -> AVOID */}
                <div className="flex items-center gap-2 sm:gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 opacity-80">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-300 leading-none">GREEN SPHERE</span>
                    <span className="text-xs font-offbit uppercase font-bold text-emerald-300 tracking-widest leading-tight">DO NOT PRESS</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Unified Performance Graph (shared component) */}
        <TelemetryPerformanceGraph
          telemetry={m.telemetryTable || []}
          meanRT={m.meanRT}
          medianRT={m.medianRT}
          sdRT={m.sdRT}
          cv={m.cv}
          accuracy={m.accuracy}
          precision={m.precision}
          focusLevel={m.focusLevel}
          showAllTrials={false}
          className="my-2 border-white/10 bg-white/[0.02] rounded-xl"
        />

        {/* Settings Section: Sound & Accessibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full my-1 font-mono">
          {/* Audio Feedback */}
          <div className="bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-left backdrop-blur-md flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Audio Feedback</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Target pop synthesizers</div>
            </div>

            <button
              onClick={() => onToggleSound?.()}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold tracking-wider border transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-cyan-400/20 text-cyan-300 border-cyan-400/40 hover:bg-cyan-400/30"
                  : "bg-white/[0.06] text-slate-400 border-white/15 hover:bg-white/[0.12] hover:text-slate-200"
              }`}
            >
              {soundEnabled ? "SOUND ON" : "MUTED"}
            </button>
          </div>

          {/* Color Vision Accessibility */}
          <div className="bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-left backdrop-blur-md flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Color Vision</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Accessibility filters</div>
            </div>

            <AccessibilityMenu direction="up" align="right" />
          </div>
        </div>

        {/* Action Buttons: Back, Resume, Skip */}
        <div className="grid grid-cols-3 gap-2.5 w-full mt-3 font-mono text-xs">
          {/* Back Button */}
          <button
            onClick={() => {
              handleAction(() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              });
            }}
            className="py-3 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/15 font-mono uppercase font-bold text-xs tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          {/* Resume Button */}
          <button
            onClick={() => handleAction(() => onResume?.())}
            className="py-3 px-3 rounded-lg bg-white text-black hover:bg-slate-200 font-offbit uppercase font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white flex items-center justify-center gap-1.5"
          >
            <span>▶</span>
            <span>Resume</span>
            <span className="text-[10px] font-mono opacity-60 ml-0.5">(Esc)</span>
          </button>

          {/* Skip Button */}
          <button
            onClick={() => handleAction(() => onSkipRound?.())}
            className="py-3 px-3 rounded-lg bg-[#F3DA66]/10 hover:bg-[#F3DA66]/20 text-[#F3DA66] border border-[#F3DA66]/30 font-mono uppercase font-bold text-xs tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Skip</span>
            <span className="text-[#F3DA66]">⇥</span>
          </button>
        </div>
      </div>
    </div>
  );
};
