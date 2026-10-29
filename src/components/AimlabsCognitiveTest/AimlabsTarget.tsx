import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { triggerXRHaptic } from "../../utils/xrHaptics";
import type { TargetType } from "./types";

interface AimlabsTargetProps {
  type: TargetType;
  visible: boolean;
  position?: [number, number, number];
  onClick?: () => void;
}

export const AimlabsTarget: React.FC<AimlabsTargetProps> = ({
  type,
  visible,
  position = [0, 1.6, -4.5],
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const isSphere = type === "sphere";

  useFrame((_, delta) => {
    if (groupRef.current && visible) {
      if (!isSphere) {
        groupRef.current.rotation.x += delta * 0.9;
        groupRef.current.rotation.y += delta * 1.3;
      }
    }
  });

  const handleTargetHit = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!visible) return;
    triggerXRHaptic(e, 0.6, 25);
    onClick?.();
  };

  if (!visible) return null;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleTargetHit}
      onPointerDown={handleTargetHit}
    >
      {isSphere ? (
        <mesh>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00bbdd"
            emissiveIntensity={0.65}
            roughness={0.2}
            metalness={0.15}
          />
        </mesh>
      ) : (
        <group>
          <mesh>
            <boxGeometry args={[0.62, 0.62, 0.62]} />
            <meshStandardMaterial
              color="#f43f5e"
              emissive="#be123c"
              emissiveIntensity={0.75}
              roughness={0.25}
              metalness={0.1}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.625, 0.625, 0.625)]} />
            <lineBasicMaterial color="#fda4af" linewidth={1.5} />
          </lineSegments>
        </group>
      )}
    </group>
  );
};
