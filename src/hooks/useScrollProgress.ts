import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Scroll-driven progress for a tall track + sticky stage.
 *
 * The pattern: render a track element taller than the viewport, with a
 * `position: sticky; top: 0; height: 100vh` stage inside it. As the page
 * scrolls, the stage stays pinned while the track slides past, so the
 * track's scrolled distance is a clean 0..1 timeline for whatever the
 * stage draws.
 *
 * The timeline is then cut into named segments by weight, and each segment
 * reports its own 0..1 -- so an act can say "my mist is at 0.4" without
 * knowing where it sits in the overall story.
 *
 * No libraries: one passive scroll listener, throttled to one read per
 * animation frame (scroll fires far more often than the browser paints,
 * and reading getBoundingClientRect forces layout).
 */

export interface ScrollSegmentDef<Id extends string> {
  id: Id;
  /** Relative share of the track this segment occupies. */
  weight: number;
}

export interface ScrollProgressState<Id extends string> {
  /** 0..1 across the whole track. */
  progress: number;
  /** 0..1 within each named segment, clamped at both ends. */
  segments: Record<Id, number>;
  /** The segment the playhead currently sits in. */
  active: Id;
}

/** Total weight of a segment list -- multiply by a vh figure to size the track. */
export function totalWeight<Id extends string>(
  segments: readonly ScrollSegmentDef<Id>[],
): number {
  return segments.reduce((sum, s) => sum + s.weight, 0);
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function useScrollProgress<Id extends string>(
  trackRef: React.RefObject<HTMLElement | null>,
  segments: readonly ScrollSegmentDef<Id>[],
): ScrollProgressState<Id> {
  // Absolute [start, end) bounds for each segment on the 0..1 timeline.
  const ranges = useMemo(() => {
    const total = totalWeight(segments) || 1;
    let cursor = 0;
    return segments.map((s) => {
      const start = cursor;
      cursor += s.weight / total;
      return { id: s.id, start, end: cursor };
    });
  }, [segments]);

  const [state, setState] = useState<ScrollProgressState<Id>>(() => ({
    progress: 0,
    segments: Object.fromEntries(segments.map((s) => [s.id, 0])) as Record<Id, number>,
    active: segments[0]?.id as Id,
  }));

  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const measure = () => {
      frameRef.current = null;
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      // Track shorter than the viewport: nothing to scrub, hold at the start.
      const progress = travel > 0 ? clamp01(-rect.top / travel) : 0;

      const next = {} as Record<Id, number>;
      let active = ranges[0].id;
      for (const range of ranges) {
        const span = range.end - range.start;
        next[range.id] = span > 0 ? clamp01((progress - range.start) / span) : 0;
        if (progress >= range.start) active = range.id;
      }

      setState((prev) =>
        prev.progress === progress && prev.active === active
          ? prev
          : { progress, segments: next, active },
      );
    };

    const schedule = () => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [trackRef, ranges]);

  return state;
}

export default useScrollProgress;
