import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import Brain3D from "./Brain3D";
import PixelText from "./PixelText";
import {
  ACT2,
  BRAIN_REGIONS,
  FINALE_BEATS,
  MODEL_CREDIT,
  STORY_PACING,
  type BrainRegionId,
} from "./storyContent";

/**
 * ACT 2 -- the tour of the brain.
 *
 * Opens out of Act 1's black: a smoke-bomb burst fires at centre, billows
 * outward and thins as the reader scrolls, and the 3D brain resolves from
 * inside it. From there each region gets a scroll segment. Changing region
 * fires a window-pane sweep across the TEXT COLUMN ONLY -- the brain is
 * never covered, so the rotation stays visible underneath.
 *
 * Sweep choreography, per change:
 *   0ms            pane starts, brain begins rotating, old pixels fall
 *   PANE_PASS_MS   pane's trailing edge clears the text, new text assembles
 *   PANE_MS        pane is gone
 *
 * Direction never enters into it: the machine keys off "the index changed",
 * so scrubbing backwards behaves exactly like scrubbing forwards.
 */

export type Act2Phase = "reveal" | BrainRegionId | "finaleA" | "finaleB" | "closing";

/**
 * Panels, in order: the five regions, then the two prefrontal finale beats,
 * then the closing line. The finale beats hold the frontal pose and reuse
 * the same sweep and pixel text as a region.
 */
const FINALE_A = BRAIN_REGIONS.length;
const FINALE_B = BRAIN_REGIONS.length + 1;

interface Act2Props {
  phases: Record<Act2Phase, number>;
  reducedMotion: boolean;
}

const PANE_MS = 1050;
const PANE_PASS_MS = 480;
/** Reduced-motion swap: same shape, no pane, just a crossfade's worth of wait. */
const CROSSFADE_MS = 300;
/** Index used for the closing line, after the two finale beats. */
const CLOSING = BRAIN_REGIONS.length + 2;
/** The frontal lobe stays lit for the whole finale. */
const FRONTAL = BRAIN_REGIONS.length - 1;

const SMOKE = STORY_PACING.smoke;
const BRAIN = STORY_PACING.brain;

/** Act 2 runs on black; these are the on-black text colours. */
const BODY_COLOR = "#e2e8f0";

const span = (t: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (t - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// The brain only cares about the active region, so keep scroll re-renders
// from walking the whole R3F tree.
const MemoBrain = memo(Brain3D);

/** Tracks the mobile breakpoint, so the brain can be sized and lifted. */
function useIsNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setNarrow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return narrow;
}

/** Measures an element's content width, for sizing the pixel canvas. */
function useElementWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.round(w));
    });
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export default function Act2({ phases, reducedMotion }: Act2Props) {
  const textAreaRef = useRef<HTMLDivElement>(null);
  const textWidth = useElementWidth(textAreaRef);
  const isNarrow = useIsNarrow();

  // Which region the scroll position points at.
  let target = 0;
  for (let i = 0; i < BRAIN_REGIONS.length; i++) {
    if (phases[BRAIN_REGIONS[i].id] > 0) target = i;
  }
  if (phases.finaleA > 0) target = FINALE_A;
  if (phases.finaleB > 0) target = FINALE_B;
  if (phases.closing > 0) target = CLOSING;

  // Which one is actually on screen -- lags `target` by the pane pass.
  const [shown, setShown] = useState(0);
  const [mode, setMode] = useState<"in" | "out">("in");
  // Bumped per sweep so the pane element remounts and its CSS animation
  // restarts cleanly even if the previous sweep was still running.
  const [sweepKey, setSweepKey] = useState(0);
  const [sweeping, setSweeping] = useState(false);

  useEffect(() => {
    if (shown === target) return;

    // Reduced motion still needs the out -> in beat, otherwise the text
    // hard-cuts instead of crossfading. It just loses the pane.
    if (reducedMotion) {
      setMode("out");
      const swap = setTimeout(() => {
        setShown(target);
        setMode("in");
      }, CROSSFADE_MS);
      return () => clearTimeout(swap);
    }

    setSweeping(true);
    setSweepKey((k) => k + 1);
    setMode("out");

    const swap = setTimeout(() => {
      setShown(target);
      setMode("in");
    }, PANE_PASS_MS);

    // Cleanup runs on every re-target, so a fast scrub cancels the pending
    // swap instead of queueing a second one. That is what keeps text from
    // getting stuck mid-fall or doubling up.
    return () => clearTimeout(swap);
  }, [target, shown, reducedMotion]);

  // Retiring the pane lives in its own effect on purpose. Folded into the
  // one above, the swap's setShown re-runs that effect, whose cleanup then
  // cancels the very timer meant to clear `sweeping` -- leaving the pane
  // mounted forever.
  useEffect(() => {
    if (!sweeping) return;
    const done = setTimeout(() => setSweeping(false), PANE_MS);
    return () => clearTimeout(done);
  }, [sweepKey, sweeping]);

  const activeRegion = BRAIN_REGIONS[Math.min(shown, BRAIN_REGIONS.length - 1)];
  const showingRegion = shown < BRAIN_REGIONS.length;
  const showingFinale = shown === FINALE_A || shown === FINALE_B;
  const showingClosing = shown === CLOSING;
  const finaleBeat = shown === FINALE_A ? FINALE_BEATS[0] : FINALE_BEATS[1];

  // The finale holds the frontal pose: brain head-on, other lobes dimmed,
  // only the front of the frontal lobe lit. Beat B adds the slow pulse.
  const inFinale = target >= FINALE_A;
  const brainIndex = inFinale ? FRONTAL : Math.min(target, BRAIN_REGIONS.length - 1);

  // -- reveal. Act 1 hands over a solid black screen and Act 2 STAYS black.
  //
  // The rise is time-based and starts as soon as Act 2 mounts; only the
  // clearing is scrolled. The old 3s pause before it is gone -- the "landed"
  // checkpoint now provides that beat.
  const reveal = phases.reveal;

  const [rise, setRise] = useState(reducedMotion ? 1 : 0);
  const riseSettled = useRef(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (riseSettled.current) return;
      const elapsed = now - start;
      const t = Math.min(1, Math.max(0, elapsed / SMOKE.riseMs));
      setRise(t);
      if (t >= 1) {
        riseSettled.current = true;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // Scroll is never hijacked. If the reader moves on before the smoke has
  // finished rising, snap it to its end state rather than holding them up.
  useEffect(() => {
    if (riseSettled.current || reveal < SMOKE.fastForwardAt) return;
    riseSettled.current = true;
    setRise(1);
  }, [reveal]);

  // Scroll then drives the clear: smoke thins and drifts, brain rises out.
  const clear = span(reveal, SMOKE.fastForwardAt, 1);
  const brainOpacity = span(clear, 0.1, 0.72);
  const brainRevealScale = lerp(SMOKE.brainStartScale, 1, easeOut(span(clear, 0.05, 0.85)));
  const brainBlur = lerp(SMOKE.brainStartBlur, 0, span(clear, 0.1, 0.8));

  const smokeRise = reducedMotion ? undefined : rise;
  const flatMist = reducedMotion ? span(reveal, 0, 0.35) * (1 - span(reveal, 0.35, 1)) : 0;

  return (
    <div className="story-act2-stage">
      {/* glossy black glass, pure CSS, behind the transparent Canvas */}
      <div className="story-glass" aria-hidden="true">
        <span className="story-glass-gloss" />
      </div>

      <div
        className="story-brain"
        style={{
          opacity: brainOpacity,
          transform: `scale(${brainRevealScale})`,
          filter: brainBlur > 0.05 ? `blur(${brainBlur}px)` : undefined,
        }}
      >
        <MemoBrain
          regions={BRAIN_REGIONS}
          activeIndex={brainIndex}
          prefrontal={inFinale}
          pulse={target === FINALE_B}
          reducedMotion={reducedMotion}
          opacity={1}
          smokeRise={smokeRise}
          smokeClear={clear}
          scale={isNarrow ? BRAIN.viewportHeightRatioMobile : BRAIN.viewportHeightRatioDesktop}
          offsetY={isNarrow ? BRAIN.offsetYMobile : 0}
        />
      </div>

      {/* text column: the only thing the pane ever covers */}
      <div className={`story-text-area ${showingClosing ? "is-closing" : ""}`}>
        <div className="story-text-clip">
          <div ref={textAreaRef} className="story-text-inner">
            {textWidth > 0 && showingRegion && (
              <>
                <PixelText
                  key={`${activeRegion.id}-label`}
                  text={activeRegion.label}
                  mode={mode}
                  font={ACT2.labelFont}
                  fontSize={20}
                  fontWeight={ACT2.labelWeight}
                  color={activeRegion.color}
                  width={textWidth}
                  cellSize={3}
                  maxParticles={420}
                  reducedMotion={reducedMotion}
                  className="story-pixel-label"
                />
                <PixelText
                  key={`${activeRegion.id}-role`}
                  text={`\u00b7 ${activeRegion.role}`}
                  mode={mode}
                  font={ACT2.bodyFont}
                  fontSize={14}
                  fontWeight={ACT2.bodyWeight}
                  color={activeRegion.color}
                  width={textWidth}
                  cellSize={3}
                  maxParticles={360}
                  reducedMotion={reducedMotion}
                  className="story-pixel-role"
                />
                <PixelText
                  key={`${activeRegion.id}-body`}
                  text={activeRegion.sentence}
                  mode={mode}
                  font={ACT2.bodyFont}
                  fontSize={17}
                  fontWeight={ACT2.bodyWeight}
                  color={BODY_COLOR}
                  width={textWidth}
                  cellSize={3}
                  maxParticles={1200}
                  reducedMotion={reducedMotion}
                />
              </>
            )}

            {textWidth > 0 && showingFinale && (
              <PixelText
                key={finaleBeat.id}
                text={finaleBeat.sentence}
                mode={mode}
                font={ACT2.bodyFont}
                fontSize={19}
                fontWeight={ACT2.bodyWeight}
                color={BODY_COLOR}
                width={textWidth}
                cellSize={3}
                maxParticles={1200}
                reducedMotion={reducedMotion}
              />
            )}

            {textWidth > 0 && showingClosing && (
              <PixelText
                key="closing"
                text={ACT2.closingLine}
                mode={mode}
                font={ACT2.bodyFont}
                fontSize={24}
                fontWeight={ACT2.bodyWeight}
                color={BODY_COLOR}
                width={textWidth}
                cellSize={3}
                maxParticles={900}
                reducedMotion={reducedMotion}
              />
            )}
          </div>

          {/* the window pane, clipped to the text column */}
          {sweeping && !reducedMotion && (
            <div key={sweepKey} className="story-pane" aria-hidden="true">
              <span className="story-pane-streak" />
            </div>
          )}
        </div>
      </div>

      {/* region dots */}
      <div className="story-dots" aria-hidden="true">
        {BRAIN_REGIONS.map((r, i) => (
          <span
            key={r.id}
            className={`story-dot ${
              i === Math.min(target, BRAIN_REGIONS.length - 1) ? "is-active" : ""
            }`}
          />
        ))}
      </div>

      {/* CC BY 4.0 attribution for the brain model. */}
      <div className="story-credit">
        <a href={MODEL_CREDIT.modelUrl} target="_blank" rel="noopener noreferrer">
          {MODEL_CREDIT.text}
        </a>
        <a href={MODEL_CREDIT.licenseUrl} target="_blank" rel="noopener noreferrer">
          licence
        </a>
      </div>

      {/* reduced motion: a flat mist crossfade in place of the burst */}
      {reducedMotion && (
        <div className="story-reveal-mist" style={{ opacity: flatMist }} aria-hidden="true" />
      )}
    </div>
  );
}
