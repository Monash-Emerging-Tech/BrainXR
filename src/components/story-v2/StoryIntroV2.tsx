import { useEffect, useMemo, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import { ACT2, BRAIN_REGIONS } from "../story/storyContent";
import "./storyV2.css";
import BrainStageV2, { type BrainMetrics } from "./BrainStageV2";
import DebugHud from "./DebugHud";
import SmokeShader from "./SmokeShader";
import useStageLayout from "./useStageLayout";
import SceneBeat from "./SceneBeat";
import SceneOpening from "./SceneOpening";
import ScrollCursorTag from "./ScrollCursorTag";
import useSceneRunner from "./useSceneRunner";
import {
  debugHudEnabled,
  FIRST_BEAT_SCENE,
  SCENES,
  STORY_V2,
  TO_BLACK_MARKS,
  TO_BLACK_SCENE,
  V2_COPY,
} from "./storyContentV2";

/**
 * STORY V2 host.
 *
 * The page does not scroll: one gesture plays the next scene in full. This
 * component owns everything that must PERSIST across scenes -- the
 * background, the brain, and the beat panel -- so that crossing a scene
 * boundary never remounts a WebGL canvas or restarts a model load.
 *
 * Scene-2's white-to-black is done with CSS transitions rather than a JS
 * loop: the compositor interpolates the colour, which is both smoother
 * (no banding, no dropped frames) and free of per-frame React renders.
 *
 * SCENE 2 RUNS IN FOUR STAGES, and the brain emerges from INSIDE the smoke
 * rather than beside it -- see the brainStage effect below.
 *
 * v1 is untouched and still reachable with ?story=v1.
 */

const TB = STORY_V2.toBlack;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export interface StoryIntroV2Props {
  onComplete: () => void;
}

export default function StoryIntroV2({ onComplete }: StoryIntroV2Props) {
  const reducedMotion = useReducedMotion();
  const skipRef = useRef<HTMLButtonElement>(null);
  // The model's real proportions, measured once it has loaded, so the
  // layout can size the brain against its actual height rather than a
  // guess. Until then the solve runs on a sane default.
  const [brainFit, setBrainFit] = useState<BrainMetrics | null>(null);
  // The one solve that places BOTH the brain and the text column.
  const layout = useStageLayout(ACT2.bodyFont, brainFit);
  // Dev only: off unless DEBUG_HUD is set or the URL carries ?v2debug=1.
  const showHud = useMemo(() => debugHudEnabled(), []);

  const finish = useMemo(() => {
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("storyv2-active");
      onComplete();
    };
  }, [onComplete]);

  const { index, phase, startedAt, fastForwarded, backEpoch } = useSceneRunner(
    finish,
    reducedMotion,
  );

  // The story owns the viewport: no page scrolling at all while it plays.
  useEffect(() => {
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    // Suppresses the reserved scrollbar gutter v1's checkpoints rely on,
    // which would otherwise leave a blank strip down the side.
    document.documentElement.classList.add("storyv2-active");
    window.scrollTo(0, 0);
    return () => {
      body.style.overflow = prev;
      document.documentElement.classList.remove("storyv2-active");
    };
  }, []);

  // ---- derived scene state; changes once per scene, never per frame ----
  const onBlack = index >= TO_BLACK_SCENE;
  const showBrain = index >= TO_BLACK_SCENE;
  const inBeats = index >= FIRST_BEAT_SCENE;
  const beatIndex = Math.max(0, index - FIRST_BEAT_SCENE);

  // Beats 0..4 are the regions; the finale beats and the closing line all
  // hold the frontal pose.
  const FRONTAL = BRAIN_REGIONS.length - 1;
  const inFinale = inBeats && beatIndex >= BRAIN_REGIONS.length;
  const brainIndex = inFinale ? FRONTAL : Math.min(beatIndex, FRONTAL);
  const pulse = inBeats && beatIndex === BRAIN_REGIONS.length + 1;

  // ---- scene 2 runs in four stages, not one ----
  //
  // THE BUG THIS FIXED: the reveal used to be keyed to the brain MOUNTING,
  // which happened the instant scene 2 began -- so the 4s brain reveal ran
  // concurrently with the 4s white-to-black and the brain was visible
  // through the whole transition. There was no black hold at all.
  //
  //   hidden    visibility: hidden, so the compositor paints NOTHING for it
  //             -- not a low-opacity material. It stays mounted through the
  //             fade and the black hold so the WebGL context and the model
  //             are warm by the time it appears.
  //   armed     one frame at the hidden state. A freshly revealed element
  //             cannot transition from a value it never held.
  //   revealed  the 4s reveal, running UNDERNEATH the smoke.
  //   crisp     the filter and the transform are dropped entirely. A blur
  //             left on a live WebGL canvas keeps an extra layer alive and
  //             resampled for every remaining beat.
  const [brainStage, setBrainStage] = useState<
    "hidden" | "armed" | "revealed" | "crisp"
  >("hidden");

  useEffect(() => {
    if (!showBrain) {
      setBrainStage("hidden");
      return;
    }
    if (index > TO_BLACK_SCENE) {
      // Arriving from a later scene: no staging, it is simply there.
      setBrainStage("crisp");
      return;
    }
    if (reducedMotion) {
      // Reduced motion: no smoke, a plain fade, still after the black hold.
      const t = setTimeout(() => {
        setBrainStage("armed");
        requestAnimationFrame(() => setBrainStage("revealed"));
      }, TB.fadeMs);
      return () => clearTimeout(t);
    }

    const arm = setTimeout(() => {
      setBrainStage("armed");
      requestAnimationFrame(() => setBrainStage("revealed"));
    }, TO_BLACK_MARKS.brainStart);
    // Sharp exactly when the smoke has finished clearing.
    const sharpen = setTimeout(() => setBrainStage("crisp"), TO_BLACK_MARKS.brainEnd);
    return () => {
      clearTimeout(arm);
      clearTimeout(sharpen);
    };
  }, [showBrain, index, reducedMotion]);

  // ---- the white smoke the brain emerges from ----
  //
  // The same shader as scene 1, given a pale colour and an ADDITIVE blend so
  // it glows out of the black rather than laying a grey sheet over it. It is
  // the TOP layer: the brain fading up beneath it is what sells the brain as
  // emerging from inside the cloud rather than appearing next to it.
  //
  // Its clear is timed so it is completely gone at the exact frame the brain
  // becomes crisp -- see TO_BLACK_MARKS, where that is structural.
  const smokeReachRef = useRef(0);
  const smokeDensityRef = useRef(0);
  const [showWhiteSmoke, setShowWhiteSmoke] = useState(false);

  useEffect(() => {
    const live = index === TO_BLACK_SCENE && phase === "playing" && !reducedMotion;
    if (!live || fastForwarded) {
      setShowWhiteSmoke(false);
      smokeReachRef.current = 0;
      smokeDensityRef.current = 0;
      return;
    }

    setShowWhiteSmoke(true);
    let raf = 0;
    const tick = (now: number) => {
      const ms = now - startedAt;
      const since = ms - TO_BLACK_MARKS.smokeStart;

      if (since <= 0) {
        smokeReachRef.current = 0;
        smokeDensityRef.current = 0;
      } else if (since < TB.smokePourMs) {
        const t = since / TB.smokePourMs;
        smokeReachRef.current = t;
        smokeDensityRef.current = clamp01(t * 3.2);
      } else {
        const t = clamp01((since - TB.smokePourMs) / TO_BLACK_MARKS.smokeClearMs);
        smokeReachRef.current = 1 + t * 0.55;
        // Eased rather than linear: the smoke holds its body while the
        // brain is still only a shape inside it, then goes quickly. A
        // linear fade spent most of the reveal as a barely-there haze, so
        // the brain read as appearing NEXT to the smoke rather than out of
        // it. It still reaches exactly zero at t = 1.
        smokeDensityRef.current = 1 - t * t;
      }

      if (ms >= TO_BLACK_MARKS.smokeEnd) {
        smokeDensityRef.current = 0;
        setShowWhiteSmoke(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, phase, startedAt, fastForwarded, reducedMotion]);

  const waiting = phase === "idle";

  return (
    <div
      className={`storyv2-root ${onBlack ? "is-black" : ""}`}
      style={
        {
          "--v2-black-ms": `${TB.fadeMs}ms`,
          "--v2-text-blur": `${TB.textBlurPx}px`,
        } as React.CSSProperties
      }
    >
      {/* First in DOM so it is first in tab order, and a click -- never a
          scroll -- so the input lock can never block it. */}
      <button
        ref={skipRef}
        type="button"
        onClick={finish}
        className="fixed top-5 right-5 z-[100] px-4 py-2 rounded-full bg-slate-900/70 text-white text-xs font-offbit tracking-wide border border-white/25 backdrop-blur-sm hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors cursor-pointer"
      >
        {V2_COPY.skipLabel}
      </button>

      {/* glossy black glass, faded in during scene 2 */}
      <div className="storyv2-glass" aria-hidden="true">
        <div className="story-glass">
          <span className="story-glass-gloss" />
        </div>
      </div>

      {/* The brain persists from scene 2 on, so no scene boundary ever
          remounts the WebGL canvas or re-fetches the model. Its size and
          placement come from the same solve that places the text, so the
          two can never collide. */}
      {showBrain && (
        <div
          className={`storyv2-brain ${brainStage === "hidden" ? "is-hidden" : ""} ${
            brainStage === "revealed" || brainStage === "crisp" ? "is-revealed" : ""
          } ${brainStage === "crisp" ? "is-crisp" : ""}`}
          style={
            {
              "--v2-brain-ms": `${TB.brainRevealMs}ms`,
              "--v2-brain-scale": String(TB.brainStartScale),
              "--v2-brain-blur": `${TB.brainStartBlurPx}px`,
            } as React.CSSProperties
          }
        >
          <BrainStageV2
            layout={layout}
            onMeasured={setBrainFit}
            activeIndex={brainIndex}
            prefrontal={inFinale}
            pulse={pulse}
            reducedMotion={reducedMotion}
            className="storyv2-brain-canvas"
          />
        </div>
      )}

      {/* ...and the smoke sits ON TOP of it, which is the whole trick: the
          brain fading up underneath reads as emerging from inside the
          cloud. It is gone by the time the brain is crisp. */}
      {showWhiteSmoke && (
        <SmokeShader
          className="storyv2-whitesmoke"
          reachRef={smokeReachRef}
          densityRef={smokeDensityRef}
          color={TB.smokeColor}
          maxOpacity={TB.smokeOpacity}
          additive
        />
      )}

      {/* Scenes 0 and 1, kept mounted through scene 2 so the text has
          something to blur away FROM. Mounting a second copy to animate
          out would start it at its end state and snap. */}
      {index <= TO_BLACK_SCENE && (
        <div
          className={`storyv2-layer ${index === TO_BLACK_SCENE ? "storyv2-leaving" : ""}`}
        >
          <SceneOpening
            key={`opening-${backEpoch}`}
            sceneIndex={Math.min(index, 1)}
            playing={phase === "playing" && index === 1}
            startedAt={startedAt}
            fastForwarded={fastForwarded || index === TO_BLACK_SCENE}
            reducedMotion={reducedMotion}
          />
        </div>
      )}

      {/* scenes 3+ */}
      {inBeats && (
        <div className="storyv2-layer">
          <SceneBeat
            beatIndex={beatIndex}
            layout={layout}
            reducedMotion={reducedMotion}
          />
        </div>
      )}

      {showHud && (
        <DebugHud
          index={index}
          phase={phase}
          startedAt={startedAt}
          fastForwarded={fastForwarded}
        />
      )}

      <ScrollCursorTag visible={waiting} avoidRef={skipRef} />

      {/* Announce scene changes for screen readers, which get no animation. */}
      <p className="story-sr-only" aria-live="polite">
        {SCENES[index]?.id}
      </p>
    </div>
  );
}
