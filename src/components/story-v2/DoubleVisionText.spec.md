# DoubleVisionText.tsx

Renders "FOCUS??" as seen without glasses in [[SceneOpening]]: several real
OffBit `<text>` copies of the same word, offset vertically at falling
opacity, that continuously breathe closer and apart without ever settling —
the point being that a beat about focus refuses to come into focus. Replaced
an earlier version built from stacked sampled pixel rects, where every ghost
inherited the sampler's dropped strokes.

**Props**: `text`, `font`, `fontSize`, `fontWeight?`, `color`, `enterRef`
(live 0..1 entrance as a ref, not state), `reducedMotion?`, `className?`.

**Non-obvious**: ghost spread and opacity are written via `setAttribute`
from one `requestAnimationFrame` loop, not React props/state — a per-frame
prop would force React to reconcile every ghost layer sixty times a second.

**Non-obvious**: the breathing spread oscillates between `minSpread` and
`maxSpread` ([[storyContentV2]]) and never reaches zero, by design — "settling"
into focus would undercut the beat.

**Non-obvious**: the SVG's viewBox/height pads for the ghosts' full entrance
spread (wider than where they settle) so they never clip, but that padding
is then pulled back out of the box's CSS margins via negative `marginTop`/
`marginBottom` sized to the smaller resting spread — otherwise the flex
column would center on mostly-empty padding and the whole question would
sit visibly high on the screen.

**Non-obvious**: the box uses the tight ink bounding box from `measureTextInk`
(not the full canvas/font metrics box), so `align-items: center` centers the
word on its actual rendered width.

**Non-obvious**: mounted as soon as line 1 starts forming (see [[SceneOpening]]),
not at its own entrance — `appear` (a fast fade over the first fifth of
`enterRef`) is what keeps it invisible until then, so the text column
reserves FOCUS??'s slot from the start and line 1 never jumps upward when
the word finally appears.
