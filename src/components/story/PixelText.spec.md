# PixelText.tsx

Renders text as a cloud of pixel squares on a single `<canvas>`, animated
flying in (`mode="in"`) or falling under gravity (`mode="out"`). Used by
[[Act2|Act2]] for the region tour's label/role/body text and the closing
line.

**Props**: `text`, `mode: "in" | "out"`, `font`, `fontSize`, `fontWeight?`,
`color`, `width`, `cellSize?`, `maxParticles?`, `reducedMotion?`,
`className?`, `lineHeightPx?`, `topOffset?`, `align?`,
`sourceMode?: "scatter" | "center"`, `sourceRadius?`.

**Non-obvious**: an earlier version gave each pixel its own absolutely
positioned `<span>` — a single wrapped sentence ran to 1000+ DOM nodes, each
animating; fine at rest, far too much to animate smoothly. Everything here
draws into one canvas instead, with the real text kept in the DOM
(`.story-sr-only`, visually hidden) so screen readers/find-in-page still see
a sentence.

**Non-obvious**: text is sampled into a resting pixel grid only after
`document.fonts.ready` — sampling against the fallback font before the
webfont lands would bake every pixel into the wrong position. The grid step
auto-coarsens (up to 6 attempts) until the particle count is under
`maxParticles`, rather than dropping pixels at random, since random drops
would punch holes in glyphs.

**Non-obvious**: the canvas is sized `height + FALL_ROOM` taller than the
text — gravity drags the "out" particles past the text's own bounding box
within a frame or two, and without the extra headroom the fall would be
clipped away. The layout box itself stays text-height; only the canvas
overhangs.

**Non-obvious**: `sourceMode="center"` bunches the fly-in origin near the
text's own center (used where the line should emerge from inside a mist
that's already centered there) instead of `"scatter"`'s radial throw from
off-screen.
