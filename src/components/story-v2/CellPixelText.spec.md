# CellPixelText

Scroll-story v2's "forming" headline effect: a real SVG `<text>` (so it's always correct/readable) sits underneath a canvas of dithered particles that jitter inside their own character cell, converge onto the glyph shapes, then fade out as the real text fades in underneath at the same position.

**Props**: `text`, `font`, `fontSize` (the particle pitch snaps to the font's design grid via [[pixelGridV2|snapToPixelGrid]]), `fontWeight?`, `color`, `progressRef` (live 0..1 forming progress, as a ref so this never re-renders per frame), `swellRef?`/`swellId?` (optional inverse swell-blur overlay), `swapFrom?` (progress at which the real text starts fading in under the particles), `reducedMotion?`, `className?`.

**Non-obvious**: waits on `document.fonts.ready` before measuring text/building particles, since measuring against a fallback font would make the real text reflow out from under the already-placed particles. Particle positions are double-quantized (snapped to the pixel grid, re-picked only every `jitterIntervalMs`) deliberately — smooth noise reads as drifting dust, stepped noise reads as a display locking in.
