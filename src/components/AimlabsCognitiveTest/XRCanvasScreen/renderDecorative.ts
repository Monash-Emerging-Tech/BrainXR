/**
 * Renders edge-concentrated cyber portal tiles and wireframe accents in WebXR,
 * perfectly matching the desktop ModalDecorativeField and the 3D portal room aesthetic.
 */
export function renderDecorative(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  ctx.save();

  // Helper to draw a glowing wireframe portal tile
  const drawPortalTile = (
    cx: number,
    cy: number,
    w: number,
    h: number,
    angle: number,
    borderColor: string,
    fillColor: string,
    shadowColor: string,
    label?: string
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Glowing tile face
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 16;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    ctx.fill();

    // Crisp wireframe border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    ctx.stroke();

    // Corner hairline brackets
    const bLen = Math.min(w, h) * 0.22;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Top-left bracket
    ctx.moveTo(-w / 2 + bLen, -h / 2);
    ctx.lineTo(-w / 2, -h / 2);
    ctx.lineTo(-w / 2, -h / 2 + bLen);
    // Bottom-right bracket
    ctx.moveTo(w / 2 - bLen, h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(w / 2, h / 2 - bLen);
    ctx.stroke();

    if (label) {
      ctx.fillStyle = borderColor;
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(label, w / 2 - 4, -h / 2 + 12);
    }

    ctx.restore();
  };

  // 1. Top-Left: Large White Portal Tile
  const t1x = 90;
  const t1y = 95 + Math.sin(time * 0.8) * 8;
  drawPortalTile(
    t1x,
    t1y,
    130,
    85,
    -0.18,
    "rgba(255, 255, 255, 0.35)",
    "rgba(255, 255, 255, 0.05)",
    "rgba(255, 255, 255, 0.2)"
  );

  // 2. Top-Left Inner: Emerald Accent Tile (#34d399)
  const t2x = 165;
  const t2y = 210 + Math.cos(time * 1.0) * 7;
  drawPortalTile(
    t2x,
    t2y,
    75,
    55,
    0.22,
    "rgba(52, 211, 153, 0.65)",
    "rgba(52, 211, 153, 0.12)",
    "#34d399",
    "EMR"
  );

  // 3. Bottom-Left: Purple Accent Tile (#c084fc)
  const t3x = 125;
  const t3y = height - 140 + Math.sin(time * 0.7) * 9;
  drawPortalTile(
    t3x,
    t3y,
    110,
    75,
    0.28,
    "rgba(192, 132, 252, 0.65)",
    "rgba(192, 132, 252, 0.12)",
    "#c084fc",
    "PRP"
  );

  // 4. Top-Right: Cyan Accent Tile (#22d3ee)
  const t4x = width - 130;
  const t4y = 100 + Math.cos(time * 0.9) * 8;
  drawPortalTile(
    t4x,
    t4y,
    120,
    80,
    0.16,
    "rgba(34, 211, 238, 0.65)",
    "rgba(34, 211, 238, 0.12)",
    "#22d3ee",
    "CYN"
  );

  // 5. Bottom-Right: Red Accent Tile (#f43f5e)
  const t5x = width - 110;
  const t5y = height - 120 + Math.sin(time * 0.75) * 9;
  drawPortalTile(
    t5x,
    t5y,
    130,
    85,
    -0.22,
    "rgba(244, 63, 94, 0.65)",
    "rgba(244, 63, 94, 0.12)",
    "#f43f5e",
    "RED"
  );

  // 6. Corner Technical Crosshairs & Reticles
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;
  const drawCrosshair = (x: number, y: number) => {
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y + 6);
    ctx.stroke();
  };

  drawCrosshair(55, 45);
  drawCrosshair(width - 55, 45);
  drawCrosshair(55, height - 45);
  drawCrosshair(width - 55, height - 45);

  ctx.restore();
}
