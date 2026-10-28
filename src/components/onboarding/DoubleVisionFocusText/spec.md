# DoubleVisionFocusText

Renders the word "focus" with a multi-layered double-vision chromatic aberration effect that resolves dynamically as the user scrolls.

## Inputs & Props
- `progress: number`: 0 to 1 scroll factor. At 0, ghost copies fan out vertically and a Gaussian blur filter obscures the word. As progress approaches 1, the offsets, blur, and opacity collapse to zero.
- `text?: string`: Word to display (defaults to `"focus"`).
- `className?: string`: Tailwind CSS layout and font sizing classes.

## Behavior
Driven by scroll scrub. Computes offset shifts across cyan, indigo, and violet chromatic layers, converging cleanly to razor-sharp OffBit typography at `progress = 1`.

