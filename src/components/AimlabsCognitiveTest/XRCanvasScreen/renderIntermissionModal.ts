import type { CanvasScreenRenderState, InteractiveHitArea } from "./types";

export function renderIntermissionModal(
  ctx: CanvasRenderingContext2D,
  width: number,
  _height: number,
  state: CanvasScreenRenderState,
  hitAreas: InteractiveHitArea[]
): void {
  const m = state.round1Metrics;
  if (!m) return;
  const cx = width / 2;

  // Eyebrow badge
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "center";
  ctx.fillText("ROUND 1 COMPLETE", cx, 140);

  // Spanned Title
  ctx.font = "bold 56px 'OffBit', monospace";
  ctx.letterSpacing = "6px";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("TELEMETRY REPORT", cx, 210);

  // 4 Metric Badges
  const stats = [
    { label: "HITS (GO)", value: m.goHits.toString(), color: "#22d3ee" },
    { label: "FALSE ALARMS", value: m.commissions.toString(), color: "#f43f5e" },
    { label: "MEAN RT", value: `${Math.round(m.meanReactionTime)} ms`, color: "#fbbf24" },
    { label: "ACCURACY", value: `${Math.round(m.accuracy)}%`, color: "#34d399" },
  ];

  const statW = 280;
  const statH = 130;
  const statGap = 24;
  const totalStatW = 4 * statW + 3 * statGap;
  const statStartX = cx - totalStatW / 2;
  const statY = 270;

  stats.forEach((s, idx) => {
    const x = statStartX + idx * (statW + statGap);
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, statY, statW, statH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 15px monospace";
    ctx.letterSpacing = "1px";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.fillText(s.label, x + statW / 2, statY + 45);

    ctx.font = "bold 44px 'OffBit', monospace";
    ctx.fillStyle = s.color;
    ctx.fillText(s.value, x + statW / 2, statY + 98);
  });

  // Rule Reversal Notice for Round 2
  const revW = 1000;
  const revH = 210;
  const revX = cx - revW / 2;
  const revY = 440;

  ctx.fillStyle = "rgba(26, 11, 22, 0.85)";
  ctx.strokeStyle = "rgba(244, 63, 94, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(revX, revY, revW, revH, 20);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 18px monospace";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "#fb7185";
  ctx.textAlign = "center";
  ctx.fillText("RULE REVERSAL FOR ROUND 2 (SART)", cx, revY + 42);

  // Left card: Red Box -> PRESS
  drawRuleSubcard(ctx, revX + 40, revY + 70, 440, 100, "Red Box", "PRESS", "#f43f5e", true);
  // Right card: Cyan Sphere -> DO NOT PRESS
  drawRuleSubcard(ctx, revX + 520, revY + 70, 440, 100, "Cyan Sphere", "DO NOT PRESS", "#00f0ff", false);

  // Continue Button
  const btnW = 420;
  const btnH = 70;
  const btnX = cx - btnW / 2;
  const btnY = 690;
  const isHover = state.hoverId === "start-round2";

  ctx.fillStyle = isHover ? "#e11d48" : "#be123c";
  ctx.strokeStyle = isHover ? "#fda4af" : "#f43f5e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, btnH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 22px monospace";
  ctx.letterSpacing = "1px";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("Start Round 2 (SART) →", cx, btnY + 44);

  hitAreas.push({ id: "start-round2", type: "start-round2", x: btnX, y: btnY, width: btnW, height: btnH });
}

function drawRuleSubcard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, name: string, action: string, color: string, isPress: boolean) {
  ctx.fillStyle = isPress ? "rgba(76, 5, 25, 0.6)" : "rgba(8, 47, 73, 0.5)";
  ctx.strokeStyle = isPress ? "rgba(244, 63, 94, 0.4)" : "rgba(6, 182, 212, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  if (name.includes("Sphere")) {
    ctx.arc(x + 36, y + h / 2, 14, 0, Math.PI * 2);
  } else {
    ctx.roundRect(x + 22, y + h / 2 - 14, 28, 28, 4);
  }
  ctx.fill();

  ctx.font = "bold 18px monospace";
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(name, x + 66, y + h / 2 + 6);

  ctx.font = "bold 18px 'OffBit', monospace";
  ctx.fillStyle = isPress ? "#fb7185" : "#38bdf8";
  ctx.textAlign = "right";
  ctx.fillText(action, x + w - 24, y + h / 2 + 6);
}
