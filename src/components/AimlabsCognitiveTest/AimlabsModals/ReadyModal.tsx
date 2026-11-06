import React from "react";
import type { CognitiveRoundType } from "../types";
import { AccessibilityMenu } from "../../common/AccessibilityMenu";
import { ModalDecorativeField } from "./ModalDecorativeField";
import { SpannedText } from "./SpannedText";
import { transitionClasses, type ScreenTransitionProps } from "./screenTransition";

interface ReadyModalProps extends ScreenTransitionProps {
  currentRound: CognitiveRoundType;
  onStartGame: () => void;
  onExit: () => void;
}

export const ReadyModal: React.FC<ReadyModalProps> = ({
  currentRound,
  onStartGame,
  onExit,
  mounted,
  isFadingOut,
  handleAction,
}) => (
  <div
    className={`absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md px-4 font-sans select-none overflow-y-auto py-6 transition-all duration-300 ease-out ${transitionClasses(mounted, isFadingOut)}`}
  >
    <ModalDecorativeField />

    <div className="relative z-10 max-w-3xl lg:max-w-4xl w-full flex flex-col items-center text-center px-6 sm:px-10 py-8 bg-[#0d0d10]/90 border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      {/* Top Tag: Focus as a Vector Quantity */}
      <div className="w-full px-4 sm:px-12 mb-1">
        <SpannedText
          text="Focus as a Vector Quantity"
          className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wider"
        />
      </div>

      {/* Rebranded Headings: BrainXR */}
      <h2 className="text-4xl sm:text-5xl font-black font-offbit uppercase tracking-wider text-white mt-1 mb-2">
        Brain<span className="text-cyan-400">XR</span>
      </h2>

      {/* Direction of Focus Description */}
      <p className="text-xs sm:text-sm text-slate-300 font-mono whitespace-nowrap mb-6">
        a cognitive assessment to track the <span className="text-cyan-300 font-semibold">direction of focus</span>.
      </p>

      {/* Side-by-Side Dual Round Cards Layout: First card is always Round 1 */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 text-left font-mono">
        {/* Card Position 1: Starting Round */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between shadow-xl ${
            currentRound === 1
              ? "border-cyan-400/40 bg-cyan-400/[0.03] ring-1 ring-cyan-400/20"
              : "border-[#F3DA66]/40 bg-[#F3DA66]/[0.03] ring-1 ring-[#F3DA66]/20"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                  currentRound === 1 ? "text-cyan-400" : "text-[#F3DA66]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    currentRound === 1 ? "bg-cyan-400" : "bg-[#F3DA66]"
                  }`}
                />
                {currentRound === 1 ? "Round 1 · CPT" : "Round 1 · SART"}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {currentRound === 1
                ? "Continuous Performance Test"
                : "Sustained Attention to Response Task"}
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-3 border-t border-white/10 text-xs">
            {currentRound === 1 ? (
              <>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span className="text-slate-200">Green Sphere</span>
                  </div>
                  <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/40 font-bold tracking-wider">
                    PRESS
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                    <span className="text-slate-300">Red Box</span>
                  </div>
                  <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                    DO NOT PRESS
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                    <span className="text-slate-200">Red Box</span>
                  </div>
                  <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/40 font-bold tracking-wider">
                    PRESS
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span className="text-slate-300">Green Sphere</span>
                  </div>
                  <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                    DO NOT PRESS
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card Position 2: Second Round */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between shadow-xl ${
            currentRound === 1
              ? "border-[#F3DA66]/30 bg-white/[0.02]"
              : "border-cyan-400/30 bg-white/[0.02]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] uppercase font-bold tracking-wider ${
                  currentRound === 1 ? "text-[#F3DA66]" : "text-cyan-400"
                }`}
              >
                {currentRound === 1 ? "Round 2 · SART" : "Round 2 · CPT"}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {currentRound === 1
                ? "Sustained Attention to Response Task"
                : "Continuous Performance Test"}
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-3 border-t border-white/10 text-xs">
            {currentRound === 1 ? (
              <>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-rose-500/80" />
                    <span className="text-slate-300">Red Box</span>
                  </div>
                  <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold tracking-wider">
                    PRESS
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400/80" />
                    <span className="text-slate-400">Green Sphere</span>
                  </div>
                  <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold tracking-wider">
                    DO NOT PRESS
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400/80" />
                    <span className="text-slate-300">Green Sphere</span>
                  </div>
                  <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold tracking-wider">
                    PRESS
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-xs bg-rose-500/80" />
                    <span className="text-slate-400">Red Box</span>
                  </div>
                  <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold tracking-wider">
                    DO NOT PRESS
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subtext info: single line with generous spacing */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 my-5 whitespace-nowrap">
        <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          1 Target at a Time
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-300">500ms flash + 700ms fixation</span>
        <span className="text-slate-600">·</span>
        <span className="text-[#F3DA66] font-medium">Stroop Effect on Instructions</span>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex items-center gap-3 w-full max-w-md">
        <button
          onClick={() => handleAction(onExit)}
          className="flex-1 py-3 px-5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-white/15"
        >
          Back
        </button>
        <button
          onClick={() => handleAction(onStartGame)}
          className="flex-2 py-3 px-6 rounded-lg bg-white text-black hover:bg-slate-200 font-offbit uppercase font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white flex items-center justify-center gap-2"
        >
          Play Now →
        </button>

        {/* Color vision accessibility menu */}
        <AccessibilityMenu
          direction="up"
          align="right"
          buttonClassName="p-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 border border-white/15 flex items-center justify-center"
        />
      </div>
    </div>
  </div>
);
