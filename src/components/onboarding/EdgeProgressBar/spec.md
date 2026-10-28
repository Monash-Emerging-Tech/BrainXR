# EdgeProgressBar

Vertical edge indicator displaying current onboarding beat progress, clickable beat dots, and a top-right Skip button.

## Inputs & Props
- `activeBeat: number`: Index of current active narrative beat (0..5).
- `progress: number`: Overall 0..1 scroll progress through the onboarding flow.
- `onSkip: () => void`: Callback triggered when clicking Skip to seamlessly transition to Home.
- `onSelectBeat?: (beatIndex: number) => void`: Optional callback when user clicks a specific beat dot.

## Behavior
Renders fixed along the screen edge with backdrop-blur styling. Dots reflect completed, current, and upcoming stages of the onboarding narrative.

