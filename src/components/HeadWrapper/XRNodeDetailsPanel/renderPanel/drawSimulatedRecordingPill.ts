import type { Frame } from "../../../../utils/signalSource";
import type { NodePanelHitArea } from "./types";

/**
 * Draws the "Simulated Recording" pill component:
 * [ (dot) SIMULATED RECORDING | Participant #7 · video-01.m4a ]
 * Registers hit area "toggle-recording" so users can click/pinch to toggle back to Intensity of Focus.
 */
export function drawSimulatedRecordingPill(
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
