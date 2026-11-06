export function drawPauseRuleBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  name: string,
  action: string,
  color: string,
  isPress: boolean
): void {
  const isEmerald = color === "#34d399";
  if (isPress) {
    ctx.fillStyle = isEmerald ? "rgba(52, 211, 153, 0.15)" : "rgba(244, 63, 94, 0.15)";
    ctx.strokeStyle = isEmerald ? "rgba(52, 211, 153, 0.4)" : "rgba(244, 63, 94, 0.4)";
  } else {
    ctx.fillStyle = isEmerald ? "rgba(52, 211, 153, 0.08)" : "rgba(244, 63, 94, 0.08)";
    ctx.strokeStyle = isEmerald ? "rgba(52, 211, 153, 0.3)" : "rgba(244, 63, 94, 0.3)";
  }
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();

  // Target indicator icon
  ctx.fillStyle = color;
  ctx.beginPath();
  if (name.includes("SPHERE")) {
    ctx.arc(x + 24, y + h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.roundRect(x + 17, y + h / 2 - 7, 14, 14, 3);
    ctx.fill();
  }

  // Target label
  ctx.font = "bold 10px monospace";
  ctx.letterSpacing = "1px";
  ctx.fillStyle = isEmerald ? "#6ee7b7" : "#fda4af";
  ctx.textAlign = "left";
  ctx.fillText(name, x + 40, y + 19);

  // Action text
  ctx.font = "bold 15px 'OffBit', monospace";
  ctx.letterSpacing = "1px";
  ctx.fillStyle = isPress ? "#ffffff" : isEmerald ? "#6ee7b7" : "#fda4af";
  ctx.fillText(action, x + 40, y + 37);
  ctx.letterSpacing = "0px";
}
