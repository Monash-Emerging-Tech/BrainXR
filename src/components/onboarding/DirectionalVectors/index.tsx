import React from "react";

interface DirectionalVectorsProps {
  opacity: number; // 0..1
  isDark?: boolean;
}

export const DirectionalVectors: React.FC<DirectionalVectorsProps> = ({ opacity, isDark = false }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-300 z-20 will-change-opacity"
      style={{ opacity, display: opacity <= 0.005 ? "none" : "flex" }}
    >
      <svg
        viewBox="0 0 600 600"
        className="w-[85vw] h-[85vw] max-w-[550px] max-h-[550px] select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vectorRay" x1="300" y1="300" x2="480" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="vectorRayLeft" x1="300" y1="300" x2="120" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#67e8f9" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle cx="300" cy="300" r="160" stroke="#06b6d4" strokeWidth="1.0" strokeDasharray="4 8" opacity="0.25" className="animate-spin" style={{ animationDuration: "30s" }} />
        <circle cx="300" cy="300" r="220" stroke="#22d3ee" strokeWidth="1.0" strokeDasharray="6 12" opacity="0.20" className="animate-spin" style={{ animationDuration: "45s", animationDirection: "reverse" }} />

        <line x1="300" y1="300" x2="300" y2="90" stroke="#22d3ee" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.85" />
        <polygon points="300,75 295,95 305,95" fill="#22d3ee" opacity="0.9" />

        <line x1="300" y1="300" x2="470" y2="170" stroke="url(#vectorRay)" strokeWidth="1.5" opacity="0.85" />
        <circle cx="470" cy="170" r="3.5" fill="#22d3ee" opacity="0.9" />

        <line x1="300" y1="300" x2="130" y2="170" stroke="url(#vectorRayLeft)" strokeWidth="1.5" opacity="0.85" />
        <circle cx="130" cy="170" r="3.5" fill="#67e8f9" opacity="0.9" />

        <text x="315" y="88" fill={isDark ? "#67e8f9" : "#0891b2"} className="font-mono text-[10px] tracking-widest uppercase font-bold">
          DIRECTION OF ATTENTION [VECTOR]
        </text>
        <text x="315" y="104" fill={isDark ? "#a5f3fc" : "#0e7490"} className="font-mono text-[8.5px] tracking-wider font-medium">
          FOV: 110° · GAZE: TRACKED
        </text>
      </svg>
    </div>
  );
};

export default DirectionalVectors;
