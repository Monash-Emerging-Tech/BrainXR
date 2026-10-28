import * as THREE from "three";
import React, { useRef, Suspense } from "react";
import { useThree } from "@react-three/fiber";
import EEGHead from "../eegHead";
import XRConsole from "../XRConsole";
import BrainModel from "../story/BrainModel";
import { STORY_V2 } from "../story-v2/storyContentV2";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { useXRDragInteraction } from "./useXRDragInteraction";
import { useHeadPlacement } from "./useHeadPlacement";
import { resolveHeadPosition } from "./spatialCollision";
import { headsetPresentation, type HeadsetPresentationStage } from "../../utils/headsetPresentation";
import { OnboardingBrainRig } from "../onboarding/OnboardingBrainStage";

const BRAIN_FIT = STORY_V2.act3.brainFit;

interface HeadWrapperProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  hoveredChannel?: ElectrodeName | null;
  highlightPrefrontal?: boolean;
  presentationStage?: HeadsetPresentationStage;
  onChannelSelect: (name: ElectrodeName) => void;
  onChannelHover?: (name: ElectrodeName | null) => void;
  onStartDemo?: () => void;
  onStartLive?: () => void;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  onExitXR?: () => void;
  speed?: number;
  isPaused?: boolean;
  audioError?: boolean;
}

const HeadWrapper: React.FC<HeadWrapperProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  hoveredChannel,
  highlightPrefrontal = false,
  presentationStage = "interactive",
  onChannelSelect,
  onChannelHover,
  onStartDemo,
  onStartLive,
  onTrialSelect,
  onTogglePlayPause,
  onSetSpeed,
  onExitXR,
  speed = 1,
  isPaused = false,
  audioError = false,
}) => {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const panelPositionRef = useRef(new THREE.Vector3(0, 0.82, -1.05));
  const panelRotationRef = useRef(
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 6, 0, 0))
  );

  const { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerMove } =
    useXRDragInteraction({
      gl,
      groupRef,
      initialPosition: [0, 1.3, -1.1],
      initialRotation: [0, 0, 0],
      constrainPosition: (targetPos, targetQuat) => {
        resolveHeadPosition(targetPos, targetQuat, panelPositionRef.current, panelRotationRef.current);
      },
    });

  useHeadPlacement({
    groupRef,
    frameRef,
    isDraggingRef,
    xrPositionRef,
    xrRotationRef,
    selectedChannel,
    highlightPrefrontal,
    presentationStage,
  });

  const handleExitXR = () => {
    onExitXR?.() || gl.xr.getSession()?.end();
  };

  const isStoryActive = headsetPresentation.getStoryProgress() !== null;
  const showBrain = !isStoryActive && (presentationStage === "prefrontal" || highlightPrefrontal);

  return (
    <group>
      <group onPointerMove={handlePointerMove}>
        <EEGHead
          ref={groupRef}
          frameRef={frameRef}
          selectedChannel={selectedChannel}
          hoveredChannel={hoveredChannel}
          highlightPrefrontal={highlightPrefrontal || presentationStage === "prefrontal"}
          highlightAllElectrodes={presentationStage === "electrodes"}
          onChannelSelect={onChannelSelect}
          onChannelHover={onChannelHover}
        >
          {showBrain && (
            <group
              position={[BRAIN_FIT.x, BRAIN_FIT.y, BRAIN_FIT.z]}
              scale={BRAIN_FIT.scale}
            >
              <Suspense fallback={null}>
                <BrainModel
                  activeIndex={4}
                  prefrontal={true}
                  pulse={true}
                  reducedMotion={false}
                />
              </Suspense>
            </group>
          )}
        </EEGHead>
      </group>

      {/* Render the onboarding brain in the exact same 3D scene for true physical depth buffer testing */}
      <OnboardingBrainRig />

      {/* Render 3D Spatial Dashboard in WebXR Mode only */}
      <XRConsole
        frameRef={frameRef}
        historiesRef={historiesRef}
        selectedChannel={selectedChannel}
        hoveredChannel={hoveredChannel}
        onChannelSelect={onChannelSelect}
        onChannelHover={onChannelHover}
        onStartDemo={onStartDemo}
        onStartLive={onStartLive}
        onTrialSelect={onTrialSelect}
        onTogglePlayPause={onTogglePlayPause}
        onSetSpeed={onSetSpeed}
        onExitXR={handleExitXR}
        speed={speed}
        isPaused={isPaused}
        audioError={audioError}
        headPositionRef={xrPositionRef}
        headRotationRef={xrRotationRef}
        panelPositionRef={panelPositionRef}
        panelRotationRef={panelRotationRef}
      />
    </group>
  );
};

export default HeadWrapper;

