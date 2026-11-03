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
  const backX = 60;
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
  const pauseX = backX + backW + 12;
  const isPauseHover = state.hoverId === "toggle-pause";
  const isPaused = Boolean(state.isPaused);

  ctx.fillStyle = isPaused
    ? "rgba(245, 158, 11, 0.2)"
    : isPauseHover
    ? "#334155"
    : "#0f172a";
  ctx.strokeStyle = isPaused
    ? "rgba(245, 158, 11, 0.6)"
    : isPauseHover
    ? "#94a3b8"
    : "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pauseX, topY, pauseW, pauseH, pauseH / 2);
  ctx.fill();
  ctx.stroke();

  // Draw Pause || or Play > symbol
  ctx.fillStyle = isPaused ? "#fbbf24" : isPauseHover ? "#ffffff" : "#cbd5e1";
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

  // 3. Skip Button (renamed from Skip Round)
  const skipW = 100;
  const skipH = 50;
  const skipX = pauseX + pauseW + 12;
  const isSkipHover = state.hoverId === "skip-round";

  ctx.fillStyle = isSkipHover ? "#1e293b" : "#0f172a";
  ctx.strokeStyle = isSkipHover ? "#f59e0b" : "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(skipX, topY, skipW, skipH, skipH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = isSkipHover ? "#fbbf24" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("Skip ⇥", skipX + skipW / 2, topY + 31);
  hitAreas.push({ id: "skip-round", type: "skip-round", x: skipX, y: topY, width: skipW, height: skipH });

  // 4. Menu Button [Hamburger SVG Icon only]
  const menuW = 50;
  const menuH = 50;
  const menuX = skipX + skipW + 12;
  const isMenuHover = state.hoverId === "menu";

  ctx.fillStyle = isMenuHover ? "#334155" : "#0f172a";
  ctx.strokeStyle = isMenuHover ? "#94a3b8" : "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(menuX, topY, menuW, menuH, menuH / 2);
  ctx.fill();
  ctx.stroke();

  // Draw 3 Hamburger lines
  ctx.strokeStyle = isMenuHover ? "#ffffff" : "#cbd5e1";
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(menuX + 15, topY + 18);
  ctx.lineTo(menuX + 35, topY + 18);
  ctx.moveTo(menuX + 15, topY + 25);
  ctx.lineTo(menuX + 35, topY + 25);
  ctx.moveTo(menuX + 15, topY + 32);
  ctx.lineTo(menuX + 35, topY + 32);
  ctx.stroke();
  hitAreas.push({ id: "menu", type: "menu", x: menuX, y: topY, width: menuW, height: menuH });

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
