import React, { useEffect, useRef } from "react";
import type { ElectrodeName, Frame } from "../utils/signalSource";
import { getElectrodeMetadata, PREFRONTAL_ELECTRODES } from "../utils/signalSource";
import { REGION_COLOR } from "../utils/electrodeVisualState";

interface NodeExplorerProps {
  isIdle: boolean;
  selectedChannel: ElectrodeName | null;
  hoveredChannel: ElectrodeName | null;
  frame: Frame;
  onSelectChannel: (name: ElectrodeName | null) => void;
  highlightPrefrontal: boolean;
  onHighlightPrefrontal: (highlighted: boolean) => void;
}

const REGIONS = Object.entries(REGION_COLOR);

const NodeExplorer: React.FC<NodeExplorerProps> = ({
  isIdle, selectedChannel, hoveredChannel, frame, onSelectChannel,
  highlightPrefrontal, onHighlightPrefrontal,
}) => {
  const cursorTagRef = useRef<HTMLDivElement>(null);
  const metadata = selectedChannel ? getElectrodeMetadata(selectedChannel) : null;
  const sample = selectedChannel ? frame.channels[selectedChannel] : undefined;
  const isGuidedPrefrontal = highlightPrefrontal && selectedChannel != null
    && PREFRONTAL_ELECTRODES.includes(selectedChannel as (typeof PREFRONTAL_ELECTRODES)[number]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (cursorTagRef.current) {
        cursorTagRef.current.style.transform = `translate3d(${event.clientX + 14}px, ${event.clientY + 14}px, 0)`;
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const showPrefrontal = () => {
    onHighlightPrefrontal(true);
    onSelectChannel("FpZ");
  };
  const clearSelection = () => {
    onSelectChannel(null);
    onHighlightPrefrontal(false);
  };

  return (
    <>
      <div ref={cursorTagRef} className={`pointer-events-none fixed left-0 top-0 z-50 hidden rounded-full border border-slate-900/10 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md transition-opacity md:block ${hoveredChannel ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
        {hoveredChannel && (
          <span className="flex items-center gap-2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-slate-900">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: REGION_COLOR[getElectrodeMetadata(hoveredChannel).region] }} />
            {hoveredChannel}
            <span className="font-medium normal-case tracking-normal text-slate-600">{getElectrodeMetadata(hoveredChannel).fullName}</span>
            {isIdle && <span className="font-medium normal-case tracking-normal text-slate-500">Click to explore</span>}
          </span>
        )}
      </div>

      {!isIdle && !metadata && (
        <div className="pointer-events-none absolute inset-0 z-30 hidden md:block">
          <section className="absolute left-28 top-4 flex h-10 items-center">
            <h2 className="font-offbit text-2xl font-bold uppercase leading-none text-slate-950">Explore 21 signals</h2>
          </section>

          <div className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col gap-2 rounded-xl bg-white/70 p-3 backdrop-blur-sm">
            {REGIONS.map(([region, color]) => (
              <span key={region} className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{region}
              </span>
            ))}
          </div>

          <p className="absolute bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Drag to rotate · click to inspect signal</p>
        </div>
      )}

      {!isIdle && !metadata && (
        <div className="pointer-events-auto absolute inset-x-4 top-20 z-40 rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-xl md:hidden">
          <h2 className="font-offbit text-2xl uppercase text-slate-950">Explore 21 signals</h2>
          <p className="mt-2 text-xs leading-5 text-slate-600">Rotate the headset and select a node to highlight its live signal.</p>
          <button onClick={showPrefrontal} className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white">Explore focus sensors →</button>
        </div>
      )}

      {!isIdle && metadata && (
        <aside aria-live="polite" className="pointer-events-auto absolute left-4 right-4 top-4 z-40 max-h-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:left-auto sm:right-6 sm:top-1/2 sm:w-[22rem] sm:-translate-y-1/2 sm:p-5">
          <button onClick={clearSelection} aria-label="Close electrode details" className="absolute right-4 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900">&times;</button>
          <div key={metadata.name} className="animate-node-panel-in">
            <div className="pr-9">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Selected electrode</p>
              <h2 className="mt-1 font-offbit text-4xl font-bold uppercase leading-none text-slate-950">{metadata.name}</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <span>Group<strong className="mt-1 flex items-center gap-1.5 text-slate-900"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: REGION_COLOR[metadata.region] }} />{metadata.region}</strong></span>
              <span>Placement<strong className="mt-1 block text-sky-700">{metadata.fullName}</strong></span>
            </div>
            <p className="mt-4 text-sm leading-5 text-slate-600">{metadata.description}</p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-2">
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">Live signal</span>
              <strong className="font-mono text-xs text-slate-900">{sample ? `${sample.value.toFixed(1)} µV` : "Waiting"}</strong>
            </div>
            <p className="mt-3 text-[10px] leading-4 text-slate-400">The matching waveform is highlighted behind the headset.</p>
            {!isGuidedPrefrontal && <button onClick={showPrefrontal} className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-indigo-600">Explore focus sensors →</button>}
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-slate-200 pt-4">
              {REGIONS.map(([region, color]) => <span key={region} className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{region}</span>)}
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

export default React.memo(NodeExplorer);
