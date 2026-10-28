import { useEffect, useMemo, useRef, useState } from "react";
import { IdleHeadline } from "../IdleSplash";
import SwellFilter, { prefersLayeredSwell } from "../story/SwellFilter";
import { ACT2 } from "../story/storyContent";
import CellPixelText from "./CellPixelText";
import DoubleVisionText from "./DoubleVisionText";
import SmokeShader from "./SmokeShader";
import { Q_MARKS, STORY_V2, V2_COPY } from "./storyContentV2";
import { resetV2Debug, v2Debug } from "./v2Debug";

/**
 * Scenes 0 and 1 in one component, so the wordmark is never remounted
 * between them and the swallow has no seam.
 *
 *   scene 0  rest: the BRAINXR wordmark, centred, on white
 *   scene 1  (a) the wordmark is SWALLOWED -- scaled into the exact centre
 *                of the screen, accelerating, blurring and fading at the end
 *            (b) plain white for a beat
 *            (c) black smoke erupts from that same centre point and pours
 *                outward, then clears
 *            (d) the line forms out of where the smoke was
 *            (e) hold, then FOCUS?? arrives
 *
 * One rAF drives the whole timeline and writes to REFS. React state only
 * flips on coarse milestones, so the 14s scene costs a handful of renders.
 */

const Q = STORY_V2.question;
const DV = STORY_V2.doubleVision;
const C = STORY_V2.cells;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeInCubic = (t: number) => t * t * t;

export interface SceneOpeningProps {
  /** 0 = landing rest state, 1 = the sequence. */
  sceneIndex: number;
  playing: boolean;
  startedAt: number;
  fastForwarded: boolean;
  reducedMotion: boolean;
}

export default function SceneOpening({
  sceneIndex,
  playing,
  startedAt,
  fastForwarded,
  reducedMotion,
}: SceneOpeningProps) {
  const layered = useMemo(() => prefersLayeredSwell(), []);

  // Live values, read by the children's own animation loops.
  const reachRef = useRef(0);
  const densityRef = useRef(0);
  const lineRef = useRef(0);
  const swellRef = useRef(0);
  const focusRef = useRef(0);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  const [showLine, setShowLine] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);

  // Re-measure type on resize, so the centring survives a window change.
  const [vw, setVw] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const setWordmark = (scale: number, opacity: number, blur: number) => {
    const el = wordmarkRef.current;
    if (!el) return;
    el.style.transform = `scale(${scale})`;
    el.style.opacity = String(opacity);
    el.style.filter = blur > 0.05 ? `blur(${blur}px)` : "";
  };

  useEffect(() => {
    if (sceneIndex === 0) {
      reachRef.current = 0;
      densityRef.current = 0;
      lineRef.current = 0;
      swellRef.current = 0;
      focusRef.current = 0;
      setShowLine(false);
      setShowFocus(false);
      setShowSmoke(false);
      setWordmark(1, 1, 0);
      resetV2Debug();
      v2Debug.stage = "landing (rest)";
      return;
    }

    // Rest state of scene 1: wordmark gone, smoke gone, text settled.
    const atRest = () => {
      reachRef.current = 1;
      densityRef.current = 0;
      lineRef.current = 1;
      swellRef.current = 1;
      focusRef.current = 1;
      setShowLine(true);
      setShowFocus(true);
      setShowSmoke(false);
      setWordmark(Q.swallowScale, 0, 0);
      v2Debug.stage = "question (rest)";
      v2Debug.line = 1;
      v2Debug.swell = 1;
      v2Debug.focus = 1;
      v2Debug.reach = 1;
      v2Debug.density = 0;
    };

    if (fastForwarded || reducedMotion || !playing) {
      atRest();
      return;
    }

    setShowSmoke(true);
    let raf = 0;
    const tick = (now: number) => {
      const ms = now - startedAt;

      // (a) SWALLOW -- ease-IN, so it accelerates into the centre.
      const sw = clamp01(ms / Q.swallowMs);
      const swEased = easeInCubic(sw);
      const scale = 1 + (Q.swallowScale - 1) * swEased;
      const tail = clamp01((sw - Q.swallowFadeFrom) / (1 - Q.swallowFadeFrom));
      setWordmark(scale, 1 - tail, tail * 10);

      // (c) SMOKE -- reach grows through the pour; density is a 0->1->0
      // envelope across pour then clear.
      const sinceSmoke = ms - Q_MARKS.smokeStart;
      if (sinceSmoke <= 0) {
        reachRef.current = 0;
        densityRef.current = 0;
      } else if (sinceSmoke < Q.smokePourMs) {
        const t = sinceSmoke / Q.smokePourMs;
        reachRef.current = t;
        densityRef.current = clamp01(t * 3.2);
      } else {
        const t = clamp01((sinceSmoke - Q.smokePourMs) / Q.smokeClearMs);
        reachRef.current = 1 + t * 0.55;
        densityRef.current = 1 - t;
      }

      // (d/e) the line, its swell overlay, and FOCUS??
      lineRef.current = clamp01((ms - Q_MARKS.lineStart) / Q.lineFormMs);
      swellRef.current = clamp01((ms - Q_MARKS.lineStart) / Q.lineSwellMs);
      focusRef.current = clamp01((ms - Q_MARKS.focusStart) / Q.focusEnterMs);

      if (ms >= Q_MARKS.lineStart) setShowLine(true);
      if (ms >= Q_MARKS.focusStart) setShowFocus(true);
      if (ms >= Q_MARKS.smokeEnd + 400) setShowSmoke(false);

      // Telemetry for the dev HUD. One object, no allocation: free when
      // the HUD is off, and the only way to see WHICH stage is running.
      v2Debug.sceneMs = ms;
      v2Debug.reach = reachRef.current;
      v2Debug.density = densityRef.current;
      v2Debug.line = lineRef.current;
      v2Debug.swell = swellRef.current;
      v2Debug.focus = focusRef.current;
      v2Debug.stage =
        ms < Q.swallowMs
          ? "a swallow"
          : ms < Q_MARKS.smokeStart
            ? "b white pause"
            : ms < Q_MARKS.smokeStart + Q.smokePourMs
              ? "c smoke pour"
              : ms < Q_MARKS.lineStart
                ? "c smoke clear"
                : ms < Q_MARKS.lineEnd
                  ? "d line forming"
                  : ms < Q_MARKS.focusStart
                    ? "e hold"
                    : ms < Q_MARKS.total
                      ? "f FOCUS?? enter"
                      : "question (rest)";

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex, playing, startedAt, fastForwarded, reducedMotion]);

  const lineFontSize = useMemo(
    () => Math.round(Math.min(Math.max(vw * C.lineVwFraction, C.lineMinPx), C.lineMaxPx)),
    [vw],
  );
  const focusFontSize = Math.round(lineFontSize * DV.scaleVsLine);

  return (
    <div className="storyv2-scene storyv2-opening">
      <svg className="story-filter-defs" aria-hidden="true">
        <defs>
          <SwellFilter id="storyV2SwellLine" layered={layered} />
        </defs>
      </svg>

      {/* The wordmark, from the idle screen so the type is identical, but
          laid out by v2 -- IdleSplash pins it near the top of the page and
          this scene needs it dead centre. Overrides are CSS-only. */}
      <div ref={wordmarkRef} className="storyv2-wordmark">
        <IdleHeadline variant="solid" />
      </div>

      {showSmoke && !reducedMotion && (
        <SmokeShader
          className="storyv2-smoke"
          reachRef={reachRef}
          densityRef={densityRef}
        />
      )}

      <div className="storyv2-question">
        {showLine && (
          <CellPixelText
            text={V2_COPY.question}
            font={ACT2.labelFont}
            fontSize={lineFontSize}
            fontWeight={400}
            color="#070707"
            progressRef={lineRef}
            swellRef={swellRef}
            swellId="storyV2SwellLine"
            swapFrom={1 - Q.textSwapMs / Q.lineFormMs}
            reducedMotion={reducedMotion}
            className="storyv2-line"
          />
        )}

        {/* Mounted with line 1, not at its entrance: the column has to
            reserve FOCUS??'s slot from the start or line 1 visibly jumps
            up the screen the moment the word appears. It stays invisible
            until `focusRef` starts moving. */}
        {(showLine || showFocus) && (
          <DoubleVisionText
            text={V2_COPY.emphasis}
            font={ACT2.labelFont}
            fontSize={focusFontSize}
            fontWeight={400}
            color="#070707"
            enterRef={focusRef}
            reducedMotion={reducedMotion}
            className="storyv2-focus"
          />
        )}
      </div>
    </div>
  );
}
