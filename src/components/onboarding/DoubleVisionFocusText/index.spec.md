# DoubleVisionFocusText

Text that visually "comes into focus": at `progress` 0 it renders 4 blurred, offset ghost copies behind the real text; as `progress` approaches 1 the ghosts fade out, the blur clears, and the text sharpens.

**Props**: `progress` (0..1, clamped), `text?` (default "focus"), `className?`.

**Non-obvious**: the blur/ghost intensity follows `(1 - progress)^1.6`, not a linear fade, so focus snaps in faster near the end than it drifts out blurry at the start.
