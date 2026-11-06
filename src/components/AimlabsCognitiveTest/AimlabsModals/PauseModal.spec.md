# PauseModal

The in-game pause menu, shown whenever `isPaused` while a round is active: live round rules reminder, the [[../TelemetryPerformanceGraph/index|TelemetryPerformanceGraph]] for the round so far, sound/accessibility settings, and back/resume/skip actions.

**Props**: `currentRound`, `accuracy`, `soundEnabled`, `liveFocusMetrics?` (falls back to a zeroed/"Calibrating" metrics object when absent), `onResume?`, `onSkipRound?`, `onToggleSound?`, plus the shared `ScreenTransitionProps`.
