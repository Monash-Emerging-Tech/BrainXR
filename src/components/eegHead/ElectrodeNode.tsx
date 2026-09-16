import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { ELECTRODE_METADATA, type ElectrodeName } from "../../utils/signalSource";
import { REGION_COLOR } from "../../utils/electrodeVisualState";
import { triggerXRHaptic } from "../../utils/xrHaptics";

interface ElectrodeNodeProps {
  name: ElectrodeName;
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected?: boolean;
  isHovered?: boolean;
  onRef: (mesh: THREE.Mesh | null) => void;
  onSelect?: (name: ElectrodeName) => void;
  onHover?: (name: ElectrodeName | null) => void;
}

const BLACK_COLOR = new THREE.Color(0x000000);

// Interactive LED sensor mesh on the digital twin. Its material's
// color/intensity/opacity are animated externally (see EEGHead's useFrame),
// which is why the mesh registers itself via `onRef`.
//
// When selected (or hovered), renders a glowing halo ring around the sensor
// base with cortical region-themed illumination.
const ElectrodeNode: React.FC<ElectrodeNodeProps> = ({
  name,
  geometry,
  position,
  rotation,
  isSelected = false,
  isHovered = false,
  onRef,
  onSelect,
  onHover,
}) => {
  const ringGroupRef = useRef<THREE.Group>(null);

  const { baseRadius, ringRotation, ringOffset } = useMemo(() => {
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }
    const bb = geometry.boundingBox;
    let r = 0.8;
    let rot: [number, number, number] = [0, 0, 0];
    let offset: [number, number, number] = [0, 0, 0];

    if (bb) {
      const dx = bb.max.x - bb.min.x;
      const dy = bb.max.y - bb.min.y;
      const dz = bb.max.z - bb.min.z;

      // Identify the dome extrusion axis (smallest dimension)
      if (dy <= dx && dy <= dz) {
        // Dome along Y: base lies in XZ plane
        r = Math.max(dx, dz) / 2;
        rot = [Math.PI / 2, 0, 0];
        offset = [0, bb.min.y + 0.02, 0];
      } else if (dx <= dy && dx <= dz) {
        // Dome along X: base lies in YZ plane
        r = Math.max(dy, dz) / 2;
        rot = [0, Math.PI / 2, 0];
        offset = [bb.min.x + 0.02, 0, 0];
      } else {
        // Dome along Z: base lies in XY plane
        r = Math.max(dx, dy) / 2;
        rot = [0, 0, 0];
        offset = [0, 0, bb.min.z + 0.02];
      }
    }
    return { baseRadius: r, ringRotation: rot, ringOffset: offset };
  }, [geometry]);

  const region = ELECTRODE_METADATA[name]?.region;
  const ringColor = (region && REGION_COLOR[region]) || "#38bdf8";

  useFrame((state) => {
    if (!ringGroupRef.current) return;
    if (isSelected) {
      const time = state.clock.getElapsedTime();
      const pulse = Math.sin(time * 4);
      const s = 1.0 + 0.04 * pulse;
      ringGroupRef.current.scale.set(s, s, s);
    } else {
      ringGroupRef.current.scale.set(1, 1, 1);
    }
  });

  // XR's grip/squeeze channel reports pointerType "grab" (a near-field
  // proximity pointer — see useXRDragInteraction, now bound to grip for
  // repositioning). Ignore it here so brushing a grabbing hand near a node
  // never selects/hovers it; only the trigger ray ("ray") and desktop mouse
  // ("mouse") drive selection.
  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === "grab") return;
    e.stopPropagation();
    triggerXRHaptic(e, 0.5, 25);
    onSelect?.(name);
  };

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === "grab") return;
    e.stopPropagation();
    triggerXRHaptic(e, 0.2, 10);
    onHover?.(name);
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === "grab") return;
    e.stopPropagation();
    onHover?.(null);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Base Electrode Sensor LED Hemisphere */}
      <mesh
        geometry={geometry}
        scale={2.1}
        ref={onRef}
        onClick={handleClick}
        onPointerDown={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.15}
          metalness={0.1}
          emissive={BLACK_COLOR}
          emissiveIntensity={0.0}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 2. Concentric Highlight Ring (Active Selection / Hover Preview) outside the LED.
          Always mounted (visibility toggled) rather than conditionally rendered — an XR
          controller ray can fire dozens of hover transitions per second sweeping across
          nodes, and mounting/unmounting would reallocate the ring geometry/material each time. */}
      <group position={ringOffset} rotation={ringRotation} scale={2.1}>
        <group ref={ringGroupRef} visible={isSelected || isHovered}>
          {/* Glowing halo disc aura extending onto headset surface */}
          <mesh raycast={() => null}>
            <ringGeometry args={[baseRadius * 1.25, baseRadius * 2.2, 32]} />
            <meshBasicMaterial
              color={ringColor}
              side={THREE.DoubleSide}
              transparent
              opacity={isSelected ? 0.5 : 0.25}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default React.memo(ElectrodeNode);
