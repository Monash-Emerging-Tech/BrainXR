import React from "react";
import DoubleVisionFocusText from "../DoubleVisionFocusText";
import { calcEnvelope, clamp01 } from "./useOnboardingScroll";

interface BeatContentProps {
  progress: number;
  introFadeProgress?: number;
  isDark?: boolean;
}

export const BeatContent: React.FC<BeatContentProps> = ({ progress, introFadeProgress = 1, isDark = false }) => {
  // Beat 1: active right at the start of scroll (progress 0.0) right as smoke disappears
  // Exits cleanly around 0.24 -> 0.30 before Beat 2 starts
  const b1Opacity = progress < 0.24 ? 1 : Math.max(0, 1 - (progress - 0.24) / 0.06);
  const b1Y = progress < 0.24 ? 0 : -((progress - 0.24) / 0.06) * 32;

  // Beat 2: 0.32 -> 0.50 (completely non-overlapping with Beat 1 and Beat 3)
  const b2 = calcEnvelope(progress, 0.31, 0.36, 0.49, 0.53);
  // Beat 3: enters cleanly at 0.54 after Beat 2 has fully vacated
  const b3 = calcEnvelope(progress, 0.54, 0.58, 0.68, 0.72);
  const b4 = calcEnvelope(progress, 0.72, 0.76, 0.85, 0.88);

  // Across Beats 3 and 4 (Direction & Intensity of focus: 0.54 -> 0.88):
  // The BrainXR text stays completely stationary in place at 100% opacity throughout the entire transition.
  // It enters with Beat 3 (0.54 -> 0.58) and exits with Beat 4 (0.85 -> 0.88), but never slides/re-enters between beats.
  const showBrainXRShared = progress >= 0.54 && progress < 0.88;
  const brainXROpacity = calcEnvelope(progress, 0.54, 0.58, 0.85, 0.88).opacity;
  const brainXRY = progress < 0.58 ? b3.y : progress >= 0.85 ? b4.y : 0;

  // Focus scrub: double vision converges as user scrolls from 0.00 to 0.20
  const focusScrub = clamp01(progress / 0.20);

  // In Beat 2, split text sequentially:
  // "What is Focus?" emerges first (t >= 0.31) with muted grey badge
  // Around 0.385 -> 0.42, the badge and brain blink between muted grey and emerald green before fully locking into green
  // "Focus is a Vector Quantity" and "it has both direction and intensity" emerge as brain finishes rotating (~0.39 -> 0.44).
  const isBlinking = progress >= 0.385 && progress < 0.425;
  const isFullyGreen = progress >= 0.425;
  const isActivated = progress >= 0.39;

  // Scrollimated blink toggle: 3 distinct rapid flashes between grey and green based on scroll position
  const blinkCycle = isBlinking ? Math.sin(((progress - 0.385) / 0.04) * Math.PI * 6) > 0 : false;
  const isGreenNow = isFullyGreen || (isBlinking && blinkCycle);

  const line2Progress = clamp01((progress - 0.39) / 0.05);
  const line2Opacity = Math.pow(line2Progress, 1.2);
  const line2Y = (1 - line2Progress) * 12;

  // As user starts scrolling (0.00 -> 0.24), other text fades away and focus expands/scales up
  const scrollProg = clamp01(progress / 0.22);
  const surroundingTextOpacity = Math.max(0, 1 - Math.pow(scrollProg, 0.8));
  const surroundingTextY = -scrollProg * 20;
  const focusScale = 1 + scrollProg * 1.5; // grows from 1.0x up to 2.5x

  // Attention resolved status indicator:
  // When focus is reaching full convergence (focusScrub >= 0.85), highlight cleanly with high opacity
  // and keep it visible longer as focus expands, gently fading out near the end of Beat 1 (0.24 -> 0.28).
  const isAttentionResolved = focusScrub >= 0.85;
  const resolvedOpacity = progress < 0.23 ? 1 : Math.max(0, 1 - (progress - 0.23) / 0.05);
  const statusOpacity = isAttentionResolved ? resolvedOpacity : surroundingTextOpacity;

  // Fade in softly as smoke thins so it's fully present ASAP after smoke clears
  const finalB1Opacity = b1Opacity * introFadeProgress;
  const showB1 = finalB1Opacity > 0.005;

  return (
    <div className="relative w-full h-full max-w-3xl mx-auto flex items-center justify-center text-center px-6 pointer-events-none select-none">
      {showB1 && (
        <div className="absolute inset-x-0 flex flex-col items-center justify-center will-change-transform" style={{ opacity: finalB1Opacity, transform: `translateY(${b1Y.toFixed(1)}px)` }}>
          <p
            className="text-slate-700 font-sans text-xl sm:text-2xl md:text-3xl font-light tracking-wide transition-opacity duration-150 will-change-transform"
            style={{
              opacity: surroundingTextOpacity,
              transform: `translateY(${surroundingTextY.toFixed(1)}px)`,
            }}
          >
            have you wondered what makes you
          </p>
          <div
            className="mt-4 will-change-transform origin-center transition-transform duration-75"
            style={{
              transform: `scale(${focusScale.toFixed(3)})`,
            }}
          >
            <DoubleVisionFocusText progress={focusScrub} text="focus" className="text-5xl sm:text-7xl md:text-8xl font-black text-slate-950" />
          </div>
          <span
            className="mt-6 inline-flex items-center gap-1.5 text-indigo-600 font-mono text-[11px] uppercase tracking-widest font-semibold transition-opacity duration-150"
            style={{
              opacity: statusOpacity,
            }}
          >
            {isAttentionResolved ? (
              <>
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M4.5 8.2L6.8 10.5L11.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>attention resolved</span>
              </>
            ) : (
              "↓ scroll to bring into focus"
            )}
          </span>
        </div>
      )}

      {b2.opacity > 0.01 && (
        <div
          className="absolute inset-x-0 bottom-12 sm:bottom-16 flex flex-col items-center justify-center will-change-transform z-30 px-4"
          style={{ opacity: b2.opacity, transform: `translateY(${b2.y.toFixed(1)}px)` }}
        >
          {/* Frameless Bottom Headline layout without slate container background */}
          <div className="relative max-w-2xl w-full flex flex-col items-center text-center">
            {/* Prefrontal badge indicator: starts muted grey, blinks between grey and green, then locks into green */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-xs uppercase tracking-wider mb-3 transition-colors duration-150 ${
                isGreenNow
                  ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "border-slate-500/30 text-slate-400 bg-transparent"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${
                  isGreenNow ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-slate-500"
                }`}
              />
              Prefrontal Cortex Activated
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-offbit text-white tracking-wide leading-tight transition-all duration-300">
              {isActivated ? (
                <>
                  Focus is a <span className="text-emerald-300 font-bold">Vector</span> Quantity
                </>
              ) : (
                "What is Focus?"
              )}
            </h2>

            <p
              className="mt-2.5 text-slate-400 font-offbit text-base sm:text-lg md:text-xl font-light transition-all duration-300 will-change-transform max-w-lg leading-relaxed tracking-wide"
              style={{
                opacity: line2Opacity,
                transform: `translateY(${line2Y.toFixed(1)}px)`,
              }}
            >
              it has both <strong className="font-semibold text-cyan-300">direction</strong> and <strong className="font-semibold text-violet-300">intensity</strong>
            </p>
          </div>
        </div>
      )}

      {/* Beats 3 & 4 (Direction & Intensity): The surrounding text & badges fade naturally between beats,
          while BrainXR maintains a persistent, continuous 100% opacity without fading out during the transition */}
      {showBrainXRShared && (
        <div
          className="absolute inset-x-0 bottom-12 sm:bottom-16 flex flex-col items-center justify-center will-change-transform z-30 px-4"
          style={{ opacity: brainXROpacity, transform: `translateY(${brainXRY.toFixed(1)}px)` }}
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center text-center">
            {/* Beat 3 Badge & Lead-in text: Direction of Focus */}
            {b3.opacity > 0.005 && (
              <div
                className="flex flex-col items-center text-center will-change-transform"
                style={{ opacity: b3.opacity, transform: `translateY(${b3.y.toFixed(1)}px)` }}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? "border-cyan-500/30 text-cyan-300" : "border-cyan-300 text-cyan-700"} border font-mono text-xs uppercase tracking-wider mb-3 transition-colors duration-300`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Direction of Focus
                </div>
                <p className={`${isDark ? "text-slate-200" : "text-slate-800"} font-offbit text-xl sm:text-2xl md:text-3xl font-light max-w-xl leading-relaxed transition-colors duration-300`}>
                  we track your focus inside the game of{" "}
                  <span className="invisible select-none">
                    Brain<span className="text-cyan-300">XR</span>
                  </span>
                </p>
              </div>
            )}

            {/* Beat 4 Badge & Lead-in text: Intensity of Focus */}
            {b4.opacity > 0.005 && (
              <div
                className="flex flex-col items-center text-center will-change-transform"
                style={{ opacity: b4.opacity, transform: `translateY(${b4.y.toFixed(1)}px)` }}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? "border-violet-500/25 text-violet-300/90" : "border-violet-300 text-violet-700"} border font-mono text-xs uppercase tracking-wider mb-3 transition-colors duration-300`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400/80 animate-pulse" />
                  Intensity of Focus
                </div>
                <p className={`${isDark ? "text-slate-200" : "text-slate-800"} font-offbit text-xl sm:text-2xl md:text-3xl font-light max-w-xl leading-relaxed transition-colors duration-300`}>
                  we measure intensity using EEG headset on{" "}
                  <span className="invisible select-none">
                    BrainXR
                  </span>
                </p>
              </div>
            )}

            {/* Shared, non-fading, stationary BrainXR text: stays stably anchored in place without sliding across Beat 3 & 4 */}
            <div className="absolute bottom-0 inset-x-0 pointer-events-none flex justify-center text-center">
              <p className="font-offbit text-xl sm:text-2xl md:text-3xl font-light max-w-xl leading-relaxed">
                <span className="invisible select-none">
                  we measure intensity using EEG headset on{" "}
                </span>
                <span className={`font-offbit uppercase font-bold tracking-wider ${isDark ? "text-white" : "text-slate-950"} transition-colors duration-300`}>
                  <span className={progress >= 0.70 ? (isDark ? "text-violet-300" : "text-violet-600") : ""}>Brain</span>
                  <span className={progress < 0.70 ? (isDark ? "text-cyan-300" : "text-cyan-600") : ""}>XR</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeatContent;
