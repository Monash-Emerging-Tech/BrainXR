import { useEffect, useMemo, useRef, useState } from "react";
import SwellFilter, { prefersLayeredSwell } from "../story/SwellFilter";
import { ACT2, BRAIN_REGIONS, MODEL_CREDIT } from "../story/storyContent";
import BeatBody from "./BeatBody";
import CellPixelText from "./CellPixelText";
import { BEAT_PANELS, BODY_COLOR, STORY_V2 } from "./storyContentV2";
import type { StageLayout } from "./useStageLayout";

/**
 * Scenes 3+: one beat per scroll.
 *
 * THE TEXT IS REAL TEXT. Each piece gets the treatment it can actually
 * carry, rather than all three being rebuilt out of capped particle budgets:
 *
 *   NAME     OffBit in the region's colour. Particles jitter in their
 *            cells, converge onto the glyphs, and hand over to real OffBit
 *            underneath as they fade -- the question line's treatment,
 *            reused wholesale.
 *   ROLE     small OffBit, real text, a simple fade a beat after the name.
 *   BODY     sans, no particles at all, revealed with the inverse
 *            swell-blur and a staggered rise. See BeatBody.
 *
 * The closing line is a headline, so it takes the NAME treatment.
 *
 * LAYOUT comes from useStageLayout, the same solve that places the brain,
 * so the column can never be printed over it.
 *
 * This component PERSISTS across every beat. If each beat mounted its own
 * instance the outgoing text would vanish instead of leaving, and the sweep
 * would have nothing to hide.
 */

const CFG = STORY_V2.beats;
const T = STORY_V2.text;

export interface SceneBeatProps {
  /** Index into BEAT_PANELS. */
  beatIndex: number;
  layout: StageLayout;
  reducedMotion: boolean;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export default function SceneBeat({
  beatIndex,
  layout,
  reducedMotion,
}: SceneBeatProps) {
  const layered = useMemo(() => prefersLayeredSwell(), []);

  const [shown, setShown] = useState(beatIndex);
  const [leaving, setLeaving] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);
  const [revealKey, setRevealKey] = useState(0);

  // Live values for the name's particle formation and its swell overlay.
  const nameRef = useRef(0);
  const nameSwellRef = useRef(0);
  const roleElRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (shown === beatIndex) return;

    if (reducedMotion) {
      setLeaving(true);
      const swap = setTimeout(() => {
        setShown(beatIndex);
        setLeaving(false);
        setRevealKey((k) => k + 1);
      }, CFG.crossfadeMs);
      return () => clearTimeout(swap);
    }

    // The pane sweeps; the outgoing text leaves under its leading edge, and
    // the incoming text only starts forming once it has passed.
    setSweeping(true);
    setSweepKey((k) => k + 1);
    setLeaving(true);
    const swap = setTimeout(() => {
      setShown(beatIndex);
      setLeaving(false);
      setRevealKey((k) => k + 1);
    }, CFG.panePassMs);
    return () => clearTimeout(swap);
  }, [beatIndex, shown, reducedMotion]);

  // Retiring the pane lives in its own effect: folded into the swap above,
  // the swap's setShown re-runs that effect and its cleanup kills the very
  // timer meant to clear `sweeping`.
  useEffect(() => {
    if (!sweeping) return;
    const done = setTimeout(() => setSweeping(false), CFG.paneMs);
    return () => clearTimeout(done);
  }, [sweepKey, sweeping]);

  // One rAF drives the name's formation and the role tag's fade. Both are
  // written to refs and inline styles, so a beat costs a handful of renders
  // rather than one per frame.
  useEffect(() => {
    if (reducedMotion) {
      nameRef.current = 1;
      nameSwellRef.current = 1;
      if (roleElRef.current) roleElRef.current.style.opacity = "1";
      return;
    }
    nameRef.current = 0;
    nameSwellRef.current = 0;
    if (roleElRef.current) roleElRef.current.style.opacity = "0";

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const ms = now - start;
      nameRef.current = clamp01(ms / CFG.nameFormMs);
      nameSwellRef.current = clamp01(ms / CFG.nameSwellMs);

      const role = roleElRef.current;
      if (role) {
        const p = clamp01((ms - CFG.roleDelayMs) / CFG.roleFadeMs);
        role.style.opacity = String(p);
        role.style.transform = p < 1 ? `translateY(${(1 - p) * 6}px)` : "";
      }

      if (ms > CFG.nameFormMs + CFG.roleDelayMs + CFG.roleFadeMs) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [revealKey, shown, reducedMotion]);

  const panel = BEAT_PANELS[Math.min(shown, BEAT_PANELS.length - 1)];
  const isRegion = panel.kind === "region";
  const isClosing = panel.kind === "closing";
  const activeDot = Math.min(panel.regionIndex, BRAIN_REGIONS.length - 1);

  return (
    <div className="storyv2-scene storyv2-beats">
      <svg className="story-filter-defs" aria-hidden="true">
        <defs>
          <SwellFilter id="storyV2SwellName" layered={layered} />
        </defs>
      </svg>

      <div
        className={`storyv2-textcol ${layout.portrait ? "is-portrait" : ""}`}
        style={{
          left: layout.textLeft,
          top: layout.textTop,
          width: layout.textWidth,
        }}
      >
        {/* The pane is clipped to this box, which is why it can never reach
            the brain however far it travels. */}
        <div className="storyv2-textclip">
          <div className={`storyv2-textinner ${leaving ? "is-leaving" : ""}`}>
            {isRegion && (
              <>
                <CellPixelText
                  key={`${shown}-name`}
                  text={panel.label ?? ""}
                  font={ACT2.labelFont}
                  fontSize={layout.namePx}
                  fontWeight={ACT2.labelWeight}
                  color={panel.color}
                  progressRef={nameRef}
                  swellRef={nameSwellRef}
                  swellId="storyV2SwellName"
                  reducedMotion={reducedMotion}
                  className="storyv2-beat-name"
                />
                <span
                  ref={roleElRef}
                  className="storyv2-beat-role"
                  style={{ color: panel.color, fontSize: T.rolePx }}
                >
                  {panel.role}
                </span>
              </>
            )}

            {isClosing ? (
              // Short, and a headline: it earns the particle treatment.
              <CellPixelText
                key={`${shown}-closing`}
                text={panel.sentence}
                font={ACT2.labelFont}
                fontSize={layout.closingPx}
                fontWeight={ACT2.labelWeight}
                color={panel.color}
                progressRef={nameRef}
                swellRef={nameSwellRef}
                swellId="storyV2SwellName"
                reducedMotion={reducedMotion}
                className="storyv2-beat-closing"
              />
            ) : (
              <BeatBody
                key={`${shown}-body`}
                text={panel.sentence}
                font={ACT2.bodyFont}
                fontSize={layout.bodyPx}
                color={isRegion ? BODY_COLOR : panel.color}
                width={layout.textWidth}
                revealKey={revealKey}
                reducedMotion={reducedMotion}
              />
            )}
          </div>

          {sweeping && !reducedMotion && (
            <div key={sweepKey} className="storyv2-pane" aria-hidden="true">
              <span className="storyv2-pane-streak" />
            </div>
          )}
        </div>
      </div>

      <div className="story-dots" aria-hidden="true">
        {BRAIN_REGIONS.map((r, i) => (
          <span key={r.id} className={`story-dot ${i === activeDot ? "is-active" : ""}`} />
        ))}
      </div>

      <div className="story-credit">
        <a href={MODEL_CREDIT.modelUrl} target="_blank" rel="noopener noreferrer">
          {MODEL_CREDIT.text}
        </a>
        <a href={MODEL_CREDIT.licenseUrl} target="_blank" rel="noopener noreferrer">
          licence
        </a>
      </div>
    </div>
  );
}
