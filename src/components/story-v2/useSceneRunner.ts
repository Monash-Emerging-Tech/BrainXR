import { useCallback, useEffect, useRef, useState } from "react";
import { DEBUG_SCENES, SCENES, STORY_V2 } from "./storyContentV2";

/**
 * The v2 scene machine.
 *
 * The page does not scroll. One scroll gesture plays the next scene in full,
 * on its own clock, and input is ignored until it finishes.
 *
 *   idle      waiting for a gesture
 *   playing   a scene is running; input is swallowed, except that a
 *             fast-forwardable scene jumps to its rest state instead
 *   cooldown  the scene has finished but the wheel is still spinning down;
 *             input stays ignored until it has been quiet for quietMs
 *
 * That cooldown is the whole reason one trackpad flick cannot skip two
 * scenes: a flick keeps firing wheel events for a few hundred ms after the
 * fingers lift, and each one restarts the quiet timer.
 */

export type ScenePhase = "idle" | "playing" | "cooldown";

export interface SceneState {
  index: number;
  phase: ScenePhase;
  /** performance.now() when the current scene started playing. */
  startedAt: number;
  /** True when the reader skipped ahead: render the rest state at once. */
  fastForwarded: boolean;
  /** Bumped on a backwards step, so scenes can re-key their content. */
  backEpoch: number;
}

const CFG = STORY_V2.input;

export function useSceneRunner(onComplete: () => void, reducedMotion: boolean) {
  const [state, setState] = useState<SceneState>({
    index: 0,
    phase: "idle",
    startedAt: 0,
    fastForwarded: false,
    backEpoch: 0,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quietTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const clearTimers = () => {
    if (endTimer.current) clearTimeout(endTimer.current);
    if (quietTimer.current) clearTimeout(quietTimer.current);
    endTimer.current = null;
    quietTimer.current = null;
  };

  /** Enter cooldown, then idle once the input device has settled. */
  const beginCooldown = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "cooldown" }));
    if (quietTimer.current) clearTimeout(quietTimer.current);
    quietTimer.current = setTimeout(() => {
      setState((prev) => (prev.phase === "cooldown" ? { ...prev, phase: "idle" } : prev));
    }, CFG.quietMs);
  }, []);

  const playScene = useCallback(
    (index: number) => {
      clearTimers();
      const scene = SCENES[index];
      const duration = reducedMotion
        ? Math.min(scene.durationMs, 700)
        : scene.durationMs;

      if (DEBUG_SCENES) console.log("[v2] play", index, scene.id, duration);

      setState({
        index,
        phase: duration > 0 ? "playing" : "idle",
        startedAt: performance.now(),
        fastForwarded: false,
        backEpoch: stateRef.current.backEpoch,
      });

      if (duration > 0) {
        endTimer.current = setTimeout(beginCooldown, duration);
      }
    },
    [beginCooldown, reducedMotion],
  );

  const advance = useCallback(() => {
    const { index, phase } = stateRef.current;

    if (phase === "playing") {
      // Long scenes can be skipped to their rest state; everything else
      // swallows the gesture.
      const scene = SCENES[index];
      if (!scene.fastForwardable || stateRef.current.fastForwarded) return;
      // ...but never before the scene has actually had a chance to play.
      // Without this, a gesture that only just started the scene could
      // also end it.
      const played = performance.now() - stateRef.current.startedAt;
      if (played < CFG.fastForwardAfterMs) {
        if (DEBUG_SCENES) console.log("[v2] fast-forward too early", Math.round(played));
        return;
      }
      if (DEBUG_SCENES) console.log("[v2] fast-forward", index);
      clearTimers();
      setState((prev) => ({ ...prev, fastForwarded: true }));
      beginCooldown();
      return;
    }
    if (phase === "cooldown") return;

    if (index >= SCENES.length - 1) {
      if (DEBUG_SCENES) console.log("[v2] complete");
      completeRef.current();
      return;
    }
    playScene(index + 1);
  }, [beginCooldown, playScene]);

  const back = useCallback(() => {
    const { index, phase } = stateRef.current;
    if (phase !== "idle" || index === 0) return;
    if (DEBUG_SCENES) console.log("[v2] back", index - 1);
    clearTimers();
    // Land on the previous scene's REST state, not a replay.
    setState((prev) => ({
      index: index - 1,
      phase: "idle",
      startedAt: performance.now(),
      fastForwarded: true,
      backEpoch: prev.backEpoch + 1,
    }));
  }, []);

  // ---- input ----
  //
  // ONE GESTURE, ONE ACTION. A trackpad flick or a single notch of a mouse
  // wheel does not produce one wheel event, it produces a burst of them
  // over several hundred milliseconds. Anything arriving within
  // `gestureGapMs` of the previous event is the tail of the gesture that
  // has already been acted on, and is swallowed -- it still pushes the
  // quiet timer out, so the burst keeps the machine locked until it has
  // genuinely stopped.
  const lastInputAt = useRef(-Infinity);

  /** True if this event begins a NEW gesture rather than continuing one. */
  const isNewGesture = useCallback(() => {
    const now = performance.now();
    const fresh = now - lastInputAt.current >= CFG.gestureGapMs;
    lastInputAt.current = now;
    return fresh;
  }, []);

  useEffect(() => {
    const isInteractive = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      !!target.closest("button, a, input, select, textarea, [role='button']");

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < CFG.wheelThreshold) return;
      // Mid-flick. Push the quiet timer out so the inertia cannot spill
      // into the next scene, but do not act on it.
      if (!isNewGesture()) {
        if (stateRef.current.phase === "cooldown") beginCooldown();
        return;
      }
      if (stateRef.current.phase === "cooldown") {
        beginCooldown();
        return;
      }
      if (DEBUG_SCENES) console.log("[v2] wheel gesture", e.deltaY);
      if (e.deltaY > 0) advance();
      else back();
    };

    let touchStartY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isInteractive(e.target)) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartY;
      const dy = endY - touchStartY;
      touchStartY = null;
      if (Math.abs(dy) < CFG.swipeThreshold) return;
      if (!isNewGesture()) return;
      // Swiping UP moves the story forward.
      if (dy < 0) advance();
      else back();
    };

    const onKey = (e: KeyboardEvent) => {
      if (isInteractive(e.target)) return;
      if ([" ", "Spacebar", "ArrowDown", "PageDown", "Enter"].includes(e.key)) {
        e.preventDefault();
        // Key repeat is a held key, not a second gesture.
        if (e.repeat || !isNewGesture()) return;
        advance();
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        if (e.repeat || !isNewGesture()) return;
        back();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [advance, back, beginCooldown, isNewGesture]);

  useEffect(() => clearTimers, []);

  return { ...state, advance, back };
}

export default useSceneRunner;
