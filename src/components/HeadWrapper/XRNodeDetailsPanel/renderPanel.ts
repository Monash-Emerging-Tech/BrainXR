import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import { getElectrodeMetadata } from "../../../utils/signalSource";
import { REGION_COLOR } from "../../../utils/electrodeVisualState";
import { NODE_INSIGHTS } from "../../../utils/nodeInsights";
import { ELECTRODE_DISPLAY_ORDER } from "../../../utils/electrodeDisplayOrder";

export interface NodePanelHitArea {
  id: "prev" | "next" | "close" | "direction" | "toggle-recording" | "toggle-mute";
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PANEL_WIDTH = 1100;
export const PANEL_HEIGHT = 800;

/**
 * Draws the "Intensity of Focus" top pill component, identical to TopHudBar:
 * [ (pulsing indicator) INTENSITY OF FOCUS | XX% ]
 * Registers hit area "toggle-recording" so users can click/pinch to toggle the simulated recording component.
 */
function drawIntensityOfFocusPill(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  frame: Frame,
  hoverId: string | null,
  hitAreas: NodePanelHitArea[]
) {
  const isBaseline = frame.phase === "baseline";
  const focusVal = frame.focus;
  const focusPercent = focusVal == null ? null : Math.round(focusVal * 100);

  const pillW = 280;
  const pillH = 46;
  const pillX = centerX - pillW / 2;
  const isHovered = hoverId === "toggle-recording";

  // Background pill (brightens slightly on hover to signify interactability)
  ctx.fillStyle = isHovered
    ? "rgba(30, 41, 59, 0.96)"
    : "rgba(11, 15, 23, 0.92)";
  ctx.strokeStyle = isHovered
    ? "#38bdf8"
    : isBaseline
    ? "rgba(99, 102, 241, 0.55)"
    : "rgba(16, 185, 129, 0.55)";
  ctx.lineWidth = isHovered ? 2 : 1.5;
  ctx.beginPath();
  ctx.roundRect(pillX, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.stroke();

  // Pulsing dot indicator
  const dotX = pillX + 22;
  const dotY = y + pillH / 2;
  const dotColor = isBaseline ? "#818cf8" : "#34d399";
  
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();

  // Label text
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "900 11.5px monospace";
  ctx.fillStyle = isHovered ? "#38bdf8" : "#ffffff";
  ctx.fillText("INTENSITY OF FOCUS", dotX + 14, dotY);

  // Readout badge on the right
  const badgeW = 54;
  const badgeH = 30;
  const badgeX = pillX + pillW - badgeW - 8;
  const badgeY = y + (pillH - badgeH) / 2;

  ctx.fillStyle = isBaseline ? "rgba(49, 46, 129, 0.7)" : "rgba(6, 78, 59, 0.7)";
  ctx.strokeStyle = isBaseline ? "rgba(129, 140, 248, 0.35)" : "rgba(52, 211, 153, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "900 13px monospace";
  ctx.fillStyle = isBaseline ? "#c7d2fe" : "#a7f3d0";
  ctx.fillText(focusPercent == null ? "--" : `${focusPercent}%`, badgeX + badgeW / 2, y + pillH / 2);

  // Push hit area for interactive toggle
  hitAreas.push({
    id: "toggle-recording",
    x: pillX,
    y,
    width: pillW,
    height: pillH,
  });
}

/**
 * Draws the "Simulated Recording" pill component:
 * [ (dot) SIMULATED RECORDING | Participant #7 · video-01.m4a ]
 * Registers hit area "toggle-recording" so users can click/pinch to toggle back to Intensity of Focus.
 */
function drawSimulatedRecordingPill(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  frame: Frame,
  hoverId: string | null,
  hitAreas: NodePanelHitArea[]
) {
  const trialNum = String((frame.trialIndex ?? 0) + 1).padStart(2, "0");
  const pillW = 500;
  const pillH = 46;
  const pillX = centerX - pillW / 2;
  const isHovered = hoverId === "toggle-recording";

  ctx.fillStyle = isHovered ? "rgba(30, 41, 59, 0.96)" : "rgba(11, 15, 23, 0.92)";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "rgba(51, 65, 85, 0.75)";
  ctx.lineWidth = isHovered ? 2 : 1.5;
  ctx.beginPath();
  ctx.roundRect(pillX, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.stroke();

  // Glowing dot
  ctx.beginPath();
  ctx.arc(pillX + 22, y + pillH / 2, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = "#10b981";
  ctx.fill();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = isHovered ? "#38bdf8" : "#94a3b8";
  ctx.fillText("SIMULATED RECORDING", pillX + 36, y + pillH / 2);

  ctx.fillStyle = "#475569";
  ctx.fillText("|", pillX + 192, y + pillH / 2);

  ctx.font = "13px monospace";
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(`Participant #7 · video-${trialNum}.m4a`, pillX + 208, y + pillH / 2);

  hitAreas.push({
    id: "toggle-recording",
    x: pillX,
    y,
    width: pillW,
    height: pillH,
  });
}

/**
 * Draws the separate "Unmute / Mute" audio toggle pill button in XR:
 * [ (speaker icon) UNMUTE ] (when muted)
 * [ (speaker sound waves) MUTE ] (when unmuted)
 * Registers hit area "toggle-mute" so users can click/pinch to toggle DEAP trial playback audio.
 */
function drawUnmuteButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isMuted: boolean,
  hoverId: string | null,
  hitAreas: NodePanelHitArea[]
): void {
  const pillW = 124;
  const pillH = 46;
  const isHovered = hoverId === "toggle-mute";

  if (isMuted) {
    ctx.fillStyle = isHovered ? "rgba(30, 41, 59, 0.96)" : "rgba(11, 15, 23, 0.92)";
    ctx.strokeStyle = isHovered ? "#38bdf8" : "rgba(51, 65, 85, 0.75)";
  } else {
    ctx.fillStyle = isHovered ? "#4338ca" : "rgba(49, 46, 129, 0.85)";
    ctx.strokeStyle = isHovered ? "#a5b4fc" : "rgba(129, 140, 248, 0.75)";
  }

  ctx.lineWidth = isHovered ? 2 : 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.stroke();

  const iconColor = isMuted
    ? isHovered ? "#ffffff" : "#94a3b8"
    : isHovered ? "#ffffff" : "#c7d2fe";

  const textColor = iconColor;

  // Draw Speaker Cone
  const iconCenterX = x + 25;
  const iconCenterY = y + pillH / 2;

  ctx.fillStyle = iconColor;
  ctx.beginPath();
  ctx.moveTo(iconCenterX - 7, iconCenterY - 3.5);
  ctx.lineTo(iconCenterX - 3, iconCenterY - 3.5);
  ctx.lineTo(iconCenterX + 2, iconCenterY - 7.5);
  ctx.lineTo(iconCenterX + 2, iconCenterY + 7.5);
  ctx.lineTo(iconCenterX - 3, iconCenterY + 3.5);
  ctx.lineTo(iconCenterX - 7, iconCenterY + 3.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = iconColor;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";

  if (isMuted) {
    // Diagonal "X" muted mark
    ctx.beginPath();
    ctx.moveTo(iconCenterX + 5, iconCenterY - 4);
    ctx.lineTo(iconCenterX + 11, iconCenterY + 4);
    ctx.moveTo(iconCenterX + 11, iconCenterY - 4);
    ctx.lineTo(iconCenterX + 5, iconCenterY + 4);
    ctx.stroke();
  } else {
    // Sound wave arcs
    ctx.beginPath();
    ctx.arc(iconCenterX + 1, iconCenterY, 5.5, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(iconCenterX + 1, iconCenterY, 9.5, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }

  // Label text
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = textColor;
  ctx.fillText(isMuted ? "UNMUTE" : "MUTE", x + 44, y + pillH / 2);

  hitAreas.push({
    id: "toggle-mute",
    x,
    y,
    width: pillW,
    height: pillH,
  });
}

export function renderNodeDetailsCanvas(
  ctx: CanvasRenderingContext2D,
  channel: ElectrodeName | null,
  frame: Frame,
  hoverId: string | null,
  hitAreas: NodePanelHitArea[],
  showSimulatedRecording = false,
  isMuted = true
): void {
  hitAreas.length = 0;
  // Clear full canvas so there is NO big bounding card - only floating pills!
  ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);

  const centerX = PANEL_WIDTH / 2;

  // =========================================================================
  // STATE A: IDLE (NO ELECTRODE SELECTED) - HOME SCREEN
  // Top pill toggles in-place between Intensity of Focus and Simulated Recording!
  // When toggled on, Simulated Recording REPLACES Intensity of Focus at top.
  // 1. TOP OF HEADSET (Y: 28): [ INTENSITY OF FOCUS | XX% ] <--> [ SIMULATED RECORDING | ... ]
  //    plus separate audio toggle [ UNMUTE ]
  // 2. BELOW HEADSET (Y: 580): XR Interaction Prompt [ PINCH NODE TO INSPECT | HOLD GRIP TO MOVE ]
  // 3. BELOW HEADSET (Y: 654): Primary Action CTA Pill [ Track Your Focus ✦ ]
  // =========================================================================
  if (!channel) {
    ctx.textBaseline = "middle";

    // 1. TOP OF HEADSET: In-place toggle component (Y: 28)
    if (showSimulatedRecording) {
      drawSimulatedRecordingPill(ctx, centerX, 28, frame, hoverId, hitAreas);
    } else {
      drawIntensityOfFocusPill(ctx, centerX, 28, frame, hoverId, hitAreas);
    }

    // Unmute / Mute audio button (Y: 28)
    drawUnmuteButton(ctx, 816, 28, isMuted, hoverId, hitAreas);

    // 2. BELOW HEADSET: XR Interaction Prompt Pill (Y: 580)
    const promptW = 560;
    const promptH = 48;
    const promptX = centerX - promptW / 2;
    const promptY = 580;

    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "rgba(51, 65, 85, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(promptX, promptY, promptW, promptH, promptH / 2);
    ctx.fill();
    ctx.stroke();

    // Pinch trigger segment
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "left";
    ctx.fillText("PINCH", promptX + 24, promptY + promptH / 2);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("Node to inspect", promptX + 74, promptY + promptH / 2);

    // Divider
    ctx.fillStyle = "#475569";
    ctx.fillText("|", promptX + 226, promptY + promptH / 2);

    // Grip reposition segment
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#a855f7";
    ctx.fillText("HOLD GRIP", promptX + 248, promptY + promptH / 2);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("To reposition", promptX + 338, promptY + promptH / 2);

    // 3. BELOW HEADSET: Primary Action CTA Pill: [ Track Your Focus ✦ ] (Y: 654)
    const btnW = 320;
    const btnH = 52;
    const btnX = centerX - btnW / 2;
    const btnY = 654;
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
    ctx.fillText("Track Your Focus  ✦", btnX + btnW / 2, btnY + btnH / 2);

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
  // 1. TOP OF HEADSET (Y: 18): Intensity of Focus pill readout (toggles simulated recording)
  // 2. TOP OF HEADSET (Y: 76): Selected Node Telemetry pill [ REGION CORTEX | NODE (FULL NAME) | RAW: +X.XX µV ]
  // 3. FLANKING SIDES (Y: 370): Left [ ← PREV ] & Right [ NEXT → ] navigation pills
  // 4. BELOW HEADSET (Y: 570): Insight container [ MEASURES: COGNITIVE METRIC | description ]
  // 5. BELOW HEADSET (Y: 682, CONDITIONAL): Simulated Recording pill
  // 6. BELOW HEADSET: Action pills [ ✕ Deselect Node ] and [ Track Your Focus ✦ ]
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
  const rightX = PANEL_WIDTH - 24 - sideW;
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
