import { useEffect, useMemo, useRef, useState } from "react";
import { measureTextInk } from "./pixelGridV2";
import { STORY_V2 } from "./storyContentV2";

/**
 * "FOCUS??" as seen without your glasses.
 *
 * Every layer is a REAL OffBit <text>, the same word drawn by the browser
 * several times and offset vertically at falling opacity. It used to be
 * stacks of sampled pixel rects, which meant every ghost inherited the
 * sampler's dropped strokes and the word was hard to read for the wrong
 * reason. Now it is hard to read for the RIGHT one: the copies are perfect,
 * they just will not sit still.
 *
 * The offsets BREATHE -- drifting closer, then apart -- and never reach
 * zero, so it never snaps into focus. That is the point of the beat: the
 * question is about focus and the word refuses to give you any.
 *
 * The box is the TIGHT ink box, so `align-items: center` centres the word
 * on its real width rather than on a canvas far wider than the text.
 *
 * Spread and opacity are driven by setAttribute from one rAF, not by React
 * state: a per-frame prop would reconcile every layer sixty times a second.
 */

const CFG = STORY_V2.doubleVision;

export interface DoubleVisionTextProps {
  text: string;
  font: string;
  fontSize: number;
  fontWeight?: number;
  color: string;
  /** Live 0..1 entrance, as a REF so this never re-renders per frame. */
  enterRef: React.RefObject<number>;
  reducedMotion?: boolean;
  className?: string;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function DoubleVisionText({
  text,
  font,
  fontSize,
  fontWeight = 400,
  color,
  enterRef,
  reducedMotion = false,
  className = "",
}: DoubleVisionTextProps) {
  const [fontsReady, setFontsReady] = useState(false);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);

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

  const ink = useMemo(
    () => (fontsReady ? measureTextInk(text, font, fontSize, fontWeight) : null),
    [fontsReady, text, font, fontSize, fontWeight],
  );

  // Ghost 0 is the main copy; the rest fan out above and below it.
  const ghosts = useMemo(() => {
    const n = Math.max(2, CFG.ghostCount);
    return Array.from({ length: n }, (_, i) => ({
      dir: i === 0 ? 0 : (i % 2 === 1 ? -1 : 1) * Math.ceil(i / 2),
      opacity: i === 0 ? 1 : CFG.ghostOpacity / Math.ceil(i / 2),
    }));
  }, []);

  useEffect(() => {
    if (!ink || reducedMotion) return;
    let raf = 0;
    const start = performance.now();
    const size = ink.fontSize;

    const tick = (now: number) => {
      const enter = clamp01(enterRef.current ?? 0);
      const eased = easeOutCubic(enter);
      // The word is MOUNTED as soon as line 1 starts forming, so the column
      // reserves its slot and line 1 does not jump upward when FOCUS??
      // finally arrives. `appear` is what keeps it invisible until then --
      // and turns what was a hard pop at full opacity into a quick fade
      // over the first fifth of the entrance.
      const appear = clamp01(enter / 0.2);
      // Breathe between min and max -- never to zero.
      const phase = ((now - start) / CFG.breatheMs) * Math.PI * 2;
      const breath = 0.5 - 0.5 * Math.cos(phase);
      const settled = CFG.minSpread + (CFG.maxSpread - CFG.minSpread) * breath;
      const spread = (CFG.entranceSpread + (settled - CFG.entranceSpread) * eased) * size;

      groupRefs.current.forEach((g, i) => {
        if (!g) return;
        const ghost = ghosts[i];
        g.setAttribute("transform", `translate(0 ${(ghost.dir * spread).toFixed(2)})`);
        g.setAttribute(
          "opacity",
          String(ghost.opacity * (i === 0 ? 1 : 0.25 + 0.75 * eased) * appear),
        );
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ink, ghosts, reducedMotion, enterRef]);

  if (!ink) return <div className={className} style={{ height: fontSize }} />;

  // Room above and below for the ghosts at full ENTRANCE spread, which is
  // far wider than where they settle.
  const maxDir = Math.max(1, Math.ceil((ghosts.length - 1) / 2));
  const pad = Math.ceil(CFG.entranceSpread * ink.fontSize * maxDir) + 8;
  const w = ink.width;
  const h = ink.height + pad * 2;

  // How far the ghosts actually reach once settled. Everything past that is
  // entrance headroom: it must exist in the BOX, or the ghosts clip, but it
  // must not exist in the LAYOUT, or the column centres on empty space and
  // the whole question sits high on the screen. So the surplus is pulled
  // back out with negative margins and the resting halo is what the flex
  // column measures.
  const restReach = Math.ceil(CFG.maxSpread * ink.fontSize * maxDir);
  const pull = Math.max(0, pad - restReach);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: w,
        height: h,
        marginTop: -pull,
        marginBottom: -pull,
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 ${-pad} ${w} ${h}`}
        style={{ display: "block", overflow: "visible" }}
        role="img"
        aria-label={text}
      >
        {ghosts.map((ghost, i) => (
          <g
            key={i}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            opacity={reducedMotion ? ghost.opacity : 0}
            transform={
              reducedMotion
                ? `translate(0 ${ghost.dir * CFG.minSpread * ink.fontSize})`
                : undefined
            }
          >
            <text
              x={ink.originX}
              y={ink.originY}
              fill={color}
              fontFamily={font}
              fontSize={ink.fontSize}
              fontWeight={fontWeight}
              style={{ whiteSpace: "pre" }}
            >
              {text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
