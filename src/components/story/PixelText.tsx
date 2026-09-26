import { useEffect, useRef, useState } from "react";

/**
 * Text rendered as a cloud of pixel squares on ONE canvas.
 *
 * The previous version of this file put each pixel in its own absolutely
 * positioned <span>. A single wrapped sentence ran to well over a thousand
 * DOM nodes, each with its own transition -- fine standing still, far too
 * much to animate. Everything here draws into one canvas instead.
 *
 * Two motions:
 *   mode="in"  pixels fly in from scattered positions and ease into the
 *              letterforms, with a slight per-pixel stagger
 *   mode="out" pixels fall under gravity with a little horizontal drift
 *              and rotation, fading as they drop
 *
 * The real text stays in the DOM, visually hidden, so screen readers and
 * find-in-page get a sentence rather than a canvas.
 */

interface PixelTextProps {
  text: string;
  mode: "in" | "out";
  /** Resolved font stack for ctx.font -- never a CSS var. */
  font: string;
  fontSize: number;
  fontWeight?: number;
  color: string;
  /** Layout width in CSS px. Sampling and word-wrap both key off this. */
  width: number;
  /** Target spacing of the pixel grid, in CSS px. Grows if the cap is hit. */
  cellSize?: number;
  /** Hard ceiling on particles, for the sake of low-end GPUs. */
  maxParticles?: number;
  reducedMotion?: boolean;
  className?: string;
  /** Explicit line height in px, to match a DOM element exactly. */
  lineHeightPx?: number;
  /** Vertical offset for the first line, i.e. a DOM line box's half-leading. */
  topOffset?: number;
  /** Must match the DOM text's alignment or the handoff will jump. */
  align?: "left" | "center";
  /**
   * Where pixels come from. "scatter" throws them out radially at a
   * distance; "center" gathers them near the middle of the text, which is
   * what makes Act 1's line emerge from inside the parting mist rather
   * than fly in from off-screen.
   */
  sourceMode?: "scatter" | "center";
  /** Radius used by sourceMode="center". */
  sourceRadius?: number;
}

interface Particle {
  /** resting position, inside the letterform */
  hx: number;
  hy: number;
  /** scattered origin, for the fly-in */
  sx: number;
  sy: number;
  /** live position */
  x: number;
  y: number;
  /** fall velocity + spin */
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  delay: number;
  alpha: number;
  /** 0..1 position in the stagger order, used by scrubbed forming. */
  stagger: number;
}

const IN_MS = 620;
const OUT_MS = 900;
/**
 * Extra canvas below the text so falling pixels have somewhere to go.
 * Without it the canvas is exactly text-height and gravity drags every
 * pixel out of its own bitmap within a frame or two -- the fall just
 * vanishes. The layout box stays text-height; only the canvas overhangs.
 */
const FALL_ROOM = 280;
/** px/s^2 -- tuned so a line clears its own height in roughly OUT_MS. */
const GRAVITY = 1750;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Wrap `text` to `width` using the already-configured ctx.font. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > width) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function PixelText({
  text,
  mode,
  font,
  fontSize,
  fontWeight = 400,
  color,
  width,
  cellSize = 3,
  maxParticles = 1200,
  reducedMotion = false,
  className = "",
  lineHeightPx,
  topOffset = 0,
  align = "left",
  sourceMode = "scatter",
  sourceRadius = 90,
}: PixelTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [height, setHeight] = useState(Math.round(fontSize * 1.35));
  // The grid step actually used -- sampling may coarsen it to respect the cap.
  const stepRef = useRef(cellSize);

  const fontSpec = `${fontWeight} ${fontSize}px ${font}`;

  // Sampling before the webfont lands would measure and trace the fallback,
  // so every pixel would sit in the wrong place.
  useEffect(() => {
    let alive = true;
    const fonts = document.fonts;
    if (!fonts) {
      setFontsReady(true);
      return;
    }
    Promise.resolve(fonts.load(fontSpec))
      .catch(() => undefined)
      .then(() => fonts.ready)
      .then(() => {
        if (alive) setFontsReady(true);
      })
      .catch(() => {
        if (alive) setFontsReady(true);
      });
    return () => {
      alive = false;
    };
  }, [fontSpec]);

  // ---- sample the text into resting pixel positions ----
  useEffect(() => {
    if (!fontsReady || reducedMotion || width <= 0 || !text) return;

    const off = document.createElement("canvas");
    const lineHeight = Math.round(lineHeightPx ?? fontSize * 1.35);
    off.width = Math.max(1, Math.round(width));
    off.height = Math.max(lineHeight, lineHeight * 5 + topOffset);
    const ctx = off.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.font = fontSpec;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff";

    const lines = wrap(ctx, text, off.width);
    lines.forEach((line, i) => {
      const x = align === "center" ? (off.width - ctx.measureText(line).width) / 2 : 0;
      ctx.fillText(line, x, i * lineHeight + topOffset);
    });

    const used = Math.max(lineHeight, lines.length * lineHeight + topOffset);
    const image = ctx.getImageData(0, 0, off.width, Math.min(used, off.height)).data;

    // Coarsen the grid until the particle count fits under the cap, rather
    // than dropping pixels at random -- that would punch holes in glyphs.
    let step = cellSize;
    let points: { x: number; y: number }[] = [];
    for (let attempt = 0; attempt < 6; attempt++) {
      points = [];
      for (let y = 0; y < used; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (image[(y * off.width + x) * 4 + 3] > 120) points.push({ x, y });
        }
      }
      if (points.length <= maxParticles) break;
      step += 1;
    }
    stepRef.current = step;

    const spread = Math.max(width, 260);
    const cx = off.width / 2;
    const cy = used / 2;
    particlesRef.current = points.map((p) => {
      const angle = Math.random() * Math.PI * 2;
      let sx: number;
      let sy: number;
      if (sourceMode === "center") {
        // Start bunched around the middle of the text, where the mist is.
        const r = sourceRadius * Math.sqrt(Math.random());
        sx = cx + Math.cos(angle) * r;
        sy = cy + Math.sin(angle) * r * 0.55;
      } else {
        const dist = spread * (0.35 + Math.random() * 0.75);
        sx = p.x + Math.cos(angle) * dist;
        sy = p.y + Math.sin(angle) * dist;
      }
      return {
        hx: p.x,
        hy: p.y,
        sx,
        sy,
        x: p.x,
        y: p.y,
        vx: 0,
        vy: 0,
        rot: 0,
        vrot: 0,
        delay: Math.random() * 180,
        alpha: 0,
        stagger: Math.random(),
      };
    });

    setHeight(used);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fontsReady,
    text,
    fontSpec,
    width,
    cellSize,
    maxParticles,
    reducedMotion,
    fontSize,
    lineHeightPx,
    topOffset,
    align,
    sourceMode,
    sourceRadius,
  ]);

  // ---- time-driven in / out (Act 2) ----
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasHeight = height + FALL_ROOM;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(canvasHeight * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${canvasHeight}px`;

    const particles = particlesRef.current;

    if (mode === "in") {
      for (const p of particles) {
        p.x = p.sx;
        p.y = p.sy;
        p.alpha = 0;
        p.rot = 0;
      }
    } else {
      // Fall from wherever the pixels currently rest.
      for (const p of particles) {
        p.x = p.hx;
        p.y = p.hy;
        p.vx = (Math.random() - 0.5) * 46;
        p.vy = Math.random() * 40;
        p.rot = 0;
        p.vrot = (Math.random() - 0.5) * 7;
        p.delay = Math.random() * 190;
        p.alpha = 1;
      }
    }

    const size = Math.max(1, stepRef.current - 0.5);
    const half = size / 2;
    const start = performance.now();
    let prev = start;

    const frame = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min((now - prev) / 1000, 1 / 30);
      prev = now;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = color;

      let alive = false;

      if (mode === "in") {
        for (const p of particles) {
          const t = clamp01((elapsed - p.delay) / IN_MS);
          const e = easeOutCubic(t);
          p.x = p.sx + (p.hx - p.sx) * e;
          p.y = p.sy + (p.hy - p.sy) * e;
          p.alpha = clamp01(t * 1.7);
          if (t < 1) alive = true;
          ctx.globalAlpha = p.alpha;
          ctx.fillRect(p.x, p.y, size, size);
        }
      } else {
        for (const p of particles) {
          if (elapsed < p.delay) {
            ctx.globalAlpha = p.alpha;
            ctx.fillRect(p.x, p.y, size, size);
            alive = true;
            continue;
          }
          p.vy += GRAVITY * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vrot * dt;
          p.alpha = clamp01(1 - (elapsed - p.delay) / OUT_MS);
          if (p.alpha <= 0) continue;
          alive = true;
          ctx.globalAlpha = p.alpha;
          // Rotation only on the way out -- the fly-in stays axis-aligned so
          // the settled letterforms are crisp.
          ctx.translate(p.x + half, p.y + half);
          ctx.rotate(p.rot);
          ctx.fillRect(-half, -half, size, size);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      }

      ctx.globalAlpha = 1;
      // Stop the loop once everything has settled or fallen out of sight.
      if (alive) rafRef.current = requestAnimationFrame(frame);
      else rafRef.current = null;
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [mode, text, width, height, color, reducedMotion, fontsReady]);

  // Reduced motion: no particles at all, just text that crossfades.
  if (reducedMotion) {
    return (
      <p
        className={className}
        style={{
          width,
          margin: 0,
          color,
          font: fontSpec,
          lineHeight: 1.35,
          opacity: mode === "in" ? 1 : 0,
          transition: "opacity 420ms ease",
          // Newly mounted text starts at 0 and fades up; without this the
          // swap would pop in at full opacity. Reuses the existing keyframe.
          animation: mode === "in" ? "fadeIn 420ms ease both" : undefined,
        }}
      >
        {text}
      </p>
    );
  }

  return (
    <div className={className} style={{ position: "relative", width, height }}>
      <span className="story-sr-only">{text}</span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: "block", position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}
