import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { TargetType } from "./types";

export interface ShatterBurstData {
  id: string;
  type: TargetType;
  position: [number, number, number];
  startTime: number;
}

interface Shard {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Euler;
}

const ShardBurst: React.FC<{
  type: TargetType;
  position: [number, number, number];
  onDone: () => void;
}> = ({ type, position, onDone }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ageRef = useRef(0);

  const shards = useMemo<Shard[]>(() => {
    const list: Shard[] = [];
    const isSphere = type === "sphere";
    const count = 10;

    for (let i = 0; i < count; i++) {
      let geo: THREE.BufferGeometry;
      let mat: THREE.Material;

      if (isSphere) {
        geo = new THREE.CylinderGeometry(
          0.28,
          0.28,
          0.08,
          8,
          1,
          false,
          (i * Math.PI * 2) / count,
          (Math.PI * 2) / (count * 1.2)
        );
        mat = new THREE.MeshStandardMaterial({
          color: "#00f0ff",
          emissive: "#0088bb",
          emissiveIntensity: 0.8,
          roughness: 0.2,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide,
        });
      } else {
        const s = 0.12 + Math.random() * 0.08;
        geo = new THREE.BoxGeometry(s, s, s);
        mat = new THREE.MeshStandardMaterial({
          color: "#f43f5e",
          emissive: "#9f1239",
          emissiveIntensity: 0.8,
          roughness: 0.3,
          transparent: true,
          opacity: 1,
        });
      }

      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 2.0 + Math.random() * 2.2;
      const vy = 1.2 + Math.random() * 2.0;
      const vx = Math.cos(angle) * speed;
      const vz = Math.sin(angle) * speed * 0.5;

      list.push({
        mesh,
        velocity: new THREE.Vector3(vx, vy, vz),
        rotVelocity: new THREE.Euler(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ),
      });
    }
    return list;
  }, [type]);

  useFrame((_, delta) => {
    ageRef.current += delta;
    const age = ageRef.current;
    const duration = 0.6;

    if (age >= duration) {
      onDone();
      return;
    }

    const t = age / duration;
    const opacity = Math.max(0, 1 - t * t);

    for (const s of shards) {
      s.velocity.y -= 9.8 * delta * 0.6;
      s.mesh.position.x += s.velocity.x * delta;
      s.mesh.position.y += s.velocity.y * delta;
      s.mesh.position.z += s.velocity.z * delta;

      s.mesh.rotation.x += s.rotVelocity.x * delta;
      s.mesh.rotation.y += s.rotVelocity.y * delta;
      s.mesh.rotation.z += s.rotVelocity.z * delta;

      (s.mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {shards.map((s, idx) => (
        <primitive key={idx} object={s.mesh} />
      ))}
    </group>
  );
};

export const AimlabsShatters: React.FC<{
  bursts: ShatterBurstData[];
  onRemoveBurst: (id: string) => void;
}> = ({ bursts, onRemoveBurst }) => {
  return (
    <group name="brainxr-shatters">
      {bursts.map((burst) => (
        <ShardBurst
          key={burst.id}
          type={burst.type}
          position={burst.position}
          onDone={() => onRemoveBurst(burst.id)}
        />
      ))}
    </group>
  );
};
