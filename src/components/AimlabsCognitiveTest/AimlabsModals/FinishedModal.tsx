import React from "react";
import type { RoundMetrics, LiveFocusMetrics } from "../types";
import { FOCUS_CLASSIFICATION_INFO } from "../reportStorage";
import { TelemetryPerformanceGraph } from "../TelemetryPerformanceGraph";
import { computeRecall, computeSpecificity, computeBalancedAccuracy } from "../aimlabsStore/trialCounters";
import { classifySessionFocus } from "../aimlabsStore/focusClassification";
import { ModalDecorativeField } from "./ModalDecorativeField";
import { SpannedText } from "./SpannedText";
import { transitionClasses, type ScreenTransitionProps } from "./screenTransition";

interface FinishedModalProps extends ScreenTransitionProps {
  round1Metrics: RoundMetrics;
  round2Metrics: RoundMetrics;
  liveFocusMetrics?: LiveFocusMetrics;
  onRestart: () => void;
}

export const FinishedModal: React.FC<FinishedModalProps> = ({
  round1Metrics,
  round2Metrics,
  liveFocusMetrics,
  onRestart,
  mounted,
  isFadingOut,
  handleAction,
}) => {
  const allRts = [...round1Metrics.reactionTimes, ...round2Metrics.reactionTimes];
  const overallMeanRT = allRts.length > 0 ? Math.round(allRts.reduce((a, b) => a + b, 0) / allRts.length) : 0;
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
  const overallRecall = computeRecall({ goHits: totalGo, omissions: totalOmissions });
  const overallOmissionRate = totalGoTargets > 0 ? Math.round((totalOmissions / totalGoTargets) * 100) : 0;

  const r1Go = round1Metrics.goHits + round1Metrics.omissions;
  const round1OmissionRate =
    round1Metrics.omissionRate ?? (r1Go > 0 ? Math.round((round1Metrics.omissions / r1Go) * 100) : 0);
  const r2Go = round2Metrics.goHits + round2Metrics.omissions;
  const round2OmissionRate =
    round2Metrics.omissionRate ?? (r2Go > 0 ? Math.round((round2Metrics.omissions / r2Go) * 100) : 0);

  const totalCorrectRejections = round1Metrics.correctRejections + round2Metrics.correctRejections;
  const overallSpecificity = computeSpecificity({
    correctRejections: totalCorrectRejections,
    commissions: totalCommissions,
  });
  const overallBalancedAcc = computeBalancedAccuracy(overallRecall, overallSpecificity);

  const { focusClassification: overallClassification } = classifySessionFocus({
    overallRecall,
    overallPrecision,
    overallAccuracy,
    overallBalancedAcc,
    overallCv,
    allRtsLength: allRts.length,
    overallOmissionRate,
  });

  const classMeta =
    overallClassification === "Optimal Focus"
      ? FOCUS_CLASSIFICATION_INFO.optimal
      : overallClassification === "Steady Focus"
      ? FOCUS_CLASSIFICATION_INFO.steady
      : FOCUS_CLASSIFICATION_INFO.variable;

  const fullTelemetry = [...(round1Metrics.telemetryTable || []), ...(round2Metrics.telemetryTable || [])];

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md px-4 font-sans select-none overflow-y-auto py-8 transition-all duration-300 ease-out ${transitionClasses(mounted, isFadingOut)}`}
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
};
