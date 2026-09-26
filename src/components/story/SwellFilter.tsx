import { STORY_PACING } from "./storyContent";

/**
 * The INVERSE SWELL-BLUR filter.
 *
 * The reference clip plays sharp -> swollen -> haze. Run backwards, that is
 * the reveal: a dim haze where the letter shapes are only just readable,
 * then swollen glowing strokes brightening, then the strokes tightening and
 * thinning into crisp text.
 *
 * It is deliberately NOT a uniform Gaussian blur. Each stroke is DILATED
 * outward and softened, which is what makes it read as ink bleeding or a
 * neon tube rather than as something merely out of focus; and a brighter,
 * tighter CORE is kept along the original stroke path inside that swollen
 * body, which is what gives it the volumetric feel.
 *
 * Everything is driven from ONE progress value, 0 = haze, 1 = crisp. Sizes
 * are fractions of font size so the effect is identical on any screen.
 *
 * The structure is rendered ONCE and its numbers are then mutated in place
 * by `applySwell`. Re-rendering the filter through React on every frame
 * would re-render the whole hook SVG with it.
 */

const CFG = STORY_PACING.swell;

/** Fixed, generous filter region: big enough for the peak dilate + blur,
 *  and constant so the buffer never has to be resized mid-animation. */
const REGION = { x: "-25%", y: "-25%", w: "150%", h: "150%" };

export interface SwellParams {
  dilate: number;
  bodyBlur: number;
  coreBlur: number;
  opacity: number;
}

/** True when this engine should avoid feMorphology. */
export function prefersLayeredSwell(): boolean {
  if (CFG.renderer === "layered") return true;
  if (CFG.renderer === "morphology") return false;
  if (typeof navigator === "undefined") return false;
  // WebKit is where dilate is the slow path. Chromium and friends also carry
  // "Safari" in their UA, hence the exclusions.
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|android|crios|fxios|edg/i.test(ua);
}

/**
 * Maps progress (0 haze -> 1 crisp) to filter parameters.
 * `fontSize` scales every length, so a phone and a desktop swell alike.
 */
export function swellParams(progress: number, fontSize: number): SwellParams {
  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  // Ease-out on the tightening: most of the swell collapses early, and the
  // last of the sharpening settles gently.
  const s = Math.pow(1 - p, CFG.easeExponent);
  return {
    dilate: CFG.maxDilate * fontSize * s,
    bodyBlur: CFG.maxBodyBlur * fontSize * s,
    coreBlur: CFG.maxCoreBlur * fontSize * s,
    opacity: CFG.startOpacity + (1 - CFG.startOpacity) * p,
  };
}

const nodeCache = new Map<string, Element | null>();
function node(id: string): Element | null {
  if (!nodeCache.has(id)) nodeCache.set(id, document.getElementById(id));
  const found = nodeCache.get(id) ?? null;
  // Survive a remount, which would leave a stale detached node cached.
  if (found && !found.isConnected) {
    const fresh = document.getElementById(id);
    nodeCache.set(id, fresh);
    return fresh;
  }
  return found;
}

/** Writes new numbers straight onto the live filter primitives. */
export function applySwell(id: string, params: SwellParams, layered: boolean): void {
  const min = (n: number) => String(Math.max(0.01, n));
  if (layered) {
    node(`${id}-spread`)?.setAttribute(
      "stdDeviation",
      min((params.dilate + params.bodyBlur) * CFG.fallbackSpread),
    );
  } else {
    node(`${id}-dilate`)?.setAttribute("radius", min(params.dilate));
    node(`${id}-bodyblur`)?.setAttribute("stdDeviation", min(params.bodyBlur));
  }
  node(`${id}-coreblur`)?.setAttribute("stdDeviation", min(params.coreBlur));
  node(`${id}-out`)?.setAttribute("slope", String(params.opacity));
}

interface SwellFilterProps {
  id: string;
  /** Use the layered fallback instead of feMorphology. */
  layered: boolean;
}

export default function SwellFilter({ id, layered }: SwellFilterProps) {
  return (
    <filter
      id={id}
      x={REGION.x}
      y={REGION.y}
      width={REGION.w}
      height={REGION.h}
      colorInterpolationFilters="sRGB"
    >
      {layered ? (
        // No feMorphology: blur wide, then push the alpha back up so the soft
        // edge re-solidifies into a fattened shape. Cheaper on WebKit and
        // visually close enough at these radii.
        <>
          <feGaussianBlur
            id={`${id}-spread`}
            in="SourceGraphic"
            stdDeviation="0.01"
            result="spread"
          />
          <feComponentTransfer in="spread" result="body">
            <feFuncA type="linear" slope={CFG.fallbackGain * CFG.bodyOpacity} />
          </feComponentTransfer>
        </>
      ) : (
        <>
          <feMorphology
            id={`${id}-dilate`}
            in="SourceGraphic"
            operator="dilate"
            radius="0.01"
            result="fat"
          />
          <feGaussianBlur
            id={`${id}-bodyblur`}
            in="fat"
            stdDeviation="0.01"
            result="soft"
          />
          <feComponentTransfer in="soft" result="body">
            <feFuncA type="linear" slope={CFG.bodyOpacity} />
          </feComponentTransfer>
        </>
      )}

      {/* the tighter, brighter core along the original stroke path */}
      <feGaussianBlur
        id={`${id}-coreblur`}
        in="SourceGraphic"
        stdDeviation="0.01"
        result="coreSoft"
      />
      <feComponentTransfer in="coreSoft" result="core">
        <feFuncA type="linear" slope={CFG.coreOpacity} />
      </feComponentTransfer>

      <feMerge result="merged">
        <feMergeNode in="body" />
        <feMergeNode in="core" />
      </feMerge>

      {/* overall level: dim haze at the start, full once crisp */}
      <feComponentTransfer in="merged">
        <feFuncA id={`${id}-out`} type="linear" slope="1" />
      </feComponentTransfer>
    </filter>
  );
}
