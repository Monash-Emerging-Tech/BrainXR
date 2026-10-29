# AimlabsTarget.tsx

Renders the single Go/No-Go stimulus at the center of the arena: a cyan
sphere ("Go" in Round 1, "No-Go" in Round 2) or a red box (the inverse),
spinning on two axes while visible.

**Props**: `type` (`"sphere" | "box"`), `visible`, `position?` (defaults to
`[0, 1.6, -4.5]`), `onClick?`.

**Non-obvious**: returns `null` entirely when `!visible` rather than hiding
via opacity/scale — [[aimlabsStore|aimlabsStore]] flips `isTargetVisible`
off the instant a response lands (see `handleResponse`), so the target must
disappear on the same render, not fade.

**Non-obvious**: only the box spins (`groupRef.current.rotation` updated in
`useFrame`); the sphere is rotationally symmetric so spinning it would be
wasted work.
