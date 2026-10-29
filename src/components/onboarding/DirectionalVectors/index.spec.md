# DirectionalVectors/index.tsx

Overlays projected directional gaze vector rays, slowly-rotating coordinate
reticles, and field-of-view HUD readouts centered over the 3D
[[../VRHeadset/index|VRHeadset]] during the onboarding flow's direction beat
— visualizes how BrainXR captures the directional component of the focus
vector via XR head orientation and spatial gaze tracking.

**Props**: `opacity` (0..1, fades the whole overlay and `display: none`s it
below ~0.005), `isDark?` (swaps HUD text colors for the dark theme).
