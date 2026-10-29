import React from "react";
import { Text } from "@react-three/drei";
import type { CognitiveRoundType } from "./types";

interface AimlabsXROverlayProps {
  score: number;
  accuracy: number;
  round: CognitiveRoundType;
  onExit?: () => void;
}

export const AimlabsXROverlay: React.FC<AimlabsXROverlayProps> = ({
  score,
  accuracy,
  round,
  onExit,
}) => {
  const isRound1 = round === 1;

  return (
    <group position={[0, 3.2, -4.5]} name="brainxr-xr-hud">
      {/* Sleek Floating Pill */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.2, 0.45]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.8} />
      </mesh>

      <Text position={[-0.5, 0.05, 0.01]} fontSize={0.16} color="#ffffff" anchorX="center" anchorY="middle">
        {`RT ${score}ms`}
      </Text>

      <Text position={[0.5, 0.05, 0.01]} fontSize={0.16} color="#10b981" anchorX="center" anchorY="middle">
        {`${Math.round(accuracy)}%`}
      </Text>

      {/* High clarity rule */}
      <Text position={[0, -0.12, 0.01]} fontSize={0.08} color={isRound1 ? "#38bdf8" : "#fb7185"} anchorX="center" anchorY="middle">
        {isRound1 ? "ROUND 1 (CPT): CYAN = PRESS | RED = AVOID" : "ROUND 2 (SART): RED = PRESS | CYAN = AVOID"}
      </Text>

      {/* Exit Button */}
      {onExit && (
        <group
          position={[0, 0.38, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
        >
          <mesh>
            <planeGeometry args={[0.9, 0.18]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle">
            EXIT VR
          </Text>
        </group>
      )}
    </group>
  );
};
