import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Enforced reading pauses on a scroll-driven page.
 *
 * When the reader crosses a checkpoint going FORWARD for the first time, the
 * page snaps back to exactly that position and scrolling is locked until the
 * beat it guards has finished playing, plus a dwell. Scrolling backwards, and
 * every later pass, are never locked -- a checkpoint is a first-read pause,
 * not a gate.
 *
 * Locking is done by blocking the input events rather than by setting
 * `overflow: hidden`, which would collapse the scrollbar and jump the layout.
 * A scroll clamp backs that up for scrollbar dragging, which produces no
 * cancellable event.
 */

export interface Checkpoint {
  id: string;
  /** Document scroll position, in px. Recomputed on resize. */
  y: number;
  /** How long to hold after the guarded beat reports ready. */
  dwellMs: number;
}

interface Options {
  /** Checkpoints in ascending `y` order. */
  checkpoints: readonly Checkpoint[];
  /** id -> has that beat finished playing. A missing id counts as ready. */
  ready: Record<string, boolean>;
  /** Dev escape hatch: never lock. */
  disabled?: boolean;
}

interface Result {
  /** The checkpoint currently holding the reader, if any. */
  lockedId: string | null;
  /** True just after a release, until the reader scrolls again. */
  showContinueHint: boolean;
}

/** Keys that scroll the page and therefore have to be swallowed while locked. */
const SCROLL_KEYS = new Set([
  " ",
  "Spacebar",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

/** Interactive things keep working while locked -- Skip especially. */
function isInteractive(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    !!target.closest("button, a, input, select, textarea, [role='button']")
  );
}

export function useScrollCheckpoints({ checkpoints, ready, disabled }: Options): Result {
  const [lockedId, setLockedId] = useState<string | null>(null);
  const [showContinueHint, setShowContinueHint] = useState(false);

  // Each checkpoint fires at most once, on its first forward crossing.
  const spentRef = useRef<Set<string>>(new Set());
  const lockYRef = useRef(0);
  const lockedIdRef = useRef<string | null>(null);
  const lastYRef = useRef(0);
  /** Set briefly after a release so inertia cannot immediately re-trigger. */
  const graceUntilRef = useRef(0);

  const releaseRef = useRef<() => void>(() => {});

  // ---- detect a forward crossing ----
  useEffect(() => {
    if (disabled) return;

    lastYRef.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const prev = lastYRef.current;
      lastYRef.current = y;

      if (lockedIdRef.current) return;
      if (performance.now() < graceUntilRef.current) return;
      // Backwards is always free.
      if (y <= prev) {
        if (y < prev) setShowContinueHint(false);
        return;
      }

      for (const cp of checkpoints) {
        if (spentRef.current.has(cp.id)) continue;
        if (prev < cp.y && y >= cp.y) {
          spentRef.current.add(cp.id);
          lockedIdRef.current = cp.id;
          lockYRef.current = cp.y;
          setLockedId(cp.id);
          setShowContinueHint(false);
          // Snap back to exactly the checkpoint.
          window.scrollTo(0, cp.y);
          lastYRef.current = cp.y;
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [checkpoints, disabled]);

  // ---- hold the page still while locked ----
  useEffect(() => {
    if (!lockedId || disabled) return;

    const block = (e: Event) => {
      if (isInteractive(e.target)) return;
      e.preventDefault();
    };

    const blockKeys = (e: KeyboardEvent) => {
      if (isInteractive(e.target)) return;
      if (SCROLL_KEYS.has(e.key)) e.preventDefault();
    };

    // Backstop for scrollbar dragging, which fires no cancellable event.
    const clamp = () => {
      if (window.scrollY !== lockYRef.current) window.scrollTo(0, lockYRef.current);
      lastYRef.current = lockYRef.current;
    };

    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys, { passive: false });
    window.addEventListener("scroll", clamp);

    return () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
      window.removeEventListener("scroll", clamp);
    };
  }, [lockedId, disabled]);

  const release = useCallback(() => {
    // Land exactly on the checkpoint, then ignore whatever inertia arrived
    // during the hold so unlocking cannot fling the reader forward.
    window.scrollTo(0, lockYRef.current);
    lastYRef.current = lockYRef.current;
    graceUntilRef.current = performance.now() + 220;
    lockedIdRef.current = null;
    setLockedId(null);
    setShowContinueHint(true);
  }, []);
  releaseRef.current = release;

  // ---- wait for the beat, then dwell ----
  const isReady = lockedId ? ready[lockedId] !== false : false;

  useEffect(() => {
    if (!lockedId || !isReady) return;
    const cp = checkpoints.find((c) => c.id === lockedId);
    const dwell = cp ? cp.dwellMs : 0;
    const t = setTimeout(() => releaseRef.current(), dwell);
    return () => clearTimeout(t);
  }, [lockedId, isReady, checkpoints]);

  return { lockedId, showContinueHint };
}

export default useScrollCheckpoints;
