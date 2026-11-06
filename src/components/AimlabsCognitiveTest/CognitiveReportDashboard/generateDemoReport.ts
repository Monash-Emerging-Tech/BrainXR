import type { CognitiveSessionReport } from "../reportStorage";
import type { TargetTelemetryRecord } from "../types";

// Representative sample session report, used when no real session is on
// disk yet so the dashboard has something to render.
export function generateDemoReport(): CognitiveSessionReport {
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

  return {
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
}
