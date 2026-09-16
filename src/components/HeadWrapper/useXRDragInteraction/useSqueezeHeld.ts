import { useRef } from "react";
import { useXRControllerButtonEvent, useXRInputSourceState } from "@react-three/xr";

// Tracks whether either controller's grip/squeeze button is currently held.
// Polled per-frame by the drag hook (see index.ts) rather than driving drag
// start/end directly from these event callbacks, so ending a drag doesn't
// depend on the callbacks re-binding with fresh closures every render.
export function useSqueezeHeld() {
  const heldRef = useRef({ left: false, right: false });
  const left = useXRInputSourceState("controller", "left");
  const right = useXRInputSourceState("controller", "right");

  useXRControllerButtonEvent(left, "xr-standard-squeeze", (state) => {
    heldRef.current.left = state === "pressed";
  });
  useXRControllerButtonEvent(right, "xr-standard-squeeze", (state) => {
    heldRef.current.right = state === "pressed";
  });

  return {
    isHeld: () => heldRef.current.left || heldRef.current.right,
    activeInputSource: (): XRInputSource | undefined =>
      heldRef.current.left ? left?.inputSource : heldRef.current.right ? right?.inputSource : undefined,
  };
}
