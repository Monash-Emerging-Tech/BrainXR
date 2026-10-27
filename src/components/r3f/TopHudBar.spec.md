# TopHudBar.tsx

Composes [[BackButton]], the prominent center Focus Sensors monitor, and the Enter VR button into
the top HUD nav bar shown whenever the app isn't idle.

**Props**: `engine` (`PlaybackEngine`) — takes the whole engine object rather
than individual fields since it just forwards pieces to its three children.
