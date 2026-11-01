import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { createPillShape } from "../../XRConsole/pillShape";
import { triggerXRHaptic } from "../../../utils/xrHaptics";

interface XRActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "emerald";
  width?: number;
  height?: number;
  position?: [number, number, number];
}

export const XRActionButton: React.FC<XRActionButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  width = 0.9,
  height = 0.22,
  position = [0, 0, 0],
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const shape = useMemo(() => createPillShape(width, height, height / 2), [width, height]);
  const outlineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(shape.getPoints(32)), [shape]);

  const colors = {
    primary: { bg: hovered ? "#4f46e5" : "#4338ca", outline: "#818cf8", text: "#ffffff" },
    secondary: { bg: hovered ? "#334155" : "#0f172a", outline: "#64748b", text: "#cbd5e1" },
    danger: { bg: hovered ? "#e11d48" : "#be123c", outline: "#fb7185", text: "#ffffff" },
    emerald: { bg: hovered ? "#059669" : "#047857", outline: "#34d399", text: "#ffffff" },
  }[variant];

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onClick();
  };

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    triggerXRHaptic(e, 0.25, 10);
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    setPressed(false);
  };

  const zOffset = pressed ? -0.008 : hovered ? 0.015 : 0;

  return (
    <group position={position}>
      <mesh
        position={[0, 0, zOffset]}
        onClick={handleClick}
        onPointerDown={(e) => {
          e.stopPropagation();
          setPressed(true);
          triggerXRHaptic(e, 0.4, 15);
        }}
        onPointerUp={() => setPressed(false)}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color={colors.bg}
          roughness={0.2}
          metalness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {hovered && (
        <lineLoop geometry={outlineGeo} position={[0, 0, zOffset + 0.005]} raycast={() => null}>
          <lineBasicMaterial color={colors.outline} linewidth={2} />
        </lineLoop>
      )}

      <Text
        position={[0, 0, zOffset + 0.01]}
        fontSize={0.062}
        color={colors.text}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  );
};
