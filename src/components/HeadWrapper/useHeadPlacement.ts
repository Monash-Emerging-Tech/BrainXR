import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import {
  getElectrodeFocusQuaternion,
  DEFAULT_HEADSET_QUATERNION,
} from "../eegHead/electrodeNodes";
import {
  headsetPresentation,
  type HeadsetPresentationStage,
} from "../../utils/headsetPresentation";

interface Params {
  groupRef: React.RefObject<THREE.Group | null>;
  frameRef: React.RefObject<Frame>;
  isDraggingRef?: React.RefObject<boolean>;
  xrPositionRef?: React.RefObject<THREE.Vector3>;
  xrRotationRef?: React.RefObject<THREE.Quaternion>;
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

// Smooth domain expansion animation progress (0 = in 2D slate, 1 = fully pushed forward in spatial room)
let expansionT = 0;

// Per-frame placement of the headset group:
// - In WebXR: executes the "Domain Expansion" push-forward out of the 2D plane into physical room space.
// - On 2D Desktop: maintains dynamic showcase, onboarding, and focus-channel tracking.
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
  const transitionStartRef = useRef<number | null>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const isPresenting = state.gl.xr.isPresenting;
    const isDemoPhase = frameRef.current.phase === "baseline" || frameRef.current.phase === "stimulus";
    const group = groupRef.current;
    if (!group) return;

    // Track live home headset orientation for continuous cross-canvas quaternion synchronization
    headsetPresentation.setHomeQuaternion(group.quaternion);

    const slerpFactor = 1 - Math.exp(-5 * Math.min(delta, 0.1));
    const effectiveFocusChannel =
      selectedChannel ??
      (highlightPrefrontal || presentationStage === "prefrontal" ? "FpZ" : null);

    if (isPresenting) {
      // --- WebXR AR/VR Domain Expansion ---
      // Animate expansion progress smoothly over ~1.2s upon entering XR
      if (!wasPresentingRef.current) {
        wasPresentingRef.current = true;
        transitionStartRef.current = time;
        expansionT = 0;
      }

      if (transitionStartRef.current !== null) {
        const elapsed = time - transitionStartRef.current;
        // Smooth cubic ease-out
        const t = Math.min(1, elapsed / 1.2);
        expansionT = 1 - Math.pow(1 - t, 3);
      } else {
        expansionT = 1;
      }

      const activePosRef = xrPositionRef?.current;
      const activeQuatRef = xrRotationRef?.current;
      const isDragging = isDraggingRef?.current ?? false;

      // In XR, calculate line of sight from headset to user's camera
      state.camera.getWorldPosition(tempCamPos);
      const restingTargetPos = activePosRef ?? new THREE.Vector3(0, 1.25, -0.9);
      tempVec.subVectors(tempCamPos, restingTargetPos).normalize();

      const targetQuat = effectiveFocusChannel
        ? getElectrodeFocusQuaternion(effectiveFocusChannel, tempVec, tempWorldUp, tempFocusQuat)
        : DEFAULT_HEADSET_QUATERNION;

      if (!isDragging) {
        if (activeQuatRef) {
          activeQuatRef.slerp(targetQuat, slerpFactor);
          group.quaternion.copy(activeQuatRef);
        } else {
          group.quaternion.slerp(targetQuat, slerpFactor);
        }

        // Domain expansion interpolation:
        // Starts docked in the 2D plane (z = -2.2, y = 1.45) and glides smoothly forward into room space (restingTargetPos)
        const dockedPos = new THREE.Vector3(0, 1.45, -2.2);
        tempTargetPosition.lerpVectors(dockedPos, restingTargetPos, expansionT);
        group.position.copy(tempTargetPosition);
      }

      // Realistic physical head size (approx 22cm diameter)
      const targetXrScale = presentationStage === "hidden" ? 0.0001 : 0.012;
      tempTargetScale.setScalar(targetXrScale);
      group.scale.lerp(tempTargetScale, slerpFactor);
    } else {
      // --- Standard 2D Desktop Layout (Reverse Glide back into 2D plane) ---
      if (wasPresentingRef.current) {
        wasPresentingRef.current = false;
        transitionStartRef.current = null;
        expansionT = 0;
      }

      // Dynamically scale model to occupy exactly 1/3 of the viewport height.
      // Model height is approx 22 units in Blender local space.
      const targetScale = state.viewport.height / 66;
      const storyProgress = headsetPresentation.getStoryProgress();

      if (storyProgress !== null) {
        // --- Single Headset Onboarding Presentation ---
        const topOffset = Math.max(5.5, state.viewport.height * 1.1);

        if (storyProgress < 0.71) {
          // Prepared off-screen above the viewport top [invisible during Beats 2 & 3]
          // Oriented at side profile (Math.PI / 2) matching Beat 3's brain angle
          tempFocusQuat.setFromEuler(new THREE.Euler(0.05, Math.PI / 2, 0, "YXZ"));
          const headUp = tempWorldUp.clone().applyQuaternion(tempFocusQuat);
          tempTargetPosition.set(0, -11 * targetScale, 0).addScaledVector(headUp, topOffset);
          tempTargetScale.setScalar(0.0001);
          group.position.copy(tempTargetPosition);
          group.scale.copy(tempTargetScale);
          group.quaternion.copy(tempFocusQuat);
        } else {
          // Beat 4 (Intensity section, 0.71 -> 0.89) & Finale (0.89 -> 1.0):
          // 1. Headset translates smoothly down along the head axis from the top of the screen onto the brain [WITHOUT ANY SCALING]
          // 2. Headset rotates in sync with the brain as it slots in (side profile Math.PI / 2 -> front 0.0)
          // 3. Prefrontal electrodes glow across the forehead
          // 4. Fully synchronizes with DEFAULT_HEADSET_QUATERNION of the home page
          const mountT = Math.min(1, Math.max(0, (storyProgress - 0.71) / 0.07));
          const smoothMount = mountT * mountT * (3 - 2 * mountT);
          const yOffset = (1 - smoothMount) * topOffset;

          const t4 = Math.max(0, Math.min(1, (storyProgress - 0.71) / 0.16));
          const smoothT4 = t4 * t4 * (3 - 2 * t4);
          const headsetYaw = (1 - smoothT4) * (Math.PI / 2);
          const pitch = 0.05 + (Math.PI / 32 - 0.05) * smoothT4;

          tempFocusQuat.setFromEuler(new THREE.Euler(pitch, headsetYaw, 0, "YXZ"));
          const headUp = tempWorldUp.clone().applyQuaternion(tempFocusQuat);
          tempTargetPosition.set(0, -11 * targetScale, 0).addScaledVector(headUp, yOffset);

          tempTargetScale.setScalar(targetScale);

          group.position.copy(tempTargetPosition);
          group.scale.copy(tempTargetScale);
          group.quaternion.copy(tempFocusQuat);
        }
      } else if (presentationStage === "hidden") {
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
