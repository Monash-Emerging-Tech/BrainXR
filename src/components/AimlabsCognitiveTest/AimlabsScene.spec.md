# AimlabsScene.tsx

The 3D (r3f) root of the cognitive test: composes the arena
([[AimlabsArena|AimlabsArena]]), the stimulus
([[AimlabsTarget|AimlabsTarget]]), hit-shatter effects
([[AimlabsShatters|AimlabsShatters]]), and, in XR, the in-headset HUD
([[AimlabsXROverlay|AimlabsXROverlay]]). Wires desktop spacebar/click input
to [[aimlabsStore|aimlabsStore]] and drives the store's per-frame `tick`.

**Props**: `state` (`AimlabsState`), `isXR`, `onExit`.

**Non-obvious**: the spacebar/mousedown listeners are desktop-only
(`if (isXR) return`) and dispatch differently per `state.status` — Space
both advances "ready"/"intermission" screens *and* registers a Go/No-Go
response during "round1"/"round2", so the same key serves as both a menu
action and the task input depending on phase.

**Non-obvious**: `useFrame` force-sets `camera.position`/`rotation` to a
fixed forward-facing pose every frame on desktop (not XR) — this scene has
no orbit controls of its own, so without this the camera would drift or
retain whatever pose [[../Scene|Scene]]'s shared `OrbitControls` left it in
when the cognitive test launched.
