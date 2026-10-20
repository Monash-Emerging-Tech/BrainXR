# Headset presentation stages

`headsetPresentation.ts` is the integration boundary between the onboarding
story (Person A) and the 3D headset presentation (Person B).

Person A can call `setHeadsetPresentationStage(stage)` without importing or
manipulating Three.js objects:

- `hidden`: eases the headset down to zero scale while the brain-only story is shown.
- `showcase`: reveals the headset and runs the slow landing-page showcase motion.
- `electrodes`: settles into a closer front pose and highlights all electrode nodes.
- `prefrontal`: rotates to FpZ and highlights Fp1, FpZ, Fp2, and Fz.
- `interactive`: returns to the normal free exploration pose.

Entering Demo or Live mode forces the effective stage to `interactive`, so a
partially completed onboarding cannot leave the functional experience hidden
or locked in a guided pose. Selecting a node always takes focus priority.
