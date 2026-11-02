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
import { launchExperience } from "../../utils/webxrDetector";
import { aimlabsStore, AimlabsOverlay } from "../AimlabsCognitiveTest";

const StoryIntroV2 = lazy(() => import("../story-v2/StoryIntroV2"));
const StoryIntro = lazy(() => import("../story/StoryIntro"));

const Scene = lazy(() => import("../Scene"));

// sessionStorage flag so the story only plays once per browser session --
// skipping or finishing it keeps you on the idle screen on refresh/back-nav
// within the same tab session. Clear sessionStorage (or open a new tab) to
// see it again.
const STORY_SEEN_KEY = "brainxr:story-seen";
const CONNECT_HEADSET_KEY = "brainxr:connect-headset";

function resolveLegacyStoryVersion(): "v1" | "v2" | null {
  if (typeof window === "undefined") return null;
  const asked = new URLSearchParams(window.location.search).get("story");
  return asked === "v1" || asked === "v2" ? asked : null;
}

interface R3FProps {
  initialMode?: "idle" | "demo";
  forcePage?: "home" | "demo" | "onboarding" | "intensity" | "direction";
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
  const [isHeadsetConnected, setIsHeadsetConnected] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(CONNECT_HEADSET_KEY) === "1";
  });
  const [showStory, setShowStory] = useState(() => {
    if (forcePage === "onboarding") return true;
    if (forcePage === "home" || forcePage === "demo" || forcePage === "intensity" || forcePage === "direction") return false;
    if (typeof window === "undefined") return false;
    if (window.location.pathname.startsWith("/onboarding")) return true;
    if (window.location.pathname.startsWith("/intensity") || window.location.pathname.startsWith("/direction") || window.location.pathname.startsWith("/demo")) return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("story") === "0" || urlParams.get("skipStory") === "1") return false;
    const seen = sessionStorage.getItem(STORY_SEEN_KEY);
    return !seen;
  });

  const [hasRoutedToOnboarding, setHasRoutedToOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith("/onboarding");
  });

  // Keep story visibility synchronized with browser history back/forward
  useEffect(() => {
    const onPopState = () => {
      const isStory = window.location.pathname.startsWith("/onboarding");
      setShowStory(isStory);
      setHasRoutedToOnboarding(isStory);
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

  const aimlabsState = useSyncExternalStore(
    aimlabsStore.subscribe,
    aimlabsStore.getSnapshot,
    aimlabsStore.getServerSnapshot
  );

  const cancelOnboarding = useCallback(() => {
    sessionStorage.setItem(STORY_SEEN_KEY, "1");
    setShowStory(false);
    setHasRoutedToOnboarding(false);
    setTheme("light");
    setHeadsetOpacity(1);
    setHomeFadeOpacity(1);
    headsetPresentation.setStage("showcase");
    headsetPresentation.setStoryProgress(null);
    setHighlightPrefrontal(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/onboarding")) {
        window.history.replaceState(null, "", "/");
      }
    }
  }, []);

  const handleRouteToOnboarding = useCallback(() => {
    setHasRoutedToOnboarding(true);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/onboarding")) {
      window.history.pushState(null, "", "/onboarding");
    }
  }, []);

  // Global Escape key cancels onboarding before (or during) routing to /onboarding
  useEffect(() => {
    if (!showStory) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        cancelOnboarding();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showStory, cancelOnboarding]);

  const handleEnterVR = useCallback(() => {
    if (showStory) cancelOnboarding();
    launchExperience({
      onStartXR: () => {
        aimlabsStore.launch(true);
      },
      onStartDesktop: () => {
        aimlabsStore.launch(false);
      },
    });
  }, [showStory, cancelOnboarding]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDirectionRoute = forcePage === "direction" || window.location.pathname.startsWith("/direction");
    const params = new URLSearchParams(window.location.search);
    if (isDirectionRoute || params.has("aimlabs") || params.has("test") || params.has("cpt")) {
      handleEnterVR();
    }
  }, [forcePage, handleEnterVR]);

  const selectChannel = useCallback((channel: ElectrodeName) => {
    if (showStory) cancelOnboarding();
    // A guided group highlight is only context for that guided step. Once the
    // visitor chooses any individual node, the inspection follows that node.
    setHighlightPrefrontal(false);
    if (engine.selectedChannel === channel) {
      engine.selectChannel(null);
      return;
    }
    engine.selectChannel(channel);
  }, [showStory, cancelOnboarding, engine.selectedChannel, engine.selectChannel]);

  const startDemo = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/intensity";
    }
  }, []);

  const startLive = useCallback(() => {
    if (showStory) cancelOnboarding();
    engine.startLive();
  }, [showStory, cancelOnboarding, engine.startLive]);

  const toggleConnectHeadset = useCallback(() => {
    setIsHeadsetConnected((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        if (next) {
          localStorage.setItem(CONNECT_HEADSET_KEY, "1");
        } else {
          localStorage.removeItem(CONNECT_HEADSET_KEY);
        }
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setHighlightPrefrontal(false);
    setHoveredChannel(null);
    engine.selectChannel(null);
  }, [engine.selectChannel]);

  const disconnect = useCallback(() => {
    clearSelection();
    engine.disconnect();
    if (typeof window !== "undefined" && (window.location.pathname.startsWith("/demo") || window.location.pathname.startsWith("/intensity") || window.location.pathname.startsWith("/direction"))) {
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

  const handleStoryDone = cancelOnboarding;

  const startStory = useCallback(() => {
    setHeadsetOpacity(1);
    setTheme("light");
    setHomeFadeOpacity(1);
    setHasRoutedToOnboarding(false);
    headsetPresentation.setStage("showcase");
    headsetPresentation.setStoryProgress(null);
    setHighlightPrefrontal(false);
    setShowStory(true);
  }, []);

  useSpacebarToggle(engine.togglePlayPause, !aimlabsState.isActive);

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
        {!isIdle && !aimlabsState.isActive && (
          <TopHudBar
            engine={engine}
            onBack={disconnect}
            focusSensorsActive={highlightPrefrontal}
            onShowPrefrontal={togglePrefrontal}
          />
        )}



        {/* Layer 1: Solid Text Behind the Headset */}
        {isIdle && !aimlabsState.isActive && (
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
            isIdle && !aimlabsState.isActive ? "translate-y-8" : ""
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
              onStartLive={startLive}
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
        {isIdle && !aimlabsState.isActive && (
          <div
            className="transition-opacity duration-300 z-45"
            style={{
              opacity: showStory ? homeFadeOpacity : 1,
              pointerEvents: showStory && homeFadeOpacity < 0.5 ? "none" : "auto",
            }}
          >
            <IdleHeadline variant="outline" onStartStory={startStory} />
          </div>
        )}

        {isIdle && !aimlabsState.isActive && (
          <div
            className="transition-opacity duration-300 z-45"
            style={{
              opacity: showStory ? homeFadeOpacity : 1,
              pointerEvents: showStory && homeFadeOpacity < 0.5 ? "none" : "auto",
            }}
          >
            <IdleActions
              onStartDemo={startDemo}
              onStartLive={startLive}
              onStartStory={startStory}
              onEnterVR={handleEnterVR}
              isHeadsetConnected={isHeadsetConnected}
              onToggleConnectHeadset={toggleConnectHeadset}
            />
          </div>
        )}

        {/* Unified Continuous Onboarding Flow */}
        {showStory && !legacyStoryVersion && !aimlabsState.isActive && (
          <OnboardingFlow
            onComplete={cancelOnboarding}
            onRouteToOnboarding={handleRouteToOnboarding}
            onInterrupt={cancelOnboarding}
            hasRoutedToOnboarding={hasRoutedToOnboarding}
            onHomeFade={setHomeFadeOpacity}
            onHeadsetOpacity={setHeadsetOpacity}
            onHighlightPrefrontal={setHighlightPrefrontal}
            onSetPresentationStage={headsetPresentation.setStage}
            onThemeChange={setTheme}
          />
        )}

        {/* Aimlabs Cognitive Assessment Overlay (2D HUD & Modals) */}
        <AimlabsOverlay
          state={aimlabsState}
          onExit={() => {
            aimlabsStore.exit();
            if (typeof window !== "undefined" && window.location.pathname.startsWith("/direction")) {
              window.location.href = "/";
            }
          }}
        />

        {engine.mode.kind === "demo" && !aimlabsState.isActive && (
          <>
            {/* Guidance signifier & node details: permanently positioned at the top below the HUD / audio toast */}
            <div
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-30 select-none text-center px-4 w-full max-w-[52rem] flex flex-col items-center ${
                engine.audioError ? "top-36" : "top-24"
              }`}
            >
              <span className="eeg-node-gradient-text font-mono text-[11px] md:text-xs font-black uppercase tracking-[0.22em] leading-relaxed drop-shadow-sm whitespace-nowrap">
                pinch and click nodes to explore what EEG headsets do
              </span>

              {/* Rubber stamp badge & recording audio text: displayed if "Connect your headset" is unticked on the homescreen and no node is selected */}
              {!isHeadsetConnected && !engine.selectedChannel && !highlightPrefrontal && (
                <div className="mt-10 flex flex-col items-center pointer-events-none select-none">
                  <span className="stamp-demo-badge text-xl sm:text-2xl md:text-3xl">
                    SIMULATED DEMO
                  </span>
                  <span className="mt-8 text-red-700/80 font-serif italic text-sm sm:text-base tracking-wide max-w-lg leading-relaxed text-center drop-shadow-xs">
                    EEG recording for participant listening to audio file video-{String((engine.frame.trialIndex ?? 0) + 1).padStart(2, "0")}.m4a
                  </span>
                </div>
              )}

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