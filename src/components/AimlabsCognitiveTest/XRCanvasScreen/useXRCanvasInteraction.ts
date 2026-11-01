import { useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./renderCanvas";
import { triggerXRHaptic } from "../../../utils/xrHaptics";
import type { InteractiveHitArea } from "./types";

interface UseXRCanvasInteractionParams {
  hitAreasRef: React.RefObject<InteractiveHitArea[]>;
  onStartGame: () => void;
  onStartRound2: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function useXRCanvasInteraction({
  hitAreasRef,
  onStartGame,
  onStartRound2,
  onRestart,
  onExit,
}: UseXRCanvasInteractionParams) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const getMatch = (uv: { x: number; y: number }) => {
    const canvasX = uv.x * CANVAS_WIDTH;
    const canvasY = (1 - uv.y) * CANVAS_HEIGHT;
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
    if (!e.uv) return;
    const match = getMatch(e.uv);
    const nextId = match ? match.id : null;
    if (nextId !== hoverId) {
      if (nextId) triggerXRHaptic(e, 0.25, 10);
      setHoverId(nextId);
    }
  };

  const handlePointerOut = () => {
    setHoverId(null);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    e.stopPropagation();
    const match = getMatch(e.uv);
    if (!match) return;

    triggerXRHaptic(e, 0.6, 25);
    if (match.type === "start-game") {
      onStartGame();
    } else if (match.type === "start-round2") {
      onStartRound2();
    } else if (match.type === "restart") {
      onRestart();
    } else if (match.type === "exit") {
      onExit();
    }
  };

  return {
    hoverId,
    handlePointerMove,
    handlePointerOut,
    handlePointerDown,
  };
}
