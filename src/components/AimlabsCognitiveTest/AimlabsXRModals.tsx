import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { createPillShape } from "../XRConsole/pillShape";
import { triggerXRHaptic } from "../../utils/xrHaptics";
import { XRModalDecorativeField } from "./XRModalDecorativeField";
import type { GameStatus, RoundMetrics, TargetType } from "./types";

const OFFBIT_FONT = "/OffBit-Regular.ttf";

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
      bg: hovered ? "#334155" : "#0f172a",
      outline: "#475569",
      text: "#cbd5e1",
    },
    danger: {
      bg: hovered ? "#e11d48" : "#be123c",
      outline: "#fb7185",
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
        fontSize={0.062}
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

// 3D Visual Rule Badge (Floating dual cards identical to desktop layout)
const XRRuleBadge: React.FC<{
  targetType: TargetType;
  action: "PRESS" | "DO NOT PRESS";
  position: [number, number, number];
}> = ({ targetType, action, position }) => {
  const isSphere = targetType === "sphere";
  const isPress = action === "PRESS";

  return (
    <group position={position}>
      {/* Background card with glass styling */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.34, 0.38]} />
        <meshBasicMaterial
          color={isPress ? (isSphere ? "#083344" : "#4c0519") : "#090d16"}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Border accent outline */}
      <lineSegments position={[0, 0, -0.005]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.35, 0.39)]} />
        <lineBasicMaterial
          color={isPress ? (isSphere ? "#06b6d4" : "#f43f5e") : "#334155"}
          transparent
          opacity={0.5}
        />
      </lineSegments>

      {/* Target visual icon: small 3D sphere or box */}
      {isSphere ? (
        <mesh position={[-0.48, 0, 0.04]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00bbdd"
            emissiveIntensity={0.85}
            roughness={0.2}
          />
        </mesh>
      ) : (
        <mesh position={[-0.48, 0, 0.04]} rotation={[0.3, 0.4, 0]}>
          <boxGeometry args={[0.11, 0.11, 0.11]} />
          <meshStandardMaterial
            color="#f43f5e"
            emissive="#be123c"
            emissiveIntensity={0.85}
            roughness={0.25}
          />
        </mesh>
      )}

      {/* Label and instruction text */}
      <Text
        position={[-0.32, 0.05, 0.01]}
        fontSize={0.048}
        color="#cbd5e1"
        anchorX="left"
        anchorY="middle"
      >
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
        {/* Decorative Floating Spheres & Cubes Cluster */}
        <XRModalDecorativeField />

        {/* Main Panel Canvas Background */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.3, 2.36]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.94} />
        </mesh>

        {/* Outer ambient glow edge */}
        <lineSegments position={[0, 0, -0.015]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.32, 2.38)]} />
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.35} />
        </lineSegments>

        {/* Eyebrow: AN MNET EXPERIENCE (OffBit font with spaced tracking) */}
        <Text
          position={[0, 0.94, 0.01]}
          font={OFFBIT_FONT}
          fontSize={0.055}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.3}
        >
          AN MNET EXPERIENCE
        </Text>

        {/* Main Brand Title: BrainXR (in authentic OffBit Typography) */}
        <group position={[0, 0.77, 0.01]}>
          <Text
            position={[-0.2, 0, 0]}
            font={OFFBIT_FONT}
            fontSize={0.19}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.05}
          >
            BRAIN
          </Text>
          <Text
            position={[0.24, 0, 0]}
            font={OFFBIT_FONT}
            fontSize={0.19}
            color="#22d3ee"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.05}
          >
            XR
          </Text>
        </group>

        {/* Direction of Attention Description */}
        <Text
          position={[0, 0.58, 0.01]}
          fontSize={0.054}
          color="#cbd5e1"
          anchorX="center"
          anchorY="middle"
        >
          A cognitive test to measure the direction of attention.
        </Text>

        {/* Side-by-Side Dual Round Cards (matching desktop modal structure) */}
        {/* Round 1 Card (Left) */}
        <group position={[-0.78, 0.14, 0]}>
          {/* Card backdrop */}
          <mesh position={[0, -0.07, -0.01]}>
            <planeGeometry args={[1.5, 0.94]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.8} />
          </mesh>
          <lineSegments position={[0, -0.07, -0.005]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(1.51, 0.95)]} />
            <lineBasicMaterial color="#06b6d4" transparent opacity={0.25} />
          </lineSegments>

          <Text position={[-0.64, 0.28, 0.01]} fontSize={0.046} color="#fbbf24" anchorX="left" anchorY="middle" fontWeight="bold">
            ROUND 1 · CPT
          </Text>
          <Text position={[0.64, 0.28, 0.01]} fontSize={0.038} color="#64748b" anchorX="right" anchorY="middle">
            RESPONSE
          </Text>
          <Text position={[-0.64, 0.20, 0.01]} fontSize={0.042} color="#94a3b8" anchorX="left" anchorY="middle">
            Continuous Performance
          </Text>

          <XRRuleBadge
            targetType="sphere"
            action="PRESS"
            position={[0, 0.02, 0]}
          />
          <XRRuleBadge
            targetType="box"
            action="DO NOT PRESS"
            position={[0, -0.38, 0]}
          />
        </group>

        {/* Round 2 Card (Right) */}
        <group position={[0.78, 0.14, 0]}>
          {/* Card backdrop */}
          <mesh position={[0, -0.07, -0.01]}>
            <planeGeometry args={[1.5, 0.94]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.8} />
          </mesh>
          <lineSegments position={[0, -0.07, -0.005]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(1.51, 0.95)]} />
            <lineBasicMaterial color="#a855f7" transparent opacity={0.25} />
          </lineSegments>

          <Text position={[-0.64, 0.28, 0.01]} fontSize={0.046} color="#22d3ee" anchorX="left" anchorY="middle" fontWeight="bold">
            ROUND 2 · SART
          </Text>
          <Text position={[0.64, 0.28, 0.01]} fontSize={0.038} color="#64748b" anchorX="right" anchorY="middle">
            INVERSION
          </Text>
          <Text position={[-0.64, 0.20, 0.01]} fontSize={0.042} color="#94a3b8" anchorX="left" anchorY="middle">
            Sustained Attention to Response
          </Text>

          <XRRuleBadge
            targetType="box"
            action="PRESS"
            position={[0, 0.02, 0]}
          />
          <XRRuleBadge
            targetType="sphere"
            action="DO NOT PRESS"
            position={[0, -0.38, 0]}
          />
        </group>

        {/* Subtext info line */}
        <Text
          position={[0, -0.56, 0.01]}
          fontSize={0.045}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          1 Target at a Time  ·  500ms flash + 700ms fixation  ·  Controller Trigger / Raycast
        </Text>

        {/* Bottom Actions */}
        <group position={[0, -0.84, 0.02]}>
          <XRActionButton
            label="Back to EEG"
            variant="secondary"
            width={0.92}
            height={0.2}
            position={[-0.62, 0, 0]}
            onClick={onExit}
          />
          <XRActionButton
            label="Start Assessment →"
            variant="primary"
            width={1.25}
            height={0.2}
            position={[0.56, 0, 0]}
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
          <planeGeometry args={[1.8, 1.2]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.75} />
        </mesh>
        <Text
          position={[0, 0.12, 0.02]}
          font={OFFBIT_FONT}
          fontSize={0.46}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          {countdown > 0 ? countdown.toString() : "GO"}
        </Text>
        <Text
          position={[0, -0.30, 0.02]}
          fontSize={0.055}
          color="#22d3ee"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
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
        <XRModalDecorativeField />

        {/* Main Panel Canvas Background */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.3, 2.36]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.94} />
        </mesh>

        <lineSegments position={[0, 0, -0.015]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.32, 2.38)]} />
          <lineBasicMaterial color="#fbbf24" transparent opacity={0.45} />
        </lineSegments>

        {/* Eyebrow Badge */}
        <Text
          position={[0, 0.94, 0.01]}
          fontSize={0.052}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.2}
        >
          ROUND 1 COMPLETE
        </Text>

        {/* Heading: TELEMETRY REPORT */}
        <Text
          position={[0, 0.78, 0.01]}
          font={OFFBIT_FONT}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
        >
          TELEMETRY REPORT
        </Text>

        {/* 4 Metric Badges in 3D */}
        <group position={[0, 0.44, 0.01]}>
          {/* Hits */}
          <group position={[-1.1, 0, 0]}>
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[0.66, 0.36]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
            </mesh>
            <Text position={[0, 0.09, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
              HITS (GO)
            </Text>
            <Text position={[0, -0.06, 0.01]} font={OFFBIT_FONT} fontSize={0.09} color="#22d3ee" anchorX="center" anchorY="middle">
              {round1Metrics.goHits.toString()}
            </Text>
          </group>

          {/* False Alarms */}
          <group position={[-0.37, 0, 0]}>
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[0.66, 0.36]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
            </mesh>
            <Text position={[0, 0.09, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
              FALSE ALARMS
            </Text>
            <Text position={[0, -0.06, 0.01]} font={OFFBIT_FONT} fontSize={0.09} color="#f43f5e" anchorX="center" anchorY="middle">
              {round1Metrics.commissions.toString()}
            </Text>
          </group>

          {/* Mean RT */}
          <group position={[0.37, 0, 0]}>
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[0.66, 0.36]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
            </mesh>
            <Text position={[0, 0.09, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
              MEAN RT
            </Text>
            <Text position={[0, -0.06, 0.01]} font={OFFBIT_FONT} fontSize={0.085} color="#fbbf24" anchorX="center" anchorY="middle">
              {`${Math.round(round1Metrics.meanReactionTime)} ms`}
            </Text>
          </group>

          {/* Accuracy */}
          <group position={[1.1, 0, 0]}>
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[0.66, 0.36]} />
              <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
            </mesh>
            <Text position={[0, 0.09, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
              ACCURACY
            </Text>
            <Text position={[0, -0.06, 0.01]} font={OFFBIT_FONT} fontSize={0.09} color="#34d399" anchorX="center" anchorY="middle">
              {`${Math.round(round1Metrics.accuracy)}%`}
            </Text>
          </group>
        </group>

        {/* Rule Reversal Notice */}
        <group position={[0, -0.12, 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[2.8, 0.62]} />
            <meshBasicMaterial color="#1a0b16" transparent opacity={0.88} />
          </mesh>
          <lineSegments position={[0, 0, -0.002]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(2.81, 0.63)]} />
            <lineBasicMaterial color="#f43f5e" transparent opacity={0.4} />
          </lineSegments>

          <Text
            position={[0, 0.22, 0.01]}
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
            position={[-0.7, -0.06, 0]}
          />
          {/* Right: Cyan Sphere -> AVOID */}
          <XRRuleBadge
            targetType="sphere"
            action="DO NOT PRESS"
            position={[0.7, -0.06, 0]}
          />
        </group>

        {/* Continue Button */}
        <group position={[0, -0.74, 0.02]}>
          <XRActionButton
            label="Start Round 2 (SART) →"
            variant="danger"
            width={1.65}
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
        <XRModalDecorativeField />

        {/* Main Panel Canvas Background */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.3, 2.36]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.94} />
        </mesh>

        <lineSegments position={[0, 0, -0.015]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.32, 2.38)]} />
          <lineBasicMaterial color="#34d399" transparent opacity={0.45} />
        </lineSegments>

        {/* Eyebrow */}
        <Text
          position={[0, 0.94, 0.01]}
          fontSize={0.052}
          color="#34d399"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.2}
        >
          BATTERY COMPLETE
        </Text>

        {/* Heading: COGNITIVE REPORT */}
        <Text
          position={[0, 0.78, 0.01]}
          font={OFFBIT_FONT}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
        >
          COGNITIVE REPORT
        </Text>

        {/* Composite Summary Pill */}
        <group position={[0, 0.48, 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[2.5, 0.34]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
          </mesh>
          <Text position={[-0.6, 0.07, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
            COMPOSITE SCORE
          </Text>
          <Text position={[-0.6, -0.06, 0.01]} font={OFFBIT_FONT} fontSize={0.09} color="#ffffff" anchorX="center" anchorY="middle">
            {totalScore.toString()}
          </Text>
          <Text position={[0.6, 0.07, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
            OVERALL ACCURACY
          </Text>
          <Text position={[0.6, -0.06, 0.01]} font={OFFBIT_FONT} fontSize={0.09} color="#34d399" anchorX="center" anchorY="middle">
            {`${Math.round(overallAccuracy)}%`}
          </Text>
        </group>

        {/* Side-by-Side Comparison Columns matching Table */}
        {/* Round 1 (Left) */}
        <group position={[-0.75, -0.04, 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[1.4, 0.62]} />
            <meshBasicMaterial color="#082f49" transparent opacity={0.65} />
          </mesh>
          <Text position={[0, 0.23, 0.01]} fontSize={0.052} color="#38bdf8" anchorX="center" anchorY="middle" fontWeight="bold">
            ROUND 1 (CPT)
          </Text>
          <Text position={[-0.58, 0.11, 0.01]} fontSize={0.04} color="#cbd5e1" anchorX="left" anchorY="middle">
            {`Target: Cyan Sphere`}
          </Text>
          <Text position={[-0.58, 0.03, 0.01]} fontSize={0.04} color="#ffffff" anchorX="left" anchorY="middle">
            {`Go Hits: ${round1Metrics.goHits}`}
          </Text>
          <Text position={[-0.58, -0.05, 0.01]} fontSize={0.04} color="#fb7185" anchorX="left" anchorY="middle">
            {`False Alarms: ${round1Metrics.commissions}`}
          </Text>
          <Text position={[-0.58, -0.13, 0.01]} fontSize={0.04} color="#fbbf24" anchorX="left" anchorY="middle">
            {`Mean RT: ${Math.round(round1Metrics.meanReactionTime)} ms`}
          </Text>
          <Text position={[-0.58, -0.21, 0.01]} fontSize={0.04} color="#34d399" anchorX="left" anchorY="middle">
            {`Accuracy: ${Math.round(round1Metrics.accuracy)}%`}
          </Text>
        </group>

        {/* Round 2 (Right) */}
        <group position={[0.75, -0.04, 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[1.4, 0.62]} />
            <meshBasicMaterial color="#3b0764" transparent opacity={0.65} />
          </mesh>
          <Text position={[0, 0.23, 0.01]} fontSize={0.052} color="#c084fc" anchorX="center" anchorY="middle" fontWeight="bold">
            ROUND 2 (SART)
          </Text>
          <Text position={[-0.58, 0.11, 0.01]} fontSize={0.04} color="#cbd5e1" anchorX="left" anchorY="middle">
            {`Target: Red Box`}
          </Text>
          <Text position={[-0.58, 0.03, 0.01]} fontSize={0.04} color="#ffffff" anchorX="left" anchorY="middle">
            {`Go Hits: ${round2Metrics.goHits}`}
          </Text>
          <Text position={[-0.58, -0.05, 0.01]} fontSize={0.04} color="#fb7185" anchorX="left" anchorY="middle">
            {`False Alarms: ${round2Metrics.commissions}`}
          </Text>
          <Text position={[-0.58, -0.13, 0.01]} fontSize={0.04} color="#fbbf24" anchorX="left" anchorY="middle">
            {`Mean RT: ${Math.round(round2Metrics.meanReactionTime)} ms`}
          </Text>
          <Text position={[-0.58, -0.21, 0.01]} fontSize={0.04} color="#34d399" anchorX="left" anchorY="middle">
            {`Accuracy: ${Math.round(round2Metrics.accuracy)}%`}
          </Text>
        </group>

        {/* Action Buttons */}
        <group position={[0, -0.68, 0.02]}>
          <XRActionButton
            label="Test Again"
            variant="secondary"
            width={0.92}
            height={0.2}
            position={[-0.58, 0, 0]}
            onClick={onRestart}
          />
          <XRActionButton
            label="Return to EEG"
            variant="emerald"
            width={1.15}
            height={0.2}
            position={[0.58, 0, 0]}
            onClick={onExit}
          />
        </group>
      </group>
    );
  }

  return null;
};
