import type { Frame } from "../../../../utils/signalSource";
import type { NodePanelHitArea } from "./types";

/**
 * Draws the "Intensity of Focus" top pill component, identical to TopHudBar:
 * [ (pulsing indicator) INTENSITY OF FOCUS | XX% ]
 * Registers hit area "toggle-recording" so users can click/pinch to toggle the simulated recording component.
 */
export function drawIntensityOfFocusPill(
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
