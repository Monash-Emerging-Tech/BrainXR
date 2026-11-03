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

  // Baked materials memoized for zero GC/allocation overhead during render cycles
  const glassBackingMat = React.useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#020617",
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    []
  );

  const screenMat = React.useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [texture]
  );

  const borderMat = React.useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#38bdf8",
        transparent: true,
        opacity: 0.45,
      }),
    []
  );

  return (
    <group position={position} name="xr-aimlabs-canvas-screen">
      {/* 1. Subtle Glass Backing */}
      {!isGameplay && (
        <mesh position={[0, 0, -0.005]} material={glassBackingMat}>
          <planeGeometry args={[width + 0.04, height + 0.04]} />
        </mesh>
      )}

      {/* 2. Main Canvas Texture Screen Plane */}
      <mesh
        position={[0, 0, 0]}
        material={screenMat}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerOut={onPointerOut}
      >
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* 3. Outer Neon Accent Border for Modals */}
      {!isGameplay && (
        <lineSegments position={[0, 0, 0.002]} material={borderMat}>
          <edgesGeometry args={[new THREE.PlaneGeometry(width, height)]} />
        </lineSegments>
      )}
    </group>
  );
};
