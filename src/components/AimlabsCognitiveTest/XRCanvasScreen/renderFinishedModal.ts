import type { CanvasScreenRenderState, InteractiveHitArea } from "./types";

export function renderFinishedModal(
  ctx: CanvasRenderingContext2D,
  width: number,
  _height: number,
  state: CanvasScreenRenderState,
  hitAreas: InteractiveHitArea[]
): void {
  const r1 = state.round1Metrics;
  const r2 = state.round2Metrics;
  if (!r1 || !r2) return;
  const cx = width / 2;

  const totalScore = r1.score + r2.score;
  const overallAcc = (r1.accuracy + r2.accuracy) / 2;

  // Eyebrow badge
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#34d399";
  ctx.textAlign = "center";
  ctx.fillText("SESSION COMPLETE", cx, 110);

  // Spanned Title
  ctx.font = "bold 56px 'OffBit', monospace";
  ctx.letterSpacing = "6px";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("COGNITIVE REPORT", cx, 175);

  const allRts = [...r1.reactionTimes, ...r2.reactionTimes];
  const overallMeanRT =
    allRts.length > 0 ? Math.round(allRts.reduce((a, b) => a + b, 0) / allRts.length) : 0;
  const overallVariance =
    allRts.length > 1
      ? allRts.reduce((sum, v) => sum + Math.pow(v - overallMeanRT, 2), 0) / (allRts.length - 1)
      : 0;
  const overallSdRT = Math.round(Math.sqrt(overallVariance));
  const overallCv = overallMeanRT > 0 ? parseFloat((overallSdRT / overallMeanRT).toFixed(2)) : 0;

  const totalGo = r1.goHits + r2.goHits;
  const totalOmissions = r1.omissions + r2.omissions;
  const totalGoTargets = totalGo + totalOmissions;
  const overallRecall = totalGoTargets > 0 ? (totalGo / totalGoTargets) * 100 : 100;
  const r1Go = r1.goHits + r1.omissions;
  const r1OmitRate = r1.omissionRate ?? (r1Go > 0 ? Math.round((r1.omissions / r1Go) * 100) : 0);
  const r2Go = r2.goHits + r2.omissions;
  const r2OmitRate = r2.omissionRate ?? (r2Go > 0 ? Math.round((r2.omissions / r2Go) * 100) : 0);
  const totalCommissions = r1.commissions + r2.commissions;
  const totalPresses = totalGo + totalCommissions;
  const overallPrecision =
    totalPresses > 0 ? Math.min(100, Math.max(0, Math.round((totalGo / totalPresses) * 100))) : 0;

  let focusClassification = "Steady Focus";
  let focusColor = "#22d3ee";

  if (
    overallRecall < 80 ||
    overallPrecision < 70 ||
    overallAcc < 75 ||
    overallCv > 0.28 ||
    overallCv === 0
  ) {
    focusClassification = "Variable Focus";
    focusColor = "#F3DA66";
  } else if (
    overallCv > 0 &&
    overallCv <= 0.18 &&
    overallAcc >= 88 &&
    overallPrecision >= 85 &&
    overallRecall >= 90 &&
    allRts.length >= 15
  ) {
    focusClassification = "Optimal Focus";
    focusColor = "#34d399";
  } else {
    focusClassification = "Steady Focus";
    focusColor = "#22d3ee";
  }

  // Focus Summary pill (replacing composite score)
  const sumW = 680;
  const sumH = 80;
  const sumX = cx - sumW / 2;
  const sumY = 210;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(sumX, sumY, sumW, sumH, 20);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 13px monospace";
  ctx.letterSpacing = "1px";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "center";
  ctx.fillText("FOCUS CLASSIFICATION", sumX + sumW * 0.3, sumY + 30);
  ctx.fillText("OVERALL ACCURACY", sumX + sumW * 0.75, sumY + 30);

  ctx.font = "bold 26px 'OffBit', monospace";
  ctx.fillStyle = focusColor;
  ctx.fillText(focusClassification.toUpperCase(), sumX + sumW * 0.3, sumY + 63);
  ctx.fillStyle = "#34d399";
  ctx.fillText(`${Math.round(overallAcc)}%`, sumX + sumW * 0.75, sumY + 63);

  // Detailed Comparison Table
  const tblW = 1080;
  const tblH = 370;
  const tblX = cx - tblW / 2;
  const tblY = 315;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(tblX, tblY, tblW, tblH, 18);
  ctx.fill();
  ctx.stroke();

  // Table Header
  const thH = 50;
  ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
  ctx.beginPath();
  ctx.roundRect(tblX, tblY, tblW, thH, [18, 18, 0, 0]);
  ctx.fill();

  ctx.font = "bold 16px monospace";
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "left";
  ctx.fillText("Action · Result", tblX + 30, tblY + 32);

  ctx.textAlign = "center";
  ctx.fillStyle = "#F3DA66";
  ctx.fillText("Round 1 (CPT)", tblX + tblW * 0.55, tblY + 32);

  ctx.fillStyle = "#22d3ee";
  ctx.fillText("Round 2 (SART)", tblX + tblW * 0.82, tblY + 32);

  // Table Rows: Core Executive Metrics
  const rows = [
    { label: "Mean Reaction Time", r1: `${Math.round(r1.meanReactionTime)} ms`, r2: `${Math.round(r2.meanReactionTime)} ms`, c1: "#22d3ee", c2: "#22d3ee" },
    {
      label: "Response Time CV",
      r1: `${r1.cv ? `${r1.cv}x` : "--"} (±${r1.sdReactionTime || 0}ms)`,
      r2: `${r2.cv ? `${r2.cv}x` : "--"} (±${r2.sdReactionTime || 0}ms)`,
      c1: "#F3DA66",
      c2: "#F3DA66",
    },
    { label: "Accuracy", r1: `${Math.round(r1.accuracy)}%`, r2: `${Math.round(r2.accuracy)}%`, c1: "#34d399", c2: "#34d399" },
    { label: "Precision", r1: `${Math.round(r1.precision ?? 100)}%`, r2: `${Math.round(r2.precision ?? 100)}%`, c1: "#a5b4fc", c2: "#a5b4fc" },
    { label: "Omission Rate", r1: `${r1OmitRate}%`, r2: `${r2OmitRate}%`, c1: "#f43f5e", c2: "#f43f5e" },
  ];

  const rowH = (tblH - thH) / rows.length;
  rows.forEach((r, idx) => {
    const ry = tblY + thH + idx * rowH;
    ctx.strokeStyle = "rgba(51, 65, 85, 0.35)";
    ctx.beginPath();
    ctx.moveTo(tblX, ry);
    ctx.lineTo(tblX + tblW, ry);
    ctx.stroke();

    ctx.font = "16px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.textAlign = "left";
    ctx.fillText(r.label, tblX + 30, ry + rowH / 2 + 6);

    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = r.c1;
    ctx.fillText(r.r1, tblX + tblW * 0.55, ry + rowH / 2 + 6);

    ctx.fillStyle = r.c2;
    ctx.fillText(r.r2, tblX + tblW * 0.82, ry + rowH / 2 + 6);
  });

  // Detailed Report URL Hint
  ctx.font = "14px monospace";
  ctx.fillStyle = "#818cf8";
  ctx.textAlign = "center";
  ctx.fillText("Detailed telemetry graphs & exports auto-saved to /direction/report", cx, 680);

  // Action Buttons
  const btnY = 705;
  const btnH = 68;

  // Test Again
  const againW = 280;
  const againX = cx - againW - 20;
  const isAgainHover = state.hoverId === "restart";
  ctx.fillStyle = isAgainHover ? "#e2e8f0" : "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(againX, btnY, againW, btnH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 20px 'OffBit', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("PLAY AGAIN", againX + againW / 2, btnY + 42);
  hitAreas.push({ id: "restart", type: "restart", x: againX, y: btnY, width: againW, height: btnH });

  // Return to Home
  const exitW = 320;
  const exitX = cx + 20;
  const isExitHover = state.hoverId === "exit";
  ctx.fillStyle = isExitHover ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.06)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(exitX, btnY, exitW, btnH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 18px monospace";
  ctx.letterSpacing = "0px";
  ctx.fillStyle = isExitHover ? "#ffffff" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("Return to Home", exitX + exitW / 2, btnY + 42);
  hitAreas.push({ id: "exit", type: "exit", x: exitX, y: btnY, width: exitW, height: btnH });
}
