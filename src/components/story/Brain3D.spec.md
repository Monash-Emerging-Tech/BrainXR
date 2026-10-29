# Brain3D.tsx

The `Canvas` wrapper that hosts the real [[BrainModel|BrainModel]] (behind
[[BrainFallback|BrainFallback]] + `Suspense`) plus [[SmokeBurst|SmokeBurst]].
Also defines `ShellAndMarkers`, a procedural wireframe-shell-and-markers
brain used both as the `Suspense`/error fallback and, historically, as a
standalone placeholder before a real model existed. Used only by
[[Act2|Act2]].

**Props**: `regions`, `activeIndex`, `opacity?`, `smokeRise?` (undefined =
no smoke), `smokeClear?`, `scale?`, `prefrontal?`, `pulse?`,
`reducedMotion?`, `offsetY?`, `className?`.

**Non-obvious**: `ShellAndMarkers` has no real anatomy to derive a facing
from (unlike `BrainModel`'s centroid-based front axis), so it just spaces
`regions` evenly around the shell by index and angle-damps toward the
active one.
