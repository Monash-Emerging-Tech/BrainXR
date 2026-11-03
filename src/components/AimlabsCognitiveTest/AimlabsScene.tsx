import React, { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  useXRControllerButtonEvent,
  useXRInputSourceState,
  useXRInputSourceEvent,
} from "@react-three/xr";
import { AimlabsArena } from "./AimlabsArena";
import { AimlabsTarget } from "./AimlabsTarget";
import { AimlabsShatters } from "./AimlabsShatters";
import { XRCanvasScreen } from "./XRCanvasScreen";
import { aimlabsStore, type AimlabsState } from "./aimlabsStore";
import { triggerXRHaptic } from "../../utils/xrHaptics";

interface AimlabsSceneProps {
  state: AimlabsState;
  isXR: boolean;
  onExit: () => void;
}

export const AimlabsScene: React.FC<AimlabsSceneProps> = ({
  state,
  isXR,
  onExit,
}) => {
  const { camera } = useThree();

  // Desktop Spacebar and Click listener (runs when not in XR)
  useEffect(() => {
    if (isXR) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (state.status === "round1" || state.status === "round2") {
          aimlabsStore.handleResponse();
        } else if (state.status === "ready") {
          aimlabsStore.startGame();
        } else if (state.status === "intermission") {
          aimlabsStore.startRound2();
        }
      } else if (e.key === "Escape" || e.code === "Escape") {
        e.preventDefault();
        if (state.status === "round1" || state.status === "round2") {
          aimlabsStore.togglePause();
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && (state.status === "round1" || state.status === "round2")) {
        aimlabsStore.handleResponse();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [isXR, state.status]);

  // ==============================================================
  // WebXR Controller & Hand Input Handling
  // ==============================================================
  const leftController = useXRInputSourceState("controller", "left");
  const rightController = useXRInputSourceState("controller", "right");

  const handleXRButtonTrigger = (sourceState: any) => {
    if (state.status === "round1" || state.status === "round2") {
      triggerXRHaptic({ inputSource: sourceState?.inputSource }, 0.5, 20);
      aimlabsStore.handleResponse();
    }
  };

  const handleXRPause = (sourceState: any) => {
    if (state.status === "round1" || state.status === "round2") {
      triggerXRHaptic({ inputSource: sourceState?.inputSource }, 0.6, 40);
      aimlabsStore.togglePause();
    }
  };

  // Listen for trigger presses on left & right controllers
  useXRControllerButtonEvent(leftController, "xr-standard-trigger", (btnState) => {
    if (btnState === "pressed") handleXRButtonTrigger(leftController);
  });
  useXRControllerButtonEvent(rightController, "xr-standard-trigger", (btnState) => {
    if (btnState === "pressed") handleXRButtonTrigger(rightController);
  });

  // Listen for squeeze/grip presses on left & right controllers
  useXRControllerButtonEvent(leftController, "xr-standard-squeeze", (btnState) => {
    if (btnState === "pressed") handleXRButtonTrigger(leftController);
  });
  useXRControllerButtonEvent(rightController, "xr-standard-squeeze", (btnState) => {
    if (btnState === "pressed") handleXRButtonTrigger(rightController);
  });

  // Listen for secondary pause buttons on VR controllers (Y on left, B on right)
  useXRControllerButtonEvent(leftController, "y-button", (btnState) => {
    if (btnState === "pressed") handleXRPause(leftController);
  });
  useXRControllerButtonEvent(rightController, "b-button", (btnState) => {
    if (btnState === "pressed") handleXRPause(rightController);
  });

  // Primary XRSession "select" events (standard WebXR trigger / screen tap / hand pinch)
  useXRInputSourceEvent(
    leftController?.inputSource,
    "select",
    (e: any) => {
      if (state.status === "round1" || state.status === "round2") {
        triggerXRHaptic({ inputSource: e?.inputSource ?? leftController?.inputSource }, 0.5, 20);
        aimlabsStore.handleResponse();
      }
    },
    [state.status, leftController?.inputSource]
  );

  useXRInputSourceEvent(
    rightController?.inputSource,
    "select",
    (e: any) => {
      if (state.status === "round1" || state.status === "round2") {
        triggerXRHaptic({ inputSource: e?.inputSource ?? rightController?.inputSource }, 0.5, 20);
        aimlabsStore.handleResponse();
      }
    },
    [state.status, rightController?.inputSource]
  );

  useFrame((_, delta) => {
    // Tick game store
    aimlabsStore.tick(delta);

    // Keep camera stationary looking directly forward at central target when in desktop mode
    if (!isXR) {
      camera.position.set(0, 1.6, 0);
      camera.rotation.set(0, 0, 0);
    }
  });

  return (
    <group name="brainxr-cognitive-scene">
      {/* Clean minimal spatial void */}
      <AimlabsArena />

      {/* Central Hairline Fixation Cross in 3D (active during test countdown and rounds) */}
      {(state.status === "countdown" ||
        state.status === "round1" ||
        state.status === "round2") && (
        <group position={[0, 1.6, -4.5]} name="aimlabs-fixation-cross">
          {/* Horizontal hairline */}
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[0.08, 0.004]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.45} depthWrite={false} />
          </mesh>
          {/* Vertical hairline */}
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[0.004, 0.08]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.45} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* Single Central Target (displayed when isTargetVisible is true) */}
      <AimlabsTarget
        type={state.currentTargetType}
        visible={state.isTargetVisible}
        position={[0, 1.6, -4.5]}
        onClick={() => aimlabsStore.handleResponse()}
      />

      {/* Shatter Bursts on Hit */}
      <AimlabsShatters
        bursts={state.shatters}
        onRemoveBurst={(id) => aimlabsStore.removeShatter(id)}
      />

      {/* High-DPI Virtual Screen Canvas Texture (Modals & HUD in WebXR) */}
      {isXR && (
        <XRCanvasScreen
          state={state}
          onExit={onExit}
        />
      )}
    </group>
  );
};
