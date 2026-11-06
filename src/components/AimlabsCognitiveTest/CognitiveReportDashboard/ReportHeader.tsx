import React from "react";
import { exportReportAsJSON, exportReportAsCSV, type CognitiveSessionReport } from "../reportStorage";

interface ReportHeaderProps {
  report: CognitiveSessionReport;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ report }) => (
  <header className="sticky top-0 z-40 bg-[#070b12]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 print:hidden">
    <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <a
          href="/direction"
          className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-xs flex items-center justify-center font-mono cursor-pointer"
          title="Return to Direction Test"
        >
          ←
        </a>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">BrainXR</span>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-bold text-white tracking-tight">Direction of Focus Report</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            Session ID: <span className="text-slate-300">{report.id}</span> · Completed: {report.dateStr}
          </div>
        </div>
      </div>

      {/* Action Export Buttons */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <button
          onClick={() => exportReportAsJSON(report)}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Export structured JSON"
        >
          <span>JSON</span>
          <span className="text-cyan-400">⤓</span>
        </button>
        <button
          onClick={() => exportReportAsCSV(report)}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Export raw CSV telemetry"
        >
          <span>CSV</span>
          <span className="text-emerald-400">⤓</span>
        </button>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/25 active:scale-95 border border-indigo-400/40"
          title="Print report or save as PDF"
        >
          <span>Print / PDF</span>
          <span>⎙</span>
        </button>
      </div>
    </div>
  </header>
);
