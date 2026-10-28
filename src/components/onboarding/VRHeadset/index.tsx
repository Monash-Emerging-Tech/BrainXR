import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

interface VRHeadsetProps {
  mountProgress?: number; // 0..1
  mountProgressRef?: React.RefObject<number>;
  isTracking?: boolean;
}

/**
 * Apple Vision Pro 3D Spatial Computing Headset
 *
 * Modeled accurately with:
 * - 3D laminated curved front glass enclosure
 * - Internal EyeSight dynamic cyan gradient display
 * - Curved bead-blasted aluminum alloy perimeter chassis
 * - Top-mounted Digital Crown and Capture Button
 * - Dual spatial audio straps
 * - 3D-knitted ribbed Solo Knit Band with circular Fit Dial and accent tab
 * - Soft charcoal light seal cushion
 */
export const VRHeadset: React.FC<VRHeadsetProps> = ({
  mountProgress = 1,
  mountProgressRef,
  isTracking = true,
}) => {
  const slideGroupRef = useRef<THREE.Group>(null);
  const eyeSightRef = useRef<THREE.MeshStandardMaterial>(null);

  // Curves for Apple Vision Pro Solo Knit Band
  const { leftKnitGeom, rightKnitGeom, rearCradleGeom } = useMemo(() => {
    // Left audio strap transition to rear cradle
    const leftCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.84, 0.02, -0.32),
      new THREE.Vector3(-1.03, 0.04, -1.25),
      new THREE.Vector3(-0.35, 0.05, -2.35)
    );
    // Right audio strap transition to rear cradle
    const rightCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.84, 0.02, -0.32),
      new THREE.Vector3(1.03, 0.04, -1.25),
      new THREE.Vector3(0.35, 0.05, -2.35)
    );
    // Rear wide cushion cradle band
    const rearCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.38, 0.05, -2.35),
      new THREE.Vector3(0, 0.06, -2.46),
      new THREE.Vector3(0.38, 0.05, -2.35)
    );

    return {
      leftKnitGeom: new THREE.TubeGeometry(leftCurve, 32, 0.054, 12, false),
      rightKnitGeom: new THREE.TubeGeometry(rightCurve, 32, 0.054, 12, false),
      rearCradleGeom: new THREE.TubeGeometry(rearCurve, 20, 0.075, 12, false),
    };
  }, []);

  useFrame((state) => {
    const p = mountProgressRef?.current ?? mountProgress;
    const slideGroup = slideGroupRef.current;
    if (slideGroup) {
      slideGroup.visible = p > 0.005;
      const slideZ = (1 - p) * 0.45;
      slideGroup.position.set(0, 0, slideZ);
      const s = 0.88 + p * 0.12;
      slideGroup.scale.setScalar(s);
    }

    if (eyeSightRef.current && isTracking) {
      const time = state.clock.getElapsedTime();
      // Ethereal organic EyeSight breathing shimmer
      const pulse = 1.35 + Math.sin(time * 2.8) * 0.35;
      eyeSightRef.current.emissiveIntensity = pulse;
    }
  });

  return (
    <group
      position={[1.16, 0.12, 0]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <group ref={slideGroupRef}>
        {/* ============================================================ */}
        {/* 1. CURVED 3D LAMINATED GLASS FRONT ENCLOSURE                */}
        {/* ============================================================ */}
        <RoundedBox args={[1.68, 0.62, 0.26]} radius={0.16} smoothness={8} position={[0, 0, 0.14]}>
          <meshPhysicalMaterial
            color="#02040a"
            roughness={0.06}
            metalness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            transmission={0.32}
            thickness={0.2}
            transparent
            opacity={0.96}
          />
        </RoundedBox>

        {/* ============================================================ */}
        {/* 2. INTERNAL EYESIGHT DYNAMIC CYAN OLED DISPLAY             */}
        {/* ============================================================ */}
        <RoundedBox args={[1.56, 0.52, 0.05]} radius={0.13} smoothness={6} position={[0, 0, 0.12]}>
          <meshStandardMaterial
            ref={eyeSightRef}
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={1.4}
            roughness={0.4}
          />
        </RoundedBox>

        {/* Subtle center Vision Pro specular highlight ribbon */}
        <mesh position={[0, 0, 0.275]}>
          <boxGeometry args={[1.2, 0.02, 0.005]} />
          <meshStandardMaterial
            color="#a5f3fc"
            emissive="#22d3ee"
            emissiveIntensity={1.8}
            transparent
            opacity={0.75}
          />
        </mesh>

        {/* ============================================================ */}
        {/* 3. PRECISION CURVED ANODIZED ALUMINUM ALLOY FRAME            */}
        {/* ============================================================ */}
        <RoundedBox args={[1.74, 0.68, 0.22]} radius={0.17} smoothness={8} position={[0, 0, -0.02]}>
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.88}
            roughness={0.22}
          />
        </RoundedBox>

        {/* Top-Right: Apple Digital Crown */}
        <group position={[0.58, 0.35, -0.01]} rotation={[0, 0, -Math.PI / 12]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.04, 24]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
          </mesh>
        </group>

        {/* Top-Left: Apple Top Capture Button */}
        <group position={[-0.58, 0.35, -0.01]}>
          <RoundedBox args={[0.14, 0.035, 0.06]} radius={0.015} smoothness={4}>
            <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
          </RoundedBox>
        </group>

        {/* Downward & Forward TrueDepth Sensor Micro-Apertures */}
        <mesh position={[-0.54, -0.28, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.01, 12]} />
          <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
        </mesh>
        <mesh position={[0.54, -0.28, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.01, 12]} />
          <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* ============================================================ */}
        {/* 4. SOFT BREATHABLE CHARCOAL LIGHT SEAL INTERFACE            */}
        {/* ============================================================ */}
        <RoundedBox args={[1.66, 0.62, 0.18]} radius={0.14} smoothness={6} position={[0, 0, -0.21]}>
          <meshStandardMaterial
            color="#111827"
            roughness={0.96}
            metalness={0.05}
          />
        </RoundedBox>

        {/* ============================================================ */}
        {/* 5. RIGID AUDIO STRAPS & DUAL SPATIAL AUDIO PODS             */}
        {/* ============================================================ */}
        {/* Left Audio Strap */}
        <group position={[-0.86, 0.02, -0.22]}>
          <RoundedBox args={[0.08, 0.16, 0.28]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.25} />
          </RoundedBox>
          {/* Spatial audio speaker grille slit */}
          <mesh position={[-0.042, 0, 0.02]}>
            <boxGeometry args={[0.005, 0.06, 0.08]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
        </group>

        {/* Right Audio Strap */}
        <group position={[0.86, 0.02, -0.22]}>
          <RoundedBox args={[0.08, 0.16, 0.28]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.25} />
          </RoundedBox>
          {/* Spatial audio speaker grille slit */}
          <mesh position={[0.042, 0, 0.02]}>
            <boxGeometry args={[0.005, 0.06, 0.08]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
        </group>

        {/* Apple Solo Knit Fit Dial (Tension Adjustment) on Camera-Facing Side */}
        <group position={[-0.92, 0.02, -0.38]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.065, 0.065, 0.035, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Accent micro-stitch indicator tab */}
          <mesh position={[0, -0.022, 0]}>
            <boxGeometry args={[0.02, 0.015, 0.04]} />
            <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={1.2} />
          </mesh>
        </group>

        {/* Opposite Temple Fit Dial */}
        <group position={[0.92, 0.02, -0.38]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.065, 0.065, 0.035, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Accent micro-stitch indicator tab */}
          <mesh position={[0, 0.022, 0]}>
            <boxGeometry args={[0.02, 0.015, 0.04]} />
            <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={1.2} />
          </mesh>
        </group>

        {/* ============================================================ */}
        {/* 6. ICONIC 3D-RIBBED SOLO KNIT BAND                          */}
        {/* ============================================================ */}
        {/* Left Knit Band Section */}
        <mesh geometry={leftKnitGeom}>
          <meshStandardMaterial
            color="#526071"
            roughness={0.88}
            metalness={0.12}
          />
        </mesh>

        {/* Right Knit Band Section */}
        <mesh geometry={rightKnitGeom}>
          <meshStandardMaterial
            color="#526071"
            roughness={0.88}
            metalness={0.12}
          />
        </mesh>

        {/* Rear Headband Cushion Cradle */}
        <mesh geometry={rearCradleGeom}>
          <meshStandardMaterial
            color="#475569"
            roughness={0.92}
            metalness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
};

export default VRHeadset;
