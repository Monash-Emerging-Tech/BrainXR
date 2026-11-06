# DebugHud

Dev-only on-screen readout of the scroll-story v2 state machine (current scene/phase/elapsed time) and every live timeline value from `v2Debug`. Off unless `DEBUG_HUD` is set in `storyContentV2` or `?v2debug=1` is on the URL.

**Props**: `index`, `phase`, `startedAt`, `fastForwarded`.

**Non-obvious**: writes straight into a `<pre>` from its own `requestAnimationFrame` loop rather than re-rendering via React, so it costs one text assignment a frame and zero reconciliation.
