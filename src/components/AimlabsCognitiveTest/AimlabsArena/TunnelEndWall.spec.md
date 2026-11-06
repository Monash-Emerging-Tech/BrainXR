# TunnelEndWall

A solid black cap closing one end of the [[index|AimlabsArena]] corridor in WebXR, with the corridor's white wireframe grid and an aperture border continuing seamlessly across it so the seam is invisible.

**Props**: `z`, `width`, `height`, `wallWidthMultiplier?`, `wallHeightMultiplier?`, `isFarWall?`.

Grid/border vertex arrays come from [[tunnelEndWallGeometry]]. Only rendered when presenting in WebXR (desktop keeps the tunnel open to an infinite vanishing-point fog instead) — see [[index|AimlabsArena]].
