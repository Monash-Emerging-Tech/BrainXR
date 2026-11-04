import React, { useState, useEffect } from "react";
import type { GameStatus, RoundMetrics, CognitiveRoundType, LiveFocusMetrics } from "./types";
import { AccessibilityMenu } from "../common/AccessibilityMenu";
import {
  loadLastSessionReport,
  FOCUS_CLASSIFICATION_INFO,
} from "./reportStorage";
import { TelemetryPerformanceGraph } from "./TelemetryPerformanceGraph";

interface SpannedTextProps {
  text: string;
  className?: string;
}

const SpannedText: React.FC<SpannedTextProps> = ({ text, className = "" }) => (
  <div className={`flex justify-between w-full font-offbit uppercase tracking-normal select-none ${className}`}>
    {text.split("").map((char, index) => (
      <span key={index}>{char === " " ? " " : char}</span>
    ))}
  </div>
);

// Floating portal tiles & cyber wireframe elements around the viewport perimeter matching the new 3D portal aesthetics
const ModalDecorativeField: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Ambient background vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.04)_0%,rgba(13,13,16,0)_75%)]" />

      {/* ================= CORNER TELEMETRY & CROSSHAIRS ================= */}
      {/* Top-Left Telemetry Bracket */}
      <div className="absolute top-6 left-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
        <span className="text-cyan-400/80 font-bold font-offbit text-xs">+</span>
        <span>SYS // PORTAL_MATRIX</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Top-Right Telemetry Bracket */}
      <div className="absolute top-6 right-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
        <span>ASPECT: 16:9 // 120M</span>
        <span className="text-purple-400/80 font-bold font-offbit text-xs">[+]</span>
      </div>

      {/* Bottom-Left Telemetry Bracket */}
      <div className="absolute bottom-6 left-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
        <span className="text-rose-400/80 font-bold font-offbit text-xs">+</span>
        <span>GRID_Z: INFINITE_LOOP</span>
      </div>

      {/* Bottom-Right Telemetry Bracket */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
        <span>MNET // BRAINXR_CORE</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      {/* ================= LEFT EDGE PORTAL TILES ================= */}
      {/* Top-Left: Large White Portal Tile */}
      <div
        className="absolute -top-6 -left-8 w-44 h-32 rounded-lg border border-white/20 bg-white/[0.04] backdrop-blur-xs shadow-[0_0_25px_rgba(255,255,255,0.08)] transform -rotate-12 skew-y-3 animate-pulse opacity-70"
        style={{ animationDuration: "7s" }}
      >
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/40" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/40" />
      </div>

      {/* Top-Left: Emerald Accent Tile */}
      <div
        className="absolute top-32 left-6 w-24 h-20 rounded-md border border-emerald-400/40 bg-emerald-400/[0.08] shadow-[0_0_20px_rgba(52,211,153,0.22)] transform rotate-15 -skew-x-6 animate-bounce opacity-65"
        style={{ animationDuration: "8.5s" }}
      >
        <span className="absolute top-1.5 right-2 font-mono text-[8px] text-emerald-400/70 tracking-tighter">EMR // 01</span>
      </div>

      {/* Mid-Left: Soft White Wireframe Tile */}
      <div
        className="absolute top-1/2 -left-6 -translate-y-1/2 w-32 h-24 rounded-lg border border-white/25 bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.06)] transform -rotate-6 animate-pulse opacity-60"
        style={{ animationDuration: "6s" }}
      />

      {/* Mid-Left Lower: Purple Accent Tile */}
      <div
        className="absolute top-[64%] left-10 w-28 h-20 rounded-md border border-purple-400/40 bg-purple-400/[0.08] shadow-[0_0_22px_rgba(192,132,252,0.22)] transform -rotate-15 skew-y-3 animate-pulse opacity-65"
        style={{ animationDuration: "7.2s" }}
      >
        <span className="absolute bottom-1.5 left-2 font-mono text-[8px] text-purple-400/70 tracking-tighter">PRP // 02</span>
      </div>

      {/* Bottom-Left: Large White Glowing Tile */}
      <div
        className="absolute bottom-10 -left-6 w-48 h-32 rounded-lg border border-white/30 bg-white/[0.06] shadow-[0_0_30px_rgba(255,255,255,0.12)] transform rotate-18 animate-bounce opacity-70"
        style={{ animationDuration: "9s" }}
      >
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/50" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/50" />
      </div>

      {/* Bottom-Left Outer: Cyan Accent Tile */}
      <div
        className="absolute -bottom-8 left-36 w-32 h-20 rounded-md border border-cyan-400/40 bg-cyan-400/[0.08] shadow-[0_0_20px_rgba(34,211,238,0.22)] transform -rotate-8 animate-pulse opacity-60"
        style={{ animationDuration: "7.8s" }}
      >
        <span className="absolute top-1.5 left-2 font-mono text-[8px] text-cyan-400/70 tracking-tighter">CYN // 03</span>
      </div>

      {/* ================= RIGHT EDGE PORTAL TILES ================= */}
      {/* Top-Right: Large White Portal Tile */}
      <div
        className="absolute -top-8 -right-6 w-52 h-36 rounded-lg border border-white/25 bg-white/[0.05] shadow-[0_0_30px_rgba(255,255,255,0.1)] transform rotate-12 -skew-y-3 animate-pulse opacity-70"
        style={{ animationDuration: "7.5s" }}
      >
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/40" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/40" />
      </div>

      {/* Top-Right: Cyan Accent Tile */}
      <div
        className="absolute top-32 right-8 w-28 h-20 rounded-md border border-cyan-400/40 bg-cyan-400/[0.08] shadow-[0_0_22px_rgba(34,211,238,0.25)] transform -rotate-15 skew-x-6 animate-bounce opacity-65"
        style={{ animationDuration: "8s" }}
      >
        <span className="absolute top-1.5 right-2 font-mono text-[8px] text-cyan-400/70 tracking-tighter">CYN // 04</span>
      </div>

      {/* Mid-Right: Red Accent Tile */}
      <div
        className="absolute top-1/2 -right-6 -translate-y-1/2 w-36 h-24 rounded-lg border border-rose-400/40 bg-rose-400/[0.08] shadow-[0_0_24px_rgba(244,63,94,0.24)] transform rotate-12 animate-pulse opacity-65"
        style={{ animationDuration: "6.8s" }}
      >
        <span className="absolute bottom-1.5 right-2 font-mono text-[8px] text-rose-400/70 tracking-tighter">RED // 05</span>
      </div>

      {/* Mid-Right Lower: White Floating Tile */}
      <div
        className="absolute top-[65%] right-10 w-24 h-18 rounded-md border border-white/20 bg-white/[0.04] shadow-[0_0_18px_rgba(255,255,255,0.06)] transform -rotate-6 animate-bounce opacity-55"
        style={{ animationDuration: "8.8s" }}
      />

      {/* Bottom-Right: Large Emerald Accent Tile */}
      <div
        className="absolute -bottom-8 -right-8 w-56 h-36 rounded-lg border border-emerald-400/40 bg-emerald-400/[0.07] shadow-[0_0_35px_rgba(52,211,153,0.2)] transform -rotate-12 animate-pulse opacity-70"
        style={{ animationDuration: "8.2s" }}
      >
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-emerald-400/50" />
        <span className="absolute bottom-2 right-3 font-mono text-[8px] text-emerald-400/70 tracking-tighter">EMR // 06</span>
      </div>

      {/* Bottom-Right Inner: Purple Floating Tile */}
      <div
        className="absolute bottom-28 right-32 w-24 h-18 rounded-md border border-purple-400/40 bg-purple-400/[0.08] shadow-[0_0_20px_rgba(192,132,252,0.2)] transform rotate-18 animate-bounce opacity-60"
        style={{ animationDuration: "9.5s" }}
      >
        <span className="absolute top-1.5 left-2 font-mono text-[8px] text-purple-400/70 tracking-tighter">PRP // 07</span>
      </div>
    </div>
  );
};

interface AimlabsModalsProps {
  status: GameStatus;
  countdown: number;
  currentRound: CognitiveRoundType;
  round1Metrics: RoundMetrics | null;
  round2Metrics: RoundMetrics | null;
  isPaused?: boolean;
  score?: number;
  accuracy?: number;
  soundEnabled?: boolean;
  liveFocusMetrics?: LiveFocusMetrics;
  onStartGame: () => void;
  onStartRound2: () => void;
  onRestart: () => void;
  onExit: () => void;
  onResume?: () => void;
  onSkipRound?: () => void;
  onToggleSound?: () => void;
}

export const AimlabsModals: React.FC<AimlabsModalsProps> = ({
  status,
  countdown,
  currentRound,
  round1Metrics,
  round2Metrics,
  isPaused = false,
  score = 0,
  accuracy = 100,
  soundEnabled = true,
  liveFocusMetrics,
  onStartGame,
  onStartRound2,
  onRestart,
  onExit,
  onResume,
  onSkipRound,
  onToggleSound,
}) => {
  // Fade in / fade out transition state
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sequential screen state for intermission: Screen 1 = Telemetry Report, Screen 2 = Round 2 Rules
  const [intermissionStep, setIntermissionStep] = useState<"telemetry" | "rules">("telemetry");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, [status]);

  useEffect(() => {
    // Reset to telemetry screen whenever status enters intermission
    setIntermissionStep("telemetry");
  }, [status]);

  const handleAction = (callback: () => void) => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsFadingOut(false);
      callback();
    }, 280);
  };

  // Countdown overlay
  if (status === "countdown") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md pointer-events-none select-none transition-opacity duration-300">
        <div className="flex flex-col items-center">
          <div className="text-8xl md:text-9xl font-offbit text-white tracking-widest drop-shadow-[0_0_24px_rgba(34,211,238,0.5)]">
            {countdown > 0 ? countdown : "GO"}
          </div>
          <div className="mt-4 text-xs font-mono uppercase tracking-[0.25em] text-cyan-400">
            Fixate center cross
          </div>
        </div>
      </div>
    );
  }

  // Initial Rules Modal
  if (status === "ready") {
    return (
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md px-4 font-sans select-none overflow-y-auto py-6 transition-all duration-300 ease-out ${
          mounted && !isFadingOut
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-[0.98] pointer-events-none"
        }`}
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
  }

  // Intermission Screen (2 sequential screens: Screen 1 = Telemetry Report, Screen 2 = Round 2 Rules)
  // Intermission always occurs after Round 1 and transitions into Round 2.
  // If round1Metrics exists, Round 1 was CPT, so the upcoming Round 2 is SART.
  // If round2Metrics exists, Round 1 was SART, so the upcoming Round 2 is CPT.
  if (status === "intermission" && (round1Metrics || round2Metrics)) {
    const prevMetrics = round1Metrics || round2Metrics!;
    const isNextSART = Boolean(round1Metrics);
    const nextRoundName = isNextSART ? "Round 2 (SART)" : "Round 2 (CPT)";
    const nextRoundTag = isNextSART ? "ROUND 2 · SART" : "ROUND 2 · CPT";
    const completedRoundName = "ROUND 1 COMPLETE";
    const completedParadigm = isNextSART ? "CPT" : "SART";

    return (
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md px-4 font-sans select-none overflow-y-auto py-6 transition-all duration-300 ease-out ${
          mounted && !isFadingOut
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-[0.98] pointer-events-none"
        }`}
      >
        <ModalDecorativeField />

        <div className="relative z-10 max-w-2xl sm:max-w-3xl w-full flex flex-col items-center text-center px-6 sm:px-8 py-7 bg-[#0d0d10]/90 border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {intermissionStep === "telemetry" ? (
            /* ================= SCREEN 1: ROUND 1 TELEMETRY REPORT ================= */
            <>
              <div className="inline-flex items-center gap-2 rounded-md bg-[#F3DA66]/10 px-3.5 py-1 text-xs font-mono tracking-wider text-[#F3DA66] border border-[#F3DA66]/30 backdrop-blur-md mb-2 uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F3DA66] animate-pulse" />
                {completedRoundName}
              </div>

              <div className="w-full px-4 mb-1">
                <SpannedText
                  text="TELEMETRY REPORT"
                  className="text-white text-2xl sm:text-3xl font-bold"
                />
              </div>

              <p className="text-xs text-slate-400 font-mono mb-4">
                Round 1 ({completedParadigm}) response profile & intra-individual latency distribution
              </p>

              {/* Simplified Action & Result Summary Table (2 Columns: User Action, Result) */}
              <div className="w-full bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden my-3 text-xs font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.05] text-slate-400 border-b border-white/10 text-[11px]">
                      <th className="py-2.5 px-4 font-semibold uppercase">User Action</th>
                      <th className="py-2.5 px-4 font-semibold uppercase">Result</th>
                      <th className="py-2.5 px-4 text-right font-semibold uppercase">Trials</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-2 px-4 text-white font-medium">Hit</td>
                      <td className="py-2 px-4 text-emerald-400 font-bold">Correct</td>
                      <td className="py-2 px-4 text-right font-bold text-white font-offbit text-sm">{prevMetrics.goHits}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-white font-medium">Hit</td>
                      <td className="py-2 px-4 text-rose-400 font-bold">Incorrect</td>
                      <td className="py-2 px-4 text-right font-bold text-rose-400 font-offbit text-sm">{prevMetrics.commissions}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-white font-medium">Avoided</td>
                      <td className="py-2 px-4 text-emerald-400 font-bold">Correct</td>
                      <td className="py-2 px-4 text-right font-bold text-emerald-400 font-offbit text-sm">{prevMetrics.correctRejections}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-white font-medium">Avoided</td>
                      <td className="py-2 px-4 text-rose-400 font-bold">Incorrect</td>
                      <td className="py-2 px-4 text-right font-bold text-rose-400 font-offbit text-sm">{prevMetrics.omissions}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Timing, Accuracy & Precision Metrics */}
              {(() => {
                const prevGo = (prevMetrics.goHits || 0) + (prevMetrics.omissions || 0);
                const prevOmissionRate =
                  prevMetrics.omissionRate ??
                  (prevGo > 0 ? Math.round(((prevMetrics.omissions || 0) / prevGo) * 100) : 0);
                return (
                  <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 my-2 text-center font-mono">
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Mean RT</div>
                      <div className="text-xl font-bold text-cyan-300 font-offbit mt-0.5">
                        {Math.round(prevMetrics.meanReactionTime)}ms
                      </div>
                    </div>

                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Response Time CV</div>
                      <div className="text-xl font-bold text-[#F3DA66] font-offbit mt-0.5">
                        {prevMetrics.cv ? `${prevMetrics.cv}x` : "--"}
                      </div>
                    </div>

                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                      <div className="text-xl font-bold text-emerald-400 font-offbit mt-0.5">
                        {Math.round(prevMetrics.accuracy)}%
                      </div>
                    </div>

                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Precision</div>
                      <div className="text-xl font-bold text-indigo-300 font-offbit mt-0.5">
                        {Math.round(prevMetrics.precision ?? 100)}%
                      </div>
                    </div>

                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Omission Rate</div>
                      <div className="text-xl font-bold text-rose-400 font-offbit mt-0.5">
                        {prevOmissionRate}%
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Informational Callout: Report Available at End */}
              <div className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-400/30 text-cyan-200 text-xs font-mono my-3 text-left">
                <span className="text-lg flex-shrink-0">📊</span>
                <span className="leading-relaxed">
                  Your complete cognitive performance report with full trial telemetry graphs can be <strong>viewed & downloaded</strong> at the end of the session.
                </span>
              </div>

              {/* Single Next Button -> Transitions to Screen 2 */}
              <button
                onClick={() => setIntermissionStep("rules")}
                className="w-full mt-2 py-3.5 px-6 rounded-lg bg-white text-black hover:bg-slate-200 font-offbit uppercase font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white flex items-center justify-center gap-2"
              >
                <span>Next: Review {nextRoundName} Rules</span>
                <span>→</span>
              </button>
            </>
          ) : (
            /* ================= SCREEN 2: ROUND 2 RULES ================= */
            <>
              <div
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1 text-xs font-mono tracking-wider backdrop-blur-md mb-2 uppercase font-semibold border ${
                  isNextSART
                    ? "bg-rose-400/10 text-rose-300 border-rose-400/30"
                    : "bg-cyan-400/10 text-cyan-300 border-cyan-400/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isNextSART ? "bg-rose-400" : "bg-cyan-400"
                  }`}
                />
                {nextRoundTag}
              </div>

              <div className="w-full px-4 mb-1">
                <SpannedText
                  text="RULE REVERSAL"
                  className="text-white text-2xl sm:text-3xl font-bold"
                />
              </div>

              <p className="text-xs text-slate-400 font-mono mb-4">
                {isNextSART
                  ? "Sustained Attention to Response Task (SART)"
                  : "Continuous Performance Test (CPT)"}
              </p>

              {/* Rule Reversal Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-left font-mono">
                {isNextSART ? (
                  <>
                    {/* Red Box -> PRESS */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                        <div>
                          <div className="text-[10px] text-rose-300 uppercase font-semibold">Target Stimulus</div>
                          <div className="text-white font-bold text-sm">Red Box</div>
                        </div>
                      </div>
                      <span className="font-offbit text-xs uppercase px-3 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/50 font-bold tracking-wider">
                        PRESS
                      </span>
                    </div>

                    {/* Green Sphere -> DO NOT PRESS */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        <div>
                          <div className="text-[10px] text-emerald-300 uppercase font-semibold">Inhibitory Distractor</div>
                          <div className="text-slate-300 font-bold text-sm">Green Sphere</div>
                        </div>
                      </div>
                      <span className="font-offbit text-xs uppercase px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                        DO NOT PRESS
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Green Sphere -> PRESS */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        <div>
                          <div className="text-[10px] text-emerald-300 uppercase font-semibold">Target Stimulus</div>
                          <div className="text-white font-bold text-sm">Green Sphere</div>
                        </div>
                      </div>
                      <span className="font-offbit text-xs uppercase px-3 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/50 font-bold tracking-wider">
                        PRESS
                      </span>
                    </div>

                    {/* Red Box -> DO NOT PRESS */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                        <div>
                          <div className="text-[10px] text-rose-300 uppercase font-semibold">Inhibitory Distractor</div>
                          <div className="text-slate-300 font-bold text-sm">Red Box</div>
                        </div>
                      </div>
                      <span className="font-offbit text-xs uppercase px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                        DO NOT PRESS
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Subtext info: single line without squeezing */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 my-4 whitespace-nowrap">
                <span className="text-cyan-300 font-medium">1 Target at a Time</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">500ms flash + 700ms fixation</span>
                <span className="text-slate-600">·</span>
                <span className="text-[#F3DA66] font-medium">Stroop Effect on Instructions</span>
              </div>

              {/* Navigation Buttons: Back to Telemetry and Start Round */}
              <div className="flex items-center gap-3 w-full mt-2 font-mono text-xs">
                <button
                  onClick={() => setIntermissionStep("telemetry")}
                  className="flex-1 py-3 px-5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-white/15"
                >
                  ← Back
                </button>
                <button
                  onClick={() => handleAction(onStartRound2)}
                  className="flex-2 py-3 px-6 rounded-lg bg-white text-black hover:bg-slate-200 font-offbit uppercase font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white flex items-center justify-center gap-2"
                >
                  Start {nextRoundName} →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Final Finished Screen
  if (status === "finished" && round1Metrics && round2Metrics) {
    const allRts = [...round1Metrics.reactionTimes, ...round2Metrics.reactionTimes];
    const overallMeanRT =
      allRts.length > 0 ? Math.round(allRts.reduce((a, b) => a + b, 0) / allRts.length) : 0;
    const overallVariance =
      allRts.length > 1
        ? allRts.reduce((sum, v) => sum + Math.pow(v - overallMeanRT, 2), 0) / (allRts.length - 1)
        : 0;
    const overallSdRT = Math.round(Math.sqrt(overallVariance));
    const overallCv = overallMeanRT > 0 ? parseFloat((overallSdRT / overallMeanRT).toFixed(2)) : 0;
    const overallAccuracy = Math.round((round1Metrics.accuracy + round2Metrics.accuracy) / 2);

    const totalGo = round1Metrics.goHits + round2Metrics.goHits;
    const totalCommissions = round1Metrics.commissions + round2Metrics.commissions;
    const totalPresses = totalGo + totalCommissions;
    const overallPrecision =
      totalPresses > 0 ? Math.min(100, Math.max(0, Math.round((totalGo / totalPresses) * 100))) : 0;

    const totalOmissions = round1Metrics.omissions + round2Metrics.omissions;
    const totalGoTargets = totalGo + totalOmissions;
    const overallRecall = totalGoTargets > 0 ? (totalGo / totalGoTargets) * 100 : 100;
    const overallOmissionRate = totalGoTargets > 0 ? Math.round((totalOmissions / totalGoTargets) * 100) : 0;
    const r1Go = round1Metrics.goHits + round1Metrics.omissions;
    const round1OmissionRate =
      round1Metrics.omissionRate ??
      (r1Go > 0 ? Math.round((round1Metrics.omissions / r1Go) * 100) : 0);
    const r2Go = round2Metrics.goHits + round2Metrics.omissions;
    const round2OmissionRate =
      round2Metrics.omissionRate ??
      (r2Go > 0 ? Math.round((round2Metrics.omissions / r2Go) * 100) : 0);
    const totalNoGo = round1Metrics.correctRejections + round2Metrics.correctRejections + totalCommissions;
    const overallSpecificity =
      totalNoGo > 0 ? ((round1Metrics.correctRejections + round2Metrics.correctRejections) / totalNoGo) * 100 : 100;
    const overallBalancedAcc = (overallRecall + overallSpecificity) / 2;

    let overallClassification: "Optimal Focus" | "Steady Focus" | "Variable Focus" = "Steady Focus";
    let diagnosticTrigger = "";

    if (
      overallRecall < 80 ||
      overallPrecision < 70 ||
      overallAccuracy < 75 ||
      overallBalancedAcc < 70 ||
      overallCv > 0.28 ||
      overallCv === 0
    ) {
      overallClassification = "Variable Focus";
      if (overallRecall < 80) {
        diagnosticTrigger = `Target misses exceeded baseline threshold (${overallOmissionRate}% misses)`;
      } else if (overallPrecision < 70) {
        diagnosticTrigger = `Response precision below threshold (${overallPrecision}%)`;
      } else if (overallAccuracy < 75) {
        diagnosticTrigger = `Overall accuracy below target (${overallAccuracy}%)`;
      } else {
        diagnosticTrigger = `Reaction time variability elevated (RT CV ${overallCv}x)`;
      }
    } else if (
      overallCv > 0 &&
      overallCv <= 0.18 &&
      overallAccuracy >= 88 &&
      overallPrecision >= 85 &&
      overallRecall >= 90 &&
      allRts.length >= 15
    ) {
      overallClassification = "Optimal Focus";
      diagnosticTrigger = `High response consistency and high accuracy across both rounds`;
    } else {
      overallClassification = "Steady Focus";
      diagnosticTrigger = `Consistent sensorimotor baseline response times`;
    }

    const classMeta =
      overallClassification === "Optimal Focus"
        ? FOCUS_CLASSIFICATION_INFO.optimal
        : overallClassification === "Steady Focus"
        ? FOCUS_CLASSIFICATION_INFO.steady
        : FOCUS_CLASSIFICATION_INFO.variable;

    const fullTelemetry = [
      ...(round1Metrics.telemetryTable || []),
      ...(round2Metrics.telemetryTable || []),
    ];

    return (
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md px-4 font-sans select-none overflow-y-auto py-8 transition-all duration-300 ease-out ${
          mounted && !isFadingOut
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-[0.98] pointer-events-none"
        }`}
      >
        <ModalDecorativeField />

        <div className="relative z-10 max-w-3xl lg:max-w-4xl w-full flex flex-col items-center px-6 sm:px-10 py-8 bg-[#0d0d10]/90 border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* Eyebrow badge: Renamed to SESSION COMPLETE */}
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3.5 py-1.5 text-xs font-mono tracking-wider text-emerald-400 border border-emerald-400/30 backdrop-blur-md mb-2 uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            SESSION COMPLETE
          </div>

          <div className="w-full px-4 mb-2 text-center">
            <SpannedText
              text="COGNITIVE REPORT"
              className="text-white text-2xl sm:text-3xl md:text-4xl font-black font-offbit uppercase tracking-wider"
            />
          </div>

          {/* Hero Row: Focus Classification replaces Composite Score */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 my-2 font-mono">
            {/* Focus Classification */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Focus Classification</span>
              <div className={`mt-1 px-3.5 py-1 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-1.5 ${classMeta.badge}`}>
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    overallClassification === "Optimal Focus"
                      ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                      : overallClassification === "Steady Focus"
                      ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                      : "bg-[#F3DA66] shadow-[0_0_8px_#F3DA66]"
                  }`}
                />
                <span>{overallClassification}</span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-white/10" />

            {/* Mean RT */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mean Reaction Time</span>
              <span className="text-2xl sm:text-3xl font-bold text-cyan-300 font-offbit mt-0.5">{overallMeanRT}ms</span>
            </div>

            <div className="hidden sm:block h-8 w-px bg-white/10" />

            {/* Overall Accuracy */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Overall Accuracy</span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-offbit mt-0.5">{overallAccuracy}%</span>
            </div>

            <div className="hidden sm:block h-8 w-px bg-white/10" />

            {/* Overall Precision */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Overall Precision</span>
              <span className="text-2xl sm:text-3xl font-bold text-purple-300 font-offbit mt-0.5">{overallPrecision}%</span>
            </div>

            <div className="hidden sm:block h-8 w-px bg-white/10" />

            {/* Overall Omission Rate */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Omission Rate</span>
              <span className="text-2xl sm:text-3xl font-bold text-rose-400 font-offbit mt-0.5">{overallOmissionRate}%</span>
            </div>
          </div>

          {/* Unified Performance Graph from Pause Menu */}
          <TelemetryPerformanceGraph
            telemetry={fullTelemetry.length > 0 ? fullTelemetry : liveFocusMetrics?.telemetryTable || []}
            meanRT={overallMeanRT}
            sdRT={overallSdRT}
            cv={overallCv}
            accuracy={overallAccuracy}
            precision={overallPrecision}
            focusLevel={overallClassification}
            showAllTrials={true}
            className="my-3 border-white/10 bg-white/[0.02] rounded-xl"
          />

          {/* Comparison Table: Executive Performance Metrics */}
          <div className="w-full bg-white/[0.03] rounded-xl border border-white/10 overflow-hidden my-2 text-xs font-mono">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.04] text-slate-400 border-b border-white/10 text-[11px]">
                  <th className="p-2.5 pl-4 uppercase font-semibold">Cognitive Metric</th>
                  <th className="p-2.5 text-center text-cyan-400 uppercase font-semibold">Round 1 (CPT)</th>
                  <th className="p-2.5 text-center text-[#F3DA66] uppercase font-semibold">Round 2 (SART)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="p-2.5 pl-4 text-slate-300 font-semibold">Mean Reaction Time</td>
                  <td className="p-2.5 text-center text-cyan-300 font-bold">{Math.round(round1Metrics.meanReactionTime)} ms</td>
                  <td className="p-2.5 text-center text-cyan-300 font-bold">{Math.round(round2Metrics.meanReactionTime)} ms</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-4 text-slate-300 font-semibold">Response Time Coefficient of Variation (CV)</td>
                  <td className="p-2.5 text-center font-bold text-[#F3DA66]">
                    {round1Metrics.cv ? `${round1Metrics.cv}x` : "--"} {round1Metrics.sdReactionTime ? `(±${round1Metrics.sdReactionTime}ms)` : ""}
                  </td>
                  <td className="p-2.5 text-center font-bold text-[#F3DA66]">
                    {round2Metrics.cv ? `${round2Metrics.cv}x` : "--"} {round2Metrics.sdReactionTime ? `(±${round2Metrics.sdReactionTime}ms)` : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-4 text-slate-300 font-semibold">Accuracy</td>
                  <td className="p-2.5 text-center font-bold text-emerald-300">{Math.round(round1Metrics.accuracy)}%</td>
                  <td className="p-2.5 text-center font-bold text-emerald-300">{Math.round(round2Metrics.accuracy)}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-4 text-slate-300 font-semibold">Precision</td>
                  <td className="p-2.5 text-center font-bold text-purple-300">{Math.round(round1Metrics.precision ?? 100)}%</td>
                  <td className="p-2.5 text-center font-bold text-purple-300">{Math.round(round2Metrics.precision ?? 100)}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-4 text-slate-300 font-semibold">Omission Rate</td>
                  <td className="p-2.5 text-center font-bold text-rose-400">{round1OmissionRate}%</td>
                  <td className="p-2.5 text-center font-bold text-rose-400">{round2OmissionRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Focus Classification Breakdown Card */}
          <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 my-1 text-left font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Focus Classification</span>
              <span className="text-[10px] text-slate-400">{classMeta.summary}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className={`p-2 rounded-lg border ${overallClassification === "Optimal Focus" ? "bg-emerald-500/10 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "bg-black/30 border-white/10 opacity-60"}`}>
                <div className="font-bold text-emerald-400 text-[11px] mb-0.5">Optimal Focus</div>
                <p className="text-[10px] text-slate-300 leading-snug">Fast, consistent reaction times with minimal misses.</p>
              </div>

              <div className={`p-2 rounded-lg border ${overallClassification === "Steady Focus" ? "bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.15)]" : "bg-black/30 border-white/10 opacity-60"}`}>
                <div className="font-bold text-cyan-400 text-[11px] mb-0.5">Steady Focus</div>
                <p className="text-[10px] text-slate-300 leading-snug">Reliable, balanced attention across all trials.</p>
              </div>

              <div className={`p-2 rounded-lg border ${overallClassification === "Variable Focus" ? "bg-[#F3DA66]/10 border-[#F3DA66]/40 shadow-[0_0_12px_rgba(243,218,102,0.15)]" : "bg-black/30 border-white/10 opacity-60"}`}>
                <div className="font-bold text-[#F3DA66] text-[11px] mb-0.5">Variable Focus</div>
                <p className="text-[10px] text-slate-300 leading-snug">Response times or accuracy varied during the test.</p>
              </div>
            </div>
          </div>

          {/* EXACTLY 3 BUTTONS: Open Detailed Report, Play Again, Return to Home */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 w-full font-mono text-xs">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/direction/report";
                }
              }}
              className="py-3 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-offbit uppercase font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-cyan-400 flex items-center justify-center gap-1.5"
            >
              <span>📊</span>
              <span>Open Detailed Report →</span>
            </button>

            <button
              onClick={() => handleAction(onRestart)}
              className="py-3 px-4 rounded-lg bg-white text-black hover:bg-slate-200 font-offbit uppercase font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white flex items-center justify-center gap-1.5"
            >
              <span>Play Again</span>
            </button>

            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              }}
              className="py-3 px-4 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/15 font-mono uppercase font-bold text-xs tracking-wider transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // In-Game Pause Menu
  if (isPaused && (status === "round1" || status === "round2")) {
    const isRound1 = currentRound === 1;
    const roundTitle = isRound1 ? "ROUND 1 · CPT" : "ROUND 2 · SART";
    const roundFullName = isRound1
      ? "Continuous Performance Test"
      : "Sustained Attention to Response Task";

    const m: LiveFocusMetrics = liveFocusMetrics || {
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
    };

    return (
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md px-4 font-sans select-none overflow-y-auto py-5 transition-all duration-300 ease-out ${
          mounted && !isFadingOut
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-[0.98] pointer-events-none"
        }`}
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
  }

  return null;
};
