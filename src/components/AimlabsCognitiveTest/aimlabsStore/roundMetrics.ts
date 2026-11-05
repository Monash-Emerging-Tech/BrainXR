import { TOTAL_TRIALS, SPHERE_COUNT, BOX_COUNT } from "../sequencer";
import type { CognitiveRoundType, RoundMetrics, TargetTelemetryRecord } from "../types";
import { computeRecall, computeSpecificity, computeBalancedAccuracy, computePrecision, type TrialCounters } from "./trialCounters";
import { computeRoundRtStats } from "./rtStats";
import { classifyRoundFocus } from "./focusClassification";

export function buildRoundMetrics(params: {
  round: CognitiveRoundType;
  roundOrderPrefix: "Round 1" | "Round 2";
  score: number;
  accuracy: number;
  counters: TrialCounters;
  telemetryTable: TargetTelemetryRecord[];
}): RoundMetrics {
  const { round, roundOrderPrefix, score, accuracy, counters, telemetryTable } = params;
  const paradigmName = round === 1 ? "CPT" : "SART";

  const { meanRT, sdRT, cv } = computeRoundRtStats(counters.reactionTimes);
  const roundPrecision = computePrecision(counters);
  const roundRecall = computeRecall(counters);
  const roundSpecificity = computeSpecificity(counters);
  const roundBalancedAcc = computeBalancedAccuracy(roundRecall, roundSpecificity);
  const focusLevel = classifyRoundFocus({
    roundRecall,
    roundPrecision,
    accuracy,
    roundBalancedAcc,
    cv,
    rtsLength: counters.reactionTimes.length,
  });

  return {
    round,
    roundName: `${roundOrderPrefix}: ${paradigmName}`,
    totalTrials: TOTAL_TRIALS,
    sphereCount: SPHERE_COUNT,
    boxCount: BOX_COUNT,
    goHits: counters.goHits,
    omissions: counters.omissions,
    commissions: counters.commissions,
    correctRejections: counters.correctRejections,
    reactionTimes: counters.reactionTimes,
    meanReactionTime: meanRT,
    sdReactionTime: sdRT,
    cv,
    focusLevel,
    score,
    accuracy,
    precision: roundPrecision,
    omissionRate: Math.round(100 - roundRecall),
    telemetryTable: [...telemetryTable],
  };
}
