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
          status={state.status}
          recentFeedback={state.recentFeedback}
          isPaused={state.isPaused}
          liveFocusMetrics={state.liveFocusMetrics}
          onExit={onExit}
          onTogglePause={() => aimlabsStore.togglePause()}
        />
      )}

      {/* Modals & Flow Screens (Ready, Intermission, Results, Pause) */}
      {!state.isXR && (
        <AimlabsModals
          status={state.status}
          countdown={state.countdown}
          currentRound={state.round}
          round1Metrics={state.round1Metrics}
          round2Metrics={state.round2Metrics}
          isPaused={state.isPaused}
          accuracy={state.accuracy}
          soundEnabled={state.soundEnabled}
          liveFocusMetrics={state.liveFocusMetrics}
          onStartGame={() => aimlabsStore.startGame()}
          onStartRound2={() => aimlabsStore.startRound2()}
          onRestart={() => aimlabsStore.restart()}
          onExit={onExit}
          onResume={() => aimlabsStore.togglePause()}
          onSkipRound={() => aimlabsStore.skipRound()}
          onToggleSound={() => aimlabsStore.toggleSound()}
        />
      )}
    </>
  );
};
