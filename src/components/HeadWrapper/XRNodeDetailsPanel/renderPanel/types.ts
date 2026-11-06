export interface NodePanelHitArea {
  id: "prev" | "next" | "close" | "direction" | "toggle-recording" | "toggle-mute";
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PANEL_WIDTH = 1100;
export const PANEL_HEIGHT = 800;
