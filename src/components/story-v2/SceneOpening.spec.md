# SceneOpening.tsx

Scenes 0 and 1 of [[StoryIntroV2|StoryIntroV2]] in one component, so the
wordmark is never remounted between them and the swallow has no seam: scene
0 is the resting BRAINXR wordmark; scene 1 swallows it into the screen center
(accelerating, blurring, fading), holds white, erupts black smoke from that
same point, forms the question line out of where the smoke was, holds, then
brings in FOCUS?? via [[DoubleVisionText]].

**Props**: `sceneIndex` (0 = landing rest, 1 = the sequence), `playing`,
`startedAt`, `fastForwarded`, `reducedMotion`.

**Non-obvious**: one `requestAnimationFrame` loop drives the whole 14s
timeline and writes to refs (`reachRef`, `densityRef`, `lineRef`, `swellRef`,
`focusRef`) read directly by children's own animation loops — React state
(`showLine`/`showFocus`/`showSmoke`) only flips at coarse milestones, so the
scene costs a handful of renders rather than one per frame.

**Non-obvious**: the wordmark reuses [[../IdleSplash|IdleHeadline]] (`variant="solid"`)
so the type is pixel-identical to the idle screen, then repositions it to
screen-center with scoped CSS overrides — `IdleSplash` itself pins it near
the top of the page.

**Non-obvious**: `DoubleVisionText` mounts as soon as `showLine` is true, not
only once `showFocus` flips — the text column must reserve FOCUS??'s slot
from the start, or line 1 visibly jumps up the screen the instant the word
appears; it stays invisible until `focusRef` begins advancing.

**Non-obvious**: the smoke density envelope during the pour/clear is a
`0 → 1 → 0` curve, and `v2Debug.stage` is recomputed every frame purely as
free telemetry for [[DebugHud]] — it's a single mutated object, not a
React state update, so it costs nothing when the HUD is off.

**Non-obvious**: `lineFontSize` is derived from live viewport width
(`vw`, re-measured on resize) clamped between `cells.lineMinPx`/`lineMaxPx`
in [[storyContentV2]], so the centering survives a window resize mid-scene.
