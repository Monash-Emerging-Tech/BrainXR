# TrialSegment.tsx

One trial's slot in the 40-trial connected timeline: a baseline circle
(3s) followed by a stimulus bar (60s), clickable independently to seek to
that phase (`onTrialSelect(index, 0)` for baseline, `onTrialSelect(index, 3)`
for stimulus start).

**Props**: `index`, `isActive`, `isPast`, `phase`, `trialElapsed`, `onTrialSelect`.

Only the active segment (`isActive`) shows live fill progress and expands
via `flex-[30]`; past segments render fully filled, future segments empty.
Active segment features a contextual floating phase indicator badge ("Baseline Phase" / "Stimulus Phase") hovering directly above it with glowing indicator pulses, smoothly sliding from the baseline circle (`left-0`) to the start of the stimulus bar (`left-4`) when transitioning to the stimulus phase.
