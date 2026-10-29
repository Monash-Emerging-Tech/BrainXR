import React from "react";

export const BEAT_THRESHOLDS = [0.0, 0.2, 0.32, 0.53, 0.71];

const BEAT_LABELS = [
  "Origin",
  "Focus",
  "Vector",
  "Direction",
  "Intensity",
];

interface EdgeProgressBarProps {
  activeBeat: number;
  progress: number; // 0..1
  isDark?: boolean;
  onSkip: () => void;
  onSelectBeat?: (beatIndex: number) => void;
}

export const EdgeProgressBar: React.FC<EdgeProgressBarProps> = ({
  activeBeat,
  progress,
  isDark = false,
  onSkip,
  onSelectBeat,
}) => {
  // Gracefully fade the progress track and skip button out as the home page assembles (p >= 0.93)
  const barOpacity = progress > 0.93 ? Math.max(0, 1 - (progress - 0.93) / 0.035) : 1;
  if (barOpacity <= 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-200"
      style={{ opacity: barOpacity }}
    >
      {/* Top-Right Skip Button */}
      <div className={`absolute top-5 right-5 ${barOpacity < 0.5 ? "pointer-events-none" : "pointer-events-auto"}`}>
        <button
          type="button"
          onClick={onSkip}
          className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full ${isDark
              ? "bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800"
              : "bg-white/90 text-slate-800 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300"
            } border backdrop-blur-md focus-visible:outline-2 focus-visible:outline-indigo-500 transition-all shadow-sm active:scale-95 cursor-pointer`}
          title="Skip to Home"
          aria-label="Skip to Home"
        >
          <span className={`text-[11px] font-mono uppercase tracking-wider ${isDark ? "text-slate-300 group-hover:text-white" : "text-slate-600 group-hover:text-slate-900"} font-semibold transition-colors`}>
            Skip
          </span>
          <svg className={`w-3.5 h-3.5 fill-current ${isDark ? "text-slate-400 group-hover:text-white" : "text-slate-400 group-hover:text-slate-800"} transition-colors`} viewBox="0 0 24 24">
            <path d="M5 18a1 1 0 0 1-1-1V7a1 1 0 0 1 1.555-.832l6.5 4.062a1 1 0 0 1 0 1.54l-6.5 4.062A1 1 0 0 1 5 18zm7 0a1 1 0 0 1-1-1V7a1 1 0 0 1 1.555-.832l6.5 4.062a1 1 0 0 1 0 1.54l-6.5 4.062A1 1 0 0 1 12 18zm8-11a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1z" />
          </svg>
        </button>
      </div>

      {/* Right Edge Beat Progress Track */}
      <div className={`absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center ${barOpacity < 0.5 ? "pointer-events-none" : "pointer-events-auto"}`}>
        <div className="flex flex-col items-center">
          {BEAT_LABELS.map((label, idx) => {
            const isActive = activeBeat === idx;
            const isPassed = activeBeat > idx;
            const hasReached = progress >= BEAT_THRESHOLDS[idx] || isPassed;

            // Segment between this dot and the next dot
            const hasNextSegment = idx < BEAT_LABELS.length - 1;
            const segStart = BEAT_THRESHOLDS[idx];
            const segEnd = hasNextSegment ? BEAT_THRESHOLDS[idx + 1] : 1;
            const segmentProgress = hasNextSegment
              ? Math.min(1, Math.max(0, (progress - segStart) / (segEnd - segStart)))
              : 0;

            return (
              <React.Fragment key={idx}>
                {/* Beat Node */}
                <button
                  type="button"
                  onClick={() => onSelectBeat?.(idx)}
                  className="group relative z-10 flex items-center justify-center p-1 cursor-pointer focus:outline-none"
                  title={label}
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${isActive
                      ? "w-3 h-3 bg-indigo-500 ring-4 ring-indigo-500/30 shadow-sm"
                      : hasReached
                        ? `w-2.5 h-2.5 bg-indigo-500 ring-2 ${isDark ? "ring-slate-900" : "ring-white"}`
                        : `w-2.5 h-2.5 ${isDark ? "bg-slate-800 border-slate-600 group-hover:border-slate-400" : "bg-white border-slate-300 group-hover:border-slate-500"} border group-hover:scale-110`
                      }`}
                  />
                  <span className="absolute right-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/10 pointer-events-none whitespace-nowrap shadow-sm">
                    {label}
                  </span>
                </button>

                {/* Segment Rail connecting this dot to the next dot */}
                {hasNextSegment && (
                  <div className={`relative w-0.5 h-10 ${isDark ? "bg-slate-800" : "bg-slate-200"} rounded-full overflow-hidden my-0.5 transition-colors duration-300`}>
                    <div
                      className="w-full bg-indigo-500 rounded-full origin-top"
                      style={{ height: `${segmentProgress * 100}%` }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EdgeProgressBar;
