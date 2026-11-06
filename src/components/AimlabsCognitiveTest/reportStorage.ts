import type { RoundMetrics, TargetTelemetryRecord } from "./types";

export interface CognitiveSessionReport {
  id: string;
  timestamp: number;
  dateStr: string;
  round1Metrics: RoundMetrics;
  round2Metrics: RoundMetrics;
  overallAccuracy: number;
  overallPrecision: number;
  overallOmissionRate?: number;
  overallMeanRT: number;
  overallSdRT: number;
  overallCv: number;
  focusClassification: "Optimal Focus" | "Steady Focus" | "Variable Focus";
  focusDescription: string;
  telemetryHistory: TargetTelemetryRecord[];
}

export const FOCUS_CLASSIFICATION_INFO = {
  optimal: {
    tier: "Optimal Focus",
    range: "RT CV ≤ 0.18 · Acc ≥ 88%",
    color: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    summary: "High Attentional Vigilance",
    description: "Consistent reaction times with fast response speed and minimal lapses.",
    citation: "Robertson et al. (1997)",
  },
  steady: {
    tier: "Steady Focus",
    range: "0.19 ≤ RT CV ≤ 0.28 · Acc ≥ 75%",
    color: "text-cyan-400",
    bg: "bg-cyan-950/60",
    border: "border-cyan-500/40",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    summary: "Stable & Consistent Attention",
    description: "Reliable attention with normal reaction time variation.",
    citation: "Conners (2000)",
  },
  variable: {
    tier: "Variable Focus",
    range: "RT CV > 0.20* · Lapses > 20%",
    color: "text-[#F3DA66]",
    bg: "bg-[#F3DA66]/15",
    border: "border-[#F3DA66]/40",
    badge: "bg-[#F3DA66]/20 text-[#F3DA66] border-[#F3DA66]/30",
    summary: "Fluctuating Response Timing",
    description: "Response times varied or attention drifted during the test.",
    citation: "Smilek et al. (2010)",
  },
};

export type FocusClassificationInfo = (typeof FOCUS_CLASSIFICATION_INFO)[keyof typeof FOCUS_CLASSIFICATION_INFO];

export const REPORT_STORAGE_KEY = "brainxr:last-run-report";
export const REPORT_HISTORY_KEY = "brainxr:report-history";

/**
 * Persists the completed cognitive assessment session report to localStorage.
 */
export function saveSessionReport(report: CognitiveSessionReport): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));

    // Also append to historical sessions list (capped at last 10 runs)
    const existingHistoryRaw = localStorage.getItem(REPORT_HISTORY_KEY);
    const history: CognitiveSessionReport[] = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];
    const updated = [report, ...history.filter((h) => h.id !== report.id)].slice(0, 10);
    localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Unable to save cognitive report to localStorage:", err);
  }
}

/**
 * Retrieves the most recent cognitive assessment report from localStorage.
 */
export function loadLastSessionReport(): CognitiveSessionReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REPORT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CognitiveSessionReport;
  } catch (err) {
    console.warn("Unable to load cognitive report from localStorage:", err);
    return null;
  }
}

/**
 * Generates and downloads a structured JSON performance telemetry report.
 */
export function exportReportAsJSON(report: CognitiveSessionReport): void {
  if (typeof window === "undefined") return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
  const filename = `brainxr-cognitive-report-${new Date(report.timestamp).toISOString().slice(0, 10)}.json`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Generates and downloads a comma-separated values (CSV) telemetry report.
 */
export function exportReportAsCSV(report: CognitiveSessionReport): void {
  if (typeof window === "undefined") return;
  const lines: string[] = [];

  const r1Go = report.round1Metrics.goHits + report.round1Metrics.omissions;
  const r1OmitRate = r1Go > 0 ? Math.round((report.round1Metrics.omissions / r1Go) * 100) : 0;
  const r2Go = report.round2Metrics.goHits + report.round2Metrics.omissions;
  const r2OmitRate = r2Go > 0 ? Math.round((report.round2Metrics.omissions / r2Go) * 100) : 0;
  const totalGo = r1Go + r2Go;
  const totalOmissions = report.round1Metrics.omissions + report.round2Metrics.omissions;
  const overallOmissionRate =
    report.overallOmissionRate ?? (totalGo > 0 ? Math.round((totalOmissions / totalGo) * 100) : 0);

  // Summary metadata header
  lines.push("BRAINXR COGNITIVE ASSESSMENT REPORT");
  lines.push(`Session ID,${report.id}`);
  lines.push(`Date,${report.dateStr}`);
  lines.push(`Focus Classification,${report.focusClassification}`);
  lines.push(`Overall Accuracy (%),${report.overallAccuracy}`);
  lines.push(`Overall Precision (%),${report.overallPrecision ?? 100}`);
  lines.push(`Overall Omission Rate (%),${overallOmissionRate}`);
  lines.push(`Overall Mean RT (ms),${report.overallMeanRT}`);
  lines.push(`Overall SD (ms),${report.overallSdRT}`);
  lines.push(`Overall Response Time CV (SD/Mean),${report.overallCv}`);
  lines.push("");

  // Comparative metrics summary
  lines.push("ROUND COMPARISON METRICS");
  lines.push("Metric,Round 1 (CPT),Round 2 (SART)");
  lines.push(`Target (Go),${report.round1Metrics.round === 1 ? "Green Sphere" : "Red Box"},${report.round2Metrics.round === 2 ? "Red Box" : "Green Sphere"}`);
  lines.push(`Go Hits,${report.round1Metrics.goHits},${report.round2Metrics.goHits}`);
  lines.push(`No-Go Alarms,${report.round1Metrics.commissions},${report.round2Metrics.commissions}`);
  lines.push(`Correct Rejections,${report.round1Metrics.correctRejections},${report.round2Metrics.correctRejections}`);
  lines.push(`Omission Errors (Missed Go),${report.round1Metrics.omissions},${report.round2Metrics.omissions}`);
  lines.push(`Mean RT (ms),${Math.round(report.round1Metrics.meanReactionTime)},${Math.round(report.round2Metrics.meanReactionTime)}`);
  lines.push(`SD RT (ms),${report.round1Metrics.sdReactionTime ?? 0},${report.round2Metrics.sdReactionTime ?? 0}`);
  lines.push(`Response Time Coefficient of Variation (CV),${report.round1Metrics.cv ?? 0},${report.round2Metrics.cv ?? 0}`);
  lines.push(`Accuracy (%),${Math.round(report.round1Metrics.accuracy)},${Math.round(report.round2Metrics.accuracy)}`);
  lines.push(`Precision (%),${Math.round(report.round1Metrics.precision ?? 100)},${Math.round(report.round2Metrics.precision ?? 100)}`);
  lines.push(`Omission Rate (%),${r1OmitRate},${r2OmitRate}`);
  lines.push("");

  // Detailed trial-by-trial telemetry
  lines.push("TRIAL-BY-TRIAL TELEMETRY");
  lines.push("Trial Index,Target Type,Is Go,User Responded,Is Correct,Reaction Time (ms),Cumulative Accuracy (%),Cumulative Precision (%),Moving Avg RT (ms),Moving SD RT (ms),Timestamp");

  const telemetry = report.telemetryHistory || [];
  telemetry.forEach((t) => {
    lines.push([
      t.trialIndex,
      t.targetType,
      t.isGo ? "TRUE" : "FALSE",
      t.userResponded ? "TRUE" : "FALSE",
      t.isCorrect ? "TRUE" : "FALSE",
      t.reactionTime ?? "",
      t.cumulativeAccuracy,
      t.cumulativePrecision ?? "",
      t.movingAverageRT,
      t.movingSdRT,
      t.timestamp,
    ].join(","));
  });

  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(lines.join("\n"));
  const filename = `brainxr-cognitive-telemetry-${new Date(report.timestamp).toISOString().slice(0, 10)}.csv`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", csvContent);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

