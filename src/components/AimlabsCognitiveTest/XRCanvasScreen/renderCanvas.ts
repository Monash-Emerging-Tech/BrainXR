import type { CanvasScreenRenderState, InteractiveHitArea } from "./types";
import { renderDecorative } from "./renderDecorative";
import { renderReadyModal } from "./renderReadyModal";
import { renderIntermissionModal } from "./renderIntermissionModal";
import { renderFinishedModal } from "./renderFinishedModal";
import { renderHUD } from "./renderHUD";

export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 900;

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  state: CanvasScreenRenderState,
  time: number
): InteractiveHitArea[] {
  const hitAreas: InteractiveHitArea[] = [];

  // Clear Canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const isModal =
    state.status === "ready" ||
    state.status === "intermission" ||
    state.status === "finished";

  if (isModal) {
    // Background Dark Translucent Glass Card
    ctx.fillStyle = "rgba(2, 6, 23, 0.94)";
    ctx.beginPath();
    ctx.roundRect(40, 30, CANVAS_WIDTH - 80, CANVAS_HEIGHT - 60, 28);
    ctx.fill();

    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Floating Edge Spheres & Cubes
    renderDecorative(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, time);
  }

  if (state.status === "ready") {
    renderReadyModal(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, state, hitAreas);
  } else if (state.status === "countdown") {
    renderCountdown(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, state.countdown);
  } else if (state.status === "intermission") {
    renderIntermissionModal(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, state, hitAreas);
  } else if (state.status === "finished") {
    renderFinishedModal(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, state, hitAreas);
  } else if (state.status === "round1" || state.status === "round2") {
    renderHUD(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, state, hitAreas);
  }

  return hitAreas;
}

function renderCountdown(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number
) {
  const cx = width / 2;
  const cy = height / 2;

  ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
  ctx.beginPath();
  ctx.roundRect(cx - 240, cy - 160, 480, 320, 24);
  ctx.fill();

  ctx.font = "bold 130px 'OffBit', monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(count > 0 ? count.toString() : "GO", cx, cy + 40);

  ctx.font = "bold 20px monospace";
  ctx.letterSpacing = "4px";
  ctx.fillStyle = "#22d3ee";
  ctx.fillText("FIXATE CENTER CROSS", cx, cy + 105);
}
