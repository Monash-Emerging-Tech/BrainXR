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

export const PANEL_WIDTH = 1100;
export const PANEL_HEIGHT = 650;

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
  // Clear full canvas so there is NO big bounding card - only floating pills!
  ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);

  const centerX = PANEL_WIDTH / 2;

  // =========================================================================
  // STATE A: IDLE (NO ELECTRODE SELECTED)
  // Balanced floating pills framing the headset:
  // 1. Top HUD pill: [ PINCH NODE TO INSPECT | HOLD GRIP TO MOVE ]
  // 2. Middle badge pill: [ SIMULATED DEMO · PARTICIPANT #7 · VIDEO-01.M4A ]
  // 3. Bottom primary action pill: [ Measure Your Focus ✦ ]
  // =========================================================================
  if (!channel) {
    ctx.textBaseline = "middle";

    // 1. Top HUD Guidance Pill (Y: 28)
    const topPillW = 560;
    const topPillH = 50;
    const topPillX = centerX - topPillW / 2;
    const topPillY = 28;

    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "rgba(51, 65, 85, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(topPillX, topPillY, topPillW, topPillH, topPillH / 2);
    ctx.fill();
    ctx.stroke();

    // Trigger segment
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "left";
    ctx.fillText("PINCH", topPillX + 24, topPillY + topPillH / 2);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("Node to inspect", topPillX + 74, topPillY + topPillH / 2);

    // Divider
    ctx.fillStyle = "#475569";
    ctx.fillText("|", topPillX + 226, topPillY + topPillH / 2);

    // Grip segment
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#a855f7";
    ctx.fillText("HOLD GRIP", topPillX + 248, topPillY + topPillH / 2);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("To reposition", topPillX + 338, topPillY + topPillH / 2);

    // 2. Bottom Context Pill (Y: 510)
    const trialNum = String((frame.trialIndex ?? 0) + 1).padStart(2, "0");
    const infoPillW = 520;
    const infoPillH = 42;
    const infoPillX = centerX - infoPillW / 2;
    const infoPillY = 510;

    ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
    ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(infoPillX, infoPillY, infoPillW, infoPillH, infoPillH / 2);
    ctx.fill();
    ctx.stroke();

    // Small glowing dot
    ctx.beginPath();
    ctx.arc(infoPillX + 22, infoPillY + infoPillH / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();

    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.fillText("RECORDING", infoPillX + 36, infoPillY + infoPillH / 2);

    ctx.fillStyle = "#475569";
    ctx.fillText("|", infoPillX + 122, infoPillY + infoPillH / 2);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(`Participant #7 · video-${trialNum}.m4a`, infoPillX + 138, infoPillY + infoPillH / 2);

    // 3. Bottom Primary CTA Pill: [ Measure Your Focus ✦ ] (Y: 574)
    const btnW = 320;
    const btnH = 52;
    const btnX = centerX - btnW / 2;
    const btnY = 574;
    const isHovered = hoverId === "direction";

    ctx.fillStyle = isHovered ? "#4f46e5" : "rgba(30, 27, 75, 0.92)";
    ctx.strokeStyle = isHovered ? "#c7d2fe" : "#6366f1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, btnH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Measure Your Focus  ✦", btnX + btnW / 2, btnY + btnH / 2);

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
  // STATE B: ELECTRODE SELECTED
  // Spatially balanced pills surrounding the headset:
  // 1. Top HUD Pill: [ REGION CORTEX | NODE NAME (FULL NAME) | RAW: +X.XX µV ]
  // 2. Left Circular Navigation Pill: [ ← PREV ]
  // 3. Right Circular Navigation Pill: [ NEXT → ]
  // 4. Lower Insight Pill / Rect: [ MEASURES: COGNITIVE METRIC | Insight description text ]
  // 5. Bottom Action Pills: [ ✕ Deselect Node ] and [ Measure Your Focus ✦ ]
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

  ctx.textBaseline = "middle";

  // -------------------------------------------------------------------------
  // 1. Top Telemetry Header Pill (Floating above the headset at Y: 24)
  // Matching the HUD format from renderHUD.ts
  // -------------------------------------------------------------------------
  const headerW = 720;
  const headerH = 54;
  const headerX = centerX - headerW / 2;
  const headerY = 24;

  ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.75)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(headerX, headerY, headerW, headerH, headerH / 2);
  ctx.fill();
  ctx.stroke();

  // Region Badge indicator inside pill
  ctx.beginPath();
  ctx.arc(headerX + 24, headerY + headerH / 2, 5, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();

  ctx.font = "bold 13px monospace";
  ctx.fillStyle = accentColor;
  ctx.textAlign = "left";
  ctx.fillText(`${region.toUpperCase()}`, headerX + 38, headerY + headerH / 2);

  // Divider 1
  ctx.font = "13px monospace";
  ctx.fillStyle = "#475569";
  ctx.fillText("|", headerX + 138, headerY + headerH / 2);

  // Node Name + Full Name
  ctx.font = "900 18px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(channel, headerX + 154, headerY + headerH / 2);

  const channelWidth = ctx.measureText(channel).width;
  ctx.font = "500 13px sans-serif";
  ctx.fillStyle = "#94a3b8";
  const fullNameStr = meta?.fullName ? `(${meta.fullName})` : "";
  ctx.fillText(fullNameStr, headerX + 154 + channelWidth + 10, headerY + headerH / 2);

  // Divider 2
  ctx.font = "13px monospace";
  ctx.fillStyle = "#475569";
  ctx.fillText("|", headerX + 510, headerY + headerH / 2);

  // Live Voltage
  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("RAW", headerX + 526, headerY + headerH / 2);

  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#10b981";
  const voltStr = `${rawValue >= 0 ? `+${rawValue.toFixed(2)}` : rawValue.toFixed(2)} µV`;
  ctx.fillText(voltStr, headerX + 566, headerY + headerH / 2);

  // -------------------------------------------------------------------------
  // 2. Left & Right Navigation Pill/Circle Buttons (Floating at sides, Y: 290)
  // Perfectly framing the physical head
  // -------------------------------------------------------------------------
  const sideY = 290;
  const sideW = 90;
  const sideH = 50;

  // Left Side Pill [ ← PREV ]
  const leftX = 30;
  const isPrevHovered = hoverId === "prev";

  ctx.fillStyle = isPrevHovered ? prevColor : "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = isPrevHovered ? "#ffffff" : prevColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(leftX, sideY - sideH / 2, sideW, sideH, sideH / 2);
  ctx.fill();
  ctx.stroke();

  // Left Arrow & Channel Label
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = isPrevHovered ? "#ffffff" : prevColor;
  ctx.textAlign = "center";
  ctx.fillText(`← ${prevChannel}`, leftX + sideW / 2, sideY);

  hitAreas.push({
    id: "prev",
    x: leftX,
    y: sideY - sideH / 2,
    width: sideW,
    height: sideH,
  });

  // Right Side Pill [ NEXT → ]
  const rightX = PANEL_WIDTH - 30 - sideW;
  const isNextHovered = hoverId === "next";

  ctx.fillStyle = isNextHovered ? nextColor : "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = isNextHovered ? "#ffffff" : nextColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(rightX, sideY - sideH / 2, sideW, sideH, sideH / 2);
  ctx.fill();
  ctx.stroke();

  // Right Channel Label & Arrow
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = isNextHovered ? "#ffffff" : nextColor;
  ctx.textAlign = "center";
  ctx.fillText(`${nextChannel} →`, rightX + sideW / 2, sideY);

  hitAreas.push({
    id: "next",
    x: rightX,
    y: sideY - sideH / 2,
    width: sideW,
    height: sideH,
  });

  // -------------------------------------------------------------------------
  // 3. Lower Insight Pill / Rounded Rect Container (Y: 460)
  // Formatted like HUD telemetry card from /direction
  // -------------------------------------------------------------------------
  const insightW = 760;
  const insightH = 96;
  const insightX = centerX - insightW / 2;
  const insightY = 460;

  ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.75)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(insightX, insightY, insightW, insightH, 20);
  ctx.fill();
  ctx.stroke();

  if (insight) {
    // Header line inside insight pill
    ctx.textAlign = "left";
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("MEASURES", insightX + 24, insightY + 26);

    ctx.fillStyle = "#475569";
    ctx.fillText("|", insightX + 96, insightY + 26);

    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = accentColor;
    ctx.fillText(insight.metricName.toUpperCase(), insightX + 112, insightY + 26);

    // Insight description text inside pill
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#cbd5e1";

    const words = insight.description.split(" ");
    let line = "";
    let descY = insightY + 54;
    const maxDescWidth = insightW - 48;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxDescWidth && n > 0) {
        ctx.fillText(line, insightX + 24, descY);
        line = words[n] + " ";
        descY += 22;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, insightX + 24, descY);
  }

  // -------------------------------------------------------------------------
  // 4. Bottom Action Pills (Y: 574)
  // Two discrete pill buttons: [ ✕ Deselect Node ] and [ Measure Your Focus ✦ ]
  // -------------------------------------------------------------------------
  const actionY = 574;
  const actionH = 48;

  // Deselect Node Pill Button
  const closeW = 200;
  const closeX = centerX - 240;
  const isCloseHovered = hoverId === "close";

  ctx.fillStyle = isCloseHovered ? "#334155" : "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = isCloseHovered ? "#94a3b8" : "rgba(71, 85, 105, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(closeX, actionY, closeW, actionH, actionH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = isCloseHovered ? "#ffffff" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("✕  Deselect Node", closeX + closeW / 2, actionY + actionH / 2);

  hitAreas.push({
    id: "close",
    x: closeX,
    y: actionY,
    width: closeW,
    height: actionH,
  });

  // Measure Your Focus Pill Button
  const dirW = 260;
  const dirX = centerX + 40;
  const isDirHovered = hoverId === "direction";

  ctx.fillStyle = isDirHovered ? "#4f46e5" : "rgba(30, 27, 75, 0.92)";
  ctx.strokeStyle = isDirHovered ? "#c7d2fe" : "#6366f1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(dirX, actionY, dirW, actionH, actionH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("Measure Your Focus  ✦", dirX + dirW / 2, actionY + actionH / 2);

  hitAreas.push({
    id: "direction",
    x: dirX,
    y: actionY,
    width: dirW,
    height: actionH,
  });
}
