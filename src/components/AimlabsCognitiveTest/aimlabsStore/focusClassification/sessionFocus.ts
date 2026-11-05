interface SessionFocusInput {
  overallRecall: number;
  overallPrecision: number;
  overallAccuracy: number;
  overallBalancedAcc: number;
  overallCv: number;
  allRtsLength: number;
  overallOmissionRate: number;
}

// Session-level focus classification, combining both rounds, shown on the
// finished report screen and persisted with the session.
export function classifySessionFocus({
  overallRecall,
  overallPrecision,
  overallAccuracy,
  overallBalancedAcc,
  overallCv,
  allRtsLength,
  overallOmissionRate,
}: SessionFocusInput): {
  focusClassification: "Optimal Focus" | "Steady Focus" | "Variable Focus";
  focusDescription: string;
} {
  if (
    overallRecall < 80 ||
    overallPrecision < 70 ||
    overallAccuracy < 75 ||
    overallBalancedAcc < 70 ||
    overallCv > 0.28 ||
    overallCv === 0
  ) {
    let focusDescription: string;
    if (overallRecall < 80) {
      focusDescription = `High omission rate (${overallOmissionRate}% missed Go targets) indicating attentional lapses`;
    } else if (overallPrecision < 70) {
      focusDescription = `Elevated commission errors (${100 - overallPrecision}% false alarms) indicating motor impulsivity`;
    } else if (overallAccuracy < 75) {
      focusDescription = `Low decision accuracy (${overallAccuracy}%) across stimulus presentations`;
    } else {
      focusDescription = `Elevated response time variability (RT CV ${overallCv}x > 0.28) indicating cognitive fluctuation`;
    }
    return { focusClassification: "Variable Focus", focusDescription };
  }

  if (
    overallCv > 0 &&
    overallCv <= 0.18 &&
    overallAccuracy >= 88 &&
    overallPrecision >= 85 &&
    overallRecall >= 90 &&
    allRtsLength >= 15
  ) {
    return {
      focusClassification: "Optimal Focus",
      focusDescription: `High sustained attentional vigilance and tight inhibitory control (Acc ${overallAccuracy}%, Prec ${overallPrecision}%, Misses ${overallOmissionRate}%, RT CV ${overallCv}x)`,
    };
  }

  return {
    focusClassification: "Steady Focus",
    focusDescription: `Consistent cognitive processing speed with reliable target detection (Acc ${overallAccuracy}%, Prec ${overallPrecision}%, Misses ${overallOmissionRate}%, RT CV ${overallCv}x)`,
  };
}
