# AimlabsOverlay

Renders the Aimlabs cognitive test's 2D desktop overlay ([[AimlabsHUD]] + [[AimlabsModals/index|AimlabsModals]]) while the test is active. Returns `null` entirely when inactive, and renders neither when in XR (XR uses [[XRCanvasScreen/index|XRCanvasScreen]] instead — see [[AimlabsScene]]).

**Props**: `state` (the [[aimlabsStore/index|AimlabsState]] snapshot), `onExit`.
