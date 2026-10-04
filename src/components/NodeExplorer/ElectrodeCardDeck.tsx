import React, { useState } from "react";
import {
  ELECTRODE_METADATA,
  getElectrodeMetadata,
  type ElectrodeName,
  type Frame,
} from "../../utils/signalSource";
import { REGION_COLOR } from "../../utils/electrodeVisualState";
import { ELECTRODE_DISPLAY_ORDER, ELECTRODE_REGION_ORDER } from "../../utils/electrodeDisplayOrder";
import { XMark1Icon } from "../icons/IconmonstrIcons";

interface ElectrodeCardDeckProps {
  channel: ElectrodeName | null;
  frame: Frame;
  onSelect: (channel: ElectrodeName) => void;
  onCloseSelection: () => void;
}

const REGION_RANGES = ELECTRODE_REGION_ORDER.map((region) => {
  const start = ELECTRODE_DISPLAY_ORDER.findIndex((name) => ELECTRODE_METADATA[name].region === region);
  const count = ELECTRODE_DISPLAY_ORDER.filter((name) => ELECTRODE_METADATA[name].region === region).length;
  return { region, start, count };
});

const ElectrodeCardDeck: React.FC<ElectrodeCardDeckProps> = ({
  channel,
  frame,
  onSelect,
  onCloseSelection,
}) => {
  const [hoveredCard, setHoveredCard] = useState<ElectrodeName | null>(null);
  const metadata = channel ? getElectrodeMetadata(channel) : null;
  const sample = channel ? frame.channels[channel] : undefined;
  const phaseLabel = frame.phase === "quality-check" ? "Quality check" : frame.phase;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 hidden md:block">
      <nav
        aria-label="Electrode card deck"
        className="pointer-events-auto absolute bottom-24 right-0 top-[72px] flex w-40 flex-col items-end"
      >
        {REGION_RANGES.map(({ region, start, count }) => (
          <span
            key={region}
            aria-hidden="true"
            className="pointer-events-none absolute right-0 w-20 rounded-l-2xl opacity-70"
            style={{
              top: `${(start / ELECTRODE_DISPLAY_ORDER.length) * 100}%`,
              height: `${(count / ELECTRODE_DISPLAY_ORDER.length) * 100}%`,
              background: `linear-gradient(90deg, transparent, ${REGION_COLOR[region]}12)`,
            }}
          />
        ))}
        {ELECTRODE_DISPLAY_ORDER.map((name) => {
          const card = ELECTRODE_METADATA[name];
          const activeCard = hoveredCard ?? channel;
          const isActive = activeCard === name;
          const isDeemphasized = activeCard != null && !isActive;
          return (
            <span key={name} className="relative flex min-h-0 flex-1 items-center justify-end pr-2">
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute right-4 h-px w-6 origin-right transition-all duration-200 ${hoveredCard === name ? "scale-x-110 opacity-100" : "opacity-50"}`}
                style={{ backgroundColor: REGION_COLOR[card.region] }}
              />
              <button
                type="button"
                onClick={() => onSelect(name)}
                onMouseEnter={() => setHoveredCard(name)}
                onMouseLeave={() => setHoveredCard(null)}
                onFocus={() => setHoveredCard(name)}
                onBlur={() => setHoveredCard(null)}
                aria-label={`Inspect ${name}, ${card.fullName}, ${card.region}`}
                className={`group/card relative z-10 flex h-[76%] min-h-6 max-h-8 w-9 cursor-pointer items-center overflow-hidden rounded-full border border-white/80 text-left backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-30 hover:w-28 hover:-translate-x-1 hover:-translate-y-0.5 hover:scale-105 focus-visible:z-30 focus-visible:w-28 focus-visible:-translate-x-1 focus-visible:-translate-y-0.5 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:translate-y-px active:scale-[0.98] ${isDeemphasized ? "opacity-55 saturate-75" : "opacity-100"} ${channel === name ? "scale-[1.04] ring-2 ring-white ring-offset-1 ring-offset-transparent" : ""}`}
                style={{
                  background: `linear-gradient(180deg, ${REGION_COLOR[card.region]}ee 0%, ${REGION_COLOR[card.region]}c9 100%)`,
                  boxShadow: isActive
                    ? `inset 0 1px 0 rgba(255,255,255,.72), inset 0 -2px 0 rgba(15,23,42,.22), 0 4px 0 rgba(15,23,42,.28), 0 8px 22px ${REGION_COLOR[card.region]}70`
                    : `inset 0 1px 0 rgba(255,255,255,.62), inset 0 -2px 0 rgba(15,23,42,.18), 0 3px 0 rgba(15,23,42,.22), 0 5px 12px ${REGION_COLOR[card.region]}32`,
                }}
              >
                <span className="flex h-full min-w-max items-center whitespace-nowrap text-white [text-shadow:0_1px_2px_rgba(15,23,42,0.45)]">
                  <strong className="flex w-9 shrink-0 items-center justify-center font-offbit text-[10px] uppercase leading-none">{name}</strong>
                  <span className="-translate-x-1 pr-3 text-[8px] font-black uppercase tracking-[0.08em] text-white/0 transition-all duration-200 group-hover/card:translate-x-0 group-hover/card:text-white/90 group-focus-visible/card:translate-x-0 group-focus-visible/card:text-white/90">
                    {card.region}
                  </span>
                </span>
              </button>
            </span>
          );
        })}
      </nav>

      <article
        aria-hidden={!metadata}
        aria-live="polite"
        className={`pointer-events-auto absolute left-12 top-1/2 w-[22rem] -translate-y-1/2 overflow-hidden rounded-2xl border border-white/70 shadow-2xl shadow-slate-900/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${metadata ? "translate-x-0 rotate-0 scale-100 opacity-100" : "pointer-events-none -translate-x-16 -rotate-3 scale-90 opacity-0"}`}
        style={{ backgroundColor: `${metadata ? REGION_COLOR[metadata.region] : REGION_COLOR.Frontal}e8`, backdropFilter: "blur(18px)" }}
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
