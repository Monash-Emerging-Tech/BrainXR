import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import { triggerXRHaptic } from "../../../utils/xrHaptics";
import {
  renderNodeDetailsCanvas,
  PANEL_WIDTH,
  PANEL_HEIGHT,
  type NodePanelHitArea,
} from "./renderPanel";
import { ELECTRODE_DISPLAY_ORDER } from "../../../utils/electrodeDisplayOrder";

interface XRNodeDetailsPanelProps {
  channel: ElectrodeName | null;
  frameRef: React.RefObject<Frame>;
  onSelectChannel: (name: ElectrodeName | null) => void;
  position?: [number, number, number];
  headPositionRef?: React.RefObject<THREE.Vector3>;
}

export const XRNodeDetailsPanel: React.FC<XRNodeDetailsPanelProps> = ({
  channel,
  frameRef,
  onSelectChannel,
  position = [0, 0.72, -0.95],
  headPositionRef,
}) => {
  const hitAreasRef = useRef<NodePanelHitArea[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const lastUpdateRef = useRef(0);

  // Initialize off-screen baking canvas
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = PANEL_WIDTH;
    canvas.height = PANEL_HEIGHT;
    canvasRef.current = canvas;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;

    return () => {
      texture.dispose();
    };
  }, []);

  // Update canvas texture on frame ticks or state changes
  useFrame((state) => {
    if (!state.gl.xr.isPresenting) return;
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;

    const now = performance.now();
    // Re-draw when voltage updates or at least 15fps
    if (now - lastUpdateRef.current > 66) {
      lastUpdateRef.current = now;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        renderNodeDetailsCanvas(
          ctx,
          channel,
          frameRef.current,
          hoverId,
          hitAreasRef.current
        );
        texture.needsUpdate = true;
      }
    }

    // Smoothly anchor the panel relative to the floating head position
    if (headPositionRef?.current && groupRef.current) {
      const headPos = headPositionRef.current;
      groupRef.current.position.set(headPos.x, headPos.y - 0.42, headPos.z - 0.05);
    }
  });

  const getMatch = (uv: { x: number; y: number }) => {
    const canvasX = uv.x * PANEL_WIDTH;
    const canvasY = (1 - uv.y) * PANEL_HEIGHT;
    const hitAreas = hitAreasRef.current || [];
    return hitAreas.find(
      (a) =>
        canvasX >= a.x &&
        canvasX <= a.x + a.width &&
        canvasY >= a.y &&
        canvasY <= a.y + a.height
    );
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.uv) return;
    const match = getMatch(e.uv);
    const nextId = match ? match.id : null;
    if (nextId !== hoverId) {
      if (nextId) triggerXRHaptic(e, 0.25, 10);
      setHoverId(nextId);
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoverId(null);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.uv) return;
    const match = getMatch(e.uv);
    if (!match) return;

    triggerXRHaptic(e, 0.5, 25);

    if (match.id === "direction") {
      if (typeof window !== "undefined") {
        window.location.href = "/direction";
      }
      return;
    }

    if (match.id === "close") {
      onSelectChannel(null);
      return;
    }

    if (!channel) return;
    const currentIndex = ELECTRODE_DISPLAY_ORDER.indexOf(channel);

    if (match.id === "prev") {
      const prevIndex = currentIndex <= 0 ? ELECTRODE_DISPLAY_ORDER.length - 1 : currentIndex - 1;
      onSelectChannel(ELECTRODE_DISPLAY_ORDER[prevIndex]);
    } else if (match.id === "next") {
      const nextIndex = currentIndex >= ELECTRODE_DISPLAY_ORDER.length - 1 ? 0 : currentIndex + 1;
      onSelectChannel(ELECTRODE_DISPLAY_ORDER[nextIndex]);
    }
  };

  const width = 0.96;
  const height = (width / PANEL_WIDTH) * PANEL_HEIGHT;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[-Math.PI / 10, 0, 0]}
      name="xr-node-details-panel"
    >
      <mesh
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[width, height]} />
        {textureRef.current && (
          <meshBasicMaterial
            map={textureRef.current}
            transparent
            toneMapped={false}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        )}
      </mesh>
    </group>
  );
};

