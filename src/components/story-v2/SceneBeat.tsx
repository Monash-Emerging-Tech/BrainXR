import { useEffect, useRef, useState } from "react";
import PixelText from "../story/PixelText";
import { ACT2, BRAIN_REGIONS, MODEL_CREDIT } from "../story/storyContent";
import { BEAT_PANELS, BODY_COLOR, STORY_V2 } from "./storyContentV2";

/**
 * Scenes 3+: one beat per scroll.
 *
 * Same choreography as v1's Act 2 -- the frosted pane sweeps the text
 * column, the old pixels fall as its leading edge arrives, the new ones
 * assemble once it has passed -- but driven by the scene index instead of a
 * scroll position.
 *
 * This component PERSISTS across every beat. If each beat mounted its own
 * instance the outgoing text would vanish instead of falling, and the sweep
 * would have nothing to hide.
 */

const CFG = STORY_V2.beats;

export interface SceneBeatProps {
  /** Index into BEAT_PANELS. */
  beatIndex: number;
  reducedMotion: boolean;
}

export default function SceneBeat({ beatIndex, reducedMotion }: SceneBeatProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const [shown, setShown] = useState(beatIndex);
  const [mode, setMode] = useState<"in" | "out">("in");
  const [sweeping, setSweeping] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(Math.round(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (shown === beatIndex) return;

    if (reducedMotion) {
      setMode("out");
      const swap = setTimeout(() => {
        setShown(beatIndex);
        setMode("in");
      }, CFG.crossfadeMs);
      return () => clearTimeout(swap);
    }

    setSweeping(true);
    setSweepKey((k) => k + 1);
    setMode("out");
    const swap = setTimeout(() => {
      setShown(beatIndex);
      setMode("in");
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

  const panel = BEAT_PANELS[Math.min(shown, BEAT_PANELS.length - 1)];
  const isRegion = panel.kind === "region";
  const isClosing = panel.kind === "closing";
  const activeDot = Math.min(panel.regionIndex, BRAIN_REGIONS.length - 1);

  return (
    <div className="storyv2-scene storyv2-beats">
      <div className={`story-text-area ${isClosing ? "is-closing" : ""}`}>
        <div className="story-text-clip">
          <div ref={areaRef} className="story-text-inner">
            {width > 0 && isRegion && (
              <>
                <PixelText
                  key={`${shown}-label`}
                  text={panel.label ?? ""}
                  mode={mode}
                  font={ACT2.labelFont}
                  fontSize={20}
                  fontWeight={ACT2.labelWeight}
                  color={panel.color}
                  width={width}
                  cellSize={3}
                  maxParticles={420}
                  reducedMotion={reducedMotion}
                  className="story-pixel-label"
                />
                <PixelText
                  key={`${shown}-role`}
                  text={`· ${panel.role ?? ""}`}
                  mode={mode}
                  font={ACT2.bodyFont}
                  fontSize={14}
                  fontWeight={ACT2.bodyWeight}
                  color={panel.color}
                  width={width}
                  cellSize={3}
                  maxParticles={360}
                  reducedMotion={reducedMotion}
                  className="story-pixel-role"
                />
              </>
            )}

            {width > 0 && (
              <PixelText
                key={`${shown}-body`}
                text={panel.sentence}
                mode={mode}
                font={ACT2.bodyFont}
                fontSize={isClosing ? 24 : isRegion ? 17 : 19}
                fontWeight={ACT2.bodyWeight}
                color={isRegion ? BODY_COLOR : panel.color}
                width={width}
                cellSize={3}
                maxParticles={1200}
                reducedMotion={reducedMotion}
              />
            )}
          </div>

          {sweeping && !reducedMotion && (
            <div key={sweepKey} className="story-pane" aria-hidden="true">
              <span className="story-pane-streak" />
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
