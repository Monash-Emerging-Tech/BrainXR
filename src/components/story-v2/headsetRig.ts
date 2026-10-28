import * as THREE from "three";
import type { Frame } from "../../utils/signalSource";

/**
 * The one rig that carries the brain AND the headset in Act 3, and the
 * idle screen's placement maths, mirrored so the story can land on exactly
 * the pose the idle screen will draw.
 *
 * The rig lives in the HEADSET's local space (+Y up, +Z front, origin at
 * the base). The brain is a child of it, placed by STORY_V2.act3.brainFit.
 */

/** A rig transform in world space. */
export interface RigPose {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
}

export function makeRigPose(): RigPose {
  return { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: 1 };
}

/** The idle Scene's camera (Scene.tsx). The story matches it for the final pose. */
export const IDLE_CAMERA = { z: 7.5, fov: 45 } as const;

/** World height visible at the origin for a camera at `z` with vertical `fov`. */
export function viewportHeightAt(z: number, fov: number): number {
  return 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * z;
}

/**
 * Static idle frame for the story's headset: no data, so every electrode
 * shows its idle look -- the same one the idle screen starts with.
 */
export const IDLE_FRAME: Frame = { phase: "idle", channels: {} };

const tmpEuler = new THREE.Euler();

/**
 * The idle showcase pose at time `t` (seconds on the idle Scene's clock).
 *
 * A MIRROR of the idle branch of HeadWrapper/useHeadPlacement.ts, which is
 * not ours to import from or change. If that maths changes, this must too,
 * or the handoff will show a jump.
 */
export function idlePose(t: number, out: RigPose): RigPose {
  const vh = viewportHeightAt(IDLE_CAMERA.z, IDLE_CAMERA.fov);
  const targetScale = vh / 66;
  out.scale = targetScale * 1.1;
  out.position.set(0, -11 * targetScale - Math.cos(t * 1.2) * 0.2, 0);
  tmpEuler.set(Math.sin(t * 0.4) * 0.05 + Math.PI / 32, t * 0.15, 0);
  out.quaternion.setFromEuler(tmpEuler);
  return out;
}

/**
 * The fit-check pose: idle size and height, but upright and without the
 * bob, looking straight at the front or the left side (+X, where T3 is).
 */
export function fitPreviewPose(view: "front" | "side", out: RigPose): RigPose {
  const vh = viewportHeightAt(IDLE_CAMERA.z, IDLE_CAMERA.fov);
  const targetScale = vh / 66;
  out.scale = targetScale * 1.1;
  out.position.set(0, -11 * targetScale, 0);
  tmpEuler.set(0, view === "front" ? 0 : -Math.PI / 2, 0);
  out.quaternion.setFromEuler(tmpEuler);
  return out;
}
