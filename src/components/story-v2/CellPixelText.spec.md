# CellPixelText.tsx

The question line (and reused for region names/closing line in [[SceneBeat]]):
real OffBit `<text>` with a particle formation animated over it. Replaces an
earlier design that reconstructed the resting line entirely from sampled
pixels, which reliably dropped strokes (e.g. the H's left leg) however well
the sampler aligned to OffBit's design grid — reconstructing type from a
sampler can only ever approach what the browser already renders perfectly.
Here the resting text is always a real, always-correct SVG `<text>`; the
particles are decoration for the formation only — they jitter inside their
own character's cell, converge onto glyph shapes sampled from that same real
text, then fade out under the real text fading in at the identical position
and size.

**Props** (`CellPixelTextProps`): `text`, `font`, `fontSize` (particle pitch
snaps to the font's own design grid), `fontWeight?`, `color`, `progressRef`
(live 0..1 forming progress, as a ref so this never re-renders per frame),
`swellRef?`, `swellId?`, `swapFrom?` (progress at which real text starts
fading in under the particles), `reducedMotion?`, `className?`.

**Non-obvious**: measurement waits for `document.fonts.load`/`.ready` before
building the particle layout — measuring against the fallback font would
trace the wrong glyph shapes, and the real text would then visibly reflow
out from under the already-converged particles.

**Non-obvious**: particle jitter is quantized twice on purpose — snapped to
the pixel grid and re-picked only every `cells.jitterIntervalMs` (via a
deterministic `hash(seed, step)`, not `Math.random`) — because smooth noise
reads as drifting dust while stepped noise reads as a display that hasn't
locked yet, which is the desired effect.

**Non-obvious**: once `progressRef.current >= 1`, `locked` is set and the
canvas stops drawing entirely, leaving only the real SVG text — this is a
one-way latch, not re-evaluated per frame, so a finished line costs nothing
once formed.

**Non-obvious**: the particle swap and the real text's opacity are driven by
the *same* `swap` value computed from `progressRef` inside the rAF loop
(`clamp01((p - swapFrom) / (1 - swapFrom))`) — both layers are OffBit at the
identical position, so crossfading them against one shared value means
there is nothing visible in the handoff.

**Non-obvious**: the canvas is sized and drawn at full `devicePixelRatio`
with `imageSmoothingEnabled = false` and positions rounded to whole device
pixels — these are meant to read as hard-edged squares, and any resampling
would blur them immediately.
