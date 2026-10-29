# DebugHud.tsx

Dev-only HUD for [[StoryIntroV2|StoryIntroV2]]: shows which scene is on
screen, what phase the machine is in, how long it's been running, and the
live value of every ref the opening timeline drives (via [[v2Debug]]). Off
unless `DEBUG_HUD` is flipped in [[storyContentV2]] or the page loads with
`?v2debug=1`.

**Props**: `index`, `phase`, `startedAt`, `fastForwarded`.

**Non-obvious**: writes straight into a `<pre>` from its own `requestAnimationFrame`
loop rather than re-rendering on prop changes — the latest props are mirrored
into a ref (`propsRef`) each render so the rAF loop always reads current
values without being in its dependency array, keeping the cost to one text
assignment per frame and zero React renders.
