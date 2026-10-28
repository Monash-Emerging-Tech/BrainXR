import { useEffect, useId, useMemo, useRef } from "react";
import SwellFilter, {
  applySwell,
  prefersLayeredSwell,
  swellParams,
} from "../story/SwellFilter";
import { STORY_V2 } from "./storyContentV2";

/**
 * Body copy for a beat: real sans text, NO particles.
 *
 * THE ARCHITECTURE THIS REPLACES. Every line of a beat used to be assembled
 * out of sampled pixels under a `maxParticles` cap -- so a two-sentence
 * paragraph was rebuilt from a budget of dots and arrived as unreadable
 * fragments. A region NAME is short and can carry a particle formation; a
 * paragraph cannot, and does not need to. Here the text is simply text.
 *
 * It arrives instead through the same inverse swell-blur the question used:
 * dim and swollen, the word shapes only just readable, tightening into
 * crisp type -- plus a gentle rise, staggered a line at a time.
 *
 * THE LINES ARE OURS, NOT THE BROWSER'S. Each one is measured and broken
 * here rather than left to wrap, for two reasons: the stagger needs a line
 * to be an addressable element, and the swell filter needs its own instance
 * per line because each is at a different progress. Letting the browser wrap
 * would give neither.
 */

const CFG = STORY_V2.beats;
const T = STORY_V2.text;

export interface BeatBodyProps {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  /** Column width in CSS px. Lines are broken to fit it. */
  width: number;
  /** Bumped per beat, so the reveal restarts. */
  revealKey: number;
  reducedMotion?: boolean;
  className?: string;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Greedy word wrap against the real measured width of the real face. */
function wrapLines(text: string, font: string, size: number, maxPx: number): string[] {
  if (typeof document === "undefined") return [text];
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || maxPx <= 0) return [text];
  ctx.font = `400 ${size}px ${font}`;

  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxPx) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

export default function BeatBody({
  text,
  font,
  fontSize,
  color,
  width,
  revealKey,
  reducedMotion = false,
  className = "",
}: BeatBodyProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const layered = useMemo(() => prefersLayeredSwell(), []);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const lines = useMemo(
    () => wrapLines(text, font, fontSize, width),
    [text, font, fontSize, width],
  );

  useEffect(() => {
    const els = lineRefs.current;
    if (reducedMotion) {
      els.forEach((el) => {
        if (!el) return;
        el.style.opacity = String(T.bodyOpacity);
        el.style.transform = "";
        el.style.filter = "";
      });
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const ms = now - start;
      let allDone = true;

      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const p = clamp01((ms - i * CFG.bodyLineStaggerMs) / CFG.bodyRevealMs);
        const e = easeOutCubic(p);
        el.style.opacity = String(T.bodyOpacity * e);
        el.style.transform =
          p < 1 ? `translateY(${(1 - e) * CFG.bodyRisePx}px)` : "";

        if (p < 1) {
          allDone = false;
          // One filter instance per line: they are at different progresses,
          // so they cannot share one.
          applySwell(`${uid}-${i}`, swellParams(p, fontSize), layered);
          el.style.filter = `url(#${uid}-${i})`;
        } else {
          // Dropped the moment it lands. An SVG filter left on static text
          // keeps a layer alive for nothing.
          el.style.filter = "";
        }
      }

      if (allDone) return;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lines, revealKey, reducedMotion, fontSize, layered, uid]);

  return (
    <p
      className={`storyv2-body ${className}`}
      style={{
        color,
        fontFamily: font,
        fontSize,
        lineHeight: T.bodyLineHeight,
      }}
    >
      <svg className="story-filter-defs" aria-hidden="true">
        <defs>
          {lines.map((_, i) => (
            <SwellFilter key={i} id={`${uid}-${i}`} layered={layered} />
          ))}
        </defs>
      </svg>

      {lines.map((line, i) => (
        <span
          key={i}
          ref={(el) => {
            lineRefs.current[i] = el;
          }}
          className="storyv2-body-line"
          style={{ opacity: reducedMotion ? T.bodyOpacity : 0 }}
        >
          {line}
        </span>
      ))}
    </p>
  );
}
