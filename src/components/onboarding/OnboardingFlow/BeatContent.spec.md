# BeatContent

The scroll-driven text overlay for [[index|OnboardingFlow]]'s first 4 beats (Origin/Focus intro, "Focus is a Vector Quantity", Direction of Focus, Intensity of Focus), all keyed off a single `progress` scalar.

**Props**: `progress` (0..1), `introFadeProgress?` (fades Beat 1 in as the intro smoke clears), `isDark?`.

**Non-obvious**: every beat's enter/exit opacity and vertical slide is a hand-tuned envelope over hardcoded `progress` ranges (via `calcEnvelope`/`clamp01` from [[useOnboardingScroll]]) — there's no discrete "current beat" state, beats can visually overlap or gap by design (e.g. the "BrainXR" wordmark stays locked onscreen across Beats 3 and 4 while the badge/lead-in text above it swaps). The "Prefrontal Cortex Activated" badge blink (0.385–0.425) is a `sin` scroll-position oscillation, not a CSS animation, kept in lockstep with [[../OnboardingBrainStage/index|OnboardingBrainRig]]'s matching blink.
