import type { ElectrodeName, Frame } from "../../../../utils/signalSource";
import { getElectrodeMetadata } from "../../../../utils/signalSource";
import { REGION_COLOR } from "../../../../utils/electrodeVisualState";
import { NODE_INSIGHTS } from "../../../../utils/nodeInsights";
import { ELECTRODE_DISPLAY_ORDER } from "../../../../utils/electrodeDisplayOrder";
import type { NodePanelHitArea } from "./types";
import { drawIntensityOfFocusPill } from "./drawIntensityOfFocusPill";
import { drawUnmuteButton } from "./drawUnmuteButton";

/**
 * STATE B: ELECTRODE SELECTED
 * Spatially balanced pills surrounding the headset:
 * 1. TOP OF HEADSET (Y: 18): Intensity of Focus pill readout (toggles simulated recording)
 * 2. TOP OF HEADSET (Y: 76): Selected Node Telemetry pill [ REGION CORTEX | NODE (FULL NAME) | RAW: +X.XX µV ]
 * 3. FLANKING SIDES (Y: 370): Left [ ← PREV ] & Right [ NEXT → ] navigation pills
 * 4. BELOW HEADSET (Y: 570): Insight container [ MEASURES: COGNITIVE METRIC | description ]
 * 5. BELOW HEADSET (Y: 682, CONDITIONAL): Simulated Recording pill
 * 6. BELOW HEADSET: Action pills [ ✕ Deselect Node ] and [ Track Your Focus ✦ ]
 */
export function drawSelectedState(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  channel: ElectrodeName,
  frame: Frame,
  hoverId: string | null,
  hitAreas: NodePanelHitArea[],
  panelWidth: number,
  showSimulatedRecording: boolean,
  isMuted: boolean
): void {
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

  // 1. TOP OF HEADSET: Intensity of Focus Value Component (Y: 18)
  drawIntensityOfFocusPill(ctx, centerX, 18, frame, hoverId, hitAreas);

  // Unmute / Mute audio button (Y: 18)
  drawUnmuteButton(ctx, 816, 18, isMuted, hoverId, hitAreas);

  // -------------------------------------------------------------------------
  // 2. Selected Node Telemetry Header Pill (Y: 76)
  // Dynamically measured layout to guarantee zero overlap even with long names
  // -------------------------------------------------------------------------
  const headerW = 760;
  const headerH = 52;
  const headerX = centerX - headerW / 2;
  const headerY = 76;

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
  const regionStr = region.toUpperCase();
  ctx.fillText(regionStr, headerX + 38, headerY + headerH / 2);
  const regionW = ctx.measureText(regionStr).width;

  // Divider 1 (dynamically spaced after region)
  const div1X = headerX + 38 + regionW + 12;
  ctx.font = "13px monospace";
  ctx.fillStyle = "#475569";
  ctx.fillText("|", div1X, headerY + headerH / 2);

  // Node Name + Full Name
  const nodeX = div1X + 14;
  ctx.font = "900 18px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(channel, nodeX, headerY + headerH / 2);
  const channelWidth = ctx.measureText(channel).width;

  ctx.font = "500 13px sans-serif";
  ctx.fillStyle = "#94a3b8";
  const fullNameStr = meta?.fullName ? `(${meta.fullName})` : "";
  ctx.fillText(fullNameStr, nodeX + channelWidth + 8, headerY + headerH / 2);

  // Right-anchored Live Voltage and RAW readout
  const voltStr = `${rawValue >= 0 ? `+${rawValue.toFixed(2)}` : rawValue.toFixed(2)} µV`;
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#10b981";
  ctx.textAlign = "right";
  ctx.fillText(voltStr, headerX + headerW - 24, headerY + headerH / 2);
  const voltW = ctx.measureText(voltStr).width;

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  const rawX = headerX + headerW - 24 - voltW - 12;
  ctx.fillText("RAW", rawX, headerY + headerH / 2);
  const rawW = ctx.measureText("RAW").width;

  // Divider 2 (anchored cleanly before RAW)
  ctx.font = "13px monospace";
  ctx.fillStyle = "#475569";
  ctx.fillText("|", rawX - rawW - 12, headerY + headerH / 2);

  // -------------------------------------------------------------------------
  // 3. Left & Right Navigation Pill Buttons (Y: 370)
  // Perfectly framing the physical head on the sides without overlapping
  // -------------------------------------------------------------------------
  const sideY = 370;
  const sideW = 92;
  const sideH = 50;

  // Left Side Pill [ ← PREV ]
  const leftX = 24;
  const isPrevHovered = hoverId === "prev";

  ctx.fillStyle = isPrevHovered ? prevColor : "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = isPrevHovered ? "#ffffff" : prevColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(leftX, sideY - sideH / 2, sideW, sideH, sideH / 2);
  ctx.fill();
  ctx.stroke();

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
  const rightX = panelWidth - 24 - sideW;
  const isNextHovered = hoverId === "next";

  ctx.fillStyle = isNextHovered ? nextColor : "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = isNextHovered ? "#ffffff" : nextColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(rightX, sideY - sideH / 2, sideW, sideH, sideH / 2);
  ctx.fill();
  ctx.stroke();

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
  // 4. Lower Insight Pill / Rounded Rect Container (Y: 556)
  // Dynamic height based on measured text wrapping so lines never overflow
  // -------------------------------------------------------------------------
  const insightW = 760;
  const insightX = centerX - insightW / 2;
  const insightY = 556;

  // Pre-calculate line wrapping for insight description
  const words = insight?.description ? insight.description.split(" ") : [];
  const descLines: string[] = [];
  let curLine = "";
  ctx.font = "13.5px sans-serif";
  const maxDescWidth = insightW - 48;

  for (let n = 0; n < words.length; n++) {
    const testLine = curLine ? `${curLine} ${words[n]}` : words[n];
    if (ctx.measureText(testLine).width > maxDescWidth && curLine) {
      descLines.push(curLine);
      curLine = words[n];
    } else {
      curLine = testLine;
    }
  }
  if (curLine) descLines.push(curLine);

  // Dynamically size container height so 3-line descriptions never overflow or touch borders
  const insightH = descLines.length >= 3 ? 116 : 96;

  ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.75)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(insightX, insightY, insightW, insightH, 18);
  ctx.fill();
  ctx.stroke();

  if (insight) {
    // Header line inside insight pill
    ctx.textAlign = "left";
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("MEASURES", insightX + 24, insightY + 24);

    ctx.fillStyle = "#475569";
    ctx.fillText("|", insightX + 96, insightY + 24);

    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = accentColor;
    ctx.fillText(insight.metricName.toUpperCase(), insightX + 112, insightY + 24);

    // Insight description text lines inside pill with comfortable line-height
    ctx.font = "13.5px sans-serif";
    ctx.fillStyle = "#cbd5e1";
    const startLineY = insightY + 50;
    const lineSpacing = descLines.length >= 3 ? 20 : 22;
    descLines.forEach((l, idx) => {
      ctx.fillText(l, insightX + 24, startLineY + idx * lineSpacing);
    });
  }

  // -------------------------------------------------------------------------
  // 5. Conditional Simulated Recording Pill during Inspection Mode
  // Dynamically positioned below the insight container with guaranteed margin
  // -------------------------------------------------------------------------
  const insightBottom = insightY + insightH;
  const recH = 36;
  const recY = insightBottom + 12;

  if (showSimulatedRecording) {
    const trialNum = String((frame.trialIndex ?? 0) + 1).padStart(2, "0");
    const recW = 540;
    const recX = centerX - recW / 2;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(recX, recY, recW, recH, recH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(recX + 20, recY + recH / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();

    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.fillText("SIMULATED RECORDING", recX + 32, recY + recH / 2);

    ctx.fillStyle = "#475569";
    ctx.fillText("|", recX + 180, recY + recH / 2);

    ctx.font = "12px monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(`Participant #7 · video-${trialNum}.m4a`, recX + 194, recY + recH / 2);
  }

  // -------------------------------------------------------------------------
  // 6. Bottom Action Pills
  // Two discrete pill buttons: [ ✕ Deselect Node ] and [ Track Your Focus ✦ ]
  // Dynamically offset from previous element to prevent collision
  // -------------------------------------------------------------------------
  const actionY = showSimulatedRecording ? recY + recH + 12 : insightBottom + 16;
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

  // Track Your Focus Pill Button
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
  ctx.fillText("Track Your Focus  ✦", dirX + dirW / 2, actionY + actionH / 2);

  hitAreas.push({
    id: "direction",
    x: dirX,
    y: actionY,
    width: dirW,
    height: actionH,
  });
}
