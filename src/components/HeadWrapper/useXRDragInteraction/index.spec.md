# useXRDragInteraction/index.ts

Grip-to-reposition and grip-to-rotate interaction for spatial groups (such as
[[../../eegHead/index|EEGHead]] and [[../../XRConsole/XRControlBar/index|XRControlBar]])
while presenting in WebXR. A no-op outside XR.

**Signature**: `useXRDragInteraction({ gl, groupRef, initialPosition?, initialRotation?, positionRef?, rotationRef?, constrainPosition?, onDragStart?, onDragEnd? }) -> { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerMove }`

**Non-obvious**: repositioning is driven by the grip/squeeze button (see
[[useSqueezeHeld]]), not the ray pointer's own down/up cycle — that's bound
to the trigger (`select`) and needed for node selection (see
[[../../eegHead/ElectrodeNode|ElectrodeNode]]). An earlier version bound
dragging to `@react-three/xr`'s default "grab" pointer type (a near-field
~7cm proximity sphere around the controller), which required physically
reaching out and touching the model — broken for a head model that floats
~1m away, the normal case. This version keeps the far-reaching "point with
the ray" gesture (matching the old trigger-drag's feel) but gates it on the
grip button: only a single `handlePointerMove` handler is exposed and wired
onto the group — a `pointermove` reaching it (pointerType `"ray"`) proves
the ray currently intersects something in the group's subtree (the ray
pointer's `cursorModel` requires continuous hover tracking regardless of
button state, so these events fire independent of trigger/grip), and if the
grip is also held at that moment, the drag begins using that event as the
baseline. No `onPointerEnter`/`onPointerLeave` hover-tracking was needed:
descendant meshes in both consumers (the headset shell, `ElectrodeNode`'s
LED mesh, `XRControlBar`'s backing card) either have no `onPointerMove`
handler of their own or don't stop its propagation, so it always bubbles.
- The rotation/position math is unchanged from the trigger-drag version —
  `@pmndrs/pointer-events` derives a `ray` for grab-type events too, but
  more importantly the ray pointer's own `ray` (origin = controller
  position, direction = controller forward) is exactly what this needs.
- Ending a drag is driven by polling [[useSqueezeHeld]]'s `isHeld()` inside
  the existing per-frame `useFrame` (not from the button-event callback
  directly), so it doesn't depend on that callback re-binding with a fresh
  closure every render — only two booleans are flipped there.
- `onDragStart`/`onDragEnd` now receive the active `XRInputSource | undefined`
  instead of a `ThreeEvent<PointerEvent>` (there's no pointer event at
  squeeze-release time) — pass it to `triggerXRHaptic({ inputSource }, ...)`
  for haptics, which already accepts a bare `{ inputSource }` shape.
- `xrPositionRef`/`xrRotationRef` are the persisted XR pose, read and
  updated here during a drag, and synced every frame via `useFrame`
  whenever not dragging (so releasing the grip leaves the object anchored
  in place).
- Uses `setPointerCapture`/`releasePointerCapture` so a fast drag that
  moves the ray off the mesh doesn't drop the gesture.
- Supports optional `constrainPosition` callback (e.g. [[../spatialCollision]]) to prevent physical overlap between objects.
