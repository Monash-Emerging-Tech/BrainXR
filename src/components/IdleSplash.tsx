// Idle-mode marketing splash: the "an MNET experience / BrainXR" headline
// (rendered twice, solid behind the headset and outlined in front of it) and
// the bottom call-to-action buttons. Only ever shown in idle mode.
import React from "react";
import { xrStore } from "../utils/xrStore";

interface SpannedTextProps {
  text: string;
  className?: string;
}

const SpannedText: React.FC<SpannedTextProps> = ({ text, className = "" }) => (
  <div className={`flex justify-between w-full font-offbit uppercase tracking-normal select-none ${className}`}>
    {text.split("").map((char, index) => (
      <span key={index}>{char === " " ? " " : char}</span>
    ))}
  </div>
);

interface IdleHeadlineProps {
  variant: "solid" | "outline";
  onStartStory?: () => void;
}

export const IdleHeadline: React.FC<IdleHeadlineProps> = ({ variant, onStartStory }) => {
  const textClass = variant === "solid" ? "text-slate-900" : "text-transparent text-stroke-slate";
  const zClass = variant === "solid" ? "z-0" : "z-20";

  const fullText = "an MNET experience";
  // Prefix: "an " (indices 0..2)
  // MNET: "MNET" (indices 3..6)
  // Suffix: " experience" (indices 7..17)
  const mnetStart = fullText.indexOf("MNET");
  const mnetEnd = mnetStart + "MNET".length;

  return (
    <div className={`absolute top-6 md:top-8 left-0 right-0 ${zClass} pointer-events-none select-none px-6 md:px-12 lg:px-16`}>
      <div className="flex flex-col items-center w-full">
        {/* Intro Badge / Origin Story link (interactive on the front/outline layer) */}
        {variant === "outline" ? (
          <div className="pointer-events-auto mb-3">
            <a
              href="/onboarding"
              onClick={(e) => {
                if (onStartStory) {
                  e.preventDefault();
                  onStartStory();
                }
              }}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900/80 pl-3 pr-3.5 py-1.5 text-xs font-offbit tracking-wide text-white border border-slate-700/60 backdrop-blur-md hover:bg-slate-900 hover:border-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all shadow-sm cursor-pointer no-underline"
              title="Experience the BrainXR Origin Story"
            >
              <span className="flex items-center text-xs leading-none transition-transform duration-200 group-hover:scale-110 select-none">🧠</span>
              <span className="flex items-center text-[11px] sm:text-xs tracking-wider uppercase font-semibold leading-none pt-[1px]">explore the origin story</span>
              <span className="flex items-center text-[11px] leading-none text-slate-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
            </a>
          </div>
        ) : (
          <div className="h-[34px] mb-3 invisible" aria-hidden="true" />
        )}

        {/* The entire headline track: MNET Logo, AN, MNET, and EXPERIENCE spread evenly edge-to-edge */}
        {variant === "solid" ? (
          <div className="invisible flex items-center justify-between w-full font-offbit uppercase select-none text-sm sm:text-base md:text-lg lg:text-xl font-bold" aria-hidden="true">
            <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 shrink-0" />
            <span>A</span>
            <span>N</span>
            <span className="invisible">&nbsp;</span>
            <div className="flex justify-between flex-1 max-w-[14rem]">
              <span>M</span><span>N</span><span>E</span><span>T</span>
            </div>
            <span className="invisible">&nbsp;</span>
            {"EXPERIENCE".split("").map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full font-offbit uppercase select-none text-slate-900 text-sm sm:text-base md:text-lg lg:text-xl font-bold">
            {/* 1. MNET Logo */}
            <a
              href="https://monashemerging.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex items-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              title="Visit Monash Emerging Tech"
            >
              <img
                src="/mnet-logo.png"
                alt="MNET Logo"
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 object-contain"
              />
            </a>

            {/* 2. 'A', 'N' */}
            <span>A</span>
            <span>N</span>

            {/* Space between AN and MNET */}
            <span className="invisible select-none" aria-hidden="true">&nbsp;</span>

            {/* 3. Whole hoverable & clickable container for MNET with letters spread evenly */}
            <a
              href="https://monashemerging.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="group pointer-events-auto cursor-pointer no-underline text-slate-900 inline-flex items-center justify-between flex-1 max-w-[14rem] py-1 px-1 -my-1 hover:text-indigo-600 transition-colors"
              title="Visit Monash Emerging Tech"
            >
              {"MNET".split("").map((c, i) => (
                <span
                  key={i}
                  className="underline decoration-2 underline-offset-4 group-hover:text-indigo-600 transition-colors"
                >
                  {c}
                </span>
              ))}
            </a>

            {/* Space between MNET and EXPERIENCE */}
            <span className="invisible select-none" aria-hidden="true">&nbsp;</span>

            {/* 4. 'EXPERIENCE' */}
            {"EXPERIENCE".split("").map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        )}

        {/* BrainXR Title - negative top margin to tighten line spacing with the line above */}
        <h1 className={`flex justify-between w-full text-[13vw] font-black uppercase leading-none -mt-1 sm:-mt-2 md:-mt-3 lg:-mt-4 ${textClass}`}>
          {"BrainXR".split("").map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </h1>

        {/* 'a platform to measure your focus' in the same edge-to-edge Letter Spacing */}
        {variant === "solid" ? (
          <SpannedText
            text="a platform to measure your focus"
            className="text-slate-800/90 text-xs sm:text-sm md:text-base lg:text-lg font-semibold -mt-1 sm:-mt-2"
          />
        ) : (
          <div className="invisible" aria-hidden="true">
            <SpannedText
              text="a platform to measure your focus"
              className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold -mt-1 sm:-mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface IdleActionsProps {
  onStartDemo: () => void;
  onStartLive: () => void;
  onStartStory?: () => void;
  onEnterVR?: () => void;
}

export const IdleActions: React.FC<IdleActionsProps> = ({ onStartDemo, onStartLive, onStartStory, onEnterVR }) => (
  <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center z-30 px-6">
    <div className="flex flex-col items-center gap-2.5">
      {/* Section Heading */}
      <span className="font-offbit font-black uppercase tracking-[0.25em] text-sm sm:text-base md:text-lg text-slate-950 drop-shadow-sm select-none">
        DIMENSIONS OF FOCUS
      </span>

      <div className="flex items-center gap-3">
        <a
          href="/intensity"
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-full transition-all shadow-md active:scale-[0.99] cursor-pointer no-underline text-sm group"
        >
          <span>Intensity of Focus</span>
          {/* Minimalist EEG headset icon: headband band with frontal/temporal electrodes and neuro signal pulse */}
          <svg
            className="w-5 h-5 fill-none stroke-current stroke-[1.75] transition-transform duration-200 group-hover:scale-110 shrink-0"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Headband arch */}
            <path d="M4 14.5C4 8.7 8.5 4 14 4c5.5 0 8 4.7 8 10.5" />
            {/* Temporal sensor pods */}
            <circle cx="4" cy="15" r="1.75" className="fill-current stroke-none" />
            <circle cx="20" cy="15" r="1.75" className="fill-current stroke-none" />
            {/* Prefrontal sensor nodes */}
            <circle cx="10" cy="4.5" r="1.25" className="fill-current stroke-none" />
            <circle cx="14" cy="4" r="1.25" className="fill-current stroke-none" />
            {/* EEG neural wave signal */}
            <path d="M7 14l2-2.5 2 4.5 2.5-3.5 1.5 1.5" />
          </svg>
        </a>
        <a
          href="/direction"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-full shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40 group text-sm no-underline"
          title="Direction of Focus"
          aria-label="Direction of Focus"
        >
          <span>Direction of Focus</span>
          <svg className="w-5 h-5 fill-current transition-transform duration-200 group-hover:scale-110 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 7H3a2 2 0 00-2 2v6a2 2 0 002 2h4l2 2h6l2-2h4a2 2 0 002-2V9a2 2 0 00-2-2zM7.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
        </a>
      </div>
      <button
        onClick={onStartLive}
        className="group inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm font-semibold mt-1 transition-colors cursor-pointer"
      >
        <input
          type="checkbox"
          readOnly
          tabIndex={-1}
          className="w-3.5 h-3.5 rounded border-slate-400 text-indigo-600 focus:ring-0 cursor-pointer pointer-events-none"
        />
        <span className="group-hover:underline">Connect your headset</span>
      </button>
    </div>
  </div>
);
