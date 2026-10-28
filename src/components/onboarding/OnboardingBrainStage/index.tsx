import React, { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BrainModel from "../../story/BrainModel";
import BrainFallback from "../../story/BrainFallback";
import { headsetPresentation } from "../../../utils/headsetPresentation";

const _eulerTemp = new THREE.Euler(0, 0, 0, "YXZ");
const _quatTemp = new THREE.Quaternion();
const _quatTurn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
const _vecTemp = new THREE.Vector3();

export const OnboardingBrainRig: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const yawRef = useRef(0.0);
  const mountRef = useRef(0);
  const stageOpacityRef = useRef(1);
  const prefrontalRef = useRef(false);
  const depthWriteRef = useRef(false);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const progress = headsetPresentation.getStoryProgress();
    if (progress === null || progress < 0.28 || progress > 0.94) {
      group.visible = false;
      return;
    }
    group.visible = true;

    // Dynamic viewport-responsive scale matching Scene.tsx / useHeadPlacement.ts exactly:
    const targetScale = state.viewport.height / 66;
    // Exact anatomical brain fit inside the headset (15.58 local units derived from electrode placements)
    const fitScale = targetScale * 15.58;

    // Fade calculation:
    // Enters 0.28 -> 0.31, dissolves 0.88 -> 0.93:
    const fade =
      progress < 0.31
        ? Math.max(0, (progress - 0.28) / 0.03)
        : progress > 0.88
          ? Math.max(0, 1 - (progress - 0.88) / 0.05)
          : 1;
    stageOpacityRef.current = fade;

    // Prefrontal highlight glow & depth write:
    prefrontalRef.current = progress < 0.53 || progress >= 0.71;
    depthWriteRef.current = progress >= 0.71 && progress < 0.88;

    // Scale calculation:
    // In Beat 2 & 3, the brain is comfortably presented at 1.35x fitScale for exploring lobes & Apple Vision Pro.
    // In Beat 4 (0.71 -> 0.78), scale smoothly settles to 1.0x fitScale so the descending single headset fits like a glove!
    let scale = fitScale * 1.35;
    if (progress < 0.34) {
      const enter = Math.max(0, (progress - 0.28) / 0.06);
      scale = fitScale * (0.85 + enter * 0.50);
    } else if (progress >= 0.71) {
      const fitT = Math.max(0, Math.min(1, (progress - 0.71) / 0.07));
      const smoothFit = fitT * fitT * (3 - 2 * fitT);
      scale = fitScale * (1.35 - 0.35 * smoothFit);
    }
    group.scale.setScalar(scale);

    // VR Headset (Apple Vision Pro) mount progress:
    let mount = 0;
    if (progress >= 0.50 && progress < 0.70) {
      mount = Math.max(0, Math.min(1, (progress - 0.50) / 0.04));
    } else if (progress >= 0.70 && progress <= 0.74) {
      mount = Math.max(0, 1 - (progress - 0.70) / 0.03);
    }
    mountRef.current = mount;

    // Continuous scrollymation rotation across beats:
    if (progress < 0.53) {
      // Beat 2 (0.31 -> 0.53): starts at side profile (0.0 rad) and glides smoothly to face the user (-1.57 rad).
      const t2 = Math.max(0, Math.min(1, (progress - 0.31) / 0.22));
      const smoothT2 = t2 * t2 * (3 - 2 * t2);
      const yaw = 0.0 + (-Math.PI / 2 - 0.0) * smoothT2;
      _eulerTemp.set(0.05, yaw, 0, "YXZ");
      group.quaternion.setFromEuler(_eulerTemp);
      group.position.set(0, 0, 0);
      yawRef.current = 0;
    } else if (progress < 0.71) {
      // Beat 3 (0.53 -> 0.71): Apple Vision Pro mounts, and the scrollymation smoothly rotates the brain
      // to show its full side profile (0.0 rad) so the viewer can see the complete side profile and gaze vector.
      const t3 = Math.max(0, Math.min(1, (progress - 0.53) / 0.18));
      const smoothT3 = t3 * t3 * (3 - 2 * t3);
      const yaw = -Math.PI / 2 + (0.0 - -Math.PI / 2) * smoothT3;
      _eulerTemp.set(0.05, yaw, 0, "YXZ");
      group.quaternion.setFromEuler(_eulerTemp);
      group.position.set(0, 0, 0);
      yawRef.current = 0;
    } else {
      // Beat 4 (0.71 -> 0.89) & Finale: Intensity / Single EEG Headset
      // In Beat 4, the headset descends and slots on top of the brain.
      // The headset and brain rotate together in 100% mechanical lockstep from side profile to front.
      const t4 = Math.max(0, Math.min(1, (progress - 0.71) / 0.16));
      const smoothT4 = t4 * t4 * (3 - 2 * t4);
      const headsetYaw = (1 - smoothT4) * (Math.PI / 2);
      const pitch = 0.05 + (Math.PI / 32 - 0.05) * smoothT4;

      // Headset orientation:
      _eulerTemp.set(pitch, headsetYaw, 0, "YXZ");
      _quatTemp.setFromEuler(_eulerTemp);

      // Brain orientation: strictly locked to headset quaternion
      // Brain raw forward is +X, so multiplying by Ry(-PI/2) aligns brain forward with headset forward (+Z):
      group.quaternion.copy(_quatTemp).multiply(_quatTurn);
      yawRef.current = 0;

      // Brain anatomical anchor inside the headset:
      // Base of headset sits at (0, -11 * targetScale, 0).
      // Brain sits at [-0.01, 3.87, 0.07] in headset local space.
      _vecTemp.set(-0.01 * targetScale, 3.87 * targetScale, 0.07 * targetScale);
      _vecTemp.applyQuaternion(_quatTemp);
      _vecTemp.y += -11 * targetScale;

      // Smooth descent settle (0.71 -> 0.78):
      const mountT = Math.min(1, Math.max(0, (progress - 0.71) / 0.07));
      const smoothMount = mountT * mountT * (3 - 2 * mountT);

      group.position.set(
        _vecTemp.x * smoothMount,
        _vecTemp.y * smoothMount,
        _vecTemp.z * smoothMount
      );
    }
  });

  const placeholder = useMemo(
    () => (
      <mesh>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.35} />
      </mesh>
    ),
    []
  );

  return (
    <group ref={groupRef}>
      <BrainFallback fallback={placeholder}>
        <Suspense fallback={placeholder}>
          <BrainModel
            activeIndex={4} // Frontal lobe
            prefrontalRef={prefrontalRef} // Prefrontal cortex dynamic glow ref
            depthWriteRef={depthWriteRef} // Dynamic depth testing ref
            pulse={true} // Gentle theta breathing pulse
            reducedMotion={false}
            customYawRef={yawRef}
            showVRHeadset={true}
            vrHeadsetMountRef={mountRef}
            stageOpacityRef={stageOpacityRef}
          />
        </Suspense>
      </BrainFallback>
    </group>
  );
};

export default OnboardingBrainRig;
