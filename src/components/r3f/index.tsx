// Composition root: wires the playback engine to the mode-derived layout and
// renders whichever panels/overlays that layout calls for.
import React, { useState, Suspense, lazy, useCallback, useRef, useSyncExternalStore } from "react";
import { usePlaybackEngine } from "../../hooks/usePlaybackEngine";
import { PREFRONTAL_ELECTRODES, type ElectrodeName } from "../../utils/signalSource";
import { IdleHeadline, IdleActions } from "../IdleSplash";
import BackgroundOscilloscopes from "../BackgroundOscilloscopes";
import { useSpacebarToggle } from "./useSpacebarToggle";
import AudioErrorToast from "./AudioErrorToast";
import TopHudBar from "./TopHudBar";
import LoadingOverlay from "./LoadingOverlay";
import DemoBottomControls from "./DemoBottomControls";
import NodeDetailsBanner from "./NodeDetailsBanner";
import { headsetPresentation } from "../../utils/headsetPresentation";

const StoryIntroV2 = lazy(() => import("../story-v2/StoryIntroV2"));
const StoryIntro = lazy(() => import("../story/StoryIntro"));

const Scene = lazy(() => import("../Scene"));

// sessionStorage flag so the story only plays once per browser session --
// skipping or finishing it keeps you on the idle screen on refresh/back-nav
// within the same tab session. Clear sessionStorage (or open a new tab) to
// see it again.
const STORY_SEEN_KEY = "brainxr:story-seen";

// Which cut of the intro plays. v1 is the long scroll-driven version; v2
// plays one scene per scroll gesture. Override per-load with ?story=v1 or
// ?story=v2 to compare the two without editing this file.
const STORY_VERSION: "v1" | "v2" = "v2";

function resolveStoryVersion(): "v1" | "v2" {
  if (typeof window === "undefined") return STORY_VERSION;
  const asked = new URLSearchParams(window.location.search).get("story");
  return asked === "v1" || asked === "v2" ? asked : STORY_VERSION;
}

interface R3FProps {
  initialMode?: "idle" | "demo";
  forcePage?: "home" | "demo" | "onboarding";
}

const R3F: React.FC<R3FProps> = ({ initialMode = "idle", forcePage }) => {
  const engine = usePlaybackEngine({ kind: initialMode });
  const [hoveredChannel, setHoveredChannel] = useState<ElectrodeName | null>(null);
  const [highlightPrefrontal, setHighlightPrefrontal] = useState(false);
  const lastRewindRef = useRef<{ trial: number; time: number } | null>(null);
  const isIdle = engine.mode.kind === "idle";
  const [storyVersion] = useState(resolveStoryVersion);
  const [showStory, setShowStory] = useState(() => {
    if (forcePage === "onboarding") return true;
    if (forcePage === "home" || forcePage === "demo") return false;
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("story") === "0" || urlParams.get("skipStory") === "1") return false;
    if (urlParams.has("story")) return true;
    return false;
  });

  const storyStage = useSyncExternalStore(
    headsetPresentation.subscribe,
    headsetPresentation.getSnapshot,
    headsetPresentation.getServerSnapshot
  );
  const presentationStage = isIdle ? storyStage : "interactive";

  const selectChannel = useCallback((channel: ElectrodeName) => {
    // A guided group highlight is only context for that guided step. Once the
    // visitor chooses any individual node, the inspection follows that node.
    setHighlightPrefrontal(false);
    if (engine.selectedChannel === channel) {
      engine.selectChannel(null);
      return;
    }
    if (isIdle) engine.startDemo();
    engine.selectChannel(channel);
  }, [engine.selectedChannel, engine.selectChannel, engine.startDemo, isIdle]);

  const startDemo = useCallback(() => {
    setHighlightPrefrontal(false);
    engine.selectChannel(null);
    engine.startDemo();
  }, [engine.selectChannel, engine.startDemo]);

  const clearSelection = useCallback(() => {
    setHighlightPrefrontal(false);
    setHoveredChannel(null);
    engine.selectChannel(null);
  }, [engine.selectChannel]);

  const disconnect = useCallback(() => {
    clearSelection();
    engine.disconnect();
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/demo")) {
      window.location.href = "/";
    }
  }, [clearSelection, engine.disconnect]);

  const previousTrack = useCallback(() => {
    const trialIndex = engine.frame.trialIndex ?? 0;
    const now = performance.now();
    const previous = lastRewindRef.current;
    const isSecondPress = previous?.trial === trialIndex && now - previous.time < 1400;
    engine.selectTrial(isSecondPress ? Math.max(0, trialIndex - 1) : trialIndex, 0);
    lastRewindRef.current = isSecondPress ? null : { trial: trialIndex, time: now };
  }, [engine.frame.trialIndex, engine.selectTrial]);

  const nextTrack = useCallback(() => {
    lastRewindRef.current = null;
    engine.selectTrial(Math.min((engine.frame.totalTrials ?? 40) - 1, (engine.frame.trialIndex ?? 0) + 1), 0);
  }, [engine.frame.totalTrials, engine.frame.trialIndex, engine.selectTrial]);

  const togglePrefrontal = useCallback(() => {
    setHoveredChannel(null);
    engine.selectChannel(null);
    setHighlightPrefrontal((prev) => !prev);
  }, [engine.selectChannel]);

  useSpacebarToggle(engine.togglePlayPause);

  if (showStory) {
    const done = () => {
      sessionStorage.setItem(STORY_SEEN_KEY, "1");
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/onboarding")) {
        window.location.href = "/";
      } else {
        setShowStory(false);
      }
    };
    return storyVersion === "v2" ? (
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <StoryIntroV2 onComplete={done} />
      </Suspense>
    ) : (
      <StoryIntro onComplete={done} />
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-white overflow-hidden text-slate-800 font-sans">
      <BackgroundOscilloscopes
        historiesRef={engine.historiesRef}
        frameRef={engine.frameRef}
        selectedChannel={engine.selectedChannel}
        highlightedChannels={highlightPrefrontal ? PREFRONTAL_ELECTRODES : []}
        hoveredChannel={hoveredChannel}
        onSelectChannel={selectChannel}
        onHoverChannel={setHoveredChannel}
      />

      {/* ======================================================== */}
      {/* 3D VIEWPORT: CENTER SECTION                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col relative bg-transparent">
        {engine.audioError && <AudioErrorToast />}
        {!isIdle && (
          <TopHudBar
            engine={engine}
            onBack={disconnect}
            focusSensorsActive={highlightPrefrontal}
            onShowPrefrontal={togglePrefrontal}
          />
        )}



        {/* Layer 1: Solid Text Behind the Headset */}
        {isIdle && <IdleHeadline variant="solid" />}

        {/* 3D R3F Canvas */}
        <div className={`w-full h-full z-10 ${isIdle ? "translate-y-8" : ""}`}>
          <Suspense fallback={null}>
            <Scene
              frameRef={engine.frameRef}
              historiesRef={engine.historiesRef}
              selectedChannel={engine.selectedChannel}
              hoveredChannel={hoveredChannel}
              highlightPrefrontal={highlightPrefrontal}
              presentationStage={presentationStage}
              onChannelSelect={selectChannel}
              onChannelHover={setHoveredChannel}
              onClearSelection={clearSelection}
              onStartDemo={startDemo}
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

        {isIdle && (
          <IdleActions
            onStartDemo={startDemo}
            onStartLive={engine.startLive}
            onStartStory={() => setShowStory(true)}
          />
        )}

        {engine.mode.kind === "demo" && (
          <>
            {/* Animated guidance signifier & node details: floats above bottom controls when unfocused, moves below audio unavailable toast when a node is clicked */}
            <div
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-30 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none text-center px-4 w-full max-w-[52rem] flex flex-col items-center ${
                Boolean(engine.selectedChannel || highlightPrefrontal)
                  ? engine.audioError
                    ? "top-32"
                    : "top-20"
                  : "bottom-32"
              }`}
            >
              <span className="eeg-node-gradient-text font-mono text-[11px] md:text-xs font-black uppercase tracking-[0.22em] leading-relaxed drop-shadow-sm whitespace-nowrap">
                pinch and click nodes to explore what EEG headsets do
              </span>

              {Boolean(engine.selectedChannel || highlightPrefrontal) && (
                <NodeDetailsBanner
                  channel={engine.selectedChannel}
                  isPrefrontalGroup={highlightPrefrontal}
                  frame={engine.frame}
                  onSelectChannel={selectChannel}
                />
              )}
            </div>

            <DemoBottomControls
              frame={engine.frame}
              onTrialSelect={engine.selectTrial}
              isPaused={engine.isPaused}
              onTogglePlayPause={engine.togglePlayPause}
              onPrevious={previousTrack}
              onNext={nextTrack}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default R3F;