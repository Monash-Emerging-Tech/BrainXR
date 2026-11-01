import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

const OFFBIT_FONT = "/OffBit-Regular.ttf";

export const XRCountdownModal: React.FC<{ countdown: number }> = ({ countdown }) => {
  const textRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!textRef.current) return;
    const s = 1 + Math.sin(state.clock.getElapsedTime() * 8) * 0.04;
    textRef.current.scale.set(s, s, s);
  });

  return (
    <group position={[0, 1.6, -3.2]} name="aimlabs-xr-countdown">
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.75} />
      </mesh>

      <group ref={textRef} position={[0, 0.12, 0.02]}>
        <Text font={OFFBIT_FONT} fontSize={0.46} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.12}>
          {countdown > 0 ? countdown.toString() : "GO"}
        </Text>
      </group>

      <Text position={[0, -0.3, 0.02]} fontSize={0.055} color="#22d3ee" anchorX="center" anchorY="middle" letterSpacing={0.2}>
        FIXATE CENTER CROSS
      </Text>
    </group>
  );
};
