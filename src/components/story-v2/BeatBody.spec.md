# BeatBody.tsx

Body copy for a [[SceneBeat]]: real sans text, no particles. Replaces an
earlier design where every line was assembled from sampled pixels under a
`maxParticles` cap — fine for a short region name but reduced a two-sentence
paragraph to unreadable fragments. Instead, text arrives through the same
inverse swell-blur [[CellPixelText]] uses (dim and swollen, tightening into
crisp type) plus a gentle staggered-per-line rise.

**Props** (`BeatBodyProps`): `text`, `font`, `fontSize`, `color`, `width`
(column width in CSS px; lines are broken to fit it), `revealKey` (bumped per
beat so the reveal restarts), `reducedMotion?`, `className?`.

**Non-obvious**: lines are measured and broken here (`wrapLines`, via an
offscreen canvas's `measureText`) rather than left to the browser to wrap —
the per-line stagger needs each line to be an addressable element, and the
swell filter needs one instance per line because each line sits at a
different reveal progress; native wrapping would give neither.

**Non-obvious**: each line gets its own `<SwellFilter>` instance (`${uid}-${i}`,
keyed by a sanitized `useId`) rather than sharing one — lines are at
different progress values simultaneously, so one shared filter couldn't
serve them all. The filter is removed (`el.style.filter = ""`) the moment a
line finishes revealing, since an SVG filter left on static text keeps a
render layer alive for no reason.

**Non-obvious**: the whole per-line reveal (opacity, rise, swell) is driven
by one `requestAnimationFrame` loop writing directly to refs/inline styles,
not React state — it exits as soon as every line reports `allDone`, so a
finished beat's rAF loop stops itself rather than running indefinitely.
