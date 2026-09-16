# useXRDragInteraction.ts

Pointer down/move/up handlers implementing drag-to-reposition and
drag-to-rotate for spatial groups (such as [[EEGHead]] and [[../XRConsole/XRControlBar/index|XRControlBar]])
while presenting in WebXR. A no-op outside XR (`gl.xr.isPresenting` guard on pointer-down).

**Signature**: `useXRDragInteraction({ gl, groupRef, initialPosition?, initialRotation?, positionRef?, rotationRef?, constrainPosition?, onDragStart?, onDragEnd? }) -> { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerDown, handlePointerMove, handlePointerUp }`

- `handlePointerDown` only starts a drag for `e.pointerType === "grab"` — the
  grip/squeeze button's near-field proximity pointer (bound to WebXR's
  `squeeze` event by `@react-three/xr`'s default controller config), not the
  trigger's ray pointer (`"ray"`, bound to `select`). This keeps
  repositioning on the grip button and the trigger free for node selection
  (see [[../eegHead/ElectrodeNode|ElectrodeNode]]) — previously any pointer
  type could start a drag, so pulling the trigger over the head shell (as
  opposed to precisely over a node) would grab-drag it instead of doing
  nothing/selecting.
- The rotation/position math itself is unchanged and still reads `e.ray` —
  `@pmndrs/pointer-events` derives a `ray` for grab-type events too (origin =
  the grip's world position, direction = the grip's forward vector), so no
  separate math path was needed for the two pointer types.
- `xrPositionRef`/`xrRotationRef` are the persisted XR pose, read and updated
  here during a drag, and synced every frame via `useFrame` whenever not
  dragging (so releasing the grip leaves the object anchored in place).
- Rotation is derived as the short-arc quaternion between the drag's start
  ray direction and the current ray direction (`setFromUnitVectors`), not
  from controller orientation directly — dragging rotates by "swinging" the
  controller ray, not by twisting the controller.
- Uses `setPointerCapture`/`releasePointerCapture` so a fast drag that moves
  the ray off the mesh doesn't drop the gesture.
- Supports optional `constrainPosition` callback (e.g. [[spatialCollision]]) to prevent physical overlap between objects.
- Supports optional `onDragStart` and `onDragEnd` callbacks for triggering UI state changes and haptics.


