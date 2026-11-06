import type { TargetTelemetryRecord } from "../types";

export interface ChartSeries {
  W: number;
  H: number;
  padL: number;
  padR: number;
  padT: number;
  innerH: number;
  getYForRT: (val: number) => number;
  getYForAcc: (acc: number) => number;
  getX: (idx: number) => number;
  outerBandPolygon: string;
  innerBandPolygon: string;
  whiskerTopLine: string[];
  whiskerBottomLine: string[];
  accPoints: string[];
  movingAvgPoints: string[];
  xSplit: number | null;
}

// Pure computation of every point/polygon the chart SVG draws, from the raw
// telemetry data plus the split index. No React, no refs -- safe to read and
// test independent of the JSX that consumes it.
export function computeChartSeries(
  data: TargetTelemetryRecord[],
  count: number,
  meanRT: number,
  sdRT: number,
  splitIndex: number
): ChartSeries {
  const W = 680;
  const H = 184;
  const padL = 44;
  const padR = 44;
  const padT = 24;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Scales: RT (Left Axis) 100ms - 580ms
  const minRT = 100;
  const maxRT = 580;
  const rtRange = maxRT - minRT;
  const getYForRT = (val: number) => {
    const clamped = Math.max(minRT, Math.min(maxRT, val));
    return padT + innerH - ((clamped - minRT) / rtRange) * innerH;
  };

  // Scale: Accuracy (Right Axis) 0 - 100%
  const getYForAcc = (acc: number) => {
    return padT + innerH - (acc / 100) * innerH;
  };

  const getX = (idx: number) => padL + (idx / Math.max(1, count - 1)) * innerW;

  // Compute Envelope Points
  const innerUpperPoints: string[] = [];
  const innerLowerPoints: string[] = [];
  const outerUpperPoints: string[] = [];
  const outerLowerPoints: string[] = [];
  const whiskerTopLine: string[] = [];
  const whiskerBottomLine: string[] = [];
  const movingAvgPoints: string[] = [];
  const accPoints: string[] = [];

  data.forEach((d, i) => {
    const x = getX(i);
    const avg = d.movingAverageRT > 0 ? d.movingAverageRT : (d.reactionTime || meanRT || 300);
    const sdev = d.movingSdRT || sdRT || 35;

    const yAvg = getYForRT(avg);
    const yInnerUpper = getYForRT(avg - sdev);
    const yInnerLower = getYForRT(avg + sdev);
    const yOuterUpper = getYForRT(avg - 1.5 * sdev);
    const yOuterLower = getYForRT(avg + 1.5 * sdev);

    movingAvgPoints.push(`${x.toFixed(1)},${yAvg.toFixed(1)}`);
    innerUpperPoints.push(`${x.toFixed(1)},${yInnerUpper.toFixed(1)}`);
    innerLowerPoints.push(`${x.toFixed(1)},${yInnerLower.toFixed(1)}`);
    outerUpperPoints.push(`${x.toFixed(1)},${yOuterUpper.toFixed(1)}`);
    outerLowerPoints.push(`${x.toFixed(1)},${yOuterLower.toFixed(1)}`);

    whiskerTopLine.push(`${x.toFixed(1)},${yOuterUpper.toFixed(1)}`);
    whiskerBottomLine.push(`${x.toFixed(1)},${yOuterLower.toFixed(1)}`);

    const yAcc = getYForAcc(d.cumulativeAccuracy);
    accPoints.push(`${x.toFixed(1)},${yAcc.toFixed(1)}`);
  });

  const outerBandPolygon = `${outerUpperPoints.join(" ")} ${outerLowerPoints.reverse().join(" ")}`;
  const innerBandPolygon = `${innerUpperPoints.join(" ")} ${innerLowerPoints.reverse().join(" ")}`;

  const xSplit = splitIndex > 0 ? getX(splitIndex) : null;

  return {
    W,
    H,
    padL,
    padR,
    padT,
    innerH,
    getYForRT,
    getYForAcc,
    getX,
    outerBandPolygon,
    innerBandPolygon,
    whiskerTopLine,
    whiskerBottomLine,
    accPoints,
    movingAvgPoints,
    xSplit,
  };
}
