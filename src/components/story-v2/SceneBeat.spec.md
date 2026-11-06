# SceneBeat

Scroll-story v2's per-region beat (Scenes 3+): a region's name ([[CellPixelText]], particle-formed), role tag (plain fade), and body copy ([[BeatBody]]), or the closing line as a headline. Also draws the brain-region progress dots and the 3D-model credit line.

**Props**: `beatIndex` (index into `BEAT_PANELS`), `layout` (from [[useStageLayout]], so the text column can never overlap the brain), `reducedMotion`, `fastForwarded?`.

**Non-obvious**: this component intentionally persists (is not remounted) across every beat — remounting per beat would make outgoing text vanish instead of sweeping out, leaving the transition pane with nothing to hide. Beat transitions are staged across two effects (the sweep/swap, and retiring the sweep pane) kept deliberately separate because folding them together would have the swap's `setShown` re-run the same effect and cancel the pane's own cleanup timer.
