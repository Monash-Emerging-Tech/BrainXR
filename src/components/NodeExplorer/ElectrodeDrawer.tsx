import React from "react";
import { getElectrodeMetadata, type ElectrodeName, type Frame } from "../../utils/signalSource";
import { REGION_COLOR } from "../../utils/electrodeVisualState";
import { XMark1Icon } from "../icons/IconmonstrIcons";

interface ElectrodeDrawerProps {
  channel: ElectrodeName | null;
  open: boolean;
  frame: Frame;
  onClose: () => void;
}

const ElectrodeDrawer: React.FC<ElectrodeDrawerProps> = ({ channel, open, frame, onClose }) => {
  const metadata = channel ? getElectrodeMetadata(channel) : null;
  const sample = channel ? frame.channels[channel] : undefined;
  const phaseLabel = frame.phase === "quality-check" ? "Quality check" : frame.phase;
  return (
    <aside aria-hidden={!open} aria-live="polite" className={`pointer-events-auto absolute right-0 top-1/2 z-40 max-h-[calc(100%-8rem)] w-[min(22rem,calc(100%-1rem))] -translate-y-1/2 overflow-y-auto rounded-l-2xl border border-r-0 border-white/80 bg-white/95 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"}`}>
      {metadata && <div key={metadata.name} className="animate-node-panel-in">
        <button onClick={onClose} aria-label="Close electrode details" className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"><XMark1Icon className="h-2.5 w-2.5" /></button>
        <div className="pr-9">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Selected electrode</p>
          <h2 className="mt-1 font-offbit text-5xl font-bold uppercase leading-none text-slate-950">{metadata.name}</h2>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <span>Group<strong className="mt-1 flex items-center gap-1.5 text-slate-900"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: REGION_COLOR[metadata.region] }} />{metadata.region}</strong></span>
          <span>Placement<strong className="mt-1 block text-sky-700">{metadata.fullName}</strong></span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{metadata.description}</p>
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-slate-200">
          <div className="bg-slate-100 px-3 py-3">
            <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">Live signal</span>
            <strong className="mt-1 block font-mono text-xs text-slate-900">{sample ? `${sample.value.toFixed(1)} µV` : "Waiting"}</strong>
          </div>
          <div className="bg-slate-100 px-3 py-3">
            <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">Recording phase</span>
            <strong className="mt-1 block text-xs capitalize text-slate-900">{phaseLabel}</strong>
          </div>
          {(sample?.quality || sample?.impedance != null) && <div className="col-span-2 flex items-center justify-between bg-slate-100 px-3 py-3">
            <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">Signal quality</span>
            <strong className="text-xs capitalize text-slate-900">{sample.quality ?? "Available"}{sample.impedance != null ? ` · ${sample.impedance.toFixed(1)} kΩ` : ""}</strong>
          </div>}
        </div>
        <p className="mt-3 text-[10px] leading-4 text-slate-400">The matching waveform is highlighted behind the headset. Signal amplitude alone is not a direct measure of focus.</p>
      </div>}
    </aside>
  );
};

export default React.memo(ElectrodeDrawer);
