# useHeadPlacement.ts

The `useFrame` loop that positions/scales/rotates the headset group every
three.js frame.

**Signature**: `useHeadPlacement({ groupRef, frameRef, isDraggingRef, xrPositionRef, xrRotationRef, selectedChannel, highlightPrefrontal, presentationStage }): void`

- In WebXR: resets to a fixed pose (`(0, 1.3, -1.1)`, target rotation) the
  moment presentation starts, scales to real-world size (~22cm diameter),
  and smoothly slerps `xrRotationRef` towards the target focus quaternion computed dynamically from the user's VR camera line of sight, ensuring the `selectedChannel`'s ring faces the headset orthogonally (or default resting posture) — unless
  [[useXRDragInteraction]] has `isDraggingRef` set, in which case it leaves
  the group alone (the drag handlers are already writing to it directly).
- On the 2D desktop viewport: scales the model to occupy ~1/3 of viewport height in unfocused states. The headset is anchored at its fixed midpoint anchor (`y = -11 * scale`) so the model stays vertically centered at all times regardless of what node is selected. When any electrode or the prefrontal focus sensors are active (`selectedChannel` or `highlightPrefrontal`), the headset scales +30% larger with smooth continuous scale tracking and smoothly auto-rotates (slerps) to face the camera orthogonally. When deselected, it smoothly scales back to base size and resumes continuous showcase spinning around world Y directly from that focused position without storing or resetting rotation angles. In idle mode, a subtle bobbing motion is added, while demo mode remains stably centered without vertical oscillation.

**Non-obvious**: while a channel is selected, the focus-quaternion
computation runs every frame (not just once on select) via
[[../eegHead/electrodeNodes|getElectrodeFocusQuaternion]], writing into an
owned `tempFocusQuat` module-scratch Quaternion instead of allocating a new
one each frame — safe because the XR and desktop branches are mutually
exclusive per frame and the result is only ever read (copied/slerped) the
same frame it's computed, never stored by reference.

