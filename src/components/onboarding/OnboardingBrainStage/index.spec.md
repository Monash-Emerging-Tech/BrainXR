# OnboardingBrainStage/index.tsx

Exports `OnboardingBrainRig`, a scrollymation rig that drives
[[../../story/BrainModel|BrainModel]]'s position/rotation/scale/opacity
purely from [[../../../utils/headsetPresentation|headsetPresentation]]'s
story-progress value (no props), so the brain rotates, re-scales, fades,
and eventually docks under the Apple Vision Pro headset in lockstep with
onboarding scroll. Mounted by [[../../HeadWrapper/index|HeadWrapper]]
alongside the live digital twin head.

**Non-obvious**: entirely driven off one external progress number
(`headsetPresentation.getStoryProgress()`) rather than props — hides itself
(`group.visible = false`) whenever progress is `null` or outside
`[0.28, 0.94]`, so it's dormant for the rest of the onboarding flow and the
main Digital Twin head takes over.

**Non-obvious**: the per-frame `Euler`/`Quaternion`/`Vector3` scratch
objects (`_eulerTemp`, `_quatTemp`, `_quatTurn`, `_vecTemp`) are module-level
singletons, not created inside `useFrame` — this runs every animation frame,
so reusing them avoids an allocation (and GC pressure) on each tick.

**Non-obvious**: past `progress >= 0.71` (beat 4), the brain's rotation is
not computed independently — it copies the headset's quaternion and then
multiplies by a fixed `-90°` yaw correction (`_quatTurn`) because the brain
model's raw local "forward" axis is +X while the headset's is +Z. Before
that point (beats 2–3), the brain animates its own yaw instead of locking
to the headset.

**Non-obvious**: `BrainModel` is wrapped in both
[[../../story/BrainFallback|BrainFallback]] and `React.Suspense`, sharing
the same memoized wireframe icosahedron as fallback for either — a loading
delay (Suspense) and a hard failure (BrainFallback's error boundary) get
the same placeholder so the onboarding scene never shows a blank gap.
