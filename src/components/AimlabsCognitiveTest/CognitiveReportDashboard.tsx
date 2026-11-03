import React, { useState, useEffect, useMemo } from "react";
import {
  loadLastSessionReport,
  exportReportAsJSON,
  exportReportAsCSV,
  saveSessionReport,
  FOCUS_CLASSIFICATION_INFO,
  type CognitiveSessionReport,
} from "./reportStorage";
import type { TargetTelemetryRecord } from "./types";
import { TelemetryPerformanceGraph } from "./TelemetryPerformanceGraph";

export const CognitiveReportDashboard: React.FC = () => {
  const [report, setReport] = useState<CognitiveSessionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"overview" | "telemetry" | "science">("overview");
  const [telemetryFilter, setTelemetryFilter] = useState<"all" | "hit" | "avoided" | "correct" | "incorrect">("all");
  const [telemetryRound, setTelemetryRound] = useState<"all" | "round1" | "round2">("all");
  const [telemetrySearch, setTelemetrySearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    const loaded = loadLastSessionReport();
    setReport(loaded);
    setIsLoading(false);
  }, []);

  const handleLoadDemoData = () => {
    // Generate representative sample report if none exists
    const demoTrials: TargetTelemetryRecord[] = [];
    let movingSum = 0;
    const rts1: number[] = [];
    const rts2: number[] = [];

    for (let i = 0; i < 374; i++) {
      const isRound1 = i < 187;
      const isGo = isRound1 ? Math.random() > 0.2 : Math.random() < 0.2;
      const targetType = isRound1 ? (isGo ? "sphere" : "box") : isGo ? "box" : "sphere";
      const responded = isGo ? Math.random() > 0.04 : Math.random() < 0.12;
      const rt = responded ? Math.round(230 + Math.random() * 80 + (isRound1 ? 0 : 35)) : null;

      if (rt) {
        movingSum += rt;
        if (isRound1) rts1.push(rt);
        else rts2.push(rt);
      }

      demoTrials.push({
        trialIndex: i + 1,
        targetType,
        isGo,
        userResponded: responded,
        isCorrect: (isGo && responded) || (!isGo && !responded),
        reactionTime: rt,
        cumulativeAccuracy: Math.round(92 + Math.random() * 6),
        movingAverageRT: Math.round(movingSum / Math.max(1, isRound1 ? rts1.length : rts2.length)),
        movingSdRT: Math.round(38 + Math.random() * 12),
        timestamp: Date.now() - (374 - i) * 1200,
      });
    }

    const m1Mean = Math.round(rts1.reduce((a, b) => a + b, 0) / rts1.length);
    const m2Mean = Math.round(rts2.reduce((a, b) => a + b, 0) / rts2.length);

    const demoReport: CognitiveSessionReport = {
      id: "sample-demo-session",
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      round1Metrics: {
        round: 1,
        roundName: "Round 1: CPT",
        totalTrials: 187,
        sphereCount: 150,
        boxCount: 37,
        goHits: 144,
        omissions: 6,
        commissions: 4,
        correctRejections: 33,
        reactionTimes: rts1,
        meanReactionTime: m1Mean,
        sdReactionTime: 42,
        cv: 0.17,
        focusLevel: "Optimal Focus",
        score: 1440,
        accuracy: 94.6,
        precision: 97.3,
        telemetryTable: demoTrials.slice(0, 187),
      },
      round2Metrics: {
        round: 2,
        roundName: "Round 2: SART",
        totalTrials: 187,
        sphereCount: 150,
        boxCount: 37,
        goHits: 35,
        omissions: 2,
        commissions: 18,
        correctRejections: 132,
        reactionTimes: rts2,
        meanReactionTime: m2Mean,
        sdReactionTime: 58,
        cv: 0.21,
        focusLevel: "Steady Focus",
        score: 1380,
        accuracy: 89.3,
        precision: 66.0,
        telemetryTable: demoTrials.slice(187),
      },
      overallAccuracy: 92,
      overallPrecision: 89,
      overallMeanRT: Math.round((m1Mean + m2Mean) / 2),
      overallSdRT: 48,
      overallCv: 0.19,
      focusClassification: "Steady Focus",
      focusDescription:
        "Consistent cognitive throughput with standard baseline variability and expected minor sensorimotor fluctuations.",
      telemetryHistory: demoTrials,
    };

    saveSessionReport(demoReport);
    setReport(demoReport);
  };

  const r1 = report?.round1Metrics;
  const r2 = report?.round2Metrics;
  const classMeta = report
    ? report.focusClassification === "Optimal Focus"
      ? FOCUS_CLASSIFICATION_INFO.optimal
      : report.focusClassification === "Steady Focus"
      ? FOCUS_CLASSIFICATION_INFO.steady
      : FOCUS_CLASSIFICATION_INFO.variable
    : FOCUS_CLASSIFICATION_INFO.steady;

  const totalTrials = ((r1?.totalTrials || 187) + (r2?.totalTrials || 187));
  const r1Go = ((r1?.goHits || 0) + (r1?.omissions || 0));
  const r1OmissionRate = r1?.omissionRate ?? (r1Go > 0 ? Math.round(((r1?.omissions || 0) / r1Go) * 100) : 0);
  const r2Go = ((r2?.goHits || 0) + (r2?.omissions || 0));
  const r2OmissionRate = r2?.omissionRate ?? (r2Go > 0 ? Math.round(((r2?.omissions || 0) / r2Go) * 100) : 0);
  const totalGo = r1Go + r2Go;
  const totalOmissions = ((r1?.omissions || 0) + (r2?.omissions || 0));
  const overallOmissionRate =
    report?.overallOmissionRate ?? (totalGo > 0 ? Math.round((totalOmissions / totalGo) * 100) : 0);

  const fullTelemetry = report?.telemetryHistory || [];

  // Filtered telemetry with useMemo
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

  const totalPages = Math.ceil(filteredTelemetry.length / pageSize) || 1;
  const paginatedTelemetry = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTelemetry.slice(start, start + pageSize);
  }, [filteredTelemetry, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b12] text-slate-200 flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Loading cognitive assessment telemetry...</span>
        </div>
      </div>
    );
  }

  if (!report || !r1 || !r2) {
    return (
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
              onClick={handleLoadDemoData}
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
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 font-sans pb-16 selection:bg-indigo-500/30 relative">
      {/* Subtle ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Top Navigation Header */}
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

      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
        {/* Printable Document Header (visible only on print) */}
        <div className="hidden print:block mb-6 border-b border-slate-700 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-mono">BrainXR · Direction of Focus Clinical Report</h1>
              <p className="text-xs text-slate-600 font-mono mt-1">Session ID: {report.id} · Date: {report.dateStr}</p>
            </div>
            <div className="text-right text-xs font-mono text-slate-600">
              Monash Nexus for Emerging Technologies (MNET)
            </div>
          </div>
        </div>

        {/* Hero Executive Classification Banner */}
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

        {/* Section Segmented Control / Tab Navigation: Polished Cyber-Glass Segmented Bar */}
        <div 
          role="tablist" 
          aria-label="Report Sections" 
          className="p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl mb-6 font-mono text-xs flex items-center gap-1.5 overflow-x-auto shadow-xl print:hidden"
        >
          <button
            role="tab"
            aria-selected={selectedTab === "overview"}
            onClick={() => setSelectedTab("overview")}
            className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer uppercase font-bold tracking-wider whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${
              selectedTab === "overview"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                selectedTab === "overview"
                  ? "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)] animate-pulse"
                  : "bg-slate-600 group-hover:bg-slate-400"
              }`}
            />
            <span>Comparative Metrics</span>
          </button>

          <button
            role="tab"
            aria-selected={selectedTab === "telemetry"}
            onClick={() => setSelectedTab("telemetry")}
            className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer uppercase font-bold tracking-wider whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${
              selectedTab === "telemetry"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                selectedTab === "telemetry"
                  ? "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)] animate-pulse"
                  : "bg-slate-600 group-hover:bg-slate-400"
              }`}
            />
            <span>Full Telemetry Log</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 transition-colors ${
                selectedTab === "telemetry"
                  ? "bg-white/20 text-white"
                  : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
              }`}
            >
              {fullTelemetry.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={selectedTab === "science"}
            onClick={() => setSelectedTab("science")}
            className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer uppercase font-bold tracking-wider whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/80 ${
              selectedTab === "science"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                selectedTab === "science"
                  ? "bg-[#F3DA66] shadow-[0_0_8px_rgba(243,218,102,0.9)] animate-pulse"
                  : "bg-slate-600 group-hover:bg-slate-400"
              }`}
            />
            <span>Focus Classification Science</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & COMPARATIVE ANALYSIS */}
        {selectedTab === "overview" && (
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
        )}

        {/* TAB 2: FULL TELEMETRY LOG */}
        {selectedTab === "telemetry" && (
          <div className="space-y-4">
            {/* Full Telemetry Log Card */}
            <div className="bg-slate-950/80 rounded-3xl border border-slate-800/80 overflow-hidden font-mono text-xs backdrop-blur-md">
              <div className="px-6 py-5 bg-slate-900/60 border-b border-slate-800 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-white text-base">Session Telemetry Records</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Showing {filteredTelemetry.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
                      {Math.min(currentPage * pageSize, filteredTelemetry.length)} of {filteredTelemetry.length} filtered trials ({fullTelemetry.length} total)
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
                        className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold cursor-pointer transition-all ${
                          telemetryRound === r.key
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
                        className={`px-3 py-1 rounded-full uppercase tracking-wider text-[10px] cursor-pointer transition-all ${
                          telemetryFilter === f.key
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
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  t.targetType === "sphere"
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
                                className={`font-bold ${
                                  t.userResponded ? "text-cyan-300" : "text-slate-400"
                                }`}
                              >
                                {t.userResponded ? "Hit" : "Avoided"}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`inline-flex items-center gap-1 font-bold ${
                                  t.isCorrect ? "text-emerald-400" : "text-rose-400"
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
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentPage === pageNum
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
        )}

        {/* TAB 3: FOCUS CLASSIFICATION SCIENCE & CLINICAL BREAKDOWN */}
        {selectedTab === "science" && (
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
                      className={`p-5 rounded-2xl border transition-all ${
                        isCurrent
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
        )}

        {/* Bottom Quick Navigation Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <a
              href="/direction"
              className="py-3 px-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 transition-all border border-indigo-400/40"
            >
              Play Direction Game Again →
            </a>
            <a
              href="/"
              className="py-3 px-5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-wider border border-slate-700/60 transition-all hover:text-white"
            >
              Return to Home
            </a>
          </div>

          <div className="text-slate-500 text-[11px]">
            BrainXR · Monash Nexus for Emerging Technologies (MNET)
          </div>
        </div>
      </main>
    </div>
  );
};
