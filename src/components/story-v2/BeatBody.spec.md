# BeatBody

Scroll-story v2's body-copy renderer: real sans text (not sampled particles), revealed through the same inverse swell-blur used for the headline, staggered one line at a time.

**Props**: `text`, `font`, `fontSize`, `color`, `width` (lines are greedy-wrapped to this, measured against the real font via an offscreen canvas), `revealKey` (bump to restart the reveal), `reducedMotion?`, `className?`.

**Non-obvious**: text is pre-wrapped here rather than left to CSS, because each line needs its own [[../story/SwellFilter|SwellFilter]] instance (each is at a different reveal progress) and needs to be an addressable element for the per-line stagger. The reveal animates via direct style/`applySwell` mutation in a `requestAnimationFrame` loop, not React state.
