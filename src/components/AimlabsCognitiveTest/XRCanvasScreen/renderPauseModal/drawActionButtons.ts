import type { InteractiveHitArea } from "../types";

// Action Buttons (1 line for all 3 buttons: Back, Resume, Skip)
export function drawActionButtons(
  ctx: CanvasRenderingContext2D,
  cx: number,
  hoverId: string | null | undefined,
  hitAreas: InteractiveHitArea[]
): void {
  const btnRowY = 612;
  const btnH = 64;
  const btnW = 280;
  const btnGap = 30;
  const totalBtnsW = btnW * 3 + btnGap * 2;
  const btnStartX = cx - totalBtnsW / 2;

  // Button 1: Back
  const backBtnX = btnStartX;
  const isBackHover = hoverId === "home";
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
  const isResumeHover = hoverId === "toggle-pause";
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
  const isSkipHover = hoverId === "skip-round";
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
}
