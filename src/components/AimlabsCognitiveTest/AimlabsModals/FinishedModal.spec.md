# FinishedModal

The session-complete report (`status === "finished"`, both rounds done): overall focus classification, headline metrics, the [[../TelemetryPerformanceGraph/index|TelemetryPerformanceGraph]], a round-by-round comparison table, and the 3 exit actions (detailed report / play again / home).

**Props**: `round1Metrics`, `round2Metrics` (both required, session is complete), `liveFocusMetrics?` (fallback telemetry source if both rounds' tables are empty), `onRestart`, plus the shared `ScreenTransitionProps`.

Combines both rounds' stats with the same math as [[../aimlabsStore/sessionReport|buildSessionReport]], and classifies overall focus via [[../aimlabsStore/focusClassification/index|classifySessionFocus]] rather than re-deriving the thresholds inline.
