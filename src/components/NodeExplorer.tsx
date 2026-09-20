import React, { useEffect, useRef, useState } from "react";
import type { ElectrodeName, Frame } from "../utils/signalSource";
import { getElectrodeMetadata, PREFRONTAL_ELECTRODES } from "../utils/signalSource";
import { REGION_COLOR } from "../utils/electrodeVisualState";
import { xrStore } from "../utils/xrStore";

interface NodeExplorerProps {
  isIdle: boolean;
  selectedChannel: ElectrodeName | null;
  hoveredChannel: ElectrodeName | null;
  frame: Frame;
  onSelectChannel: (name: ElectrodeName | null) => void;
  highlightPrefrontal: boolean;
  onHighlightPrefrontal: (highlighted: boolean) => void;
}

type XRAvailability = "checking" | "supported" | "unsupported";
const REGIONS = Object.entries(REGION_COLOR);
const REGION_CONTEXT: Record<string, { title: string; description: string }> = {
  Frontal: { title: "Thinking and control", description: "Frontal signals provide context for planning, attention, decision-making, and voluntary control." },
  Temporal: { title: "Sound and recognition", description: "Temporal signals provide context for hearing, language, memory, and recognising people or objects." },
  Central: { title: "Movement and sensation", description: "Central signals sit near sensorimotor areas involved in coordinating movement and bodily sensation." },
  Parietal: { title: "Spatial integration", description: "Parietal signals provide context for spatial attention and combining information from the senses." },
  Occipital: { title: "Visual processing", description: "Occipital signals sit over visual areas that respond strongly while processing visual information." },
};

const NodeExplorer: React.FC<NodeExplorerProps> = ({
  isIdle,
  selectedChannel,
  hoveredChannel,
  frame,
  onSelectChannel,
  highlightPrefrontal,
  onHighlightPrefrontal,
}) => {
  const cursorTagRef = useRef<HTMLDivElement>(null);
  const [xrAvailability, setXRAvailability] = useState<XRAvailability>("checking");
  const [xrError, setXRError] = useState<string | null>(null);
  const metadata = selectedChannel ? getElectrodeMetadata(selectedChannel) : null;
  const sample = selectedChannel ? frame.channels[selectedChannel] : undefined;
  const regionContext = metadata ? REGION_CONTEXT[metadata.region] : null;
  const isGuidedPrefrontal = highlightPrefrontal
    && selectedChannel != null
    && PREFRONTAL_ELECTRODES.includes(selectedChannel as (typeof PREFRONTAL_ELECTRODES)[number]);

  useEffect(() => {
    let active = true;
    const xr = navigator.xr;
    if (!xr) {
      setXRAvailability("unsupported");
      return;
    }
    xr.isSessionSupported("immersive-vr")
      .then((supported) => active && setXRAvailability(supported ? "supported" : "unsupported"))
      .catch(() => active && setXRAvailability("unsupported"));
    return () => { active = false; };
  }, []);

  // Mouse movement must not re-render the React/Three composition root.
  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (cursorTagRef.current) {
        cursorTagRef.current.style.transform =
          `translate3d(${event.clientX + 14}px, ${event.clientY + 14}px, 0)`;
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

  const enterVR = async () => {
    setXRError(null);
    try {
      await xrStore.enterVR();
    } catch {
      setXRError("VR could not start. Check headset access and browser permissions.");
    }
  };

  return (
    <>
      <div
        ref={cursorTagRef}
        className={`pointer-events-none fixed left-0 top-0 z-50 hidden rounded-full border border-slate-900/10 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md transition-opacity md:block ${hoveredChannel ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      >
        {hoveredChannel && (
          <span className="flex items-center gap-2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] text-slate-900">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: REGION_COLOR[getElectrodeMetadata(hoveredChannel).region] }} />
            {hoveredChannel}
            <span className="font-medium normal-case tracking-normal text-slate-600">
              {getElectrodeMetadata(hoveredChannel).fullName}
            </span>
            <span className="font-medium normal-case tracking-normal text-slate-500">
              {isIdle ? "Click to explore in demo" : "Click to inspect"}
            </span>
          </span>
        )}
      </div>

      {!isIdle && <aside aria-live="polite" className="pointer-events-auto absolute left-4 right-4 top-4 z-40 max-h-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:left-auto sm:right-6 sm:top-1/2 sm:w-[22rem] sm:-translate-y-1/2 sm:p-5">
        {metadata ? (
          <div key={metadata.name} className="animate-node-panel-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Selected electrode</p>
                <h2 className="mt-1 font-offbit text-4xl font-bold uppercase leading-none text-slate-950">{metadata.name}</h2>
              </div>
              <button onClick={clearSelection} aria-label="Close electrode details" className="rounded-full px-2 py-1 text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900">&times;</button>
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">{metadata.fullName}</p>
            <p className="mt-2 text-sm leading-5 text-slate-600">{metadata.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <span>Region<strong className="mt-1 block text-slate-900">{metadata.region}</strong></span>
              <span>Live signal<strong className="mt-1 block text-slate-900">{sample ? `${sample.value.toFixed(1)} µV` : "Waiting"}</strong></span>
            </div>
            <p className="mt-3 text-[10px] leading-4 text-slate-400">The matching waveform is highlighted behind the headset. Brightness visualises signal amplitude, not focus by itself.</p>

            {regionContext && (
              <div className="mt-4 rounded-xl bg-slate-100/80 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {isGuidedPrefrontal ? "Prefrontal group" : `${metadata.region} context`}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-900">
                  {isGuidedPrefrontal ? "Focus and executive function" : regionContext.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {isGuidedPrefrontal
                    ? `${PREFRONTAL_ELECTRODES.join(", ")} sit over the prefrontal area. Together they offer context for attention and executive function; no single electrode measures focus.`
                    : regionContext.description}
                </p>
              </div>
            )}

            {!isGuidedPrefrontal && (
              <button onClick={showPrefrontal} className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-indigo-600 hover:text-indigo-800">
                Highlight prefrontal group →
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Interactive EEG map</p>
            <h2 className="mt-2 font-offbit text-3xl font-bold uppercase leading-none text-slate-950">Explore 21 signals</h2>
            <p className="mt-3 text-sm leading-5 text-slate-600">Each glowing dot is an electrode reading electrical activity at the scalp. Rotate the headset, then select a dot to inspect it.</p>
            <button onClick={showPrefrontal} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-xs font-bold text-white transition hover:bg-sky-700">
              Show the prefrontal electrodes <span className="float-right" aria-hidden="true">→</span>
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-slate-200 pt-4">
          {REGIONS.map(([region, color]) => (
            <span key={region} className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{region}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Drag to rotate · click a node</span>
          <button disabled={xrAvailability !== "supported"} onClick={enterVR} className="border-b border-slate-900 pb-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-900 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400">
            {xrAvailability === "checking" ? "Checking VR…" : xrAvailability === "supported" ? "Explore in VR" : "VR unavailable"}
          </button>
        </div>
        {xrError && <p role="alert" className="mt-3 text-xs text-red-700">{xrError}</p>}
      </aside>}
    </>
  );
};

export default React.memo(NodeExplorer);
