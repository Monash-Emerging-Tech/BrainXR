import React, { useEffect, useRef } from "react";
import { getElectrodeMetadata, type ElectrodeName } from "../../utils/signalSource";
import { REGION_COLOR } from "../../utils/electrodeVisualState";

interface CursorTagProps { channel: ElectrodeName | null; isIdle: boolean; }

const CursorTag: React.FC<CursorTagProps> = ({ channel, isIdle }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (ref.current) ref.current.style.transform = `translate3d(${event.clientX + 14}px, ${event.clientY + 14}px, 0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  const metadata = channel ? getElectrodeMetadata(channel) : null;
  return (
    <div ref={ref} className={`pointer-events-none fixed left-0 top-0 z-50 hidden rounded-full border border-slate-900/10 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md transition-opacity md:block ${metadata ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
      {metadata && <span className="flex items-center gap-2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-slate-900">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: REGION_COLOR[metadata.region] }} />
        {metadata.name}<span className="font-medium normal-case tracking-normal text-slate-600">{metadata.fullName}</span>
        {isIdle && <span className="font-medium normal-case tracking-normal text-slate-500">Click to explore</span>}
      </span>}
    </div>
  );
};

export default React.memo(CursorTag);
