# SwellFilter.tsx

An SVG `<filter>` that renders the "inverse swell-blur" reveal: strokes
dilate and soften into a glowing haze, then tighten into crisp text (or the
reverse). Exports `swellParams`/`applySwell`/`prefersLayeredSwell` as the
imperative API; [[Act1|Act1]] and [[../story-v2/*|story-v2]] beats drive it.

**Props**: `id`, `layered` (use the Gaussian-blur fallback instead of
`feMorphology`).

**Non-obvious**: the filter's `<fe*>` primitives are rendered once; progress
is applied afterward by `applySwell` writing attributes straight onto the
live DOM nodes (cached by id in `nodeCache`) rather than re-rendering this
component every frame — re-rendering the filter through React on every
scroll/animation tick would re-render the whole SVG with it.

**Non-obvious**: `prefersLayeredSwell` picks the `layered` (no-`feMorphology`)
path on Safari/WebKit specifically, since `feMorphology` is the slow path
there; Chromium-based browsers also carry "Safari" in their UA string, hence
the explicit exclusion list.

**Non-obvious**: `nodeCache` entries are revalidated against `isConnected`
on read — surviving a remount that would otherwise leave a stale detached
node cached (filters are keyed by `id` and beats can mount/unmount).
