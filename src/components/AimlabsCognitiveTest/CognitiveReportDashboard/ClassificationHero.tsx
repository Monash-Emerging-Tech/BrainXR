import React from "react";
import type { CognitiveSessionReport, FocusClassificationInfo } from "../reportStorage";

interface ClassificationHeroProps {
  report: CognitiveSessionReport;
  classMeta: FocusClassificationInfo;
  overallOmissionRate: number;
}

export const ClassificationHero: React.FC<ClassificationHeroProps> = ({ report, classMeta, overallOmissionRate }) => (
  <section
    className={`w-full rounded-3xl border ${classMeta.border} ${classMeta.bg} p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden shadow-2xl mb-6`}
  >
    <div className="flex flex-col gap-6">
      {/* Top Row: Focus Status & Diagnostic Findings */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono tracking-wider border mb-3 uppercase font-semibold backdrop-blur-md bg-slate-950/60 text-slate-200 border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Assessment Result · Direction of Focus
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-offbit uppercase tracking-wider text-white mb-2">
          {classMeta.tier}
        </h1>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans mb-3 font-normal max-w-3xl">
          {classMeta.description}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {report.focusDescription && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-mono text-[#F3DA66]">
              <span className="text-slate-400">Diagnostic finding:</span>
              <span className="font-semibold">{report.focusDescription}</span>
            </div>
          )}
          <div className="text-xs font-mono text-slate-400">
            Theoretical Framework: <span className="text-slate-300">{classMeta.citation}</span>
          </div>
        </div>
      </div>

      {/* Overall Metric Callouts: Responsive 2-col to 5-col Grid with Clean Hierarchy */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono pt-2 border-t border-white/10">
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Mean RT</div>
          <div className="text-2xl sm:text-3xl font-bold font-offbit text-cyan-300 my-1">{report.overallMeanRT}ms</div>
          <div className="text-[10px] text-slate-500">Average latency</div>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Response Time CV</div>
          <div className="text-2xl sm:text-3xl font-bold font-offbit text-[#F3DA66] my-1">{report.overallCv}x</div>
          <div className="text-[10px] text-slate-500">±{report.overallSdRT}ms RT dispersion</div>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Overall Accuracy</div>
          <div className="text-2xl sm:text-3xl font-bold font-offbit text-emerald-400 my-1">{report.overallAccuracy}%</div>
          <div className="text-[10px] text-slate-500">Battery performance</div>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Overall Precision</div>
          <div className="text-2xl sm:text-3xl font-bold font-offbit text-indigo-300 my-1">{report.overallPrecision ?? 100}%</div>
          <div className="text-[10px] text-slate-500">Positive predictive rate</div>
        </div>
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md col-span-2 sm:col-span-1 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Overall Omission Rate</div>
          <div className="text-2xl sm:text-3xl font-bold font-offbit text-rose-400 my-1">{overallOmissionRate}%</div>
          <div className="text-[10px] text-slate-500">Missed Go rate (lapses)</div>
        </div>
      </div>
    </div>
  </section>
);
