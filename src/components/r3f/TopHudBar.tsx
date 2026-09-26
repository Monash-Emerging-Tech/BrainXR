import React from "react";
import type { PlaybackEngine } from "../../hooks/usePlaybackEngine";
import BackButton from "./BackButton";
import PhaseIndicator from "./PhaseIndicator";
import { xrStore } from "../../utils/xrStore";

interface TopHudBarProps {
  engine: PlaybackEngine;
  onBack: () => void;
  focusSensorsActive: boolean;
  onShowPrefrontal: () => void;
}

// Top HUD nav bar: exit button (left), phase pill (center), playback
// controls (right). Hidden entirely in idle mode by the caller.
const TopHudBar: React.FC<TopHudBarProps> = ({ engine, onBack, focusSensorsActive, onShowPrefrontal }) => (
  <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between gap-4 pointer-events-none">
    <BackButton onClick={onBack} />
    <PhaseIndicator isDemo={engine.mode.kind === "demo"} phase={engine.frame.phase} />
    <div className="flex items-center gap-3 pointer-events-auto">
      <button
        onClick={onShowPrefrontal}
        className={`flex h-9 cursor-pointer items-center overflow-hidden rounded-full border bg-slate-900/90 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-xl active:translate-y-0 active:scale-95 ${focusSensorsActive ? "ring-2 ring-slate-400/35" : ""} ${engine.frame.phase === "baseline" ? "border-indigo-400/40" : "border-emerald-400/40"}`}
        title="Highlight the four focus-related sensors"
        aria-label="Highlight the four focus-related sensors"
        aria-pressed={focusSensorsActive}
      >
        <span className="px-3 text-[9px] font-black uppercase tracking-[0.12em] text-white">Focus sensors</span>
        <span className={`flex h-full min-w-11 items-center justify-center border-l border-white/10 px-2 font-mono text-xs font-black ${engine.frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`}>{engine.frame.focus == null ? "--" : `${Math.round(engine.frame.focus * 100)}%`}</span>
      </button>
      <button
        onClick={() => xrStore.enterVR()}
        className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40"
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

export default TopHudBar;
