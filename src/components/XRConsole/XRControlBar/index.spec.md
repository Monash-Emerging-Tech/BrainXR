# XRControlBar/index.tsx

The main floating playback/telemetry card shown below the headset in WebXR
during Demo/Live Mode, rendered by [[../index|XRConsole]] alongside
[[../XRCylinderWall/index|XRCylinderWall]] and
[[../XRAudioErrorAlert|XRAudioErrorAlert]]. Shows trial number, phase badge,
elapsed time, a baseline/stimulus dual progress bar, focus telemetry,
auditory-stimuli info, and prev/pause/speed/next transport controls built
from [[XRControlPill]].

**Props**: `frameRef`, `selectedChannel`, `speed?`, `isPaused?`,
`onTrialSelect?`, `onTogglePlayPause?`, `onSetSpeed?`, `onExitXR?`,
`audioError?`, `headPositionRef?`, `headRotationRef?`, `panelPositionRef?`,
`panelRotationRef?`.

**Non-obvious**: the whole card is grab-draggable via
[[../../HeadWrapper/useXRDragInteraction|useXRDragInteraction]], with
`constrainPosition` calling
[[../../HeadWrapper/spatialCollision|resolvePanelPosition]] against
`headPositionRef` so the panel can't be dragged to overlap the user's head.
`headRotationRef` is accepted but currently unused by that constraint
(destructured as `_headRotationRef`).

**Non-obvious**: `TOTAL_TRIALS`/`BASELINE_DURATION`/`STIMULUS_DURATION`/
`TOTAL_DURATION` are hardcoded constants describing the DEAP trial protocol
(3s baseline + 60s stimulus) rather than being read from `frame` — they must
stay in sync with the actual trial data if the protocol ever changes.
