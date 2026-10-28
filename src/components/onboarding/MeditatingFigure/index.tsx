import React from "react";

interface MeditatingFigureProps {
  className?: string;
  glowPrefrontal?: boolean;
  isDark?: boolean;
}

export const MeditatingFigure: React.FC<MeditatingFigureProps> = ({
  className = "",
  glowPrefrontal = false,
  isDark = false,
}) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg
      viewBox="0 0 320 320"
      className={`w-full h-full max-w-[280px] md:max-w-[340px] ${isDark ? "drop-shadow-[0_4px_25px_rgba(129,140,248,0.3)]" : "drop-shadow-[0_4px_20px_rgba(99,102,241,0.15)]"} animate-breathe`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="figureGlow" x1="160" y1="40" x2="160" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isDark ? "#818cf8" : "#4338ca"} stopOpacity="0.95" />
          <stop offset="50%" stopColor={isDark ? "#38bdf8" : "#0284c7"} stopOpacity="0.85" />
          <stop offset="100%" stopColor={isDark ? "#94a3b8" : "#334155"} stopOpacity="0.75" />
        </linearGradient>
        <radialGradient id="auraGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={isDark ? "0.22" : "0.14"} />
          <stop offset="60%" stopColor={isDark ? "#38bdf8" : "#38bdf8"} stopOpacity={isDark ? "0.08" : "0.05"} />
          <stop offset="100%" stopColor={isDark ? "#000000" : "#ffffff"} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="160" cy="150" r="130" fill="url(#auraGlow)" className="animate-pulse" style={{ animationDuration: "4s" }} />

      <path
        d="M160 60 C143 60 132 74 132 94 C132 114 144 126 160 126 C176 126 188 114 188 94 C188 74 177 60 160 60 Z"
        stroke="url(#figureGlow)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M152 124 L146 138 C128 144 105 154 94 170 C83 186 86 210 92 232"
        stroke="url(#figureGlow)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M168 124 L174 138 C192 144 215 154 226 170 C237 186 234 210 228 232"
        stroke="url(#figureGlow)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M92 230 C98 244 120 252 148 250"
        stroke="url(#figureGlow)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M228 230 C222 244 200 252 172 250"
        stroke="url(#figureGlow)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <ellipse cx="160" cy="248" rx="14" ry="6" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />

      <path
        d="M60 262 C70 240 100 246 132 254 L188 254 C220 246 250 240 260 262 C265 272 248 278 220 278 L100 278 C72 278 55 272 60 262 Z"
        stroke="url(#figureGlow)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g className={`transition-all duration-700 ${glowPrefrontal ? "scale-125" : "scale-100"}`} style={{ transformOrigin: "160px 88px" }}>
        <circle cx="160" cy="88" r="4.5" fill="#0284c7" />
        <circle cx="160" cy="88" r="9" stroke="#6366f1" strokeWidth="1.5" className="animate-ping opacity-75" style={{ animationDuration: "2.4s" }} />
      </g>
    </svg>
  </div>
);

export default MeditatingFigure;
