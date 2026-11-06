import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getRandomTileColor } from "./tileColors";
import { buildRoomWireframeVertices } from "./roomWireframe";

interface RoomSegmentProps {
  initialZ: number;
  depthSegment: number;
  totalLength: number;
  speed: number;
  width?: number;
  height?: number;
}

export function RoomSegment({
  initialZ,
  depthSegment,
  totalLength,
  speed,
  height = 14,
  width = (14 * 16) / 9, // Exact 16:9 aspect ratio (~24.89 for height 14)
}: RoomSegmentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const W = width;
  const H = height;
  const Nx = 16; // segments across width (16:9 grid)
  const Ny = 9;  // segments across height (16:9 grid)
  const Nz = 16; // segments along depth

  // Generate clean orthogonal line vertices (no diagonal triangles)
  const positions = useMemo(
    () => buildRoomWireframeVertices(W, H, depthSegment, Nx, Ny, Nz),
    [depthSegment, W, H]
  );

  // Compute total number of panels
  const numFloorCeil = Nx * Nz;
  const numWalls = Ny * Nz;
  const totalInstances = (numFloorCeil * 2) + (numWalls * 2);

  // Position, scale, and rotate all instances once when mounted
  useEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const w = W / Nx;
    const h = H / Ny;
    const d = depthSegment / Nz;
    const halfW = W / 2;
    const halfH = H / 2;
    const halfD = depthSegment / 2;

    let index = 0;

    // Helper to configure an instance
    const setInstance = (
      posX: number,
      posY: number,
      posZ: number,
      rotX: number,
      rotY: number,
      scaleX: number,
      scaleY: number
    ) => {
      dummy.position.set(posX, posY, posZ);
      dummy.rotation.set(rotX, rotY, 0);
      dummy.scale.set(scaleX, scaleY, 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(index, dummy.matrix);
      meshRef.current!.setColorAt(index, getRandomTileColor());
      index++;
    };

    // 1. Floor panels (lying flat, facing +Y)
    for (let i = 0; i < Nx; i++) {
      const x = -halfW + (i + 0.5) * w;
      for (let k = 0; k < Nz; k++) {
        const z = -halfD + (k + 0.5) * d;
        setInstance(x, -halfH, z, -Math.PI / 2, 0, w, d);
      }
    }

    // 2. Ceiling panels (lying flat, facing -Y)
    for (let i = 0; i < Nx; i++) {
      const x = -halfW + (i + 0.5) * w;
      for (let k = 0; k < Nz; k++) {
        const z = -halfD + (k + 0.5) * d;
        setInstance(x, halfH, z, Math.PI / 2, 0, w, d);
      }
    }

    // 3. Left wall panels (standing, facing +X)
    for (let j = 0; j < Ny; j++) {
      const y = -halfH + (j + 0.5) * h;
      for (let k = 0; k < Nz; k++) {
        const z = -halfD + (k + 0.5) * d;
        setInstance(-halfW, y, z, 0, Math.PI / 2, d, h);
      }
    }

    // 4. Right wall panels (standing, facing -X)
    for (let j = 0; j < Ny; j++) {
      const y = -halfH + (j + 0.5) * h;
      for (let k = 0; k < Nz; k++) {
        const z = -halfD + (k + 0.5) * d;
        setInstance(halfW, y, z, 0, -Math.PI / 2, d, h);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [depthSegment, W, H, totalInstances]);

  // Track mount time for smooth fade-in
  const mountTime = useRef<number | null>(null);
  const timeSinceLastSwitch = useRef(0);

  useFrame((state, delta) => {
    // 1. Zoom motion along +Z towards player
    if (groupRef.current) {
      groupRef.current.position.z += speed * delta;

      // Wrap segment dynamically when its back edge passes behind the player
      const halfDepth = depthSegment / 2;
      if (groupRef.current.position.z - halfDepth > 15) {
        groupRef.current.position.z -= totalLength;
      }
    }

    // 2. Smooth fade-in of panels on mount
    if (mountTime.current === null) {
      mountTime.current = state.clock.getElapsedTime();
    }
    const elapsed = state.clock.getElapsedTime() - mountTime.current;
    const progress = Math.min(1, Math.max(0, elapsed / 1.5));

    if (meshRef.current?.material) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.transparent = true;
      mat.opacity = progress * 0.85;
    }

    // 3. Lively appearance and disappearance of white tiles + rare jewel accents
    timeSinceLastSwitch.current += delta;
    if (timeSinceLastSwitch.current > 0.08) { // Update every 80ms
      timeSinceLastSwitch.current = 0;
      if (meshRef.current) {
        // Change color of ~3.5% of instances randomly (white appearing/disappearing + emerald/purple/cyan/red)
        const count = Math.max(1, Math.floor(totalInstances * 0.035));
        for (let c = 0; c < count; c++) {
          const idx = Math.floor(Math.random() * totalInstances);
          meshRef.current.setColorAt(idx, getRandomTileColor());
        }
        if (meshRef.current.instanceColor) {
          meshRef.current.instanceColor.needsUpdate = true;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, initialZ]}>
      {/* Solid White / Disappearing Void Panels */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalInstances]}
        raycast={() => null}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          side={THREE.DoubleSide}
          transparent
          opacity={0} // Starts at 0, smoothly transitions to 0.85
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </instancedMesh>

      {/* Wireframe separation lines */}
      <lineSegments raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          linewidth={1}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </lineSegments>
    </group>
  );
}
