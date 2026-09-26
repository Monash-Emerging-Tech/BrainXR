import React from "react";
import { REGION_COLOR } from "../../utils/electrodeVisualState";

const REGIONS = Object.entries(REGION_COLOR);

const ExplorerOverview: React.FC = () => (
  <>
    <div className="pointer-events-none absolute inset-0 z-30 hidden md:block">
      <section className="absolute left-28 top-4 flex h-10 items-center">
        <h2 className="font-offbit text-2xl font-bold uppercase leading-none text-slate-950">Explore 21 signals</h2>
      </section>
      <div className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col gap-2 rounded-xl bg-white/70 p-3 backdrop-blur-sm">
        {REGIONS.map(([region, color]) => <span key={region} className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{region}</span>)}
      </div>
      <p className="absolute bottom-32 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Drag to rotate · click to inspect signal</p>
    </div>
    <div className="pointer-events-none absolute inset-x-4 top-20 z-30 rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-xl md:hidden">
      <h2 className="font-offbit text-2xl uppercase text-slate-950">Explore 21 signals</h2>
      <p className="mt-2 text-xs leading-5 text-slate-600">Rotate the headset and select a node to highlight its live signal.</p>
    </div>
  </>
);

export default React.memo(ExplorerOverview);
