# BackgroundOscilloscopes

Full-viewport canvas behind the 3D scene, showing all 21 electrodes'
rolling 3-second waveforms.

**Props**: `historiesRef`, `frameRef`, `selectedChannel`, `highlightedChannels`, `hoveredChannel`, `onSelectChannel`, `onHoverChannel`.

Runs its own `requestAnimationFrame` loop rather than reacting to React
state — it repaints only when `frameRef.current` changes identity (a new
engine tick) or selection/hover states change, reading `historiesRef` directly.
Also directly mutates DOM text nodes for superscript µV telemetry on each lane
label to bypass React render churn.

An interactive left margin overlay renders neomorphic buttons for each of the 21
electrodes, allowing visitors to inspect or hover channels directly from the
waveform column.

Drawing itself is delegated to [[render]].
