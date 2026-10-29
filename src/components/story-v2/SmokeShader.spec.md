# SmokeShader.tsx

Scene 1/2's smoke: one full-screen fragment shader using domain-warped fbm
noise (noise sampled through noise, so structure curls and tears instead of
merely translating) rather than sprites, which read as a handful of soft
blobs no matter how many are stacked. Used by both [[SceneOpening]] (near-black
smoke over white, normal blending) and [[StoryIntroV2|StoryIntroV2]]'s
scene 2 (pale grey over black, additive blending).

**Props** (`SmokeShaderProps`): `reachRef` (live 0..1 radial growth),
`densityRef` (live 0..1 pour-then-clear envelope), `color?`, `maxOpacity?`,
`additive?`, `className?`.

**Non-obvious**: one shader serves both smokes — color, peak opacity and
blend mode are a uniform/prop rather than a second copy of the shader, since
a duplicate would be two things to keep in step for no gain. `additive`
blending is what makes pale smoke glow on black; normal blending there would
paint a flat grey rectangle instead.

**Non-obvious**: `uReach`/`uDensity`/`uTime` are pushed into the shader's
uniforms from `useFrame`, not re-passed as React props — the uniforms object
is built once per mount (`useMemo` with an empty dep array, deliberately
bypassing `react-hooks/exhaustive-deps`) so a live value change never rebuilds
the material mid-scene; only `color`/`maxOpacity` get a dedicated effect since
they can change between scene instances.

**Non-obvious**: `v2Debug.smokeFrames` is incremented every frame purely so
[[DebugHud]] can distinguish "the smoke is drawing but invisible" from "the
smoke never drew at all" — a shader that fails to compile and a
zero-size canvas look identical on screen otherwise; `onCreated` similarly
records `v2Debug.smokeError` when no WebGL context is available.

**Non-obvious**: the mesh has `frustumCulled={false}` and the shader ignores
the camera entirely (`gl_Position = vec4(position.xy, 0, 1)`) — it's a literal
full-screen quad, not a 3D object the camera could cull.
