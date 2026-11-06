# AimlabsModals

Picks which full-screen modal to show for the current Aimlabs game `status`/`isPaused`, and owns the fade transition shared by all of them.

**Props**: `status`, `countdown`, `currentRound`, `round1Metrics`, `round2Metrics`, `isPaused?`, `accuracy?`, `soundEnabled?`, `liveFocusMetrics?`, `onStartGame`, `onStartRound2`, `onRestart`, `onExit`, `onResume?`, `onSkipRound?`, `onToggleSound?`.

Renders one of [[CountdownOverlay]], [[ReadyModal]], [[IntermissionModal]], [[FinishedModal]], [[PauseModal]], or nothing, based on `status`/`isPaused`. `mounted`/`isFadingOut` (a 20ms mount delay plus a 280ms fade before any action callback fires) are threaded into each screen via the shared `ScreenTransitionProps` shape in `screenTransition.ts`.

**Non-obvious**: `mounted` is only ever set `true`, never reset — once the first screen has painted it stays true for the component's lifetime, even as `status` switches between screens.
