import { aimlabsAudio } from "./audio";
import {
  generateRoundSequence,
  TOTAL_TRIALS,
  SPHERE_COUNT,
  BOX_COUNT,
} from "./sequencer";
import type {
  TargetType,
  CognitiveRoundType,
  GameStatus,
  RoundMetrics,
  StimulusDefinition,
} from "./types";
import type { ShatterBurstData } from "./AimlabsShatters";

export const STIMULUS_DURATION = 0.5; // 500ms target visible
export const ISI_DURATION = 0.7; // 700ms fixation cross
export const TRIAL_TOTAL_DURATION = STIMULUS_DURATION + ISI_DURATION; // 1.2s total window

export interface AimlabsState {
  isActive: boolean;
  isXR: boolean;
  status: GameStatus;
  countdown: number;
  round: CognitiveRoundType;
  score: number;
  accuracy: number;
  trialIndex: number;
  totalTrials: number;
  // Current single stimulus state
  currentTargetType: TargetType;
  isTargetVisible: boolean; // true during 500ms, false during 700ms ISI
  trialPhaseTime: number; // elapsed time within current 1.2s trial
  shatters: ShatterBurstData[];
  round1Metrics: RoundMetrics | null;
  round2Metrics: RoundMetrics | null;
  lastReactionTime: number | null;
  recentFeedback: { text: string; color: string } | null;
}

class AimlabsStore {
  private state: AimlabsState = {
    isActive: false,
    isXR: false,
    status: "ready",
    countdown: 3,
    round: 1,
    score: 0,
    accuracy: 100,
    trialIndex: 0,
    totalTrials: TOTAL_TRIALS,
    currentTargetType: "sphere",
    isTargetVisible: false,
    trialPhaseTime: 0,
    shatters: [],
    round1Metrics: null,
    round2Metrics: null,
    lastReactionTime: null,
    recentFeedback: null,
  };

  private listeners = new Set<() => void>();
  private sequence: StimulusDefinition[] = [];
  private trialHasResponded = false;
  private trialStartTime = 0;

  private metrics = {
    goHits: 0,
    omissions: 0,
    commissions: 0,
    correctRejections: 0,
    reactionTimes: [] as number[],
    totalShots: 0,
    accurateShots: 0,
  };

  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  getSnapshot = (): AimlabsState => this.state;
  getServerSnapshot = (): AimlabsState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private setState(partial: Partial<AimlabsState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  launch(isXR: boolean = false) {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.sequence = [];

    this.setState({
      isActive: true,
      isXR,
      status: "ready",
      countdown: 3,
      round: 1,
      score: 0,
      accuracy: 100,
      trialIndex: 0,
      totalTrials: TOTAL_TRIALS,
      currentTargetType: "sphere",
      isTargetVisible: false,
      trialPhaseTime: 0,
      shatters: [],
      round1Metrics: null,
      round2Metrics: null,
      lastReactionTime: null,
      recentFeedback: null,
    });
  }

  exit() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.setState({ isActive: false, status: "ready", isTargetVisible: false });
  }

  startGame() {
    this.startRound(1);
  }

  startRound2() {
    this.startRound(2);
  }

  restart() {
    this.setState({
      score: 0,
      accuracy: 100,
      round1Metrics: null,
      round2Metrics: null,
    });
    this.startRound(1);
  }

  private startRound(targetRound: CognitiveRoundType) {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.sequence = generateRoundSequence(targetRound);
    this.trialHasResponded = false;

    this.metrics = {
      goHits: 0,
      omissions: 0,
      commissions: 0,
      correctRejections: 0,
      reactionTimes: [],
      totalShots: 0,
      accurateShots: 0,
    };

    this.setState({
      round: targetRound,
      status: "countdown",
      countdown: 3,
      trialIndex: 0,
      isTargetVisible: false,
      trialPhaseTime: 0,
      currentTargetType: this.sequence[0]?.type ?? "sphere",
      recentFeedback: null,
    });

    aimlabsAudio.playCountdown(3);

    let step = 3;
    this.countdownTimer = setInterval(() => {
      step--;
      this.setState({ countdown: step });
      aimlabsAudio.playCountdown(step);

      if (step <= 0) {
        if (this.countdownTimer) clearInterval(this.countdownTimer);
        this.setState({ status: targetRound === 1 ? "round1" : "round2" });
        this.beginTrial(0);
      }
    }, 900);
  }

  private beginTrial(index: number) {
    if (index >= this.sequence.length) {
      this.finishRound();
      return;
    }

    const item = this.sequence[index];
    this.trialHasResponded = false;
    this.trialStartTime = performance.now();

    this.setState({
      trialIndex: index,
      currentTargetType: item.type,
      isTargetVisible: true,
      trialPhaseTime: 0,
    });
  }

  private setFeedback(text: string, color: string) {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.setState({ recentFeedback: { text, color } });
    this.feedbackTimer = setTimeout(() => {
      this.setState({ recentFeedback: null });
    }, 700);
  }

  private updateAccuracy() {
    const { totalShots, accurateShots } = this.metrics;
    if (totalShots > 0) {
      const acc = Math.min(100, Math.max(0, (accurateShots / totalShots) * 100));
      this.setState({ accuracy: acc });
    }
  }

  // Handle user response (Spacebar or Click)
  handleResponse() {
    const { status, trialIndex, isTargetVisible } = this.state;
    if (status !== "round1" && status !== "round2") return;
    if (this.trialHasResponded) return; // Only one response per stimulus trial window

    // Only allow hitting when the stimulus target is currently active/visible
    if (!isTargetVisible) return;

    this.trialHasResponded = true;
    const item = this.sequence[trialIndex];
    if (!item) return;

    const rt = Math.max(100, Math.round(performance.now() - this.trialStartTime));
    this.metrics.totalShots++;

    let newScore = this.state.score;

    if (item.isGo) {
      // Correct Go Hit: Add RT to cumulative score
      this.metrics.goHits++;
      this.metrics.accurateShots++;
      this.metrics.reactionTimes.push(rt);

      newScore += rt;

      aimlabsAudio.playHit(item.type === "sphere");
      this.setFeedback(`+${rt}ms`, "#34d399");

      // Spawn shatter burst at center target position
      const newShatter: ShatterBurstData = {
        id: Math.random().toString(36).substring(2, 8),
        type: item.type,
        position: [0, 1.6, -4.5],
        startTime: performance.now(),
      };
      this.setState({
        shatters: [...this.state.shatters.slice(-4), newShatter],
        isTargetVisible: false, // Target pops immediately upon hit
      });
    } else {
      // Commission Error (Clicked No-Go!): Subtract RT from cumulative score
      this.metrics.commissions++;
      newScore = Math.max(0, newScore - rt);

      aimlabsAudio.playError();
      this.setFeedback(`-${rt}ms`, "#f43f5e");
    }

    this.setState({
      score: newScore,
      lastReactionTime: rt,
    });
    this.updateAccuracy();
  }

  removeShatter(id: string) {
    this.setState({
      shatters: this.state.shatters.filter((s) => s.id !== id),
    });
  }

  // Called when 1.2s trial window completes
  private completeTrial() {
    const { trialIndex } = this.state;
    const item = this.sequence[trialIndex];

    if (item && !this.trialHasResponded) {
      if (item.isGo) {
        // Omission Error (Missed Go target)
        this.metrics.omissions++;
        this.metrics.totalShots++;
      } else {
        // Correct Rejection (Correctly withheld on No-Go)
        this.metrics.correctRejections++;
        this.metrics.accurateShots++;
        this.metrics.totalShots++;
        aimlabsAudio.playCorrectRejection();
      }
      this.updateAccuracy();
    }

    const nextIndex = trialIndex + 1;
    this.beginTrial(nextIndex);
  }

  private finishRound() {
    const isRound1 = this.state.round === 1;
    const m = this.metrics;
    const rts = m.reactionTimes;
    const meanRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;

    const roundData: RoundMetrics = {
      round: this.state.round,
      roundName: isRound1 ? "Round 1: CPT" : "Round 2: SART",
      totalTrials: TOTAL_TRIALS,
      sphereCount: SPHERE_COUNT,
      boxCount: BOX_COUNT,
      goHits: m.goHits,
      omissions: m.omissions,
      commissions: m.commissions,
      correctRejections: m.correctRejections,
      reactionTimes: rts,
      meanReactionTime: meanRT,
      score: this.state.score,
      accuracy: this.state.accuracy,
    };

    aimlabsAudio.playRoundComplete();

    if (isRound1) {
      this.setState({
        round1Metrics: roundData,
        status: "intermission",
        isTargetVisible: false,
      });
    } else {
      this.setState({
        round2Metrics: roundData,
        status: "finished",
        isTargetVisible: false,
      });
    }
  }

  tick(delta: number) {
    const { status, trialPhaseTime, isTargetVisible } = this.state;
    if (status !== "round1" && status !== "round2") return;

    const newPhaseTime = trialPhaseTime + delta;

    // After 500ms, hide target and show fixation cross
    if (newPhaseTime >= STIMULUS_DURATION && isTargetVisible) {
      this.setState({ isTargetVisible: false });
    }

    // After 1.2s total duration, transition to next trial
    if (newPhaseTime >= TRIAL_TOTAL_DURATION) {
      this.completeTrial();
    } else {
      this.setState({ trialPhaseTime: newPhaseTime });
    }
  }
}

export const aimlabsStore = new AimlabsStore();
