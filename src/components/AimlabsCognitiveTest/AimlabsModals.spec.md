# AimlabsModals.tsx

Full-screen status-driven screens for the desktop cognitive test flow:
pre-game rules ("ready"), per-round countdown with Go/No-Go rules
("countdown"), between-rounds results ("intermission"), and final results
("finished"). Renders `null` for any other `status`. Includes a local
decorative floating sphere/box background (`ModalDecorativeField`) and a
letter-spaced heading helper (`SpannedText`) used across the screens.

**Props**: `status` (`GameStatus`), `countdown`, `round`, `round1Metrics`,
`round2Metrics` (`RoundMetrics | null`), `onStartGame`, `onStartRound2`,
`onRestart`, `onExit`.

**Non-obvious**: `onRestart`/`onExit` are wrapped through a local
`handleAction` that triggers a 320ms fade-out (`isFadingOut`) before firing
the callback, but `onStartGame`/`onStartRound2` are called directly with no
fade — starting a round immediately hands control to the "countdown"
screen (another full-screen overlay), so there's nothing visually jarring
to transition away from, while exit/restart drop back to a different UI
and need the fade to avoid a hard cut.

**Non-obvious**: `mounted` is set via a 20ms `setTimeout` on every `status`
change purely to retrigger the CSS mount transition (`opacity`/`scale`) on
each new screen — toggling it synchronously on mount wouldn't let the
browser register the "from" state before animating to the "to" state.
