import React, { useRef } from "react";
import type { AimlabsState } from "../aimlabsStore";
import { aimlabsStore } from "../aimlabsStore";
import { useXRCanvasInteraction } from "./useXRCanvasInteraction";
import { useXRCanvasTexture } from "./useXRCanvasTexture";
import { XRCanvasScreenMesh } from "./XRCanvasScreenMesh";
import type { InteractiveHitArea } from "./types";

interface XRCanvasScreenProps {
  state: AimlabsState;
  onExit: () => void;
}

export const XRCanvasScreen: React.FC<XRCanvasScreenProps> = ({
  state,
  onExit,
}) => {
  const hitAreasRef = useRef<InteractiveHitArea[]>([]);

  const { hoverId, handlePointerMove, handlePointerOut, handlePointerDown } =
    useXRCanvasInteraction({
      hitAreasRef,
      onStartGame: () => aimlabsStore.startGame(),
      onStartRound2: () => aimlabsStore.startRound2(),
      onRestart: () => aimlabsStore.restart(),
      onExit,
      onHome: () => {
        aimlabsStore.exit();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
      onSkipRound: () => aimlabsStore.skipRound(),
      onTogglePause: () => aimlabsStore.togglePause(),
      onToggleSound: () => aimlabsStore.toggleSound(),
    });

  const isGameplay = (state.status === "round1" || state.status === "round2") && !state.isPaused;

  const { texture } = useXRCanvasTexture({
    state: {
      status: state.status,
      countdown: state.countdown,
      round: state.round,
      score: state.score,
      accuracy: state.accuracy,
      round1Metrics: state.round1Metrics,
      round2Metrics: state.round2Metrics,
      recentFeedback: state.recentFeedback,
      isPaused: state.isPaused,
      soundEnabled: state.soundEnabled,
      liveFocusMetrics: state.liveFocusMetrics,
      hoverId,
    },
    hitAreasRef,
  });

  return (
    <XRCanvasScreenMesh
      texture={texture}
      isGameplay={isGameplay}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    />
  );
};

export default XRCanvasScreen;
