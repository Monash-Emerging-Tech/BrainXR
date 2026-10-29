import React, { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AimlabsArena } from "./AimlabsArena";
import { AimlabsTarget } from "./AimlabsTarget";
import { AimlabsShatters } from "./AimlabsShatters";
import { AimlabsXROverlay } from "./AimlabsXROverlay";
import { aimlabsStore, type AimlabsState } from "./aimlabsStore";

interface AimlabsSceneProps {
  state: AimlabsState;
  isXR: boolean;
  onExit: () => void;
}

export const AimlabsScene: React.FC<AimlabsSceneProps> = ({
  state,
  isXR,
  onExit,
}) => {
  const { camera } = useThree();

  // Desktop Spacebar and Click listener
  useEffect(() => {
    if (isXR) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (state.status === "round1" || state.status === "round2") {
          aimlabsStore.handleResponse();
        } else if (state.status === "ready") {
          aimlabsStore.startGame();
        } else if (state.status === "intermission") {
          aimlabsStore.startRound2();
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && (state.status === "round1" || state.status === "round2")) {
        aimlabsStore.handleResponse();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [isXR, state.status]);

  useFrame((_, delta) => {
    // Tick game store
    aimlabsStore.tick(delta);

    // Keep camera stationary looking directly forward at central target
    if (!isXR) {
      camera.position.set(0, 1.6, 0);
      camera.rotation.set(0, 0, 0);
    }
  });

  return (
    <group name="brainxr-cognitive-scene">
      {/* Clean minimal spatial void */}
      <AimlabsArena />

      {/* Single Central Target (displayed when isTargetVisible is true) */}
      <AimlabsTarget
        type={state.currentTargetType}
        visible={state.isTargetVisible}
        position={[0, 1.6, -4.5]}
        onClick={() => aimlabsStore.handleResponse()}
      />

      {/* Shatter Bursts on Hit */}
      <AimlabsShatters
        bursts={state.shatters}
        onRemoveBurst={(id) => aimlabsStore.removeShatter(id)}
      />

      {/* WebXR in-headset minimal HUD */}
      {isXR && (
        <AimlabsXROverlay
          score={state.score}
          accuracy={state.accuracy}
          round={state.round}
          onExit={onExit}
        />
      )}
    </group>
  );
};
