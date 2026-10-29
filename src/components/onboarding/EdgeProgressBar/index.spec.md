# EdgeProgressBar/index.tsx

Vertical edge indicator for the onboarding flow: five clickable beat dots
("Origin", "Focus", "Vector", "Direction", "Intensity") joined by fill-rail
segments, plus a top-right Skip button, fixed over the whole viewport.

**Props**: `activeBeat` (0..4, index into the beat labels), `progress`
(0..1 overall scroll progress), `isDark?`, `onSkip`, `onSelectBeat?`.

**Non-obvious**: also exports `BEAT_THRESHOLDS`, the five scroll-progress
breakpoints (`[0, 0.2, 0.32, 0.53, 0.71]`) at which each beat is considered
"reached" — not currently imported elsewhere, but kept alongside
`BEAT_LABELS` so the two arrays (thresholds and labels) can't drift apart
if another component needs to know where a beat starts.

**Non-obvious**: the whole bar fades out (and unmounts via `return null`)
only once `progress` exceeds 0.93, not at `progress === 1` — the onboarding
home page assembles underneath before scroll fully completes, so the bar
is given a window to fade out of the way rather than disappearing abruptly.
