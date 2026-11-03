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

  // 1. Back Button (Top Left)
  const backW = 110;
  const backH = 50;
  const backX = 40;
  const isBackHover = state.hoverId === "exit";

  ctx.fillStyle = isBackHover ? "#334155" : "#0f172a";
  ctx.strokeStyle = isBackHover ? "#64748b" : "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(backX, topY, backW, backH, backH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = isBackHover ? "#ffffff" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("← Back", backX + backW / 2, topY + 31);
  hitAreas.push({ id: "exit", type: "exit", x: backX, y: topY, width: backW, height: backH });

  // 2. Pause Button [SVG-style Icon only]
  const pauseW = 50;
  const pauseH = 50;
  const pauseX = backX + backW + 14;
  const isPauseHover = state.hoverId === "toggle-pause";
  const isPaused = Boolean(state.isPaused);

  ctx.fillStyle = isPaused
    ? "rgba(243, 218, 102, 0.2)"
    : isPauseHover
    ? "#334155"
    : "#0f172a";
  ctx.strokeStyle = isPaused
    ? "rgba(243, 218, 102, 0.6)"
    : isPauseHover
    ? "#94a3b8"
    : "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pauseX, topY, pauseW, pauseH, pauseH / 2);
  ctx.fill();
  ctx.stroke();

  // Draw Pause || or Play > symbol
  ctx.fillStyle = isPaused ? "#F3DA66" : isPauseHover ? "#ffffff" : "#cbd5e1";
  if (isPaused) {
    // Play Triangle icon
    ctx.beginPath();
    ctx.moveTo(pauseX + 20, topY + 16);
    ctx.lineTo(pauseX + 34, topY + 25);
    ctx.lineTo(pauseX + 20, topY + 34);
    ctx.closePath();
    ctx.fill();
  } else {
    // Pause Double bar icon
    ctx.fillRect(pauseX + 17, topY + 16, 5, 18);
    ctx.fillRect(pauseX + 27, topY + 16, 5, 18);
  }
  hitAreas.push({ id: "toggle-pause", type: "toggle-pause", x: pauseX, y: topY, width: pauseW, height: pauseH });

  // Telemetry Readout (Top Right: Strictly Mean, Accuracy, Precision, Omission Rate)
  const m = state.liveFocusMetrics;
  const telW = 510;
  const telH = 50;
  const telX = width - telW - 40;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.beginPath();
  ctx.roundRect(telX, topY, telW, telH, telH / 2);
  ctx.fill();
  ctx.stroke();

  // 1. Mean Reaction Time
  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "left";
  ctx.fillText("MEAN", telX + 24, topY + 30);

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = "#22d3ee";
  ctx.fillText(`${m && m.meanRT > 0 ? `${m.meanRT}ms` : `${state.score}ms`}`, telX + 64, topY + 30);

  // Divider 1
  ctx.font = "12px monospace";
  ctx.fillStyle = "#334155";
  ctx.fillText("|", telX + 136, topY + 30);

  // 2. Accuracy
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("ACC", telX + 152, topY + 30);

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = "#34d399";
  ctx.fillText(`${Math.round(state.accuracy)}%`, telX + 184, topY + 30);

  // Divider 2
  ctx.font = "12px monospace";
  ctx.fillStyle = "#334155";
  ctx.fillText("|", telX + 244, topY + 30);

  // 3. Precision
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("PREC", telX + 260, topY + 30);

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = "#a5b4fc";
  ctx.fillText(`${Math.round(m?.precision ?? 100)}%`, telX + 300, topY + 30);

  // Divider 3
  ctx.font = "12px monospace";
  ctx.fillStyle = "#334155";
  ctx.fillText("|", telX + 364, topY + 30);

  // 4. Omission Rate
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("OMIT", telX + 380, topY + 30);

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = "#f43f5e";
  ctx.fillText(`${Math.round(m?.omissionRate ?? 0)}%`, telX + 422, topY + 30);

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
    // Round 1 (CPT): Green = Press, Red = Avoid
    drawMiniRuleBadge(ctx, ruleX + 10, topY, 290, 50, "Green Sphere", "PRESS", "#22c55e", true);
    drawMiniRuleBadge(ctx, ruleX + 320, topY, 290, 50, "Red Box", "DO NOT PRESS", "#f43f5e", false);
  } else {
    // Round 2 (SART): Red = Press, Green = Avoid
    drawMiniRuleBadge(ctx, ruleX + 10, topY, 290, 50, "Red Box", "PRESS", "#f43f5e", true);
    drawMiniRuleBadge(ctx, ruleX + 320, topY, 290, 50, "Green Sphere", "DO NOT PRESS", "#22c55e", false);
  }

  // Instant Feedback Badge (below center)
  if (state.recentFeedback) {
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = state.recentFeedback.color;
    ctx.textAlign = "center";
    ctx.fillText(state.recentFeedback.text, width / 2, height / 2 + 140);
  }

  // Bottom Pause Quick Tip Badge in XR: safely padded inside canvas boundary so it never gets clipped
  const hintW = 380;
  const hintH = 42;
  const hintX = (width - hintW) / 2;
  const hintY = height - 56;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(hintX, hintY, hintW, hintH, hintH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("Press [B] or [Y] to Pause", width / 2, hintY + 26);
}

function drawMiniRuleBadge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, name: string, action: string, color: string, isPress: boolean) {
  const isGreen = color === "#22c55e";
  if (isPress) {
    ctx.fillStyle = isGreen ? "rgba(5, 46, 22, 0.75)" : "rgba(76, 5, 25, 0.75)";
    ctx.strokeStyle = isGreen ? "rgba(34, 197, 94, 0.5)" : "rgba(244, 63, 94, 0.5)";
  } else {
    ctx.fillStyle = isGreen ? "rgba(5, 46, 22, 0.5)" : "rgba(76, 5, 25, 0.5)";
    ctx.strokeStyle = isGreen ? "rgba(34, 197, 94, 0.35)" : "rgba(244, 63, 94, 0.35)";
  }
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
  ctx.fillStyle = isGreen ? "#4ade80" : "#fb7185";
  ctx.textAlign = "right";
  ctx.fillText(action, x + w - 18, y + h / 2 + 5);
}
