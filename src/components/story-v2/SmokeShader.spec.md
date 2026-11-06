# SmokeShader

Full-screen domain-warped fbm-noise fragment shader used for both of scroll-story v2's smoke beats (near-black ink pouring on white for Scene 1, pale glow on black for Scene 2) — one shader, parameterized by color/opacity/blend mode rather than duplicated.

**Props**: `reachRef` (live 0..1 radial growth), `densityRef` (live 0..1 pour-then-clear envelope), `color?`, `maxOpacity?`, `additive?` (true = additive blending so pale smoke glows instead of greying out the background), `className?`.

**Non-obvious**: `reachRef`/`densityRef` are read every frame inside `useFrame`, not passed as reactive props — a per-frame prop would force a React re-render on every tick. `v2Debug.smokeFrames` is incremented each frame specifically so the dev HUD can distinguish "shader drawing but invisible" from "shader never ran" (a failed WebGL context and a correctly-rendering empty frame look the same on screen).
