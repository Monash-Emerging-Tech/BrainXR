import * as THREE from "three";
import React, { useRef, Suspense } from "react";
import { useThree } from "@react-three/fiber";
import EEGHead from "../eegHead";
import BrainModel from "../story/BrainModel";
import { STORY_V2 } from "../story-v2/storyContentV2";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { useXRDragInteraction } from "./useXRDragInteraction";
import { useHeadPlacement } from "./useHeadPlacement";
import { headsetPresentation, type HeadsetPresentationStage } from "../../utils/headsetPresentation";
import { OnboardingBrainRig } from "../onboarding/OnboardingBrainStage";
import { XRNodeDetailsPanel } from "./XRNodeDetailsPanel";

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

const HeadWrapper: React.FC<HeadWrapperProps> = ({
  frameRef,
  selectedChannel,
  hoveredChannel,
  highlightPrefrontal = false,
  presentationStage = "interactive",
  onChannelSelect,
  onChannelHover,
  onClearSelection,
}) => {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerMove, resetToInitial } =
    useXRDragInteraction({
      gl,
      groupRef,
      initialPosition: [0, 1.25, -0.9],
      initialRotation: [0, 0, 0],
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

      {/* Baked high-DPI spatial node details panel & interaction prompt in XR */}
      {gl.xr.isPresenting && (
        <XRNodeDetailsPanel
          channel={selectedChannel}
          frameRef={frameRef}
          onSelectChannel={(ch) => ch ? onChannelSelect(ch) : onClearSelection?.()}
          headPositionRef={xrPositionRef}
        />
      )}
    </group>
  );
};

export default HeadWrapper;
