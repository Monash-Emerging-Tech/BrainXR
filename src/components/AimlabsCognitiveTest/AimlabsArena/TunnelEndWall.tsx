import { useMemo } from "react";
import * as THREE from "three";
import { buildTunnelEndWallGridVertices, buildTunnelEndWallBorderVertices } from "./tunnelEndWallGeometry";

interface TunnelEndWallProps {
  z: number;
  width: number;
  height: number;
  wallWidthMultiplier?: number;
  wallHeightMultiplier?: number;
  isFarWall?: boolean;
}

/**
 * End wall capping the corridor in solid black to guarantee WebXR sensory occlusion,
 * while continuing the tunnel's 16:9 orthogonal wireframe lines seamlessly across the wall in white.
 */
export function TunnelEndWall({
  z,
  width,
  height,
  wallWidthMultiplier = 2.5,
  wallHeightMultiplier = 2.5,
  isFarWall = true,
}: TunnelEndWallProps) {
  const wallW = width * wallWidthMultiplier;
  const wallH = height * wallHeightMultiplier;
  const halfWallW = wallW / 2;
  const halfWallH = wallH / 2;

  const halfW = width / 2;
  const halfH = height / 2;

  const Nx = 16;
  const Ny = 9;
  const w = width / Nx;
  const h = height / Ny;

  const gridPositions = useMemo(
    () => buildTunnelEndWallGridVertices(halfW, halfH, halfWallW, halfWallH, w, h),
    [halfW, halfH, halfWallW, halfWallH, w, h]
  );

  const borderPositions = useMemo(
    () => buildTunnelEndWallBorderVertices(halfW, halfH),
    [halfW, halfH]
  );

  // Offset lines 0.1m in front of the black plane towards the viewer at z = 0
  const lineZ = isFarWall ? z + 0.1 : z - 0.1;

  return (
    <group>
      {/* Solid Black Opaque Backing Wall */}
      <mesh position={[0, 0, z]} renderOrder={-999}>
        <planeGeometry args={[wallW, wallH]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>

      {/* White Wireframe Grid continuing from corridor walls onto the black wall */}
      <lineSegments position={[0, 0, lineZ]} renderOrder={-998} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[gridPositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.55}
          linewidth={1}
          fog={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </lineSegments>

      {/* Prominent White Corridor Aperture Frame */}
      <lineSegments position={[0, 0, lineZ + (isFarWall ? 0.01 : -0.01)]} renderOrder={-997} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[borderPositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.85}
          linewidth={1}
          fog={false}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </lineSegments>
    </group>
  );
}
