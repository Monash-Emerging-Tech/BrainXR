# OnboardingFlow

Composition root for the unified continuous-scroll onboarding narrative.

## Inputs & Props
- `onComplete: () => void`: Invoked when user completes the scroll track or clicks Skip, seamlessly completing the transition to Home.
- `onHeadsetOpacity?: (opacity: number) => void`: Holographic opacity control for the 3D Digital Twin headset.
- `onHighlightPrefrontal?: (active: boolean) => void`: Controls prefrontal electrode pulsation on the 3D Digital Twin headset.
- `onSetPresentationStage?: (stage: HeadsetPresentationStage) => void`: Switches the 3D Digital Twin headset between `"hidden"`, `"prefrontal"`, and `"showcase"`.

## Behavior
Starts with a full-screen high smoke screen that covers the entire display. As the smoke rolls outward and resolves, it reveals the opening question ("have you wondered what makes you") and the interactive double-vision "focus" scrub. Subsequent beats introduce the vector variable with the rotating 3D brain, the Spatial Direction beat placing a 3D VR Headset on the brain with projected gaze vectors, the Intensity beat demonstrating the 3D Digital Twin EEG headset measuring the prefrontal cortex, and a seamless return to Home.
