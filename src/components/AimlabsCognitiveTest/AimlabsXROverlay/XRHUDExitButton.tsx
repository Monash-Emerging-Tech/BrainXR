import React, { useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { triggerXRHaptic } from "../../../utils/xrHaptics";

export const XRHUDExitButton: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onExit();
  };

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    triggerXRHaptic(e, 0.25, 10);
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
  };

  return (
    <group position={[0, 0.42, 0]}>
      <mesh
        onClick={handleClick}
        onPointerDown={(e) => {
          e.stopPropagation();
          triggerXRHaptic(e, 0.35, 15);
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[0.82, 0.18]} />
        <meshBasicMaterial color={hovered ? "#334155" : "#1e293b"} transparent opacity={0.9} />
      </mesh>

      {hovered && (
        <lineSegments position={[0, 0, 0.005]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.83, 0.19)]} />
          <lineBasicMaterial color="#f43f5e" />
        </lineSegments>
      )}

      <Text
        position={[0, 0, 0.01]}
        fontSize={0.065}
        color={hovered ? "#fda4af" : "#cbd5e1"}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
        fontWeight="bold"
      >
        EXIT VR
      </Text>
    </group>
  );
};
