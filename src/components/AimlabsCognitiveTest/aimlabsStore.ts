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
  LiveFocusMetrics,
  TargetTelemetryRecord,
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
  isPaused: boolean;
  soundEnabled: boolean;
  liveFocusMetrics: LiveFocusMetrics;
}

const INITIAL_LIVE_METRICS: LiveFocusMetrics = {
  reactionTimes: [],
  meanRT: 0,
  medianRT: 0,
  sdRT: 0,
  cv: 0,
  focusLevel: "Calibrating",
  focusDescription: "Baseline reaction times",
  boxesHit: 0,
  boxesMissed: 0,
  spheresHit: 0,
  spheresMissed: 0,
  accuracy: 100,
  telemetryTable: [],
};

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
    isPaused: false,
    soundEnabled: true,
    liveFocusMetrics: INITIAL_LIVE_METRICS,
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
    boxesHit: 0,
    boxesMissed: 0,
    spheresHit: 0,
    spheresMissed: 0,
  };

  private pauseStartTime: number = 0;
  private telemetryTable: TargetTelemetryRecord[] = [];

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

    // Randomize initial starting round (1: CPT or 2: SART)
    const initialRound: CognitiveRoundType = Math.random() < 0.5 ? 1 : 2;

    this.setState({
      isActive: true,
      isXR,
      status: "ready",
      countdown: 3,
      round: initialRound,
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
      isPaused: false,
    });
  }

  exit() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.setState({ isActive: false, status: "ready", isTargetVisible: false });
  }

  startGame() {
    this.startRound(this.state.round);
  }

  startRound2() {
    // If round 1 was played, move to round 2, otherwise move to round 1
    const nextRound: CognitiveRoundType = this.state.round === 1 ? 2 : 1;
    this.startRound(nextRound);
  }

  restart() {
    this.setState({
      score: 0,
      accuracy: 100,
      round1Metrics: null,
      round2Metrics: null,
    });
    const nextRound: CognitiveRoundType = Math.random() < 0.5 ? 1 : 2;
    this.startRound(nextRound);
  }

  private startRound(targetRound: CognitiveRoundType) {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.sequence = generateRoundSequence(targetRound);
    this.trialHasResponded = false;
    this.telemetryTable = [];

    this.metrics = {
      goHits: 0,
      omissions: 0,
      commissions: 0,
      correctRejections: 0,
      reactionTimes: [],
      totalShots: 0,
      accurateShots: 0,
      boxesHit: 0,
      boxesMissed: 0,
      spheresHit: 0,
      spheresMissed: 0,
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
      liveFocusMetrics: INITIAL_LIVE_METRICS,
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
    let acc = 100;
    if (totalShots > 0) {
      acc = Math.min(100, Math.max(0, (accurateShots / totalShots) * 100));
      this.setState({ accuracy: acc });
    }
    this.updateLiveFocusMetrics(acc);
  }

  private updateLiveFocusMetrics(acc: number) {
    const rts = [...this.metrics.reactionTimes];
    const n = rts.length;
    let meanRT = 0;
    let medianRT = 0;
    let sdRT = 0;

    if (n > 0) {
      const sum = rts.reduce((a, b) => a + b, 0);
      meanRT = Math.round(sum / n);

      const sorted = [...rts].sort((a, b) => a - b);
      const mid = Math.floor(n / 2);
      medianRT = n % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

      if (n > 1) {
        const variance = rts.reduce((accVar, val) => accVar + Math.pow(val - meanRT, 2), 0) / (n - 1);
        sdRT = Math.round(Math.sqrt(variance));
      } else {
        sdRT = 0;
      }
    }

    let cv = 0;
    if (meanRT > 0 && sdRT > 0) {
      cv = Number((sdRT / meanRT).toFixed(3));
    }

    let focusLevel: "Optimal Focus" | "Steady Focus" | "Variable Focus" | "Calibrating" = "Calibrating";
    let focusDescription = "Collecting baseline trials";

    if (n >= 3) {
      // Intra-individual reaction time variability classified via CV multiplier (SD / Mean RT)
      // Following cognitive literature on CPT/SART variability (IIRTV / IIV):
      // CV < 0.15 (15%): Optimal / Laser-like focus
      // 0.15 <= CV < 0.25 (15% - 25%): Steady healthy vigilance
      // CV >= 0.25 (> 25%): Variable focus / attentional lapses
      if (cv < 0.15) {
        focusLevel = "Optimal Focus";
        focusDescription = `Laser-like vigilance · Multiplier ${cv}x Mean RT`;
      } else if (cv < 0.25) {
        focusLevel = "Steady Focus";
        focusDescription = `Consistent sustained focus · Multiplier ${cv}x Mean RT`;
      } else {
        focusLevel = "Variable Focus";
        focusDescription = `Elevated lapse variance · Multiplier ${cv}x Mean RT`;
      }
    }

    const liveFocusMetrics: LiveFocusMetrics = {
      reactionTimes: rts,
      meanRT,
      medianRT,
      sdRT,
      cv,
      focusLevel,
      focusDescription,
      boxesHit: this.metrics.boxesHit,
      boxesMissed: this.metrics.boxesMissed,
      spheresHit: this.metrics.spheresHit,
      spheresMissed: this.metrics.spheresMissed,
      accuracy: Math.round(acc),
      telemetryTable: [...this.telemetryTable],
    };

    this.setState({ liveFocusMetrics });
  }

  private recordTrialTelemetry(
    trialIndex: number,
    item: StimulusDefinition,
    userResponded: boolean,
    isCorrect: boolean,
    rt: number | null
  ) {
    const { totalShots, accurateShots } = this.metrics;
    const cumulativeAccuracy = totalShots > 0 ? Math.round((accurateShots / totalShots) * 100) : 100;

    // Moving window of last 10 reaction times
    const windowRTs = this.metrics.reactionTimes.slice(-10);
    const mCount = windowRTs.length;
    let movingAverageRT = 0;
    let movingSdRT = 0;

    if (mCount > 0) {
      movingAverageRT = Math.round(windowRTs.reduce((a, b) => a + b, 0) / mCount);
      if (mCount > 1) {
        const v = windowRTs.reduce((acc, val) => acc + Math.pow(val - movingAverageRT, 2), 0) / (mCount - 1);
        movingSdRT = Math.round(Math.sqrt(v));
      }
    }

    const record: TargetTelemetryRecord = {
      trialIndex,
      targetType: item.type,
      isGo: item.isGo,
      userResponded,
      isCorrect,
      reactionTime: rt,
      cumulativeAccuracy,
      movingAverageRT,
      movingSdRT,
      timestamp: performance.now(),
    };

    this.telemetryTable.push(record);
  }

  // Handle user response (Spacebar or Click)
  handleResponse() {
    const { status, trialIndex, isTargetVisible, isPaused } = this.state;
    if (status !== "round1" && status !== "round2") return;
    if (isPaused) return; // Ignore response inputs when paused
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

      if (item.type === "box") {
        this.metrics.boxesHit++;
      } else {
        this.metrics.spheresHit++;
      }

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
      if (item.type === "box") {
        this.metrics.boxesMissed++; // Incorrectly pressed No-Go box
      } else {
        this.metrics.spheresMissed++; // Incorrectly pressed No-Go sphere
      }
      newScore = Math.max(0, newScore - rt);

      aimlabsAudio.playError();
      this.setFeedback(`-${rt}ms`, "#f43f5e");
    }

    this.setState({
      score: newScore,
      lastReactionTime: rt,
    });
    this.recordTrialTelemetry(trialIndex, item, true, item.isGo, rt);
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
        if (item.type === "box") {
          this.metrics.boxesMissed++;
        } else {
          this.metrics.spheresMissed++;
        }
      } else {
        // Correct Rejection (Correctly withheld on No-Go)
        this.metrics.correctRejections++;
        this.metrics.accurateShots++;
        this.metrics.totalShots++;
        aimlabsAudio.playCorrectRejection();
      }
      this.recordTrialTelemetry(trialIndex, item, false, !item.isGo, null);
      this.updateAccuracy();
    }

    const nextIndex = trialIndex + 1;
    this.beginTrial(nextIndex);
  }

  togglePause() {
    if (this.state.status === "round1" || this.state.status === "round2") {
      const nextPaused = !this.state.isPaused;
      if (nextPaused) {
        this.pauseStartTime = performance.now();
      } else {
        if (this.pauseStartTime > 0) {
          const pausedDuration = performance.now() - this.pauseStartTime;
          this.trialStartTime += pausedDuration;
          this.pauseStartTime = 0;
        }
      }
      this.setState({ isPaused: nextPaused });
    }
  }

  setSoundEnabled(enabled: boolean) {
    aimlabsAudio.setSoundEnabled(enabled);
    this.setState({ soundEnabled: enabled });
  }

  toggleSound() {
    this.setSoundEnabled(!this.state.soundEnabled);
  }

  skipRound() {
    if (this.state.status === "round1" || this.state.status === "round2") {
      this.finishRound();
    }
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
      telemetryTable: [...this.telemetryTable],
    };

    aimlabsAudio.playRoundComplete();

    // Check if this is the first played round or the second played round
    const hasExistingMetrics = Boolean(this.state.round1Metrics || this.state.round2Metrics);

    if (!hasExistingMetrics) {
      // First round complete -> go to intermission
      if (isRound1) {
        this.setState({
          round1Metrics: roundData,
          status: "intermission",
          isTargetVisible: false,
        });
      } else {
        this.setState({
          round2Metrics: roundData,
          status: "intermission",
          isTargetVisible: false,
        });
      }
    } else {
      // Both rounds complete -> go to finished report
      if (isRound1) {
        this.setState({
          round1Metrics: roundData,
          status: "finished",
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
  }

  tick(delta: number) {
    const { status, trialPhaseTime, isTargetVisible, isPaused } = this.state;
    if (status !== "round1" && status !== "round2") return;
    if (isPaused) return;

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
