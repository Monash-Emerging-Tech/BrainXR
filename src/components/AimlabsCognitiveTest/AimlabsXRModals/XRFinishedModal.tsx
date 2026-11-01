import React from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { XRModalDecorativeField } from "../XRModalDecorativeField";
import { XRActionButton } from "./XRActionButton";
import type { RoundMetrics } from "../types";

const OFFBIT_FONT = "/OffBit-Regular.ttf";

interface XRFinishedModalProps {
  round1Metrics: RoundMetrics;
  round2Metrics: RoundMetrics;
  onRestart: () => void;
  onExit: () => void;
}

export const XRFinishedModal: React.FC<XRFinishedModalProps> = ({
  round1Metrics: r1,
  round2Metrics: r2,
  onRestart,
  onExit,
}) => {
  const totalScore = r1.score + r2.score;
  const overallAcc = (r1.accuracy + r2.accuracy) / 2;

  return (
    <group position={[0, 1.6, -3.2]} name="aimlabs-xr-finished">
      <XRModalDecorativeField />

      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.3, 2.36]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.94} />
      </mesh>

      <lineSegments position={[0, 0, -0.015]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(3.32, 2.38)]} />
        <lineBasicMaterial color="#34d399" transparent opacity={0.45} />
      </lineSegments>

      <Text position={[0, 0.94, 0.01]} fontSize={0.052} color="#34d399" anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.2}>
        BATTERY COMPLETE
      </Text>

      <Text position={[0, 0.78, 0.01]} font={OFFBIT_FONT} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.15}>
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
          {`${Math.round(overallAcc)}%`}
        </Text>
      </group>

      {/* Comparison Pillars */}
      <ComparisonColumn title="ROUND 1 (CPT)" metrics={r1} color="#38bdf8" x={-0.75} isRound1 />
      <ComparisonColumn title="ROUND 2 (SART)" metrics={r2} color="#c084fc" x={0.75} isRound1={false} />

      {/* Action Buttons */}
      <group position={[0, -0.68, 0.02]}>
        <XRActionButton label="Test Again" variant="secondary" width={0.92} height={0.2} position={[-0.58, 0, 0]} onClick={onRestart} />
        <XRActionButton label="Return to EEG" variant="emerald" width={1.15} height={0.2} position={[0.58, 0, 0]} onClick={onExit} />
      </group>
    </group>
  );
};

function ComparisonColumn({ title, metrics, color, x, isRound1 }: { title: string; metrics: RoundMetrics; color: string; x: number; isRound1: boolean }) {
  return (
    <group position={[x, -0.04, 0.01]}>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[1.4, 0.62]} />
        <meshBasicMaterial color={isRound1 ? "#082f49" : "#3b0764"} transparent opacity={0.65} />
      </mesh>
      <Text position={[0, 0.23, 0.01]} fontSize={0.052} color={color} anchorX="center" anchorY="middle" fontWeight="bold">
        {title}
      </Text>
      <Text position={[-0.58, 0.11, 0.01]} fontSize={0.04} color="#cbd5e1" anchorX="left" anchorY="middle">
        {`Target: ${isRound1 ? "Cyan Sphere" : "Red Box"}`}
      </Text>
      <Text position={[-0.58, 0.03, 0.01]} fontSize={0.04} color="#ffffff" anchorX="left" anchorY="middle">
        {`Go Hits: ${metrics.goHits}`}
      </Text>
      <Text position={[-0.58, -0.05, 0.01]} fontSize={0.04} color="#fb7185" anchorX="left" anchorY="middle">
        {`False Alarms: ${metrics.commissions}`}
      </Text>
      <Text position={[-0.58, -0.13, 0.01]} fontSize={0.04} color="#fbbf24" anchorX="left" anchorY="middle">
        {`Mean RT: ${Math.round(metrics.meanReactionTime)} ms`}
      </Text>
      <Text position={[-0.58, -0.21, 0.01]} fontSize={0.04} color="#34d399" anchorX="left" anchorY="middle">
        {`Accuracy: ${Math.round(metrics.accuracy)}%`}
      </Text>
    </group>
  );
}
