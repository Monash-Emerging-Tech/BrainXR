import { useEffect, useRef, useState } from "react";
import { STORY_V2 } from "./storyContentV2";

/**
 * A small "scroll" pill that trails the cursor while the story is waiting
 * for a gesture, and fades out the moment a scene starts.
 *
 * It is lerped rather than pinned to the pointer, so it reads as a label
 * following you rather than part of the cursor. It hides itself over the
 * Skip button so it can never sit on top of the one control that matters.
 *
 * Touch devices have no pointer, so they get a static "swipe up" hint at
 * the bottom instead.
 */

const CFG = STORY_V2.cursorTag;

export interface ScrollCursorTagProps {
  /** Show while the runner is idle; hide while a scene plays. */
  visible: boolean;
  /** Rect to hide over, typically the Skip button. */
  avoidRef?: React.RefObject<HTMLElement | null>;
}

export default function ScrollCursorTag({ visible, avoidRef }: ScrollCursorTagProps) {
  const tagRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [overAvoid, setOverAvoid] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let seen = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) {
        // Jump on the first sighting, so it does not fly in from the middle.
        pos.x = target.x;
        pos.y = target.y;
        seen = true;
      }
      const avoid = avoidRef?.current;
      if (avoid) {
        const r = avoid.getBoundingClientRect();
        setOverAvoid(
          e.clientX >= r.left - 12 &&
            e.clientX <= r.right + 12 &&
            e.clientY >= r.top - 12 &&
            e.clientY <= r.bottom + 12,
        );
      }
    };

    const tick = () => {
      pos.x += (target.x - pos.x) * CFG.follow;
      pos.y += (target.y - pos.y) * CFG.follow;
      const el = tagRef.current;
      if (el) {
        el.style.transform = `translate3d(${Math.round(pos.x + CFG.offsetX)}px, ${Math.round(
          pos.y + CFG.offsetY,
        )}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [isTouch, avoidRef]);

  if (isTouch) {
    return (
      <div
        className={`storyv2-swipe-hint ${visible ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        <span className="storyv2-swipe-caret" />
        <span>{CFG.touchLabel}</span>
      </div>
    );
  }

  return (
    <div
      ref={tagRef}
      className={`storyv2-cursor-tag ${visible && !overAvoid ? "is-visible" : ""}`}
      aria-hidden="true"
    >
      {CFG.label}
    </div>
  );
}
