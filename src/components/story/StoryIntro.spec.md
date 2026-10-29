# StoryIntro.tsx

The legacy (v1) story host: one tall scroll track with a sticky 100vh stage,
driving [[Act1|Act1]] then [[Act2|Act2]] off scroll progress, with enforced
reading pauses at a few checkpoints. Lazily loaded and gated behind a
`legacyStoryVersion` debug flag in [[../r3f/index|r3f/index]] — the current
default story experience is [[../story-v2/StoryIntroV2|StoryIntroV2]].

**Props**: `onComplete: () => void`.

**Non-obvious**: segment weights (vh/100 each) come entirely from
`STORY_PACING.lengths` in [[storyContent|storyContent]] — that's the one
place to retune pacing; `SEGMENTS`/`TRACK_VH` are derived from it. Act 2
takes over as soon as its `reveal` segment opens (`segments.reveal > 0`),
not at a checkpoint, since Act 2 starts on black and lifts it — there's no
visible seam to protect.

**Non-obvious**: checkpoint Y positions are computed from
`track.getBoundingClientRect().top + window.scrollY`, not `offsetTop` — the
track's offset parent is the positioned root wrapper, so `offsetTop` is
always 0 and every checkpoint would otherwise land at the top of the page.

**Non-obvious**: completion fires at `segments.closing < 0.995`, not `>= 1`
— the last pixel of scroll isn't always reachable (fractional device
pixels, scrollbar rounding), so a strict `>= 1` test could strand the
reader on a screen that never hands off.
