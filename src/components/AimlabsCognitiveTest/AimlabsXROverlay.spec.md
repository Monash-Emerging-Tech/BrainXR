# AimlabsXROverlay.tsx

In-headset HUD for the cognitive test: a floating 3D pill (built from
`<Text>`/`<mesh>`, not DOM) showing cumulative reaction time, accuracy,
the current round's Go/No-Go color rule, and an optional exit button.

**Props**: `score`, `accuracy`, `round` (`CognitiveRoundType`), `onExit?`.

**Non-obvious**: this exists only because [[AimlabsHUD|AimlabsHUD]] is a
DOM overlay and DOM isn't rendered inside the WebXR headset view — it
duplicates a subset of that HUD's content as in-scene geometry/text so XR
users see equivalent status; see the `isXR` branch in
[[AimlabsScene|AimlabsScene]].
