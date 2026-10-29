# IdleActionsXR.tsx

The WebXR-space counterpart of [[../IdleSplash|IdleSplash]]'s `IdleActions`:
a floating "Run Demo Mode" pill plus "Connect your EEG headset" and "Exit XR
Mode" text links, shown by [[index|XRConsole]] while idle in VR.

**Props**: `onStartDemo?`, `onStartLive?`, `onExitXR?`.

**Non-obvious**: each pill/link pairs a visible `Text` with its own
invisible hit-test mesh (`planeGeometry` with `opacity={0}`) rather than
relying on the text glyphs themselves for raycasting — `Text` glyph
bounding boxes are unreliable XR ray targets, so a plane sized to the link's
footprint is the actual pointer target underneath it.

**Non-obvious**: every pointer handler calls
[[../../utils/xrHaptics|triggerXRHaptic]] with different intensity/duration
pairs for hover (`0.25, 10`), press (`0.35, 15`), and click (`0.6, 25`) —
the escalating pattern is intentional so a controller feels a distinct
"nudge → press → confirm" as a hand moves through the interaction.
