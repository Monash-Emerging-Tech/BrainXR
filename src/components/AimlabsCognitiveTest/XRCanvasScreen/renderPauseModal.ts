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
    precision: 100,
    telemetryTable: [],
  };

  // 1. Modal Header Badge
  const badgeText = "GAME PAUSED";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  const badgeW = 160;
  const badgeH = 34;
  const badgeY = 65;
  ctx.fillStyle = "rgba(243, 218, 102, 0.2)";
  ctx.strokeStyle = "rgba(243, 218, 102, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#F3DA66";
  ctx.fillText(badgeText, cx, badgeY + 22);

  // 2. Large Modal Title
  ctx.font = "bold 38px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("PAUSE MENU", cx, 134);

  // 3. Subtitle
  ctx.font = "16px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`${roundTitle} · ${roundFullName}`, cx, 164);

  // 4. Center Top Rule Buttons (communicating stimulus rules identical to Top HUD)
  const ruleW = 620;
  const ruleH = 58;
  const ruleX = cx - ruleW / 2;
  const ruleY = 194;

  ctx.fillStyle = "rgba(13, 13, 16, 0.9)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(ruleX, ruleY, ruleW, ruleH, 12);
  ctx.fill();
  ctx.stroke();

  if (isRound1) {
    // Round 1 (CPT): Green Sphere = Press, Red Box = Avoid
    drawPauseRuleBadge(ctx, ruleX + 8, ruleY + 5, 296, 48, "GREEN SPHERE", "PRESS", "#34d399", true);
    drawPauseRuleBadge(ctx, ruleX + 316, ruleY + 5, 296, 48, "RED BOX", "DO NOT PRESS", "#f43f5e", false);
  } else {
    // Round 2 (SART): Red Box = Press, Green Sphere = Avoid
    drawPauseRuleBadge(ctx, ruleX + 8, ruleY + 5, 296, 48, "RED BOX", "PRESS", "#f43f5e", true);
    drawPauseRuleBadge(ctx, ruleX + 316, ruleY + 5, 296, 48, "GREEN SPHERE", "DO NOT PRESS", "#34d399", false);
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
      ? "#F3DA66"
      : "#94a3b8";
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = focusColor;
  ctx.fillText(`[${m.focusLevel}]`, graphX + 210, graphY + 30);

  if (m.cv > 0) {
    ctx.font = "11px monospace";
    ctx.fillStyle = "#F3DA66";
    ctx.fillText(`RT CV: ${(m.cv * 100).toFixed(0)}% (${m.cv}x Mean RT)`, graphX + 340, graphY + 30);
  }

  // Legend on Right
  ctx.font = "11px monospace";
  ctx.textAlign = "right";
  // Moving RT
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("— Moving RT", graphX + graphW - 275, graphY + 30);
  // ±1.5x SD Band
  ctx.fillStyle = "#F3DA66";
  ctx.fillText("░ ±1.5x SD Band", graphX + graphW - 220, graphY + 30);
  // ±1.5x SD Whisker
  ctx.fillStyle = "rgba(243, 218, 102, 0.75)";
  ctx.fillText("╌ ±1.5x SD Whisker", graphX + graphW - 98, graphY + 30);
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
    ctx.fillStyle = "rgba(243, 218, 102, 0.07)";
    ctx.beginPath();
    ctx.moveTo(outerUpperPoints[0].x, outerUpperPoints[0].y);
    outerUpperPoints.forEach((p) => ctx.lineTo(p.x, p.y));
    for (let i = outerLowerPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(outerLowerPoints[i].x, outerLowerPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // 1b. Outer 1.5x SD whisker dashed boundary lines
    ctx.strokeStyle = "rgba(243, 218, 102, 0.35)";
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
    ctx.fillStyle = "rgba(243, 218, 102, 0.22)";
    ctx.strokeStyle = "rgba(243, 218, 102, 0.4)";
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
  ctx.fillText("Median: ", graphX + 185, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#818cf8";
  ctx.fillText(`${m.medianRT}ms`, graphX + 242, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("SD: ", graphX + 340, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#F3DA66";
  ctx.fillText(`±${m.sdRT}ms ${m.cv > 0 ? `(${m.cv}x)` : ""}`, graphX + 368, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Acc: ", graphX + 560, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#34d399";
  ctx.fillText(`${m.accuracy}%`, graphX + 596, summaryY);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Prec: ", graphX + 710, summaryY);
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#a5b4fc";
  ctx.fillText(`${Math.round(m.precision ?? 100)}%`, graphX + 754, summaryY);

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
  ctx.fillStyle = isBackHover ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.06)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(backBtnX, btnRowY, btnW, btnH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = isBackHover ? "#ffffff" : "#cbd5e1";
  ctx.textAlign = "center";
  ctx.fillText("← Back", backBtnX + btnW / 2, btnRowY + 40);
  hitAreas.push({ id: "home", type: "home", x: backBtnX, y: btnRowY, width: btnW, height: btnH });

  // Button 2: Resume (White Cyber Primary Button)
  const resumeX = btnStartX + (btnW + btnGap);
  const isResumeHover = state.hoverId === "toggle-pause";
  ctx.fillStyle = isResumeHover ? "#e2e8f0" : "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(resumeX, btnRowY, btnW, btnH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 20px 'OffBit', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText("▶ RESUME", resumeX + btnW / 2, btnRowY + 40);
  hitAreas.push({ id: "toggle-pause", type: "toggle-pause", x: resumeX, y: btnRowY, width: btnW, height: btnH });

  // Button 3: Skip
  const skipX = btnStartX + (btnW + btnGap) * 2;
  const isSkipHover = state.hoverId === "skip-round";
  ctx.fillStyle = isSkipHover ? "rgba(251, 191, 36, 0.2)" : "rgba(251, 191, 36, 0.1)";
  ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(skipX, btnRowY, btnW, btnH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.font = "bold 18px monospace";
  ctx.letterSpacing = "0px";
  ctx.fillStyle = isSkipHover ? "#fbbf24" : "#fef08a";
  ctx.textAlign = "center";
  ctx.fillText("Skip Round ⇥", skipX + btnW / 2, btnRowY + 40);
  hitAreas.push({ id: "skip-round", type: "skip-round", x: skipX, y: btnRowY, width: btnW, height: btnH });

  // Bottom Notice
  ctx.font = "13px monospace";
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.fillText("Stimulus response timer is frozen while paused. Click Resume, press [B] / [Y], or press Esc to resume.", cx, 715);
}

function drawPauseRuleBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  name: string,
  action: string,
  color: string,
  isPress: boolean
): void {
  const isEmerald = color === "#34d399";
  if (isPress) {
    ctx.fillStyle = isEmerald ? "rgba(52, 211, 153, 0.15)" : "rgba(244, 63, 94, 0.15)";
    ctx.strokeStyle = isEmerald ? "rgba(52, 211, 153, 0.4)" : "rgba(244, 63, 94, 0.4)";
  } else {
    ctx.fillStyle = isEmerald ? "rgba(52, 211, 153, 0.08)" : "rgba(244, 63, 94, 0.08)";
    ctx.strokeStyle = isEmerald ? "rgba(52, 211, 153, 0.3)" : "rgba(244, 63, 94, 0.3)";
  }
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();

  // Target indicator icon
  ctx.fillStyle = color;
  ctx.beginPath();
  if (name.includes("SPHERE")) {
    ctx.arc(x + 24, y + h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.roundRect(x + 17, y + h / 2 - 7, 14, 14, 3);
    ctx.fill();
  }

  // Target label
  ctx.font = "bold 10px monospace";
  ctx.letterSpacing = "1px";
  ctx.fillStyle = isEmerald ? "#6ee7b7" : "#fda4af";
  ctx.textAlign = "left";
  ctx.fillText(name, x + 40, y + 19);

  // Action text
  ctx.font = "bold 15px 'OffBit', monospace";
  ctx.letterSpacing = "1px";
  ctx.fillStyle = isPress ? "#ffffff" : isEmerald ? "#6ee7b7" : "#fda4af";
  ctx.fillText(action, x + 40, y + 37);
  ctx.letterSpacing = "0px";
}
