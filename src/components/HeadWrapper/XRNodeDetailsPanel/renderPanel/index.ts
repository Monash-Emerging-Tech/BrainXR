import type { ElectrodeName, Frame } from "../../../../utils/signalSource";
import type { NodePanelHitArea } from "./types";
import { PANEL_WIDTH, PANEL_HEIGHT } from "./types";
import { drawIdleState } from "./drawIdleState";
import { drawSelectedState } from "./drawSelectedState";

export type { NodePanelHitArea } from "./types";
export { PANEL_WIDTH, PANEL_HEIGHT } from "./types";

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

  if (!channel) {
    drawIdleState(ctx, centerX, frame, hoverId, hitAreas, showSimulatedRecording, isMuted);
    return;
  }

  drawSelectedState(ctx, centerX, channel, frame, hoverId, hitAreas, PANEL_WIDTH, showSimulatedRecording, isMuted);
}
