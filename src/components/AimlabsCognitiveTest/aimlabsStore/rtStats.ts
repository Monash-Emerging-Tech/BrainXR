// Reaction-time descriptive stats. Kept as three distinct functions rather
// than one shared helper: the live, round, and session layers already
// differ in rounding and cv precision (pre-existing, not unified here to
// avoid changing the scoring output).

export interface LiveRtStats {
  meanRT: number;
  medianRT: number;
  sdRT: number;
  cv: number;
}

export function computeLiveRtStats(rts: number[]): LiveRtStats {
  const n = rts.length;
  let meanRT = 0;
  let medianRT = 0;
  let sdRT = 0;

  if (n > 0) {
    const sum = rts.reduce((a, b) => a + b, 0);
    meanRT = Math.round(sum / n);

    const sorted = [...rts].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    medianRT = n % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

    if (n > 1) {
      const variance = rts.reduce((accVar, val) => accVar + Math.pow(val - meanRT, 2), 0) / (n - 1);
      sdRT = Math.round(Math.sqrt(variance));
    } else {
      sdRT = 0;
    }
  }

  const cv = meanRT > 0 && sdRT > 0 ? Number((sdRT / meanRT).toFixed(3)) : 0;
  return { meanRT, medianRT, sdRT, cv };
}

export interface RoundRtStats {
  meanRT: number;
  sdRT: number;
  cv: number;
}

export function computeRoundRtStats(rts: number[]): RoundRtStats {
  const meanRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
  const variance =
    rts.length > 1 ? rts.reduce((sum, val) => sum + Math.pow(val - meanRT, 2), 0) / (rts.length - 1) : 0;
  const sdRT = Math.round(Math.sqrt(variance));
  const cv = meanRT > 0 ? parseFloat((sdRT / meanRT).toFixed(2)) : 0;
  return { meanRT, sdRT, cv };
}

export function computeSessionRtStats(allRts: number[]): RoundRtStats {
  const meanRT = allRts.length > 0 ? Math.round(allRts.reduce((a, b) => a + b, 0) / allRts.length) : 0;
  const variance =
    allRts.length > 1 ? allRts.reduce((sum, v) => sum + Math.pow(v - meanRT, 2), 0) / (allRts.length - 1) : 0;
  const sdRT = Math.round(Math.sqrt(variance));
  const cv = meanRT > 0 ? parseFloat((sdRT / meanRT).toFixed(2)) : 0;
  return { meanRT, sdRT, cv };
}
