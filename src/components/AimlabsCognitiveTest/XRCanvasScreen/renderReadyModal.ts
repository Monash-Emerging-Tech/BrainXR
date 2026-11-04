import type { CanvasScreenRenderState, InteractiveHitArea } from "./types";

export function renderReadyModal(
  ctx: CanvasRenderingContext2D,
  width: number,
  _height: number,
  state: CanvasScreenRenderState,
  hitAreas: InteractiveHitArea[]
): void {
  const cx = width / 2;

  // Eyebrow
  ctx.font = "bold 18px 'OffBit', monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "center";
  ctx.letterSpacing = "6px";
  ctx.fillText("FOCUS AS A VECTOR QUANTITY", cx, 140);

  // Title: BrainXR
  ctx.font = "bold 64px 'OffBit', monospace";
  ctx.letterSpacing = "2px";
  const bWidth = ctx.measureText("BRAIN").width;
  const xrWidth = ctx.measureText("XR").width;
  const totalW = bWidth + xrWidth;
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("BRAIN", cx - totalW / 2, 220);
  ctx.fillStyle = "#22d3ee";
  ctx.fillText("XR", cx - totalW / 2 + bWidth, 220);

  // Subtitle
  ctx.font = "20px monospace";
  ctx.letterSpacing = "0px";
  ctx.textAlign = "center";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("a cognitive game to track the direction of focus.", cx, 270);

  // Draw Dual Round Cards with the starting round ordered as Round 1 on the left
  const cardW = 580;
  const cardH = 340;
  const gap = 40;
  const cardY = 320;
  const isStartRound1 = state.round === 1;

  const cptCardConfig = {
    title: "Continuous Performance Test",
    target1: { name: "Green Sphere", action: "PRESS", color: "#22c55e", press: true },
    target2: { name: "Red Box", action: "DO NOT PRESS", color: "#f43f5e", press: false },
  };

  const sartCardConfig = {
    title: "Sustained Attention to Response Task",
    target1: { name: "Red Box", action: "PRESS", color: "#f43f5e", press: true },
    target2: { name: "Green Sphere", action: "DO NOT PRESS", color: "#22c55e", press: false },
  };

  if (isStartRound1) {
    // Round 1 (Left): CPT
    drawCard(ctx, cx - cardW - gap / 2, cardY, cardW, cardH, {
      badge: "● ROUND 1 · CPT",
      badgeColor: "#F3DA66",
      type: "",
      title: cptCardConfig.title,
      isStarting: true,
      target1: cptCardConfig.target1,
      target2: cptCardConfig.target2,
    });

    // Round 2 (Right): SART
    drawCard(ctx, cx + gap / 2, cardY, cardW, cardH, {
      badge: "ROUND 2 · SART",
      badgeColor: "#22d3ee",
      type: "",
      title: sartCardConfig.title,
      isStarting: false,
      target1: sartCardConfig.target1,
      target2: sartCardConfig.target2,
    });
  } else {
    // Round 1 (Left): SART
    drawCard(ctx, cx - cardW - gap / 2, cardY, cardW, cardH, {
      badge: "● ROUND 1 · SART",
      badgeColor: "#22d3ee",
      type: "",
      title: sartCardConfig.title,
      isStarting: true,
      target1: sartCardConfig.target1,
      target2: sartCardConfig.target2,
    });

    // Round 2 (Right): CPT
    drawCard(ctx, cx + gap / 2, cardY, cardW, cardH, {
      badge: "ROUND 2 · CPT",
      badgeColor: "#F3DA66",
      type: "",
      title: cptCardConfig.title,
      isStarting: false,
      target1: cptCardConfig.target1,
      target2: cptCardConfig.target2,
    });
  }

  // Subtext info
  ctx.font = "16px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "center";
  ctx.fillText("1 Target at a Time  ·  500ms flash + 700ms fixation  ·  Stroop Effect on Instructions", cx, 710);

  // Action Buttons
  const btnY = 760;
  const btnH = 68;

  // Back Button
  const backW = 220;
  const backX = cx - backW - 20;
  const isBackHover = state.hoverId === "exit";
  ctx.fillStyle = isBackHover ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.06)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(backX, btnY, backW, btnH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 18px monospace";
  ctx.fillStyle = isBackHover ? "#ffffff" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("← Back", backX + backW / 2, btnY + 42);
  hitAreas.push({ id: "exit", type: "exit", x: backX, y: btnY, width: backW, height: btnH });

  // Play Now Button
  const startW = 280;
  const startX = cx + 20;
  const isStartHover = state.hoverId === "start-game";
  ctx.fillStyle = isStartHover ? "#e2e8f0" : "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(startX, btnY, startW, btnH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 20px 'OffBit', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("READY TO START →", startX + startW / 2, btnY + 42);
  ctx.letterSpacing = "0px";
  hitAreas.push({ id: "start-game", type: "start-game", x: startX, y: btnY, width: startW, height: btnH });
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cfg: any
): void {
  ctx.save();
  ctx.fillStyle = cfg.isStarting ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.6)";
  ctx.strokeStyle = cfg.isStarting ? cfg.badgeColor : "rgba(51, 65, 85, 0.5)";
  ctx.lineWidth = cfg.isStarting ? 2.5 : 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 16px monospace";
  ctx.fillStyle = cfg.badgeColor;
  ctx.textAlign = "left";
  ctx.fillText(cfg.badge, x + 24, y + 40);

  if (cfg.type) {
    ctx.fillStyle = "#F3DA66";
    ctx.textAlign = "right";
    ctx.font = "bold 12px monospace";
    ctx.fillText(cfg.type, x + w - 24, y + 40);
  }

  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "left";
  ctx.font = "16px monospace";
  ctx.fillText(cfg.title, x + 24, y + 74);

  drawRuleRow(ctx, x + 24, y + 110, w - 48, 80, cfg.target1);
  drawRuleRow(ctx, x + 24, y + 210, w - 48, 80, cfg.target2);
  ctx.restore();
}

function drawRuleRow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, target: any) {
  const isPress = target.action === "PRESS";
  ctx.fillStyle = isPress ? "rgba(76, 5, 25, 0.4)" : "rgba(4, 47, 46, 0.5)";
  ctx.strokeStyle = isPress ? "rgba(244, 63, 94, 0.35)" : "rgba(34, 197, 94, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();

  // Target indicator dot
  ctx.fillStyle = target.color;
  ctx.beginPath();
  if (target.name.includes("Sphere")) {
    ctx.arc(x + 36, y + h / 2, 12, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.roundRect(x + 24, y + h / 2 - 12, 24, 24, 4);
    ctx.fill();
  }

  ctx.font = "bold 18px monospace";
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "left";
  ctx.fillText(target.name, x + 64, y + h / 2 + 6);

  // Stroop Effect on Instructions: "PRESS" in rose/red, "DO NOT PRESS" in green
  ctx.font = "bold 18px 'OffBit', monospace";
  ctx.fillStyle = isPress ? "#fb7185" : "#34d399";
  ctx.textAlign = "right";
  ctx.fillText(target.action, x + w - 24, y + h / 2 + 6);
}
