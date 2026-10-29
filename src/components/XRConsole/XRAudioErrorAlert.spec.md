# XRAudioErrorAlert.tsx

A floating pill-shaped alert card shown above the headset in WebXR when a
trial's audio file is missing, with a pulsing red status LED and two lines
of explanatory text. Renders `null` when there is no error.

**Props**: `audioError` (boolean).

**Non-obvious**: the pulse animation mutates `pulseRef.current.opacity`
directly inside `useFrame` rather than via React state, so the LED's
sine-wave pulse doesn't trigger a re-render every frame.
