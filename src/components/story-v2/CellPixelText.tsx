import { useEffect, useMemo, useRef, useState } from "react";
import { applySwell, prefersLayeredSwell, swellParams } from "../story/SwellFilter";
import {
  characterBands,
  measureTextInk,
  sampleTextParticles,
  snapToPixelGrid,
  type GridCellV2,
  type TextInk,
} from "./pixelGridV2";
import { STORY_V2 } from "./storyContentV2";

/**
 * The question line: REAL OffBit text, with a particle formation over it.
 *
 * THE ARCHITECTURE THIS REPLACES. The resting line used to be rebuilt out
 * of sampled pixels. However carefully the sampler was aligned to OffBit's
 * design grid, one sample landing off centre dropped a whole stroke, and
 * the finished line was missing the H's left leg and the F's bars.
 * Reconstructing type from a sampler is a losing game: it can only ever
 * approach what the browser already does perfectly.
 *
 * So the resting text is not reconstructed. It is a real SVG <text>, laid
 * out and rasterised by the browser, and it is therefore always correct and
 * always readable.
 *
 * The particles are DECORATION FOR THE FORMATION ONLY:
 *
 *   1. they jitter inside their own character's cell -- quantised twice on
 *      purpose, snapped to a grid and re-picked only every
 *      `jitterIntervalMs`, because smooth noise reads as drifting dust
 *      while stepped noise reads as a display that has not locked yet
 *   2. they converge onto the glyph shapes, which are sampled from that
 *      same real text at the same size and the same origin
 *   3. over the last `textSwapMs` the real text fades in exactly underneath
 *      while the particles fade out. Both are OffBit at the same position,
 *      so there is nothing to see in the swap.
 *
 * The inverse swell-blur rides on the particle canvas and reaches crisp as
 * they lock.
 */

const CFG = STORY_V2.cells;

export interface CellPixelTextProps {
  text: string;
  font: string;
  /** Requested size; the particle PITCH is snapped to the font's grid. */
  fontSize: number;
  fontWeight?: number;
  color: string;
  /** Live 0..1 forming progress, as a REF so this never re-renders per frame. */
  progressRef: React.RefObject<number>;
  /** Live 0..1 swell-blur progress. 1 = crisp. */
  swellRef?: React.RefObject<number>;
  swellId?: string;
  /** Progress at which the real text starts fading in under the particles. */
  swapFrom?: number;
  reducedMotion?: boolean;
  className?: string;
}

interface Particle {
  hx: number;
  hy: number;
  /** The character cell this pixel may never leave. */
  bandX: number;
  bandW: number;
  charT: number;
  seed: number;
}

interface Layout {
  ink: TextInk;
  cells: GridCellV2[];
  particles: Particle[];
  step: number;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Deterministic hash, so a pixel's dither is stable within a time step. */
function hash(seed: number, step: number): number {
  const x = Math.sin(seed * 12.9898 + step * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildLayout(
  text: string,
  font: string,
  fontSize: number,
  fontWeight: number,
): Layout | null {
  // The real text is the ground truth: measure IT, then sample particles
  // into the very box it is going to occupy.
  const ink = measureTextInk(text, font, fontSize, fontWeight);
  if (!ink) return null;

  // OffBit's own design pixel still makes the nicest particle pitch, but it
  // is only a pitch now -- nothing depends on it landing perfectly.
  const { step } = snapToPixelGrid(font, fontSize, fontWeight);
  const cells = sampleTextParticles({
    text,
    font,
    fontSize,
    fontWeight,
    step,
    ink,
    alpha: CFG.inkAlpha,
  });
  if (!cells.length) return null;

  // Bands in the SAME box coordinates: the text origin sits at ink.originX.
  const bands = characterBands(text, font, fontSize, fontWeight, -ink.originX);
  const chars = Array.from(text);

  const particles: Particle[] = cells.map((c, i) => {
    let bandIndex = bands.findIndex((b) => c.x >= b.start && c.x < b.end);
    if (bandIndex < 0) bandIndex = c.x < 0 ? 0 : bands.length - 1;
    const band = bands[bandIndex] ?? { start: 0, end: ink.width };
    return {
      hx: c.x,
      hy: c.y,
      bandX: band.start,
      bandW: Math.max(step * 2, band.end - band.start),
      charT: chars.length > 1 ? bandIndex / (chars.length - 1) : 0,
      seed: i * 0.618 + bandIndex * 7.13,
    };
  });

  return { ink, cells, particles, step };
}

export default function CellPixelText({
  text,
  font,
  fontSize,
  fontWeight = 400,
  color,
  progressRef,
  swellRef,
  swellId,
  swapFrom = 0.9,
  reducedMotion = false,
  className = "",
}: CellPixelTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const layered = useMemo(() => prefersLayeredSwell(), []);

  // Measuring before the webfont lands would trace the fallback, and the
  // real text would then reflow out from under the particles.
  useEffect(() => {
    let alive = true;
    const fonts = document.fonts;
    if (!fonts) {
      setFontsReady(true);
      return;
    }
    Promise.resolve(fonts.load(`${fontWeight} ${fontSize}px ${font}`))
      .catch(() => undefined)
      .then(() => fonts.ready)
      .then(() => alive && setFontsReady(true))
      .catch(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, [font, fontSize, fontWeight]);

  const layout = useMemo(
    () => (fontsReady ? buildLayout(text, font, fontSize, fontWeight) : null),
    [fontsReady, text, font, fontSize, fontWeight],
  );

  const drawing = !!layout && !locked && !reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    const textEl = textRef.current;
    if (!layout || !textEl) return;

    if (!drawing) {
      // Resting: the real text is all there is.
      textEl.style.opacity = "1";
      if (canvas) canvas.style.filter = "";
      return;
    }
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Full device pixel ratio: these are hard-edged squares and any
    // resampling shows immediately.
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = layout.ink;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.imageSmoothingEnabled = false;

    const step = layout.step;
    const sizeDev = Math.max(1, Math.round(step * dpr));
    let raf = 0;

    const draw = (now: number) => {
      const p = progressRef.current ?? 0;
      if (p >= 1) {
        textEl.style.opacity = "1";
        setLocked(true);
        return;
      }

      // The swap: real text up, particles down, over the same window.
      const swap = clamp01((p - swapFrom) / Math.max(0.0001, 1 - swapFrom));
      textEl.style.opacity = String(swap);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      const jitterStep = Math.floor(now / CFG.jitterIntervalMs);
      const fade = 1 - swap;

      for (const part of layout.particles) {
        // Stagger so the line ripples left to right.
        const local = clamp01(
          p * (1 + CFG.staggerSpan) - part.charT * CFG.staggerSpan,
        );
        const e = easeOutCubic(local);

        let px = part.hx;
        let py = part.hy;
        if (e < 1) {
          // Dithered position inside this character's own cell, re-picked
          // every jitterIntervalMs and snapped to the design grid.
          const rx = hash(part.seed, jitterStep);
          const ry = hash(part.seed + 3.7, jitterStep);
          const spanX = part.bandW * CFG.jitterSpread;
          const spanY = height * CFG.jitterSpread;
          const jx =
            part.bandX + (part.bandW - spanX) / 2 + Math.round((rx * spanX) / step) * step;
          const jy = (height - spanY) / 2 + Math.round((ry * spanY) / step) * step;
          px = jx + (part.hx - jx) * e;
          py = jy + (part.hy - jy) * e;
        }

        ctx.globalAlpha = (0.55 + 0.45 * e) * fade;
        // Snap to whole device pixels so the squares keep razor edges.
        ctx.fillRect(Math.round(px * dpr), Math.round(py * dpr), sizeDev, sizeDev);
      }
      ctx.globalAlpha = 1;

      const sw = swellRef?.current;
      if (swellId && sw !== undefined && sw < 1) {
        applySwell(swellId, swellParams(sw, layout.ink.fontSize), layered);
        canvas.style.filter = `url(#${swellId})`;
      } else {
        canvas.style.filter = "";
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.style.filter = "";
    };
  }, [drawing, layout, color, swellId, layered, progressRef, swellRef, swapFrom]);

  if (!layout) {
    return <div className={className} style={{ width: 1, height: fontSize }} />;
  }

  const { width, height, originX, originY } = layout.ink;

  return (
    <div className={className} style={{ position: "relative", width, height }}>
      {/* The readable text: drawn by the browser, so it cannot lose a
          stroke. It is the thing you actually read; the particles above it
          are only how it arrives. */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", overflow: "visible" }}
        role="img"
        aria-label={text}
      >
        <text
          ref={textRef}
          x={originX}
          y={originY}
          fill={color}
          fontFamily={font}
          fontSize={fontSize}
          fontWeight={fontWeight}
          style={{ opacity: drawing ? 0 : 1, whiteSpace: "pre" }}
        >
          {text}
        </text>
      </svg>

      {drawing && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: "absolute", left: 0, top: 0, display: "block" }}
        />
      )}
    </div>
  );
}
