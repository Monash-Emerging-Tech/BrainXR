# BrainStageV2

v2's host for [[../story/BrainModel|BrainModel]]: fits the brain to a fixed fraction of the viewport via [[useStageLayout]] instead of a hand-tuned `scale` prop, and places it inside a shared rig group alongside the EEG headset so both can turn/dock together in Act 3.

**Props**: `layout`, `onMeasured?` (fired once with the model's measured span/height/width), `activeIndex`, `prefrontal?`, `pulse?`, `reducedMotion?`, `className?`, `headset?` (mounts [[../eegHead/index|EEGHead]] in the rig), `poseRef?` (when set, drives the rig directly instead of the layout solve — read every frame, not reactive), `cameraRef?`, `debugFit?` (dev: publishes brain/headset bounding boxes to `window.__v2fit`).

**Non-obvious**: the model's footprint is measured as an XZ bounding-cylinder radius (`localBox`/`measureModel`), not a 3D bounding sphere or swept circle — both of those over-estimate an ellipsoid-shaped brain's on-screen footprint and were pushing it off-center. Exports `BrainMetrics`/`localBox` for [[StoryIntroV2]] and `preloadHeadset()` to prefetch the 3.4MB headset model ahead of Act 3.
