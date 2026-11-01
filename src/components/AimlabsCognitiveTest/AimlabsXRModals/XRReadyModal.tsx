import React from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { XRModalDecorativeField } from "../XRModalDecorativeField";
import { XRRuleToken } from "./XRRuleToken";
import { XRActionButton } from "./XRActionButton";

const OFFBIT_FONT = "/OffBit-Regular.ttf";

interface XRReadyModalProps {
  onStartGame: () => void;
  onExit: () => void;
}

export const XRReadyModal: React.FC<XRReadyModalProps> = ({ onStartGame, onExit }) => {
  return (
    <group position={[0, 1.6, -3.2]} name="aimlabs-xr-ready-modal">
      <XRModalDecorativeField />

      {/* Main Backing Glass Plane */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.3, 2.36]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.94} />
      </mesh>

      <lineSegments position={[0, 0, -0.015]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(3.32, 2.38)]} />
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </lineSegments>

      {/* Eyebrow */}
      <Text position={[0, 0.94, 0.01]} font={OFFBIT_FONT} fontSize={0.055} color="#94a3b8" anchorX="center" anchorY="middle" letterSpacing={0.3}>
        AN MNET EXPERIENCE
      </Text>

      {/* Title */}
      <group position={[0, 0.77, 0.01]}>
        <Text position={[-0.2, 0, 0]} font={OFFBIT_FONT} fontSize={0.19} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.05}>
          BRAIN
        </Text>
        <Text position={[0.24, 0, 0]} font={OFFBIT_FONT} fontSize={0.19} color="#22d3ee" anchorX="center" anchorY="middle" letterSpacing={0.05}>
          XR
        </Text>
      </group>

      <Text position={[0, 0.58, 0.01]} fontSize={0.054} color="#cbd5e1" anchorX="center" anchorY="middle">
        A cognitive test to measure the direction of attention.
      </Text>

      {/* Round 1 Card (Tilted 7 degrees inward for ergonomic stereoscopic reading) */}
      <group position={[-0.8, 0.14, 0.05]} rotation={[0, 0.12, 0]}>
        <mesh position={[0, -0.07, -0.01]}>
          <planeGeometry args={[1.5, 0.94]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.85} />
        </mesh>
        <lineSegments position={[0, -0.07, -0.005]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(1.51, 0.95)]} />
          <lineBasicMaterial color="#06b6d4" transparent opacity={0.3} />
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

        <XRRuleToken targetType="sphere" action="PRESS" position={[0, 0.02, 0]} />
        <XRRuleToken targetType="box" action="DO NOT PRESS" position={[0, -0.38, 0]} />
      </group>

      {/* Round 2 Card (Tilted 7 degrees inward) */}
      <group position={[0.8, 0.14, 0.05]} rotation={[0, -0.12, 0]}>
        <mesh position={[0, -0.07, -0.01]}>
          <planeGeometry args={[1.5, 0.94]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.85} />
        </mesh>
        <lineSegments position={[0, -0.07, -0.005]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(1.51, 0.95)]} />
          <lineBasicMaterial color="#a855f7" transparent opacity={0.3} />
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

        <XRRuleToken targetType="box" action="PRESS" position={[0, 0.02, 0]} />
        <XRRuleToken targetType="sphere" action="DO NOT PRESS" position={[0, -0.38, 0]} />
      </group>

      <Text position={[0, -0.56, 0.01]} fontSize={0.045} color="#94a3b8" anchorX="center" anchorY="middle">
        1 Target at a Time · 500ms flash + 700ms fixation · Controller Trigger / Raycast
      </Text>

      {/* Tactile Action Buttons */}
      <group position={[0, -0.84, 0.02]}>
        <XRActionButton label="Back to EEG" variant="secondary" width={0.92} height={0.2} position={[-0.62, 0, 0]} onClick={onExit} />
        <XRActionButton label="Start Assessment →" variant="primary" width={1.25} height={0.2} position={[0.56, 0, 0]} onClick={onStartGame} />
      </group>
    </group>
  );
};
