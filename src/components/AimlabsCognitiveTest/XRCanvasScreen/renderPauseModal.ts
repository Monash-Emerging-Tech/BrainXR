import type { TargetTelemetryRecord, LiveFocusMetrics } from "../types";
import type { CanvasScreenRenderState, InteractiveHitArea } from "./types";

export function renderPauseModal(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CanvasScreenRenderState,
  hitAreas: InteractiveHitArea[]
): void {
  const cx = width / 2;
  const isRound1 = state.round === 1;
  const roundTitle = isRound1 ? "ROUND 1 · CPT" : "ROUND 2 · SART";
  const roundFullName = isRound1
    ? "Continuous Performance Test"
    : "Sustained Attention to Response Task";

  const m: LiveFocusMetrics = state.liveFocusMetrics || {
    reactionTimes: [],
    meanRT: 0,
    medianRT: 0,
    sdRT: 0,
    cv: 0,
    focusLevel: "Calibrating",
    focusDescription: "Collecting baseline response times",
    boxesHit: 0,
    boxesMissed: 0,
    spheresHit: 0,
    spheresMissed: 0,
    accuracy: Math.round(state.accuracy),
    telemetryTable: [],
  };

  // 1. Modal Header Badge
  const badgeText = "GAME PAUSED";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  const badgeW = 160;
  const badgeH = 34;
  const badgeY = 65;
  ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
  ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fbbf24";
  ctx.fillText(badgeText, cx, badgeY + 22);

  // 2. Large Modal Title
  ctx.font = "bold 38px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("PAUSE MENU", cx, 134);

  // 3. Subtitle
  ctx.font = "16px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`${roundTitle} · ${roundFullName}`, cx, 164);

  // 4. Target Rules with embedded hit/miss tally
  const ruleY = 194;
  const ruleW = 440;
  const ruleH = 68;
  const ruleGap = 20;

  if (isRound1) {
    // Round 1 (CPT): Hit Sphere
    const leftX = cx - ruleW - ruleGap / 2;
    ctx.fillStyle = "rgba(4, 47, 46, 0.6)";
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX, ruleY, ruleW, ruleH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(leftX + 32, ruleY + ruleH / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "bold 15px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Hit Sphere", leftX + 54, ruleY + 28);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Hit: `, leftX + 54, ruleY + 50);
    ctx.fillStyle = "#34d399";
    ctx.fillText(`${m.spheresHit}`, leftX + 88, ruleY + 50);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(` · Miss: `, leftX + 115, ruleY + 50);
    ctx.fillStyle = "#f43f5e";
    ctx.fillText(`${m.spheresMissed}`, leftX + 180, ruleY + 50);

    ctx.textAlign = "right";
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "#22d3ee";
    ctx.fillText("PRESS", leftX + ruleW - 20, ruleY + 40);

    // Round 1 (CPT): Avoid Box
    const rightX = cx + ruleGap / 2;
    ctx.fillStyle = "rgba(76, 5, 25, 0.4)";
    ctx.strokeStyle = "rgba(244, 63, 94, 0.35)";
    ctx.beginPath();
    ctx.roundRect(rightX, ruleY, ruleW, ruleH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.roundRect(rightX + 22, ruleY + ruleH / 2 - 10, 20, 20, 4);
    ctx.fill();

    ctx.font = "bold 15px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Avoid Box", rightX + 54, ruleY + 28);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Avoided: `, rightX + 54, ruleY + 50);
    ctx.fillStyle = "#34d399";
    ctx.fillText(`${Math.max(0, 37 - m.boxesMissed)}`, rightX + 124, ruleY + 50);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(` · Faults: `, rightX + 148, ruleY + 50);
    ctx.fillStyle = "#f43f5e";
    ctx.fillText(`${m.boxesMissed}`, rightX + 226, ruleY + 50);

    ctx.textAlign = "right";
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "#f43f5e";
    ctx.fillText("AVOID", rightX + ruleW - 20, ruleY + 40);
  } else {
    // Round 2 (SART): Hit Box
    const leftX = cx - ruleW - ruleGap / 2;
    ctx.fillStyle = "rgba(76, 5, 25, 0.45)";
    ctx.strokeStyle = "rgba(244, 63, 94, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX, ruleY, ruleW, ruleH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.roundRect(leftX + 22, ruleY + ruleH / 2 - 10, 20, 20, 4);
    ctx.fill();

    ctx.font = "bold 15px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Hit Box", leftX + 54, ruleY + 28);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Hit: `, leftX + 54, ruleY + 50);
    ctx.fillStyle = "#34d399";
    ctx.fillText(`${m.boxesHit}`, leftX + 88, ruleY + 50);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(` · Miss: `, leftX + 115, ruleY + 50);
    ctx.fillStyle = "#f43f5e";
    ctx.fillText(`${m.boxesMissed}`, leftX + 180, ruleY + 50);

    ctx.textAlign = "right";
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "#f43f5e";
    ctx.fillText("PRESS", leftX + ruleW - 20, ruleY + 40);

    // Round 2 (SART): Avoid Sphere
    const rightX = cx + ruleGap / 2;
    ctx.fillStyle = "rgba(4, 47, 46, 0.4)";
    ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
    ctx.beginPath();
    ctx.roundRect(rightX, ruleY, ruleW, ruleH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(rightX + 32, ruleY + ruleH / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "bold 15px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Avoid Sphere", rightX + 54, ruleY + 28);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Avoided: `, rightX + 54, ruleY + 50);
    ctx.fillStyle = "#34d399";
    ctx.fillText(`${Math.max(0, 150 - m.spheresMissed)}`, rightX + 124, ruleY + 50);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(` · Faults: `, rightX + 158, ruleY + 50);
    ctx.fillStyle = "#f43f5e";
    ctx.fillText(`${m.spheresMissed}`, rightX + 236, ruleY + 50);

    ctx.textAlign = "right";
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "#22d3ee";
    ctx.fillText("AVOID", rightX + ruleW - 20, ruleY + 40);
  }

  // 5. Unified Performance Graph: RT & Moving Avg / SD Band (Left Axis) + Accuracy % (Right Axis)
  const graphY = 282;
  const graphW = 900;
  const graphH = 220;
  const graphX = cx - graphW / 2;

  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(graphX, graphY, graphW, graphH, 20);
  ctx.fill();
  ctx.stroke();

  // Header Bar inside Graph
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText("SESSION PERFORMANCE", graphX + 24, graphY + 30);

  // Focus Category Badge in Header
  const focusColor =
    m.focusLevel === "Optimal Focus"
      ? "#34d399"
      : m.focusLevel === "Steady Focus"
      ? "#38bdf8"
      : m.focusLevel === "Variable Focus"
      ? "#fbbf24"
      : "#94a3b8";
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = focusColor;
  ctx.fillText(`[${m.focusLevel}]`, graphX + 210, graphY + 30);

  if (m.cv > 0) {
    ctx.font = "11px monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`CV: ${(m.cv * 100).toFixed(0)}% (${m.cv}x Mean)`, graphX + 340, graphY + 30);
  }

  // Legend on Right
  ctx.font = "11px monospace";
  ctx.textAlign = "right";
  // Moving RT
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("— Moving RT", graphX + graphW - 275, graphY + 30);
  // ±1.0x SD Band
  ctx.fillStyle = "#fbbf24";
  ctx.fillText("░ ±1.0x SD", graphX + graphW - 190, graphY + 30);
  // ±1.5x Whisker
  ctx.fillStyle = "rgba(251, 191, 36, 0.75)";
  ctx.fillText("╌ ±1.5x Whisker", graphX + graphW - 98, graphY + 30);
  // Accuracy %
  ctx.fillStyle = "#34d399";
  ctx.fillText("--- Acc %", graphX + graphW - 24, graphY + 30);

  // Chart Inner Viewport
  const chartPadL = 50;
  const chartPadR = 50;
  const chartPadT = 44;
  const chartPadB = 36;
  const chartX = graphX + chartPadL;
  const chartY = graphY + chartPadT;
  const chartW = graphW - chartPadL - chartPadR;
  const chartH = graphH - chartPadT - chartPadB;

  // Background Box for chart
  ctx.fillStyle = "rgba(2, 6, 23, 0.65)";
  ctx.beginPath();
  ctx.roundRect(chartX, chartY, chartW, chartH, 10);
  ctx.fill();

  // Horizontal Grid Lines
  ctx.strokeStyle = "rgba(51, 65, 85, 0.35)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  [0.25, 0.5, 0.75].forEach((ratio) => {
    const gy = chartY + chartH * ratio;
    ctx.beginPath();
    ctx.moveTo(chartX, gy);
    ctx.lineTo(chartX + chartW, gy);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Axis Labels
  ctx.font = "10px monospace";
  // Left Axis (RT ms)
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "right";
  ctx.fillText("550ms", chartX - 6, chartY + 10);
  ctx.fillText("325ms", chartX - 6, chartY + chartH / 2 + 4);
  ctx.fillText("100ms", chartX - 6, chartY + chartH);

  // Right Axis (Accuracy %)
  ctx.fillStyle = "#10b981";
  ctx.textAlign = "left";
  ctx.fillText("100%", chartX + chartW + 6, chartY + 10);
  ctx.fillText("50%", chartX + chartW + 6, chartY + chartH / 2 + 4);
  ctx.fillText("0%", chartX + chartW + 6, chartY + chartH);

  const data: TargetTelemetryRecord[] = (m.telemetryTable && m.telemetryTable.length > 0) ? m.telemetryTable.slice(-36) : [];
  if (data.length > 1) {
    const count = data.length;
    const minRT = 100;
    const maxRT = 550;
    const rtRange = maxRT - minRT;

    const getYForRT = (val: number) => {
      const clamped = Math.max(minRT, Math.min(maxRT, val));
      return chartY + chartH - ((clamped - minRT) / rtRange) * chartH;
    };

    const getYForAcc = (acc: number) => {
      const clamped = Math.max(0, Math.min(100, acc));
      return chartY + chartH - (clamped / 100) * chartH;
    };

    const getX = (idx: number) => chartX + (idx / (count - 1)) * chartW;

    // 1. Draw Dual SD Bands: Outer +/- 1.5x SD (Whisker Envelope) & Inner +/- 1.0x SD (Core Corridor)
    const innerUpperPoints: { x: number; y: number }[] = [];
    const innerLowerPoints: { x: number; y: number }[] = [];
    const outerUpperPoints: { x: number; y: number }[] = [];
    const outerLowerPoints: { x: number; y: number }[] = [];

    data.forEach((d, i) => {
      const x = getX(i);
      const avg = d.movingAverageRT > 0 ? d.movingAverageRT : (d.reactionTime || m.meanRT || 300);
      const sd = d.movingSdRT || m.sdRT || 30;
      innerUpperPoints.push({ x, y: getYForRT(avg - sd) });
      innerLowerPoints.push({ x, y: getYForRT(avg + sd) });
      outerUpperPoints.push({ x, y: getYForRT(avg - 1.5 * sd) });
      outerLowerPoints.push({ x, y: getYForRT(avg + 1.5 * sd) });
    });

    // 1a. Outer 1.5x SD whisker band fill
    ctx.fillStyle = "rgba(245, 158, 11, 0.07)";
    ctx.beginPath();
    ctx.moveTo(outerUpperPoints[0].x, outerUpperPoints[0].y);
    outerUpperPoints.forEach((p) => ctx.lineTo(p.x, p.y));
    for (let i = outerLowerPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(outerLowerPoints[i].x, outerLowerPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // 1b. Outer 1.5x SD whisker dashed boundary lines
    ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    outerUpperPoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.beginPath();
    outerLowerPoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 1c. Inner 1.0x SD core focus band
    ctx.fillStyle = "rgba(245, 158, 11, 0.22)";
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(innerUpperPoints[0].x, innerUpperPoints[0].y);
    innerUpperPoints.forEach((p) => ctx.lineTo(p.x, p.y));
    for (let i = innerLowerPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(innerLowerPoints[i].x, innerLowerPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Draw Cumulative Accuracy Line (Emerald Dashed)
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = getX(i);
      const y = getYForAcc(d.cumulativeAccuracy);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Moving Average RT Line (Cyan Solid)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = getX(i);
      const avg = d.movingAverageRT > 0 ? d.movingAverageRT : (d.reactionTime || m.meanRT || 300);
      const y = getYForRT(avg);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 4. Draw Individual Target Response Dots
    data.forEach((d, i) => {
      if (d.reactionTime) {
        const x = getX(i);
        const y = getYForRT(d.reactionTime);
        ctx.fillStyle = d.isCorrect ? "#00f0ff" : "#f43f5e";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  } else {
    ctx.font = "italic 13px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Collecting live response telemetry...", chartX + chartW / 2, chartY + chartH / 2 - 4);
    ctx.font = "11px monospace";
    ctx.fillText("Plotting moving average, SD confidence envelope, and accuracy", chartX + chartW / 2, chartY + chartH / 2 + 16);
  }

  // Bottom Summary Bar inside Graph
  const summaryY = graphY + graphH - 14;
  ctx.textAlign = "left";
  ctx.font = "12px monospace";

  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Mean RT: ", graphX + 24, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`${m.meanRT}ms`, graphX + 88, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Median RT: ", graphX + 230, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#818cf8";
  ctx.fillText(`${m.medianRT}ms`, graphX + 310, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("SD Multiplier: ", graphX + 450, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText(`±${m.sdRT}ms ${m.cv > 0 ? `(${m.cv}x)` : ""}`, graphX + 550, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Accuracy: ", graphX + 710, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#34d399";
  ctx.fillText(`${m.accuracy}%`, graphX + 786, summaryY);

  // 6. Settings Section: Sound Toggle
  const settingsY = 520;
  const settingsW = 900;
  const settingsH = 64;
  const settingsX = cx - settingsW / 2;
  const isSoundHover = state.hoverId === "toggle-sound";
  const soundEnabled = state.soundEnabled !== false;

  ctx.fillStyle = isSoundHover ? "rgba(30, 41, 59, 0.9)" : "rgba(15, 23, 42, 0.75)";
  ctx.strokeStyle = isSoundHover ? "rgba(99, 102, 241, 0.6)" : "rgba(51, 65, 85, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(settingsX, settingsY, settingsW, settingsH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.font = "bold 15px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Audio Feedback Synthesizer", settingsX + 24, settingsY + 30);
  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Target pop chimes and audio feedback", settingsX + 24, settingsY + 50);

  // Toggle Switch on Right
  const pillW = 80;
  const pillH = 34;
  const pillX = settingsX + settingsW - pillW - 20;
  const pillY = settingsY + (settingsH - pillH) / 2;

  ctx.fillStyle = soundEnabled ? "#4f46e5" : "#334155";
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 13px monospace";
  ctx.fillText(soundEnabled ? "ON" : "OFF", pillX + pillW / 2, pillY + 22);

  hitAreas.push({
    id: "toggle-sound",
    type: "toggle-sound",
    x: settingsX,
    y: settingsY,
    width: settingsW,
    height: settingsH,
  });

  // 7. Action Buttons (1 line for all 3 buttons: Back, Resume, Skip)
  const btnRowY = 612;
  const btnH = 64;
  const btnW = 280;
  const btnGap = 30;
  const totalBtnsW = btnW * 3 + btnGap * 2;
  const btnStartX = cx - totalBtnsW / 2;

  // Button 1: Back
  const backBtnX = btnStartX;
  const isBackHover = state.hoverId === "home";
  ctx.fillStyle = isBackHover ? "#334155" : "#0f172a";
  ctx.strokeStyle = isBackHover ? "#94a3b8" : "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(backBtnX, btnRowY, btnW, btnH, btnH / 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = isBackHover ? "#ffffff" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("← Back", backBtnX + btnW / 2, btnRowY + 40);
  hitAreas.push({ id: "home", type: "home", x: backBtnX, y: btnRowY, width: btnW, height: btnH });

  // Button 2: Resume
  const resumeX = btnStartX + (btnW + btnGap);
  const isResumeHover = state.hoverId === "toggle-pause";
  ctx.fillStyle = isResumeHover ? "#4f46e5" : "#4338ca";
  ctx.strokeStyle = isResumeHover ? "#818cf8" : "#6366f1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(resumeX, btnRowY, btnW, btnH, btnH / 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("▶ Resume", resumeX + btnW / 2, btnRowY + 40);
  hitAreas.push({ id: "toggle-pause", type: "toggle-pause", x: resumeX, y: btnRowY, width: btnW, height: btnH });

  // Button 3: Skip
  const skipX = btnStartX + (btnW + btnGap) * 2;
  const isSkipHover = state.hoverId === "skip-round";
  ctx.fillStyle = isSkipHover ? "#1e293b" : "#0f172a";
  ctx.strokeStyle = isSkipHover ? "#fbbf24" : "rgba(245, 158, 11, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(skipX, btnRowY, btnW, btnH, btnH / 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = isSkipHover ? "#fbbf24" : "#fef3c7";
  ctx.textAlign = "center";
  ctx.fillText("Skip ⇥", skipX + btnW / 2, btnRowY + 40);
  hitAreas.push({ id: "skip-round", type: "skip-round", x: skipX, y: btnRowY, width: btnW, height: btnH });

  // Bottom Notice
  ctx.font = "13px monospace";
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.fillText("Stimulus response timer is frozen while paused. Click Resume or press Spacebar to resume.", cx, 715);
}
