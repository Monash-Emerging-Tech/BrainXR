import React, { useState, useRef, useEffect } from "react";
import { useVisionMode } from "../../hooks/useVisionMode";

interface AccessibilityMenuProps {
  align?: "left" | "right";
  direction?: "up" | "down";
  className?: string;
  buttonClassName?: string;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  align = "right",
  direction = "down",
  className = "",
  buttonClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { visionMode, setVisionMode, modes } = useVisionMode();

  useEffect(() => {
    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDownOutside);
      document.addEventListener("touchstart", handlePointerDownOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
      document.removeEventListener("touchstart", handlePointerDownOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const defaultButtonClass =
    "p-2.5 rounded-lg bg-[#0d0d10]/90 hover:bg-[#1a1a24] text-slate-300 hover:text-white border border-white/15 backdrop-blur-md transition-all duration-200 shadow-sm hover:border-white/30 active:scale-95 cursor-pointer flex items-center justify-center";

  const dropdownPositionClass =
    direction === "up"
      ? `bottom-full mb-2 ${align === "right" ? "right-0" : "left-0"}`
      : `top-full mt-2 ${align === "right" ? "right-0" : "left-0"}`;

  return (
    <div ref={containerRef} className={`relative pointer-events-auto ${className}`}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Color vision accessibility settings"
        title="Color vision settings"
        className={buttonClassName || defaultButtonClass}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute ${dropdownPositionClass} z-50 w-52 max-h-80 overflow-y-auto rounded-xl border border-white/15 bg-[#0d0d10]/95 backdrop-blur-xl shadow-2xl font-mono text-xs animate-fade-in`}
        >
          <div className="px-4 py-2.5 text-[9px] text-slate-400 uppercase tracking-widest border-b border-white/10 font-bold flex items-center justify-between">
            <span>Color Vision</span>
            <span className="text-[8px] text-cyan-400 font-semibold lowercase">filter</span>
          </div>

          <div className="py-1">
            {modes.map((mode) => {
              const isActive = visionMode === mode.id;
              return (
                <button
                  key={mode.id}
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    setVisionMode(mode.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-left px-4 py-2 uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                    isActive
                      ? "bg-cyan-400/15 text-cyan-300 font-bold"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span>{mode.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

