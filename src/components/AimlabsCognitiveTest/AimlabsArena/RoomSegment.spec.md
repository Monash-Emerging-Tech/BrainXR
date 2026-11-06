# RoomSegment

One 30m-deep slice of the [[index|AimlabsArena]] corridor: an instanced mesh of floor/ceiling/wall tile panels plus a matching wireframe grid, continuously translated toward the player and wrapped back behind once it passes.

**Props**: `initialZ`, `depthSegment`, `totalLength`, `speed`, `width?`, `height?`.

Panel transforms are computed once on mount (`useEffect`, imperatively via `setMatrixAt`/`setColorAt` on the `InstancedMesh` ref). Each frame's `useFrame` handles the scroll/wrap, a 1.5s fade-in, and randomly recolors ~3.5% of panels every 80ms for the "lively" flicker effect, using [[tileColors|getRandomTileColor]]. The static line geometry comes from [[roomWireframe|buildRoomWireframeVertices]].

**Non-obvious**: the wireframe vertex math and tile color palette are pure functions in sibling files specifically so they can be read/changed without touching the ref-mutating mount effect or the per-frame loop.
