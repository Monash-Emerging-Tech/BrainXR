import { xrStore } from "./xrStore";

/**
 * Checks whether the user's browser/device supports WebXR immersive VR sessions.
 */
export async function isWebXRSupported(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("xr" in navigator) || !navigator.xr) {
    return false;
  }
  try {
    return await navigator.xr.isSessionSupported("immersive-vr");
  } catch {
    return false;
  }
}

/**
 * Unified entry handler for the Enter VR button:
 * - If on an XR device with WebXR immersive VR support: launches into WebXR.
 * - Otherwise (desktop/non-XR): launches as a Three.js desktop experience.
 */
export async function launchExperience(options: {
  onStartDesktop: () => void;
  onStartXR: () => void;
}): Promise<void> {
  const xrSupported = await isWebXRSupported();

  if (xrSupported) {
    options.onStartXR();
    try {
      await xrStore.enterVR();
    } catch (err) {
      console.warn("Could not initiate WebXR session, falling back to Three.js desktop:", err);
      options.onStartDesktop();
    }
  } else {
    options.onStartDesktop();
  }
}

