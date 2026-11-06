# AimlabsHUD

2D desktop overlay HUD for the Aimlabs cognitive test (CPT/SART): back/pause buttons, a live telemetry readout (mean RT, accuracy, precision, omission rate), the current round's go/no-go stimulus-mapping cards, a central fixation cross, transient hit/miss feedback text, and an Esc pause/resume hint.

**Props**: `score`, `accuracy`, `round`, `status?`, `recentFeedback`, `isPaused?`, `liveFocusMetrics?`, `onExit`, `onTogglePause?`.

**Non-obvious**: the "Mean" readout falls back to `score` (not a time value) when `liveFocusMetrics` has no RT data yet — only meaningful before the first few trials complete.
