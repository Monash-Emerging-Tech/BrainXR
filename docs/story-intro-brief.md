# Story Intro — Brief

The scroll-driven intro that plays before the BrainXR idle screen.

> **On this file's history:** this brief was referenced across several rounds of
> work but never existed on disk — not in the repo, not in git history. It was
> written from the shipped code and is kept in step with it. Where it records a
> decision that is open, it says so.

---

## Scope

**In scope:** Act 1 (the question) and Act 2 (the tour of the brain).

**Out of scope:** Act 3, the headset handoff. `Headset3D.tsx` still exists in
the folder but nothing imports it. The end of Act 2 calls `onComplete` and
reveals the existing idle screen.

---

## Architecture

One tall scroll track, one `position: sticky` 100vh stage, one passive scroll
listener throttled to one `requestAnimationFrame` per paint. No animation
libraries, no new dependencies.

| File | Role |
|---|---|
| `src/hooks/useScrollProgress.ts` | Track → 0–1 timeline, cut into named segments by weight |
| `src/hooks/useScrollCheckpoints.ts` | Enforced reading pauses: snap, lock, dwell, release |
| `src/hooks/useReducedMotion.ts` | Live `prefers-reduced-motion` tracking |
| `src/components/story/StoryIntro.tsx` | Segment list, act switching, skip button, completion |
| `src/components/story/Act1.tsx` | Staged beats: mist → pixel-formed text → blink-step zoom |
| `src/components/story/Act2.tsx` | Smoke reveal → six regions → closing line |
| `src/components/story/SmokeBurst.tsx` | R3F sprite smoke, procedural CanvasTexture |
| `src/components/story/Brain3D.tsx` | Canvas, lighting, smoke mount, placeholder fallback |
| `src/components/story/BrainModel.tsx` | The real segmented GLB: centring, facing, per-lobe materials |
| `src/components/story/BrainFallback.tsx` | Error boundary -> procedural brain if the GLB fails |
| `src/components/story/pixelGrid.ts` | Text -> pixel-cell grid; also finds a glyph's counter |
| `src/components/story/SwellFilter.tsx` | The inverse swell-blur SVG filter + its param mapping |
| `src/components/story/PixelText.tsx` | Canvas particle text for Act 2's regions |
| `src/components/story/storyContent.ts` | **All copy and all pacing config** |

`useScrollProgress` returns `{ progress, segments, active }`. Each segment
reports its own clamped 0–1, so an act never needs to know where it sits on the
global timeline.

---

## Pacing config

**All tunable numbers live in `STORY_PACING` in `storyContent.ts`.** Nothing is
hardcoded in the components. Seven groups:

- `lengths` — every segment's length in vh, including the HOLD segments.
- `mist` — how far the mist parts, and its gathered/parted opacities.
- `form` — **swarm and converge**: `playMs`, `formMs`, `unformMs`, stagger
  spread, swarm radius and speed.
- `swell` — the inverse swell-blur: max dilate, body and core blurs, body/core
  opacities, starting haze level, easing exponent, and the renderer choice.
- `block` — the highlight rectangle: smoke blur, smoke spread, corner radius.
- `zoom` — scroll damping, dive easing, centre tracking, dive-box safety
  margin, and the screen-space gloss / glass-base ramps.
- `smoke` — delay, rise duration, fast-forward threshold, puff count, column
  geometry, drift, and the brain's reveal scale/blur.
- `brain` — viewport height ratios (desktop/mobile), mobile Y offset, and the
  on-black shell and marker opacities.

Separately, `STORY_CHECKPOINTS` lists the enforced pauses and
`DISABLE_CHECKPOINTS` turns them all off for development.

Current total track: **2450vh**.

---

## Checkpoints — enforced reading pauses

The story is long and mostly silent, so the beats that carry meaning get an
enforced pause. `useScrollCheckpoints` is generic: it takes a list of document
positions, a readiness map and a dwell, and owns the locking.

**Behaviour.** The first time the reader crosses a checkpoint going **forward**,
the page snaps back to exactly that position and scrolling locks. The lock holds
until the beat it guards reports finished, then for `dwellMs` (3s) more.
Scrolling **backwards** is never locked, and neither is any **later pass** — a
checkpoint is a first-read pause, not a gate.

**How the lock works.** Input events are blocked rather than setting
`overflow: hidden`, which would collapse the scrollbar and jump the layout:

- `wheel` and `touchmove` with `passive: false`, so they can be cancelled
- `keydown` for Space, the arrows, PageUp/PageDown, Home and End
- a scroll-position clamp as a backstop for **scrollbar dragging**, which
  produces no cancellable event
- `overscroll-behavior: none` and `scrollbar-gutter: stable` on the page, so
  nothing bounces or reflows while the clamp is active
- `touch-action: none` on the track while locked, so mobile browsers do not
  start a gesture they then have to cancel

**Interactive elements keep working.** The blockers bail out when the event
target is inside a `button`, `a`, input or `[role="button"]`, so **Skip** still
works during a lock — and Space does not get swallowed when a control is
focused.

**Inertia is discarded.** Blocking `touchmove` during the gesture means iOS
never starts a momentum scroll. On release the page is re-pinned to the
checkpoint and new crossings are ignored for 220ms, so unlocking cannot fling
the reader into the next beat.

**On release** a small "scroll" hint fades in, and fades out again on the next
scroll.

### The checkpoints

| # | Fires at end of | Holds until |
|---|---|---|
| 1 | `line1Form` | Line 1 has fully formed, + 3s |
| 2 | `focusForm` | "FOCUS??" has fully formed, + 3s |
| 3 | `zoom` | 3s on the glossy black screen |
| 4 | `reveal` | Brain fully revealed, + 3s |
| 5 | `finaleA` | 3s on the first prefrontal beat |
| 6 | `finaleB` | 3s on the second prefrontal beat |

Each sits at the **end** of the segment it guards, so the beat has a whole
segment of scrolling in which to start before the reader can be held at it. A
checkpoint with no `waitsFor` has nothing to await — the dwell alone is the
pause.

Checkpoint 3 replaces the old time-based 3-second delay that used to sit before
the smoke; that delay is gone.

Checkpoints survive `prefers-reduced-motion`: they are about **reading time**,
not motion.

---

## Act 1 — the question

Told in **staged beats**, each with its own scroll segment, with **HOLD
segments** between them — scroll distance where nothing changes, so the reader
feels a pause rather than a continuous slide.

### The hook is one SVG

The whole hook scene — the glossy black highlight rectangle **and** every
settled pixel — is a single full-viewport `<svg>`. There are no CSS transforms
on it and no `will-change`.

That matters for the zoom. Scaling a rasterised layer (a canvas, or a
transformed DOM subtree) resamples it, so the pixel squares go soft as they grow.
Animating the **`viewBox`** instead re-renders real vector geometry at every
step, so the squares keep hard edges all the way into the dive, at any device
pixel ratio.

The canvas is used **only while pixels are in flight**. Both renderers read the
same sampled grid at the same step size, so the swap between them is invisible.

**Text never reverts to DOM glyphs.** It keeps its pixel-square look for the
whole of Act 1, including the entire zoom. The real strings stay in the DOM,
visually hidden, for screen readers.

### Beats, in scroll order

| Segment | What happens |
|---|---|
| `hold1` | Empty white glass, "scroll" nudge with a bobbing caret |
| `mistGather` | Grey mist gathers at centre |
| `mistPart` | The mist drifts apart to the left and right, making way |
| `line1Form` | Line 1 plays, then forms, out of the parting mist |
| `hold2` | **HOLD** — line 1 sits on screen |
| `blockIn` | Black smoke gathers, condenses and resolves into the rectangle |
| `focusForm` | White "FOCUS??" pixels play, then form, inside it |
| `hold3` | **HOLD** — both parts fully formed |
| `zoom` | Blink-step dive into the hollow of the "U" |

### Formation: PLAY, then FORM

Two phases per part, both **time-based**. Scroll only *triggers* them; once
running they live on their own clock, so pausing the scroll does not freeze the
swarm. Scrolling back past the trigger resets it.

- **(a) PLAY** (`form.playMs`, ~2.5s) — pixels drift, swirl and wander loosely
  around their target area like a small swarm. The noise is per-cell sine phases
  at two frequencies, which is enough texture without a noise library.
- **(b) FORM** (`form.formMs`, ~2s) — they converge onto their letter positions
  with staggered easing.

Swarm seeds are memoised on the scene, **not** generated inside the draw effect —
regenerating them when a part moves from play to form would make the swarm jump.
The blur is applied imperatively to the canvas element rather than through React
state, because a `setState` per frame would re-render and restart the very effect
driving the animation.

### The reveal: inverse swell-blur

Both hook parts reveal with an **inverse swell-blur**, taken from a reference
clip that plays *sharp -> swollen -> haze* and run backwards.

It is deliberately **not** a uniform Gaussian blur. Each stroke:

- is **dilated** — thickened outward — and softened, so the letters look
  inflated and smoky, like ink bleeding or a neon tube
- keeps a **brighter, tighter core** along the original stroke path inside the
  soft swollen body, which is what gives it a volumetric feel
- starts as a **dim, low-contrast haze** where the shapes are only just readable

Reversed, the sequence reads: dim haze -> swollen glowing strokes brightening
-> strokes tightening and thinning -> crisp text. The easing is ease-out
(`swell.easeExponent` above 1), so most of the tightening happens early and the
last of the sharpening settles gently.

**The filter** (`SwellFilter.tsx`) is driven by ONE progress value, 0 = haze,
1 = crisp:

```
body = feMorphology dilate(r) -> feGaussianBlur(sigmaBody), at bodyOpacity
core = feGaussianBlur(sigmaCore) of the original, at coreOpacity
merge body + core, then scale the whole result by the overall opacity
```

`r` and both sigmas are **fractions of font size**, so line 1 and the much
larger "FOCUS??" swell proportionally and mobile matches desktop.

**Colour comes from the text, not the filter** — the same filter serves both.
Line 1 is dark on the white glass, so it reads as ink or smoke condensing;
"FOCUS??" is white on the black tile, so it glows like the reference clip.

**Synced to the swarm.** During PLAY progress sits at 0, so the pixels are a
swollen haze; during FORM it climbs so the swell reaches exactly 0 at the
moment the pixels land — which is also the moment the SVG takes over from the
canvas.

**At progress 1 the filter attribute is removed entirely**, not set to zero, so
the resting text and the whole dive stay perfectly crisp and cost nothing.

**Reverse.** Scrolling back past a trigger plays the clip *forwards* — sharp,
then swollen, then haze — over `form.unformMs` as the pixels come apart again.
That is the `unform` phase in `useFormation`.

### Where the filter is applied, and why

The flight stays on **canvas**, with the same SVG filter applied to the canvas
**element** through CSS `filter: url(#...)`.

The alternative was moving the flight into the SVG as `<rect>`s. The grids run
to roughly 1500 cells per part; updating that many attributes per frame is far
too slow, and it would also make the filter re-run over a DOM subtree that
changes every frame. Filtering the canvas element costs **one composited filter
pass per frame instead of one per particle**, and because both renderers use the
same filter definition the look matches exactly across the handover.

The canvas is sized and positioned to **just the text in flight** plus room for
the swarm's wander and the dilate — not to the viewport. The filter runs over
that surface every frame and its cost scales with area.

The filter definitions live in their own tiny, non-zooming `<svg>`, so their
lengths resolve in each referencing element's own user space (CSS pixels for the
canvas) without the dive's viewBox shifting under them.

### Safari fallback

`feMorphology` dilate is the slow path on WebKit. `swell.renderer` defaults to
`"auto"`, which swaps in a **layered fallback** there: a wide blur followed by
an alpha gain that re-solidifies the soft edge into a fattened shape — close
enough at these radii and much cheaper. Force either path with `"morphology"`
or `"layered"` for testing.

### Materials

- **Act 1 background** is **white glossy glass**: near-white base, a subtle soft
  sheen band, a faint vignette. Clean and minimal.
- **The highlight** is not a swipe any more. **Black smoke gathers** at the spot,
  condenses, and resolves into a crisp rounded rectangle — the smoke's blur
  tightens to 0 as the shape sharpens (`block.smokeBlurPx`, `block.smokeScale`).
- **The rectangle is glossy black glass**: a pure neutral black face, a soft
  specular near the top edge, a thin light rim, and a soft drop shadow onto the
  white glass behind it.
- Then the white "FOCUS??" pixels play and form inside it.

### The dive

**One smooth, continuous, scroll-scrubbed zoom** into the centre of the U's
hollow. The blink-steps are gone entirely — no blinks, no flicker, no discrete
size jumps.

It still drives the **viewBox**, so it stays crisp at any scale. Two things
shape the feel, both in `STORY_PACING.zoom`:

- **`dampingTau`** — the raw scroll value is chased by a damped value with this
  time constant, frame-rate independently, so wheel notches and trackpad steps
  do not read as jitter.
- **`easeExponent`** — progress is raised to this power before driving the
  scale. Above 1 the dive starts gently and accelerates, for the "entering this
  world" feel. `centreExponent` below 1 makes the viewBox centre lock onto the U
  early rather than drifting in at the end.

The loop publishes a new viewBox only on frames where the damped value actually
moved. It has to keep running to notice the next scroll, but re-rendering the
whole SVG on idle frames would eat the swarm's frame budget.

**The counter is found in the sampled grid**, not described by ratios:
`findCounter()` looks for empty cells that have ink to both their left and their
right within the U's horizontal band, which for a "U" is exactly the well between
the two stems. The final viewBox is the largest viewport-aspect box that fits
inside that counter, shrunk by `finalScaleSafety` — so no white stroke survives
and the screen ends on pure black.

### Neutral black

Slate-900 and every blue-tinted black are gone from the hook, the zoom **and**
Act 2's background. Ink is `#070707`; the glass base runs `#141414` → `#050505`.
Sheens and highlights are neutral white/grey, never blue.

### Glossy finish through the zoom, and the handoff

The specular sheen is kept in **screen space** — a fixed overlay above the
zooming SVG (`zoom.sheenFrom`/`sheenTo`), so it cannot scale with the rectangle
and smear into a blob.

At the end of the dive (`zoom.glassBaseFrom`/`glassBaseTo`) the screen crossfades
to **the exact same `.story-glass` panel Act 2 uses** — same base colour, same
gloss. The final frame of Act 1 is literally Act 2's background, so the handoff
is seamless by construction rather than by matching two colours by hand.

## Act 2 — the tour

### Act 2 is black, start to finish

The reveal, every region segment and the closing line all run on black.

> **The white-background bug, and what it actually was.** It was **not** a Canvas
> clear colour or `scene.background` — the Canvas was already
> `gl={{ alpha: true }}` with no scene background set, i.e. correctly
> transparent. The white came from an **inline background interpolation in
> `Act2.tsx`** that lerped `.story-act2-stage` from black to white across the
> reveal, driven by a `bgWhiteFrom`/`bgWhiteTo` config pair. It was added
> deliberately in an earlier round because the region pixel text was dark and
> would have been invisible on black, and was flagged at the time as an open
> decision. It is now removed and the region text is light instead. Two
> secondary white sources were also addressed: `StoryIntro`'s root `div` was
> `bg-white` (now `bg-black`), and `body` in `index.astro` carries `bg-white`
> (left alone — the story's own root covers it).

### Glossy black glass background

Pure CSS, behind the transparent R3F Canvas — no `scene.background`:

- `.story-glass` — neutral near-black base with a subtle radial gradient
- `.story-glass-gloss` — vignette plus a soft diagonal specular band

Split in two on purpose: Act 1 ramps the transparent **gloss** in over its zoom
and the opaque **base** only at the very end, so its last frame is this panel.

The optional reflection under the brain was **skipped**. Doing it properly means
a second render pass or a mirrored duplicate of the mesh, which is not cheap,
and the spec said to skip it in that case.

### Smoke timing and direction

The rise is **time-based** and starts as soon as Act 2 mounts — checkpoint 3 now
provides the pause that used to be a `delayMs`. White smoke rises from the
bottom over `smoke.riseMs` (~4.2s) until it fills roughly the lower two-thirds.
Scroll is never hijacked: if the reader moves on past `smoke.fastForwardAt`
before the rise finishes, it snaps to its end state.

Scroll then drives the **clear**.

> **The lump-drifting-up-left bug.** Three causes, compounding. The main one was
> in the per-frame churn, which did `child.position.x += Math.sin(...)`. Because
> the churn runs slowly, that sine is nearly constant over a second or two, so
> **adding** it every frame integrated it into steady linear travel — an
> accumulating creep, not the intended oscillation, and puffs with similar phases
> crept together. On top of that the clear drift was `y += clear * clearDrift *
> speed` with `speed` always positive, i.e. **one shared upward vector** for
> every puff; and vertical drift out-amplitudes lateral by about 3:1, so the
> whole cloud moved as one mass. Sprite anchoring was not involved — three.js
> sprites are already centre-anchored.

The fix positions **every puff from scratch each frame** — absolute functions of
time, never accumulated, so drift is impossible by construction. The cloud now
splits into **two mirrored flows**: `side` is assigned alternately (`i % 2`) for
an exactly even split, and each flow streams toward the vertical centre of its
screen edge. Targets come from the live `viewport.width` in world units, so it
holds on **any aspect ratio** — laptop, ultrawide or portrait phone.

Flow, not lump: each puff has its own curl frequency and phase across the
direction of travel, its own low-frequency turbulence, a gentle **stretch along
its direction of travel** as the flow builds, and a fade as it nears the edge.
Every jittered field differs per puff, so the result is symmetric in aggregate
without being mirrored particle-for-particle.

### The brain model

`public/models/human_brain.glb` — a Sketchfab export, loaded with drei's
`useGLTF` and **preloaded during Act 1** so it is decoded before the smoke
clears.

**It is not used as-is.** The export is in large, off-centre units with a root
node that rotates it Y-up, and every lobe shares the same three source
materials. `BrainModel.tsx`:

- bounding-boxes the model, **centres it and normalises** its longest axis to
  `brain.normalizedSize`
- **derives the front axis** from the frontal vs occipital centroids rather
  than hardcoding one, and computes each region's facing yaw from its own
  centroid, so re-exporting the model cannot silently break the tour
- gives every region **its own material**. The source meshes share three
  materials, so tinting a shared one would light every lobe at once
- **drops meshes under `brain.minMeshVerts`** — annotation pins and label cards
  the anatomical source shipped with, which would otherwise float as spikes

**What the three loose meshes under `brain1` are.** They carry no labels in the
file, so these are inferred from their geometry and position:

| Node | Verts | What it is |
|---|---|---|
| `Object_23` | 672 | A small midline body, anterior and inferior, sitting inside the deep core — the **pituitary / hypothalamic region** |
| `Object_24` | 10101 | The large central mass spanning most of the height and dropping below the cerebellum — the **brainstem and deep subcortical structures** |
| `Object_25` | 582 | A thin midline slab above the core, wide front-to-back — the **corpus callosum**. It is the only mesh using the third material |

None of them are lobes, so all three stay permanently ghosted. They are kept
rather than dropped because without them the brain reads as hollow.

**Look on black glass.** Resting lobes are dark translucent grey with a soft
neutral fresnel rim, injected into the material through `onBeforeCompile`. The
active lobe lerps to its region colour with a gentle emissive glow, in step with
the window sweep. The **cerebellum is never a stop** and stays ghosted throughout.

**CENTRAL has no mesh.** It is the strip where frontal meets parietal, so it is
drawn as a **glowing band** along that shared boundary — a gradient injected
into the frontal and parietal materials, positioned from the two lobes'
centroids along the derived front axis.

Sizing is `brain.viewportHeightRatioDesktop` (0.3) and a smaller mobile ratio,
applied to an outer group so the rotation logic is untouched.

**If the GLB fails to load**, `BrainFallback` catches it and the old procedural
wireframe brain renders instead; `Suspense` shows the same placeholder while it
streams.

### Attribution

Required by the model's CC BY 4.0 licence. A small, low-contrast credit sits in
the bottom corner for the whole of Act 2, linking to the Sketchfab model and to
the licence: *Brain model: "Human Brain" by Versal, CC BY 4.0*.

### The prefrontal finale

After the FRONTAL panel the brain turns **head-on**, the other lobes dim
further, and only the **front-most part of the frontal lobe** glows — a gradient
along the derived front axis (`brain.prefrontalSpan`), so it reads as the
prefrontal cortex rather than the whole lobe.

Two beats follow, each its own scroll segment with the normal sweep and pixel
text, each followed by a checkpoint:

- **a** — "It keeps what matters in working memory, blocks distractions, and
  pulls you back when your mind wanders."
- **b** — "Focus leaves a trace: a rhythm called frontal midline theta grows as
  you concentrate." This beat adds a slow **breathing pulse** on the prefrontal
  glow (`brain.pulsePeriodMs`, ~1s). Real frontal midline theta is 5–6 Hz, which
  is far too fast to read as anything but a flicker, so the pulse suggests a
  rhythm rather than depicting one.

Then the closing line, and `onComplete`.

**Progress dots stay at five.** The finale beats and the closing line all sit
under the Frontal dot.

### Dark-mode pass

- **Region body text** is light (`#e2e8f0`); the **region name keeps its
  region-colour accent**.
- **The sweep pane** is retuned for dark — a cool tint with `brightness()` in the
  backdrop filter and a softened light edge, instead of a white pane that would
  read as a flashlight on black.
- **Progress dots** are light at low alpha when inactive; the active dot is a
  lighter indigo with a soft glow.
- **The ghosted brain** shell and inactive marker opacities are raised
  (`brain.shellOpacity`, `brain.inactiveMarkerOpacity`) to read on black.

### Regions

Five stops, in scroll order, each with a name (pixel font), a small **role tag**
and body text:

| Region | Role | GLB node |
|---|---|---|
| OCCIPITAL | the eyes | `occipit1` |
| PARIETAL | the spotlight | `pariet1` |
| CENTRAL | the steady hand | *(none — band)* |
| TEMPORAL | the filter | `temp1` |
| FRONTAL | the leader | `frontal1` |

The cerebellum (`cereb1`) is not a stop and stays ghosted.

### Pixel text

Text is rendered as pixel squares on **one canvas** — an earlier DOM-span version
ran to 1500+ nodes per sentence. Sampling waits for `document.fonts.load()` then
`document.fonts.ready`, and uses a **resolved font string**
(`"'OffBit', monospace"`) — a CSS custom property does not resolve inside a
canvas context and silently falls back to sans-serif.

- **Outgoing:** pixels fall under gravity with horizontal drift and rotation,
  fading as they drop.
- **Incoming:** pixels fly in from scattered positions and ease into the
  letterforms with a slight per-pixel stagger. Axis-aligned, so settled text is
  crisp.

Particle count is capped by **coarsening the grid**, not by dropping pixels at
random — random subsampling punches holes in glyphs. DPR-aware, capped at 2.

The canvas overhangs its layout box by `FALL_ROOM` (280px) so falling pixels have
somewhere to go; without it the canvas is exactly text-height and gravity drags
every pixel out of its own bitmap in a frame or two.

Real text stays in the DOM, visually hidden, for screen readers.

### Window-pane sweep

On each region change, a tall frosted-glass pane sweeps across the **text column
only** — clipped to `.story-text-clip`, which is what guarantees the brain is
never covered.

Timing: as the pane's leading edge reaches the text the old pixels fall; once it
has passed (`PANE_PASS_MS`) the new text assembles. The brain rotates at the same
time.

The state machine keys off **"the index changed"**, never direction, so scrolling
backwards behaves exactly like scrolling forwards. A re-target cancels the
pending swap rather than queueing a second one, so fast scrubbing cannot leave
text stuck mid-fall or doubled.

Retiring the pane lives in its **own effect**. Folded into the swap effect, the
swap's `setShown` re-runs that effect and its cleanup cancels the very timer
meant to clear `sweeping`, leaving the pane mounted forever.

### Closing line

"So how do we measure it?" assembles from pixels the same way, then `onComplete`
fires and the idle screen appears.

Completion triggers at `>= 0.995`, not `>= 1` — the last pixel of scroll is not
reliably reachable (fractional device pixels, scrollbar rounding) and a strict
test can strand the reader on a screen that never hands off. It scrolls to top
before handing over, so the one-viewport idle screen does not land mid-air.

---

## Cross-cutting

### Skip button

Visible for the whole story, **first in DOM order so it is first in tab order**,
calls `onComplete` directly. Unchanged.

### Reduced motion

`prefers-reduced-motion: reduce` is honoured in both JS and CSS, so a mid-session
toggle works.

**Checkpoints still apply** — they exist for reading time, not motion.

- **Act 1:** no swarm, no swell and no smoke — the settled pixels and the
  rectangle simply fade in at each beat. The dive is not scrubbed; the stage
  fades to black.
- **Act 2:** no smoke rise — a flat mist crossfades to the brain. No falling
  pixels, no sweep; region changes are a plain crossfade that still keeps the
  out→in beat, so text does not hard-cut.

### Session gate

`sessionStorage["brainxr:story-seen"]` in `r3f/index.tsx` — the story plays once
per tab session. Clear it or open a new tab to replay.

### Mobile

Below 768px the text column moves from the left-hand side to **above the
brain**, and
the region dots go from a vertical stack on the right to a horizontal row at the
bottom. The brain is scaled down further and nudged upward to stay clear of the
text panel. "FOCUS??" is clamped so it fits a 320px screen at step 0.

---

## Known gaps

- **The brain is a placeholder.** `Brain3D.tsx` builds a ghosted wireframe
  icosahedron plus one marker per region. Swapping in a segmented `brain.glb` is
  documented in that file's header comment; the rotation, ghosting and
  active-region logic all survive the swap.
- **`Headset3D.tsx` is orphaned**, waiting for Act 3.
- **Act 1's layout is computed in JS**, not by CSS flow, because the SVG scene
  needs viewport coordinates. `cssClamp()` in `Act1.tsx` mirrors the type scale;
  if the type sizes change, change them there.
- **No reflection under the brain** — deliberately skipped on performance
  grounds.
