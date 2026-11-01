import React from "react";
import { Text } from "@react-three/drei";
import type { CognitiveRoundType } from "../types";

export const XRHUDRulePill: React.FC<{ round: CognitiveRoundType }> = ({ round }) => {
  const isRound1 = round === 1;

  return (
    <group position={[0, -0.15, 0.01]}>
      {isRound1 ? (
        <group>
          <mesh position={[-0.88, 0, 0.01]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <Text position={[-0.82, 0, 0.01]} fontSize={0.055} color="#38bdf8" anchorX="left" anchorY="middle" fontWeight="bold">
            CYAN = PRESS
          </Text>
          <Text position={[0, 0, 0.01]} fontSize={0.05} color="#64748b" anchorX="center" anchorY="middle">
            |
          </Text>
          <mesh position={[0.18, 0, 0.01]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
          <Text position={[0.24, 0, 0.01]} fontSize={0.055} color="#fb7185" anchorX="left" anchorY="middle" fontWeight="bold">
            RED = AVOID
          </Text>
        </group>
      ) : (
        <group>
          <mesh position={[-0.88, 0, 0.01]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
          <Text position={[-0.82, 0, 0.01]} fontSize={0.055} color="#fb7185" anchorX="left" anchorY="middle" fontWeight="bold">
            RED = PRESS
          </Text>
          <Text position={[0, 0, 0.01]} fontSize={0.05} color="#64748b" anchorX="center" anchorY="middle">
            |
          </Text>
          <mesh position={[0.18, 0, 0.01]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <Text position={[0.24, 0, 0.01]} fontSize={0.055} color="#38bdf8" anchorX="left" anchorY="middle" fontWeight="bold">
            CYAN = AVOID
          </Text>
        </group>
      )}
    </group>
  );
};
