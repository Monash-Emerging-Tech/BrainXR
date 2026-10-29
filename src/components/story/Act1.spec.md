# Act1.tsx

Act 1 of the legacy story: "someone putting their glasses back on," told as
staged beats (mist gathering/parting, two lines of text swarming into
place, a glass block forming, then a zoom into one glyph's counter). Hosted
by [[StoryIntro|StoryIntro]].

**Props**: `phases: Record<Act1Phase, number>` (per-beat scroll progress
0..1), `reducedMotion`, `onBeatSettled?: (id: "line1" | "focus") => void`.

**Non-obvious**: the hook scene is one full-viewport SVG, zoomed by
animating its `viewBox` rather than CSS-scaling a raster layer — pixel
squares stay sharp-edged through the dive at any device pixel ratio. The
`<canvas>` (`story-swarm-canvas`) is used only while pixels are in flight
(the swarm/converge); both renderers sample the same pixel grid
([[pixelGrid|pixelGrid]]) at the same step so the handover between them is
invisible. Once settled, a pixel's `filter` attribute is removed entirely
(not merely zeroed) so the resting text and the dive stay cheap to render.

**Non-obvious**: formation (`useFormation`) is time-based once triggered by
scroll — scroll only starts the clock; pausing scroll doesn't freeze an
in-progress swarm. Scrolling back past the trigger plays the clip
backwards (sharp → swollen → haze) via the `unform` phase, driven by
[[SwellFilter|SwellFilter]]'s `swellParams`/`applySwell`.

**Non-obvious**: particle scatter seeds are generated once per `scene`
build (in a `useMemo`, not inside the per-frame draw effect) — regenerating
them when a part transitions from `play` to `form` would make the swarm
visibly jump.

**Non-obvious**: `buildScene` derives the "U" counter's box
([[pixelGrid|findCounter]]) from character-width measurements of the
emphasis text up to `ACT1.zoomCharIndex`, with a geometric fallback (middle
of the "U" band) if the glyph's actual counter can't be found.
