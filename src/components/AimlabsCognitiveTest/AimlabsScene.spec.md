# AimlabsScene

The 3D scene for the Aimlabs cognitive test: [[AimlabsArena/index|AimlabsArena]] backdrop, a 3D fixation cross during countdown/rounds, the single [[AimlabsTarget]], hit [[AimlabsShatters]], and (in XR) the [[XRCanvasScreen/index|XRCanvasScreen]] virtual HUD/modals.

**Props**: `state` (the [[aimlabsStore/index|AimlabsState]] snapshot), `isXR`, `onExit`.

Wires up every input path that can register a trial response: desktop Space/click, and WebXR controller trigger/squeeze/select plus secondary Y/B pause buttons and hand-tracking select events, each firing [[aimlabsStore/index|aimlabsStore]].handleResponse()/togglePause() and a haptic pulse via [[../../utils/xrHaptics|triggerXRHaptic]]. The `useFrame` loop ticks the game clock (`aimlabsStore.tick`) and pins the camera forward in desktop mode.
