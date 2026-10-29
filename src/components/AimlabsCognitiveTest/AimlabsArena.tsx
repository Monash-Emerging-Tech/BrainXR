import React, { useMemo } from "react";
import * as THREE from "three";
import { createCheckerboardFloorTexture, createGridWallTexture } from "./textures";

export const AimlabsArena: React.FC = () => {
  // Procedural Aimlabs textures (re-use instance across renders)
  const floorTexture = useMemo(() => createCheckerboardFloorTexture(), []);
  const wallTexture = useMemo(() => createGridWallTexture(), []);

  // Arena Dimensions (standard Aimlabs grid training box)
  const roomWidth = 24;
  const roomHeight = 14;
  const roomDepth = 24;
  const roomCenterZ = -5; // User stands at Z = 0, targets at Z = -4.5 to -5.0, back wall at Z = -17

  return (
    <group name="brainxr-aimlabs-arena">
      {/* Dynamic Aimlabs Crisp Lighting */}
      <ambientLight intensity={1.1} color="#f0f4f8" />
      <directionalLight
        position={[0, 8, 2]}
        intensity={1.8}
        color="#ffffff"
        castShadow
      />
      {/* Front fill light */}
      <pointLight
        position={[0, 3, -1]}
        intensity={0.8}
        distance={15}
        decay={2}
        color="#e2e8f0"
      />
      {/* Soft cyan / indigo back accent lighting */}
      <pointLight
        position={[0, 2, -14]}
        intensity={0.6}
        distance={12}
        decay={2}
        color="#38bdf8"
      />

      {/* ================= FLOOR ================= */}
      {/* Iconic Aimlabs light grey & white checkered floor tiles */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, roomCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial
          map={floorTexture}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Red accent firing line on floor at user standing point */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, -0.6]}
      >
        <planeGeometry args={[roomWidth * 0.7, 0.08]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.65} />
      </mesh>

      {/* Target focal zone floor ring accent */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, -4.5]}
      >
        <ringGeometry args={[1.4, 1.45, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </mesh>

      {/* ================= BACK WALL ================= */}
      {/* Dark slate panel target wall */}
      <mesh position={[0, roomHeight / 2, roomCenterZ - roomDepth / 2]}>
        <planeGeometry args={[roomWidth, roomHeight]} />
        <meshStandardMaterial
          map={wallTexture}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Cyan LED accent trim along top & bottom of back wall */}
      <mesh position={[0, 0.04, roomCenterZ - roomDepth / 2 + 0.02]}>
        <boxGeometry args={[roomWidth, 0.08, 0.04]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      <mesh position={[0, roomHeight - 0.04, roomCenterZ - roomDepth / 2 + 0.02]}>
        <boxGeometry args={[roomWidth, 0.08, 0.04]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* ================= LEFT WALL ================= */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-roomWidth / 2, roomHeight / 2, roomCenterZ]}
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial
          map={wallTexture}
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* Left Wall Baseboard Accent Strip */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-roomWidth / 2 + 0.02, 0.04, roomCenterZ]}
      >
        <boxGeometry args={[roomDepth, 0.08, 0.04]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>

      {/* ================= RIGHT WALL ================= */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[roomWidth / 2, roomHeight / 2, roomCenterZ]}
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial
          map={wallTexture}
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* Right Wall Baseboard Accent Strip */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[roomWidth / 2 - 0.02, 0.04, roomCenterZ]}
      >
        <boxGeometry args={[roomDepth, 0.08, 0.04]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>

      {/* ================= CEILING ================= */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, roomHeight, roomCenterZ]}
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial
          color="#151922"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Ceiling Long Light Panels (Aimlabs Overhead Fixtures) */}
      {[-3.5, 0, 3.5].map((xOffset, idx) => (
        <group key={idx} position={[xOffset, roomHeight - 0.05, roomCenterZ]}>
          <mesh>
            <boxGeometry args={[1.0, 0.08, roomDepth * 0.7]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

