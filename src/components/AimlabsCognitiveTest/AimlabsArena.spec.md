# AimlabsArena.tsx

Static Aimlabs-style training-box environment: checkered floor, four
procedurally-textured walls, ceiling, light fixtures, and accent trim/LED
strips. No props, no per-frame logic — purely scenery around the stimulus
in [[AimlabsScene|AimlabsScene]].

**Non-obvious**: `floorTexture`/`wallTexture` come from
[[textures|createCheckerboardFloorTexture/createGridWallTexture]] and are
memoized with an empty dependency array so the same `THREE.Texture`
instance is reused across re-renders (e.g. HUD score updates) instead of
regenerating the procedural canvas texture every time.
