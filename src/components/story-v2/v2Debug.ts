/**
 * Dev-only telemetry bus for the v2 debug HUD.
 *
 * The scene timeline runs entirely on refs inside one rAF, so there is no
 * React state the HUD could subscribe to. Instead the scene writes its live
 * values into this single mutable record each frame and the HUD reads it
 * from its own rAF. One object, no allocation, no renders -- so leaving the
 * writes in costs nothing when the HUD is off.
 */

export interface V2DebugFrame {
  /** Name of the sub-stage scene 1 is currently in. */
  stage: string;
  /** ms since the current scene started. */
  sceneMs: number;
  reach: number;
  density: number;
  line: number;
  swell: number;
  focus: number;
  /** Set by SmokeShader once its material has compiled and drawn a frame. */
  smokeFrames: number;
  /** Last WebGL / shader error seen, if any. */
  smokeError: string;
}

export const v2Debug: V2DebugFrame = {
  stage: "-",
  sceneMs: 0,
  reach: 0,
  density: 0,
  line: 0,
  swell: 0,
  focus: 0,
  smokeFrames: 0,
  smokeError: "",
};

export function resetV2Debug(): void {
  v2Debug.stage = "-";
  v2Debug.sceneMs = 0;
  v2Debug.reach = 0;
  v2Debug.density = 0;
  v2Debug.line = 0;
  v2Debug.swell = 0;
  v2Debug.focus = 0;
  v2Debug.smokeFrames = 0;
  v2Debug.smokeError = "";
}
