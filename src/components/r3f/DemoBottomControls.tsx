import React, { useState, useEffect } from "react";
import type { Frame } from "../../utils/signalSource";
import TrialProgressBar from "../TrialProgressBar";
import { MediaControl13Icon, MediaControl14Icon, PauseThinIcon, PlayThinIcon } from "../icons/IconmonstrIcons";
import { isWebXRSupported } from "../../utils/webxrDetector";

interface DemoBottomControlsProps {
  frame: Frame;
  onTrialSelect: (index: number, startOffset?: number) => void;
  isPaused: boolean;
  onTogglePlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

// Floating bottom-of-screen Demo Mode controls: the trial timeline (left,
// stretching across), play/pause scrubber, and conditionally rendered Track Your Focus button.
const DemoBottomControls: React.FC<DemoBottomControlsProps> = ({ frame, onTrialSelect, isPaused, onTogglePlayPause, onPrevious, onNext }) => {
  const [isXRCapable, setIsXRCapable] = useState(false);

  useEffect(() => {
    let mounted = true;
    isWebXRSupported().then((supported) => {
      if (mounted) {
        setIsXRCapable(supported);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="absolute inset-x-0 bottom-5 z-30 flex flex-col items-center justify-center px-4 pointer-events-none gap-3">
        <div className="w-full max-w-[52rem] pointer-events-auto">
          <TrialProgressBar
            trialElapsed={frame.trialElapsed ?? 0}
            phase={frame.phase}
            trialIndex={frame.trialIndex ?? 0}
            onTrialSelect={onTrialSelect}
            controls={<div className="flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/68 p-1 shadow-xl shadow-slate-900/15 backdrop-blur-xl">
              <button onClick={onPrevious} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/12 hover:text-white" title="Restart track; press again for previous" aria-label="Restart track or go to previous track">
                <MediaControl13Icon className="h-4 w-4" style={{ transform: "scaleX(-1)" }} />
              </button>
              <button onClick={onTogglePlayPause} className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white transition hover:border-white/20 hover:bg-white/14 active:scale-95" title={isPaused ? "Play (Spacebar)" : "Pause (Spacebar)"} aria-label={isPaused ? "Play" : "Pause"}>
                {isPaused ? (
                  <PlayThinIcon className={`h-5 w-5 ${frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`} />
                ) : (
                  <PauseThinIcon className={`h-5 w-5 ${frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`} />
                )}
              </button>
              <button onClick={onNext} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/12 hover:text-white" title="Next track" aria-label="Next track">
                <MediaControl14Icon className="h-4 w-4" />
              </button>
            </div>}
          />
        </div>

        {/* Button below EEG headset linking to Direction of Focus experience - only rendered if device is XR capable */}
        {isXRCapable && (
          <div className="pointer-events-auto">
            <a
              href="/direction"
              className="group flex items-center gap-2.5 bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-full shadow-lg shadow-indigo-950/20 hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40 text-xs sm:text-sm no-underline backdrop-blur-md"
              title="Track Your Focus"
              aria-label="Track Your Focus"
            >
              <span>Track Your Focus</span>
              <svg className="w-4 h-4 fill-current transition-transform duration-200 group-hover:scale-110 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 7H3a2 2 0 00-2 2v6a2 2 0 002 2h4l2 2h6l2-2h4a2 2 0 002-2V9a2 2 0 00-2-2zM7.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default DemoBottomControls;
