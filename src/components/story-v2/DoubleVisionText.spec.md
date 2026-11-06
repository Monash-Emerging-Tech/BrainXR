# DoubleVisionText

Scroll-story v2's "out of focus" headline effect: several real SVG `<text>` copies of the same word, fanned out vertically at falling opacity, that never fully converge — they breathe between a min/max spread instead of settling to zero.

**Props**: `text`, `font`, `fontSize`, `fontWeight?`, `color`, `enterRef` (live 0..1 entrance progress, read as a ref so this never re-renders per frame), `reducedMotion?`, `className?`.

**Non-obvious**: ghost offsets/opacity are driven by `setAttribute` from one shared `requestAnimationFrame`, not React state or per-frame props, to avoid reconciling every ghost layer 60x/sec. Waits on `document.fonts.ready` before measuring ink extents ([[pixelGridV2|measureTextInk]]) so layout doesn't shift once the real face loads.
