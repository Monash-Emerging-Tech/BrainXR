# SceneBeat.tsx

Scenes 3+ of [[StoryIntroV2|StoryIntroV2]]: one beat per scroll gesture. The
text is real text, not particle-only — each piece gets the treatment it can
carry: the region name gets the particle-forming [[CellPixelText]] treatment
(reused from the question line), the role tag is a simple delayed fade, and
the body copy uses [[BeatBody]]'s inverse swell-blur with a staggered rise.
The closing line is a headline, so it reuses the name's particle treatment.
Layout comes from [[useStageLayout|useStageLayout]], the same solve that
places the brain, so the text column can never print over it.

**Props**: `beatIndex`, `layout`, `reducedMotion`, `fastForwarded?`.

**Non-obvious**: this component persists across every beat rather than being
remounted per beat — if each beat mounted its own instance, the outgoing text
would vanish instantly instead of leaving under the sweep pane, which would
have nothing to hide.

**Non-obvious**: the sweep pane's teardown lives in its own `useEffect` keyed
on `sweepKey` rather than being folded into the beat-swap effect — the swap's
`setShown` re-runs that effect, and its cleanup would cancel the very timer
meant to clear `sweeping`.

**Non-obvious**: the name's particle-formation progress and the role tag's
fade are driven by one `requestAnimationFrame` loop writing to refs and
inline styles directly, not React state — a beat costs a handful of renders
rather than one per frame.

**Non-obvious**: in reduced-motion or when `fastForwarded`, the beat swap and
the name/role animation both skip straight to their end state instead of
running the timed sweep/particle sequence.
