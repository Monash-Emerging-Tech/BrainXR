import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { createPillShape } from "../XRConsole/pillShape";
import { triggerXRHaptic } from "../../utils/xrHaptics";
import type { GameStatus, RoundMetrics, TargetType } from "./types";

interface AimlabsXRModalsProps {
  status: GameStatus;
  countdown: number;
  round1Metrics: RoundMetrics | null;
  round2Metrics: RoundMetrics | null;
  onStartGame: () => void;
  onStartRound2: () => void;
  onRestart: () => void;
  onExit: () => void;
}

interface XRActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "emerald";
  width?: number;
  height?: number;
  position?: [number, number, number];
}

const XRActionButton: React.FC<XRActionButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  width = 0.9,
  height = 0.22,
  position = [0, 0, 0],
}) => {
  const [hovered, setHovered] = useState(false);

  const shape = useMemo(
    () => createPillShape(width, height, height / 2),
    [width, height]
  );
  const outlineGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(shape.getPoints(32)),
    [shape]
  );

  const colors = {
    primary: {
      bg: hovered ? "#4f46e5" : "#4338ca",
      outline: "#818cf8",
      text: "#ffffff",
    },
    secondary: {
      bg: hovered ? "#334155" : "#1e293b",
      outline: "#64748b",
      text: "#cbd5e1",
    },
    danger: {
      bg: hovered ? "#f43f5e" : "#e11d48",
      outline: "#fda4af",
      text: "#ffffff",
    },
    emerald: {
      bg: hovered ? "#059669" : "#047857",
      outline: "#34d399",
      text: "#ffffff",
    },
  }[variant];

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onClick();
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
    <group position={position}>
      <mesh
        position={[0, 0, hovered ? 0.01 : 0]}
        onClick={handleClick}
        onPointerDown={(e) => {
          e.stopPropagation();
          triggerXRHaptic(e, 0.4, 15);
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color={colors.bg}
          roughness={0.25}
          metalness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {hovered && (
        <lineLoop
          geometry={outlineGeo}
          position={[0, 0, 0.015]}
          raycast={() => null}
        >
          <lineBasicMaterial color={colors.outline} linewidth={2} />
        </lineLoop>
      )}
      <Text
        position={[0, 0, hovered ? 0.02 : 0.012]}
        fontSize={0.065}
        color={colors.text}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  );
};

// 3D Visual Rule Badge (Floating pill depicting sphere/box + rule)
const XRRuleBadge: React.FC<{
  targetType: TargetType;
  action: "PRESS" | "DO NOT PRESS";
  position: [number, number, number];
}> = ({ targetType, action, position }) => {
  const isSphere = targetType === "sphere";
  const isPress = action === "PRESS";

  return (
    <group position={position}>
      {/* Background card */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.35, 0.45]} />
        <meshBasicMaterial
          color={isPress ? (isSphere ? "#042f2e" : "#4c0519") : "#090d16"}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Target visual icon: small 3D sphere or box */}
      {isSphere ? (
        <mesh position={[-0.45, 0, 0.04]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00bbdd"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
      ) : (
        <mesh position={[-0.45, 0, 0.04]} rotation={[0.3, 0.4, 0]}>
          <boxGeometry args={[0.13, 0.13, 0.13]} />
          <meshStandardMaterial
            color="#f43f5e"
            emissive="#be123c"
            emissiveIntensity={0.8}
            roughness={0.25}
          />
        </mesh>
      )}

      {/* Label and instruction text */}
      <Text
        position={[-0.15, 0.08, 0.01]}
        fontSize={0.05}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
      >
        {isSphere ? "CYAN SPHERE" : "RED BOX"}
      </Text>
      <Text
        position={[-0.15, -0.07, 0.01]}
        fontSize={0.065}
        color={isPress ? (isSphere ? "#22d3ee" : "#fb7185") : "#64748b"}
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
      >
        {action}
      </Text>
    </group>
  );
};

export const AimlabsXRModals: React.FC<AimlabsXRModalsProps> = ({
  status,
  countdown,
  round1Metrics,
  round2Metrics,
  onStartGame,
  onStartRound2,
  onRestart,
  onExit,
}) => {
  // 1. Ready Screen (Initial Assessment Briefing)
  if (status === "ready") {
    return (
      <group position={[0, 1.6, -3.2]} name="aimlabs-xr-ready-modal">
        {/* Main Panel Canvas Background */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.2, 2.3]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.92} />
        </mesh>

        {/* Ambient Glow Edge */}
        <lineSegments position={[0, 0, -0.015]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.22, 2.32)]} />
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </lineSegments>

        {/* Header Branding */}
        <Text
          position={[0, 0.88, 0.01]}
          fontSize={0.06}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          AN MNET EXPERIENCE
        </Text>
        <Text
          position={[0, 0.72, 0.01]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          BrainXR Cognitive Assessment
        </Text>
        <Text
          position={[0, 0.54, 0.01]}
          fontSize={0.055}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          Direction of Attention · Continuous Performance Battery
        </Text>

        {/* Rule Badges: Dual Round Overview */}
        {/* Round 1 (Left) */}
        <group position={[-0.75, 0.16, 0]}>
          <Text
            position={[0, 0.3, 0.01]}
            fontSize={0.06}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            ROUND 1 · CPT
          </Text>
          <XRRuleBadge
            targetType="sphere"
            action="PRESS"
            position={[0, 0.05, 0]}
          />
          <XRRuleBadge
            targetType="box"
            action="DO NOT PRESS"
            position={[0, -0.44, 0]}
          />
        </group>

        {/* Round 2 (Right) */}
        <group position={[0.75, 0.16, 0]}>
          <Text
            position={[0, 0.3, 0.01]}
            fontSize={0.06}
            color="#a78bfa"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            ROUND 2 · SART
          </Text>
          <XRRuleBadge
            targetType="box"
            action="PRESS"
            position={[0, 0.05, 0]}
          />
          <XRRuleBadge
            targetType="sphere"
            action="DO NOT PRESS"
            position={[0, -0.44, 0]}
          />
        </group>

        {/* Input instructions tip */}
        <Text
          position={[0, -0.56, 0.01]}
          fontSize={0.045}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          Aim controller ray at targets or press Controller Trigger / Grip / Select
        </Text>

        {/* Bottom Actions */}
        <group position={[0, -0.84, 0.02]}>
          <XRActionButton
            label="Exit to EEG"
            variant="secondary"
            width={0.9}
            height={0.2}
            position={[-0.6, 0, 0]}
            onClick={onExit}
          />
          <XRActionButton
            label="Start Assessment →"
            variant="primary"
            width={1.2}
            height={0.2}
            position={[0.55, 0, 0]}
            onClick={onStartGame}
          />
        </group>
      </group>
    );
  }

  // 2. Countdown 3-2-1 Overlay in 3D
  if (status === "countdown") {
    return (
      <group position={[0, 1.6, -3.2]} name="aimlabs-xr-countdown">
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.6, 1.1]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.7} />
        </mesh>
        <Text
          position={[0, 0.1, 0.02]}
          fontSize={0.42}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {countdown > 0 ? countdown.toString() : "GO!"}
        </Text>
        <Text
          position={[0, -0.28, 0.02]}
          fontSize={0.06}
          color="#22d3ee"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
        >
          FIXATE CENTER CROSS
        </Text>
      </group>
    );
  }

  // 3. Intermission Screen (Telemetry Report between Round 1 and Round 2)
  if (status === "intermission" && round1Metrics) {
    return (
      <group position={[0, 1.6, -3.2]} name="aimlabs-xr-intermission">
        {/* Main Panel Canvas Background */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.2, 2.3]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.93} />
        </mesh>

        <lineSegments position={[0, 0, -0.015]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.22, 2.32)]} />
          <lineBasicMaterial color="#fbbf24" transparent opacity={0.5} />
        </lineSegments>

        {/* Heading */}
        <Text
          position={[0, 0.88, 0.01]}
          fontSize={0.06}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          ROUND 1 COMPLETE
        </Text>
        <Text
          position={[0, 0.72, 0.01]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Telemetry Report
        </Text>

        {/* 4 Metric Badges in 3D */}
        <group position={[0, 0.42, 0.01]}>
          {/* Hits */}
          <group position={[-1.05, 0, 0]}>
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[0.62, 0.34]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
            </mesh>
            <Text position={[0, 0.08, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="center" anchorY="middle">
              HITS (GO)
            </Text>
            <Text position={[0, -0.06, 0.01]} fontSize={0.08} color="#22d3ee" anchorX="center" anchorY="middle" fontWeight="bold">
              {round1Metrics.goHits.toString()}
            </Text>
          </group>

          {/* False Alarms */}
          <group position={[-0.35, 0, 0]}>
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[0.62, 0.34]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
            </mesh>
            <Text position={[0, 0.08, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="center" anchorY="middle">
              COMMISSIONS
            </Text>
            <Text position={[0, -0.06, 0.01]} fontSize={0.08} color="#f43f5e" anchorX="center" anchorY="middle" fontWeight="bold">
              {round1Metrics.commissions.toString()}
            </Text>
          </group>

          {/* Mean RT */}
          <group position={[0.35, 0, 0]}>
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[0.62, 0.34]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
            </mesh>
            <Text position={[0, 0.08, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="center" anchorY="middle">
              MEAN RT
            </Text>
            <Text position={[0, -0.06, 0.01]} fontSize={0.075} color="#fbbf24" anchorX="center" anchorY="middle" fontWeight="bold">
              {`${Math.round(round1Metrics.meanReactionTime)}ms`}
            </Text>
          </group>

          {/* Accuracy */}
          <group position={[1.05, 0, 0]}>
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[0.62, 0.34]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
            </mesh>
            <Text position={[0, 0.08, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="center" anchorY="middle">
              ACCURACY
            </Text>
            <Text position={[0, -0.06, 0.01]} fontSize={0.08} color="#34d399" anchorX="center" anchorY="middle" fontWeight="bold">
              {`${Math.round(round1Metrics.accuracy)}%`}
            </Text>
          </group>
        </group>

        {/* Rule Reversal Notice */}
        <group position={[0, -0.12, 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[2.7, 0.58]} />
            <meshBasicMaterial color="#1e1022" transparent opacity={0.85} />
          </mesh>
          <Text
            position={[0, 0.21, 0.01]}
            fontSize={0.05}
            color="#fb7185"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.15}
          >
            RULE REVERSAL FOR ROUND 2 (SART)
          </Text>

          {/* Left: Red Box -> PRESS */}
          <XRRuleBadge
            targetType="box"
            action="PRESS"
            position={[-0.65, -0.06, 0]}
          />
          {/* Right: Cyan Sphere -> AVOID */}
          <XRRuleBadge
            targetType="sphere"
            action="DO NOT PRESS"
            position={[0.65, -0.06, 0]}
          />
        </group>

        {/* Continue Button */}
        <group position={[0, -0.74, 0.02]}>
          <XRActionButton
            label="Start Round 2 (SART) →"
            variant="danger"
            width={1.6}
            height={0.22}
            position={[0, 0, 0]}
            onClick={onStartRound2}
          />
        </group>
      </group>
    );
  }

  // 4. Final Finished Summary Screen
  if (status === "finished" && round1Metrics && round2Metrics) {
    const totalScore = round1Metrics.score + round2Metrics.score;
    const overallAccuracy = (round1Metrics.accuracy + round2Metrics.accuracy) / 2;

    return (
      <group position={[0, 1.6, -3.2]} name="aimlabs-xr-finished">
        {/* Main Panel Canvas Background */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.2, 2.3]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.93} />
        </mesh>

        <lineSegments position={[0, 0, -0.015]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.22, 2.32)]} />
          <lineBasicMaterial color="#34d399" transparent opacity={0.5} />
        </lineSegments>

        {/* Heading */}
        <Text
          position={[0, 0.9, 0.01]}
          fontSize={0.055}
          color="#34d399"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          BATTERY COMPLETE
        </Text>
        <Text
          position={[0, 0.74, 0.01]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Cognitive Telemetry Report
        </Text>

        {/* Composite Summary Pill */}
        <group position={[0, 0.46, 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[2.5, 0.32]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
          </mesh>
          <Text position={[-0.6, 0.06, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
            COMPOSITE SCORE
          </Text>
          <Text position={[-0.6, -0.06, 0.01]} fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {totalScore.toString()}
          </Text>
          <Text position={[0.6, 0.06, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
            OVERALL ACCURACY
          </Text>
          <Text position={[0.6, -0.06, 0.01]} fontSize={0.08} color="#34d399" anchorX="center" anchorY="middle" fontWeight="bold">
            {`${Math.round(overallAccuracy)}%`}
          </Text>
        </group>

        {/* Side-by-Side Comparison Columns */}
        {/* Round 1 (Left) */}
        <group position={[-0.72, -0.05, 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[1.35, 0.58]} />
            <meshBasicMaterial color="#082f49" transparent opacity={0.7} />
          </mesh>
          <Text position={[0, 0.22, 0.01]} fontSize={0.05} color="#38bdf8" anchorX="center" anchorY="middle" fontWeight="bold">
            ROUND 1 (CPT)
          </Text>
          <Text position={[-0.55, 0.1, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="left" anchorY="middle">
            {`Go Hits: ${round1Metrics.goHits}`}
          </Text>
          <Text position={[-0.55, 0.02, 0.01]} fontSize={0.038} color="#fb7185" anchorX="left" anchorY="middle">
            {`False Alarms: ${round1Metrics.commissions}`}
          </Text>
          <Text position={[-0.55, -0.06, 0.01]} fontSize={0.038} color="#fbbf24" anchorX="left" anchorY="middle">
            {`Mean RT: ${Math.round(round1Metrics.meanReactionTime)}ms`}
          </Text>
          <Text position={[-0.55, -0.14, 0.01]} fontSize={0.038} color="#34d399" anchorX="left" anchorY="middle">
            {`Accuracy: ${Math.round(round1Metrics.accuracy)}%`}
          </Text>
        </group>

        {/* Round 2 (Right) */}
        <group position={[0.72, -0.05, 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[1.35, 0.58]} />
            <meshBasicMaterial color="#3b0764" transparent opacity={0.7} />
          </mesh>
          <Text position={[0, 0.22, 0.01]} fontSize={0.05} color="#c084fc" anchorX="center" anchorY="middle" fontWeight="bold">
            ROUND 2 (SART)
          </Text>
          <Text position={[-0.55, 0.1, 0.01]} fontSize={0.038} color="#94a3b8" anchorX="left" anchorY="middle">
            {`Go Hits: ${round2Metrics.goHits}`}
          </Text>
          <Text position={[-0.55, 0.02, 0.01]} fontSize={0.038} color="#fb7185" anchorX="left" anchorY="middle">
            {`False Alarms: ${round2Metrics.commissions}`}
          </Text>
          <Text position={[-0.55, -0.06, 0.01]} fontSize={0.038} color="#fbbf24" anchorX="left" anchorY="middle">
            {`Mean RT: ${Math.round(round2Metrics.meanReactionTime)}ms`}
          </Text>
          <Text position={[-0.55, -0.14, 0.01]} fontSize={0.038} color="#34d399" anchorX="left" anchorY="middle">
            {`Accuracy: ${Math.round(round2Metrics.accuracy)}%`}
          </Text>
        </group>

        {/* Action Buttons */}
        <group position={[0, -0.66, 0.02]}>
          <XRActionButton
            label="Test Again"
            variant="secondary"
            width={0.9}
            height={0.2}
            position={[-0.55, 0, 0]}
            onClick={onRestart}
          />
          <XRActionButton
            label="Return to EEG"
            variant="emerald"
            width={1.1}
            height={0.2}
            position={[0.55, 0, 0]}
            onClick={onExit}
          />
        </group>
      </group>
    );
  }

  return null;
};

