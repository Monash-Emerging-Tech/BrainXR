# BrainStageV2.tsx

v2's brain stage: a fork of v1's [[../story/Brain3D|Brain3D]] (which stays
untouched) that renders [[../story/BrainModel|BrainModel]] inside a
`<Canvas>`, sized as a fixed fraction of the viewport and placed by
[[useStageLayout|useStageLayout]] — the same solve that places the text
column — rather than v1's hand-tuned `scale` prop.

**Props** (`BrainStageV2Props`): `layout`, `onMeasured?`, `activeIndex`,
`prefrontal?`, `pulse?`, `reducedMotion?`, `className?`, `headset?` (mounts
[[../eegHead/index|EEGHead]] in the same rig), `poseRef?` (drives the rig
directly for Act 3 instead of the layout), `cameraRef?`, `debugFit?` (dev
only, publishes brain/headset boxes to `window.__v2fit`).

**Non-obvious**: the model's footprint is measured once (`measureModel`) as
`span` (the longer of its X/Z extents — bounds the silhouette at every Y
rotation angle), `height` (Y extent, exactly invariant under the beats'
Y-only rotation), and `width` (the *shorter* horizontal extent — what faces
the camera head-on). Two earlier, simpler bounds were tried and rejected: a
full 3D bounding sphere folds the vertical extent into the horizontal bound
and under-sized the brain by 10 points of viewport height on a 1080p screen;
a swept circumscribed circle over-bounds an ellipsoid's silhouette and kept
shoving the brain 150px off-center to clear text it was nowhere near.

**Non-obvious**: `localBox` measures in the root's own local space (undoing
`matrixWorld`) using per-mesh bounding spheres rather than `Box3.setFromObject`,
because the latter gives a world-space AABB of the geometry *as currently
rotated* — not a rotation-independent measurement.

**Non-obvious**: the brain is never placed directly — it sits inside a rig
group at `STORY_V2.act3.brainFit` in the headset's local space, with the
headset as a sibling in the same rig. Before Act 3 the rig's transform is
solved every frame from the layout (so the brain lands exactly where
`useStageLayout` wants it); in Act 3 `poseRef` drives the rig instead, so
brain and headset turn and scale as one.

**Non-obvious**: `inner.position`/`scale` (the fit) are reapplied every
`useFrame`, not once — this lets a nudge to `STORY_V2.act3.brainFit` show up
immediately on hot reload during tuning.

**Non-obvious**: measurement only runs once (`spanRef.current <= 0` gate)
since the model arrives async through Suspense — the rig keeps checking each
frame until there's something to measure, then stops.

**Non-obvious**: a wireframe icosahedron placeholder is rendered immediately
(not `null`) while the model loads, so the stage is never empty and the fit
solve has *something* to measure from the very first frame.
