import React, { useState, useEffect } from "react";
import type { GameStatus, RoundMetrics, CognitiveRoundType, LiveFocusMetrics } from "../types";
import { CountdownOverlay } from "./CountdownOverlay";
import { ReadyModal } from "./ReadyModal";
import { IntermissionModal } from "./IntermissionModal";
import { FinishedModal } from "./FinishedModal";
import { PauseModal } from "./PauseModal";

interface AimlabsModalsProps {
  status: GameStatus;
  countdown: number;
  currentRound: CognitiveRoundType;
  round1Metrics: RoundMetrics | null;
  round2Metrics: RoundMetrics | null;
  isPaused?: boolean;
  accuracy?: number;
  soundEnabled?: boolean;
  liveFocusMetrics?: LiveFocusMetrics;
  onStartGame: () => void;
  onStartRound2: () => void;
  onRestart: () => void;
  onExit: () => void;
  onResume?: () => void;
  onSkipRound?: () => void;
  onToggleSound?: () => void;
}

// Picks which full-screen modal to show for the current game status (ready
// rules, countdown, intermission report, pause menu, or finished report),
// and owns the fade transition shared by all of them.
export const AimlabsModals: React.FC<AimlabsModalsProps> = ({
  status,
  countdown,
  currentRound,
  round1Metrics,
  round2Metrics,
  isPaused = false,
  accuracy = 100,
  soundEnabled = true,
  liveFocusMetrics,
  onStartGame,
  onStartRound2,
  onRestart,
  onExit,
  onResume,
  onSkipRound,
  onToggleSound,
}) => {
  // Fade in / fade out transition state
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, [status]);

  const handleAction = (callback: () => void) => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsFadingOut(false);
      callback();
    }, 280);
  };

  if (status === "countdown") {
    return <CountdownOverlay countdown={countdown} />;
  }

  if (status === "ready") {
    return (
      <ReadyModal
        currentRound={currentRound}
        onStartGame={onStartGame}
        onExit={onExit}
        mounted={mounted}
        isFadingOut={isFadingOut}
        handleAction={handleAction}
      />
    );
  }

  // Intermission always occurs after Round 1 and transitions into Round 2.
  if (status === "intermission" && (round1Metrics || round2Metrics)) {
    return (
      <IntermissionModal
        round1Metrics={round1Metrics}
        round2Metrics={round2Metrics}
        onStartRound2={onStartRound2}
        mounted={mounted}
        isFadingOut={isFadingOut}
        handleAction={handleAction}
      />
    );
  }

  if (status === "finished" && round1Metrics && round2Metrics) {
    return (
      <FinishedModal
        round1Metrics={round1Metrics}
        round2Metrics={round2Metrics}
        liveFocusMetrics={liveFocusMetrics}
        onRestart={onRestart}
        mounted={mounted}
        isFadingOut={isFadingOut}
        handleAction={handleAction}
      />
    );
  }

  if (isPaused && (status === "round1" || status === "round2")) {
    return (
      <PauseModal
        currentRound={currentRound}
        accuracy={accuracy}
        soundEnabled={soundEnabled}
        liveFocusMetrics={liveFocusMetrics}
        onResume={onResume}
        onSkipRound={onSkipRound}
        onToggleSound={onToggleSound}
        mounted={mounted}
        isFadingOut={isFadingOut}
        handleAction={handleAction}
      />
    );
  }

  return null;
};
