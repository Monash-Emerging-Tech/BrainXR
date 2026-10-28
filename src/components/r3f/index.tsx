// Composition root: wires the playback engine to the mode-derived layout and
// renders whichever panels/overlays that layout calls for.
import React, { useState, Suspense, lazy, useCallback, useRef, useSyncExternalStore, useEffect } from "react";
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
import OnboardingFlow from "../onboarding/OnboardingFlow";

const StoryIntroV2 = lazy(() => import("../story-v2/StoryIntroV2"));
const StoryIntro = lazy(() => import("../story/StoryIntro"));

const Scene = lazy(() => import("../Scene"));

// sessionStorage flag so the story only plays once per browser session --
// skipping or finishing it keeps you on the idle screen on refresh/back-nav
// within the same tab session. Clear sessionStorage (or open a new tab) to
// see it again.
const STORY_SEEN_KEY = "brainxr:story-seen";

function resolveLegacyStoryVersion(): "v1" | "v2" | null {
  if (typeof window === "undefined") return null;
  const asked = new URLSearchParams(window.location.search).get("story");
  return asked === "v1" || asked === "v2" ? asked : null;
}

interface R3FProps {
  initialMode?: "idle" | "demo";
  forcePage?: "home" | "demo" | "onboarding";
}

const R3F: React.FC<R3FProps> = ({ initialMode = "idle", forcePage }) => {
  const engine = usePlaybackEngine({ kind: initialMode });
  const [hoveredChannel, setHoveredChannel] = useState<ElectrodeName | null>(null);
  const [highlightPrefrontal, setHighlightPrefrontal] = useState(false);
  const [headsetOpacity, setHeadsetOpacity] = useState(1);
  const [homeFadeOpacity, setHomeFadeOpacity] = useState(1);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const lastRewindRef = useRef<{ trial: number; time: number } | null>(null);
  const isIdle = engine.mode.kind === "idle";
  const [legacyStoryVersion] = useState(resolveLegacyStoryVersion);
  const [showStory, setShowStory] = useState(() => {
    if (forcePage === "onboarding") return true;
    if (forcePage === "home" || forcePage === "demo") return false;
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("story") === "0" || urlParams.get("skipStory") === "1") return false;
    if (urlParams.has("story") || urlParams.has("onboarding") || window.location.pathname.startsWith("/onboarding")) return true;
    const seen = sessionStorage.getItem(STORY_SEEN_KEY);
    return !seen;
  });

  // Keep story visibility synchronized with browser history back/forward
  useEffect(() => {
    const onPopState = () => {
      const isStory =
        window.location.pathname.startsWith("/onboarding") ||
        new URLSearchParams(window.location.search).has("story") ||
        new URLSearchParams(window.location.search).has("onboarding");
      setShowStory(isStory);
      if (isStory) setHeadsetOpacity(1);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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

  const handleStoryDone = useCallback(() => {
    sessionStorage.setItem(STORY_SEEN_KEY, "1");
    setShowStory(false);
    setTheme("light");
    setHeadsetOpacity(1);
    headsetPresentation.setStage("showcase");
    headsetPresentation.setStoryProgress(null);
    setHighlightPrefrontal(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/onboarding")) {
        window.history.replaceState(null, "", "/");
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("story");
        url.searchParams.delete("onboarding");
        window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
      }
    }
  }, []);

  const startStory = useCallback(() => {
    setHeadsetOpacity(1);
    setTheme("light");
    headsetPresentation.setStage("showcase");
    headsetPresentation.setStoryProgress(0);
    setHighlightPrefrontal(false);
    setShowStory(true);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/onboarding");
    }
  }, []);

  useSpacebarToggle(engine.togglePlayPause);

  if (showStory && legacyStoryVersion) {
    return legacyStoryVersion === "v2" ? (
      <Suspense fallback={<div className="w-full h-full bg-white" />}>
        <StoryIntroV2 onComplete={handleStoryDone} />
      </Suspense>
    ) : (
      <StoryIntro onComplete={handleStoryDone} />
    );
  }

  return (
    <div className={`w-full h-full flex flex-col md:flex-row relative ${theme === "dark" ? "bg-[#0b0f17] text-slate-200" : "bg-white text-slate-800"} transition-colors duration-700 overflow-hidden font-sans`}>
      <BackgroundOscilloscopes
        historiesRef={engine.historiesRef}
        frameRef={engine.frameRef}
        selectedChannel={engine.selectedChannel}
        highlightedChannels={highlightPrefrontal ? PREFRONTAL_ELECTRODES : []}
        hoveredChannel={hoveredChannel}
        theme={theme}
        hideLabels={showStory && homeFadeOpacity < 0.5}
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
        {isIdle && (
          <div
            className="transition-opacity duration-300 pointer-events-none"
            style={{ opacity: showStory ? homeFadeOpacity : 1 }}
          >
            <IdleHeadline variant="solid" onStartStory={startStory} />
          </div>
        )}

        {/* 3D R3F Canvas */}
        <div
          className={`w-full h-full z-10 will-change-opacity transition-opacity duration-300 ${
            isIdle ? "translate-y-8" : ""
          }`}
          style={{ opacity: showStory ? headsetOpacity : 1 }}
        >
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
        {isIdle && (
          <div
            className="transition-opacity duration-300"
            style={{
              opacity: showStory ? homeFadeOpacity : 1,
              pointerEvents: showStory && homeFadeOpacity < 0.5 ? "none" : "auto",
            }}
          >
            <IdleHeadline variant="outline" onStartStory={startStory} />
          </div>
        )}

        {isIdle && (
          <div
            className="transition-opacity duration-300 z-45"
            style={{
              opacity: showStory ? homeFadeOpacity : 1,
              pointerEvents: showStory && homeFadeOpacity < 0.5 ? "none" : "auto",
            }}
          >
            <IdleActions
              onStartDemo={startDemo}
              onStartLive={engine.startLive}
              onStartStory={startStory}
            />
          </div>
        )}

        {/* Unified Continuous Onboarding Flow */}
        {showStory && !legacyStoryVersion && (
          <OnboardingFlow
            onComplete={handleStoryDone}
            onHomeFade={setHomeFadeOpacity}
            onHeadsetOpacity={setHeadsetOpacity}
            onHighlightPrefrontal={setHighlightPrefrontal}
            onSetPresentationStage={headsetPresentation.setStage}
            onThemeChange={setTheme}
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