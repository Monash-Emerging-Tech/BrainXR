import React from "react";
import { Text } from "@react-three/drei";

export const XRHUDMetrics: React.FC<{ score: number; accuracy: number }> = ({ score, accuracy }) => {
  return (
    <>
      <group position={[-0.68, 0.08, 0.01]}>
        <Text position={[0, 0.06, 0]} fontSize={0.05} color="#94a3b8" anchorX="center" anchorY="middle">
          CUMULATIVE RT
        </Text>
        <Text position={[0, -0.05, 0]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
          {`${score}ms`}
        </Text>
      </group>

      <mesh position={[0, 0.08, 0.01]}>
        <planeGeometry args={[0.01, 0.22]} />
        <meshBasicMaterial color="#334155" />
      </mesh>

      <group position={[0.68, 0.08, 0.01]}>
        <Text position={[0, 0.06, 0]} fontSize={0.05} color="#94a3b8" anchorX="center" anchorY="middle">
          ACCURACY
        </Text>
        <Text position={[0, -0.05, 0]} fontSize={0.14} color="#34d399" anchorX="center" anchorY="middle" fontWeight="bold">
          {`${Math.round(accuracy)}%`}
        </Text>
      </group>
    </>
  );
};
