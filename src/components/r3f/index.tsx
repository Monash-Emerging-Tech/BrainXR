// Composition root: wires the playback engine to the mode-derived layout and
// renders whichever panels/overlays that layout calls for.
import React, { useState, Suspense, lazy, useCallback, useRef, useSyncExternalStore } from "react";
import { usePlaybackEngine } from "../../hooks/usePlaybackEngine";
import type { ElectrodeName } from "../../utils/signalSource";
import { IdleHeadline, IdleActions } from "../IdleSplash";
import NodeExplorer from "../NodeExplorer";
import BackgroundOscilloscopes from "../BackgroundOscilloscopes";
import { useSpacebarToggle } from "./useSpacebarToggle";
import AudioErrorToast from "./AudioErrorToast";
import TopHudBar from "./TopHudBar";
import LoadingOverlay from "./LoadingOverlay";
import DemoBottomControls from "./DemoBottomControls";
import { xrStore } from "../../utils/xrStore";
import { headsetPresentation } from "../../utils/headsetPresentation";

const Scene = lazy(() => import("../Scene"));

function useIsXRPresenting(): boolean {
  return useSyncExternalStore(
    xrStore.subscribe,
    () => xrStore.getState().session != null,
    () => false
  );
}

const R3F: React.FC = () => {
  const engine = usePlaybackEngine();
  const [hoveredChannel, setHoveredChannel] = useState<ElectrodeName | null>(null);
  const [highlightPrefrontal, setHighlightPrefrontal] = useState(false);
  const lastRewindRef = useRef<{ trial: number; time: number } | null>(null);
  const isIdle = engine.mode.kind === "idle";
  const isXRPresenting = useIsXRPresenting();
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
    if (isIdle) engine.startDemo();
    engine.selectChannel(channel);
  }, [engine.selectChannel, engine.startDemo, isIdle]);

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

  const showPrefrontal = useCallback(() => {
    setHighlightPrefrontal(true);
    engine.selectChannel("FpZ");
  }, [engine.selectChannel]);

  useSpacebarToggle(engine.togglePlayPause);

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
        {!isIdle && <TopHudBar engine={engine} onBack={disconnect} showExplorerActions={engine.selectedChannel == null} onShowPrefrontal={showPrefrontal} />}

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

        {!isXRPresenting && <NodeExplorer
          isIdle={isIdle}
          selectedChannel={engine.selectedChannel}
          hoveredChannel={hoveredChannel}
          frame={engine.frame}
          onSelectChannel={engine.selectChannel}
          highlightPrefrontal={highlightPrefrontal}
          onHighlightPrefrontal={setHighlightPrefrontal}
        />}

        {/* Layer 3: Outline Text In Front of the Headset */}
        {isIdle && <IdleHeadline variant="outline" />}

        {/* ======================================================== */}
        {/* HOMEPAGE IDLE INTERFACE                                  */}
        {/* ======================================================== */}
        {isIdle && <IdleActions onStartDemo={startDemo} onStartLive={engine.startLive} />}

        {engine.mode.kind === "demo" && (
          <DemoBottomControls
            frame={engine.frame}
            onTrialSelect={engine.selectTrial}
            isPaused={engine.isPaused}
            onTogglePlayPause={engine.togglePlayPause}
            onPrevious={previousTrack}
            onNext={nextTrack}
          />
        )}
      </div>
    </div>
  );
};

export default R3F;
