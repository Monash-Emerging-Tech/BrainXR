// Renders edge-concentrated 3D rendered gradient spheres & cubes matching desktop ModalDecorativeField
export function renderDecorative(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  ctx.save();

  // 1. Top-Left: Soft Slate-Cyan Gradient Sphere
  const s1x = 80;
  const s1y = 80 + Math.sin(time * 0.8) * 12;
  const g1 = ctx.createRadialGradient(s1x - 30, s1y - 30, 10, s1x, s1y, 110);
  g1.addColorStop(0, "#38bdf8");
  g1.addColorStop(0.4, "#0369a1");
  g1.addColorStop(0.8, "#0f172a");
  g1.addColorStop(1, "rgba(2, 6, 23, 0)");
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.arc(s1x, s1y, 110, 0, Math.PI * 2);
  ctx.fill();

  // 2. Top-Left: Muted Rose Box
  ctx.save();
  ctx.translate(140, 240 + Math.cos(time * 1.1) * 8);
  ctx.rotate(0.35);
  const gb1 = ctx.createLinearGradient(-35, -35, 35, 35);
  gb1.addColorStop(0, "#be123c");
  gb1.addColorStop(0.55, "#4c0519");
  gb1.addColorStop(1, "#0f172a");
  ctx.fillStyle = gb1;
  ctx.beginPath();
  ctx.roundRect(-35, -35, 70, 70, 12);
  ctx.fill();
  ctx.restore();

  // 3. Bottom-Left: Rose-Burgundy Cube
  ctx.save();
  ctx.translate(120, height - 160 + Math.sin(time * 0.7) * 10);
  ctx.rotate(0.5);
  const gb2 = ctx.createLinearGradient(-55, -55, 55, 55);
  gb2.addColorStop(0, "#9f1239");
  gb2.addColorStop(0.65, "#4c0519");
  gb2.addColorStop(1, "#020617");
  ctx.fillStyle = gb2;
  ctx.beginPath();
  ctx.roundRect(-55, -55, 110, 110, 16);
  ctx.fill();
  ctx.restore();

  // 4. Top-Right: Crimson Cube
  ctx.save();
  ctx.translate(width - 130, 110 + Math.cos(time * 0.9) * 10);
  ctx.rotate(-0.4);
  const gb3 = ctx.createLinearGradient(-50, -50, 50, 50);
  gb3.addColorStop(0, "#be123c");
  gb3.addColorStop(0.5, "#881337");
  gb3.addColorStop(1, "#0f172a");
  ctx.fillStyle = gb3;
  ctx.beginPath();
  ctx.roundRect(-50, -50, 100, 100, 14);
  ctx.fill();
  ctx.restore();

  // 5. Bottom-Right: Deep Soft Cyan Sphere
  const s2x = width - 100;
  const s2y = height - 100 + Math.sin(time * 0.75) * 12;
  const g2 = ctx.createRadialGradient(s2x - 35, s2y - 35, 12, s2x, s2y, 130);
  g2.addColorStop(0, "#7dd3fc");
  g2.addColorStop(0.45, "#0369a1");
  g2.addColorStop(0.75, "#075985");
  g2.addColorStop(1, "rgba(2, 6, 23, 0)");
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(s2x, s2y, 130, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
