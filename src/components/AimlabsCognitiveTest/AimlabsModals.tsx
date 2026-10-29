import React, { useState, useEffect } from "react";
import type { GameStatus, RoundMetrics } from "./types";

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
  round1Metrics: RoundMetrics | null;
  round2Metrics: RoundMetrics | null;
  onStartGame: () => void;
  onStartRound2: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const AimlabsModals: React.FC<AimlabsModalsProps> = ({
  status,
  countdown,
  round1Metrics,
  round2Metrics,
  onStartGame,
  onStartRound2,
  onRestart,
  onExit,
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

          {/* Direction of Attention Description */}
          <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-md leading-relaxed mb-6">
            A cognitive test to measure the <span className="text-cyan-300 font-semibold">direction of attention</span>.
          </p>

          {/* Side-by-Side Dual Round Cards Layout */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 text-left font-mono">
            {/* Round 1 Card */}
            <div className="p-4 rounded-2xl border border-cyan-500/20 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between shadow-2xl transition-transform hover:scale-[1.01] duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-amber-400 uppercase font-bold tracking-wider">
                    Round 1 · CPT
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase">Response</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">Continuous Performance</div>
              </div>

              <div className="space-y-2.5 mt-4 pt-3 border-t border-slate-800 text-xs">
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
              </div>
            </div>

            {/* Round 2 Card */}
            <div className="p-4 rounded-2xl border border-violet-500/20 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between shadow-2xl transition-transform hover:scale-[1.01] duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-cyan-400 uppercase font-bold tracking-wider">
                    Round 2 · SART
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase">Inversion</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">Sustained Attention to Response</div>
              </div>

              <div className="space-y-2.5 mt-4 pt-3 border-t border-slate-800 text-xs">
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
              </div>
            </div>
          </div>

          {/* Subtext info */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 my-4">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              1 Target at a Time
            </span>
            <span>·</span>
            <span>500ms flash + 700ms fixation</span>
            <span>·</span>
            <span className="text-indigo-300">Spacebar / Click</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <button
              onClick={() => handleAction(onExit)}
              className="flex-1 py-3 px-5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-slate-700/60 backdrop-blur-md"
            >
              Back to EEG
            </button>
            <button
              onClick={() => handleAction(onStartGame)}
              className="flex-2 py-3 px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40"
            >
              Start Assessment →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Intermission Screen
  if (status === "intermission" && round1Metrics) {
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
            ROUND 1 COMPLETE
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
              <div className="text-lg font-bold text-cyan-400 mt-0.5">{round1Metrics.goHits}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">False Alarms</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">{round1Metrics.commissions}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Mean RT</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{Math.round(round1Metrics.meanReactionTime)} ms</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Accuracy</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{Math.round(round1Metrics.accuracy)}%</div>
            </div>
          </div>

          {/* Rule Reversal Notice for Round 2 */}
          <div className="w-full bg-slate-950/70 border border-rose-500/40 p-4 rounded-2xl text-left my-2 font-mono backdrop-blur-md">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              RULE REVERSAL FOR ROUND 2 (SART)
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-950/50 border border-rose-500/30">
                <span className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <div>
                  <div className="text-[9px] text-rose-300 uppercase">RED BOX</div>
                  <div className="font-offbit font-bold text-white text-xs">PRESS</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                <div>
                  <div className="text-[9px] text-cyan-300 uppercase">CYAN SPHERE</div>
                  <div className="font-offbit font-bold text-cyan-300 text-xs">DO NOT PRESS</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleAction(onStartRound2)}
            className="w-full mt-4 py-3.5 px-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-rose-500/30 active:scale-95 transition-all cursor-pointer border border-rose-400/40"
          >
            Start Round 2 (SART) →
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

  return null;
};
