# XRCanvasScreen

High-DPI Virtual Screen Canvas Texture port for the Aimlabs Cognitive Test in WebXR.

### Purpose
Renders the complete 2D desktop experience (Briefing, 3-2-1 Countdown, HUD telemetry, Intermission rule reversal, and Comparative Results table) onto a high-DPI (1600x900) offscreen 2D canvas wrapped in a Three.js `CanvasTexture`. Provides 100% fidelity to desktop layouts, fonts (`OffBit`), colors, and tables within the WebXR scene.

### Props
- `state`: Live `AimlabsState` from `aimlabsStore`.
- `onExit`: Callback to return to the EEG dashboard and exit VR.
