# IntermissionModal

The two-screen handoff shown between Round 1 and Round 2 (`status === "intermission"`): first a telemetry summary of the round just finished, then the rule-reversal briefing for the round about to start.

**Props**: `round1Metrics`, `round2Metrics` (exactly one is non-null — whichever round just finished), `onStartRound2`, plus the shared `ScreenTransitionProps`.

**Non-obvious**: `intermissionStep` ("telemetry" | "rules") is local state, not a prop — it resets to "telemetry" for free each time this component remounts on entering intermission, which is why there's no explicit reset effect (see [[index|AimlabsModals]] for how status changes remount it fresh).
