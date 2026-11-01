# AimlabsXROverlay

Minimal spatial visor HUD for the Aimlabs Cognitive Test in WebXR.

### Purpose
Floats in the upper sightline during active cognitive rounds ($Z = -4.5\text{m}$, $Y = 3.2\text{m}$) without occluding the central target plane. Renders live cumulative reaction time, accuracy percentage, active round stimulus rules (Cyan Sphere vs Red Box), shot feedback indicators (`+XXXms` / `-XXXms`), and a tactile Exit VR button with controller haptic feedback.

### Props
- `score`: Cumulative RT in milliseconds.
- `accuracy`: Current round accuracy percentage (0-100%).
- `round`: Active round (1 for CPT, 2 for SART).
- `recentFeedback`: Transient shot feedback text and color.
- `onExit`: Optional exit callback.
