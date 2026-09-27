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
    className={`pointer-events-auto absolute right-12 top-1/2 z-50 max-h-[calc(100%-8rem)] w-[min(22rem,calc(100%-1rem))] -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/70 p-5 text-white shadow-2xl shadow-slate-900/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0 rotate-0 scale-100 opacity-100" : "pointer-events-none translate-x-16 rotate-3 scale-90 opacity-0"}`}
    style={{ backgroundColor: REGION_COLOR.Frontal }}
  >
    <button onClick={onClose} aria-label="Close focus sensor details" className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white">
      <XMark1Icon className="h-2.5 w-2.5" />
    </button>

    <div className="pr-9">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/65">Focus sensor group</p>
      <h2 className="mt-2 font-offbit text-3xl font-bold uppercase leading-none text-white">Prefrontal attention signals</h2>
      <p className="mt-3 text-sm leading-5 text-white/85">These four frontal electrodes provide complementary context for attention and executive function. No single sensor measures focus by itself.</p>
    </div>

    <div className="mt-5 border-t border-white/25 pt-4">
      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/65">Highlighted signals</p>
      <div className="grid grid-cols-2 gap-2">
        {PREFRONTAL_ELECTRODES.map((name) => {
          const metadata = ELECTRODE_METADATA[name];
          const sample = frame.channels[name];
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectSignal(name)}
              className="group rounded-xl border border-white/10 bg-white/12 px-3 py-2.5 text-left text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/22 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`Inspect ${name}, ${metadata.fullName}`}
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="flex items-center gap-1.5 font-offbit text-sm uppercase text-white"><span className="h-2 w-2 rounded-full bg-white/80" />{name}</strong>
                <span className="font-mono text-[10px] font-bold text-white/75">{sample ? `${sample.value.toFixed(1)} µV` : "--"}</span>
              </div>
              <span className="mt-1 block text-[9px] leading-3 text-white/65">{metadata.fullName}</span>
            </button>
          );
        })}
      </div>
    </div>

    <p className="mt-4 text-[10px] leading-4 text-white/60">All four matching waveforms are highlighted behind the headset for comparison. Select a card to inspect one signal.</p>
  </aside>
);

export default React.memo(FocusSensorsDrawer);
