import type { NodePanelHitArea } from "./types";

/**
 * Draws the separate "Unmute / Mute" audio toggle pill button in XR:
 * [ (speaker icon) UNMUTE ] (when muted)
 * [ (speaker sound waves) MUTE ] (when unmuted)
 * Registers hit area "toggle-mute" so users can click/pinch to toggle DEAP trial playback audio.
 */
export function drawUnmuteButton(
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
