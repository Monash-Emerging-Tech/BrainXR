import React from "react";

export type ReportTab = "overview" | "telemetry" | "science";

interface ReportTabsProps {
  selectedTab: ReportTab;
  onSelectTab: (tab: ReportTab) => void;
  telemetryCount: number;
}

// Polished cyber-glass segmented tab bar for the report's 3 sections.
export const ReportTabs: React.FC<ReportTabsProps> = ({ selectedTab, onSelectTab, telemetryCount }) => (
  <div
    role="tablist"
    aria-label="Report Sections"
    className="p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl mb-6 font-mono text-xs flex items-center gap-1.5 overflow-x-auto shadow-xl print:hidden"
  >
    <button
      role="tab"
      aria-selected={selectedTab === "overview"}
      onClick={() => onSelectTab("overview")}
      className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer uppercase font-bold tracking-wider whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${selectedTab === "overview"
          ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent"
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full transition-all ${selectedTab === "overview"
            ? "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)] animate-pulse"
            : "bg-slate-600 group-hover:bg-slate-400"
          }`}
      />
      <span>Comparative Metrics</span>
    </button>

    <button
      role="tab"
      aria-selected={selectedTab === "telemetry"}
      onClick={() => onSelectTab("telemetry")}
      className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer uppercase font-bold tracking-wider whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${selectedTab === "telemetry"
          ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent"
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full transition-all ${selectedTab === "telemetry"
            ? "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)] animate-pulse"
            : "bg-slate-600 group-hover:bg-slate-400"
          }`}
      />
      <span>Full Telemetry Log</span>
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 transition-colors ${selectedTab === "telemetry"
            ? "bg-white/20 text-white"
            : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
          }`}
      >
        {telemetryCount}
      </span>
    </button>

    <button
      role="tab"
      aria-selected={selectedTab === "science"}
      onClick={() => onSelectTab("science")}
      className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer uppercase font-bold tracking-wider whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${selectedTab === "science"
          ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent"
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full transition-all ${selectedTab === "science"
            ? "bg-[#F3DA66] shadow-[0_0_8px_rgba(243,218,102,0.9)] animate-pulse"
            : "bg-slate-600 group-hover:bg-slate-400"
          }`}
      />
      <span>Focus Classification Science</span>
    </button>
  </div>
);
