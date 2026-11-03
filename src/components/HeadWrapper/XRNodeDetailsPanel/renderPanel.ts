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
export const PANEL_HEIGHT = 460;

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

/**
 * Creates the exact authentic 5-stop cortical region gradient used across the site:
 * Frontal (#6366f1) -> Temporal (#a855f7) -> Central (#3b82f6) -> Parietal (#06b6d4) -> Occipital (#10b981)
 */
function createNodeGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): CanvasGradient {
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0.0, "#6366f1");
  grad.addColorStop(0.25, "#a855f7");
  grad.addColorStop(0.5, "#3b82f6");
  grad.addColorStop(0.75, "#06b6d4");
  grad.addColorStop(1.0, "#10b981");
  return grad;
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

  // Background glass slate - identical to the web app's deep obsidian glass style
  drawRoundedRect(ctx, 16, 16, PANEL_WIDTH - 32, PANEL_HEIGHT - 32, 28);
  ctx.fillStyle = "rgba(11, 15, 23, 0.90)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.stroke();

  // =========================================================================
  // STATE A: NO ELECTRODE SELECTED -> EXACT WEB GUIDANCE & SIGNIFIERS
  // =========================================================================
  if (!channel) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 1. Top Subheading with the exact CSS font-mono tracking-[0.22em] gradient text
    ctx.font = "900 13px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillStyle = createNodeGradient(ctx, 200, 56, 824, 56);
    ctx.fillText("PINCH AND CLICK NODES TO EXPLORE WHAT EEG HEADSETS DO", PANEL_WIDTH / 2, 56);
    ctx.letterSpacing = "0px";

    // 2. Authentic Distressed "SIMULATED DEMO" Rubber Stamp Badge
    ctx.save();
    ctx.translate(PANEL_WIDTH / 2, 134);
    ctx.rotate((-4.5 * Math.PI) / 180); // Exact -4.5deg angle from .stamp-demo-badge

    const stampW = 320;
    const stampH = 54;
    const stampX = -stampW / 2;
    const stampY = -stampH / 2;

    const stampGrad = createNodeGradient(ctx, stampX, stampY, stampX + stampW, stampY + stampH);

    drawRoundedRect(ctx, stampX, stampY, stampW, stampH, 10);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = stampGrad;
    ctx.stroke();

    ctx.font = "900 28px sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillStyle = stampGrad;
    ctx.fillText("SIMULATED DEMO", 0, 0);
    ctx.restore();

    // 3. EEG Recording context sub-line matching .font-offbit tracking-wide text
    ctx.font = "17px 'OffBit', monospace";
    ctx.fillStyle = "#cbd5e1";
    const trialNum = String((frame.trialIndex ?? 0) + 1).padStart(2, "0");
    ctx.fillText(
      `EEG recording for participant #7 listening to video-${trialNum}.m4a`,
      PANEL_WIDTH / 2,
      216
    );

    // 4. Subtle 3-Pill Spatial Interaction Guide (Matching web's sleek rounded-full pills)
    const guideY = 270;
    const pillH = 40;
    const pillW = 260;
    const gap = 20;
    const startX = (PANEL_WIDTH - (pillW * 3 + gap * 2)) / 2;

    const guides = [
      { tag: "TRIGGER", label: "Pinch node to inspect" },
      { tag: "GRIP", label: "Hold grip to reposition" },
      { tag: "PORTAL", label: "Direction of Focus" },
    ];

    guides.forEach((g, i) => {
      const gx = startX + i * (pillW + gap);
      drawRoundedRect(ctx, gx, guideY, pillW, pillH, 20);
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.stroke();

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "left";
      ctx.fillText(g.tag, gx + 18, guideY + pillH / 2);

      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(g.label, gx + 78, guideY + pillH / 2);
    });

    // 5. Direction of Focus Primary Button matching web design
    // Indigo pill with SVG icon aesthetic: "Launch Experience"
    const btnW = 340;
    const btnH = 50;
    const btnX = PANEL_WIDTH / 2 - btnW / 2;
    const btnY = 360;
    const isHovered = hoverId === "direction";

    drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 25);
    ctx.fillStyle = isHovered ? "#4f46e5" : "#4338ca";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isHovered ? "#a5b4fc" : "rgba(165, 180, 252, 0.45)";
    ctx.stroke();

    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Launch Experience  ✦", PANEL_WIDTH / 2, btnY + btnH / 2);

    hitAreas.push({
      id: "direction",
      x: btnX,
      y: btnY,
      width: btnW,
      height: btnH,
    });

    return;
  }

  // =========================================================================
  // STATE B: ELECTRODE SELECTED -> EXACT 1:1 NODE DETAILS BANNER DESIGN
  // =========================================================================
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

  // 1. Previous Node Button (Identical to web: Big Circular button with previous region color)
  const prevBtnX = 66;
  const prevBtnY = 96;
  const btnRadius = 26;
  const isPrevHovered = hoverId === "prev";

  ctx.beginPath();
  ctx.arc(prevBtnX, prevBtnY, isPrevHovered ? btnRadius + 3 : btnRadius, 0, Math.PI * 2);
  ctx.fillStyle = prevColor;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.stroke();

  // Hollow chevron arrow left
  ctx.beginPath();
  ctx.moveTo(prevBtnX + 5, prevBtnY - 9);
  ctx.lineTo(prevBtnX - 4, prevBtnY);
  ctx.lineTo(prevBtnX + 5, prevBtnY + 9);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  hitAreas.push({
    id: "prev",
    x: prevBtnX - btnRadius - 8,
    y: prevBtnY - btnRadius - 8,
    width: (btnRadius + 8) * 2,
    height: (btnRadius + 8) * 2,
  });

  // 2. Next Node Button (Identical to web: Big Circular button with next region color)
  const nextBtnX = PANEL_WIDTH - 66;
  const nextBtnY = 96;
  const isNextHovered = hoverId === "next";

  ctx.beginPath();
  ctx.arc(nextBtnX, nextBtnY, isNextHovered ? btnRadius + 3 : btnRadius, 0, Math.PI * 2);
  ctx.fillStyle = nextColor;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.stroke();

  // Hollow chevron arrow right
  ctx.beginPath();
  ctx.moveTo(nextBtnX - 5, nextBtnY - 9);
  ctx.lineTo(nextBtnX + 4, nextBtnY);
  ctx.lineTo(nextBtnX - 5, nextBtnY + 9);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  hitAreas.push({
    id: "next",
    x: nextBtnX - btnRadius - 8,
    y: nextBtnY - btnRadius - 8,
    width: (btnRadius + 8) * 2,
    height: (btnRadius + 8) * 2,
  });

  // 3. Center Section: Exact Web NodeDetailsBanner Layout
  const contentLeft = 120;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Cortical Region Pill: 1.5px border with 20% opacity bg, pulsating inner dot
  const regX = contentLeft;
  const regY = 74;
  const regW = 160;
  const regH = 34;
  drawRoundedRect(ctx, regX, regY, regW, regH, 17);
  ctx.fillStyle = `${accentColor}25`;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  // Pulse circle
  ctx.beginPath();
  ctx.arc(regX + 18, regY + regH / 2, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();

  ctx.font = "bold 12px sans-serif";
  ctx.fillStyle = accentColor;
  ctx.fillText(`${region.toUpperCase()} CORTEX`, regX + 32, regY + regH / 2);

  // Node Name (font-mono text-lg font-black) + Full Name
  ctx.font = "900 24px monospace";
  ctx.fillStyle = "#ffffff";
  const nameX = regX + regW + 20;
  ctx.fillText(channel, nameX, regY + regH / 2);

  const channelWidth = ctx.measureText(channel).width;
  ctx.font = "600 14px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`(${meta?.fullName ?? ""})`, nameX + channelWidth + 10, regY + regH / 2);

  // Live Raw Voltage Readout: text-emerald-500
  const voltX = PANEL_WIDTH - 280;
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("RAW:", voltX, regY + regH / 2);

  ctx.font = "800 18px monospace";
  ctx.fillStyle = "#10b981";
  const voltStr = `${rawValue >= 0 ? `+${rawValue.toFixed(2)}` : rawValue.toFixed(2)} µV`;
  ctx.fillText(voltStr, voltX + 46, regY + regH / 2);

  // Divider
  ctx.beginPath();
  ctx.moveTo(contentLeft, 136);
  ctx.lineTo(PANEL_WIDTH - 120, 136);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.stroke();

  // 4. Insight / Metric Section matching web text hierarchy
  if (insight) {
    ctx.font = "900 13px sans-serif";
    ctx.fillStyle = "#f8fafc";
    ctx.fillText("MEASURES: ", contentLeft, 170);

    ctx.fillStyle = accentColor;
    ctx.fillText(insight.metricName.toUpperCase(), contentLeft + 86, 170);

    // Insight description paragraph
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#cbd5e1";

    const words = insight.description.split(" ");
    let line = "";
    let y = 208;
    const maxDescWidth = PANEL_WIDTH - contentLeft - 140;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxDescWidth && n > 0) {
        ctx.fillText(line, contentLeft, y);
        line = words[n] + " ";
        y += 26;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, contentLeft, y);
  }

  // 5. Bottom Actions: Deselect Button + "Launch Experience"
  const footerY = 375;

  // Deselect node button
  const closeBtnW = 180;
  const closeBtnH = 44;
  const closeBtnX = contentLeft;
  const isCloseHovered = hoverId === "close";

  drawRoundedRect(ctx, closeBtnX, footerY, closeBtnW, closeBtnH, 22);
  ctx.fillStyle = isCloseHovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.06)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.stroke();

  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";
  ctx.fillText("✕ Deselect Node", closeBtnX + closeBtnW / 2, footerY + closeBtnH / 2);

  hitAreas.push({
    id: "close",
    x: closeBtnX,
    y: footerY,
    width: closeBtnW,
    height: closeBtnH,
  });

  // Launch Experience button (In-VR Transition into Direction of Focus)
  const dirBtnW = 260;
  const dirBtnH = 44;
  const dirBtnX = PANEL_WIDTH - 120 - dirBtnW;
  const isDirHovered = hoverId === "direction";

  drawRoundedRect(ctx, dirBtnX, footerY, dirBtnW, dirBtnH, 22);
  ctx.fillStyle = isDirHovered ? "#4f46e5" : "#4338ca";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isDirHovered ? "#a5b4fc" : "rgba(165, 180, 252, 0.4)";
  ctx.stroke();

  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("Launch Experience  ✦", dirBtnX + dirBtnW / 2, footerY + dirBtnH / 2);

  hitAreas.push({
    id: "direction",
    x: dirBtnX,
    y: footerY,
    width: dirBtnW,
    height: dirBtnH,
  });
}
