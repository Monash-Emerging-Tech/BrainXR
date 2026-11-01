import type { GameStatus, CognitiveRoundType, RoundMetrics } from "../types";

export interface InteractiveHitArea {
  id: string;
  type: "start-game" | "start-round2" | "restart" | "exit";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasScreenRenderState {
  status: GameStatus;
  countdown: number;
  round: CognitiveRoundType;
  score: number;
  accuracy: number;
  round1Metrics: RoundMetrics | null;
  round2Metrics: RoundMetrics | null;
  recentFeedback: { text: string; color: string } | null;
  hoverId?: string | null;
}
