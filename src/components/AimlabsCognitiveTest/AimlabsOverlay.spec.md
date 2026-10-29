# AimlabsOverlay.tsx

The 2D (desktop, non-XR) overlay root for the cognitive test: composes
[[AimlabsHUD|AimlabsHUD]] (always-visible score/accuracy/rules readout)
and [[AimlabsModals|AimlabsModals]] (the ready/countdown/intermission/
finished screens), driving both from [[aimlabsStore|aimlabsStore]]'s
imperative actions.

**Props**: `state` (`AimlabsState` from [[aimlabsStore|aimlabsStore]]),
`onExit`.

**Non-obvious**: renders nothing (`null`) when `!state.isActive`, and skips
both children when `state.isXR` — the XR headset path renders its own
in-scene HUD ([[AimlabsXROverlay|AimlabsXROverlay]]) instead of this DOM
overlay, since DOM elements aren't visible inside the WebXR headset view.
