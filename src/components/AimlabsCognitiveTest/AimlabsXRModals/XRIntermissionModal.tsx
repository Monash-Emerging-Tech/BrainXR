import React from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { XRModalDecorativeField } from "../XRModalDecorativeField";
import { XRRuleToken } from "./XRRuleToken";
import { XRActionButton } from "./XRActionButton";
import type { RoundMetrics } from "../types";

const OFFBIT_FONT = "/OffBit-Regular.ttf";

interface XRIntermissionModalProps {
  metrics: RoundMetrics;
  onStartRound2: () => void;
}

export const XRIntermissionModal: React.FC<XRIntermissionModalProps> = ({ metrics, onStartRound2 }) => {
  return (
    <group position={[0, 1.6, -3.2]} name="aimlabs-xr-intermission">
      <XRModalDecorativeField />

      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.3, 2.36]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.94} />
      </mesh>

      <lineSegments position={[0, 0, -0.015]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(3.32, 2.38)]} />
        <lineBasicMaterial color="#fbbf24" transparent opacity={0.45} />
      </lineSegments>

      <Text position={[0, 0.94, 0.01]} fontSize={0.052} color="#fbbf24" anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.2}>
        ROUND 1 COMPLETE
      </Text>

      <Text position={[0, 0.78, 0.01]} font={OFFBIT_FONT} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.15}>
        TELEMETRY REPORT
      </Text>

      {/* 4 Metric Badges in 3D */}
      <group position={[0, 0.44, 0.01]}>
        <StatBadge label="HITS (GO)" value={metrics.goHits.toString()} color="#22d3ee" x={-1.1} />
        <StatBadge label="FALSE ALARMS" value={metrics.commissions.toString()} color="#f43f5e" x={-0.37} />
        <StatBadge label="MEAN RT" value={`${Math.round(metrics.meanReactionTime)} ms`} color="#fbbf24" x={0.37} />
        <StatBadge label="ACCURACY" value={`${Math.round(metrics.accuracy)}%`} color="#34d399" x={1.1} />
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

        <Text position={[0, 0.22, 0.01]} fontSize={0.05} color="#fb7185" anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.15}>
          RULE REVERSAL FOR ROUND 2 (SART)
        </Text>

        <XRRuleToken targetType="box" action="PRESS" position={[-0.7, -0.06, 0]} />
        <XRRuleToken targetType="sphere" action="DO NOT PRESS" position={[0.7, -0.06, 0]} />
      </group>

      <group position={[0, -0.74, 0.02]}>
        <XRActionButton label="Start Round 2 (SART) →" variant="danger" width={1.65} height={0.22} position={[0, 0, 0]} onClick={onStartRound2} />
      </group>
    </group>
  );
};

function StatBadge({ label, value, color, x }: { label: string; value: string; color: string; x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[0.66, 0.36]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
      </mesh>
      <Text position={[0, 0.09, 0.01]} fontSize={0.04} color="#94a3b8" anchorX="center" anchorY="middle">
        {label}
      </Text>
      <Text position={[0, -0.06, 0.01]} font={OFFBIT_FONT} fontSize={0.09} color={color} anchorX="center" anchorY="middle">
        {value}
      </Text>
    </group>
  );
}
