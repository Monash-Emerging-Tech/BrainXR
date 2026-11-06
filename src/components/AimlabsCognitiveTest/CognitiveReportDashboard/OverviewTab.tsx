import React from "react";
import type { CognitiveSessionReport } from "../reportStorage";
import type { RoundMetrics, TargetTelemetryRecord } from "../types";
import { TelemetryPerformanceGraph } from "../TelemetryPerformanceGraph";

interface OverviewTabProps {
  report: CognitiveSessionReport;
  r1: RoundMetrics;
  r2: RoundMetrics;
  r1OmissionRate: number;
  r2OmissionRate: number;
  fullTelemetry: TargetTelemetryRecord[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ report, r1, r2, r1OmissionRate, r2OmissionRate, fullTelemetry }) => (
  <div className="space-y-6">
    {/* Embedded Unified Performance Graph */}
    <TelemetryPerformanceGraph
      telemetry={fullTelemetry}
      meanRT={report.overallMeanRT}
      sdRT={report.overallSdRT}
      cv={report.overallCv}
      accuracy={report.overallAccuracy}
      precision={report.overallPrecision}
      focusLevel={report.focusClassification}
      showAllTrials={true}
      className="border-slate-800/80 bg-slate-950/80"
    />

    {/* Side-by-Side Round Cards: Simplified with User Action & Result */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Round 1 (CPT) */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Round 1 · High Frequency Target
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">Continuous Performance Test (CPT)</h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-green-950/70 border border-green-500/40 text-green-300 font-mono text-[11px] font-bold">
            Green = GO
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-300">Action: Hit · Result: Correct</span>
            <span className="font-bold text-white font-offbit text-sm">{r1.goHits} / {r1.sphereCount}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-300">Action: Hit · Result: Incorrect</span>
            <span className="font-bold text-rose-400 font-offbit text-sm">{r1.commissions} / {r1.boxCount}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-300">Action: Avoided · Result: Correct</span>
            <span className="font-bold text-emerald-400 font-offbit text-sm">{r1.correctRejections} / {r1.boxCount}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-300">Action: Avoided · Result: Incorrect</span>
            <span className="font-bold text-rose-400 font-offbit text-sm">{r1.omissions} / {r1.sphereCount}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-400">Mean Reaction Time</span>
            <span className="font-bold text-cyan-300 font-offbit text-sm">{Math.round(r1.meanReactionTime)}ms</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-400">Response Time CV</span>
            <span className="font-bold text-[#F3DA66] font-offbit text-sm">
              {r1.cv ? `${r1.cv}x` : "--"} {r1.sdReactionTime ? `(±${r1.sdReactionTime}ms)` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-400">Round Accuracy</span>
            <span className="font-bold text-emerald-400 font-offbit text-sm">{Math.round(r1.accuracy)}%</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-400">Round Precision</span>
            <span className="font-bold text-indigo-300 font-offbit text-sm">{Math.round(r1.precision ?? 100)}%</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-400">Round Omission Rate</span>
            <span className="font-bold text-rose-400 font-offbit text-sm">{r1OmissionRate}%</span>
          </div>
        </div>
      </div>

      {/* Round 2 (SART) */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F3DA66] font-bold">
              Round 2 · Rare Inhibitory Target
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">Sustained Attention to Response Task (SART)</h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-bold">
            Red = GO
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-300">Action: Hit · Result: Correct</span>
            <span className="font-bold text-white font-offbit text-sm">{r2.goHits} / {r2.boxCount}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-300">Action: Hit · Result: Incorrect</span>
            <span className="font-bold text-rose-400 font-offbit text-sm">{r2.commissions} / {r2.sphereCount}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-300">Action: Avoided · Result: Correct</span>
            <span className="font-bold text-emerald-400 font-offbit text-sm">{r2.correctRejections} / {r2.sphereCount}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-300">Action: Avoided · Result: Incorrect</span>
            <span className="font-bold text-rose-400 font-offbit text-sm">{r2.omissions} / {r2.boxCount}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-400">Mean Reaction Time</span>
            <span className="font-bold text-cyan-300 font-offbit text-sm">{Math.round(r2.meanReactionTime)}ms</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-400">Response Time CV</span>
            <span className="font-bold text-[#F3DA66] font-offbit text-sm">
              {r2.cv ? `${r2.cv}x` : "--"} {r2.sdReactionTime ? `(±${r2.sdReactionTime}ms)` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-400">Round Accuracy</span>
            <span className="font-bold text-emerald-400 font-offbit text-sm">{Math.round(r2.accuracy)}%</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
            <span className="text-slate-400">Round Precision</span>
            <span className="font-bold text-indigo-300 font-offbit text-sm">{Math.round(r2.precision ?? 100)}%</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-400">Round Omission Rate</span>
            <span className="font-bold text-rose-400 font-offbit text-sm">{r2OmissionRate}%</span>
          </div>
        </div>
      </div>
    </div>

    {/* Combined Comparison Table: Core Executive Metrics */}
    <div className="bg-slate-950/70 rounded-3xl border border-slate-800/80 overflow-hidden font-mono text-xs backdrop-blur-md">
      <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold uppercase tracking-wider text-white text-sm">Full Battery Metrics Comparison</h3>
          <div className="text-[11px] text-slate-400 mt-0.5">Standardized Continuous Performance & SART Paradigm</div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
          Target Ratio: 80 / 20
        </span>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900/40 text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="p-4 pl-6 uppercase font-semibold">Cognitive Metric</th>
              <th className="p-4 text-center text-cyan-400 uppercase font-semibold">Round 1 (CPT)</th>
              <th className="p-4 text-center text-[#F3DA66] uppercase font-semibold">Round 2 (SART)</th>
              <th className="p-4 text-center text-white uppercase font-semibold">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <tr className="hover:bg-slate-900/30 transition-colors">
              <td className="p-4 pl-6 text-slate-200 font-semibold">
                <div>Mean Reaction Time</div>
                <div className="text-[10px] text-slate-500 font-normal">Raw latency on correct Go trials</div>
              </td>
              <td className="p-4 text-center font-bold text-cyan-300 font-offbit text-base">{Math.round(r1.meanReactionTime)} ms</td>
              <td className="p-4 text-center font-bold text-cyan-300 font-offbit text-base">{Math.round(r2.meanReactionTime)} ms</td>
              <td className="p-4 text-center font-bold text-[#F3DA66] font-offbit text-base">
                {Math.round(r2.meanReactionTime - r1.meanReactionTime) > 0 ? `+` : ""}
                {Math.round(r2.meanReactionTime - r1.meanReactionTime)} ms
              </td>
            </tr>
            <tr className="hover:bg-slate-900/30 transition-colors">
              <td className="p-4 pl-6 text-slate-200 font-semibold">
                <div>Response Time CV (CV<sub>RT</sub>)</div>
                <div className="text-[10px] text-slate-500 font-normal">Intra-individual RT dispersion (SD/Mean)</div>
              </td>
              <td className="p-4 text-center font-bold text-[#F3DA66] font-offbit text-base">{r1.cv ?? 0}x</td>
              <td className="p-4 text-center font-bold text-[#F3DA66] font-offbit text-base">{r2.cv ?? 0}x</td>
              <td className="p-4 text-center text-slate-300 font-offbit text-base">
                {((r2.cv ?? 0) - (r1.cv ?? 0)) > 0 ? `+` : ""}
                {((r2.cv ?? 0) - (r1.cv ?? 0)).toFixed(2)}x
              </td>
            </tr>
            <tr className="hover:bg-slate-900/30 transition-colors">
              <td className="p-4 pl-6 text-slate-200 font-semibold">
                <div>Overall Accuracy</div>
                <div className="text-[10px] text-slate-500 font-normal">(Hits + Correct Rejections) / Total</div>
              </td>
              <td className="p-4 text-center font-bold text-emerald-400 font-offbit text-base">{Math.round(r1.accuracy)}%</td>
              <td className="p-4 text-center font-bold text-emerald-400 font-offbit text-base">{Math.round(r2.accuracy)}%</td>
              <td className="p-4 text-center text-slate-300 font-offbit text-base">
                {Math.round(r2.accuracy - r1.accuracy) > 0 ? `+` : ""}
                {Math.round(r2.accuracy - r1.accuracy)}%
              </td>
            </tr>
            <tr className="hover:bg-slate-900/30 transition-colors">
              <td className="p-4 pl-6 text-slate-200 font-semibold">
                <div>Precision</div>
                <div className="text-[10px] text-slate-500 font-normal">Hits / (Hits + Commission Errors)</div>
              </td>
              <td className="p-4 text-center font-bold text-indigo-300 font-offbit text-base">{Math.round(r1.precision ?? 100)}%</td>
              <td className="p-4 text-center font-bold text-indigo-300 font-offbit text-base">{Math.round(r2.precision ?? 100)}%</td>
              <td className="p-4 text-center text-slate-300 font-offbit text-base">
                {Math.round((r2.precision ?? 100) - (r1.precision ?? 100)) > 0 ? `+` : ""}
                {Math.round((r2.precision ?? 100) - (r1.precision ?? 100))}%
              </td>
            </tr>
            <tr className="hover:bg-slate-900/30 transition-colors">
              <td className="p-4 pl-6 text-slate-200 font-semibold">
                <div>Omission Rate</div>
                <div className="text-[10px] text-slate-500 font-normal">Missed Go stimuli (Attentional lapses)</div>
              </td>
              <td className="p-4 text-center font-bold text-rose-400 font-offbit text-base">{r1OmissionRate}%</td>
              <td className="p-4 text-center font-bold text-rose-400 font-offbit text-base">{r2OmissionRate}%</td>
              <td className="p-4 text-center text-slate-300 font-offbit text-base">
                {r2OmissionRate - r1OmissionRate > 0 ? `+${r2OmissionRate - r1OmissionRate}%` : `${r2OmissionRate - r1OmissionRate}%`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
