import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import {
  useScrollProgress,
  totalWeight,
  type ScrollSegmentDef,
} from "../../hooks/useScrollProgress";
import Act1, { type Act1Phase } from "./Act1";
import Act2, { type Act2Phase } from "./Act2";
import useScrollCheckpoints, { type Checkpoint } from "../../hooks/useScrollCheckpoints";
import {
  ACT1,
  BRAIN_REGIONS,
  DISABLE_CHECKPOINTS,
  STORY_CHECKPOINTS,
  STORY_PACING,
} from "./storyContent";

interface StoryIntroProps {
  onComplete: () => void;
}

type StoryPhase = Act1Phase | Act2Phase;

/**
 * The whole story runs off scroll: one tall track, one sticky 100vh stage.
 *
 * Every length here comes from STORY_PACING.lengths in storyContent.ts --
 * that is the one place to change pacing. Weights are just vh/100, so a
 * segment of 100vh costs the reader one viewport of scrolling.
 */
const L = STORY_PACING.lengths;

const SEGMENTS: readonly ScrollSegmentDef<StoryPhase>[] = [
  // Act 1 -- staged beats, with HOLDs between them
  { id: "hold1", weight: L.hold1Vh / 100 },
  { id: "mistGather", weight: L.mistGatherVh / 100 },
  { id: "mistPart", weight: L.mistPartVh / 100 },
  { id: "line1Form", weight: L.line1FormVh / 100 },
  { id: "hold2", weight: L.hold2Vh / 100 },
  { id: "blockIn", weight: L.blockInVh / 100 },
  { id: "focusForm", weight: L.focusFormVh / 100 },
  { id: "hold3", weight: L.hold3Vh / 100 },
  { id: "zoom", weight: L.zoomVh / 100 },
  // Act 2 -- smoke, then the tour
  { id: "reveal", weight: L.smokeRevealVh / 100 },
  ...BRAIN_REGIONS.map((r) => ({ id: r.id, weight: L.regionVh / 100 })),
  // the prefrontal finale, held on the frontal pose
  { id: "finaleA", weight: L.finaleVh / 100 },
  { id: "finaleB", weight: L.finaleVh / 100 },
  { id: "closing", weight: L.closingVh / 100 },
];

const TRACK_VH = totalWeight(SEGMENTS) * 100;
const ACT1_PHASES = [
  "hold1",
  "mistGather",
  "mistPart",
  "line1Form",
  "hold2",
  "blockIn",
  "focusForm",
  "hold3",
  "zoom",
] as const;

/** Fraction of the track at which each segment ends, for checkpoint placing. */
const SEGMENT_ENDS: Record<string, number> = (() => {
  const total = totalWeight(SEGMENTS) || 1;
  const out: Record<string, number> = {};
  let cursor = 0;
  for (const seg of SEGMENTS) {
    cursor += seg.weight / total;
    out[seg.id] = cursor;
  }
  return out;
})();

export default function StoryIntro({ onComplete }: StoryIntroProps) {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { segments } = useScrollProgress(trackRef, SEGMENTS);

  // ---- enforced reading pauses ----
  //
  // Checkpoints sit at the END of the segment they guard, so the beat has a
  // whole segment of scroll to begin before the reader can be held at it.
  const [checkpoints, setCheckpoints] = useState<readonly Checkpoint[]>([]);
  const [settled, setSettled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const place = () => {
      const track = trackRef.current;
      if (!track) return;
      const travel = track.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      // getBoundingClientRect + scrollY, NOT offsetTop: the track's offset
      // parent is the positioned root wrapper, so offsetTop is 0 here and
      // every checkpoint would land at the top of the page.
      const top = track.getBoundingClientRect().top + window.scrollY;
      setCheckpoints(
        STORY_CHECKPOINTS.map((cp) => ({
          id: cp.id,
          y: Math.round(top + SEGMENT_ENDS[cp.afterSegment] * travel),
          dwellMs: cp.dwellMs,
        })),
      );
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  // A checkpoint with no `waitsFor` has nothing to wait on: the dwell alone
  // is the pause, so it counts as ready the moment it fires.
  const ready = useMemo(() => {
    const out: Record<string, boolean> = {};
    for (const cp of STORY_CHECKPOINTS) {
      out[cp.id] = cp.waitsFor ? settled[cp.waitsFor] === true : true;
    }
    return out;
  }, [settled]);

  const { lockedId, showContinueHint } = useScrollCheckpoints({
    checkpoints,
    ready,
    disabled: DISABLE_CHECKPOINTS,
  });

  const onBeatSettled = useCallback((id: "line1" | "focus") => {
    setSettled((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);
  const finished = useRef(false);

  // Not `>= 1`: the last pixel of scroll is not always reachable (fractional
  // device pixels, scrollbar rounding), so a strict test can strand the
  // reader on a screen that never hands off.
  useEffect(() => {
    if (finished.current || segments.closing < 0.995) return;
    finished.current = true;
    // The idle screen is one viewport tall; leaving the page scrolled to
    // the bottom of the track would drop it in mid-air.
    window.scrollTo(0, 0);
    onComplete();
  }, [segments.closing, onComplete]);

  // The story owns the scroll position while it plays; entering it
  // part-scrolled (refresh, back-nav) would drop you mid-act.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Act 2 takes over as soon as its reveal segment opens -- it starts on
  // black and lifts it, so the handover from Act 1 has no seam.
  const inAct2 = segments.reveal > 0;
  const act1Phases = Object.fromEntries(
    ACT1_PHASES.map((p) => [p, segments[p]]),
  ) as Record<Act1Phase, number>;

  return (
    <div className="relative w-full shrink-0 bg-black">
      {/* First in DOM so it is first in tab order -- the story is long and
          every phase past this point is decorative. */}
      <button
        type="button"
        onClick={onComplete}
        className="fixed top-5 right-5 z-[100] px-4 py-2 rounded-full bg-slate-900/70 text-white text-xs font-offbit tracking-wide border border-white/25 backdrop-blur-sm hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors cursor-pointer"
      >
        {ACT1.skipLabel}
      </button>

      {/* Shown when a checkpoint releases, so the reader knows they can go on. */}
      <div
        className={`story-continue-hint ${showContinueHint ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        <span>{ACT1.scrollHint}</span>
        <span className="story-scroll-caret is-bobbing" />
      </div>

      <div
        ref={trackRef}
        style={{ height: `${TRACK_VH}vh` }}
        className={`relative ${lockedId ? "story-locked" : ""}`}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
          {!inAct2 && (
            <Act1
              phases={act1Phases}
              reducedMotion={reducedMotion}
              onBeatSettled={onBeatSettled}
            />
          )}
          {inAct2 && <Act2 phases={segments} reducedMotion={reducedMotion} />}
        </div>
      </div>
    </div>
  );
}
