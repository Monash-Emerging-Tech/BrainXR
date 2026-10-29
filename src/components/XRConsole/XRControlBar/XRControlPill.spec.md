# XRControlPill.tsx

A reusable rounded-pill 3D button used throughout [[index|XRControlBar]]
(prev/pause/speed/next, exit) with per-`variant` color themes, a disabled
state, hover-driven elevation/glow, and haptic feedback.

**Props**: `label`, `onClick?`, `width?`, `height?`, `fontSize?`, `variant?`
(`"primary" | "secondary" | "active-baseline" | "active-stimulus" |
"danger" | "neutral"`), `disabled?`, `position?`.

**Non-obvious**: the button's clickable mesh, outline, and label all share
one `pillShape` built via [[../pillShape|createPillShape]], and each layer
is pushed slightly forward (`zElev`) and tagged `raycast={() => null}` on
the outline/label — only the base mesh is a raycast target, so hover/click
can't be stolen by the thin outline or the text glyphs sitting in front of
it.

**Non-obvious**: `active-baseline`/`active-stimulus` variants exist so the
same pill (the Play/Pause button, and the 1x/10x speed toggles) can signal
which trial phase is currently active without a separate "active" boolean
prop — the caller just picks the variant name matching the current phase.
