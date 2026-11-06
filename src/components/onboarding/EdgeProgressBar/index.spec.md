# EdgeProgressBar

The right-edge beat tracker for [[../OnboardingFlow/index|OnboardingFlow]]: one dot per beat (Origin/Focus/Vector/Direction/Intensity) joined by fill-animated rail segments, plus a top-right Skip button.

**Props**: `activeBeat`, `progress` (0..1 overall), `isDark?`, `onSkip`, `onSelectBeat?` (clicking a dot jumps to that beat).

Exports `BEAT_THRESHOLDS` — the progress breakpoints at which each beat is considered reached, shared with whatever drives `progress`. Fades the whole bar out as `progress` passes 0.93 (home page assembling) and stops accepting pointer events once mostly faded.
