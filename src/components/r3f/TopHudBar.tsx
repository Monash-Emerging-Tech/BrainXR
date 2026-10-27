import React from "react";
import type { PlaybackEngine } from "../../hooks/usePlaybackEngine";
import BackButton from "./BackButton";
import { xrStore } from "../../utils/xrStore";

interface TopHudBarProps {
  engine: PlaybackEngine;
  onBack: () => void;
  focusSensorsActive: boolean;
  onShowPrefrontal: () => void;
}

// Top HUD nav bar: exit button (left), focus sensors monitor (center),
// Enter VR button (right). Hidden entirely in idle mode by the caller.
const TopHudBar: React.FC<TopHudBarProps> = ({ engine, onBack, focusSensorsActive, onShowPrefrontal }) => {
  const isBaseline = engine.frame.phase === "baseline";
  const focusPercent = engine.frame.focus == null ? null : Math.round(engine.frame.focus * 100);

  return (
    <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between gap-4 pointer-events-none">
      <BackButton onClick={onBack} />

      {/* Center Focus Sensors Component */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex justify-center">
        <button
          onClick={onShowPrefrontal}
          className={`group flex h-10 cursor-pointer items-center overflow-hidden rounded-full border bg-slate-950/80 px-1 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
            focusSensorsActive
              ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-500/25"
              : isBaseline
                ? "border-indigo-400/50 shadow-indigo-500/20 hover:border-indigo-300"
                : "border-emerald-400/50 shadow-emerald-500/20 hover:border-emerald-300"
          }`}
          title="Toggle highlight on the four prefrontal focus-related sensors"
          aria-label="Toggle highlight on focus-related sensors"
          aria-pressed={focusSensorsActive}
        >
          {/* Attention-grabbing glowing pulsing beacon */}
          <span className="flex items-center gap-2 pl-3 pr-2">
            <span
              className={`w-2.5 h-2.5 rounded-full animate-pulse transition-all duration-300 ${
                isBaseline
                  ? "bg-indigo-400 shadow-[0_0_12px_#818cf8]"
                  : "bg-emerald-400 shadow-[0_0_12px_#34d399]"
              }`}
            />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-white transition-colors">
              Focus Sensors
            </span>
          </span>

          {/* Metric readout badge */}
          <span
            className={`flex h-7 min-w-12 items-center justify-center rounded-full border border-white/10 px-2.5 font-mono text-xs md:text-sm font-black transition-all duration-300 ${
              isBaseline
                ? "bg-indigo-950/70 text-indigo-300 shadow-[inset_0_0_8px_rgba(99,102,241,0.25)]"
                : "bg-emerald-950/70 text-emerald-300 shadow-[inset_0_0_8px_rgba(16,185,129,0.25)]"
            }`}
          >
            {focusPercent == null ? "--" : `${focusPercent}%`}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={() => xrStore.enterVR()}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-indigo-600/72 text-white shadow-lg shadow-indigo-500/15 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/45 hover:bg-indigo-500/88 hover:shadow-indigo-500/30 active:translate-y-0 active:scale-95 md:h-9 md:w-9"
          title="Enter VR"
          aria-label="Enter VR"
        >
          <svg className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M21 7H3a2 2 0 00-2 2v6a2 2 0 002 2h4l2 2h6l2-2h4a2 2 0 002-2V9a2 2 0 00-2-2zM7.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopHudBar;
