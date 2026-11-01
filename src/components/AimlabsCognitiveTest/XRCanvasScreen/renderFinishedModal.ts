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
  ctx.fillText("BATTERY COMPLETE", cx, 110);

  // Spanned Title
  ctx.font = "bold 56px 'OffBit', monospace";
  ctx.letterSpacing = "6px";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("COGNITIVE REPORT", cx, 175);

  // Composite summary pill
  const sumW = 600;
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

  ctx.font = "bold 14px monospace";
  ctx.letterSpacing = "1px";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "center";
  ctx.fillText("COMPOSITE SCORE", sumX + sumW * 0.25, sumY + 30);
  ctx.fillText("OVERALL ACCURACY", sumX + sumW * 0.75, sumY + 30);

  ctx.font = "bold 34px 'OffBit', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(totalScore.toString(), sumX + sumW * 0.25, sumY + 65);
  ctx.fillStyle = "#34d399";
  ctx.fillText(`${Math.round(overallAcc)}%`, sumX + sumW * 0.75, sumY + 65);

  // Detailed Comparison Table
  const tblW = 1080;
  const tblH = 340;
  const tblX = cx - tblW / 2;
  const tblY = 320;

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
  ctx.fillText("Metric", tblX + 30, tblY + 32);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText("Round 1 (CPT)", tblX + tblW * 0.55, tblY + 32);

  ctx.fillStyle = "#22d3ee";
  ctx.fillText("Round 2 (SART)", tblX + tblW * 0.82, tblY + 32);

  // Table Rows
  const rows = [
    { label: "Target (Go)", r1: "Cyan Sphere", r2: "Red Box", c1: "#38bdf8", c2: "#fb7185" },
    { label: "Go Hits", r1: r1.goHits.toString(), r2: r2.goHits.toString(), c1: "#ffffff", c2: "#ffffff" },
    { label: "False Alarms", r1: r1.commissions.toString(), r2: r2.commissions.toString(), c1: "#f43f5e", c2: "#f43f5e" },
    { label: "Mean Reaction Time", r1: `${Math.round(r1.meanReactionTime)} ms`, r2: `${Math.round(r2.meanReactionTime)} ms`, c1: "#fbbf24", c2: "#fbbf24" },
    { label: "Accuracy", r1: `${Math.round(r1.accuracy)}%`, r2: `${Math.round(r2.accuracy)}%`, c1: "#34d399", c2: "#34d399" },
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

  // Action Buttons
  const btnY = 700;
  const btnH = 68;

  // Test Again
  const againW = 280;
  const againX = cx - againW - 20;
  const isAgainHover = state.hoverId === "restart";
  ctx.fillStyle = isAgainHover ? "#334155" : "#0f172a";
  ctx.strokeStyle = isAgainHover ? "#64748b" : "#334155";
  ctx.beginPath();
  ctx.roundRect(againX, btnY, againW, btnH, btnH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 20px monospace";
  ctx.fillStyle = isAgainHover ? "#ffffff" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("Test Again", againX + againW / 2, btnY + 42);
  hitAreas.push({ id: "restart", type: "restart", x: againX, y: btnY, width: againW, height: btnH });

  // Return to EEG
  const exitW = 320;
  const exitX = cx + 20;
  const isExitHover = state.hoverId === "exit";
  ctx.fillStyle = isExitHover ? "#059669" : "#047857";
  ctx.strokeStyle = isExitHover ? "#6ee7b7" : "#10b981";
  ctx.beginPath();
  ctx.roundRect(exitX, btnY, exitW, btnH, btnH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 20px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Return to EEG", exitX + exitW / 2, btnY + 42);
  hitAreas.push({ id: "exit", type: "exit", x: exitX, y: btnY, width: exitW, height: btnH });
}
