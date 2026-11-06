import React from "react";

interface EmptyReportStateProps {
  onLoadDemoData: () => void;
}

export const EmptyReportState: React.FC<EmptyReportStateProps> = ({ onLoadDemoData }) => (
  <div className="min-h-screen bg-[#070b12] text-slate-200 flex flex-col items-center justify-center px-4 font-sans select-none relative overflow-hidden">
    {/* Subtle ambient glow */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

    <div className="relative z-10 max-w-md w-full bg-slate-950/85 border border-slate-800/80 p-8 rounded-3xl shadow-2xl text-center backdrop-blur-2xl">
      <div className="w-12 h-12 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xl mx-auto mb-4">
        📊
      </div>
      <h1 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-wider">
        No Assessment Run Detected
      </h1>
      <p className="text-xs text-slate-400 leading-relaxed mb-6 font-mono">
        No local session report was found in this browser. Complete a 2-round assessment battery at{" "}
        <span className="text-cyan-300 font-semibold">/direction</span> to generate your clinical focus report, or load sample telemetry.
      </p>

      <div className="flex flex-col gap-2.5 font-mono text-xs">
        <a
          href="/direction"
          className="py-3 px-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 transition-all text-center border border-indigo-400/40"
        >
          Launch Direction Cognitive Battery →
        </a>
        <button
          onClick={onLoadDemoData}
          className="py-3 px-5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-wider border border-slate-700/60 transition-all cursor-pointer hover:text-white"
        >
          Load Demo Telemetry Report
        </button>
        <a
          href="/"
          className="py-2.5 px-5 text-slate-400 hover:text-slate-200 text-center uppercase tracking-wider text-[11px] transition-colors mt-2"
        >
          ← Return to EEG Simulation
        </a>
      </div>
    </div>
  </div>
);
