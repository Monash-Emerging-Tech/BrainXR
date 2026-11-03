// 3D scene composition: Canvas, lighting rig, WebXR wrapper, orbit controls,
// and the digital twin itself.
//
// Reads the live frame through a ref and is wrapped in React.memo: the 20 Hz
// playback tick updates the HUD via state without re-rendering (and having
// three.js reconcile) this whole subtree. The head animates off its own
// useFrame loop reading frameRef.current.
import React, { useSyncExternalStore, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { XR } from "@react-three/xr";
import HeadWrapper from "./HeadWrapper";
import { xrStore } from "../utils/xrStore";
import type { ElectrodeName, Frame } from "../utils/signalSource";
import type { HistorySample } from "../hooks/usePlaybackEngine";
import { headsetPresentation, type HeadsetPresentationStage } from "../utils/headsetPresentation";
import { AimlabsScene, aimlabsStore } from "./AimlabsCognitiveTest";

// OrbitControls is a sibling of <XR>, not nested inside it, so the
// context-based useXR() hook isn't reachable here - read presentation
// state straight off the store instead.
function useIsXRPresenting(): boolean {
  return useSyncExternalStore(
    xrStore.subscribe,
    () => xrStore.getState().session != null,
    () => false
  );
}

interface SceneProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  hoveredChannel?: ElectrodeName | null;
  highlightPrefrontal?: boolean;
  presentationStage?: HeadsetPresentationStage;
  onChannelSelect: (name: ElectrodeName) => void;
  onChannelHover?: (name: ElectrodeName | null) => void;
  onClearSelection?: () => void;
  onStartDemo?: () => void;
  onStartLive?: () => void;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  speed?: number;
  isPaused?: boolean;
  audioError?: boolean;
}

function SpringOrbitControls({ enabled = true }: { enabled?: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetDistanceRef = useRef<number | null>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Capture resting camera distance from the initial controls target
    targetDistanceRef.current = controls.object.position.distanceTo(controls.target);

    const onStart = () => {
      isInteractingRef.current = true;
    };
    const onEnd = () => {
      isInteractingRef.current = false;
    };

    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);
    return () => {
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
    };
  }, []);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    const baseDistance = targetDistanceRef.current;
    if (!controls || !baseDistance) return;

    // When the user is not actively zooming/dragging, spring back to the default zoom distance
    if (!isInteractingRef.current && enabled) {
      const currentDist = controls.object.position.distanceTo(controls.target);
      const diff = baseDistance - currentDist;
      if (Math.abs(diff) > 0.001) {
        // Smooth critically damped exponential decay towards target distance
        const t = 1 - Math.exp(-6 * Math.min(delta, 0.1));
        const newDist = currentDist + diff * t;
        const scale = newDist / currentDist;

        controls.object.position.x = controls.target.x + (controls.object.position.x - controls.target.x) * scale;
        controls.object.position.y = controls.target.y + (controls.object.position.y - controls.target.y) * scale;
        controls.object.position.z = controls.target.z + (controls.object.position.z - controls.target.z) * scale;
        controls.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={20}
      enabled={enabled}
      makeDefault
    />
  );
}

const Scene: React.FC<SceneProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  hoveredChannel,
  highlightPrefrontal = false,
  presentationStage = "interactive",
  onChannelSelect,
  onChannelHover,
  onClearSelection,
  onStartDemo,
  onStartLive,
  onTrialSelect,
  onTogglePlayPause,
  onSetSpeed,
  speed,
  isPaused,
  audioError = false,
}) => {
  const isXRPresenting = useIsXRPresenting();
  const isStoryActive = headsetPresentation.getStoryProgress() !== null;
  const aimlabsState = useSyncExternalStore(
    aimlabsStore.subscribe,
    aimlabsStore.getSnapshot,
    aimlabsStore.getServerSnapshot
  );

  const handleExitAimlabs = () => {
    aimlabsStore.exit();
    xrStore.getState().session?.end();
  };

  return (
    <Canvas
      dpr={[1, 1.5]}
      onPointerMissed={onClearSelection}
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      style={{ background: "transparent", cursor: hoveredChannel ? "pointer" : "grab" }}
      gl={{ alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={Math.PI / 1.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={Math.PI}
      />
      <pointLight position={[-10, 10, -5]} intensity={Math.PI / 2} />
      <pointLight position={[0, -10, 0]} intensity={Math.PI / 2} />

      <XR store={xrStore}>
        {aimlabsState.isActive ? (
          <AimlabsScene
            state={aimlabsState}
            isXR={isXRPresenting}
            onExit={handleExitAimlabs}
          />
        ) : (
          <HeadWrapper
            frameRef={frameRef}
            historiesRef={historiesRef}
            selectedChannel={selectedChannel}
            hoveredChannel={hoveredChannel}
            highlightPrefrontal={highlightPrefrontal}
            presentationStage={presentationStage}
            onChannelSelect={onChannelSelect}
            onChannelHover={onChannelHover}
            onStartDemo={onStartDemo}
            onStartLive={onStartLive}
            onTrialSelect={onTrialSelect}
            onTogglePlayPause={onTogglePlayPause}
            onSetSpeed={onSetSpeed}
            speed={speed}
            isPaused={isPaused}
            audioError={audioError}
          />
        )}
      </XR>

      {!isXRPresenting && !aimlabsState.isActive && <SpringOrbitControls enabled={!isStoryActive} />}
    </Canvas>
  );
};

export default React.memo(Scene);
