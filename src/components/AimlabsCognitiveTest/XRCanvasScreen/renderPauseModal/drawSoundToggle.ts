import type { InteractiveHitArea } from "../types";

// Settings Section: Sound Toggle
export function drawSoundToggle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  hoverId: string | null | undefined,
  soundEnabled: boolean,
  hitAreas: InteractiveHitArea[]
): void {
  const settingsY = 520;
  const settingsW = 900;
  const settingsH = 64;
  const settingsX = cx - settingsW / 2;
  const isSoundHover = hoverId === "toggle-sound";

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
}
