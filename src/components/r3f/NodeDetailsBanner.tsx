import React from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import { getElectrodeMetadata } from "../../utils/signalSource";
import { REGION_COLOR } from "../../utils/electrodeVisualState";
import { NODE_INSIGHTS } from "../../utils/nodeInsights";
import { ELECTRODE_DISPLAY_ORDER } from "../../utils/electrodeDisplayOrder";

interface NodeDetailsBannerProps {
  channel: ElectrodeName | null;
  isPrefrontalGroup: boolean;
  frame: Frame;
  onSelectChannel: (name: ElectrodeName) => void;
}

export const NodeDetailsBanner: React.FC<NodeDetailsBannerProps> = ({
  channel,
  isPrefrontalGroup,
  frame,
  onSelectChannel,
}) => {
  // If prefrontal group toggle is active without an individual channel chosen, default to FpZ
  const activeChannel: ElectrodeName | null =
    channel ?? (isPrefrontalGroup ? "FpZ" : null);

  if (!activeChannel) return null;

  const meta = getElectrodeMetadata(activeChannel);
  const insight = NODE_INSIGHTS[activeChannel];
  const region = meta?.region ?? "Frontal";
  const accentColor = REGION_COLOR[region] ?? "#6366f1";
  const rawSample = frame.channels[activeChannel];
  const rawValue = rawSample?.value ?? 0;

  const currentIndex = ELECTRODE_DISPLAY_ORDER.indexOf(activeChannel);
  const prevIndex =
    currentIndex <= 0 ? ELECTRODE_DISPLAY_ORDER.length - 1 : currentIndex - 1;
  const nextIndex =
    currentIndex >= ELECTRODE_DISPLAY_ORDER.length - 1 ? 0 : currentIndex + 1;

  const prevChannel = ELECTRODE_DISPLAY_ORDER[prevIndex];
  const nextChannel = ELECTRODE_DISPLAY_ORDER[nextIndex];

  const prevMeta = getElectrodeMetadata(prevChannel);
  const nextMeta = getElectrodeMetadata(nextChannel);

  const prevColor = REGION_COLOR[prevMeta?.region ?? "Frontal"] ?? "#6366f1";
  const nextColor = REGION_COLOR[nextMeta?.region ?? "Frontal"] ?? "#6366f1";

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectChannel(prevChannel);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectChannel(nextChannel);
  };

  return (
    <div className="relative flex items-center justify-between gap-4 w-full mt-3 select-none animate-fade-in pointer-events-auto">
      {/* Big Circular Left Arrow - Filled circle colored with previous node's region color, hollow arrow inside */}
      <button
        onClick={handlePrevious}
        className="group relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          backgroundColor: prevColor,
          boxShadow: `0 0 16px ${prevColor}60, 0 4px 12px rgba(0,0,0,0.3)`,
        }}
        title={`Previous node: ${prevChannel} (${prevMeta?.region})`}
        aria-label={`Previous node: ${prevChannel}`}
      >
        {/* Hollow / stroked chevron arrow */}
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 stroke-white text-transparent transition-transform duration-200 group-hover:-translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Main Content Area: Completely Transparent with Drop Shadow on Typography, Left/Justify Aligned */}
      <div className="flex flex-col items-start gap-1 flex-1 min-w-0 bg-transparent text-slate-800 text-left px-2 sm:px-4">
        {/* Top Header: Group & Channel Badges + Raw Voltage */}
        <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 text-xs w-full">
          {/* Cortical Region Pill */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] shadow-sm backdrop-blur-sm"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
              border: `1.5px solid ${accentColor}`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
            />
            {region} Cortex
          </span>

          {/* Node Name */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-900 text-base sm:text-lg font-black tracking-wide drop-shadow-sm">
              {activeChannel}
            </span>
            <span className="text-slate-500 font-semibold text-xs sm:text-sm">
              ({meta?.fullName})
            </span>
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block h-4 w-[1.5px] bg-slate-300" />

          {/* Live Raw Voltage Readout */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-500 text-[11px] uppercase font-bold">Raw:</span>
            <span className="font-extrabold text-emerald-600 text-xs sm:text-sm">
              {rawValue >= 0 ? `+${rawValue.toFixed(2)}` : rawValue.toFixed(2)} µV
            </span>
          </div>
        </div>

        {/* Insight Section: What we can measure / Brain insight */}
        {insight && (
          <div className="flex flex-col items-start text-left gap-0.5 w-full">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              Measures: <span style={{ color: accentColor }}>{insight.metricName}</span>
            </span>
            <p className="text-xs text-slate-600 leading-snug font-medium text-justify w-full">
              {insight.description}
            </p>
          </div>
        )}
      </div>

      {/* Big Circular Right Arrow - Filled circle colored with next node's region color, hollow arrow inside */}
      <button
        onClick={handleNext}
        className="group relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          backgroundColor: nextColor,
          boxShadow: `0 0 16px ${nextColor}60, 0 4px 12px rgba(0,0,0,0.3)`,
        }}
        title={`Next node: ${nextChannel} (${nextMeta?.region})`}
        aria-label={`Next node: ${nextChannel}`}
      >
        {/* Hollow / stroked chevron arrow */}
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 stroke-white text-transparent transition-transform duration-200 group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

export default NodeDetailsBanner;
