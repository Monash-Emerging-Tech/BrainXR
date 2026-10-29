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

