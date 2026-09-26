import React from "react";
import type { Frame } from "../../utils/signalSource";
import TrialProgressBar from "../TrialProgressBar";

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
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M11 8V5l-7 5 7 5v-3c4 0 6.5 1.3 8 4-1-5-4-8-8-8z" /></svg>
          </button>
          <button onClick={onTogglePlayPause} className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition active:scale-95 hover:bg-slate-700" title={isPaused ? "Play (Spacebar)" : "Pause (Spacebar)"} aria-label={isPaused ? "Play" : "Pause"}>
            {isPaused ? (
              <svg className={`h-5 w-5 fill-current ${frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`} viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg className={`h-5 w-5 fill-current ${frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`} viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            )}
          </button>
          <button onClick={onNext} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-700 hover:text-white" title="Next track" aria-label="Next track">
            <svg className="h-4 w-4 fill-current -scale-x-100" viewBox="0 0 24 24"><path d="M11 8V5l-7 5 7 5v-3c4 0 6.5 1.3 8 4-1-5-4-8-8-8z" /></svg>
          </button>
          </div>}
        />
      </div>
    </div>
  </>
);

export default DemoBottomControls;
