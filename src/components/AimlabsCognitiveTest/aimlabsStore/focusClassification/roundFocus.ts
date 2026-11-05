interface RoundFocusInput {
  roundRecall: number;
  roundPrecision: number;
  accuracy: number;
  roundBalancedAcc: number;
  cv: number;
  rtsLength: number;
}

// Focus classification for one completed round (CPT or SART), shown on the
// intermission screen.
export function classifyRoundFocus({
  roundRecall,
  roundPrecision,
  accuracy,
  roundBalancedAcc,
  cv,
  rtsLength,
}: RoundFocusInput): "Optimal Focus" | "Steady Focus" | "Variable Focus" {
  if (
    roundRecall < 80 ||
    roundPrecision < 70 ||
    accuracy < 75 ||
    roundBalancedAcc < 70 ||
    cv > 0.28 ||
    cv === 0
  ) {
    return "Variable Focus";
  }
  if (cv > 0 && cv <= 0.18 && accuracy >= 88 && roundPrecision >= 85 && roundRecall >= 90 && rtsLength >= 8) {
    return "Optimal Focus";
  }
  return "Steady Focus";
}
