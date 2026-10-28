import { ELECTRODE_METADATA, type ElectrodeName } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { REGION_RGBA } from "./regionColors";
import { laneCenterY, type LaneLayout } from "./layout";

const HISTORY_LIMIT = 60; // matches the engine's 3s @ 20 Hz ring buffer

interface DrawElectrodeLaneParams {
  ctx: CanvasRenderingContext2D;
  layout: LaneLayout;
  idx: number;
  name: ElectrodeName;
  history: HistorySample[];
  mean: number;
  maxDeviation: number;
  isSelected: boolean;
  isHovered?: boolean;
  theme?: "light" | "dark";
}

// Draws one electrode's baseline grid line, name label, and rolling
// waveform. The waveform switches to a dashed stroke during baseline
// samples and solid during stimulus samples, breaking the path at each
// phase transition so a single stroke() call can't blend the two styles.
export function drawElectrodeLane({
  ctx,
  layout,
  idx,
  name,
  history,
  mean,
  maxDeviation,
  isSelected,
  isHovered = false,
  theme = "light",
}: DrawElectrodeLaneParams): void {
  const isDark = theme === "dark";
  const meta = ELECTRODE_METADATA[name];
  const centerY = laneCenterY(layout, idx);
  const { paddingLeft, drawWidth, width, laneHeight } = layout;
  const laneY = centerY - laneHeight / 2;

  // Background hover/selection tint
  if (isSelected) {
    ctx.fillStyle = isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.08)";
    ctx.fillRect(paddingLeft - 40, laneY + 1, width - paddingLeft + 30, laneHeight - 2);
  } else if (isHovered) {
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(241, 245, 249, 0.6)";
    ctx.fillRect(paddingLeft - 40, laneY + 1, width - paddingLeft + 30, laneHeight - 2);
  }

  ctx.beginPath();
  ctx.strokeStyle = isSelected
    ? (isDark ? "rgba(129, 140, 248, 0.45)" : "rgba(99, 102, 241, 0.2)")
    : isHovered
    ? (isDark ? "rgba(129, 140, 248, 0.25)" : "rgba(99, 102, 241, 0.12)")
    : (isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)");
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.moveTo(paddingLeft, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  if (history.length <= 1) return;

  ctx.beginPath();
  // Soft, balanced signal color: gentle translucent white/slate in dark mode instead of glaring bright white
  const color = isDark
    ? { r: 241, g: 245, b: 249 }
    : (REGION_RGBA[meta.region] || { r: 100, g: 116, b: 139 });
  // Kept at a soft 0.38 opacity in dark mode so it feels like a subtle ambient oscilloscope trace
  const opacity = isSelected ? 0.9 : isHovered ? 0.75 : (isDark ? 0.38 : 0.35);
  ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
  ctx.lineWidth = isSelected ? 2.2 : isHovered ? 1.6 : (isDark ? 1.2 : 1.2);

  const step = drawWidth / (HISTORY_LIMIT - 1);

  history.forEach((sample, i) => {
    const yOffset = ((sample.value - mean) / maxDeviation) * (laneHeight * 0.8 / 2);
    const x = paddingLeft + i * step;
    const y = centerY - yOffset;

    if (i === 0) {
      ctx.moveTo(x, y);
      return;
    }

    const prevSample = history[i - 1];
    if (prevSample.isBaseline !== sample.isBaseline) {
      // Complete the path in the previous segment's style before starting a new one.
      ctx.setLineDash(prevSample.isBaseline ? [2, 3] : []);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  const lastSample = history[history.length - 1];
  ctx.setLineDash(lastSample.isBaseline ? [2, 3] : []);
  ctx.stroke();
  ctx.setLineDash([]);
}
