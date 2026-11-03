import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Reflector } from "three-stdlib";

/**
 * Palette for the white-themed portal experience.
 * Active tiles appear as crisp/glowing white, while inactive tiles are set to #000000
 * so they disappear into the dark #0d0d10 cosmic void.
 */
const WHITE_TILES_PALETTE = [
  new THREE.Color("#ffffff"), // Pure luminous white
  new THREE.Color("#ffffff"), // Pure luminous white (emphasize bright tiles)
  new THREE.Color("#f8fafc"), // Crisp bright white
  new THREE.Color("#f1f5f9"), // Clean off-white
  new THREE.Color("#cbd5e1"), // Soft silver white
  new THREE.Color("#000000"), // Inactive / disappeared into background void
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
];

/**
 * Rare jewel accent colors matching the exact canonical design system hues used across the site:
 * - Emerald: #34d399 (matches BrainModel, TrialProgressBar, TopHudBar, and RT feedback)
 * - Purple:  #c084fc (matches stamp gradient, DoubleVisionFocusText, and OnboardingFlow violet/purple)
 * - Cyan:    #22d3ee (matches AimlabsModals, renderHUD, CognitiveReportDashboard, and OnboardingFlow)
 * - Red:     #f43f5e (matches AimlabsTarget, AimlabsHUD, TelemetryPerformanceGraph, and RT feedback)
 * Making up a cumulative ~1% of all active tiles.
 */
const RARE_ACCENT_COLORS = [
  new THREE.Color("#34d399"), // Emerald (site canonical)
  new THREE.Color("#c084fc"), // Purple / Violet (site canonical)
  new THREE.Color("#22d3ee"), // Cyan (site canonical)
  new THREE.Color("#f43f5e"), // Red / Rose (site canonical)
];

/**
 * Returns a random tile color: ~1% chance for rare accent colors (emerald, purple, cyan, red),
 * and ~99% chance for the white/disappearing-void palette.
 */
function getRandomTileColor(): THREE.Color {
  if (Math.random() < 0.01) {
    const rareIdx = Math.floor(Math.random() * RARE_ACCENT_COLORS.length);
    return RARE_ACCENT_COLORS[rareIdx];
  }
  const whiteIdx = Math.floor(Math.random() * WHITE_TILES_PALETTE.length);
  return WHITE_TILES_PALETTE[whiteIdx];
}

interface RoomSegmentProps {
  initialZ: number;
  depthSegment: number;
  totalLength: number;
  speed: number;
  width?: number;
  height?: number;
}

function RoomSegment({
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
  const positions = useMemo(() => {
    const vertices: number[] = [];
    const halfW = W / 2;
    const halfH = H / 2;
    const halfD = depthSegment / 2;

    // 1. Longitudinal lines running along Z axis (length of the room)
    // Floor & Ceiling lines
    for (let i = 0; i <= Nx; i++) {
      const x = -halfW + (i / Nx) * W;
      // Floor longitudinal line
      vertices.push(x, -halfH, -halfD, x, -halfH, halfD);
      // Ceiling longitudinal line
      vertices.push(x, halfH, -halfD, x, halfH, halfD);
    }

    // Left & Right Wall lines
    for (let i = 0; i <= Ny; i++) {
      const y = -halfH + (i / Ny) * H;
      // Left wall longitudinal line
      vertices.push(-halfW, y, -halfD, -halfW, y, halfD);
      // Right wall longitudinal line
      vertices.push(halfW, y, -halfD, halfW, y, halfD);
    }

    // 2. Transverse rings (cross sections along X-Y plane at different Z offsets)
    for (let i = 1; i <= Nz; i++) {
      const z = -halfD + (i / Nz) * depthSegment;
      // Horizontal floor transverse line
      vertices.push(-halfW, -halfH, z, halfW, -halfH, z);
      // Horizontal ceiling transverse line
      vertices.push(-halfW, halfH, z, halfW, halfH, z);
      // Vertical left wall transverse line
      vertices.push(-halfW, -halfH, z, -halfW, halfH, z);
      // Vertical right wall transverse line
      vertices.push(halfW, -halfH, z, halfW, halfH, z);
    }

    return new Float32Array(vertices);
  }, [depthSegment, W, H]);

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

interface MirrorWallProps {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
}

const MirrorWall: React.FC<MirrorWallProps> = ({ position, rotation, width, height }) => {
  const reflector = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height);
    const ref = new Reflector(geo, {
      clipBias: 0.003,
      textureWidth: 1024,
      textureHeight: 1024,
      color: new THREE.Color("#444444"),
    });
    return ref;
  }, [width, height]);

  useEffect(() => {
    return () => {
      reflector.geometry.dispose();
      if (reflector.material instanceof THREE.Material) {
        reflector.material.dispose();
      }
      reflector.getRenderTarget().dispose();
    };
  }, [reflector]);

  return (
    <primitive
      object={reflector}
      position={position}
      rotation={rotation}
      raycast={() => null}
    />
  );
};

interface AimlabsArenaProps {
  speed?: number;
  width?: number;
  height?: number;
}

export const AimlabsArena: React.FC<AimlabsArenaProps> = ({
  speed = 3.5,
  height = 14,
  width = (14 * 16) / 9, // Exact 16:9 aspect ratio (~24.89 for height 14)
}) => {
  const { scene } = useThree();

  // Set dark background & deep space fog while the portal experience is active
  useEffect(() => {
    const prevBackground = scene.background;
    const prevFog = scene.fog;

    scene.background = new THREE.Color("#000000");
    scene.fog = new THREE.Fog("#000000", 20, 85);

    return () => {
      scene.background = prevBackground;
      scene.fog = prevFog;
    };
  }, [scene]);

  return (
    <group name="brainxr-portal-arena">
      {/* Ambient Fill Light */}
      <ambientLight intensity={0.5} color="#ffffff" />

      {/* Top Key Directional Light */}
      <directionalLight
        position={[0, 8, 2]}
        intensity={1.2}
        color="#ffffff"
      />

      {/* Perimeter Portal Accent Lights */}
      <pointLight
        position={[-9.5, 4, 0]}
        intensity={3.2}
        color="#ffffff"
        decay={1.5}
        distance={30}
      />
      <pointLight
        position={[9.5, 4, 0]}
        intensity={3.2}
        color="#ffffff"
        decay={1.5}
        distance={30}
      />

      {/* Target Zone Focal Fill Light */}
      <pointLight
        position={[0, 2.5, -4.0]}
        intensity={1.2}
        color="#ffffff"
        decay={2}
        distance={10}
      />

      {/*
        4-Segment Continuous Zooming Corridor Tunnel.
        Centered at y = 1.6 so the vanishing point converges directly behind the central target.
        Rectangle cross-section: 16:9 Aspect Ratio (Width: 24.89, Height: 14).
        Extends 120m in length with seamless wrapping behind the viewer.
      */}
      <group position={[0, 1.6, 0]}>
        {/* Reflective mirror end wall (far horizon behind targets) */}
        <MirrorWall position={[0, 0, -90]} rotation={[0, 0, 0]} width={width + 4} height={height + 4} />

        {/* Reflective mirror start wall (behind player/viewer) */}
        <MirrorWall position={[0, 0, 31]} rotation={[0, Math.PI, 0]} width={width + 4} height={height + 4} />

        <RoomSegment initialZ={15} depthSegment={30} totalLength={120} speed={speed} width={width} height={height} />
        <RoomSegment initialZ={-15} depthSegment={30} totalLength={120} speed={speed} width={width} height={height} />
        <RoomSegment initialZ={-45} depthSegment={30} totalLength={120} speed={speed} width={width} height={height} />
        <RoomSegment initialZ={-75} depthSegment={30} totalLength={120} speed={speed} width={width} height={height} />
      </group>
    </group>
  );
};

export { AimlabsArena as PortalArena, AimlabsArena as ZoomingPortalArena };
