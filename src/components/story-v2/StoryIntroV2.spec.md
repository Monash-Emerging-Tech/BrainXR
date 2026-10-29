# StoryIntroV2.tsx

The "story v2" host (gated behind `?story=v2`/`legacyStoryVersion`, see
[[../r3f/index|r3f/index]]): a non-scrolling intro where one gesture plays
the next scene in full, driven by [[useSceneRunner|useSceneRunner]]. Owns
everything that must persist across scenes — the black glass background,
the brain canvas ([[BrainStageV2]]), and the beat panel ([[SceneBeat]]) — so
crossing a scene boundary never remounts the WebGL canvas or restarts the
model load. v1 ([[../story/StoryIntro|StoryIntro]]) is untouched and still
reachable with `?story=v1`.

**Props**: `onComplete`.

**Non-obvious**: scene 2 (white → glossy black → brain reveal) runs through
a four-value `brainStage` state machine (`hidden` → `armed` → `revealed` →
`crisp`) rather than a single reveal flag. This fixes a prior bug where the
reveal was keyed to the brain mounting (which happened the instant scene 2
began), so the 4s brain reveal ran concurrently with the white-to-black fade
and there was no real black hold. `hidden` uses `visibility: hidden` (paints
nothing) rather than low opacity so the WebGL context and model stay warm;
`armed` is one frame at the hidden state because a freshly revealed element
cannot transition from a value it never held; `crisp` drops the blur/transform
entirely since a blur left on a live WebGL canvas keeps an extra layer alive
and resampled every beat thereafter.

**Non-obvious**: the white smoke the brain "emerges from" is rendered on top
of the brain layer, not behind it — the brain fading up underneath the smoke
is what sells it as emerging from inside the cloud rather than appearing
beside it. Its clear is timed against `TO_BLACK_MARKS` so it is fully gone at
the exact frame the brain becomes crisp, by construction (see
[[storyContentV2|storyContentV2]]).

**Non-obvious**: the smoke's density ramp during its clear phase is eased
(`1 - t*t`), not linear — linear spent most of the reveal as a barely-there
haze, making the brain read as appearing next to the smoke instead of out of
it.

**Non-obvious**: scenes 0–1 ([[SceneOpening]]) stay mounted through scene 2
(`index <= TO_BLACK_SCENE`) instead of unmounting — the scene-2 text blur
needs something present to blur away from, and mounting a fresh copy to
animate out would start it already at its end state.

**Non-obvious**: the white-to-black transition is driven by a CSS custom
property (`--v2-black-ms`) and CSS transitions, not a JS animation loop — the
compositor interpolates the color, avoiding banding/dropped frames and any
per-frame React render.

**Non-obvious**: `fitPreview` (`?v2fit=front|side`) short-circuits the whole
component into a static, still brain-in-headset render for tuning
`STORY_V2.act3.brainFit` without replaying the story.
