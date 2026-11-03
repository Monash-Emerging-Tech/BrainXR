import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import { getElectrodeMetadata } from "../../../utils/signalSource";
import { REGION_COLOR } from "../../../utils/electrodeVisualState";
import { NODE_INSIGHTS } from "../../../utils/nodeInsights";
import { ELECTRODE_DISPLAY_ORDER } from "../../../utils/electrodeDisplayOrder";

export interface NodePanelHitArea {
  id: "prev" | "next" | "close" | "direction";
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PANEL_WIDTH = 1024;
export const PANEL_HEIGHT = 560;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function renderNodeDetailsCanvas(
  ctx: CanvasRenderingContext2D,
  channel: ElectrodeName | null,
  frame: Frame,
  hoverId: string | null,
  hitAreas: NodePanelHitArea[]
): void {
  hitAreas.length = 0;
  ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);

  // Background glass slate
  drawRoundedRect(ctx, 16, 16, PANEL_WIDTH - 32, PANEL_HEIGHT - 32, 28);
  ctx.fillStyle = "rgba(10, 15, 26, 0.88)";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.stroke();

  // If no channel is selected, render the interaction prompt
  if (!channel) {
    // Spatial Guidance Signifier / Prompt
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Eyebrow pill
    const badgeW = 260;
    const badgeH = 44;
    const badgeX = PANEL_WIDTH / 2 - badgeW / 2;
    const badgeY = 60;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 22);
    ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(34, 211, 238, 0.55)";
    ctx.stroke();

    ctx.font = "bold 18px 'OffBit', monospace";
    ctx.fillStyle = "#22d3ee";
    ctx.fillText("SPATIAL INTERACTION", PANEL_WIDTH / 2, badgeY + badgeH / 2);

    // Main Instruction
    ctx.font = "bold 34px 'OffBit', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("HOW TO INTERACT IN XR", PANEL_WIDTH / 2, 160);

    // Three gesture instructional cards
    const cardY = 220;
    const cardH = 200;
    const cardW = 280;
    const gap = 30;
    const startX = (PANEL_WIDTH - (cardW * 3 + gap * 2)) / 2;

    const cards = [
      {
        icon: "PINCH / CLICK",
        title: "SELECT NODE",
        desc: "Aim your laser ray at any electrode sensor and pull trigger to view live microvolts & cortical role.",
        color: "#22c55e",
      },
      {
        icon: "GRIP / SQUEEZE",
        title: "REPOSITION",
        desc: "Hold the side grip button while aiming at the head to drag, rotate, or bring it closer in 3D room space.",
        color: "#38bdf8",
      },
      {
        icon: "PORTAL",
        title: "COGNITIVE TEST",
        desc: "Click the Direction of Focus button below to step into the spatial CPT + SART attention assessment.",
        color: "#a855f7",
      },
    ];

    cards.forEach((c, idx) => {
      const cx = startX + idx * (cardW + gap);
      drawRoundedRect(ctx, cx, cardY, cardW, cardH, 18);
      ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `${c.color}55`;
      ctx.stroke();

      ctx.font = "bold 13px monospace";
      ctx.fillStyle = c.color;
      ctx.textAlign = "center";
      ctx.fillText(c.icon, cx + cardW / 2, cardY + 36);

      ctx.font = "bold 20px 'OffBit', monospace";
      ctx.fillStyle = "#f8fafc";
      ctx.fillText(c.title, cx + cardW / 2, cardY + 70);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#94a3b8";
      // Multi-line word wrap for description
      const words = c.desc.split(" ");
      let line = "";
      let y = cardY + 110;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > cardW - 32 && n > 0) {
          ctx.fillText(line, cx + cardW / 2, y);
          line = words[n] + " ";
          y += 20;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, cx + cardW / 2, y);
    });

    // Direction of Focus quick launcher button
    const btnW = 320;
    const btnH = 54;
    const btnX = PANEL_WIDTH / 2 - btnW / 2;
    const btnY = 460;
    const isBtnHovered = hoverId === "direction";

    drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 27);
    ctx.fillStyle = isBtnHovered ? "#4f46e5" : "#4338ca";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isBtnHovered ? "#818cf8" : "rgba(255, 255, 255, 0.25)";
    ctx.stroke();

    ctx.font = "bold 18px 'OffBit', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("LAUNCH DIRECTION OF FOCUS →", PANEL_WIDTH / 2, btnY + btnH / 2);

    hitAreas.push({
      id: "direction",
      x: btnX,
      y: btnY,
      width: btnW,
      height: btnH,
    });

    return;
  }

  // --- Active Electrode Node Details Display ---
  const meta = getElectrodeMetadata(channel);
  const insight = NODE_INSIGHTS[channel];
  const region = meta?.region ?? "Frontal";
  const accentColor = REGION_COLOR[region] ?? "#6366f1";
  const rawSample = frame.channels[channel];
  const rawValue = rawSample?.value ?? 0;

  const currentIndex = ELECTRODE_DISPLAY_ORDER.indexOf(channel);
  const prevIndex = currentIndex <= 0 ? ELECTRODE_DISPLAY_ORDER.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex >= ELECTRODE_DISPLAY_ORDER.length - 1 ? 0 : currentIndex + 1;
  const prevChannel = ELECTRODE_DISPLAY_ORDER[prevIndex];
  const nextChannel = ELECTRODE_DISPLAY_ORDER[nextIndex];
  const prevMeta = getElectrodeMetadata(prevChannel);
  const nextMeta = getElectrodeMetadata(nextChannel);
  const prevColor = REGION_COLOR[prevMeta?.region ?? "Frontal"] ?? "#6366f1";
  const nextColor = REGION_COLOR[nextMeta?.region ?? "Frontal"] ?? "#6366f1";

  // Previous button (Circle)
  const prevBtnX = 64;
  const prevBtnY = 80;
  const btnRadius = 32;
  const isPrevHovered = hoverId === "prev";

  ctx.beginPath();
  ctx.arc(prevBtnX, prevBtnY, btnRadius, 0, Math.PI * 2);
  ctx.fillStyle = prevColor;
  ctx.fill();
  ctx.lineWidth = isPrevHovered ? 3 : 1.5;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // Left arrow chevron
  ctx.beginPath();
  ctx.moveTo(prevBtnX + 6, prevBtnY - 12);
  ctx.lineTo(prevBtnX - 6, prevBtnY);
  ctx.lineTo(prevBtnX + 6, prevBtnY + 12);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  hitAreas.push({
    id: "prev",
    x: prevBtnX - btnRadius,
    y: prevBtnY - btnRadius,
    width: btnRadius * 2,
    height: btnRadius * 2,
  });

  // Next button (Circle)
  const nextBtnX = PANEL_WIDTH - 64;
  const nextBtnY = 80;
  const isNextHovered = hoverId === "next";

  ctx.beginPath();
  ctx.arc(nextBtnX, nextBtnY, btnRadius, 0, Math.PI * 2);
  ctx.fillStyle = nextColor;
  ctx.fill();
  ctx.lineWidth = isNextHovered ? 3 : 1.5;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // Right arrow chevron
  ctx.beginPath();
  ctx.moveTo(nextBtnX - 6, nextBtnY - 12);
  ctx.lineTo(nextBtnX + 6, nextBtnY);
  ctx.lineTo(nextBtnX - 6, nextBtnY + 12);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  hitAreas.push({
    id: "next",
    x: nextBtnX - btnRadius,
    y: nextBtnY - btnRadius,
    width: btnRadius * 2,
    height: btnRadius * 2,
  });

  // Center header: Region pill + Node name + Voltage
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Region pill
  const regX = 130;
  const regY = 56;
  const regW = 190;
  const regH = 46;
  drawRoundedRect(ctx, regX, regY, regW, regH, 23);
  ctx.fillStyle = `${accentColor}28`;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  // Pulsing dot
  ctx.beginPath();
  ctx.arc(regX + 24, regY + 23, 6, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();

  ctx.font = "bold 17px 'OffBit', monospace";
  ctx.fillStyle = accentColor;
  ctx.fillText(`${region.toUpperCase()} CORTEX`, regX + 42, regY + 24);

  // Electrode identifier
  ctx.font = "bold 38px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(channel, regX + regW + 24, regY + 22);

  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`(${meta?.fullName ?? ""})`, regX + regW + 115, regY + 22);

  // Voltage readout
  const voltX = 720;
  ctx.font = "bold 15px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("RAW VOLTAGE:", voltX, regY + 12);

  ctx.font = "bold 28px monospace";
  ctx.fillStyle = "#10b981";
  const voltStr = `${rawValue >= 0 ? `+${rawValue.toFixed(2)}` : rawValue.toFixed(2)} µV`;
  ctx.fillText(voltStr, voltX, regY + 36);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(60, 140);
  ctx.lineTo(PANEL_WIDTH - 60, 140);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.stroke();

  // Insight & Measurement Description
  if (insight) {
    ctx.font = "bold 20px 'OffBit', monospace";
    ctx.fillStyle = "#f8fafc";
    ctx.fillText("NEURAL COGNITIVE METRIC:", 64, 185);

    ctx.font = "bold 24px monospace";
    ctx.fillStyle = accentColor;
    ctx.fillText(insight.metricName.toUpperCase(), 350, 185);

    // Multiline Description box
    drawRoundedRect(ctx, 60, 220, PANEL_WIDTH - 120, 180, 16);
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.stroke();

    ctx.font = "19px sans-serif";
    ctx.fillStyle = "#e2e8f0";
    const words = insight.description.split(" ");
    let line = "";
    let y = 265;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > PANEL_WIDTH - 180 && n > 0) {
        ctx.fillText(line, 90, y);
        line = words[n] + " ";
        y += 34;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 90, y);
  }

  // Footer: Deselect / Reset button & Direction button
  const closeBtnW = 200;
  const closeBtnH = 48;
  const closeBtnX = 64;
  const closeBtnY = 440;
  const isCloseHovered = hoverId === "close";

  drawRoundedRect(ctx, closeBtnX, closeBtnY, closeBtnW, closeBtnH, 24);
  ctx.fillStyle = isCloseHovered ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.08)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.stroke();

  ctx.font = "bold 15px 'OffBit', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("✕ DESELECT NODE", closeBtnX + closeBtnW / 2, closeBtnY + closeBtnH / 2);

  hitAreas.push({
    id: "close",
    x: closeBtnX,
    y: closeBtnY,
    width: closeBtnW,
    height: closeBtnH,
  });

  // Launch Direction Experience button
  const dirBtnW = 300;
  const dirBtnH = 48;
  const dirBtnX = PANEL_WIDTH - 64 - dirBtnW;
  const dirBtnY = 440;
  const isDirHovered = hoverId === "direction";

  drawRoundedRect(ctx, dirBtnX, dirBtnY, dirBtnW, dirBtnH, 24);
  ctx.fillStyle = isDirHovered ? "#4f46e5" : "#4338ca";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = isDirHovered ? "#818cf8" : "rgba(255, 255, 255, 0.2)";
  ctx.stroke();

  ctx.font = "bold 16px 'OffBit', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("DIRECTION OF FOCUS →", dirBtnX + dirBtnW / 2, dirBtnY + dirBtnH / 2);

  hitAreas.push({
    id: "direction",
    x: dirBtnX,
    y: dirBtnY,
    width: dirBtnW,
    height: dirBtnH,
  });
}

