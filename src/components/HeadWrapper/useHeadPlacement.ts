import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import {
  getElectrodeFocusQuaternion,
  DEFAULT_HEADSET_QUATERNION,
} from "../eegHead/electrodeNodes";
import type { HeadsetPresentationStage } from "../../utils/headsetPresentation";

interface Params {
  groupRef: React.RefObject<THREE.Group | null>;
  frameRef: React.RefObject<Frame>;
  isDraggingRef: React.RefObject<boolean>;
  xrPositionRef: React.RefObject<THREE.Vector3>;
  xrRotationRef: React.RefObject<THREE.Quaternion>;
  selectedChannel?: ElectrodeName | null;
  highlightPrefrontal?: boolean;
  presentationStage?: HeadsetPresentationStage;
}

const tempVec = new THREE.Vector3();
const tempCamPos = new THREE.Vector3();
const tempWorldUp = new THREE.Vector3(0, 1, 0);
const tempFocusQuat = new THREE.Quaternion();
const tempTargetPosition = new THREE.Vector3();
const tempTargetScale = new THREE.Vector3();

// Per-frame placement of the headset group: a fixed physical-scale pose in
// front of the user in WebXR (draggable via useXRDragInteraction), or an
// auto-scaled showcase/idle layout on the 2D desktop viewport.
// When a channel is selected, smoothly auto-rotates the headset so the electrode
// ring faces the camera orthogonally.
export function useHeadPlacement({
  groupRef,
  frameRef,
  isDraggingRef,
  xrPositionRef,
  xrRotationRef,
  selectedChannel,
  highlightPrefrontal = false,
  presentationStage = "interactive",
}: Params): void {
  const wasPresentingRef = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const isPresenting = state.gl.xr.isPresenting;
    const isDemoPhase = frameRef.current.phase === "baseline" || frameRef.current.phase === "stimulus";
    const group = groupRef.current;
    if (!group) return;

    const slerpFactor = 1 - Math.exp(-5 * Math.min(delta, 0.1));
    const effectiveFocusChannel =
      selectedChannel ??
      (highlightPrefrontal || presentationStage === "prefrontal" ? "FpZ" : null);

    if (isPresenting) {
      // --- WebXR VR/AR Presentation Layout ---
      // In XR, calculate line of sight from headset to user's VR camera
      state.camera.getWorldPosition(tempCamPos);
      tempVec.subVectors(tempCamPos, xrPositionRef.current).normalize();

      const targetQuat = effectiveFocusChannel
        ? getElectrodeFocusQuaternion(effectiveFocusChannel, tempVec, tempWorldUp, tempFocusQuat)
        : DEFAULT_HEADSET_QUATERNION;

      if (!wasPresentingRef.current) {
        xrPositionRef.current.set(0, 1.3, -1.1);
        xrRotationRef.current.copy(targetQuat);
        wasPresentingRef.current = true;
      }

      if (!isDraggingRef.current) {
        xrRotationRef.current.slerp(targetQuat, slerpFactor);
        group.position.copy(xrPositionRef.current);
        group.quaternion.copy(xrRotationRef.current);
      }

      // Scale to a realistic physical head size (approx 22cm diameter)
      const xrScale = presentationStage === "hidden" ? 0.0001 : 0.012;
      tempTargetScale.setScalar(xrScale);
      group.scale.lerp(tempTargetScale, slerpFactor);
    } else {
      // --- Standard 2D Desktop Layout ---
      wasPresentingRef.current = false;

      // Dynamically scale model to occupy exactly 1/3 of the viewport height.
      // Model height is approx 22 units in Blender local space.
      const targetScale = state.viewport.height / 66;

      if (presentationStage === "hidden") {
        tempTargetPosition.set(0, -11 * targetScale, 0);
        tempTargetScale.setScalar(0.0001);
        group.position.lerp(tempTargetPosition, slerpFactor);
        group.scale.lerp(tempTargetScale, slerpFactor);
        group.quaternion.slerp(DEFAULT_HEADSET_QUATERNION, slerpFactor);
      } else if (effectiveFocusChannel) {
        // Approach 1: Headset stays vertically centered at its fixed anchor point (-11 * scale) at all times.
        // Selecting a node smoothly rotates the headset to face the camera directly, with +30% focus scale boost.
        const baseFocusScale = targetScale * 1.3;
        const stageScale = presentationStage === "electrodes" ? baseFocusScale * 1.08 : baseFocusScale;
        tempTargetScale.setScalar(stageScale);
        group.scale.lerp(tempTargetScale, slerpFactor);

        // Vector from head position to 2D desktop camera
        state.camera.getWorldPosition(tempCamPos);
        tempVec.subVectors(tempCamPos, group.position).normalize();

        const targetQuat = getElectrodeFocusQuaternion(
          effectiveFocusChannel,
          tempVec,
          state.camera.up,
          tempFocusQuat
        );
        group.quaternion.slerp(targetQuat, slerpFactor);

        // Keep the headset centered at the constant vertical midpoint, tracking group.scale.y continuously for smooth zooming
        tempTargetPosition.set(0, -11 * group.scale.y, 0);
        group.position.lerp(tempTargetPosition, slerpFactor);
      } else if (presentationStage === "showcase" || (presentationStage === "interactive" && (frameRef.current.phase === "idle" || isDemoPhase))) {
        tempTargetScale.setScalar(targetScale);
        group.scale.lerp(tempTargetScale, slerpFactor);

        if (frameRef.current.phase === "idle" || presentationStage === "showcase") {
          // Continuous showcase spin in idle mode
          const dt = Math.min(delta, 0.1);
          group.rotateOnWorldAxis(tempWorldUp, dt * 0.15);
        } else {
          // Reorient to initial resting quaternion on entering demo mode
          group.quaternion.slerp(DEFAULT_HEADSET_QUATERNION, slerpFactor);
        }

        const bobbing = isDemoPhase ? 0 : Math.cos(time * 1.2) * 0.2;
        tempTargetPosition.set(0, -11 * group.scale.y - bobbing, 0);
        group.position.lerp(tempTargetPosition, slerpFactor);
      } else {
        const stageScale = presentationStage === "electrodes" ? targetScale * 1.08 : targetScale;
        tempTargetScale.setScalar(stageScale);
        tempTargetPosition.set(0, -11 * targetScale, 0);
        group.scale.lerp(tempTargetScale, slerpFactor);
        group.position.lerp(tempTargetPosition, slerpFactor);
        group.quaternion.slerp(DEFAULT_HEADSET_QUATERNION, slerpFactor);
      }
    }
  });
}

