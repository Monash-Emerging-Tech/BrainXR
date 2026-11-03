import React, { useState, useEffect } from "react";
import type { GameStatus, RoundMetrics, CognitiveRoundType, LiveFocusMetrics } from "./types";

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

// Muted, sophisticated edge-concentrated 3D rendered spheres & cubes matching BrainXR neurotech aesthetic
const ModalDecorativeField: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* ================= LEFT EDGE CLUSTER ================= */}
      {/* Top-Left: Soft Slate-Cyan Sphere */}
      <div
        className="absolute -top-12 -left-12 w-56 h-56 rounded-full shadow-[0_0_35px_rgba(8,145,178,0.12)] border border-cyan-800/25 animate-pulse transition-transform duration-1000 ease-in-out opacity-45"
        style={{
          background: "radial-gradient(circle at 35% 30%, #38bdf8 0%, #0369a1 40%, #0f172a 80%)",
          animationDuration: "7s",
        }}
      />

      {/* Top-Left: Muted Rose-Slate Box (floating drift) */}
      <div
        className="absolute top-28 -left-4 w-20 h-20 rounded-xl shadow-[0_0_20px_rgba(159,18,57,0.15)] border border-rose-900/30 transform rotate-18 -skew-y-12 animate-bounce opacity-40"
        style={{
          background: "linear-gradient(135deg, #be123c 0%, #4c0519 55%, #0f172a 100%)",
          animationDuration: "8s",
        }}
      />

      {/* Mid-Left: Muted Cyan Sphere */}
      <div
        className="absolute top-1/2 -left-8 -translate-y-1/2 w-32 h-32 rounded-full shadow-[0_0_25px_rgba(8,145,178,0.1)] border border-cyan-800/25 animate-pulse opacity-40"
        style={{
          background: "radial-gradient(circle at 38% 32%, #7dd3fc 0%, #0284c7 45%, #0c4a6e 75%, #0f172a 100%)",
          animationDuration: "6s",
        }}
      />

      {/* Mid-Left lower: Angled Floating Rose Box */}
      <div
        className="absolute top-[65%] left-10 w-16 h-16 rounded-xl shadow-[0_0_16px_rgba(159,18,57,0.12)] border border-rose-900/25 transform -rotate-25 skew-x-6 animate-pulse opacity-35"
        style={{
          background: "linear-gradient(145deg, #e11d48 0%, #881337 55%, #1e1b4b 100%)",
          animationDuration: "6.5s",
        }}
      />

      {/* Bottom-Left: Muted Rose-Burgundy Cube */}
      <div
        className="absolute bottom-6 -left-6 w-36 h-36 rounded-2xl shadow-[0_0_30px_rgba(159,18,57,0.15)] border border-rose-900/30 transform rotate-35 animate-bounce opacity-45"
        style={{
          background: "linear-gradient(135deg, #9f1239 0%, #4c0519 65%, #020617 100%)",
          animationDuration: "9s",
        }}
      />

      {/* Bottom-Left outer: Soft Cyan Sphere */}
      <div
        className="absolute -bottom-10 left-24 w-28 h-28 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.1)] border border-cyan-800/20 animate-pulse opacity-35"
        style={{
          background: "radial-gradient(circle at 35% 30%, #38bdf8 0%, #0369a1 50%, #082f49 85%, #020617 100%)",
          animationDuration: "7.5s",
        }}
      />

      {/* ================= RIGHT EDGE CLUSTER ================= */}
      {/* Top-Right: Muted Crimson-Slate Cube */}
      <div
        className="absolute -top-10 -right-8 w-44 h-44 rounded-2xl shadow-[0_0_30px_rgba(159,18,57,0.15)] border border-rose-900/30 transform -rotate-20 skew-y-6 animate-pulse opacity-45"
        style={{
          background: "linear-gradient(135deg, #be123c 0%, #881337 50%, #30030f 85%, #0f172a 100%)",
          animationDuration: "7.2s",
        }}
      />

      {/* Top-Right inner: Soft Cyan Sphere */}
      <div
        className="absolute top-28 right-16 w-24 h-24 rounded-full shadow-[0_0_22px_rgba(8,145,178,0.12)] border border-cyan-800/25 animate-bounce opacity-40"
        style={{
          background: "radial-gradient(circle at 35% 30%, #7dd3fc 0%, #0284c7 45%, #0e7490 80%, #0f172a 100%)",
          animationDuration: "8.5s",
        }}
      />

      {/* Mid-Right: Diamond Tilted Rose Box */}
      <div
        className="absolute top-1/2 -right-10 -translate-y-1/2 w-32 h-32 rounded-2xl shadow-[0_0_25px_rgba(159,18,57,0.14)] border border-rose-900/30 transform rotate-45 animate-pulse opacity-40"
        style={{
          background: "linear-gradient(125deg, #be123c 0%, #881337 55%, #1e1b4b 100%)",
          animationDuration: "6.8s",
        }}
      />

      {/* Mid-Right inner: Cyan Floating Sphere */}
      <div
        className="absolute top-[62%] right-12 w-16 h-16 rounded-full shadow-[0_0_16px_rgba(8,145,178,0.12)] border border-cyan-800/25 animate-bounce opacity-35"
        style={{
          background: "radial-gradient(circle at 35% 30%, #38bdf8 0%, #0369a1 50%, #0f172a 90%)",
          animationDuration: "7.8s",
        }}
      />

      {/* Bottom-Right: Deep Soft Cyan Sphere */}
      <div
        className="absolute -bottom-14 -right-14 w-60 h-60 rounded-full shadow-[0_0_35px_rgba(8,145,178,0.14)] border border-cyan-800/25 animate-pulse opacity-45"
        style={{
          background: "radial-gradient(circle at 32% 28%, #7dd3fc 0%, #0369a1 45%, #075985 75%, #020617 100%)",
          animationDuration: "8s",
        }}
      />

      {/* Bottom-Right inner: Tilted Rose Box */}
      <div
        className="absolute bottom-24 right-28 w-18 h-18 rounded-xl shadow-[0_0_16px_rgba(159,18,57,0.12)] border border-rose-900/25 transform -rotate-15 animate-bounce opacity-35"
        style={{
          background: "linear-gradient(145deg, #e11d48 0%, #881337 55%, #0f172a 100%)",
          animationDuration: "9.2s",
        }}
      />

      {/* Top Center Edge: Small Cyan Sphere accent */}
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full shadow-[0_0_12px_rgba(8,145,178,0.1)] border border-cyan-800/20 animate-pulse opacity-30"
        style={{
          background: "radial-gradient(circle at 35% 30%, #38bdf8 0%, #0369a1 55%, #020617 100%)",
          animationDuration: "6s",
        }}
      />

      {/* Bottom Center Edge: Angled Rose Box accent */}
      <div
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-lg shadow-[0_0_12px_rgba(159,18,57,0.1)] border border-rose-900/20 transform rotate-12 animate-pulse opacity-30"
        style={{
          background: "linear-gradient(135deg, #be123c 0%, #4c0519 65%, #020617 100%)",
          animationDuration: "7s",
        }}
      />
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

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, [status]);

  const handleAction = (callback: () => void) => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsFadingOut(false);
      callback();
    }, 320);
  };

  // Countdown overlay
  if (status === "countdown") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none select-none transition-opacity duration-300">
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
        className={`absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4 font-sans select-none overflow-hidden transition-all duration-300 ease-out ${mounted && !isFadingOut
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-[0.98] pointer-events-none"
          }`}
      >
        {/* Animated edge-concentrated spheres & boxes */}
        <ModalDecorativeField />

        <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center px-4 py-8">
          {/* Top Tag: an MNET experience */}
          <div className="w-full px-12 mb-1">
            <SpannedText
              text="an MNET experience"
              className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wider"
            />
          </div>

          {/* Rebranded Headings: BrainXR */}
          <h2 className="text-4xl sm:text-5xl font-black font-offbit uppercase tracking-wider text-white mt-1 mb-2">
            Brain<span className="text-cyan-400">XR</span>
          </h2>

          {/* Direction of Focus Description */}
          <p className="text-xs sm:text-sm text-slate-300 font-mono whitespace-nowrap mb-6">
            a cognitive game to track the <span className="text-cyan-300 font-semibold">direction of focus</span>.
          </p>

          {/* Side-by-Side Dual Round Cards Layout: First card is always Round 1 (whichever starts first) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 text-left font-mono">
            {/* Card Position 1: The starting round (labeled Round 1) */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between shadow-2xl ${
              currentRound === 1
                ? "border-amber-400/80 bg-slate-950/95 ring-2 ring-amber-400/30 scale-[1.01]"
                : "border-cyan-400/80 bg-slate-950/95 ring-2 ring-cyan-400/30 scale-[1.01]"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                    currentRound === 1 ? "text-amber-400" : "text-cyan-400"
                  }`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      currentRound === 1 ? "bg-amber-400" : "bg-cyan-400"
                    }`} />
                    {currentRound === 1 ? "Round 1 · CPT" : "Round 1 · SART"}
                  </span>
                  <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold border ${
                    currentRound === 1
                      ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                      : "bg-cyan-400/20 text-cyan-300 border-cyan-400/40"
                  }`}>
                    First Round
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {currentRound === 1 ? "Continuous Performance Test" : "Sustained Attention to Response Task"}
                </div>
              </div>

              <div className="space-y-2.5 mt-4 pt-3 border-t border-slate-800 text-xs">
                {currentRound === 1 ? (
                  <>
                    {/* Cyan Sphere -> Press */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                        <span className="text-slate-200">Cyan Sphere</span>
                      </div>
                      <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold tracking-wider">
                        PRESS
                      </span>
                    </div>

                    {/* Red Box -> Avoid */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-rose-950/30 border border-rose-500/25 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-xs bg-rose-600 shadow-[0_0_5px_rgba(225,29,72,0.5)]" />
                        <span className="text-slate-300">Red Box</span>
                      </div>
                      <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold tracking-wider">
                        DO NOT PRESS
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Red Box -> Press */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-xs bg-rose-600 shadow-[0_0_6px_rgba(225,29,72,0.6)]" />
                        <span className="text-slate-200">Red Box</span>
                      </div>
                      <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold tracking-wider">
                        PRESS
                      </span>
                    </div>

                    {/* Cyan Sphere -> Avoid */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/25 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                        <span className="text-slate-300">Cyan Sphere</span>
                      </div>
                      <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold tracking-wider">
                        DO NOT PRESS
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Card Position 2: The following round (labeled Round 2) */}
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 opacity-60 hover:opacity-90 transition-all duration-300 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] uppercase font-bold tracking-wider ${
                    currentRound === 1 ? "text-cyan-400" : "text-amber-400"
                  }`}>
                    {currentRound === 1 ? "Round 2 · SART" : "Round 2 · CPT"}
                  </span>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold text-slate-500">
                    Following Round
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {currentRound === 1 ? "Sustained Attention to Response Task" : "Continuous Performance Test"}
                </div>
              </div>

              <div className="space-y-2.5 mt-4 pt-3 border-t border-slate-800 text-xs">
                {currentRound === 1 ? (
                  <>
                    {/* Red Box -> Press */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-xs bg-rose-600 shadow-[0_0_6px_rgba(225,29,72,0.6)]" />
                        <span className="text-slate-200">Red Box</span>
                      </div>
                      <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold tracking-wider">
                        PRESS
                      </span>
                    </div>

                    {/* Cyan Sphere -> Avoid */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/25 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                        <span className="text-slate-300">Cyan Sphere</span>
                      </div>
                      <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold tracking-wider">
                        DO NOT PRESS
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Cyan Sphere -> Press */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                        <span className="text-slate-200">Cyan Sphere</span>
                      </div>
                      <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold tracking-wider">
                        PRESS
                      </span>
                    </div>

                    {/* Red Box -> Avoid */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-rose-950/30 border border-rose-500/25 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-xs bg-rose-600 shadow-[0_0_5px_rgba(225,29,72,0.5)]" />
                        <span className="text-slate-300">Red Box</span>
                      </div>
                      <span className="font-offbit text-xs uppercase px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold tracking-wider">
                        DO NOT PRESS
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Subtext info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-mono text-slate-400 my-3">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              1 Target at a Time
            </span>
            <span className="hidden sm:inline">·</span>
            <span>500ms flash + 700ms fixation</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-amber-300/90 font-medium">Stroop Cognitive Conflict Rule</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <button
              onClick={() => handleAction(onExit)}
              className="flex-1 py-3 px-5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-slate-700/60 backdrop-blur-md"
            >
              Back
            </button>
            <button
              onClick={() => handleAction(onStartGame)}
              className="flex-2 py-3 px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40"
            >
              Play Now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Intermission Screen
  if (status === "intermission" && (round1Metrics || round2Metrics)) {
    const prevMetrics = round1Metrics || round2Metrics!;
    const isNextRound2 = !round2Metrics; // if round2 hasn't run, next is round 2; otherwise next is round 1
    const nextRoundName = isNextRound2 ? "Round 2 (SART)" : "Round 1 (CPT)";
    const nextRoundTag = isNextRound2 ? "ROUND 2 · SART" : "ROUND 1 · CPT";
    const completedRoundName = isNextRound2 ? "ROUND 1 COMPLETE" : "ROUND 2 COMPLETE";

    return (
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl px-4 font-sans select-none overflow-hidden transition-all duration-300 ease-out ${mounted && !isFadingOut
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-[0.98] pointer-events-none"
          }`}
      >
        <ModalDecorativeField />

        <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center px-4 py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-950/70 px-3.5 py-1.5 text-xs font-mono tracking-wider text-amber-300 border border-amber-500/40 backdrop-blur-md mb-3 uppercase font-semibold">
            {completedRoundName}
          </div>

          <div className="w-full px-4 mb-2">
            <SpannedText
              text="TELEMETRY REPORT"
              className="text-white text-2xl sm:text-3xl font-bold"
            />
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 my-5 text-center font-mono">
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Hits (Go)</div>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">{prevMetrics.goHits}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">False Alarms</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">{prevMetrics.commissions}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Mean RT</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{Math.round(prevMetrics.meanReactionTime)} ms</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Accuracy</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{Math.round(prevMetrics.accuracy)}%</div>
            </div>
          </div>

          {/* Rule Reversal Notice */}
          <div className="w-full bg-slate-950/70 border border-rose-500/40 p-4 rounded-2xl text-left my-2 font-mono backdrop-blur-md">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              RULE REVERSAL FOR {nextRoundTag}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-950/50 border border-rose-500/30">
                <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <div>
                  <div className="text-[9px] text-rose-300 uppercase">RED BOX</div>
                  <div className="font-offbit font-bold text-white text-xs">{isNextRound2 ? "PRESS" : "DO NOT PRESS"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                <div>
                  <div className="text-[9px] text-cyan-300 uppercase">CYAN SPHERE</div>
                  <div className="font-offbit font-bold text-cyan-300 text-xs">{isNextRound2 ? "DO NOT PRESS" : "PRESS"}</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleAction(onStartRound2)}
            className="w-full mt-4 py-3.5 px-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-rose-500/30 active:scale-95 transition-all cursor-pointer border border-rose-400/40"
          >
            Start {nextRoundName} →
          </button>
        </div>
      </div>
    );
  }

  // Final Finished Screen
  if (status === "finished" && round1Metrics && round2Metrics) {
    const totalScore = round1Metrics.score + round2Metrics.score;
    const overallAccuracy = (round1Metrics.accuracy + round2Metrics.accuracy) / 2;

    return (
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl px-4 font-sans select-none overflow-y-auto py-8 transition-all duration-300 ease-out ${mounted && !isFadingOut
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-[0.98] pointer-events-none"
          }`}
      >
        <ModalDecorativeField />

        <div className="relative z-10 max-w-2xl w-full flex flex-col items-center px-4 py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/70 px-3.5 py-1.5 text-xs font-mono tracking-wider text-emerald-300 border border-emerald-500/40 backdrop-blur-md mb-2 uppercase font-semibold">
            BATTERY COMPLETE
          </div>

          <div className="w-full px-4 mb-2">
            <SpannedText
              text="COGNITIVE REPORT"
              className="text-white text-2xl sm:text-3xl md:text-4xl font-bold"
            />
          </div>

          <div className="flex items-center gap-8 my-4 font-mono">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Composite Score</span>
              <span className="text-3xl font-bold text-white mt-0.5">{totalScore}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Overall Accuracy</span>
              <span className="text-3xl font-bold text-emerald-400 mt-0.5">{Math.round(overallAccuracy)}%</span>
            </div>
          </div>

          <div className="w-full bg-slate-950/70 rounded-2xl border border-slate-800 overflow-hidden my-3 text-xs font-mono backdrop-blur-md">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <th className="p-3 pl-4">Metric</th>
                  <th className="p-3 text-center text-amber-400">Round 1 (CPT)</th>
                  <th className="p-3 text-center text-cyan-400">Round 2 (SART)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="p-3 pl-4 text-slate-300">Target (Go)</td>
                  <td className="p-3 text-center text-cyan-300">Cyan Sphere</td>
                  <td className="p-3 text-center text-rose-300">Red Box</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 text-slate-300">Go Hits</td>
                  <td className="p-3 text-center font-bold text-white">{round1Metrics.goHits}</td>
                  <td className="p-3 text-center font-bold text-white">{round2Metrics.goHits}</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 text-slate-300">False Alarms (No-Go Errors)</td>
                  <td className="p-3 text-center font-bold text-rose-400">{round1Metrics.commissions}</td>
                  <td className="p-3 text-center font-bold text-rose-400">{round2Metrics.commissions}</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 text-slate-300">Correct Rejections</td>
                  <td className="p-3 text-center font-bold text-emerald-400">{round1Metrics.correctRejections}</td>
                  <td className="p-3 text-center font-bold text-emerald-400">{round2Metrics.correctRejections}</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 text-slate-300">Mean Reaction Time</td>
                  <td className="p-3 text-center text-amber-300">{Math.round(round1Metrics.meanReactionTime)} ms</td>
                  <td className="p-3 text-center text-amber-300">{Math.round(round2Metrics.meanReactionTime)} ms</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 text-slate-300">Accuracy</td>
                  <td className="p-3 text-center text-emerald-300">{Math.round(round1Metrics.accuracy)}%</td>
                  <td className="p-3 text-center text-emerald-300">{Math.round(round2Metrics.accuracy)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3 mt-4 w-full font-mono">
            <button
              onClick={() => handleAction(onRestart)}
              className="flex-1 py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-slate-700/60"
            >
              Test Again
            </button>
            <button
              onClick={() => handleAction(onExit)}
              className="flex-1 py-3 px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40"
            >
              Return to EEG
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
      telemetryTable: [],
    };

    const focusBadgeColor =
      m.focusLevel === "Optimal Focus"
        ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/40"
        : m.focusLevel === "Steady Focus"
        ? "text-cyan-400 bg-cyan-950/60 border-cyan-500/40"
        : m.focusLevel === "Variable Focus"
        ? "text-amber-400 bg-amber-950/60 border-amber-500/40"
        : "text-slate-400 bg-slate-900/60 border-slate-700/40";

    return (
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl px-4 font-sans select-none overflow-hidden transition-all duration-300 ease-out ${
          mounted && !isFadingOut
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-[0.98] pointer-events-none"
        }`}
      >
        <ModalDecorativeField />

        <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center px-4 py-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-950/70 px-3.5 py-1.5 text-xs font-mono tracking-wider text-amber-300 border border-amber-500/40 backdrop-blur-md mb-2 uppercase font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            GAME PAUSED
          </div>

          <div className="w-full px-4 mb-1">
            <SpannedText
              text="PAUSE MENU"
              className="text-white text-2xl sm:text-3xl font-bold"
            />
          </div>

          <p className="text-xs text-slate-400 font-mono mb-3">
            {roundTitle} · <span className="text-cyan-300">{roundFullName}</span>
          </p>

          {/* Target Rules with embedded hit/miss tally */}
          <div className="w-full grid grid-cols-2 gap-3 my-2 text-xs font-mono">
            {isRound1 ? (
              <>
                {/* Round 1 (CPT): Hit Sphere */}
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-left shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                    <div>
                      <div className="text-white font-bold text-xs">Hit Sphere</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Hit: <span className="font-bold text-emerald-400">{m.spheresHit}</span> · Miss: <span className="font-bold text-rose-400">{m.spheresMissed}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-500/40 font-offbit">
                    PRESS
                  </span>
                </div>

                {/* Round 1 (CPT): Avoid Box */}
                <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between text-left shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                    <div>
                      <div className="text-white font-bold text-xs">Avoid Box</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Avoided: <span className="font-bold text-emerald-400">{Math.max(0, 37 - m.boxesMissed)}</span> · Faults: <span className="font-bold text-rose-400">{m.boxesMissed}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-950 px-2.5 py-1 rounded-full border border-rose-500/40 font-offbit">
                    AVOID
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Round 2 (SART): Hit Box */}
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-left shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                    <div>
                      <div className="text-white font-bold text-xs">Hit Box</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Hit: <span className="font-bold text-emerald-400">{m.boxesHit}</span> · Miss: <span className="font-bold text-rose-400">{m.boxesMissed}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-950 px-2.5 py-1 rounded-full border border-rose-500/40 font-offbit">
                    PRESS
                  </span>
                </div>

                {/* Round 2 (SART): Avoid Sphere */}
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-left shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                    <div>
                      <div className="text-white font-bold text-xs">Avoid Sphere</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Avoided: <span className="font-bold text-emerald-400">{Math.max(0, 150 - m.spheresMissed)}</span> · Faults: <span className="font-bold text-rose-400">{m.spheresMissed}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-500/40 font-offbit">
                    AVOID
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Unified Performance Graph: RT & Moving Avg / Dual SD Band Envelope (Left Axis) + Accuracy % (Right Axis) */}
          <div className="w-full p-4 rounded-2xl bg-slate-950/85 border border-slate-800 shadow-2xl my-2 text-left font-mono">
            {/* Graph Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Session Performance</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${focusBadgeColor}`}>
                  {m.focusLevel}
                </span>
                {m.cv > 0 && (
                  <span className="text-[10px] text-amber-300/90 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    CV: {(m.cv * 100).toFixed(0)}% ({(m.cv).toFixed(2)}x Mean)
                  </span>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] flex-wrap justify-end">
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" />
                  <span>Moving RT</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2 rounded-xs bg-amber-400/40 border border-amber-400/70" />
                  <span>±1.0x SD</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400/70">
                  <span className="w-2 h-0.5 border-b border-dashed border-amber-400/80" />
                  <span>±1.5x Whisker</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full stroke-dashed" />
                  <span>Accuracy %</span>
                </div>
              </div>
            </div>

            {/* SVG Graph Viewport */}
            <div className="w-full h-36 relative my-1">
              {m.telemetryTable && m.telemetryTable.length > 1 ? (
                (() => {
                  const data = m.telemetryTable.slice(-30);
                  const count = data.length;
                  const W = 560;
                  const H = 140;
                  const padL = 36;
                  const padR = 36;
                  const padT = 12;
                  const padB = 22;
                  const innerW = W - padL - padR;
                  const innerH = H - padT - padB;

                  // Scales: RT (Left Axis) 100ms - 550ms
                  const minRT = 100;
                  const maxRT = 550;
                  const rtRange = maxRT - minRT;
                  const getYForRT = (val: number) => {
                    const clamped = Math.max(minRT, Math.min(maxRT, val));
                    return padT + innerH - ((clamped - minRT) / rtRange) * innerH;
                  };

                  // Scale: Accuracy (Right Axis) 0 - 100%
                  const getYForAcc = (acc: number) => {
                    return padT + innerH - (acc / 100) * innerH;
                  };

                  const getX = (idx: number) => padL + (idx / (count - 1)) * innerW;

                  // Compute Envelope Points
                  // Core band: +/- 1.0 * SD
                  // Whisker outer threshold: +/- 1.5 * SD
                  const innerUpperPoints: string[] = [];
                  const innerLowerPoints: string[] = [];
                  const outerUpperPoints: string[] = [];
                  const outerLowerPoints: string[] = [];
                  const whiskerTopLine: string[] = [];
                  const whiskerBottomLine: string[] = [];
                  const movingAvgPoints: string[] = [];
                  const accPoints: string[] = [];

                  data.forEach((d, i) => {
                    const x = getX(i);
                    const avg = d.movingAverageRT > 0 ? d.movingAverageRT : (d.reactionTime || m.meanRT || 300);
                    const sd = d.movingSdRT || m.sdRT || 30;

                    const yAvg = getYForRT(avg);
                    const yInnerUpper = getYForRT(avg - sd);
                    const yInnerLower = getYForRT(avg + sd);
                    const yOuterUpper = getYForRT(avg - 1.5 * sd);
                    const yOuterLower = getYForRT(avg + 1.5 * sd);

                    movingAvgPoints.push(`${x.toFixed(1)},${yAvg.toFixed(1)}`);
                    innerUpperPoints.push(`${x.toFixed(1)},${yInnerUpper.toFixed(1)}`);
                    innerLowerPoints.push(`${x.toFixed(1)},${yInnerLower.toFixed(1)}`);
                    outerUpperPoints.push(`${x.toFixed(1)},${yOuterUpper.toFixed(1)}`);
                    outerLowerPoints.push(`${x.toFixed(1)},${yOuterLower.toFixed(1)}`);

                    whiskerTopLine.push(`${x.toFixed(1)},${yOuterUpper.toFixed(1)}`);
                    whiskerBottomLine.push(`${x.toFixed(1)},${yOuterLower.toFixed(1)}`);

                    const yAcc = getYForAcc(d.cumulativeAccuracy);
                    accPoints.push(`${x.toFixed(1)},${yAcc.toFixed(1)}`);
                  });

                  // Polygons for SVG
                  const outerBandPolygon = `${outerUpperPoints.join(" ")} ${outerLowerPoints.reverse().join(" ")}`;
                  const innerBandPolygon = `${innerUpperPoints.join(" ")} ${innerLowerPoints.reverse().join(" ")}`;

                  return (
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                      <defs>
                        {/* Outer 1.5x SD Whisker Band Fill */}
                        <linearGradient id="outerSdBandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.09" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
                        </linearGradient>
                        {/* Inner 1.0x SD Core Focus Band Fill */}
                        <linearGradient id="innerSdBandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.12" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines */}
                      {[0.25, 0.5, 0.75].map((ratio) => {
                        const y = padT + innerH * ratio;
                        return (
                          <line
                            key={ratio}
                            x1={padL}
                            y1={y}
                            x2={padL + innerW}
                            y2={y}
                            stroke="rgba(51, 65, 85, 0.35)"
                            strokeDasharray="3 3"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Outer 1.5x SD Envelope Fill */}
                      <polygon points={outerBandPolygon} fill="url(#outerSdBandGrad)" />

                      {/* Outer Whisker Bounds (Dashed lines at +/- 1.5 SD) */}
                      <polyline
                        points={whiskerTopLine.join(" ")}
                        fill="none"
                        stroke="#f59e0b"
                        strokeOpacity="0.45"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <polyline
                        points={whiskerBottomLine.join(" ")}
                        fill="none"
                        stroke="#f59e0b"
                        strokeOpacity="0.45"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />

                      {/* Inner 1.0x SD Core Focus Corridor */}
                      <polygon points={innerBandPolygon} fill="url(#innerSdBandGrad)" stroke="#f59e0b" strokeOpacity="0.3" strokeWidth="0.8" />

                      {/* Moving Average RT Line (Cyan) */}
                      <polyline
                        points={movingAvgPoints.join(" ")}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Cumulative Accuracy Line (Emerald) */}
                      <polyline
                        points={accPoints.join(" ")}
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Individual Target Hit Dots */}
                      {data.map((d, i) => {
                        const x = getX(i);
                        if (d.reactionTime) {
                          const y = getYForRT(d.reactionTime);
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="2.5"
                              fill={d.isCorrect ? "#00f0ff" : "#f43f5e"}
                              stroke="#0f172a"
                              strokeWidth="1"
                            />
                          );
                        }
                        return null;
                      })}

                      {/* Left Axis Labels (RT ms) */}
                      <text x={padL - 4} y={padT + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                        550ms
                      </text>
                      <text x={padL - 4} y={padT + innerH} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                        100ms
                      </text>

                      {/* Right Axis Labels (Accuracy %) */}
                      <text x={padL + innerW + 4} y={padT + 4} fill="#10b981" fontSize="9" textAnchor="start" fontFamily="monospace">
                        100%
                      </text>
                      <text x={padL + innerW + 4} y={padT + innerH} fill="#10b981" fontSize="9" textAnchor="start" fontFamily="monospace">
                        0%
                      </text>
                    </svg>
                  );
                })()
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 italic bg-slate-900/40 rounded-xl border border-slate-800/60">
                  <span>Collecting live response telemetry...</span>
                  <span className="text-[10px] text-slate-600 mt-1">Plotting moving average, dual SD bands, and accuracy</span>
                </div>
              )}
            </div>

            {/* Bottom Summary Bar */}
            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase">Mean RT:</span>
                <span className="font-bold text-cyan-400">{m.meanRT}ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase">Median RT:</span>
                <span className="font-bold text-indigo-300">{m.medianRT}ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase">SD Multiplier:</span>
                <span className="font-bold text-amber-400">±{m.sdRT}ms {m.cv > 0 ? `(${m.cv}x)` : ""}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase">Accuracy:</span>
                <span className="font-bold text-emerald-400">{m.accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Settings Section: Sound Effects */}
          <div className="w-full bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-left my-1 font-mono backdrop-blur-md flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Audio Feedback Synthesizer</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Target pop chimes and audio feedback</div>
            </div>

            <button
              onClick={() => onToggleSound?.()}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/50"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {soundEnabled ? "SOUND ON" : "MUTED"}
            </button>
          </div>

          {/* Action Buttons: 1 line for all 3 buttons: Back, Resume, Skip */}
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
              className="py-3 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60 font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:text-white hover:border-slate-500"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            {/* Resume Button */}
            <button
              onClick={() => handleAction(() => onResume?.())}
              className="py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40 flex items-center justify-center gap-1.5"
            >
              <span>▶</span>
              <span>Resume</span>
            </button>

            {/* Skip Button */}
            <button
              onClick={() => handleAction(() => onSkipRound?.())}
              className="py-3 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:border-amber-400"
            >
              <span>Skip</span>
              <span className="text-amber-400">⇥</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
