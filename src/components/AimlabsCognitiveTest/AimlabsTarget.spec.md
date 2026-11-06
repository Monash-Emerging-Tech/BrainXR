# AimlabsTarget

The single Go/No-Go stimulus shown at center stage during a CPT/SART trial: a green sphere or a spinning red (edged) box.

**Props**: `type` (`"sphere" | "box"`), `visible`, `position?`, `onClick?`.

Returns `null` while `visible` is false rather than toggling opacity, so it also isn't clickable/raycast-hit between the 500ms stimulus flash and the 700ms fixation gap. Fires `onClick` plus a haptic pulse ([[../../utils/xrHaptics|triggerXRHaptic]]) on both `onClick` and `onPointerDown`, so desktop mouse and XR controller/hand select both register a hit.
