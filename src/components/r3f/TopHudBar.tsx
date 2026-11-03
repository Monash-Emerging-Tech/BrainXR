import React from "react";
import type { PlaybackEngine } from "../../hooks/usePlaybackEngine";
import BackButton from "./BackButton";
import { SpeakerOffIcon, SpeakerOnIcon } from "../icons/IconmonstrIcons";
import { AccessibilityMenu } from "../common/AccessibilityMenu";

interface TopHudBarProps {
  engine: PlaybackEngine;
  onBack: () => void;
  focusSensorsActive: boolean;
  onShowPrefrontal: () => void;
}

// Top HUD nav bar: exit button (left), focus sensors monitor (center),
// audio speaker toggle and color vision accessibility menu (right). Hidden entirely in idle mode by the caller.
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
          className={`group flex h-10 cursor-pointer items-center overflow-hidden rounded-full border bg-slate-950/80 px-1 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${focusSensorsActive
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
              className={`w-2.5 h-2.5 rounded-full animate-pulse transition-all duration-300 ${isBaseline
                  ? "bg-indigo-400 shadow-[0_0_12px_#818cf8]"
                  : "bg-emerald-400 shadow-[0_0_12px_#34d399]"
                }`}
            />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-white transition-colors">
              <span className="text-[12px] md:text-sm">I</span>ntensity of <span className="text-[12px] md:text-sm">F</span>ocus
            </span>
          </span>

          {/* Metric readout badge */}
          <span
            className={`flex h-7 min-w-12 items-center justify-center rounded-full border border-white/10 px-2.5 font-mono text-xs md:text-sm font-black transition-all duration-300 ${isBaseline
                ? "bg-indigo-950/70 text-indigo-300 shadow-[inset_0_0_8px_rgba(99,102,241,0.25)]"
                : "bg-emerald-950/70 text-emerald-300 shadow-[inset_0_0_8px_rgba(16,185,129,0.25)]"
              }`}
          >
            {focusPercent == null ? "--" : `${focusPercent}%`}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2.5 pointer-events-auto">
        <AccessibilityMenu
          buttonClassName="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-slate-950/68 text-slate-300 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-slate-950/82 hover:text-white shadow-lg active:scale-95 md:h-9 md:w-9"
        />

        <button
          onClick={engine.toggleMute}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 md:h-9 md:w-9 ${engine.isMuted
              ? "border-white/15 bg-slate-950/68 text-slate-400 hover:border-white/35 hover:bg-slate-950/82 hover:text-white shadow-lg shadow-slate-900/10"
              : "border-white/25 bg-indigo-600/72 text-white shadow-lg shadow-indigo-500/15 hover:border-white/45 hover:bg-indigo-500/88 hover:shadow-indigo-500/30"
            }`}
          title={engine.isMuted ? "Unmute audio" : "Mute audio"}
          aria-label={engine.isMuted ? "Unmute audio" : "Mute audio"}
          aria-pressed={!engine.isMuted}
        >
          {engine.isMuted ? (
            <SpeakerOffIcon className="w-4 h-4 md:w-4.5 md:h-4.5" />
          ) : (
            <SpeakerOnIcon className="w-4 h-4 md:w-4.5 md:h-4.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default TopHudBar;
