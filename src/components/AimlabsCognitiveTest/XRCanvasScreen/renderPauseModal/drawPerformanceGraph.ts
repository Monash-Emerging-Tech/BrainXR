import type { TargetTelemetryRecord, LiveFocusMetrics } from "../../types";

// Unified Performance Graph: RT & Moving Avg / SD Band (Left Axis) + Accuracy % (Right Axis)
export function drawPerformanceGraph(ctx: CanvasRenderingContext2D, cx: number, m: LiveFocusMetrics): void {
  const graphY = 282;
  const graphW = 900;
  const graphH = 220;
  const graphX = cx - graphW / 2;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(graphX, graphY, graphW, graphH, 20);
  ctx.fill();
  ctx.stroke();

  // Header Bar inside Graph
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText("SESSION PERFORMANCE", graphX + 24, graphY + 30);

  // Focus Category Badge in Header
  const focusColor =
    m.focusLevel === "Optimal Focus"
      ? "#34d399"
      : m.focusLevel === "Steady Focus"
      ? "#38bdf8"
      : m.focusLevel === "Variable Focus"
      ? "#F3DA66"
      : "#94a3b8";
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = focusColor;
  ctx.fillText(`[${m.focusLevel}]`, graphX + 210, graphY + 30);

  if (m.cv > 0) {
    ctx.font = "11px monospace";
    ctx.fillStyle = "#F3DA66";
    ctx.fillText(`RT CV: ${(m.cv * 100).toFixed(0)}% (${m.cv}x Mean RT)`, graphX + 340, graphY + 30);
  }

  // Legend on Right
  ctx.font = "11px monospace";
  ctx.textAlign = "right";
  // Moving RT
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("— Moving RT", graphX + graphW - 275, graphY + 30);
  // ±1.5x SD Band
  ctx.fillStyle = "#F3DA66";
  ctx.fillText("░ ±1.5x SD Band", graphX + graphW - 220, graphY + 30);
  // ±1.5x SD Whisker
  ctx.fillStyle = "rgba(243, 218, 102, 0.75)";
  ctx.fillText("╌ ±1.5x SD Whisker", graphX + graphW - 98, graphY + 30);
  // Accuracy %
  ctx.fillStyle = "#34d399";
  ctx.fillText("--- Acc %", graphX + graphW - 24, graphY + 30);

  // Chart Inner Viewport
  const chartPadL = 50;
  const chartPadR = 50;
  const chartPadT = 44;
  const chartPadB = 36;
  const chartX = graphX + chartPadL;
  const chartY = graphY + chartPadT;
  const chartW = graphW - chartPadL - chartPadR;
  const chartH = graphH - chartPadT - chartPadB;

  // Background Box for chart
  ctx.fillStyle = "rgba(2, 6, 23, 0.65)";
  ctx.beginPath();
  ctx.roundRect(chartX, chartY, chartW, chartH, 10);
  ctx.fill();

  // Horizontal Grid Lines
  ctx.strokeStyle = "rgba(51, 65, 85, 0.35)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  [0.25, 0.5, 0.75].forEach((ratio) => {
    const gy = chartY + chartH * ratio;
    ctx.beginPath();
    ctx.moveTo(chartX, gy);
    ctx.lineTo(chartX + chartW, gy);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Axis Labels
  ctx.font = "10px monospace";
  // Left Axis (RT ms)
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "right";
  ctx.fillText("550ms", chartX - 6, chartY + 10);
  ctx.fillText("325ms", chartX - 6, chartY + chartH / 2 + 4);
  ctx.fillText("100ms", chartX - 6, chartY + chartH);

  // Right Axis (Accuracy %)
  ctx.fillStyle = "#10b981";
  ctx.textAlign = "left";
  ctx.fillText("100%", chartX + chartW + 6, chartY + 10);
  ctx.fillText("50%", chartX + chartW + 6, chartY + chartH / 2 + 4);
  ctx.fillText("0%", chartX + chartW + 6, chartY + chartH);

  const data: TargetTelemetryRecord[] = (m.telemetryTable && m.telemetryTable.length > 0) ? m.telemetryTable.slice(-36) : [];
  if (data.length > 1) {
    const count = data.length;
    const minRT = 100;
    const maxRT = 550;
    const rtRange = maxRT - minRT;

    const getYForRT = (val: number) => {
      const clamped = Math.max(minRT, Math.min(maxRT, val));
      return chartY + chartH - ((clamped - minRT) / rtRange) * chartH;
    };

    const getYForAcc = (acc: number) => {
      const clamped = Math.max(0, Math.min(100, acc));
      return chartY + chartH - (clamped / 100) * chartH;
    };

    const getX = (idx: number) => chartX + (idx / (count - 1)) * chartW;

    // 1. Draw Dual SD Bands: Outer +/- 1.5x SD (Whisker Envelope) & Inner +/- 1.0x SD (Core Corridor)
    const innerUpperPoints: { x: number; y: number }[] = [];
    const innerLowerPoints: { x: number; y: number }[] = [];
    const outerUpperPoints: { x: number; y: number }[] = [];
    const outerLowerPoints: { x: number; y: number }[] = [];

    data.forEach((d, i) => {
      const x = getX(i);
      const avg = d.movingAverageRT > 0 ? d.movingAverageRT : (d.reactionTime || m.meanRT || 300);
      const sd = d.movingSdRT || m.sdRT || 30;
      innerUpperPoints.push({ x, y: getYForRT(avg - sd) });
      innerLowerPoints.push({ x, y: getYForRT(avg + sd) });
      outerUpperPoints.push({ x, y: getYForRT(avg - 1.5 * sd) });
      outerLowerPoints.push({ x, y: getYForRT(avg + 1.5 * sd) });
    });

    // 1a. Outer 1.5x SD whisker band fill
    ctx.fillStyle = "rgba(243, 218, 102, 0.07)";
    ctx.beginPath();
    ctx.moveTo(outerUpperPoints[0].x, outerUpperPoints[0].y);
    outerUpperPoints.forEach((p) => ctx.lineTo(p.x, p.y));
    for (let i = outerLowerPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(outerLowerPoints[i].x, outerLowerPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // 1b. Outer 1.5x SD whisker dashed boundary lines
    ctx.strokeStyle = "rgba(243, 218, 102, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    outerUpperPoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.beginPath();
    outerLowerPoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 1c. Inner 1.0x SD core focus band
    ctx.fillStyle = "rgba(243, 218, 102, 0.22)";
    ctx.strokeStyle = "rgba(243, 218, 102, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(innerUpperPoints[0].x, innerUpperPoints[0].y);
    innerUpperPoints.forEach((p) => ctx.lineTo(p.x, p.y));
    for (let i = innerLowerPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(innerLowerPoints[i].x, innerLowerPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Draw Cumulative Accuracy Line (Emerald Dashed)
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = getX(i);
      const y = getYForAcc(d.cumulativeAccuracy);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Moving Average RT Line (Cyan Solid)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = getX(i);
      const avg = d.movingAverageRT > 0 ? d.movingAverageRT : (d.reactionTime || m.meanRT || 300);
      const y = getYForRT(avg);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 4. Draw Individual Target Response Dots
    data.forEach((d, i) => {
      if (d.reactionTime) {
        const x = getX(i);
        const y = getYForRT(d.reactionTime);
        ctx.fillStyle = d.isCorrect ? "#00f0ff" : "#f43f5e";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  } else {
    ctx.font = "italic 13px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Collecting live response telemetry...", chartX + chartW / 2, chartY + chartH / 2 - 4);
    ctx.font = "11px monospace";
    ctx.fillText("Plotting moving average, SD confidence envelope, and accuracy", chartX + chartW / 2, chartY + chartH / 2 + 16);
  }

  // Bottom Summary Bar inside Graph
  const summaryY = graphY + graphH - 14;
  ctx.textAlign = "left";
  ctx.font = "12px monospace";

  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Mean RT: ", graphX + 24, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`${m.meanRT}ms`, graphX + 88, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Median: ", graphX + 185, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#818cf8";
  ctx.fillText(`${m.medianRT}ms`, graphX + 242, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("SD: ", graphX + 340, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#F3DA66";
  ctx.fillText(`±${m.sdRT}ms ${m.cv > 0 ? `(${m.cv}x)` : ""}`, graphX + 368, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Acc: ", graphX + 560, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#34d399";
  ctx.fillText(`${m.accuracy}%`, graphX + 596, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Prec: ", graphX + 710, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#a5b4fc";
  ctx.fillText(`${Math.round(m.precision ?? 100)}%`, graphX + 754, summaryY);
}
