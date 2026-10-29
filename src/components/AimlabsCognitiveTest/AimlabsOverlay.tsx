import React from "react";
import { AimlabsHUD } from "./AimlabsHUD";
import { AimlabsModals } from "./AimlabsModals";
import { aimlabsStore, type AimlabsState } from "./aimlabsStore";

interface AimlabsOverlayProps {
  state: AimlabsState;
  onExit: () => void;
}

export const AimlabsOverlay: React.FC<AimlabsOverlayProps> = ({
  state,
  onExit,
}) => {
  if (!state.isActive) return null;

  return (
    <>
      {/* 2D Desktop Overlay HUD */}
      {!state.isXR && (
        <AimlabsHUD
          score={state.score}
          accuracy={state.accuracy}
          round={state.round}
          recentFeedback={state.recentFeedback}
          onExit={onExit}
        />
      )}

      {/* Modals & Flow Screens (Ready, Intermission, Results) */}
      {!state.isXR && (
        <AimlabsModals
          status={state.status}
          countdown={state.countdown}
          round1Metrics={state.round1Metrics}
          round2Metrics={state.round2Metrics}
          onStartGame={() => aimlabsStore.startGame()}
          onStartRound2={() => aimlabsStore.startRound2()}
          onRestart={() => aimlabsStore.restart()}
          onExit={onExit}
        />
      )}
    </>
  );
};
