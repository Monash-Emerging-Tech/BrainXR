# useHeadPlacement.ts

The `useFrame` loop that positions/scales/rotates the headset group every
three.js frame for the 2D desktop viewport.

**Signature**: `useHeadPlacement({ groupRef, frameRef, selectedChannel, highlightPrefrontal, presentationStage }): void`

- On the 2D desktop viewport: scales the model to occupy ~1/3 of viewport height in unfocused states. The headset is anchored at its fixed midpoint anchor (`y = -11 * scale`) so the model stays vertically centered at all times regardless of what node is selected. When any electrode or the prefrontal focus sensors are active (`selectedChannel` or `highlightPrefrontal`), the headset scales +30% larger with smooth continuous scale tracking and smoothly auto-rotates (slerps) to face the camera orthogonally. In idle/showcase mode when deselected, the headset slowly spins around the world Y axis with a subtle bobbing motion. Upon entering demo mode (or when deselected in demo mode), it smoothly reorients (slerps) back to its initial resting quaternion (`DEFAULT_HEADSET_QUATERNION`) and remains stably centered without vertical oscillation.

**Non-obvious**: while a channel is selected, the focus-quaternion
computation runs every frame (not just once on select) via
[[../eegHead/electrodeNodes|getElectrodeFocusQuaternion]], writing into an
owned `tempFocusQuat` module-scratch Quaternion instead of allocating a new
one each frame — safe because the result is only ever read (copied/slerped) the
same frame it's computed, never stored by reference.
