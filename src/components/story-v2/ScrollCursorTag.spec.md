# ScrollCursorTag

A small "scroll" pill that lerp-follows the pointer while scroll-story v2 is waiting for a gesture, hidden whenever it would overlap the Skip button. On touch devices (no pointer) it renders a static "swipe up" hint at the bottom instead.

**Props**: `visible` (true while idle, hidden once a scene plays), `avoidRef?` (element rect to hide over).
