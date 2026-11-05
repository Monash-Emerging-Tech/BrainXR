import type { RoundMetrics } from "../types";
import type { CognitiveSessionReport } from "../reportStorage";
import { computeRecall, computeSpecificity, computeBalancedAccuracy } from "./trialCounters";
import { computeSessionRtStats } from "./rtStats";
import { classifySessionFocus } from "./focusClassification";

// Combines the two completed rounds into the session-level report that gets
// persisted to localStorage and shown on the finished screen.
export function buildSessionReport(r1: RoundMetrics, r2: RoundMetrics): CognitiveSessionReport {
  const allRts = [...r1.reactionTimes, ...r2.reactionTimes];
  const { meanRT: overallMeanRT, sdRT: overallSdRT, cv: overallCv } = computeSessionRtStats(allRts);

  const overallAccuracy = Math.round((r1.accuracy + r2.accuracy) / 2);

  const totalGo = r1.goHits + r2.goHits;
  const totalCommissions = r1.commissions + r2.commissions;
  const totalPresses = totalGo + totalCommissions;
  const overallPrecision =
    totalPresses > 0 ? Math.min(100, Math.max(0, Math.round((totalGo / totalPresses) * 100))) : 0;

  const totalOmissions = r1.omissions + r2.omissions;
  const totalGoTargets = totalGo + totalOmissions;
  const overallRecall = computeRecall({ goHits: totalGo, omissions: totalOmissions });
  const overallOmissionRate = totalGoTargets > 0 ? Math.round((totalOmissions / totalGoTargets) * 100) : 0;

  const totalCorrectRejections = r1.correctRejections + r2.correctRejections;
  const overallSpecificity = computeSpecificity({
    correctRejections: totalCorrectRejections,
    commissions: totalCommissions,
  });
  const overallBalancedAcc = computeBalancedAccuracy(overallRecall, overallSpecificity);

  const { focusClassification, focusDescription } = classifySessionFocus({
    overallRecall,
    overallPrecision,
    overallAccuracy,
    overallBalancedAcc,
    overallCv,
    allRtsLength: allRts.length,
    overallOmissionRate,
  });

  return {
    id: `session-${Date.now()}`,
    timestamp: Date.now(),
    dateStr: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    round1Metrics: r1,
    round2Metrics: r2,
    overallAccuracy,
    overallPrecision,
    overallOmissionRate,
    overallMeanRT,
    overallSdRT,
    overallCv,
    focusClassification,
    focusDescription,
    telemetryHistory: [...(r1.telemetryTable || []), ...(r2.telemetryTable || [])],
  };
}
