# SmokeBurst.tsx

Procedural smoke sprites drawn inside the brain's own `Canvas` (rather than
a flat DOM overlay) so puffs sit at real depths and can be occluded by the
brain mesh. The texture is a radial gradient painted onto an offscreen 2D
canvas — no image asset. Rendered by [[Brain3D|Brain3D]] while
`smokeRise`/`smokeClear` are active.

**Props**: `rise` (0..1, time-based climb), `clear` (0..1, scroll-based split-and-clear).

**Non-obvious**: `rise`/`clear` are mirrored into refs and read inside
`useFrame` rather than captured directly, so a scroll-driven prop change
doesn't tear down and rebuild the sprite group on every tick.

**Non-obvious**: every puff's position/scale/opacity is computed from
scratch each frame as an absolute function of `time`/`rise`/`clear` — never
accumulated onto the previous frame's value. An earlier version added
per-frame deltas, which let a slow sine integrate into steady linear drift
and sent the whole cloud wandering off in one direction.

**Non-obvious**: puffs alternate `side: -1/+1` for an even left/right split
when `clear` drives them out through the vertical centers of the screen
edges; jitter in every other field keeps the two flows from mirroring
exactly. `spriteMaterial` has `depthWrite={false}` (puffs blend with each
other) but depth testing stays on (the brain still occludes puffs behind it).
