import React from "react";

// Floating portal tiles & cyber wireframe elements around the viewport perimeter matching the new 3D portal aesthetics
export const ModalDecorativeField: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Ambient background vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.04)_0%,rgba(13,13,16,0)_75%)]" />

      {/* ================= CORNER TELEMETRY & CROSSHAIRS ================= */}
      {/* Top-Left Telemetry Bracket */}
      <div className="absolute top-6 left-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
        <span className="text-cyan-400/80 font-bold font-offbit text-xs">+</span>
        <span>SYS // PORTAL_MATRIX</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Top-Right Telemetry Bracket */}
      <div className="absolute top-6 right-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
        <span>ASPECT: 16:9 // 120M</span>
        <span className="text-purple-400/80 font-bold font-offbit text-xs">[+]</span>
      </div>

      {/* Bottom-Left Telemetry Bracket */}
      <div className="absolute bottom-6 left-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
        <span className="text-rose-400/80 font-bold font-offbit text-xs">+</span>
        <span>GRID_Z: INFINITE_LOOP</span>
      </div>

      {/* Bottom-Right Telemetry Bracket */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
        <span>MNET // BRAINXR_CORE</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      {/* ================= LEFT EDGE PORTAL TILES ================= */}
      {/* Top-Left: Large White Portal Tile */}
      <div
        className="absolute -top-6 -left-8 w-44 h-32 rounded-lg border border-white/20 bg-white/[0.04] backdrop-blur-xs shadow-[0_0_25px_rgba(255,255,255,0.08)] transform -rotate-12 skew-y-3 animate-pulse opacity-70"
        style={{ animationDuration: "7s" }}
      >
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/40" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/40" />
      </div>

      {/* Top-Left: Emerald Accent Tile */}
      <div
        className="absolute top-32 left-6 w-24 h-20 rounded-md border border-emerald-400/40 bg-emerald-400/[0.08] shadow-[0_0_20px_rgba(52,211,153,0.22)] transform rotate-15 -skew-x-6 animate-bounce opacity-65"
        style={{ animationDuration: "8.5s" }}
      >
        <span className="absolute top-1.5 right-2 font-mono text-[8px] text-emerald-400/70 tracking-tighter">EMR // 01</span>
      </div>

      {/* Mid-Left: Soft White Wireframe Tile */}
      <div
        className="absolute top-1/2 -left-6 -translate-y-1/2 w-32 h-24 rounded-lg border border-white/25 bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.06)] transform -rotate-6 animate-pulse opacity-60"
        style={{ animationDuration: "6s" }}
      />

      {/* Mid-Left Lower: Purple Accent Tile */}
      <div
        className="absolute top-[64%] left-10 w-28 h-20 rounded-md border border-purple-400/40 bg-purple-400/[0.08] shadow-[0_0_22px_rgba(192,132,252,0.22)] transform -rotate-15 skew-y-3 animate-pulse opacity-65"
        style={{ animationDuration: "7.2s" }}
      >
        <span className="absolute bottom-1.5 left-2 font-mono text-[8px] text-purple-400/70 tracking-tighter">PRP // 02</span>
      </div>

      {/* Bottom-Left: Large White Glowing Tile */}
      <div
        className="absolute bottom-10 -left-6 w-48 h-32 rounded-lg border border-white/30 bg-white/[0.06] shadow-[0_0_30px_rgba(255,255,255,0.12)] transform rotate-18 animate-bounce opacity-70"
        style={{ animationDuration: "9s" }}
      >
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/50" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/50" />
      </div>

      {/* Bottom-Left Outer: Cyan Accent Tile */}
      <div
        className="absolute -bottom-8 left-36 w-32 h-20 rounded-md border border-cyan-400/40 bg-cyan-400/[0.08] shadow-[0_0_20px_rgba(34,211,238,0.22)] transform -rotate-8 animate-pulse opacity-60"
        style={{ animationDuration: "7.8s" }}
      >
        <span className="absolute top-1.5 left-2 font-mono text-[8px] text-cyan-400/70 tracking-tighter">CYN // 03</span>
      </div>

      {/* ================= RIGHT EDGE PORTAL TILES ================= */}
      {/* Top-Right: Large White Portal Tile */}
      <div
        className="absolute -top-8 -right-6 w-52 h-36 rounded-lg border border-white/25 bg-white/[0.05] shadow-[0_0_30px_rgba(255,255,255,0.1)] transform rotate-12 -skew-y-3 animate-pulse opacity-70"
        style={{ animationDuration: "7.5s" }}
      >
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/40" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/40" />
      </div>

      {/* Top-Right: Cyan Accent Tile */}
      <div
        className="absolute top-32 right-8 w-28 h-20 rounded-md border border-cyan-400/40 bg-cyan-400/[0.08] shadow-[0_0_22px_rgba(34,211,238,0.25)] transform -rotate-15 skew-x-6 animate-bounce opacity-65"
        style={{ animationDuration: "8s" }}
      >
        <span className="absolute top-1.5 right-2 font-mono text-[8px] text-cyan-400/70 tracking-tighter">CYN // 04</span>
      </div>

      {/* Mid-Right: Red Accent Tile */}
      <div
        className="absolute top-1/2 -right-6 -translate-y-1/2 w-36 h-24 rounded-lg border border-rose-400/40 bg-rose-400/[0.08] shadow-[0_0_24px_rgba(244,63,94,0.24)] transform rotate-12 animate-pulse opacity-65"
        style={{ animationDuration: "6.8s" }}
      >
        <span className="absolute bottom-1.5 right-2 font-mono text-[8px] text-rose-400/70 tracking-tighter">RED // 05</span>
      </div>

      {/* Mid-Right Lower: White Floating Tile */}
      <div
        className="absolute top-[65%] right-10 w-24 h-18 rounded-md border border-white/20 bg-white/[0.04] shadow-[0_0_18px_rgba(255,255,255,0.06)] transform -rotate-6 animate-bounce opacity-55"
        style={{ animationDuration: "8.8s" }}
      />

      {/* Bottom-Right: Large Emerald Accent Tile */}
      <div
        className="absolute -bottom-8 -right-8 w-56 h-36 rounded-lg border border-emerald-400/40 bg-emerald-400/[0.07] shadow-[0_0_35px_rgba(52,211,153,0.2)] transform -rotate-12 animate-pulse opacity-70"
        style={{ animationDuration: "8.2s" }}
      >
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-emerald-400/50" />
        <span className="absolute bottom-2 right-3 font-mono text-[8px] text-emerald-400/70 tracking-tighter">EMR // 06</span>
      </div>

      {/* Bottom-Right Inner: Purple Floating Tile */}
      <div
        className="absolute bottom-28 right-32 w-24 h-18 rounded-md border border-purple-400/40 bg-purple-400/[0.08] shadow-[0_0_20px_rgba(192,132,252,0.2)] transform rotate-18 animate-bounce opacity-60"
        style={{ animationDuration: "9.5s" }}
      >
        <span className="absolute top-1.5 left-2 font-mono text-[8px] text-purple-400/70 tracking-tighter">PRP // 07</span>
      </div>
    </div>
  );
};
