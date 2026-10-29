# XRButton.tsx

A generic 3D pill-shaped button for WebXR: a `boxGeometry` face with a
centered `Text` label, lifting slightly on the Z axis and swapping
background/text colors on pointer hover.

**Props**: `position`, `width?`, `height?`, `depth?`, `label`, `onClick?`, `variant?` (`"primary" | "secondary"`).

**Non-obvious**: appears unused — no other file in the repo imports `XRButton`. [[IdleActionsXR]] and [[XRControlBar/index|XRControlBar]] build visually similar pill buttons from scratch (via [[pillShape|createPillShape]] + haptics) rather than using this component, so it may be dead code or an earlier iteration superseded by [[XRControlBar/XRControlPill|XRControlPill]].
