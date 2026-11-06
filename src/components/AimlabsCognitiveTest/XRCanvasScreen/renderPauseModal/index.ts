import type { LiveFocusMetrics } from "../../types";
import type { CanvasScreenRenderState, InteractiveHitArea } from "../types";
import { drawPauseRuleBadge } from "./drawPauseRuleBadge";
import { drawPerformanceGraph } from "./drawPerformanceGraph";
import { drawSoundToggle } from "./drawSoundToggle";
import { drawActionButtons } from "./drawActionButtons";

export function renderPauseModal(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CanvasScreenRenderState,
  hitAreas: InteractiveHitArea[]
): void {
  const cx = width / 2;
  const isRound1 = state.round === 1;
  const roundTitle = isRound1 ? "ROUND 1 · CPT" : "ROUND 2 · SART";
  const roundFullName = isRound1
    ? "Continuous Performance Test"
    : "Sustained Attention to Response Task";

  const m: LiveFocusMetrics = state.liveFocusMetrics || {
    reactionTimes: [],
    meanRT: 0,
    medianRT: 0,
    sdRT: 0,
    cv: 0,
    focusLevel: "Calibrating",
    focusDescription: "Collecting baseline response times",
    boxesHit: 0,
    boxesMissed: 0,
    spheresHit: 0,
    spheresMissed: 0,
    accuracy: Math.round(state.accuracy),
    precision: 100,
    telemetryTable: [],
  };

  // 1. Modal Header Badge
  const badgeText = "GAME PAUSED";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  const badgeW = 160;
  const badgeH = 34;
  const badgeY = 65;
  ctx.fillStyle = "rgba(243, 218, 102, 0.2)";
  ctx.strokeStyle = "rgba(243, 218, 102, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#F3DA66";
  ctx.fillText(badgeText, cx, badgeY + 22);

  // 2. Large Modal Title
  ctx.font = "bold 38px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("PAUSE MENU", cx, 134);

  // 3. Subtitle
  ctx.font = "16px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`${roundTitle} · ${roundFullName}`, cx, 164);

  // 4. Center Top Rule Buttons (communicating stimulus rules identical to Top HUD)
  const ruleW = 620;
  const ruleH = 58;
  const ruleX = cx - ruleW / 2;
  const ruleY = 194;

  ctx.fillStyle = "rgba(13, 13, 16, 0.9)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(ruleX, ruleY, ruleW, ruleH, 12);
  ctx.fill();
  ctx.stroke();

  if (isRound1) {
    // Round 1 (CPT): Green Sphere = Press, Red Box = Avoid
    drawPauseRuleBadge(ctx, ruleX + 8, ruleY + 5, 296, 48, "GREEN SPHERE", "PRESS", "#34d399", true);
    drawPauseRuleBadge(ctx, ruleX + 316, ruleY + 5, 296, 48, "RED BOX", "DO NOT PRESS", "#f43f5e", false);
  } else {
    // Round 2 (SART): Red Box = Press, Green Sphere = Avoid
    drawPauseRuleBadge(ctx, ruleX + 8, ruleY + 5, 296, 48, "RED BOX", "PRESS", "#f43f5e", true);
    drawPauseRuleBadge(ctx, ruleX + 316, ruleY + 5, 296, 48, "GREEN SPHERE", "DO NOT PRESS", "#34d399", false);
  }

  // 5. Unified Performance Graph
  drawPerformanceGraph(ctx, cx, m);

  // 6. Settings Section: Sound Toggle
  drawSoundToggle(ctx, cx, state.hoverId, state.soundEnabled !== false, hitAreas);

  // 7. Action Buttons (Back, Resume, Skip)
  drawActionButtons(ctx, cx, state.hoverId, hitAreas);

  // Bottom Notice
  ctx.font = "13px monospace";
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.fillText("Stimulus response timer is frozen while paused. Click Resume, press [B] / [Y], or press Esc to resume.", cx, 715);
}
