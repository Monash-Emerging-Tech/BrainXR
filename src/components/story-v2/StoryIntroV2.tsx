import { useEffect, useMemo, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import Brain3D from "../story/Brain3D";
import { BRAIN_REGIONS, STORY_PACING } from "../story/storyContent";
import "./storyV2.css";
import DebugHud from "./DebugHud";
import SceneBeat from "./SceneBeat";
import SceneOpening from "./SceneOpening";
import ScrollCursorTag from "./ScrollCursorTag";
import useSceneRunner from "./useSceneRunner";
import {
  debugHudEnabled,
  FIRST_BEAT_SCENE,
  SCENES,
  STORY_V2,
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
 * v1 is untouched and still reachable with ?story=v1.
 */

const TB = STORY_V2.toBlack;
const BRAIN = STORY_PACING.brain;

export interface StoryIntroV2Props {
  onComplete: () => void;
}

export default function StoryIntroV2({ onComplete }: StoryIntroV2Props) {
  const reducedMotion = useReducedMotion();
  const skipRef = useRef<HTMLButtonElement>(null);
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

  const isNarrow = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
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

  // ---- scene 2 runs in three stages, not one ----
  //
  // THE BUG THIS FIXES: the reveal used to be keyed to the brain MOUNTING,
  // which happened the instant scene 2 began -- so the 4s brain reveal ran
  // concurrently with the 4s white-to-black and the brain was visible
  // through the whole transition. There was no black hold at all.
  //
  // Now the brain stays mounted but fully hidden (visibility: hidden, so
  // the compositor paints nothing) until the black hold has elapsed.
  const [brainStage, setBrainStage] = useState<"hidden" | "armed" | "revealed">(
    "hidden",
  );

  useEffect(() => {
    if (!showBrain) {
      setBrainStage("hidden");
      return;
    }
    if (index > TO_BLACK_SCENE || reducedMotion) {
      // Arriving from a later scene, or reduced motion: no staging.
      setBrainStage("revealed");
      return;
    }
    const revealAt = TB.fadeMs + TB.blackHoldMs;
    const arm = setTimeout(() => {
      setBrainStage("armed");
      // One frame at the hidden state, or the CSS transition has nothing
      // to move from and the reveal snaps.
      requestAnimationFrame(() => setBrainStage("revealed"));
    }, revealAt);
    return () => clearTimeout(arm);
  }, [showBrain, index, reducedMotion]);

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
          remounts the WebGL canvas or re-fetches the model. */}
      {showBrain && (
        <div
          className={`storyv2-brain ${brainStage === "hidden" ? "is-hidden" : ""} ${
            brainStage === "revealed" ? "is-revealed" : ""
          }`}
          style={
            {
              "--v2-brain-ms": `${TB.brainRevealMs}ms`,
              "--v2-brain-scale": String(TB.brainStartScale),
              "--v2-brain-blur": `${TB.brainStartBlurPx}px`,
            } as React.CSSProperties
          }
        >
          <Brain3D
            regions={BRAIN_REGIONS}
            activeIndex={brainIndex}
            prefrontal={inFinale}
            pulse={pulse}
            reducedMotion={reducedMotion}
            scale={
              isNarrow ? BRAIN.viewportHeightRatioMobile : BRAIN.viewportHeightRatioDesktop
            }
            offsetY={isNarrow ? BRAIN.offsetYMobile : 0}
          />
        </div>
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
          <SceneBeat beatIndex={beatIndex} reducedMotion={reducedMotion} />
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
