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
  presentationStage = "interactive",
}: Params): void {
  const wasPresentingRef = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const isPresenting = state.gl.xr.isPresenting;
    const isIdleShowcase = frameRef.current.phase === "idle";
    const group = groupRef.current;
    if (!group) return;

    const slerpFactor = 1 - Math.exp(-8 * Math.min(delta, 0.1));

    if (isPresenting) {
      // --- WebXR VR/AR Presentation Layout ---
      // In XR, calculate line of sight from headset to user's VR camera
      state.camera.getWorldPosition(tempCamPos);
      tempVec.subVectors(tempCamPos, xrPositionRef.current).normalize();

      const focusChannel = selectedChannel ?? (presentationStage === "prefrontal" ? "FpZ" : null);
      const targetQuat = focusChannel
        ? getElectrodeFocusQuaternion(focusChannel, tempVec, tempWorldUp, tempFocusQuat)
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
      } else if ((presentationStage === "showcase" || (presentationStage === "interactive" && isIdleShowcase)) && !selectedChannel) {
        // Slow showcase spin plus a subtle bobbing motion when no channel is selected.
        group.rotation.y = time * 0.15;
        group.rotation.x = Math.sin(time * 0.4) * 0.05 + Math.PI / 32;
        group.rotation.z = 0;
        tempTargetPosition.set(0, -11 * targetScale - Math.cos(time * 1.2) * 0.2, 0);
        tempTargetScale.setScalar(targetScale * 1.1);
        group.position.lerp(tempTargetPosition, slerpFactor);
        group.scale.lerp(tempTargetScale, slerpFactor);
      } else {
        const stageScale = presentationStage === "electrodes" ? targetScale * 1.08 : targetScale;
        tempTargetScale.setScalar(stageScale);
        tempTargetPosition.set(0, -11 * targetScale, 0);
        group.scale.lerp(tempTargetScale, slerpFactor);
        group.position.lerp(tempTargetPosition, slerpFactor);

        // Vector from head position to 2D desktop camera
        state.camera.getWorldPosition(tempCamPos);
        tempVec.subVectors(tempCamPos, group.position).normalize();

        const focusChannel = selectedChannel ?? (presentationStage === "prefrontal" ? "FpZ" : null);
        const targetQuat = focusChannel
          ? getElectrodeFocusQuaternion(focusChannel, tempVec, state.camera.up, tempFocusQuat)
          : DEFAULT_HEADSET_QUATERNION;

        group.quaternion.slerp(targetQuat, slerpFactor);
      }
    }
  });
}

