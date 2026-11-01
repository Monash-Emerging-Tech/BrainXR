import React from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { CognitiveRoundType } from "../types";
import { XRHUDMetrics } from "./XRHUDMetrics";
import { XRHUDRulePill } from "./XRHUDRulePill";
import { XRHUDExitButton } from "./XRHUDExitButton";

interface AimlabsXROverlayProps {
  score: number;
  accuracy: number;
  round: CognitiveRoundType;
  recentFeedback: { text: string; color: string } | null;
  onExit?: () => void;
}

export const AimlabsXROverlay: React.FC<AimlabsXROverlayProps> = ({
  score,
  accuracy,
  round,
  recentFeedback,
  onExit,
}) => {
  return (
    <group position={[0, 3.2, -4.5]} name="brainxr-xr-hud">
      {/* Sleek Floating Pill Container */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.5, 0.52]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.88} />
      </mesh>

      <lineSegments position={[0, 0, -0.005]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.52, 0.54)]} />
        <lineBasicMaterial color="#334155" transparent opacity={0.6} />
      </lineSegments>

      {/* Cumulative RT & Accuracy metrics */}
      <XRHUDMetrics score={score} accuracy={accuracy} />

      {/* Active round rule reminder */}
      <XRHUDRulePill round={round} />

      {/* Floating Reaction Time Shot Feedback */}
      {recentFeedback && (
        <group position={[0, -0.38, 0.02]}>
          <Text fontSize={0.16} color={recentFeedback.color} anchorX="center" anchorY="middle" fontWeight="bold">
            {recentFeedback.text}
          </Text>
        </group>
      )}

      {/* Exit Button positioned cleanly above the HUD bar */}
      {onExit && <XRHUDExitButton onExit={onExit} />}
    </group>
  );
};

export default AimlabsXROverlay;
