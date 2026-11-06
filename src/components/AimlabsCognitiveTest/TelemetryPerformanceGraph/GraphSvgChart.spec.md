# GraphSvgChart

The actual chart for [[index|TelemetryPerformanceGraph]]: dual-axis SVG (RT ms left, accuracy % right) with inner/outer SD envelope bands, a moving-average RT line, an accuracy line, per-trial scatter dots, and an optional round-split divider.

**Props**: `data`, `count`, `meanRT`, `sdRT`, `splitIndex` (from [[detectRoundSplitIndex]]).

All scales/points come from [[chartSeries|computeChartSeries]]; this component is pure JSX over that output.
