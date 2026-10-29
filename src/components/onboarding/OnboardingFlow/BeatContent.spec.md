# BeatContent.tsx

Renders the scroll-driven text overlay for [[index|OnboardingFlow]]'s four
narrative beats ("focus" headline, "Focus is a Vector Variable",
"Direction of Attention", "Intensity of Attention"), each fading/sliding in
and out over its own slice of `progress` via
[[useOnboardingScroll|calcEnvelope/clamp01]]. Hosts
[[../DoubleVisionFocusText/index|DoubleVisionFocusText]] for beat 1's
converging "focus" word.

**Props**: `progress` (0..1 overall onboarding scroll), `introFadeProgress?`
(fades beat 1 in only once the opening smoke has thinned), `isDark?`.

**Non-obvious**: beats 2–4 use `calcEnvelope`'s four-point fade (in-start,
in-end, out-start, out-end) so each beat's visible window is fully
non-overlapping with its neighbors, but beat 1 is hand-rolled with its own
`b1Opacity`/`b1Y` math rather than `calcEnvelope` — it has no fade-in
threshold (it's visible from `progress = 0`) and layers a second,
independent fade (`introFadeProgress`) on top for the opening-smoke
transition, which doesn't fit `calcEnvelope`'s single-progress-axis shape.

**Non-obvious**: within beat 2, "focus is a vector variable" and "it has
both direction and intensity" are two separately-timed lines inside the
same envelope — the first line follows `b2`'s opacity directly, but the
second line has its own delayed `line2Progress` (progress 0.39→0.44, eased
with `Math.pow(x, 1.2)`) so it only appears once the brain has finished
rotating in the companion 3D stage, not immediately when beat 2 starts.
