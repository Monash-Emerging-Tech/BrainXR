# TelemetryLogTab

The "Full Telemetry Log" tab of [[index|CognitiveReportDashboard]]: a searchable, filterable, paginated table of every trial record.

**Props**: `fullTelemetry`.

**Non-obvious**: owns all its own filter/search/round/pagination state locally (not lifted to the parent) since nothing outside this tab needs it; pagination resets to page 1 whenever a filter changes. `trialIndex <= 187` is the hardcoded Round 1/2 boundary (matches the fixed `TOTAL_TRIALS` per round in [[../sequencer]]).
