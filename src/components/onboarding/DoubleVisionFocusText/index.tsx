import React, { useMemo } from "react";

interface DoubleVisionFocusTextProps {
  progress: number; // 0..1 (unfocused -> sharp focus)
  text?: string;
  className?: string;
}

export const DoubleVisionFocusText: React.FC<DoubleVisionFocusTextProps> = ({
  progress,
  text = "focus",
  className = "",
}) => {
  const p = Math.max(0, Math.min(1, progress));
  const blurFactor = Math.pow(1 - p, 1.6); // cubic convergence curve

  const maxOffset = 24 * blurFactor;
  const blurPx = blurFactor * 4;
  const ghostOpacity = blurFactor * 0.65;

  const ghosts = useMemo(
    () => [
      { dy: -maxOffset * 1.1, color: "text-cyan-600/75", opacity: ghostOpacity * 0.85 },
      { dy: maxOffset * 0.8, color: "text-indigo-600/80", opacity: ghostOpacity * 0.9 },
      { dy: -maxOffset * 0.5, color: "text-purple-600/70", opacity: ghostOpacity * 0.75 },
      { dy: maxOffset * 1.3, color: "text-slate-500/60", opacity: ghostOpacity * 0.6 },
    ],
    [maxOffset, ghostOpacity]
  );

  return (
    <div
      className={`relative inline-flex items-center justify-center font-offbit uppercase select-none tracking-wider ${className}`}
      style={{ filter: blurPx > 0.08 ? `blur(${blurPx.toFixed(1)}px)` : "none" }}
    >
      {blurFactor > 0.015 &&
        ghosts.map((ghost, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`absolute pointer-events-none transition-transform will-change-transform ${ghost.color}`}
            style={{
              transform: `translateY(${ghost.dy.toFixed(1)}px)`,
              opacity: ghost.opacity,
            }}
          >
            {text}
          </span>
        ))}

      <span
        className={`relative z-10 transition-all duration-300 ${
          p > 0.85
            ? "text-slate-950 drop-shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            : "text-slate-800"
        }`}
      >
        {text}
      </span>
    </div>
  );
};

export default DoubleVisionFocusText;
