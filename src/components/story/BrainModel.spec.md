# BrainModel.tsx

Loads and renders the real segmented brain GLB (a Sketchfab export), giving
each named lobe its own tintable/glowable material and animating the active
region's highlight, the finale's prefrontal glow, and the CENTRAL band.
Used by [[Brain3D|Brain3D]] (wrapped in [[BrainFallback|BrainFallback]] +
`Suspense`) and directly by [[../story-v2/BrainStageV2|BrainStageV2]] and
[[../onboarding/OnboardingBrainStage/index|OnboardingBrainStage]].

**Props**: `activeIndex`, `prefrontal?`, `pulse?`, `reducedMotion?`,
`prefrontalColor?`, `customYaw?`, `customYawRef?`, `showVRHeadset?`,
`vrHeadsetMount?`, `vrHeadsetMountRef?`, `children?`, `stageOpacityRef?`,
`depthWrite?`, `depthWriteRef?`, `prefrontalRef?`.

**Non-obvious**: the GLB is large units, off-centre, Z-up under a root node
that rotates it Y-up, and every lobe shares the same three source materials.
The "front" axis is therefore *derived* at build time from the
`frontal1`/`occipit1` mesh centroids rather than hardcoded, so re-exporting
the model cannot silently break the region tour; CENTRAL has no mesh of its
own and is drawn as a glowing band injected into the frontal and parietal
materials at the midpoint between them.

**Non-obvious**: every region gets its OWN `MeshStandardMaterial` clone
(via `material.onBeforeCompile`, patched with custom rim/front-glow/band
uniforms and `customProgramCacheKey`) because the source meshes share three
materials — tinting a shared one would light every lobe at once. Materials
are disposed in a `useEffect` cleanup keyed on the built scene.

**Non-obvious**: most numeric props (`customYaw`, `showVRHeadset`'s mount
progress, `stageOpacity`, `depthWrite`, `prefrontal`) have a `*Ref` sibling
that takes priority when set — callers driving animation off a scroll rig
write into the ref so `useFrame` reads it every frame without re-rendering
this component 60-120 times a second.

**Non-obvious**: meshes with fewer than `CFG.minMeshVerts` vertices are
dropped on build — the source GLB ships tiny annotation pins/label cards
that would otherwise float as spikes. Anything not inside a named
`BRAIN_REGIONS` node (brainstem, deep structures, corpus callosum) gets a
separate permanently-ghosted `restMaterial` so the brain still reads as a
whole organ.
