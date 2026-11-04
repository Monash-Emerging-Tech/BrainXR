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
  const topY = 45;

  // 1. Back Button (Top Left) - scaled 1.25x
  const backW = 138;
  const backH = 62.5;
  const backX = 50;
  const isBackHover = state.hoverId === "exit";

  ctx.fillStyle = isBackHover ? "#334155" : "#0f172a";
  ctx.strokeStyle = isBackHover ? "#64748b" : "#334155";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(backX, topY, backW, backH, backH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 19px monospace";
  ctx.fillStyle = isBackHover ? "#ffffff" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("← Back", backX + backW / 2, topY + backH / 2);
  hitAreas.push({ id: "exit", type: "exit", x: backX, y: topY, width: backW, height: backH });

  // 2. Pause Button [SVG-style Icon only] - scaled 1.25x
  const pauseW = 62.5;
  const pauseH = 62.5;
  const pauseX = backX + backW + 18;
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
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(pauseX, topY, pauseW, pauseH, pauseH / 2);
  ctx.fill();
  ctx.stroke();

  // Draw Pause || or Play > symbol
  ctx.fillStyle = isPaused ? "#F3DA66" : isPauseHover ? "#ffffff" : "#cbd5e1";
  const pauseCenterY = topY + pauseH / 2;
  if (isPaused) {
    // Play Triangle icon scaled
    ctx.beginPath();
    ctx.moveTo(pauseX + 25, pauseCenterY - 11);
    ctx.lineTo(pauseX + 42, pauseCenterY);
    ctx.lineTo(pauseX + 25, pauseCenterY + 11);
    ctx.closePath();
    ctx.fill();
  } else {
    // Pause Double bar icon scaled
    ctx.fillRect(pauseX + 21, pauseCenterY - 11, 6, 22);
    ctx.fillRect(pauseX + 34, pauseCenterY - 11, 6, 22);
  }
  hitAreas.push({ id: "toggle-pause", type: "toggle-pause", x: pauseX, y: topY, width: pauseW, height: pauseH });

  // Telemetry Readout (Top Right: Mean RT, Accuracy, Precision, Omission Rate) - scaled 1.25x
  const m = state.liveFocusMetrics;
  const telW = 625;
  const telH = 62.5;
  const telX = width - telW - 50; // x = 925

  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(telX, topY, telW, telH, telH / 2);
  ctx.fill();
  ctx.stroke();

  // 4 Evenly spaced, non-colliding segments across telW (625px): ~156.25px each
  const segW = telW / 4;
  const telemetrySegments = [
    {
      label: "MEAN",
      value: m && m.meanRT > 0 ? `${m.meanRT}ms` : `${state.score}ms`,
      color: "#22d3ee",
    },
    {
      label: "ACC",
      value: `${Math.round(state.accuracy)}%`,
      color: "#34d399",
    },
    {
      label: "PREC",
      value: `${Math.round(m?.precision ?? 100)}%`,
      color: "#a5b4fc",
    },
    {
      label: "OMIT",
      value: `${Math.round(m?.omissionRate ?? 0)}%`,
      color: "#f43f5e",
    },
  ];

  telemetrySegments.forEach((seg, i) => {
    const segX = telX + i * segW;

    // Segment label: anchored to the left of the slot
    ctx.font = "14px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(seg.label, segX + 18, topY + telH / 2);

    // Segment value: anchored to the right of the slot to guarantee no overlap with label
    ctx.font = "bold 17px monospace";
    ctx.fillStyle = seg.color;
    ctx.textAlign = "right";
    ctx.fillText(seg.value, segX + segW - 18, topY + telH / 2);

    // Vertical divider between segments
    if (i < 3) {
      ctx.font = "15px monospace";
      ctx.fillStyle = "#334155";
      ctx.textAlign = "center";
      ctx.fillText("|", segX + segW, topY + telH / 2);
    }
  });

  // Center Top Rule Badge Card - scaled 1.25x and centered
  const ruleW = 575;
  const ruleH = 67.5;
  const ruleX = (width - ruleW) / 2; // 512.5 (perfect center)
  const ruleY = topY - 2.5;

  ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(ruleX, ruleY, ruleW, ruleH, ruleH / 2);
  ctx.fill();
  ctx.stroke();

  const badgeW = (ruleW - 25) / 2; // 275px each
  const badgeH = 57.5;
  const badgeY = topY + 2.5;

  if (isRound1) {
    // Round 1 (CPT): Green Sphere = Press, Red Box = Avoid
    drawMiniRuleBadge(ctx, ruleX + 8, badgeY, badgeW, badgeH, "GREEN SPHERE", "PRESS", "#22c55e", true);
    drawMiniRuleBadge(ctx, ruleX + 17 + badgeW, badgeY, badgeW, badgeH, "RED BOX", "DO NOT PRESS", "#f43f5e", false);
  } else {
    // Round 2 (SART): Red Box = Press, Green Sphere = Avoid
    drawMiniRuleBadge(ctx, ruleX + 8, badgeY, badgeW, badgeH, "RED BOX", "PRESS", "#f43f5e", true);
    drawMiniRuleBadge(ctx, ruleX + 17 + badgeW, badgeY, badgeW, badgeH, "GREEN SPHERE", "DO NOT PRESS", "#22c55e", false);
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

function drawMiniRuleBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  name: string,
  action: string,
  color: string,
  isPress: boolean
) {
  const isGreen = color === "#22c55e";
  if (isPress) {
    ctx.fillStyle = isGreen ? "rgba(5, 46, 22, 0.75)" : "rgba(76, 5, 25, 0.75)";
    ctx.strokeStyle = isGreen ? "rgba(34, 197, 94, 0.5)" : "rgba(244, 63, 94, 0.5)";
  } else {
    ctx.fillStyle = isGreen ? "rgba(5, 46, 22, 0.5)" : "rgba(76, 5, 25, 0.5)";
    ctx.strokeStyle = isGreen ? "rgba(34, 197, 94, 0.35)" : "rgba(244, 63, 94, 0.35)";
  }
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12.5);
  ctx.fill();
  ctx.stroke();

  // Target indicator icon (scaled 1.25x)
  ctx.fillStyle = color;
  ctx.beginPath();
  if (name.includes("SPHERE")) {
    ctx.arc(x + 22, y + h / 2, 9, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.roundRect(x + 15, y + h / 2 - 7.5, 15, 15, 3.75);
    ctx.fill();
  }

  // 2-line vertical layout matching desktop HUD: name on top, action below (zero horizontal collision)
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Top line: stimulus name (scaled 1.25x: 9.5px -> 12px)
  ctx.font = "bold 12px monospace";
  ctx.letterSpacing = "0.6px";
  ctx.fillStyle = isGreen ? "#86efac" : "#fda4af";
  ctx.fillText(name, x + 42, y + 19);

  // Bottom line: stimulus action (scaled 1.25x: 13px -> 16px)
  ctx.font = "bold 16px 'OffBit', monospace";
  ctx.letterSpacing = "1.25px";
  ctx.fillStyle = isPress ? "#ffffff" : isGreen ? "#4ade80" : "#fb7185";
  ctx.fillText(action, x + 42, y + 39);

  // Cleanly reset letterSpacing
  ctx.letterSpacing = "0px";
}
