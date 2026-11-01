import React from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

interface XRCanvasScreenMeshProps {
  texture: THREE.CanvasTexture | null;
  isGameplay: boolean;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
}

export const XRCanvasScreenMesh: React.FC<XRCanvasScreenMeshProps> = ({
  texture,
  isGameplay,
  onPointerDown,
  onPointerMove,
  onPointerOut,
}) => {
  if (!texture) return null;

  // Position: overhead sightline during gameplay, center eye-height during modals
  const position: [number, number, number] = isGameplay
    ? [0, 3.2, -4.5]
    : [0, 1.6, -3.2];

  const width = isGameplay ? 3.6 : 3.2;
  const height = isGameplay ? 2.025 : 1.8;

  return (
    <group position={position} name="xr-aimlabs-canvas-screen">
      {/* 1. Subtle Glass Backing */}
      {!isGameplay && (
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[width + 0.04, height + 0.04]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.6} />
        </mesh>
      )}

      {/* 2. Main Canvas Texture Screen Plane */}
      <mesh
        position={[0, 0, 0]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerOut={onPointerOut}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Outer Neon Accent Border for Modals */}
      {!isGameplay && (
        <lineSegments position={[0, 0, 0.002]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(width, height)]} />
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </lineSegments>
      )}
    </group>
  );
};
