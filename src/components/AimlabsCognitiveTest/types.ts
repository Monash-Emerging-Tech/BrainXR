export type TargetType = 'sphere' | 'box';
export type CognitiveRoundType = 1 | 2;

export interface StimulusDefinition {
  type: TargetType;
  isGo: boolean;
}

export interface CognitiveTargetData {
  id: string;
  index: number;
  type: TargetType;
  isGo: boolean;
  position: [number, number, number];
  slotIndex: number;
  spawnTime: number;
  duration: number; // in seconds, e.g. 1.6
}

export interface HitRecord {
  trialIndex: number;
  type: TargetType;
  isGo: boolean;
  reactionTime: number; // in ms
  isCorrect: boolean;
  points: number;
}

export interface TargetTelemetryRecord {
  trialIndex: number;
  targetType: TargetType;
  isGo: boolean;
  userResponded: boolean;
  isCorrect: boolean;
  reactionTime: number | null; // in ms if responded, null if withheld
  cumulativeAccuracy: number; // percentage (0 - 100)
  movingAverageRT: number; // in ms
  movingSdRT: number; // in ms
  timestamp: number;
}

export interface LiveFocusMetrics {
  reactionTimes: number[];
  meanRT: number;
  medianRT: number;
  sdRT: number;
  cv: number; // Coefficient of Variation (SD / Mean)
  focusLevel: "Optimal Focus" | "Steady Focus" | "Variable Focus" | "Calibrating";
  focusDescription: string;
  boxesHit: number;
  boxesMissed: number;
  spheresHit: number;
  spheresMissed: number;
  accuracy: number;
  telemetryTable: TargetTelemetryRecord[];
}

export interface RoundMetrics {
  round: CognitiveRoundType;
  roundName: string;
  totalTrials: number;
  sphereCount: number;
  boxCount: number;
  goHits: number;
  omissions: number; // Missed Go targets
  commissions: number; // False alarms (clicked No-Go)
  correctRejections: number; // Correctly ignored No-Go
  reactionTimes: number[];
  meanReactionTime: number;
  score: number;
  accuracy: number; // percentage
  telemetryTable: TargetTelemetryRecord[];
}

export type GameStatus =
  | 'ready'
  | 'countdown'
  | 'round1'
  | 'intermission'
  | 'round2'
  | 'finished';

export interface FloatingFeedback {
  id: string;
  text: string;
  color: string;
  position?: [number, number, number];
  timestamp: number;
}

