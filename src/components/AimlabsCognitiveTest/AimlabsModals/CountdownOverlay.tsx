import React from "react";

interface CountdownOverlayProps {
  countdown: number;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ countdown }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md pointer-events-none select-none transition-opacity duration-300">
    <div className="flex flex-col items-center">
      <div className="text-8xl md:text-9xl font-offbit text-white tracking-widest drop-shadow-[0_0_24px_rgba(34,211,238,0.5)]">
        {countdown > 0 ? countdown : "GO"}
      </div>
      <div className="mt-4 text-xs font-mono uppercase tracking-[0.25em] text-cyan-400">
        Fixate center cross
      </div>
    </div>
  </div>
);
