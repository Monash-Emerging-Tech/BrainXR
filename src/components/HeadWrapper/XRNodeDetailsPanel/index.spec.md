# XRNodeDetailsPanel

The floating WebXR panel anchored near the headset that shows electrode details and session controls, baked to a canvas texture by [[renderPanel/index|renderNodeDetailsCanvas]] and hit-tested against the hit areas that render pass produces.

**Props**: `channel`, `frameRef`, `onSelectChannel`, `position?`, `headPositionRef?` (when given, the panel follows the physical head each frame instead of staying at a fixed `position`), `isMuted?`, `onToggleMute?`.

**Non-obvious**: the canvas only repaints while actually presenting in XR (`state.gl.xr.isPresenting`), throttled to ~15fps via a 66ms gate inside the `useFrame` loop — not every frame. Pointer hit-testing converts the mesh's UV coordinates back to canvas pixel space and looks up `hitAreasRef` (populated by the latest `renderNodeDetailsCanvas` call) rather than using separate React/DOM hit targets. "Simulated recording" auto-toggles on when a node is first selected and off when returning to the idle/home state (`prevChannelRef` tracks the transition).
