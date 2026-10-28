/**
 * Text -> a grid of pixel cells, sampled off an offscreen canvas.
 *
 * Extracted so that ONE sampled grid can drive two renderers: the canvas
 * particle swarm while the pixels are in flight, and an SVG of <rect>s once
 * they have landed. Because both read the same cells at the same step size,
 * the swap between them is visually invisible -- and the SVG keeps the pixel
 * look sharp at any zoom, which a rasterised canvas cannot.
 */

export interface GridCell {
  x: number;
  y: number;
}

export interface PixelGrid {
  cells: GridCell[];
  /** Grid pitch actually used, in px. Squares are drawn at this size. */
  step: number;
  /** Width of the sampling box. */
  width: number;
  /** Height actually occupied by glyphs. */
  height: number;
}

export interface SampleOptions {
  text: string;
  /** Resolved font stack -- never a CSS var, it will not resolve on canvas. */
  font: string;
  fontSize: number;
  fontWeight?: number;
  /** Sampling box width; also the wrap width. */
  maxWidth: number;
  lineHeightPx?: number;
  align?: "left" | "center";
  cellSize?: number;
  maxCells?: number;
}

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

export function fontSpec(font: string, fontSize: number, fontWeight = 400): string {
  return `${fontWeight} ${fontSize}px ${font}`;
}

/** Width of `text` in the given font, for laying things out before sampling. */
export function measureText(text: string, font: string, fontSize: number, fontWeight = 400) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = fontSpec(font, fontSize, fontWeight);
  return ctx.measureText(text).width;
}

export function samplePixelGrid(opts: SampleOptions): PixelGrid {
  const {
    text,
    font,
    fontSize,
    fontWeight = 400,
    maxWidth,
    lineHeightPx,
    align = "left",
    cellSize = 3,
    maxCells = 1600,
  } = opts;

  const empty: PixelGrid = { cells: [], step: cellSize, width: maxWidth, height: fontSize };
  if (typeof document === "undefined" || maxWidth <= 0 || !text) return empty;

  const canvas = document.createElement("canvas");
  const lineHeight = Math.round(lineHeightPx ?? fontSize * 1.35);
  canvas.width = Math.max(1, Math.ceil(maxWidth));
  canvas.height = Math.max(lineHeight, lineHeight * 5);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return empty;

  ctx.font = fontSpec(font, fontSize, fontWeight);
  ctx.textBaseline = "top";
  ctx.fillStyle = "#fff";

  const lines = wrap(ctx, text, canvas.width);
  lines.forEach((line, i) => {
    const x = align === "center" ? (canvas.width - ctx.measureText(line).width) / 2 : 0;
    ctx.fillText(line, x, i * lineHeight);
  });

  const used = Math.min(canvas.height, Math.max(lineHeight, lines.length * lineHeight));
  const image = ctx.getImageData(0, 0, canvas.width, used).data;

  // Coarsen the grid until the count fits under the cap, rather than
  // dropping cells at random -- that would punch holes in the glyphs.
  let step = cellSize;
  let cells: GridCell[] = [];
  for (let attempt = 0; attempt < 6; attempt++) {
    cells = [];
    for (let y = 0; y < used; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        if (image[(y * canvas.width + x) * 4 + 3] > 120) cells.push({ x, y });
      }
    }
    if (cells.length <= maxCells) break;
    step += 1;
  }

  return { cells, step, width: canvas.width, height: used };
}

export interface CounterBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Finds the COUNTER -- the enclosed hollow -- of one glyph, straight from the
 * sampled grid, by looking for empty cells that have ink to both their left
 * and their right within that glyph's horizontal band. For a "U" that is
 * exactly the well between the two stems.
 *
 * Returns null if the glyph has no enclosed area to find.
 */
export function findCounter(grid: PixelGrid, xStart: number, xEnd: number): CounterBox | null {
  const { cells, step } = grid;
  if (!cells.length || step <= 0) return null;

  const c0 = Math.floor(xStart / step);
  const c1 = Math.ceil(xEnd / step);

  // rows -> set of occupied columns, restricted to this glyph's band
  const rows = new Map<number, Set<number>>();
  for (const cell of cells) {
    const col = Math.round(cell.x / step);
    if (col < c0 || col > c1) continue;
    const row = Math.round(cell.y / step);
    let set = rows.get(row);
    if (!set) {
      set = new Set<number>();
      rows.set(row, set);
    }
    set.add(col);
  }
  if (!rows.size) return null;

  let minC = Infinity;
  let maxC = -Infinity;
  let minR = Infinity;
  let maxR = -Infinity;

  for (const [row, set] of rows) {
    const cols = Array.from(set).sort((a, b) => a - b);
    const left = cols[0];
    const right = cols[cols.length - 1];
    for (let col = left + 1; col < right; col++) {
      if (set.has(col)) continue;
      // empty, with ink on both sides in this row: interior
      if (col < minC) minC = col;
      if (col > maxC) maxC = col;
      if (row < minR) minR = row;
      if (row > maxR) maxR = row;
    }
  }

  if (minC > maxC || minR > maxR) return null;

  return {
    x: minC * step,
    y: minR * step,
    w: (maxC - minC + 1) * step,
    h: (maxR - minR + 1) * step,
  };
}
