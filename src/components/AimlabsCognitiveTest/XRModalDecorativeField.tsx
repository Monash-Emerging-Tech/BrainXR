import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface DecorativeItem {
  type: "sphere" | "box";
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  emissive: string;
  speed: number;
  rotationSpeed: [number, number, number];
  baseY: number;
}

const DECORATIVE_ITEMS: DecorativeItem[] = [
  // Left side cluster
  {
    type: "sphere",
    position: [-2.1, 1.3, -0.4],
    scale: [0.38, 0.38, 0.38],
    color: "#0284c7",
    emissive: "#0369a1",
    speed: 0.8,
    rotationSpeed: [0, 0, 0],
    baseY: 1.3,
  },
  {
    type: "box",
    position: [-2.2, 0.4, -0.3],
    scale: [0.24, 0.24, 0.24],
    color: "#be123c",
    emissive: "#881337",
    speed: 1.1,
    rotationSpeed: [0.6, 0.8, 0.3],
    baseY: 0.4,
  },
  {
    type: "sphere",
    position: [-1.9, -0.6, -0.2],
    scale: [0.22, 0.22, 0.22],
    color: "#38bdf8",
    emissive: "#0284c7",
    speed: 0.9,
    rotationSpeed: [0, 0, 0],
    baseY: -0.6,
  },
  {
    type: "box",
    position: [-2.0, -1.0, -0.5],
    scale: [0.32, 0.32, 0.32],
    color: "#9f1239",
    emissive: "#4c0519",
    speed: 0.7,
    rotationSpeed: [0.4, 0.5, 0.2],
    baseY: -1.0,
  },

  // Right side cluster
  {
    type: "box",
    position: [2.1, 1.2, -0.4],
    scale: [0.34, 0.34, 0.34],
    color: "#be123c",
    emissive: "#881337",
    speed: 0.85,
    rotationSpeed: [-0.5, 0.7, 0.4],
    baseY: 1.2,
  },
  {
    type: "sphere",
    position: [2.2, 0.3, -0.3],
    scale: [0.25, 0.25, 0.25],
    color: "#0284c7",
    emissive: "#0369a1",
    speed: 1.2,
    rotationSpeed: [0, 0, 0],
    baseY: 0.3,
  },
  {
    type: "box",
    position: [1.9, -0.5, -0.2],
    scale: [0.22, 0.22, 0.22],
    color: "#e11d48",
    emissive: "#9f1239",
    speed: 0.95,
    rotationSpeed: [0.6, -0.6, 0.3],
    baseY: -0.5,
  },
  {
    type: "sphere",
    position: [2.1, -1.1, -0.5],
    scale: [0.42, 0.42, 0.42],
    color: "#0369a1",
    emissive: "#075985",
    speed: 0.65,
    rotationSpeed: [0, 0, 0],
    baseY: -1.1,
  },
];

export const XRModalDecorativeField: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    groupRef.current.children.forEach((child, index) => {
      const item = DECORATIVE_ITEMS[index];
      if (!item) return;

      // Gentle floating bob
      child.position.y = item.baseY + Math.sin(t * item.speed + index) * 0.04;

      // Gentle rotation drift for cubes
      if (item.type === "box") {
        child.rotation.x += item.rotationSpeed[0] * 0.01;
        child.rotation.y += item.rotationSpeed[1] * 0.01;
        child.rotation.z += item.rotationSpeed[2] * 0.01;
      }
    });
  });

  return (
    <group ref={groupRef} name="xr-modal-decorative-field">
      {DECORATIVE_ITEMS.map((item, i) => (
        <mesh
          key={i}
          position={item.position}
          scale={item.scale}
          raycast={() => null}
        >
          {item.type === "sphere" ? (
            <sphereGeometry args={[1, 32, 32]} />
          ) : (
            <boxGeometry args={[1, 1, 1]} />
          )}
          <meshStandardMaterial
            color={item.color}
            emissive={item.emissive}
            emissiveIntensity={0.35}
            roughness={0.4}
            metalness={0.2}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
};

