# SceneOpening

Scroll-story v2's Scenes 0 and 1 combined into one component (so the BrainXR wordmark never remounts between them): the idle wordmark gets swallowed into the screen center, black smoke ([[SmokeShader]]) erupts and clears from that point, the question line forms ([[CellPixelText]]), then "FOCUS??" arrives via [[DoubleVisionText]].

**Props**: `sceneIndex` (0 = landing rest, 1 = play the sequence), `playing`, `startedAt`, `fastForwarded`, `reducedMotion`.

**Non-obvious**: the whole ~14s timeline runs from one `requestAnimationFrame` loop writing into refs (`reachRef`/`densityRef`/`lineRef`/`swellRef`/`focusRef`) and directly onto `wordmarkRef.current.style`; React state (`showLine`/`showFocus`/`showSmoke`) only flips at a handful of coarse milestones, not every frame. `fastForwarded`/`reducedMotion`/`!playing` all jump straight to the Scene 1 rest state instead of animating.
