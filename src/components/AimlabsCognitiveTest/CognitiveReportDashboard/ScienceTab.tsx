import React from "react";
import { FOCUS_CLASSIFICATION_INFO, type CognitiveSessionReport } from "../reportStorage";

interface ScienceTabProps {
  report: CognitiveSessionReport;
}

export const ScienceTab: React.FC<ScienceTabProps> = ({ report }) => (
  <div className="space-y-6">
    <div className="bg-slate-950/80 rounded-3xl border border-slate-800/80 p-6 sm:p-8 backdrop-blur-md">
      <h2 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-wider">
        Focus Classification & Response Time Variability (CV)
      </h2>
      <p className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
        In cognitive neuroscience, <strong>Intra-Individual Response Time Variability (IIV)</strong> is a sensitive behavioral biomarker for prefrontal cortical efficiency, sustained attentional control, and neural noise. Rather than relying solely on raw speed (Mean RT) or RT variability (CV), BrainXR employs a <strong>Signal Detection Theory (SDT) Multi-Gate Model</strong> integrating <strong>Accuracy, Precision, Omission Error Rate, and Response Time Coefficient of Variation (CV = SDRT / MeanRT)</strong>. This guarantees that low RT variance reflects genuine top-down executive vigilance rather than mindless rhythmic tapping or passive task disengagement.
      </p>

      {/* 3 Classification Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.values(FOCUS_CLASSIFICATION_INFO).map((info) => {
          const isCurrent = report.focusClassification === info.tier;
          return (
            <div
              key={info.tier}
              className={`p-5 rounded-2xl border transition-all ${isCurrent
                  ? `${info.bg} ${info.border} ring-2 ring-indigo-500/30`
                  : "bg-slate-900/60 border-slate-800 opacity-80"
                }`}
            >
              <div className="flex items-center justify-between mb-2 font-mono">
                <span className={`font-bold text-sm ${info.color}`}>{info.tier}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-white/10 font-bold">
                  {info.range}
                </span>
              </div>
              <div className="text-xs font-bold text-white mb-1.5">{info.summary}</div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{info.description}</p>
              <div className="text-[10px] font-mono text-slate-500">Citation: {info.citation}</div>
            </div>
          );
        })}
      </div>

      {/* The Stroop Effect & Cognitive Inversion */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-xs font-mono space-y-3">
        <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Stimulus-Response Conflict (Stroop Analogy in BrainXR)</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          In Round 1 (CPT), participants respond to high-frequency Green Spheres (natural mapping: green = proceed). In Round 2 (SART), the mapping is deliberately inverted: participants must press for Red Boxes and suppress responses to Green Spheres. This generates <strong>Stimulus-Response Compatibility (SRC) conflict</strong> (Kornblum et al., 1990) and requires active suppression of automatic motor impulses.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-cyan-400 font-bold">Tonic Alertness (Round 1)</span>
            <p className="text-slate-400 mt-1 leading-normal">
              Measures baseline vigilance over repetitive trials with low inhibitory conflict.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[#F3DA66] font-bold">Inhibitory Friction (Round 2)</span>
            <p className="text-slate-400 mt-1 leading-normal">
              Examines cognitive cost: latency elongation and commission errors when overcoming overlearned habits.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
