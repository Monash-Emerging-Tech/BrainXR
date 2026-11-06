# StoryIntroV2

The scroll-story v2 host: one non-scrolling gesture-driven sequence ([[useSceneRunner]]) through [[SceneOpening]] (Scenes 0-1), a white-to-black transition with [[BrainStageV2]] emerging from a second [[SmokeShader]] pass, then [[SceneBeat]] for the per-region beats (Scenes 3+).

**Props**: `onComplete`.

**Non-obvious**: the background, brain canvas, and beat panel are all owned here and persist across every scene boundary specifically so a scene change never remounts the WebGL canvas or re-triggers the model load. The brain's reveal during the to-black transition runs through 4 explicit stages (`hidden` → `armed` → `revealed` → `crisp`) rather than a plain fade-in — `hidden` uses `visibility: hidden` (not opacity) so the WebGL context stays warm underneath, and `armed` exists only so a freshly-revealed element has a prior value to transition from. Owns `document.body.style.overflow = "hidden"` for its whole lifetime (no page scroll while the story plays) and restores it on unmount. A `?v2fit=front|side` URL param switches the whole component into a static fit-debugging view instead of playing the story.
