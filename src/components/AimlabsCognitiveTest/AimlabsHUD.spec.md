# AimlabsHUD.tsx

Always-on desktop overlay during an active round: exit button, cumulative
reaction-time/accuracy readout, the round's Go/No-Go color-coding rule
cards, a center fixation cross, and a transient hit/miss feedback toast.

**Props**: `score`, `accuracy`, `round` (`1 | 2`), `recentFeedback` (`{ text,
color } | null`), `onExit`.

**Non-obvious**: the whole root `div` is `pointer-events-none` with only the
exit button opting back in via `pointer-events-auto` — this overlay sits on
top of the 3D canvas and must not block clicks/spacebar response handling
in [[AimlabsScene|AimlabsScene]] except at the exit button itself.

**Non-obvious**: Round 1 (CPT) and Round 2 (SART) swap which shape means
"press" — this component re-renders the rule cards per `round` rather than
reusing one static legend, since the mapping inverts between rounds by
design (sustained attention vs. response inhibition).
