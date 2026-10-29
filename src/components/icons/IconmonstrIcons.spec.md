# IconmonstrIcons.tsx

A small set of standalone SVG icon components (`Arrow74Icon`,
`MediaControl13Icon`, `MediaControl14Icon`, `PlayThinIcon`, `PauseThinIcon`,
`XMark1Icon`) sourced from iconmonstr.com, used for playback/media and close
controls across the UI.

**Props** (each icon): `className?`, `style?` (not every icon forwards `style`).

**Non-obvious**: every icon fills with `currentColor` rather than a hardcoded
color — this is intentional so the caller's existing text/button color
(e.g. active vs. idle button states) controls the icon's color without any
icon-specific styling.
