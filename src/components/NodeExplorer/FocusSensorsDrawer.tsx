import React from "react";
import { ELECTRODE_METADATA, PREFRONTAL_ELECTRODES, type ElectrodeName, type Frame } from "../../utils/signalSource";
import { REGION_COLOR } from "../../utils/electrodeVisualState";
import { XMark1Icon } from "../icons/IconmonstrIcons";

interface FocusSensorsDrawerProps {
  open: boolean;
  frame: Frame;
  onClose: () => void;
  onSelectSignal: (channel: ElectrodeName) => void;
}

const FocusSensorsDrawer: React.FC<FocusSensorsDrawerProps> = ({ open, frame, onClose, onSelectSignal }) => (
  <aside
    aria-hidden={!open}
    aria-live="polite"
    className={`pointer-events-auto absolute right-0 top-1/2 z-40 max-h-[calc(100%-8rem)] w-[min(22rem,calc(100%-1rem))] -translate-y-1/2 overflow-y-auto rounded-l-2xl border border-r-0 border-white/80 bg-white/95 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"}`}
  >
    <button onClick={onClose} aria-label="Close focus sensor details" className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"><XMark1Icon className="h-2.5 w-2.5" /></button>
    <div className="pr-9">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Focus sensor group</p>
      <h2 className="mt-2 font-offbit text-3xl font-bold uppercase leading-none text-slate-950">Prefrontal attention signals</h2>
      <p className="mt-2 text-sm leading-5 text-slate-600">These four frontal electrodes provide complementary context for attention and executive function. No single sensor measures focus by itself.</p>
    </div>

    <div className="mt-5 border-t border-slate-200 pt-4">
      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Highlighted signals</p>
      <div className="grid grid-cols-2 gap-2">
        {PREFRONTAL_ELECTRODES.map((name) => {
          const metadata = ELECTRODE_METADATA[name];
          const sample = frame.channels[name];
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectSignal(name)}
              className="group rounded-xl border border-transparent bg-slate-100 px-3 py-2.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={`Inspect ${name}, ${metadata.fullName}`}
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="flex items-center gap-1.5 text-xs text-slate-950 transition group-hover:text-indigo-700"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: REGION_COLOR.Frontal }} />{name}</strong>
                <span className="font-mono text-[10px] font-bold text-slate-600">{sample ? `${sample.value.toFixed(1)} µV` : "--"}</span>
              </div>
              <span className="mt-1 block text-[9px] leading-3 text-slate-500">{metadata.fullName}</span>
            </button>
          );
        })}
      </div>
    </div>

    <p className="mt-4 text-[10px] leading-4 text-slate-400">All four matching waveforms are highlighted behind the headset for comparison.</p>
  </aside>
);

export default React.memo(FocusSensorsDrawer);
