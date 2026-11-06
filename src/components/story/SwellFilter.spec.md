# SwellFilter

The inverse swell-blur SVG filter used by the story intro's text reveals: each stroke dilates outward and softens (reading as ink bleed / a neon tube, not plain blur) around a brighter core, driven by one 0 (haze) → 1 (crisp) progress value.

**Props**: `id`, `layered` (use the cheaper feGaussianBlur-based fallback instead of `feMorphology`, needed on WebKit where dilate is slow — see [[prefersLayeredSwell]]).

Also exports the pure helpers that drive it: `prefersLayeredSwell()` (UA-sniffs for non-Chromium Safari), `swellParams(progress, fontSize)` (maps progress to dilate/blur/opacity, scaled by font size so the effect matches on any screen), and `applySwell(id, params, layered)`.

**Non-obvious**: the filter's SVG structure is rendered once by React; `applySwell` then mutates the live filter primitives' attributes directly by DOM id (`${id}-dilate`, `${id}-bodyblur`, etc., cached in a module-level `Map`) rather than re-rendering through props — re-rendering the filter every animation frame would re-render the whole host SVG with it.
