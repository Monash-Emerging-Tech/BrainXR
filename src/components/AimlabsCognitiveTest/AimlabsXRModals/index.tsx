import React from "react";
import type { GameStatus, RoundMetrics } from "../types";
import { XRReadyModal } from "./XRReadyModal";
import { XRCountdownModal } from "./XRCountdownModal";
import { XRIntermissionModal } from "./XRIntermissionModal";
import { XRFinishedModal } from "./XRFinishedModal";

interface AimlabsXRModalsProps {
  status: GameStatus;
  countdown: number;
  round1Metrics: RoundMetrics | null;
  round2Metrics: RoundMetrics | null;
  onStartGame: () => void;
  onStartRound2: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const AimlabsXRModals: React.FC<AimlabsXRModalsProps> = ({
  status,
  countdown,
  round1Metrics,
  round2Metrics,
  onStartGame,
  onStartRound2,
  onRestart,
  onExit,
}) => {
  if (status === "ready") {
    return <XRReadyModal onStartGame={onStartGame} onExit={onExit} />;
  }

  if (status === "countdown") {
    return <XRCountdownModal countdown={countdown} />;
  }

  if (status === "intermission" && round1Metrics) {
    return <XRIntermissionModal metrics={round1Metrics} onStartRound2={onStartRound2} />;
  }

  if (status === "finished" && round1Metrics && round2Metrics) {
    return (
      <XRFinishedModal
        round1Metrics={round1Metrics}
        round2Metrics={round2Metrics}
        onRestart={onRestart}
        onExit={onExit}
      />
    );
  }

  return null;
};

export default AimlabsXRModals;
