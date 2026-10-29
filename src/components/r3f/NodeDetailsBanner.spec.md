# NodeDetailsBanner.tsx

Inline detail strip shown under the active electrode: cortical-region pill,
electrode name/full name, live raw voltage, and (if available) a plain-language
insight about what that electrode measures. Flanked by two circular prev/next
arrow buttons, each tinted with the adjacent electrode's region color, for
cycling through [[../../utils/electrodeDisplayOrder|ELECTRODE_DISPLAY_ORDER]]
without reopening the 3D head. Rendered by [[../r3f/index|the r3f shell]].

**Props**: `channel`, `isPrefrontalGroup`, `frame`, `onSelectChannel`.

**Non-obvious**: when `isPrefrontalGroup` is true and no `channel` is
selected, the banner defaults to `"FpZ"` rather than rendering nothing —
toggling the prefrontal group on is expected to surface a representative
node immediately. With no channel and the group toggle off, the component
renders `null`.

**Non-obvious**: prev/next buttons call `e.stopPropagation()` before
`onSelectChannel` — this banner sits inside a larger clickable region of the
r3f shell, and without it a prev/next click would also bubble into
whatever click handler that ancestor attaches.
