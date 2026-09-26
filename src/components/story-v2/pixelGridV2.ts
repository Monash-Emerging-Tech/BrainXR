/**
 * Particle sampling for the v2 opening.
 *
 * THE ARCHITECTURE THIS REPLACES. The resting text used to be rebuilt out
 * of sampled particles -- a grid of <rect>s traced off a canvas. However
 * carefully that grid was aligned to OffBit's design pixels, one sample
 * landing a hair off centre dropped a whole stroke, and "HAVE YOU WONDERED
 * WHAT MAKES YOU" came out with H's left leg and F's bars missing.
 *
 * So the resting text is no longer reconstructed at all. It is REAL OffBit
 * text, drawn by the browser, which is perfect by definition. The particles
 * are decoration for the formation only, and they are sampled FROM that
 * same real text -- same font, same size, same origin -- so they converge
 * exactly onto the glyphs the browser is about to draw.
 *
 * Two consequences for the sampler:
 *   - a cell counts as ink if ANY pixel in it is ink, not if its centre
 *     happens to be. A stroke cannot fall between samples.
 *   - the alpha threshold is low, and there is no particle cap. Nothing is
 *     allowed to drop a pixel from a glyph for the sake of a budget.
 */

export interface GridCellV2 {
  x: number;
  y: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

function fontSpec(font: string, size: number, weight: number) {
  return `${weight} ${size}px ${font}`;
}

/** Cache: font stack -> design pixels per 1px of font size. */
const pitchRatioCache = new Map<string, number>();

/**
 * Measures the font's design pixel as a FRACTION of font size, by rendering
 * big and taking the greatest common divisor of the ink run lengths.
 */
export function pixelPitchRatio(font: string, fontWeight = 400): number {
  const key = `${font}|${fontWeight}`;
  const cached = pitchRatioCache.get(key);
  if (cached !== undefined) return cached;

  const REF = 240;
  const fallback = 1 / 11;
  if (typeof document === "undefined") return fallback;

  const canvas = document.createElement("canvas");
  canvas.width = REF * 6;
  canvas.height = Math.ceil(REF * 1.6);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;

  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  ctx.font = fontSpec(font, REF, fontWeight);
  // Glyphs with plenty of short runs, so the GCD is well constrained.
  ctx.fillText("HEWM48", 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let g = 0;
  for (let y = 0; y < canvas.height; y += 3) {
    let run = 0;
    for (let x = 0; x < canvas.width; x++) {
      const on = data[(y * canvas.width + x) * 4 + 3] > 128;
      if (on) {
        run++;
      } else if (run > 0) {
        // Runs of 1-2 px are antialiasing fringes, not design pixels.
        if (run > 2) g = g === 0 ? run : gcd(g, run);
        run = 0;
      }
    }
    if (run > 2) g = g === 0 ? run : gcd(g, run);
  }

  // A GCD of 1 or 2 means the measurement failed (outline font, or the
  // webfont had not loaded). Fall back to a sane density.
  const ratio = g > 2 ? g / REF : fallback;
  pitchRatioCache.set(key, ratio);
  return ratio;
}

/**
 * Snaps a requested font size so one design pixel is a whole number of px.
 * Returns both the adjusted size and that pitch.
 */
export function snapToPixelGrid(
  font: string,
  requestedSize: number,
  fontWeight = 400,
): { fontSize: number; step: number } {
  const ratio = pixelPitchRatio(font, fontWeight);
  const step = Math.max(1, Math.round(requestedSize * ratio));
  const fontSize = Math.max(8, Math.round(step / ratio));
  return { fontSize, step };
}

/**
 * The tight ink box of a line of text, and where the text's own origin
 * (the start of the alphabetic baseline) sits inside it.
 *
 * Everything -- the real <text>, the particle canvas and the character
 * bands -- is positioned from this one measurement, which is what keeps the
 * particles and the real text pixel-identical.
 */
export interface TextInk {
  width: number;
  height: number;
  /** x of the text origin within the box. */
  originX: number;
  /** y of the alphabetic baseline within the box. */
  originY: number;
  fontSize: number;
}

/** Measures a line's tight ink box. Returns null if it has no ink. */
export function measureTextInk(
  text: string,
  font: string,
  fontSize: number,
  fontWeight = 400,
): TextInk | null {
  if (typeof document === "undefined" || !text) return null;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  ctx.font = fontSpec(font, fontSize, fontWeight);
  const m = ctx.measureText(text);

  const left = m.actualBoundingBoxLeft ?? 0;
  const right = m.actualBoundingBoxRight ?? m.width;
  const asc = m.actualBoundingBoxAscent ?? fontSize * 0.8;
  const desc = m.actualBoundingBoxDescent ?? fontSize * 0.2;

  const width = Math.ceil(left + right);
  const height = Math.ceil(asc + desc);
  if (width <= 0 || height <= 0) return null;

  return { width, height, originX: Math.ceil(left), originY: Math.ceil(asc), fontSize };
}

export interface ParticleSampleOptions {
  text: string;
  font: string;
  fontSize: number;
  fontWeight?: number;
  /** Particle pitch in px, from snapToPixelGrid. */
  step: number;
  /** The box the real text will occupy, from measureTextInk. */
  ink: TextInk;
  /** Alpha 0-255 above which a pixel counts as ink. Low on purpose. */
  alpha?: number;
}

/**
 * Samples particle targets off the REAL text, at its real size and origin.
 *
 * A cell is emitted if any pixel inside it is ink, so no stroke can slip
 * between samples -- the failure mode of centre-sampling. There is no cap
 * on the number of cells returned.
 */
export function sampleTextParticles(opts: ParticleSampleOptions): GridCellV2[] {
  const { text, font, fontSize, fontWeight = 400, step, ink } = opts;
  const alpha = opts.alpha ?? 24;
  if (typeof document === "undefined" || !text) return [];

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, ink.width);
  canvas.height = Math.max(1, ink.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.font = fontSpec(font, fontSize, fontWeight);
  // Exactly where the browser will put the real text inside the same box.
  ctx.fillText(text, ink.originX, ink.originY);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const cols = Math.ceil(canvas.width / step);
  const rows = Math.ceil(canvas.height / step);

  const cells: GridCellV2[] = [];
  for (let j = 0; j < rows; j++) {
    const y0 = j * step;
    const y1 = Math.min(canvas.height, y0 + step);
    for (let i = 0; i < cols; i++) {
      const x0 = i * step;
      const x1 = Math.min(canvas.width, x0 + step);
      let hit = false;
      for (let y = y0; y < y1 && !hit; y++) {
        const row = y * canvas.width;
        for (let x = x0; x < x1; x++) {
          if (data[(row + x) * 4 + 3] > alpha) {
            hit = true;
            break;
          }
        }
      }
      if (hit) cells.push({ x: x0, y: y0 });
    }
  }
  return cells;
}

/**
 * Per-character x ranges for a line, in the same coordinate space as
 * samplePixelGridV2's cells, so each glyph's pixels can be confined to its
 * own cell during the jitter.
 */
export function characterBands(
  text: string,
  font: string,
  fontSize: number,
  fontWeight: number,
  originX: number,
): { start: number; end: number }[] {
  if (typeof document === "undefined") return [];
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return [];
  ctx.font = fontSpec(font, fontSize, fontWeight);

  const chars = Array.from(text);
  const bands: { start: number; end: number }[] = [];
  let prev = 0;
  for (let i = 0; i < chars.length; i++) {
    const upto = ctx.measureText(chars.slice(0, i + 1).join("")).width;
    bands.push({ start: prev - originX, end: upto - originX });
    prev = upto;
  }
  return bands;
}
