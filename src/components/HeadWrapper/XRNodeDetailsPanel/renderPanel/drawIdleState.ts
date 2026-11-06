import type { Frame } from "../../../../utils/signalSource";
import type { NodePanelHitArea } from "./types";
import { drawIntensityOfFocusPill } from "./drawIntensityOfFocusPill";
import { drawSimulatedRecordingPill } from "./drawSimulatedRecordingPill";
import { drawUnmuteButton } from "./drawUnmuteButton";

/**
 * STATE A: IDLE (NO ELECTRODE SELECTED) - HOME SCREEN
 * Top pill toggles in-place between Intensity of Focus and Simulated Recording!
 * When toggled on, Simulated Recording REPLACES Intensity of Focus at top.
 * 1. TOP OF HEADSET (Y: 28): [ INTENSITY OF FOCUS | XX% ] <--> [ SIMULATED RECORDING | ... ]
 *    plus separate audio toggle [ UNMUTE ]
 * 2. BELOW HEADSET (Y: 580): XR Interaction Prompt [ PINCH NODE TO INSPECT | HOLD GRIP TO MOVE ]
 * 3. BELOW HEADSET (Y: 654): Primary Action CTA Pill [ Track Your Focus ✦ ]
 */
export function drawIdleState(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  frame: Frame,
  hoverId: string | null,
  hitAreas: NodePanelHitArea[],
  showSimulatedRecording: boolean,
  isMuted: boolean
): void {
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
}
