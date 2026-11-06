# VRHeadset

A detailed 3D model of an Apple Vision Pro-style headset (laminated glass front, EyeSight display, aluminum frame, Digital Crown, knit band), used in the onboarding story's Intensity beat.

**Props**: `mountProgress?` (0..1, default 1), `mountProgressRef?` (if given, read every frame instead of the `mountProgress` prop, for scroll-driven animation without re-render), `isTracking?` (drives the EyeSight display's breathing emissive pulse).

**Non-obvious**: mount progress animates a slide-in-and-scale-up (not just opacity) via a `useFrame` mutating `slideGroupRef` directly, and the group is hidden (`visible = false`) entirely below `p > 0.005` rather than rendered at 0 scale.
