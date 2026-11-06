# XRCanvasScreenMesh

The physical WebXR mesh that displays [[index|XRCanvasScreen]]'s baked canvas texture: a textured plane, plus (only outside gameplay) a glass backing panel and a neon edge border for modal screens.

**Props**: `texture`, `isGameplay`, `onPointerDown`, `onPointerMove`, `onPointerOut`.

**Non-obvious**: position/size swap based on `isGameplay` — centered higher and larger during live trials (clear of the target zone), centered at eye level and smaller for modals. Returns `null` until `texture` exists.
