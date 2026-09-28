import React from "react";
import {
  ELECTRODE_METADATA,
  getElectrodeMetadata,
  type ElectrodeName,
  type Frame,
} from "../../utils/signalSource";
import { REGION_COLOR } from "../../utils/electrodeVisualState";
import { ELECTRODE_DISPLAY_ORDER } from "../../utils/electrodeDisplayOrder";
import { XMark1Icon } from "../icons/IconmonstrIcons";

interface ElectrodeCardDeckProps {
  channel: ElectrodeName | null;
  frame: Frame;
  onSelect: (channel: ElectrodeName) => void;
  onCloseSelection: () => void;
}

const ElectrodeCardDeck: React.FC<ElectrodeCardDeckProps> = ({
  channel,
  frame,
  onSelect,
  onCloseSelection,
}) => {
  const metadata = channel ? getElectrodeMetadata(channel) : null;
  const sample = channel ? frame.channels[channel] : undefined;
  const phaseLabel = frame.phase === "quality-check" ? "Quality check" : frame.phase;

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-40 hidden md:block">
      <nav
        aria-label="Electrode card deck"
        className="pointer-events-auto absolute bottom-24 right-0 top-[72px] flex flex-col items-end"
      >
        {ELECTRODE_DISPLAY_ORDER.map((name) => {
          const card = ELECTRODE_METADATA[name];
          return (
            <span key={name} className="flex min-h-0 flex-1 items-center justify-end">
              <button
                type="button"
                onClick={() => onSelect(name)}
                aria-label={`Inspect ${name}, ${card.fullName}, ${card.region}`}
                className="group/card relative h-[70%] min-h-3.5 max-h-6 w-36 translate-x-[4.5rem] overflow-hidden rounded-l-md border-y border-l border-white/45 px-2 text-left shadow-sm transition-all duration-200 ease-out hover:z-30 hover:translate-x-0 hover:scale-y-110 hover:rounded-l-lg hover:shadow-lg focus-visible:z-30 focus-visible:translate-x-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                style={{ backgroundColor: REGION_COLOR[card.region] }}
              >
                <span className="flex h-full items-center gap-1.5 whitespace-nowrap text-white drop-shadow-sm">
                  <strong className="font-offbit text-[11px] uppercase leading-none">{name}</strong>
                  <span className="text-[7px] font-black uppercase tracking-[0.08em] text-white/85">{card.region}</span>
                </span>
                <span className="absolute inset-y-0 left-0 w-0.5 bg-white/45 opacity-0 transition-opacity group-hover/card:opacity-100" />
              </button>
            </span>
          );
        })}
      </nav>

      <article
        aria-hidden={!metadata}
        aria-live="polite"
        className={`pointer-events-auto absolute right-12 top-1/2 w-[22rem] -translate-y-1/2 overflow-hidden rounded-2xl border border-white/70 shadow-2xl shadow-slate-900/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${metadata ? "translate-x-0 rotate-0 scale-100 opacity-100" : "translate-x-16 rotate-3 scale-90 opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: metadata ? REGION_COLOR[metadata.region] : REGION_COLOR.Frontal }}
      >
        {metadata && (
          <div key={metadata.name} className="animate-node-panel-in p-5 text-white">
            <button onClick={onCloseSelection} aria-label="Return electrode card to deck" className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"><XMark1Icon className="h-2.5 w-2.5" /></button>
            <p className="pr-9 text-[9px] font-black uppercase tracking-[0.22em] text-white/70">Selected electrode</p>
            <h2 className="mt-2 font-offbit text-6xl font-bold uppercase leading-none">{metadata.name}</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/80">{metadata.region} · {metadata.fullName}</p>
            <p className="mt-5 border-t border-white/25 pt-4 text-sm leading-6 text-white/90">{metadata.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-black/10">
              <div className="bg-white/12 px-3 py-3">
                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-white/65">Live signal</span>
                <strong className="mt-1 block font-mono text-xs">{sample ? `${sample.value.toFixed(1)} µV` : "Waiting"}</strong>
              </div>
              <div className="bg-white/12 px-3 py-3">
                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-white/65">Recording phase</span>
                <strong className="mt-1 block text-xs capitalize">{phaseLabel}</strong>
              </div>
            </div>
            <p className="mt-3 text-[10px] leading-4 text-white/65">Its matching waveform is highlighted behind the headset. Signal amplitude alone is not a direct measure of focus.</p>
          </div>
        )}
      </article>
    </div>
  );
};

export default React.memo(ElectrodeCardDeck);
