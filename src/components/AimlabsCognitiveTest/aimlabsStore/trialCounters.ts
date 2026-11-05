// Mutable per-round response tallies, and the pure CPT/SART accuracy
// formulas derived from them. These formulas are shared verbatim between
// the live (per-trial), round, and session reporting layers.

export interface TrialCounters {
  goHits: number;
  omissions: number;
  commissions: number;
  correctRejections: number;
  reactionTimes: number[];
  totalShots: number;
  accurateShots: number;
  boxesHit: number;
  boxesMissed: number;
  spheresHit: number;
  spheresMissed: number;
}

export function createEmptyCounters(): TrialCounters {
  return {
    goHits: 0,
    omissions: 0,
    commissions: 0,
    correctRejections: 0,
    reactionTimes: [],
    totalShots: 0,
    accurateShots: 0,
    boxesHit: 0,
    boxesMissed: 0,
    spheresHit: 0,
    spheresMissed: 0,
  };
}

export function computeAccuracy(counters: Pick<TrialCounters, "totalShots" | "accurateShots">): number {
  if (counters.totalShots <= 0) return 100;
  return Math.min(100, Math.max(0, (counters.accurateShots / counters.totalShots) * 100));
}

export function computePrecision(counters: Pick<TrialCounters, "goHits" | "commissions" | "omissions">): number {
  const totalPresses = counters.goHits + counters.commissions;
  if (totalPresses > 0) {
    return Math.min(100, Math.max(0, Math.round((counters.goHits / totalPresses) * 100)));
  }
  return counters.omissions > 0 ? 0 : 100;
}

export function computeRecall(counters: Pick<TrialCounters, "goHits" | "omissions">): number {
  const totalGoTargets = counters.goHits + counters.omissions;
  return totalGoTargets > 0 ? (counters.goHits / totalGoTargets) * 100 : 100;
}

export function computeSpecificity(counters: Pick<TrialCounters, "correctRejections" | "commissions">): number {
  const totalNoGoTargets = counters.correctRejections + counters.commissions;
  return totalNoGoTargets > 0 ? (counters.correctRejections / totalNoGoTargets) * 100 : 100;
}

export function computeBalancedAccuracy(recall: number, specificity: number): number {
  return (recall + specificity) / 2;
}
