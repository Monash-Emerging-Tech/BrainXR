import type { CanvasScreenRenderState, InteractiveHitArea } from "./types";

export function renderHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CanvasScreenRenderState,
  hitAreas: InteractiveHitArea[]
): void {
  const isRound1 = state.round === 1;

  // Header Bar Top
  const topY = 40;

  // Exit Button (Top Left)
  const exitW = 180;
  const exitH = 50;
  const exitX = 60;
  const isExitHover = state.hoverId === "exit";

  ctx.fillStyle = isExitHover ? "#334155" : "#0f172a";
  ctx.strokeStyle = isExitHover ? "#64748b" : "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(exitX, topY, exitW, exitH, exitH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("← Exit to EEG", exitX + exitW / 2, topY + 31);
  hitAreas.push({ id: "exit", type: "exit", x: exitX, y: topY, width: exitW, height: exitH });

  // Telemetry Readout (Top Right)
  const telW = 280;
  const telH = 50;
  const telX = width - telW - 60;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.beginPath();
  ctx.roundRect(telX, topY, telW, telH, telH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "14px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "left";
  ctx.fillText("RT", telX + 24, topY + 31);

  ctx.font = "bold 17px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${state.score}ms`, telX + 54, topY + 31);

  ctx.fillStyle = "#475569";
  ctx.fillText("|", telX + 155, topY + 31);

  ctx.font = "14px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Acc", telX + 175, topY + 31);

  ctx.font = "bold 17px monospace";
  ctx.fillStyle = "#34d399";
  ctx.fillText(`${Math.round(state.accuracy)}%`, telX + 210, topY + 31);

  // Center Top Rule Badge Card
  const ruleW = 620;
  const ruleH = 58;
  const ruleX = (width - ruleW) / 2;

  ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.beginPath();
  ctx.roundRect(ruleX, topY - 4, ruleW, ruleH, ruleH / 2);
  ctx.fill();
  ctx.stroke();

  if (isRound1) {
    // Round 1 (CPT): Cyan = Press, Red = Avoid
    drawMiniRuleBadge(ctx, ruleX + 10, topY, 290, 50, "Cyan Sphere", "PRESS", "#00f0ff", true);
    drawMiniRuleBadge(ctx, ruleX + 320, topY, 290, 50, "Red Box", "DO NOT PRESS", "#f43f5e", false);
  } else {
    // Round 2 (SART): Red = Press, Cyan = Avoid
    drawMiniRuleBadge(ctx, ruleX + 10, topY, 290, 50, "Red Box", "PRESS", "#f43f5e", true);
    drawMiniRuleBadge(ctx, ruleX + 320, topY, 290, 50, "Cyan Sphere", "DO NOT PRESS", "#00f0ff", false);
  }

  // Instant Feedback Badge (below center)
  if (state.recentFeedback) {
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = state.recentFeedback.color;
    ctx.textAlign = "center";
    ctx.fillText(state.recentFeedback.text, width / 2, height / 2 + 140);
  }
}

function drawMiniRuleBadge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, name: string, action: string, color: string, isPress: boolean) {
  ctx.fillStyle = isPress ? "rgba(4, 47, 46, 0.7)" : "rgba(76, 5, 25, 0.5)";
  ctx.strokeStyle = isPress ? "rgba(6, 182, 212, 0.45)" : "rgba(244, 63, 94, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  if (name.includes("Sphere")) {
    ctx.arc(x + 24, y + h / 2, 8, 0, Math.PI * 2);
  } else {
    ctx.roundRect(x + 16, y + h / 2 - 8, 16, 16, 3);
  }
  ctx.fill();

  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "left";
  ctx.fillText(name, x + 42, y + h / 2 + 5);

  ctx.font = "bold 14px 'OffBit', monospace";
  ctx.fillStyle = isPress ? "#38bdf8" : "#fb7185";
  ctx.textAlign = "right";
  ctx.fillText(action, x + w - 18, y + h / 2 + 5);
}
