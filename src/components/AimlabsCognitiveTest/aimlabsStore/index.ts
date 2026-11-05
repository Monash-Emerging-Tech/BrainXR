import { aimlabsAudio } from "../audio";
import { generateRoundSequence, TOTAL_TRIALS } from "../sequencer";
import type {
  TargetType,
  CognitiveRoundType,
  GameStatus,
  RoundMetrics,
  LiveFocusMetrics,
  StimulusDefinition,
} from "../types";
import type { ShatterBurstData } from "../AimlabsShatters";
import { saveSessionReport } from "../reportStorage";
import { createEmptyCounters, computeAccuracy, computePrecision, computeRecall, computeSpecificity, computeBalancedAccuracy } from "./trialCounters";
import { computeLiveRtStats } from "./rtStats";
import { classifyLiveFocus } from "./focusClassification";
import { buildTelemetryRecord } from "./telemetry";
import { buildRoundMetrics } from "./roundMetrics";
import { buildSessionReport } from "./sessionReport";

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
  precision: 100,
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
  private metrics = createEmptyCounters();
  private pauseStartTime: number = 0;
  private telemetryTable: ReturnType<typeof buildTelemetryRecord>[] = [];

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
    this.metrics = createEmptyCounters();

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
    const acc = computeAccuracy(this.metrics);
    if (this.metrics.totalShots > 0) {
      this.setState({ accuracy: acc });
    }
    const precision = computePrecision(this.metrics);
    this.updateLiveFocusMetrics(acc, precision);
  }

  private updateLiveFocusMetrics(acc: number, precision: number) {
    const rts = [...this.metrics.reactionTimes];
    const { meanRT, medianRT, sdRT, cv } = computeLiveRtStats(rts);
    const recall = computeRecall(this.metrics);
    const specificity = computeSpecificity(this.metrics);
    const balancedAcc = computeBalancedAccuracy(recall, specificity);

    const { focusLevel, focusDescription } = classifyLiveFocus({
      n: rts.length,
      totalShots: this.metrics.totalShots,
      acc,
      precision,
      recall,
      specificity,
      balancedAcc,
      cv,
    });

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
      precision: Math.round(precision),
      omissionRate: Math.round(100 - recall),
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
    this.telemetryTable.push(buildTelemetryRecord(trialIndex, item, userResponded, isCorrect, rt, this.metrics));
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
        // Keep non-responses silent to prevent auditory alerting confounds on the subsequent trial
        this.metrics.correctRejections++;
        this.metrics.accurateShots++;
        this.metrics.totalShots++;
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
    const hasExistingMetrics = Boolean(this.state.round1Metrics || this.state.round2Metrics);
    const roundOrderPrefix: "Round 1" | "Round 2" = hasExistingMetrics ? "Round 2" : "Round 1";

    const roundData = buildRoundMetrics({
      round: this.state.round,
      roundOrderPrefix,
      score: this.state.score,
      accuracy: this.state.accuracy,
      counters: this.metrics,
      telemetryTable: this.telemetryTable,
    });

    aimlabsAudio.playRoundComplete();

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
      const r1 = isRound1 ? roundData : this.state.round1Metrics!;
      const r2 = !isRound1 ? roundData : this.state.round2Metrics!;

      // Persist the full session telemetry report to localStorage
      saveSessionReport(buildSessionReport(r1, r2));

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
