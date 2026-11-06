# TelemetryPerformanceGraph

The reusable RT/accuracy performance chart shown in the pause menu, intermission, and finished-report screens. Combines [[GraphHeader]] (focus badge + legend), an SVG chart ([[GraphSvgChart]]) or an empty-state placeholder, and [[GraphSummaryBar]].

**Props**: `telemetry`, `meanRT`, `medianRT?`, `sdRT`, `cv`, `accuracy`, `precision?`, `focusLevel`, `showAllTrials?` (false = only the last 35 trials), `className?`.

Round-split detection (for the vertical divider in the chart) lives in [[detectRoundSplitIndex]]; all of the chart's point/polygon math lives in [[chartSeries|computeChartSeries]] — both are recomputed on every render (not memoized), matching the original inline implementation.
