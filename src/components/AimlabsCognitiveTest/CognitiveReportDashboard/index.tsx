import React, { useState, useEffect } from "react";
import { loadLastSessionReport, saveSessionReport, FOCUS_CLASSIFICATION_INFO, type CognitiveSessionReport } from "../reportStorage";
import { generateDemoReport } from "./generateDemoReport";
import { EmptyReportState } from "./EmptyReportState";
import { ReportHeader } from "./ReportHeader";
import { ClassificationHero } from "./ClassificationHero";
import { ReportTabs, type ReportTab } from "./ReportTabs";
import { OverviewTab } from "./OverviewTab";
import { TelemetryLogTab } from "./TelemetryLogTab";
import { ScienceTab } from "./ScienceTab";

export const CognitiveReportDashboard: React.FC = () => {
  const [report, setReport] = useState<CognitiveSessionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<ReportTab>("overview");

  useEffect(() => {
    const loaded = loadLastSessionReport();
    setReport(loaded);
    setIsLoading(false);
  }, []);

  const handleLoadDemoData = () => {
    const demoReport = generateDemoReport();
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

  const r1Go = ((r1?.goHits || 0) + (r1?.omissions || 0));
  const r1OmissionRate = r1?.omissionRate ?? (r1Go > 0 ? Math.round(((r1?.omissions || 0) / r1Go) * 100) : 0);
  const r2Go = ((r2?.goHits || 0) + (r2?.omissions || 0));
  const r2OmissionRate = r2?.omissionRate ?? (r2Go > 0 ? Math.round(((r2?.omissions || 0) / r2Go) * 100) : 0);
  const totalGo = r1Go + r2Go;
  const totalOmissions = ((r1?.omissions || 0) + (r2?.omissions || 0));
  const overallOmissionRate =
    report?.overallOmissionRate ?? (totalGo > 0 ? Math.round((totalOmissions / totalGo) * 100) : 0);

  const fullTelemetry = report?.telemetryHistory || [];

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
    return <EmptyReportState onLoadDemoData={handleLoadDemoData} />;
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 font-sans pb-16 selection:bg-indigo-500/30 relative">
      {/* Subtle ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08)_0%,transparent_70%)] pointer-events-none" />

      <ReportHeader report={report} />

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

        <ClassificationHero report={report} classMeta={classMeta} overallOmissionRate={overallOmissionRate} />

        <ReportTabs selectedTab={selectedTab} onSelectTab={setSelectedTab} telemetryCount={fullTelemetry.length} />

        {selectedTab === "overview" && (
          <OverviewTab
            report={report}
            r1={r1}
            r2={r2}
            r1OmissionRate={r1OmissionRate}
            r2OmissionRate={r2OmissionRate}
            fullTelemetry={fullTelemetry}
          />
        )}

        {selectedTab === "telemetry" && <TelemetryLogTab fullTelemetry={fullTelemetry} />}

        {selectedTab === "science" && <ScienceTab report={report} />}

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
