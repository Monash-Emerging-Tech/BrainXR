import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { renderCanvas, CANVAS_WIDTH, CANVAS_HEIGHT } from "./renderCanvas";
import type { CanvasScreenRenderState, InteractiveHitArea } from "./types";

interface UseXRCanvasTextureParams {
  state: CanvasScreenRenderState;
  hitAreasRef: React.RefObject<InteractiveHitArea[]>;
}

export function useXRCanvasTexture({
  state,
  hitAreasRef,
}: UseXRCanvasTextureParams) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const lastDrawTimeRef = useRef<number>(0);

  if (!canvasRef.current && typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvasRef.current = canvas;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;

    // Preload OffBit font into document font registry
    if (document.fonts) {
      document.fonts.load("bold 24px 'OffBit'").catch(() => {});
    }
  }

  useEffect(() => {
    return () => {
      textureRef.current?.dispose();
    };
  }, []);

  useFrame((threeState) => {
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    const interval = state.hoverId ? 25 : 40; // ~40fps idle, ~25ms when hovering
    if (now - lastDrawTimeRef.current < interval) return;
    lastDrawTimeRef.current = now;

    const time = threeState.clock.getElapsedTime();
    const hitAreas = renderCanvas(ctx, state, time);
    hitAreasRef.current = hitAreas;
    texture.needsUpdate = true;
  });

  return { texture: textureRef.current };
}
