# useSqueezeHeld.ts

Sub-hook split out of [[index|useXRDragInteraction]]. Tracks whether either
controller's grip/squeeze button is currently held via
`useXRControllerButtonEvent(..., "xr-standard-squeeze", ...)` for both
handedness values, exposing `isHeld()` and `activeInputSource()` as plain
getters (not React state) so the drag hook can poll them from inside its
existing per-frame `useFrame` rather than reacting to the button-event
callback directly.
