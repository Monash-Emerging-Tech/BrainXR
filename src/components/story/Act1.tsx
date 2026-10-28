import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ACT1, ACT2, STORY_PACING } from "./storyContent";
import { useGLTF } from "@react-three/drei";
import SwellFilter, {
  applySwell,
  prefersLayeredSwell,
  swellParams,
} from "./SwellFilter";
import {
  findCounter,
  measureText,
  samplePixelGrid,
  type CounterBox,
  type PixelGrid,
} from "./pixelGrid";

/**
 * ACT 1 -- "someone putting their glasses back on", told in staged beats.
 *
 * The hook scene is ONE full-viewport SVG: the glossy black highlight
 * rectangle plus a <rect> per settled pixel. Zooming animates that SVG's
 * viewBox rather than CSS-scaling a raster layer, so the pixel squares stay
 * genuinely sharp-edged all the way into the dive, at any device pixel ratio.
 *
 * The canvas is used ONLY while pixels are in flight (the swarm and the
 * converge). Both renderers read the same sampled grid at the same step, so
 * the handover between them is invisible.
 *
 * Text never reverts to DOM glyphs -- it keeps its pixel-square look for the
 * whole act. The real strings stay in the DOM, visually hidden, for screen
 * readers.
 */

export type Act1Phase =
  | "hold1"
  | "mistGather"
  | "mistPart"
  | "line1Form"
  | "hold2"
  | "blockIn"
  | "focusForm"
  | "hold3"
  | "zoom";

interface Act1Props {
  phases: Record<Act1Phase, number>;
  reducedMotion: boolean;
  /** Fired when a formation beat has fully settled, to release a checkpoint. */
  onBeatSettled?: (id: "line1" | "focus") => void;
}

// The brain model is a few MB and Act 2 needs it the moment the smoke
// clears, so start fetching and decoding it while Act 1 is still playing.
useGLTF.preload(STORY_PACING.brain.modelUrl);

const ZCFG = STORY_PACING.zoom;
const FORM = STORY_PACING.form;
const MIST = STORY_PACING.mist;
const BLOCK = STORY_PACING.block;

/** Truly neutral black. Anything blue-tinted reads as navy against white. */
const INK = "#070707";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** CSS clamp(), in px. rem is assumed to be 16px, as it is here. */
const cssClamp = (minRem: number, vwFactor: number, maxRem: number, vw: number) =>
  Math.min(Math.max(minRem * 16, (vw * vwFactor) / 100), maxRem * 16);

/** `unform` runs the reveal backwards when the reader scrolls back. */
type Phase = "idle" | "play" | "form" | "settled" | "unform";

const SWELL_IDS = { line1: "storySwellLead", focus: "storySwellFocus" } as const;

/**
 * Progress for the swell filter, 0 = haze, 1 = crisp, per phase.
 * It reaches 1 exactly as the pixels land, which is also the moment the
 * SVG takes over from the canvas.
 */
function swellProgress(phase: Phase, elapsed: number): number {
  if (phase === "play") return 0;
  if (phase === "form") return clamp01((elapsed - FORM.playMs) / FORM.formMs);
  if (phase === "unform") return 1 - clamp01(elapsed / FORM.unformMs);
  return phase === "settled" ? 1 : 0;
}

interface Placed {
  grid: PixelGrid;
  x: number;
  y: number;
}

interface Scene {
  vw: number;
  vh: number;
  /** Swell radii are fractions of these, so the effect scales with type. */
  leadFontSize: number;
  emphFontSize: number;
  lead: Placed;
  focus: Placed;
  rect: { x: number; y: number; w: number; h: number };
  /** Counter of the "U", in viewport coordinates. */
  counter: CounterBox;
}

/** Builds the whole hook scene in viewport coordinates. */
function buildScene(vw: number, vh: number): Scene | null {
  const leadSize = Math.round(cssClamp(1.35, 4.2, 2.4, vw));
  const emphSize = Math.round(cssClamp(2.6, 12, 6, vw));

  const leadWidth = Math.min(vw - 48, 46 * 16);
  const leadGrid = samplePixelGrid({
    text: ACT1.lead,
    font: ACT2.bodyFont,
    fontSize: leadSize,
    maxWidth: leadWidth,
    align: "center",
    cellSize: 3,
    maxCells: 1600,
  });

  const emphWidth = measureText(ACT1.emphasis, ACT2.labelFont, emphSize, 700);
  if (emphWidth <= 0) return null;

  const focusGrid = samplePixelGrid({
    text: ACT1.emphasis,
    font: ACT2.labelFont,
    fontSize: emphSize,
    fontWeight: 700,
    maxWidth: Math.ceil(emphWidth) + 4,
    lineHeightPx: Math.round(emphSize * 1.02),
    align: "left",
    cellSize: 3,
    maxCells: 1800,
  });

  // The "U" band, so its counter can be located in the grid.
  const before = measureText(
    ACT1.emphasis.slice(0, ACT1.zoomCharIndex),
    ACT2.labelFont,
    emphSize,
    700,
  );
  const through = measureText(
    ACT1.emphasis.slice(0, ACT1.zoomCharIndex + 1),
    ACT2.labelFont,
    emphSize,
    700,
  );

  const padX = Math.round(emphSize * 0.22);
  const padY = Math.round(emphSize * 0.16);
  const rectW = focusGrid.width + padX * 2;
  const rectH = focusGrid.height + padY * 2;

  // Stack: line 1, a gap, then the block. Centred as a unit.
  const gap = Math.round(leadSize * 0.85);
  const totalH = leadGrid.height + gap + rectH;
  const top = Math.round(vh / 2 - totalH / 2);

  const leadX = Math.round(vw / 2 - leadGrid.width / 2);
  const leadY = top;
  const rectX = Math.round(vw / 2 - rectW / 2);
  const rectY = top + leadGrid.height + gap;
  const focusX = rectX + padX;
  const focusY = rectY + padY;

  const local = findCounter(focusGrid, before, through);
  const counter: CounterBox = local
    ? { x: focusX + local.x, y: focusY + local.y, w: local.w, h: local.h }
    : {
        // Fallback: the middle of the U band, if the glyph has no counter.
        x: focusX + before,
        y: focusY + focusGrid.height * 0.3,
        w: Math.max(4, through - before) * 0.5,
        h: Math.max(4, focusGrid.height * 0.4),
      };

  return {
    vw,
    vh,
    leadFontSize: leadSize,
    emphFontSize: emphSize,
    lead: { grid: leadGrid, x: leadX, y: leadY },
    focus: { grid: focusGrid, x: focusX, y: focusY },
    rect: { x: rectX, y: rectY, w: rectW, h: rectH },
    counter,
  };
}

/**
 * Time-based formation. Scroll only TRIGGERS it; once running it lives on its
 * own clock so pausing the scroll does not freeze the swarm. Scrolling back
 * past the trigger resets it.
 */
function useFormation(triggered: boolean, reducedMotion: boolean) {
  const [phase, setPhase] = useState<Phase>("idle");
  const startRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  useEffect(() => {
    if (!triggered) {
      // Scrolling back past the trigger plays the clip forwards -- sharp,
      // then swollen, then haze -- as the pixels come apart again.
      if (phaseRef.current === "idle" || reducedMotion) {
        setPhase("idle");
        return;
      }
      startRef.current = performance.now();
      setPhase("unform");
      const toIdle = setTimeout(() => setPhase("idle"), FORM.unformMs);
      return () => clearTimeout(toIdle);
    }
    if (reducedMotion) {
      setPhase("settled");
      return;
    }
    startRef.current = performance.now();
    setPhase("play");
    const toForm = setTimeout(() => setPhase("form"), FORM.playMs);
    const toSettled = setTimeout(() => setPhase("settled"), FORM.playMs + FORM.formMs);
    return () => {
      clearTimeout(toForm);
      clearTimeout(toSettled);
    };
    // phaseRef is read, not tracked: adding it would restart the timers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggered, reducedMotion]);

  return { phase, startRef };
}

export default function Act1({ phases, reducedMotion, onBeatSettled }: Act1Props) {
  const { hold1, mistGather, mistPart, line1Form, blockIn, focusForm, zoom } = phases;

  const [scene, setScene] = useState<Scene | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // ---- scene layout, rebuilt on resize and once the webfont lands ----
  useLayoutEffect(() => {
    let cancelled = false;
    const build = () => {
      if (cancelled) return;
      setScene(buildScene(window.innerWidth, window.innerHeight));
    };
    build();
    window.addEventListener("resize", build);
    document.fonts?.ready.then(build);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", build);
    };
  }, []);

  const lead = useFormation(line1Form > 0, reducedMotion);
  const focus = useFormation(focusForm > 0, reducedMotion);

  // Seeds live with the scene, NOT inside the draw effect: regenerating them
  // when a part moves from play to form would make the swarm jump.
  const seeds = useMemo(() => {
    if (!scene) return null;
    const make = (n: number) =>
      Array.from({ length: n }, () => ({
        p1: Math.random() * Math.PI * 2,
        p2: Math.random() * Math.PI * 2,
        w1: 0.6 + Math.random() * 0.9,
        w2: 0.9 + Math.random() * 1.4,
        ax: (0.4 + Math.random() * 0.8) * FORM.swarmRadius,
        ay: (0.3 + Math.random() * 0.7) * FORM.swarmRadius,
        stagger: Math.random(),
      }));
    return [make(scene.lead.grid.cells.length), make(scene.focus.grid.cells.length)];
  }, [scene]);

  const layeredSwell = useMemo(() => prefersLayeredSwell(), []);

  // ---- swarm + converge, on a canvas sized to just the text ----
  //
  // WHY CANVAS AND NOT SVG FOR THE FLIGHT: the grids run to ~1500 cells per
  // part. Updating that many <rect> attributes per frame is far too slow,
  // and it would also mean the filter had to re-run over a DOM subtree that
  // changes every frame. Instead the flight stays on canvas and the SAME SVG
  // filter is applied to the canvas ELEMENT via CSS `filter: url(#...)`, so
  // it costs one composited filter pass per frame instead of per particle,
  // and the look matches the SVG exactly across the handover.
  const isFlying = (ph: Phase) => ph === "play" || ph === "form" || ph === "unform";
  const inFlight = !reducedMotion && (isFlying(lead.phase) || isFlying(focus.phase));

  const leadStart = lead.startRef;
  const focusStart = focus.startRef;
  const leadPhase = lead.phase;
  const focusPhase = focus.phase;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!scene || !seeds || !inFlight || !canvas) {
      if (canvas) canvas.style.filter = "";
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Per-cell phases give the swarm its noise without a noise library.
    const parts = [
      {
        placed: scene.lead,
        phase: leadPhase,
        start: leadStart,
        color: INK,
        swellId: SWELL_IDS.line1,
        fontSize: scene.leadFontSize,
      },
      {
        placed: scene.focus,
        phase: focusPhase,
        start: focusStart,
        color: "#ffffff",
        swellId: SWELL_IDS.focus,
        fontSize: scene.emphFontSize,
      },
    ];
    const flying = parts.filter((part) => isFlying(part.phase));
    if (!flying.length) return;

    // Size the canvas to the text in flight plus room for the swarm's wander
    // and the swell's dilate, NOT to the whole viewport. The filter runs over
    // this surface every frame, and its cost scales with area.
    const pad = FORM.swarmRadius * 2 + scene.emphFontSize * 0.5 + 40;
    const x0 = Math.floor(Math.min(...flying.map((f) => f.placed.x)) - pad);
    const y0 = Math.floor(Math.min(...flying.map((f) => f.placed.y)) - pad);
    const x1 = Math.ceil(
      Math.max(...flying.map((f) => f.placed.x + f.placed.grid.width)) + pad,
    );
    const y1 = Math.ceil(
      Math.max(...flying.map((f) => f.placed.y + f.placed.grid.height)) + pad,
    );
    const boxW = Math.max(1, x1 - x0);
    const boxH = Math.max(1, y1 - y0);

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(boxW * dpr);
    canvas.height = Math.round(boxH * dpr);
    canvas.style.width = `${boxW}px`;
    canvas.style.height = `${boxH}px`;
    canvas.style.left = `${x0}px`;
    canvas.style.top = `${y0}px`;

    // One filter for the canvas. Normally only one part is ever in flight --
    // the checkpoints guarantee it -- so this picks the first flying part.
    const filterPart = flying[0];
    canvas.style.filter = `url(#${filterPart.swellId})`;

    let raf = 0;
    const draw = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      parts.forEach(({ placed, phase, start, color, swellId, fontSize }, pi) => {
        if (!isFlying(phase)) return;
        const elapsed = now - start.current;
        const t = (elapsed / 1000) * FORM.swarmSpeed;
        const progress = swellProgress(phase, elapsed);
        // During PLAY the pixels sit at full swell; during FORM the swell
        // shrinks so it hits 0 exactly as they land. `unform` runs it back.
        const formT = phase === "unform" ? progress : phase === "form" ? progress : 0;

        if (swellId === filterPart.swellId) {
          applySwell(swellId, swellParams(progress, fontSize), layeredSwell);
        }

        const size = Math.max(1, placed.grid.step - 0.4);
        ctx.fillStyle = color;

        placed.grid.cells.forEach((cell, i) => {
          const s = seeds[pi][i];
          const hx = placed.x + cell.x - x0;
          const hy = placed.y + cell.y - y0;
          // (a) PLAY: loose wander around the target area.
          const wx = hx + Math.sin(t * s.w1 + s.p1) * s.ax + Math.sin(t * s.w2 + s.p2) * s.ax * 0.4;
          const wy = hy + Math.cos(t * s.w2 + s.p2) * s.ay + Math.sin(t * s.w1 + s.p1) * s.ay * 0.4;
          // (b) FORM: staggered converge onto the letterform.
          const local = clamp01(
            (formT * (1 + FORM.staggerSpan) - s.stagger * FORM.staggerSpan),
          );
          const e = easeOutCubic(local);
          ctx.globalAlpha = 1;
          ctx.fillRect(lerp(wx, hx, e), lerp(wy, hy, e), size, size);
        });
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.style.filter = "";
    };
  }, [scene, seeds, inFlight, leadPhase, focusPhase, leadStart, focusStart, layeredSwell]);

  // ---- smooth dive, by viewBox ----
  //
  // One continuous scrubbed zoom: no steps, no blinks. The raw scroll value
  // is damped toward its target each frame so wheel and trackpad notches do
  // not read as jitter, then eased with an exponent above 1 so the dive
  // starts gently and accelerates.
  const dive = useMemo(() => {
    if (!scene) return null;
    const { vw, vh, counter } = scene;
    // Largest viewport-aspect box that fits inside the counter, with margin.
    let fw = counter.w;
    let fh = (counter.w * vh) / vw;
    if (fh > counter.h) {
      fh = counter.h;
      fw = (counter.h * vw) / vh;
    }
    fw /= ZCFG.finalScaleSafety;
    return {
      finalScale: vw / fw,
      ccx: counter.x + counter.w / 2,
      ccy: counter.y + counter.h / 2,
    };
  }, [scene]);

  const [viewBox, setViewBox] = useState<readonly [number, number, number, number] | null>(
    null,
  );
  const zoomTargetRef = useRef(0);
  zoomTargetRef.current = reducedMotion ? 0 : zoom;

  useEffect(() => {
    if (!scene || !dive) return;

    const { vw, vh } = scene;
    const frame = (t: number): readonly [number, number, number, number] => {
      const eased = Math.pow(clamp01(t), ZCFG.easeExponent);
      const scale = Math.pow(dive.finalScale, eased);
      const w = vw / scale;
      const h = vh / scale;
      const k = Math.pow(clamp01(t), ZCFG.centreExponent);
      const cx = lerp(vw / 2, dive.ccx, k);
      const cy = lerp(vh / 2, dive.ccy, k);
      return [cx - w / 2, cy - h / 2, w, h];
    };

    if (reducedMotion) {
      setViewBox(frame(0));
      return;
    }

    let raf = 0;
    let smoothed = zoomTargetRef.current;
    let settledAt: number | null = null;
    let last = performance.now();
    setViewBox(frame(smoothed));

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const target = zoomTargetRef.current;
      // Frame-rate independent exponential damping.
      const k = 1 - Math.exp(-dt / Math.max(0.001, ZCFG.dampingTau));
      smoothed += (target - smoothed) * k;
      if (Math.abs(target - smoothed) < 0.00002) smoothed = target;
      // Only publish when the value actually moved. The loop has to keep
      // running to notice the next scroll, but re-rendering the whole SVG on
      // every idle frame would cost the swarm its frame budget.
      if (settledAt === null || Math.abs(smoothed - settledAt) > 0.00002) {
        settledAt = smoothed;
        setViewBox(frame(smoothed));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scene, dive, reducedMotion]);

  // ---- scrubbed values ----
  const hintOpacity = (1 - span(hold1, 0.55, 1)) * (1 - span(mistGather, 0, 0.3));
  const mistOpacity =
    span(mistGather, 0, 0.8) *
    lerp(1, MIST.partedOpacity / MIST.gatheredOpacity, span(mistPart, 0.2, 1)) *
    (1 - span(line1Form, 0.45, 1) * 0.55) *
    (1 - span(blockIn, 0.2, 1));
  const partPx = scene ? (span(mistPart, 0, 1) * MIST.partDistanceVw * scene.vw) / 100 : 0;

  // Black smoke gathering into the rectangle.
  const blockT = reducedMotion ? (blockIn > 0 ? 1 : 0) : span(blockIn, 0, 1);
  const rectBlur = lerp(BLOCK.smokeBlurPx, 0, easeOutCubic(blockT));
  const rectSpread = lerp(BLOCK.smokeScale, 1, easeOutCubic(blockT));
  const smokeOpacity = span(blockT, 0, 0.35) * (1 - span(blockT, 0.45, 1));

  // Screen-space gloss, then the exact glass panel Act 2 uses.
  const sheen = span(zoom, ZCFG.sheenFrom, ZCFG.sheenTo);
  const glassBase = reducedMotion
    ? span(zoom, 0.1, 0.7)
    : span(zoom, ZCFG.glassBaseFrom, ZCFG.glassBaseTo);

  const leadSettled = lead.phase === "settled";
  const focusSettled = focus.phase === "settled";

  useEffect(() => {
    if (leadSettled) onBeatSettled?.("line1");
  }, [leadSettled, onBeatSettled]);
  useEffect(() => {
    if (focusSettled) onBeatSettled?.("focus");
  }, [focusSettled, onBeatSettled]);

  const rectOpacity = blockT > 0 ? 1 : 0;

  return (
    <div className="story-act1-stage">
      {/* Swell filters. Kept in a standalone, non-zooming SVG so their
          lengths resolve in the referencing element's own user space --
          CSS pixels for the canvas, viewBox units for the hook SVG --
          without the dive's viewBox changing under them. */}
      <svg className="story-filter-defs" aria-hidden="true">
        <defs>
          <SwellFilter id={SWELL_IDS.line1} layered={layeredSwell} />
          <SwellFilter id={SWELL_IDS.focus} layered={layeredSwell} />
        </defs>
      </svg>

      {/* white glossy glass */}
      <div className="story-glass-white" aria-hidden="true">
        <span className="story-glass-gloss" />
      </div>

      {/* mist */}
      <div className="story-mist" style={{ opacity: mistOpacity }} aria-hidden="true">
        <div className="story-mist-slot" style={{ transform: `translate3d(${-partPx}px, 0, 0)` }}>
          <span className={`story-mist-layer story-mist-a ${reducedMotion ? "" : "is-drifting"}`} />
        </div>
        <div
          className="story-mist-slot"
          style={{ transform: `translate3d(${partPx * 0.35}px, 0, 0)` }}
        >
          <span className={`story-mist-layer story-mist-b ${reducedMotion ? "" : "is-drifting"}`} />
        </div>
        <div className="story-mist-slot" style={{ transform: `translate3d(${partPx}px, 0, 0)` }}>
          <span className={`story-mist-layer story-mist-c ${reducedMotion ? "" : "is-drifting"}`} />
        </div>
      </div>

      {/* black smoke gathering where the block will resolve */}
      {scene && smokeOpacity > 0.001 && !reducedMotion && (
        <div
          className="story-block-smoke"
          aria-hidden="true"
          style={{
            left: scene.rect.x + scene.rect.w / 2,
            top: scene.rect.y + scene.rect.h / 2,
            width: scene.rect.w * rectSpread,
            height: scene.rect.h * rectSpread,
            opacity: smokeOpacity,
          }}
        />
      )}

      {/* the hook scene: one SVG, zoomed by viewBox so pixels stay sharp */}
      {scene && viewBox && (
        <svg
          ref={svgRef}
          className="story-hook-svg"
          viewBox={viewBox.join(" ")}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="storyRectFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141414" />
              <stop offset="45%" stopColor="#0a0a0a" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>
            <linearGradient id="storyRectSpec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="38%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="storyRectShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow
                dx="0"
                dy={Math.round(scene.rect.h * 0.06)}
                stdDeviation={Math.round(scene.rect.h * 0.09)}
                floodColor="#000000"
                floodOpacity="0.22"
              />
            </filter>
          </defs>

          {/* glossy black glass rectangle */}
          <g
            opacity={rectOpacity}
            style={{
              filter: rectBlur > 0.05 ? `blur(${rectBlur}px)` : undefined,
              transition: reducedMotion ? "opacity 500ms ease" : "none",
            }}
          >
            <g filter="url(#storyRectShadow)">
              <rect
                x={scene.rect.x}
                y={scene.rect.y}
                width={scene.rect.w}
                height={scene.rect.h}
                rx={BLOCK.cornerRadius}
                fill="url(#storyRectFace)"
              />
            </g>
            {/* soft specular near the top edge */}
            <rect
              x={scene.rect.x}
              y={scene.rect.y}
              width={scene.rect.w}
              height={scene.rect.h}
              rx={BLOCK.cornerRadius}
              fill="url(#storyRectSpec)"
            />
            {/* thin light rim */}
            <rect
              x={scene.rect.x + 0.5}
              y={scene.rect.y + 0.5}
              width={scene.rect.w - 1}
              height={scene.rect.h - 1}
              rx={BLOCK.cornerRadius}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          </g>

          {/* settled pixels, as real vector squares */}
          {/* filter attribute is ABSENT once crisp, not merely zeroed, so
              the resting text and the whole dive stay sharp and cheap */}
          <g
            fill={INK}
            shapeRendering="crispEdges"
            opacity={leadSettled ? 1 : 0}
            filter={leadSettled || reducedMotion ? undefined : `url(#${SWELL_IDS.line1})`}
            style={{ transition: reducedMotion ? "opacity 600ms ease" : "none" }}
          >
            {leadSettled &&
              scene.lead.grid.cells.map((c, i) => (
                <rect
                  key={i}
                  x={scene.lead.x + c.x}
                  y={scene.lead.y + c.y}
                  width={scene.lead.grid.step - 0.4}
                  height={scene.lead.grid.step - 0.4}
                />
              ))}
          </g>
          <g
            fill="#ffffff"
            shapeRendering="crispEdges"
            opacity={focusSettled ? 1 : 0}
            filter={focusSettled || reducedMotion ? undefined : `url(#${SWELL_IDS.focus})`}
            style={{ transition: reducedMotion ? "opacity 600ms ease" : "none" }}
          >
            {focusSettled &&
              scene.focus.grid.cells.map((c, i) => (
                <rect
                  key={i}
                  x={scene.focus.x + c.x}
                  y={scene.focus.y + c.y}
                  width={scene.focus.grid.step - 0.4}
                  height={scene.focus.grid.step - 0.4}
                />
              ))}
          </g>
        </svg>
      )}

      {/* particles in flight only */}
      <canvas
        ref={canvasRef}
        className="story-swarm-canvas"
        aria-hidden="true"
        style={{ opacity: inFlight ? 1 : 0 }}
      />

      {/* real text, for screen readers */}
      <p className="story-sr-only">{ACT1.lead}</p>
      <p className="story-sr-only">{ACT1.emphasis}</p>

      {/* screen-space gloss: never scales with the rect, so it cannot smear */}
      <div className="story-glass-gloss story-hook-gloss" style={{ opacity: sheen }} aria-hidden="true" />

      {/* the exact panel Act 2 uses, so the handoff matches precisely */}
      <div className="story-glass" style={{ opacity: glassBase }} aria-hidden="true">
        <span className="story-glass-gloss" />
      </div>

      <div className="story-scroll-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
        <span>{ACT1.scrollHint}</span>
        <span className={`story-scroll-caret ${reducedMotion ? "" : "is-bobbing"}`} />
      </div>
    </div>
  );
}
