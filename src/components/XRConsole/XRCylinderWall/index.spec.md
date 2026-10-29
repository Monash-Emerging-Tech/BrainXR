# XRCylinderWall/index.tsx

An immersive, ~160°-wide curved cylinder surrounding the user in WebXR
Demo/Live Mode, rendered by [[../index|XRConsole]]. Displays all 21
electrode oscilloscope lanes on a live canvas texture (via
[[useXRCylinderTexture]] / [[renderCylinderWall]]) and turns pointer
position on the curved surface into channel hover/select events, with a 3D
laser-pointer reticle marking the hit point.

**Props**: `frameRef`, `historiesRef?`, `selectedChannel`, `hoveredChannel?`,
`onChannelSelect?`, `onChannelHover?`, `radius?`, `height?`.

**Non-obvious**: channel hit-testing doesn't use per-channel 3D geometry —
`getChannelAtUV` maps the pointer event's UV coordinate to a canvas Y
fraction and looks it up against `hitAreasRef.current`, a flat list of
`{ name, yMin, yMax }` bands ([[types|CylinderChannelHitArea]]) computed by
[[useXRCylinderTexture]] from the same layout used to draw the lanes onto
the texture — the hit areas and the drawn lane positions are two different
computations that must stay pixel-aligned.

**Non-obvious**: hover state is tracked in a ref
(`hoveredChannelRef`/`isHoveredRef`) rather than React state so the 20 Hz
texture redraw loop doesn't need to wait for a re-render; it's synced back
toward the `hoveredChannel` prop only when the pointer isn't actively
hovering locally (the `if (!isHoveredRef.current && ...)` guard), so an
external hover change (e.g. selecting a channel from the desktop view)
doesn't fight with in-progress XR pointer movement.

**Non-obvious**: the reticle's position/orientation is updated imperatively
inside `useFrame` (`reticle.position.copy(...)`, `reticle.lookAt(...)`)
rather than through props, avoiding a React render on every frame while the
user's ray moves across the curved surface.
