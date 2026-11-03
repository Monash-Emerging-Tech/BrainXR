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
import { saveSessionReport, type CognitiveSessionReport } from "./reportStorage";

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
    const { totalShots, accurateShots, goHits, commissions, omissions } = this.metrics;
    let acc = 100;
    if (totalShots > 0) {
      acc = Math.min(100, Math.max(0, (accurateShots / totalShots) * 100));
      this.setState({ accuracy: acc });
    }

    const totalPresses = goHits + commissions;
    const precision =
      totalPresses > 0
        ? Math.min(100, Math.max(0, Math.round((goHits / totalPresses) * 100)))
        : omissions > 0
        ? 0
        : 100;

    this.updateLiveFocusMetrics(acc, precision);
  }

  private updateLiveFocusMetrics(acc: number, precision: number) {
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

    const totalGoTargets = this.metrics.goHits + this.metrics.omissions;
    const recall = totalGoTargets > 0 ? (this.metrics.goHits / totalGoTargets) * 100 : 100;
    const totalNoGoTargets = this.metrics.correctRejections + this.metrics.commissions;
    const specificity = totalNoGoTargets > 0 ? (this.metrics.correctRejections / totalNoGoTargets) * 100 : 100;
    const balancedAcc = (recall + specificity) / 2;

    let focusLevel: "Optimal Focus" | "Steady Focus" | "Variable Focus" | "Calibrating" = "Calibrating";
    let focusDescription = "Collecting baseline trials";

    // Gate 1: Calibration / minimum sample
    if (n >= 4 && this.metrics.totalShots >= 8) {
      // Check for Disengagement / Mindless Autopilot / High Error Rate
      const isDisengaged = recall < 80; // User missing > 20% of Go targets (omission lapses / inattention)
      const isIndiscriminate = precision < 70 || specificity < 50; // User clicking No-Go impulsively
      const isLowAccuracy = acc < 75 || balancedAcc < 70; // High overall error rate

      if (isDisengaged) {
        focusLevel = "Variable Focus";
        const missPct = Math.round(100 - recall);
        focusDescription = `Attentional lapse · ${missPct}% Go targets missed (OER > 20%)`;
      } else if (isIndiscriminate) {
        focusLevel = "Variable Focus";
        focusDescription = `Motor disinhibition · Low response precision (${Math.round(precision)}%)`;
      } else if (isLowAccuracy) {
        focusLevel = "Variable Focus";
        focusDescription = `High decision error rate (${Math.round(acc)}% accuracy)`;
      } else {
        // Performance gates passed -> evaluate temporal stability via CV
        if (cv > 0 && cv <= 0.18 && acc >= 88 && precision >= 85 && recall >= 90 && n >= 8) {
          focusLevel = "Optimal Focus";
          focusDescription = `Laser-like vigilance · Multiplier ${cv}x Mean RT (${Math.round(precision)}% Prec)`;
        } else if (cv > 0 && cv <= 0.28 && acc >= 75 && precision >= 70 && recall >= 80) {
          focusLevel = "Steady Focus";
          focusDescription = `Consistent sustained focus · Multiplier ${cv}x Mean RT (${Math.round(precision)}% Prec)`;
        } else {
          focusLevel = "Variable Focus";
          focusDescription = `Elevated response time dispersion (${cv}x variability)`;
        }
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
    const { totalShots, accurateShots, goHits, commissions, omissions } = this.metrics;
    const cumulativeAccuracy = totalShots > 0 ? Math.round((accurateShots / totalShots) * 100) : 100;
    const totalPresses = goHits + commissions;
    const cumulativePrecision =
      totalPresses > 0
        ? Math.min(100, Math.max(0, Math.round((goHits / totalPresses) * 100)))
        : omissions > 0
        ? 0
        : 100;

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
      cumulativePrecision,
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
    const m = this.metrics;
    const rts = m.reactionTimes;
    const meanRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;

    const variance =
      rts.length > 1
        ? rts.reduce((sum, val) => sum + Math.pow(val - meanRT, 2), 0) / (rts.length - 1)
        : 0;
    const sdRT = Math.round(Math.sqrt(variance));
    const cv = meanRT > 0 ? parseFloat((sdRT / meanRT).toFixed(2)) : 0;

    const roundPresses = m.goHits + m.commissions;
    const roundPrecision =
      roundPresses > 0
        ? Math.min(100, Math.max(0, Math.round((m.goHits / roundPresses) * 100)))
        : m.omissions > 0
        ? 0
        : 100;

    const roundGoTotal = m.goHits + m.omissions;
    const roundRecall = roundGoTotal > 0 ? (m.goHits / roundGoTotal) * 100 : 100;
    const roundNoGoTotal = m.correctRejections + m.commissions;
    const roundSpecificity = roundNoGoTotal > 0 ? (m.correctRejections / roundNoGoTotal) * 100 : 100;
    const roundBalancedAcc = (roundRecall + roundSpecificity) / 2;

    let roundFocusLevel: "Optimal Focus" | "Steady Focus" | "Variable Focus" = "Steady Focus";
    if (
      roundRecall < 80 ||
      roundPrecision < 70 ||
      this.state.accuracy < 75 ||
      roundBalancedAcc < 70 ||
      cv > 0.28 ||
      cv === 0
    ) {
      roundFocusLevel = "Variable Focus";
    } else if (
      cv > 0 &&
      cv <= 0.18 &&
      this.state.accuracy >= 88 &&
      roundPrecision >= 85 &&
      roundRecall >= 90 &&
      rts.length >= 8
    ) {
      roundFocusLevel = "Optimal Focus";
    } else {
      roundFocusLevel = "Steady Focus";
    }

    // Check if this is the first played round or the second played round
    const hasExistingMetrics = Boolean(this.state.round1Metrics || this.state.round2Metrics);
    const roundOrderPrefix = hasExistingMetrics ? "Round 2" : "Round 1";
    const paradigmName = isRound1 ? "CPT" : "SART";

    const roundData: RoundMetrics = {
      round: this.state.round,
      roundName: `${roundOrderPrefix}: ${paradigmName}`,
      totalTrials: TOTAL_TRIALS,
      sphereCount: SPHERE_COUNT,
      boxCount: BOX_COUNT,
      goHits: m.goHits,
      omissions: m.omissions,
      commissions: m.commissions,
      correctRejections: m.correctRejections,
      reactionTimes: rts,
      meanReactionTime: meanRT,
      sdReactionTime: sdRT,
      cv,
      focusLevel: roundFocusLevel,
      score: this.state.score,
      accuracy: this.state.accuracy,
      precision: roundPrecision,
      omissionRate: Math.round(100 - roundRecall),
      telemetryTable: [...this.telemetryTable],
    };

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

      const allRts = [...r1.reactionTimes, ...r2.reactionTimes];
      const overallMeanRT =
        allRts.length > 0 ? Math.round(allRts.reduce((a, b) => a + b, 0) / allRts.length) : 0;
      const overallVariance =
        allRts.length > 1
          ? allRts.reduce((sum, v) => sum + Math.pow(v - overallMeanRT, 2), 0) / (allRts.length - 1)
          : 0;
      const overallSdRT = Math.round(Math.sqrt(overallVariance));
      const overallCv = overallMeanRT > 0 ? parseFloat((overallSdRT / overallMeanRT).toFixed(2)) : 0;
      const overallAccuracy = Math.round((r1.accuracy + r2.accuracy) / 2);

      const totalGo = r1.goHits + r2.goHits;
      const totalCommissions = r1.commissions + r2.commissions;
      const totalPresses = totalGo + totalCommissions;
      const overallPrecision =
        totalPresses > 0 ? Math.min(100, Math.max(0, Math.round((totalGo / totalPresses) * 100))) : 0;

      const totalOmissions = r1.omissions + r2.omissions;
      const totalGoTargets = totalGo + totalOmissions;
      const overallRecall = totalGoTargets > 0 ? (totalGo / totalGoTargets) * 100 : 100;
      const overallOmissionRate = totalGoTargets > 0 ? Math.round((totalOmissions / totalGoTargets) * 100) : 0;
      const totalNoGo = r1.correctRejections + r2.correctRejections + totalCommissions;
      const overallSpecificity =
        totalNoGo > 0 ? ((r1.correctRejections + r2.correctRejections) / totalNoGo) * 100 : 100;
      const overallBalancedAcc = (overallRecall + overallSpecificity) / 2;

      let focusClassification: "Optimal Focus" | "Steady Focus" | "Variable Focus" = "Steady Focus";
      let focusDescription = "Consistent cognitive processing speed with standard baseline variability";

      if (
        overallRecall < 80 ||
        overallPrecision < 70 ||
        overallAccuracy < 75 ||
        overallBalancedAcc < 70 ||
        overallCv > 0.28 ||
        overallCv === 0
      ) {
        focusClassification = "Variable Focus";
        if (overallRecall < 80) {
          focusDescription = `High omission rate (${overallOmissionRate}% missed Go targets) indicating attentional lapses`;
        } else if (overallPrecision < 70) {
          focusDescription = `Elevated commission errors (${100 - overallPrecision}% false alarms) indicating motor impulsivity`;
        } else if (overallAccuracy < 75) {
          focusDescription = `Low decision accuracy (${overallAccuracy}%) across stimulus presentations`;
        } else {
          focusDescription = `Elevated response time variability (RT CV ${overallCv}x > 0.28) indicating cognitive fluctuation`;
        }
      } else if (
        overallCv > 0 &&
        overallCv <= 0.18 &&
        overallAccuracy >= 88 &&
        overallPrecision >= 85 &&
        overallRecall >= 90 &&
        allRts.length >= 15
      ) {
        focusClassification = "Optimal Focus";
        focusDescription = `High sustained attentional vigilance and tight inhibitory control (Acc ${overallAccuracy}%, Prec ${overallPrecision}%, Misses ${overallOmissionRate}%, RT CV ${overallCv}x)`;
      } else {
        focusClassification = "Steady Focus";
        focusDescription = `Consistent cognitive processing speed with reliable target detection (Acc ${overallAccuracy}%, Prec ${overallPrecision}%, Misses ${overallOmissionRate}%, RT CV ${overallCv}x)`;
      }

      const report: CognitiveSessionReport = {
        id: `session-${Date.now()}`,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        round1Metrics: r1,
        round2Metrics: r2,
        overallAccuracy,
        overallPrecision,
        overallOmissionRate,
        overallMeanRT,
        overallSdRT,
        overallCv,
        focusClassification,
        focusDescription,
        telemetryHistory: [...(r1.telemetryTable || []), ...(r2.telemetryTable || [])],
      };

      // Persist the full session telemetry report to localStorage
      saveSessionReport(report);

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
