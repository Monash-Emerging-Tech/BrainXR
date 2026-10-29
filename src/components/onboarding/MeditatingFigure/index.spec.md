# MeditatingFigure/index.tsx

A minimalist vector SVG of a figure seated in lotus posture, with an
indigo/cyan gradient outline, a soft ambient aura, and a pulsing node on the
forehead that visually introduces the prefrontal cortex before the onboarding
flow transitions into the 3D digital twin headset.

**Props**: `className?`, `glowPrefrontal?` (enlarges/highlights the forehead
node), `isDark?` (swaps the gradient/aura stops for the dark theme).

**Non-obvious**: the whole SVG carries a CSS `animate-breathe` class for a
continuous idle breathing motion, independent of the `glowPrefrontal` scale
transition on the forehead node — the two animations run concurrently and
are not coupled to each other.
