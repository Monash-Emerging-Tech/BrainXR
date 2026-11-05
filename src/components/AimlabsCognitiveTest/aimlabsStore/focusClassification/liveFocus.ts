import type { FocusLevel } from "./types";

interface LiveFocusInput {
  n: number;
  totalShots: number;
  acc: number;
  precision: number;
  recall: number;
  specificity: number;
  balancedAcc: number;
  cv: number;
}

// Per-trial live focus classification, shown while a round is in progress.
export function classifyLiveFocus({
  n,
  totalShots,
  acc,
  precision,
  recall,
  specificity,
  balancedAcc,
  cv,
}: LiveFocusInput): { focusLevel: FocusLevel; focusDescription: string } {
  let focusLevel: FocusLevel = "Calibrating";
  let focusDescription = "Collecting baseline trials";

  // Gate 1: Calibration / minimum sample
  if (n >= 4 && totalShots >= 8) {
    // Check for Disengagement / Mindless Autopilot / High Error Rate
    const isDisengaged = recall < 80; // User missing > 20% of Go targets (omission lapses / inattention)
    const isIndiscriminate = precision < 70 || specificity < 50; // User clicking No-Go impulsively
    const isLowAccuracy = acc < 75 || balancedAcc < 70; // High overall error rate

    if (isDisengaged) {
      focusLevel = "Variable Focus";
      const missPct = Math.round(100 - recall);
      focusDescription = `Attentional lapse · ${missPct}% Go targets missed (OER > 20%)`;
    } else if (isIndiscriminate) {
      focusLevel = "Variable Focus";
      focusDescription = `Motor disinhibition · Low response precision (${Math.round(precision)}%)`;
    } else if (isLowAccuracy) {
      focusLevel = "Variable Focus";
      focusDescription = `High decision error rate (${Math.round(acc)}% accuracy)`;
    } else {
      // Performance gates passed -> evaluate temporal stability via CV
      if (cv > 0 && cv <= 0.18 && acc >= 88 && precision >= 85 && recall >= 90 && n >= 8) {
        focusLevel = "Optimal Focus";
        focusDescription = `Laser-like vigilance · Multiplier ${cv}x Mean RT (${Math.round(precision)}% Prec)`;
      } else if (cv > 0 && cv <= 0.28 && acc >= 75 && precision >= 70 && recall >= 80) {
        focusLevel = "Steady Focus";
        focusDescription = `Consistent sustained focus · Multiplier ${cv}x Mean RT (${Math.round(precision)}% Prec)`;
      } else {
        focusLevel = "Variable Focus";
        focusDescription = `Elevated response time dispersion (${cv}x variability)`;
      }
    }
  }

  return { focusLevel, focusDescription };
}
