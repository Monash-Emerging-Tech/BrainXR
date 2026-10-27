# TrialProgressBar

Demo Mode's floating bottom timeline: top guidance banner ("pinch and click nodes to explore what EEG headsets do" in EEG node gradient colors), 40 connected [[TrialSegment]]s (with contextual floating phase badge over the active segment), plus a "Trial N of 40" readout and elapsed-time readout ([[formatTime]]).

**Props**: `trialElapsed` (0-63), `phase`, `trialIndex`, `onTrialSelect(index, startOffset?)`.
