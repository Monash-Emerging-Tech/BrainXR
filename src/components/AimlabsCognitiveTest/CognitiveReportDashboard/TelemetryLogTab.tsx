import React, { useState, useEffect, useMemo } from "react";
import type { TargetTelemetryRecord } from "../types";

interface TelemetryLogTabProps {
  fullTelemetry: TargetTelemetryRecord[];
}

const PAGE_SIZE = 50;

export const TelemetryLogTab: React.FC<TelemetryLogTabProps> = ({ fullTelemetry }) => {
  const [telemetryFilter, setTelemetryFilter] = useState<"all" | "hit" | "avoided" | "correct" | "incorrect">("all");
  const [telemetryRound, setTelemetryRound] = useState<"all" | "round1" | "round2">("all");
  const [telemetrySearch, setTelemetrySearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTelemetry = useMemo(() => {
    return fullTelemetry.filter((t) => {
      // Round filter
      const isR1 = t.trialIndex <= 187;
      if (telemetryRound === "round1" && !isR1) return false;
      if (telemetryRound === "round2" && isR1) return false;

      // Status filter
      if (telemetryFilter === "hit" && !t.userResponded) return false;
      if (telemetryFilter === "avoided" && t.userResponded) return false;
      if (telemetryFilter === "correct" && !t.isCorrect) return false;
      if (telemetryFilter === "incorrect" && t.isCorrect) return false;

      // Search filter
      if (telemetrySearch.trim()) {
        const query = telemetrySearch.toLowerCase().trim();
        const trialMatch = `#${t.trialIndex}`.includes(query) || `${t.trialIndex}` === query;
        const targetMatch = t.targetType.toLowerCase().includes(query);
        const actionMatch = (t.userResponded ? "hit" : "avoided").includes(query);
        const resultMatch = (t.isCorrect ? "correct" : "incorrect").includes(query);
        if (!trialMatch && !targetMatch && !actionMatch && !resultMatch) {
          return false;
        }
      }

      return true;
    });
  }, [fullTelemetry, telemetryFilter, telemetryRound, telemetrySearch]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [telemetryFilter, telemetryRound, telemetrySearch]);

  const totalPages = Math.ceil(filteredTelemetry.length / PAGE_SIZE) || 1;
  const paginatedTelemetry = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTelemetry.slice(start, start + PAGE_SIZE);
  }, [filteredTelemetry, currentPage]);

  return (
    <div className="space-y-4">
      {/* Full Telemetry Log Card */}
      <div className="bg-slate-950/80 rounded-3xl border border-slate-800/80 overflow-hidden font-mono text-xs backdrop-blur-md">
        <div className="px-6 py-5 bg-slate-900/60 border-b border-slate-800 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-white text-base">Session Telemetry Records</h3>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Showing {filteredTelemetry.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} -{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredTelemetry.length)} of {filteredTelemetry.length} filtered trials ({fullTelemetry.length} total)
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[200px] sm:w-64">
              <input
                type="text"
                value={telemetrySearch}
                onChange={(e) => setTelemetrySearch(e.target.value)}
                placeholder="Search trial #, hit, avoided..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {telemetrySearch && (
                <button
                  onClick={() => setTelemetrySearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter and Round Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            {/* Round Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 px-2 font-semibold">ROUND:</span>
              {(
                [
                  { key: "all", label: "All" },
                  { key: "round1", label: "Round 1 (CPT)" },
                  { key: "round2", label: "Round 2 (SART)" },
                ] as const
              ).map((r) => (
                <button
                  key={r.key}
                  onClick={() => setTelemetryRound(r.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold cursor-pointer transition-all ${telemetryRound === r.key
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 mr-1 font-semibold">OUTCOME:</span>
              {(
                [
                  { key: "all", label: "All" },
                  { key: "hit", label: "Hit Only" },
                  { key: "avoided", label: "Avoided Only" },
                  { key: "correct", label: "Correct Only" },
                  { key: "incorrect", label: "Incorrect Only" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTelemetryFilter(f.key)}
                  className={`px-3 py-1 rounded-full uppercase tracking-wider text-[10px] cursor-pointer transition-all ${telemetryFilter === f.key
                      ? "bg-indigo-600 text-white font-bold border border-indigo-400/50 shadow-md"
                      : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Table with clear visual hierarchy */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 pl-6 font-semibold">Trial #</th>
                <th className="p-3.5 font-semibold">Round</th>
                <th className="p-3.5 font-semibold">Target Stimulus</th>
                <th className="p-3.5 font-semibold">Rule Type</th>
                <th className="p-3.5 font-semibold">User Action</th>
                <th className="p-3.5 font-semibold">Result</th>
                <th className="p-3.5 font-semibold">Reaction Time</th>
                <th className="p-3.5 font-semibold">Rolling Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedTelemetry.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    No telemetry records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTelemetry.map((t) => {
                  const isRound1 = t.trialIndex <= 187;
                  return (
                    <tr key={t.trialIndex} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 pl-6 text-slate-400 font-semibold">#{t.trialIndex}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold ${isRound1 ? "text-cyan-400" : "text-[#F3DA66]"}`}>
                          {isRound1 ? "Round 1 (CPT)" : "Round 2 (SART)"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.targetType === "sphere"
                              ? "bg-green-950/80 text-green-300 border border-green-500/40"
                              : "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 ${t.targetType === "sphere" ? "rounded-full bg-green-400" : "rounded-xs bg-rose-400"}`}
                          />
                          {t.targetType === "sphere" ? "Green Sphere" : "Red Box"}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-medium">
                        {t.isGo ? "GO (Press)" : "NO-GO (Avoid)"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold ${t.userResponded ? "text-cyan-300" : "text-slate-400"
                            }`}
                        >
                          {t.userResponded ? "Hit" : "Avoided"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${t.isCorrect ? "text-emerald-400" : "text-rose-400"
                            }`}
                        >
                          <span>{t.isCorrect ? "✓" : "✗"}</span>
                          <span>{t.isCorrect ? "Correct" : "Incorrect"}</span>
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">
                        {t.reactionTime ? (
                          <span className="text-cyan-300 font-semibold">{t.reactionTime} ms</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-medium">{t.cumulativeAccuracy}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              Page <span className="text-white font-bold">{currentPage}</span> of{" "}
              <span className="text-white font-bold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-mono uppercase transition-colors cursor-pointer"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1 font-mono text-xs">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = Math.min(currentPage - 2 + i, totalPages - (4 - i));
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-mono uppercase transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
