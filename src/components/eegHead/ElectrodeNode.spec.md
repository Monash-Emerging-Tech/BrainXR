# ElectrodeNode.tsx

Renders one electrode's clickable LED mesh at a fixed scale (2.1), with an interactive glowing halo disc positioned outside the LED base on the headset casing upon selection or hover.

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

