# Act2.tsx

Act 2 of the legacy story: the tour of the brain. Opens on black with a
smoke burst ([[SmokeBurst|SmokeBurst]] via [[Brain3D|Brain3D]]) that thins
on scroll as the 3D brain resolves inside it; each scroll segment after
that lights one [[storyContent|BRAIN_REGIONS]] entry and sweeps the text
column (never the brain) with a window-pane transition between regions, then
two prefrontal finale beats and a closing line. Hosted by
[[StoryIntro|StoryIntro]].

**Props**: `phases: Record<Act2Phase, number>`, `reducedMotion`.

**Non-obvious**: `target` (what the scroll position points at) and `shown`
(what's actually on screen) are deliberately decoupled — `shown` only
catches up to `target` after the pane's leading sweep passes
(`PANE_PASS_MS`), and the sweep logic keys off "the index changed" rather
than direction, so scrubbing backwards behaves identically to scrolling
forward.

**Non-obvious**: retiring the sweep pane (`sweeping -> false`) lives in its
own `useEffect`, separate from the swap effect. Folding it into the swap
effect would mean `setShown`'s re-run of that effect cancels the very timer
meant to clear `sweeping`, leaving the pane mounted forever.

**Non-obvious**: the smoke's `rise` is time-based and starts the instant
Act 2 mounts (not scroll-driven) — only `clear` (the parting/reveal) is
tied to scroll. If the reader scrolls past `SMOKE.fastForwardAt` before the
rise animation finishes, it's snapped straight to `1` rather than holding
the reader up waiting for it.

**Non-obvious**: `Brain3D` is wrapped in `memo` (`MemoBrain`) since the
brain only cares about `activeIndex`/finale flags — without it, every
scroll-driven re-render of the text column would also walk the whole R3F
subtree.
