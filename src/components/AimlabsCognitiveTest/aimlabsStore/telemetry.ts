import type { StimulusDefinition, TargetTelemetryRecord } from "../types";
import { computeAccuracy, computePrecision, type TrialCounters } from "./trialCounters";

// One row of the per-trial telemetry table: cumulative accuracy/precision at
// that point in the round, plus a trailing 10-trial moving-window RT stat so
// the report can show whether the player sped up or settled over time.
export function buildTelemetryRecord(
  trialIndex: number,
  item: StimulusDefinition,
  userResponded: boolean,
  isCorrect: boolean,
  rt: number | null,
  counters: TrialCounters
): TargetTelemetryRecord {
  const cumulativeAccuracy = Math.round(computeAccuracy(counters));
  const cumulativePrecision = computePrecision(counters);

  const windowRTs = counters.reactionTimes.slice(-10);
  const mCount = windowRTs.length;
  let movingAverageRT = 0;
  let movingSdRT = 0;

  if (mCount > 0) {
    movingAverageRT = Math.round(windowRTs.reduce((a, b) => a + b, 0) / mCount);
    if (mCount > 1) {
      const v = windowRTs.reduce((acc, val) => acc + Math.pow(val - movingAverageRT, 2), 0) / (mCount - 1);
      movingSdRT = Math.round(Math.sqrt(v));
    }
  }

  return {
    trialIndex,
    targetType: item.type,
    isGo: item.isGo,
    userResponded,
    isCorrect,
    reactionTime: rt,
    cumulativeAccuracy,
    cumulativePrecision,
    movingAverageRT,
    movingSdRT,
    timestamp: performance.now(),
  };
}
