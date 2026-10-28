import { useEffect, useState } from "react";
import { STORY_V2 } from "./storyContentV2";

/**
 * ONE place decides where the brain and the text column go.
 *
 * They are a single layout problem, not two: the text column's width is
 * whatever is left once the brain has taken its share, and the brain's
 * centre is wherever it has to be for the text to clear it. Solving them
 * separately is how the text ended up printed over the brain.
 *
 * Everything here is CSS pixels. The 3D stage converts to world units
 * itself, from its own camera -- see BrainStageV2.
 *
 * SIZING THE BRAIN. `viewportHeightFraction` is what you SEE: the brain's
 * own height, two thirds of the viewport by default. That is measured
 * against the model's Y extent, which the beats' Y rotation cannot change,
 * so the brain reads at the same size at every angle.
 *
 * Its SPAN is then the safety bound: the widest its silhouette ever gets as
 * it turns, so it is what must clear the text and stay on screen at every
 * angle. If the span will not fit the space left over, the brain -- never
 * the text -- shrinks until it does.
 *
 * Until the model has loaded, a measured default stands in; the real
 * numbers arrive from BrainStageV2 and the solve re-runs.
 *
 * LANDSCAPE. The brain is `viewportHeightFraction` of the viewport height
 * and centred. The text sits in a left column, vertically centred, at most
 * `maxCh` characters wide. If that column plus its clear gap would reach
 * into the brain's bounding circle, the BRAIN MOVES RIGHT -- the text does
 * not shrink. Only once the brain has run out of room on the right (the
 * progress dots live there) does the text give any width back, and never
 * below `minCh`.
 *
 * PORTRAIT. There is no room for a column beside anything, so the stage
 * stacks: text along the top, brain below at `portraitWidthFraction` of the
 * viewport WIDTH.
 */

const B = STORY_V2.brain;
const T = STORY_V2.text;

/**
 * Widest span over height, and over head-on width. Stand-ins until the real
 * model is measured -- close enough that nothing jumps when the true values
 * arrive.
 */
const DEFAULT_SPAN_PER_HEIGHT = 1.14;
const DEFAULT_SPAN_PER_WIDTH = 1.2;

export interface BrainFit {
  span: number;
  height: number;
  width: number;
}

export interface StageLayout {
  portrait: boolean;
  vw: number;
  vh: number;
  /** Diameter of the brain's bounding SPHERE on screen, in CSS px. */
  brainPx: number;
  /** Where that sphere's centre sits, in CSS px. */
  brainCx: number;
  brainCy: number;
  /** The text column, in CSS px. */
  textLeft: number;
  textTop: number;
  textWidth: number;
  /** Type sizes, which differ between the two layouts. */
  namePx: number;
  bodyPx: number;
  closingPx: number;
}

/** Width of one "0" in the body face: the `ch` unit, measured for real. */
function measureCh(font: string, size: number): number {
  if (typeof document === "undefined") return size * 0.5;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return size * 0.5;
  ctx.font = `400 ${size}px ${font}`;
  const w = ctx.measureText("0").width;
  return w > 0 ? w : size * 0.5;
}

export function computeStageLayout(
  vw: number,
  vh: number,
  bodyFont: string,
  fit?: BrainFit | null,
): StageLayout {
  const portrait = vw < B.portraitBreakpointPx || vh > vw;
  // How much wider the brain can get than the thing you are measuring.
  const perHeight =
    fit && fit.height > 0 ? fit.span / fit.height : DEFAULT_SPAN_PER_HEIGHT;
  const perWidth =
    fit && fit.width > 0 ? fit.span / fit.width : DEFAULT_SPAN_PER_WIDTH;

  if (portrait) {
    const gutter = Math.max(T.minGutterPx, vw * T.gutterFraction);
    // Portrait asks for a head-on WIDTH; the span that produces it is
    // wider, and is capped so the brain cannot run off the sides.
    const brainPx = Math.min(
      B.portraitWidthFraction * vw * perWidth,
      vw * 0.96,
    );
    return {
      portrait: true,
      vw,
      vh,
      brainPx,
      brainCx: vw / 2,
      brainCy: vh * B.portraitCenterY,
      textLeft: gutter,
      // Stacked: the text owns the top of the screen, the brain the bottom.
      textTop: vh * 0.1,
      textWidth: vw - gutter * 2,
      namePx: T.namePxPortrait,
      bodyPx: T.bodyPxPortrait,
      closingPx: T.closingPxPortrait,
    };
  }

  const gutter = Math.max(T.minGutterPx, vw * T.gutterFraction);
  const ch = measureCh(bodyFont, T.bodyPx);

  // What you see is two thirds of the viewport height...
  const wantedHeight = B.viewportHeightFraction * vh;
  // ...and this is the widest it gets as it turns.
  let brainPx = wantedHeight * perHeight;

  let textWidth = Math.min(T.maxCh * ch, vw * 0.42);
  const needRight = () => gutter + textWidth + B.textGapPx;
  const rightEdge = vw * (1 - B.rightMarginFraction);

  // Everything left once the column and its clear gap have been taken.
  const room = rightEdge - needRight();
  if (brainPx > room) {
    // No amount of shifting makes it fit: the BRAIN gives, never the text.
    brainPx = Math.max(room, vh * 0.3);
  }

  let cx = vw / 2;
  const maxCx = rightEdge - brainPx / 2;
  if (needRight() > cx - brainPx / 2) {
    // Move the brain, not the text.
    cx = Math.min(maxCx, needRight() + brainPx / 2);
    // Still touching? Then, and only then, the text gives width back.
    const spare = cx - brainPx / 2 - gutter - B.textGapPx;
    textWidth = Math.max(Math.min(textWidth, spare), T.minCh * ch);
  }

  return {
    portrait: false,
    vw,
    vh,
    brainPx,
    brainCx: cx,
    brainCy: vh / 2,
    textLeft: gutter,
    textTop: vh / 2,
    textWidth,
    namePx: T.namePx,
    bodyPx: T.bodyPx,
    closingPx: T.closingPx,
  };
}

/** Recomputed on every resize, so the fit holds on any screen. */
export default function useStageLayout(
  bodyFont: string,
  fit?: BrainFit | null,
): StageLayout {
  const [layout, setLayout] = useState<StageLayout>(() =>
    computeStageLayout(
      typeof window === "undefined" ? 1280 : window.innerWidth,
      typeof window === "undefined" ? 800 : window.innerHeight,
      bodyFont,
      fit,
    ),
  );

  useEffect(() => {
    const recompute = () =>
      setLayout(
        computeStageLayout(window.innerWidth, window.innerHeight, bodyFont, fit),
      );
    recompute();
    window.addEventListener("resize", recompute);
    window.addEventListener("orientationchange", recompute);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("orientationchange", recompute);
    };
  }, [bodyFont, fit]);

  return layout;
}
