# AimlabsArena

The zooming black/white portal corridor behind the Aimlabs cognitive test (CPT/SART), rendered in both the 2D desktop canvas and WebXR.

**Props**: `speed?`, `width?`, `height?`, `isXR?` (falls back to the live `xrStore` session state when omitted).

Sets the scene background/fog (exponential in XR for 360° sensory occlusion, linear on desktop for a vanishing-point look) and composes 4 [[RoomSegment]] instances that continuously scroll and wrap to fake an infinite tunnel, plus [[TunnelEndWall]] end caps that only render in XR.

**Non-obvious**: the scene background/fog is set imperatively via a `useEffect` on `scene` and restored to its previous value on unmount/dep-change — this component is a singleton per active scene, not reentrant with other code that also touches `scene.fog`.
