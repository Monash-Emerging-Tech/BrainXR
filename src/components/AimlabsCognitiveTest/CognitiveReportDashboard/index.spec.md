# CognitiveReportDashboard

Standalone page (`/direction/report`) showing the last completed Aimlabs session's full clinical-style report, read from localStorage via [[../reportStorage]].

No props — loads `loadLastSessionReport()` on mount. Renders a loading state, then an [[EmptyReportState]] if no session exists (with a "load demo telemetry" escape hatch via [[generateDemoReport]]), else the [[ReportHeader]], [[ClassificationHero]], [[ReportTabs]] and whichever of [[OverviewTab]] / [[TelemetryLogTab]] / [[ScienceTab]] is selected.
