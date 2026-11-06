import type { TargetTelemetryRecord } from "../types";

// Finds the index in `data` where Round 1 hands off to Round 2, so the chart
// can draw a divider. Looks for a reset/rollover in trialIndex; falls back to
// the midpoint once there are clearly enough trials for both rounds to be
// present but no detectable split (e.g. a demo dataset).
export function detectRoundSplitIndex(
  data: TargetTelemetryRecord[],
  count: number,
  showAllTrials: boolean
): number {
  let splitIndex = -1;
  if (showAllTrials || count > 50) {
    for (let i = 1; i < count; i++) {
      if (
        data[i].trialIndex < data[i - 1].trialIndex ||
        (data[i].trialIndex > 187 && data[i - 1].trialIndex <= 187)
      ) {
        splitIndex = i;
        break;
      }
    }
    if (splitIndex === -1 && count >= 180) {
      splitIndex = Math.floor(count / 2);
    }
  }
  return splitIndex;
}
