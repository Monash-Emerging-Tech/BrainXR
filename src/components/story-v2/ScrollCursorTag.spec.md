# ScrollCursorTag.tsx

A small "scroll" pill that trails the cursor while [[StoryIntroV2|StoryIntroV2]]
is waiting for a gesture, and fades out the moment a scene starts. Touch
devices get a static "swipe up" hint at the bottom instead, since they have
no pointer to follow.

**Props**: `visible`, `avoidRef?`.

**Non-obvious**: the tag's position is driven entirely by a `requestAnimationFrame`
loop writing `transform` directly on the ref (lerping position toward the
pointer at [[storyContentV2|STORY_V2]].cursorTag.follow per frame) rather than
React state — this avoids a re-render on every pointer-move event.

**Non-obvious**: `overAvoid` hides the tag when the cursor is near `avoidRef`
(typically the Skip button, with a 12px margin), so the tag can never sit on
top of the one control that matters while a gesture is pending.

**Non-obvious**: on the very first pointer sighting, `pos` jumps straight to
the pointer instead of lerping from the initial center-of-screen target —
otherwise the tag would visibly fly in from the middle of the screen on load.
