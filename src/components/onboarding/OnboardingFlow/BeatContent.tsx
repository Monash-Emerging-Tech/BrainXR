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

  // Focus scrub: double vision converges as user scrolls from 0.00 to 0.20
  const focusScrub = clamp01(progress / 0.20);

  // In Beat 2, split text sequentially:
  // "focus is a vector variable" emerges first (t >= 0.32)
  // "it has both direction and intensity" emerges as brain finishes rotating (~0.39 -> 0.44)
  const line2Progress = clamp01((progress - 0.39) / 0.05);
  const line2Opacity = Math.pow(line2Progress, 1.2);
  const line2Y = (1 - line2Progress) * 12;

  // As user starts scrolling (0.00 -> 0.24), other text fades away and focus expands/scales up
  const scrollProg = clamp01(progress / 0.22);
  const surroundingTextOpacity = Math.max(0, 1 - Math.pow(scrollProg, 0.8));
  const surroundingTextY = -scrollProg * 20;
  const focusScale = 1 + scrollProg * 1.5; // grows from 1.0x up to 2.5x

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
            className="mt-6 text-indigo-600 font-mono text-[11px] uppercase tracking-widest font-semibold transition-opacity duration-150"
            style={{
              opacity: surroundingTextOpacity,
            }}
          >
            {focusScrub >= 0.9 ? "✓ attention resolved" : "↓ scroll to bring into focus"}
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
            {/* Prefrontal badge indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 text-emerald-300/90 font-mono text-xs uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
              Prefrontal Cortex Activated
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-offbit text-white tracking-wide leading-tight">
              Focus is a <span className="text-emerald-300 font-bold">Vector</span> Variable
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

      {b3.opacity > 0.01 && (
        <div
          className="absolute inset-x-0 bottom-12 sm:bottom-16 flex flex-col items-center justify-center will-change-transform z-30 px-4"
          style={{ opacity: b3.opacity, transform: `translateY(${b3.y.toFixed(1)}px)` }}
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? "border-cyan-500/30 text-cyan-300" : "border-cyan-300 text-cyan-700"} border font-mono text-xs uppercase tracking-wider mb-3 transition-colors duration-300`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Direction of Attention
            </div>
            <p className={`${isDark ? "text-slate-200" : "text-slate-800"} font-offbit text-xl sm:text-2xl md:text-3xl font-light max-w-xl leading-relaxed transition-colors duration-300`}>
              we measure direction of attention using <span className={`font-offbit uppercase ${isDark ? "text-white" : "text-slate-950"} font-bold tracking-wider`}>Brain<span className={isDark ? "text-cyan-300" : "text-cyan-600"}>XR</span></span>
            </p>
          </div>
        </div>
      )}

      {b4.opacity > 0.01 && (
        <div
          className="absolute inset-x-0 bottom-12 sm:bottom-16 flex flex-col items-center justify-center will-change-transform z-30 px-4"
          style={{ opacity: b4.opacity, transform: `translateY(${b4.y.toFixed(1)}px)` }}
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDark ? "border-violet-500/25 text-violet-300/90" : "border-violet-300 text-violet-700"} border font-mono text-xs uppercase tracking-wider mb-3 transition-colors duration-300`}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400/80 animate-pulse" />
              Intensity of Attention
            </div>
            <p className={`${isDark ? "text-slate-200" : "text-slate-800"} font-offbit text-xl sm:text-2xl md:text-3xl font-light max-w-xl leading-relaxed transition-colors duration-300`}>
              we measure intensity using EEG headset on <span className="font-offbit uppercase font-bold tracking-wider"><span className={isDark ? "text-violet-300" : "text-violet-600"}>Brain</span><span className={isDark ? "text-white" : "text-slate-950"}>XR</span></span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeatContent;
