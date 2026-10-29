import React, { useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { triggerXRHaptic } from "../../utils/xrHaptics";
import type { CognitiveRoundType } from "./types";

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
  const isRound1 = round === 1;
  const [exitHovered, setExitHovered] = useState(false);

  const handleExitClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onExit?.();
  };

  const handleExitPointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setExitHovered(true);
    triggerXRHaptic(e, 0.25, 10);
  };

  const handleExitPointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setExitHovered(false);
  };

  return (
    <group position={[0, 3.2, -4.5]} name="brainxr-xr-hud">
      {/* Sleek Floating Pill Container */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.5, 0.52]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.88} />
      </mesh>

      {/* Subtle border outline */}
      <lineSegments position={[0, 0, -0.005]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.52, 0.54)]} />
        <lineBasicMaterial color="#334155" transparent opacity={0.6} />
      </lineSegments>

      {/* Cumulative Reaction Time Metric */}
      <group position={[-0.68, 0.08, 0.01]}>
        <Text position={[0, 0.06, 0]} fontSize={0.05} color="#94a3b8" anchorX="center" anchorY="middle">
          CUMULATIVE RT
        </Text>
        <Text position={[0, -0.05, 0]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
          {`${score}ms`}
        </Text>
      </group>

      {/* Divider */}
      <mesh position={[0, 0.08, 0.01]}>
        <planeGeometry args={[0.01, 0.22]} />
        <meshBasicMaterial color="#334155" />
      </mesh>

      {/* Accuracy Metric */}
      <group position={[0.68, 0.08, 0.01]}>
        <Text position={[0, 0.06, 0]} fontSize={0.05} color="#94a3b8" anchorX="center" anchorY="middle">
          ACCURACY
        </Text>
        <Text position={[0, -0.05, 0]} fontSize={0.14} color="#34d399" anchorX="center" anchorY="middle" fontWeight="bold">
          {`${Math.round(accuracy)}%`}
        </Text>
      </group>

      {/* High-Clarity Rule Pill */}
      <group position={[0, -0.15, 0.01]}>
        {/* Micro sphere / box icon + text */}
        {isRound1 ? (
          <group>
            {/* Cyan Sphere icon */}
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
            {/* Red Box icon */}
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
            {/* Red Box icon */}
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
            {/* Cyan Sphere icon */}
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

      {/* Floating Reaction Time Shot Feedback (+240ms / -240ms) */}
      {recentFeedback && (
        <group position={[0, -0.38, 0.02]}>
          <Text
            fontSize={0.16}
            color={recentFeedback.color}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {recentFeedback.text}
          </Text>
        </group>
      )}

      {/* Exit Button positioned cleanly above the HUD bar */}
      {onExit && (
        <group position={[0, 0.42, 0]}>
          <mesh
            onClick={handleExitClick}
            onPointerDown={(e) => {
              e.stopPropagation();
              triggerXRHaptic(e, 0.35, 15);
            }}
            onPointerEnter={handleExitPointerEnter}
            onPointerLeave={handleExitPointerLeave}
          >
            <planeGeometry args={[0.82, 0.18]} />
            <meshBasicMaterial
              color={exitHovered ? "#334155" : "#1e293b"}
              transparent
              opacity={0.9}
            />
          </mesh>
          {exitHovered && (
            <lineSegments position={[0, 0, 0.005]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(0.83, 0.19)]} />
              <lineBasicMaterial color="#f43f5e" />
            </lineSegments>
          )}
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.065}
            color={exitHovered ? "#fda4af" : "#cbd5e1"}
            anchorX="center"
            anchorY="middle"
            raycast={() => null}
            fontWeight="bold"
          >
            EXIT VR
          </Text>
        </group>
      )}
    </group>
  );
};
