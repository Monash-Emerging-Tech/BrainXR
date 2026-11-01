import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { TargetType } from "../types";

const OFFBIT_FONT = "/OffBit-Regular.ttf";

interface XRRuleTokenProps {
  targetType: TargetType;
  action: "PRESS" | "DO NOT PRESS";
  position: [number, number, number];
}

export const XRRuleToken: React.FC<XRRuleTokenProps> = ({ targetType, action, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isSphere = targetType === "sphere";
  const isPress = action === "PRESS";

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (!isSphere) {
      meshRef.current.rotation.x += delta * 0.8;
      meshRef.current.rotation.y += delta * 1.1;
    }
  });

  return (
    <group position={position}>
      {/* Translucent Glass Base Card */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.34, 0.38]} />
        <meshBasicMaterial
          color={isPress ? (isSphere ? "#083344" : "#4c0519") : "#090d16"}
          transparent
          opacity={0.88}
        />
      </mesh>

      <lineSegments position={[0, 0, -0.005]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.35, 0.39)]} />
        <lineBasicMaterial
          color={isPress ? (isSphere ? "#06b6d4" : "#f43f5e") : "#334155"}
          transparent
          opacity={0.5}
        />
      </lineSegments>

      {/* Floating 3D Token */}
      {isSphere ? (
        <mesh ref={meshRef} position={[-0.48, 0, 0.04]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00bbdd"
            emissiveIntensity={0.85}
            roughness={0.2}
          />
        </mesh>
      ) : (
        <mesh ref={meshRef} position={[-0.48, 0, 0.04]} rotation={[0.3, 0.4, 0]}>
          <boxGeometry args={[0.11, 0.11, 0.11]} />
          <meshStandardMaterial
            color="#f43f5e"
            emissive="#be123c"
            emissiveIntensity={0.85}
            roughness={0.25}
          />
        </mesh>
      )}

      <Text position={[-0.32, 0.05, 0.01]} fontSize={0.048} color="#cbd5e1" anchorX="left" anchorY="middle">
        {isSphere ? "Cyan Sphere" : "Red Box"}
      </Text>

      <Text
        position={[0.55, 0.02, 0.01]}
        font={OFFBIT_FONT}
        fontSize={0.058}
        color={isPress ? (isSphere ? "#67e8f9" : "#fda4af") : "#f43f5e"}
        anchorX="right"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {action}
      </Text>
    </group>
  );
};
