import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import { ELECTRODE_DISPLAY_ORDER } from "../../utils/electrodeDisplayOrder";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { render } from "./render";
import { computeLaneLayout, laneCenterY, type LaneLayout } from "./layout";

interface BackgroundOscilloscopesProps {
  // Rolling per-electrode ring buffers, mutated in place by the playback engine.
  historiesRef: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  // Live frame; its identity changes once per tick and doubles as our "new
  // data arrived, redraw" signal.
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  highlightedChannels?: readonly ElectrodeName[];
  hoveredChannel?: ElectrodeName | null;
  onSelectChannel?: (name: ElectrodeName) => void;
  onHoverChannel?: (name: ElectrodeName | null) => void;
}

const BackgroundOscilloscopes: React.FC<BackgroundOscilloscopesProps> = ({
  historiesRef,
  frameRef,
  selectedChannel,
  highlightedChannels = [],
  hoveredChannel,
  onSelectChannel,
  onHoverChannel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layout, setLayout] = useState<LaneLayout | null>(null);

  // Measure and keep lane layout in sync for HTML overlay positioning
  useEffect(() => {
    const updateLayout = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setLayout(computeLaneLayout(rect.width, rect.height, ELECTRODE_DISPLAY_ORDER.length));
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const voltageRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Self-driving draw loop: reads the ring buffers off the ref on each animation
  // frame and only repaints when a new tick has arrived (or the selection/hover
  // changed). Also updates the superscript voltage values in the DOM directly
  // to avoid React state re-rendering overhead on every tick.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let lastFrame: Frame | null = null;
    let needsRedraw = true; // force a paint on mount / selection / hover change

    const draw = () => {
      const histories = historiesRef.current;
      const currentFrame = frameRef.current;

      if (needsRedraw || currentFrame !== lastFrame) {
        lastFrame = currentFrame;
        needsRedraw = false;
        render(ctx, canvas, histories, selectedChannel, hoveredChannel, highlightedChannels);

        // Update superscript voltage values directly
        if (currentFrame?.channels) {
          for (const name of ELECTRODE_DISPLAY_ORDER) {
            const span = voltageRefs.current[name];
            if (span) {
              const sample = currentFrame.channels[name];
              if (sample !== undefined && sample.value !== undefined) {
                const val = sample.value;
                const formatted = `${val >= 0 ? "+" : ""}${Math.round(val)}µV`;
                if (span.textContent !== formatted) {
                  span.textContent = formatted;
                }
              }
            }
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [historiesRef, frameRef, selectedChannel, hoveredChannel, highlightedChannels]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Dedicated interactive left margin corridor at z-30 for neomorphic electrode labels */}
      {layout && (
        <div
          className="absolute top-0 bottom-0 left-0 z-30 pointer-events-auto"
          style={{ width: `${layout.paddingLeft + 12}px` }}
        >
          {ELECTRODE_DISPLAY_ORDER.map((name, idx) => {
            const centerY = laneCenterY(layout, idx);
            const isSelected = name === selectedChannel || highlightedChannels.includes(name);
            const isHovered = name === hoveredChannel;

            return (
              <button
                key={name}
                type="button"
                onClick={() => onSelectChannel?.(name)}
                onMouseEnter={() => onHoverChannel?.(name)}
                onMouseLeave={() => {
                  if (hoveredChannel === name) onHoverChannel?.(null);
                }}
                style={{
                  top: `${centerY}px`,
                  left: `${layout.paddingLeft / 2}px`,
                }}
                className={`
                  absolute -translate-x-1/2 h-5 px-2 rounded-md font-mono flex items-center justify-center
                  transition-all duration-150 cursor-pointer select-none
                  ${isSelected
                    ? "neomorphic-label-selected min-w-[34px]"
                    : isHovered
                    ? "neomorphic-label-surface min-w-[34px]"
                    : "neomorphic-label-idle"
                  }
                `}
                title={`Electrode ${name}`}
              >
                <span className="text-[10px] leading-none">{name}</span>
                {!isHovered && !isSelected && (
                  <sup
                    ref={(el) => {
                      voltageRefs.current[name] = el;
                    }}
                    className="text-[7.5px] ml-0.5 text-slate-400 font-mono tracking-tighter leading-none inline-block max-w-[28px] text-left overflow-hidden"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default React.memo(BackgroundOscilloscopes);

