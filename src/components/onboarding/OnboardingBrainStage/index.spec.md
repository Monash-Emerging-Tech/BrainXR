# OnboardingBrainRig

No props — the 3D brain shown during the onboarding scroll story, wrapping [[../../story/BrainModel|BrainModel]] (behind [[../../story/BrainFallback|BrainFallback]]/`Suspense`) and driving its position/scale/rotation/opacity entirely from `headsetPresentation.getStoryProgress()` each frame.

**Non-obvious**: every beat's pose is a hand-tuned function of the single `progress` scalar (0.28–0.94; outside that range the whole rig is hidden) — there is no per-beat component boundary, just one large `useFrame` with inline comments marking each beat's progress range. The brain and the VR headset mesh (rendered inside [[../../story/BrainModel|BrainModel]] via `showVRHeadset`) are choreographed to rotate and dock together from 0.71 onward using a shared quaternion.
