// Composition root: wires the playback engine to the mode-derived layout and
// renders whichever panels/overlays that layout calls for.
import React, { useState, Suspense, lazy } from "react";
import { usePlaybackEngine } from "../../hooks/usePlaybackEngine";
import type { ElectrodeName } from "../../utils/signalSource";
import { IdleHeadline, IdleActions } from "../IdleSplash";
import BackgroundOscilloscopes from "../BackgroundOscilloscopes";
import { useSpacebarToggle } from "./useSpacebarToggle";
import AudioErrorToast from "./AudioErrorToast";
import TopHudBar from "./TopHudBar";
import LoadingOverlay from "./LoadingOverlay";
import DemoBottomControls from "./DemoBottomControls";
import StoryIntro from "../story/StoryIntro";

const Scene = lazy(() => import("../Scene"));

// sessionStorage flag so the story only plays once per browser session --
// skipping or finishing it keeps you on the idle screen on refresh/back-nav
// within the same tab session. Clear sessionStorage (or open a new tab) to
// see it again.
const STORY_SEEN_KEY = "brainxr:story-seen";

const R3F: React.FC = () => {
  const engine = usePlaybackEngine();
  const [hoveredChannel, setHoveredChannel] = useState<ElectrodeName | null>(null);
  const isIdle = engine.mode.kind === "idle";
  const [showStory, setShowStory] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORY_SEEN_KEY) !== "1";
  });

  useSpacebarToggle(engine.togglePlayPause);

  if (showStory) {
    return (
      <StoryIntro
        onComplete={() => {
          sessionStorage.setItem(STORY_SEEN_KEY, "1");
          setShowStory(false);
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-white overflow-hidden text-slate-800 font-sans">
      <BackgroundOscilloscopes
        historiesRef={engine.historiesRef}
        frameRef={engine.frameRef}
        selectedChannel={engine.selectedChannel}
        hoveredChannel={hoveredChannel}
      />

      {/* ======================================================== */}
      {/* 3D VIEWPORT: CENTER SECTION                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col relative bg-transparent">
        {engine.audioError && <AudioErrorToast />}
        {!isIdle && <TopHudBar engine={engine} />}

        {/* Layer 1: Solid Text Behind the Headset */}
        {isIdle && <IdleHeadline variant="solid" />}

        {/* 3D R3F Canvas */}
        <div className="w-full h-full z-10">
          <Suspense fallback={null}>
            <Scene
              frameRef={engine.frameRef}
              historiesRef={engine.historiesRef}
              selectedChannel={engine.selectedChannel}
              hoveredChannel={hoveredChannel}
              onChannelSelect={engine.selectChannel}
              onChannelHover={setHoveredChannel}
              onStartDemo={engine.startDemo}
              onStartLive={engine.startLive}
              onTrialSelect={engine.selectTrial}
              onTogglePlayPause={engine.togglePlayPause}
              onSetSpeed={engine.setSpeed}
              speed={engine.speed}
              isPaused={engine.isPaused}
              audioError={engine.audioError}
            />
          </Suspense>
        </div>

        {engine.isLoading && <LoadingOverlay />}

        {/* Layer 3: Outline Text In Front of the Headset */}
        {isIdle && <IdleHeadline variant="outline" />}

        {/* ======================================================== */}
        {/* HOMEPAGE IDLE INTERFACE                                  */}
        {/* ======================================================== */}
        {isIdle && <IdleActions onStartDemo={engine.startDemo} onStartLive={engine.startLive} />}

        {engine.mode.kind === "demo" && (
          <DemoBottomControls frame={engine.frame} onTrialSelect={engine.selectTrial} />
        )}
      </div>
    </div>
  );
};

export default R3F;