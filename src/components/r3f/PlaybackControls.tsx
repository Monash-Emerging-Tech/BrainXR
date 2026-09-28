import React from "react";
import type { Frame } from "../../utils/signalSource";
import { PauseThinIcon, PlayThinIcon } from "../icons/IconmonstrIcons";

interface PlaybackControlsProps {
  phase: Frame["phase"];
  isPaused: boolean;
  speed: number;
  onTogglePlayPause: () => void;
  onSetSpeed: (speed: number) => void;
}

// Top-right HUD cluster: play/pause toggle and the 1x/10x speed switch.
const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  phase,
  isPaused,
  speed,
  onTogglePlayPause,
  onSetSpeed,
}) => {
  const phaseColor = phase === "baseline" ? "text-indigo-400" : "text-emerald-400";

  return (
    <div className="pointer-events-auto">
      <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/68 p-1 shadow-xl shadow-slate-900/15 backdrop-blur-xl md:gap-2 md:p-1.5">
        <button
          onClick={onTogglePlayPause}
          className="group relative flex cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/8 p-1.5 text-white transition-all hover:bg-white/14 active:scale-95 md:p-2"
          title={isPaused ? "Play (Spacebar)" : "Pause (Spacebar)"}
        >
          {isPaused ? (
            <PlayThinIcon className={`h-4 w-4 transition-colors duration-300 md:h-5 md:w-5 ${phaseColor}`} />
          ) : (
            <PauseThinIcon className={`h-4 w-4 transition-colors duration-300 md:h-5 md:w-5 ${phaseColor}`} />
          )}
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-950 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap border border-slate-800 font-mono shadow-md text-white z-50">
            {isPaused ? "Play" : "Pause"} <kbd className="bg-slate-800 px-1 rounded font-sans font-semibold">Space</kbd>
          </span>
        </button>

        <div className="h-4 w-px bg-white/12 md:h-5" />

        <div className="flex select-none items-center rounded-full border border-white/10 bg-white/6 p-0.5 font-mono text-xs font-bold md:text-sm">
          <button
            onClick={() => onSetSpeed(1)}
            className={`px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full transition-all cursor-pointer ${speed === 1
              ? `${phase === "baseline" ? "bg-indigo-600" : "bg-emerald-600"} text-white shadow-sm font-extrabold`
              : "text-slate-400 hover:text-slate-200"
              }`}
          >
            1x
          </button>
          <button
            onClick={() => onSetSpeed(10)}
            className={`px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full transition-all cursor-pointer ${speed === 10
              ? `${phase === "baseline" ? "bg-indigo-600" : "bg-emerald-600"} text-white shadow-sm font-extrabold`
              : "text-slate-400 hover:text-slate-200"
              }`}
          >
            10x
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
