import { xrStore } from "./xrStore";

/**
 * Checks whether the user's browser/device supports WebXR immersive sessions (VR or AR).
 */
export async function isWebXRSupported(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("xr" in navigator) || !navigator.xr) {
    return false;
  }
  try {
    const vrSupported = await navigator.xr.isSessionSupported("immersive-vr").catch(() => false);
    if (vrSupported) return true;
    const arSupported = await navigator.xr.isSessionSupported("immersive-ar").catch(() => false);
    return arSupported;
  } catch {
    return false;
  }
}

/**
 * Unified entry handler for the Enter XR button:
 * - Attempts to launch an immersive-ar passthrough session if supported, falling back to immersive-vr.
 * - Otherwise (desktop/non-XR): launches as a Three.js desktop experience.
 */
export async function launchExperience(options: {
  onStartDesktop: () => void;
  onStartXR: () => void;
}): Promise<void> {
  const arSupported = typeof navigator !== "undefined" && navigator.xr
    ? await navigator.xr.isSessionSupported("immersive-ar").catch(() => false)
    : false;
  const vrSupported = await isWebXRSupported();

  if (arSupported || vrSupported) {
    options.onStartXR();
    try {
      if (arSupported) {
        await xrStore.enterAR();
      } else {
        await xrStore.enterVR();
      }
    } catch (err) {
      console.warn("Could not initiate WebXR session, falling back to Three.js desktop:", err);
      options.onStartDesktop();
    }
  } else {
    options.onStartDesktop();
  }
}

