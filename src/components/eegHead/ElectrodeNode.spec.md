# ElectrodeNode.tsx

Renders one electrode's LED mesh at a fixed scale (2.1) plus an invisible,
larger hit-sphere that actually receives pointer events, with an interactive
glowing halo disc positioned outside the LED base on the headset casing upon
selection or hover.

**Props**: `name`, `geometry`, `position`, `rotation`, `isSelected?`, `isHovered?`, `onRef: (mesh) => void`, `onSelect?`, `onHover?`.

**Non-obvious**: `onRef` takes only the mesh, not `(name, mesh)` — the
electrode name is baked in by the caller (see
[[index|EEGHead]]/[[useElectrodeMeshRefs]]) so the callback's identity stays
stable across renders and this component's `React.memo` actually skips
unaffected nodes on hover/select changes.

**Non-obvious**: the mesh has no local color state — [[index|EEGHead]]'s
`useFrame` loop mutates the material directly on the ref it collects via
`onRef`, lerping toward [[../../utils/electrodeVisualState|computeElectrodeVisualState]]'s
target each frame. When `isSelected` (or `isHovered`), a glowing halo disc
pulsing to the cortical region's color illuminates outside around the base of the LED on the headset casing.
`onClick`/`onPointerDown` selects the electrode with WebXR haptics.

**Non-obvious**: the visible LED mesh has `raycast={() => null}` and carries
no pointer handlers — a separate, invisible (`visible={false}`) sphere mesh
(`sphereGeometry` radius `baseRadius * 3`, comfortably past the ring's own
outer edge) carries `onClick`/`onPointerDown`/`onPointerEnter`/`onPointerLeave`
instead. The visible dome is only a few cm across at real-world scale and
sits flush against the headset shell's curved surface, so an XR controller
ray aimed at it can land on the shell mesh instead of the tiny dome —
`visible` only affects rendering, not raycasting, so this sphere is a much
easier, invisible-but-solid target without changing how the node looks.

**Non-obvious**: the halo ring's `<group>`/`<mesh>`/geometry/material are
always mounted, with visibility toggled via `visible={isSelected || isHovered}`
on the inner group rather than conditionally rendering the JSX — an XR
controller ray can fire dozens of hover transitions per second sweeping
across the 21 nodes, and mount/unmount would reallocate the ring geometry
and material (GPU buffer upload) on every single one.

**Non-obvious**: `handleClick`/`handlePointerEnter`/`handlePointerLeave` all
early-return when `e.pointerType === "grab"`. In XR, "grab" is the grip
button's near-field proximity pointer (see
[[../HeadWrapper/useXRDragInteraction|useXRDragInteraction]], bound to grip
for repositioning the headset) — this keeps a gripping hand that merely
brushes close to a node from selecting/hovering it. Selection stays scoped
to the trigger ("ray" pointerType in XR) and desktop mouse ("mouse").

