import React from "react";
import type { Frame } from "../../utils/signalSource";
import TrialProgressBar from "../TrialProgressBar";
import { MediaControl13Icon, MediaControl14Icon, PauseThinIcon, PlayThinIcon } from "../icons/IconmonstrIcons";

interface DemoBottomControlsProps {
  frame: Frame;
  onTrialSelect: (index: number, startOffset?: number) => void;
  isPaused: boolean;
  onTogglePlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

// Floating bottom-of-screen Demo Mode controls: the trial timeline (left,
// stretching across) and the rotary trial dial (bottom-right).
const DemoBottomControls: React.FC<DemoBottomControlsProps> = ({ frame, onTrialSelect, isPaused, onTogglePlayPause, onPrevious, onNext }) => (
  <>
    <div className="absolute inset-x-0 bottom-5 z-30 flex flex-col items-center justify-center px-4 pointer-events-none">
      <div className="w-full max-w-[52rem] pointer-events-auto">
        <TrialProgressBar
          trialElapsed={frame.trialElapsed ?? 0}
          phase={frame.phase}
          trialIndex={frame.trialIndex ?? 0}
          onTrialSelect={onTrialSelect}
          controls={<div className="flex items-center gap-1 rounded-full bg-slate-900/95 p-1 shadow-xl">
          <button onClick={onPrevious} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-700 hover:text-white" title="Restart track; press again for previous" aria-label="Restart track or go to previous track">
            <MediaControl13Icon className="h-4 w-4" style={{ transform: "scaleX(-1)" }} />
          </button>
          <button onClick={onTogglePlayPause} className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition active:scale-95 hover:bg-slate-700" title={isPaused ? "Play (Spacebar)" : "Pause (Spacebar)"} aria-label={isPaused ? "Play" : "Pause"}>
            {isPaused ? (
              <PlayThinIcon className={`h-5 w-5 ${frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`} />
            ) : (
              <PauseThinIcon className={`h-5 w-5 ${frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`} />
            )}
          </button>
          <button onClick={onNext} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-700 hover:text-white" title="Next track" aria-label="Next track">
            <MediaControl14Icon className="h-4 w-4" />
          </button>
          </div>}
        />
      </div>
    </div>
  </>
);

export default DemoBottomControls;
