# Story Intro — Brief (v2)

The scene-driven cut of the intro. Runs alongside v1, which is unchanged and
documented separately in [`story-intro-brief.md`](./story-intro-brief.md).

---

## The core difference

**v1 maps scroll position onto one long timeline.** A 2450vh track, a sticky
stage, and everything scrubbed by where you are in it.

**v2 inverts that.** The page does not scroll at all. The story is a list of
**scenes**, and one scroll gesture plays the next scene in full, on its own
clock. Roughly 80% animation, 20% scroll.

`body { overflow: hidden }` for the whole story, restored on complete and on
skip.

## Choosing a version

`src/components/r3f/index.tsx` holds `STORY_VERSION` (default `"v2"`), plus a
per-load URL override:

- `?story=v2` — the scene version
- `?story=v1` — the original scroll version

v1 is lazy-imported statically and v2 through `React.lazy`, so only the one you
ask for is fetched.

## What v2 reuses from v1

v2 **never edits** anything in `src/components/story/`. It imports these
read-only:

| Module | Used for |
|---|---|
| `pixelGrid.ts` | sampling, called **per character** for the cell grids |
| `SwellFilter.tsx` | the inverse swell-blur, over the forming line and the beat copy |
| `BrainModel.tsx` | the real segmented model: lobes, rotation, highlights, prefrontal |
| `BrainFallback.tsx` | the error boundary around it |
| `storyContent.ts` | `BRAIN_REGIONS`, `FINALE_BEATS`, `MODEL_CREDIT`, `STORY_PACING.brain` |
| `IdleSplash.tsx` | the wordmark, so scene 0 matches the idle screen **by construction** |
| global CSS | `.story-pane`, `.story-text-area`, `.story-dots`, `.story-credit`, `.story-glass*` |

Two things had to be re-implemented rather than imported:

- the **sweep state machine**, which in v1 lives inside `Act2.tsx` keyed off
  scroll values. v2's copy is in `SceneBeat.tsx`, driven by scene index.
- **`Brain3D.tsx`**, forked as `BrainStageV2.tsx`. v1 takes a `scale` prop —
  a number tuned by eye against one screen — and wires a smoke burst and a
  procedural fallback shell around it. v2 needs the brain sized from the
  viewport and placed by the same solve that places the text, so the fork
  keeps v1's lighting rig and imports the same `BrainModel`, and replaces
  everything around it. v1 is untouched and still drives `?story=v1`.

`PixelText.tsx` is **no longer used at all**: see *The text is real text*.

## Files

```
src/components/story-v2/
  StoryIntroV2.tsx       host: owns everything that persists across scenes
  storyContentV2.ts      ALL config and v2 copy
  useSceneRunner.ts      scene machine, input, gating
  ScrollCursorTag.tsx    cursor pill / touch hint
  SceneOpening.tsx       scenes 0 and 1
  SceneBeat.tsx          scenes 3+
  CellPixelText.tsx      per-character dot-matrix forming text
  DoubleVisionText.tsx   FOCUS?? ghost stack
  BeatBody.tsx           beat body copy: real sans, swell-blur, no particles
  BrainStageV2.tsx       the brain: viewport-derived fit and placement
  useStageLayout.ts      the one solve that places the brain AND the text
  SmokeShader.tsx        both smokes, one full-screen fragment shader
  pixelGridV2.ts         particle sampling, taken off the real text
  DebugHud.tsx           dev-only scene / phase / elapsed readout
  v2Debug.ts             the live values the HUD reads
  storyV2.css            all of v2's styling
```

v2 owns **all** of its CSS: `storyV2.css` lives in the folder and is imported
by `StoryIntroV2`, so nothing v2 needs sits in `global.css`.

---

## The scene machine

`useSceneRunner` runs three phases:

| Phase | Meaning |
|---|---|
| `idle` | waiting for a gesture |
| `playing` | a scene is running; input is swallowed |
| `cooldown` | the scene finished, but the input device is still spinning down |

**One gesture, one action.** A wheel "flick" is not one event, it is a burst of
twenty or more over several hundred milliseconds, and a mouse notch is often
three. Anything arriving within `input.gestureGapMs` (420ms) of the previous
event is the tail of a gesture that has already been acted on and is swallowed
-- it still pushes the quiet timer out, so the burst keeps the machine locked
until it has genuinely stopped.

> **The bug this fixes.** Without it the machine acted on every event in the
> burst. The first started scene 1; the second, ~16ms later, hit the
> fast-forward branch and threw the entire 13.9s opening to its rest state. The
> question simply appeared, and the swallow, the smoke and the formation were
> never seen at all. `input.fastForwardAfterMs` is a second guard: a scene
> cannot be fast-forwarded in its first 900ms whatever the input does.

**Input:** wheel, touch swipe up, and Space / ArrowDown / PageDown / Enter go
forward. Wheel up, swipe down, and ArrowUp / PageUp go back to the previous
scene's **rest state** — not a replay.

**The cooldown is the important part.** A trackpad flick keeps firing wheel
events for a few hundred milliseconds after your fingers lift. Every one of
those restarts a quiet timer, and the machine only returns to `idle` once the
wheel has been silent for `input.quietMs` (400ms). Without it, one flick would
reliably skip two scenes.

**Fast-forward.** Scene 1 runs ~11.6s, which is a long time to be unable to
move. It is marked `fastForwardable`, so a second gesture during it jumps
straight to its rest state instead of being swallowed. Every other scene
swallows input while playing.

**Skip** is a click, never a scroll, so the input lock cannot block it. It is
first in DOM order and therefore first in tab order.

## Scenes

| # | Id | Length | What happens |
|---|---|---|---|
| 0 | `landing` | rest | BRAINXR wordmark on white |
| 1 | `question` | 13.9s | smoke → the question forms → hold → FOCUS?? |
| 2 | `toBlack` | 10.9s | white → black → hold → white smoke, brain emerges from it |
| 3–7 | regions | 2.7s each | Occipital, Parietal, Central, Temporal, Frontal |
| 8–9 | finale | 2.7s each | the two prefrontal beats |
| 10 | `closing` | 2.7s | "So how do we measure it?" |

The gesture after scene 10 calls `onComplete`.

### Scene 0 — landing

Renders `IdleHeadline` **imported from `IdleSplash.tsx`** — the same component,
not a copy of its classes, so the type is identical to the idle screen and
stays that way if the idle screen changes.

**Layout is overridden in v2 only.** IdleSplash pins its headline near the top
of the page, which is right for the idle screen and wrong for a title card. Two
CSS rules scoped under `.storyv2-wordmark` unpin it and centre the group
vertically and horizontally as one unit. Font, weight, size and letter spacing
are untouched, and `IdleSplash.tsx` itself is never edited.

### Scene 1 — swallow, smoke, question, FOCUS??

Scenes 0 and 1 are **one component**, so the wordmark is never remounted
between them and the swallow has no seam. One scroll plays all of it.

| From | To | Stage |
|---|---|---|
| 0 | 1200 | **Swallow** — the landing group scales into the exact screen centre |
| 1200 | 2200 | Plain white |
| 2200 | 6200 | **Smoke** — pours for 3s, clears over 1s |
| 5400 | 10400 | **The line forms**, overlapping the smoke's clearing by 800ms |
| 10400 | 12400 | Hold |
| 12400 | 13900 | **FOCUS??** enters |

- **The swallow** eases *in*, so it accelerates into the middle rather than
  drifting, and blurs and fades over its last 38%. The wordmark spans the
  viewport, so its default transform origin **is** the exact screen centre.
- **The smoke** is a **full-screen fragment shader** on a transparent R3F
  canvas: domain-warped fbm noise, a radial mask growing from the centre, and a
  0 to 1 to 0 density envelope. Sprites were the obvious approach and the wrong
  one — however many you add, they read as a handful of soft blobs. Sampling
  noise *through* noise is what makes the structure curl and tear instead of
  merely translating. Full DPR, capped at 2.
- **The question forms** character by character out of where the smoke was.
  Each glyph's pixels are confined to **that glyph's cell** throughout.
- **The swell-blur** is overlaid on the jitter and reaches crisp as the pixels
  lock.

**The jitter is quantised in two ways on purpose:** positions snap to the
design grid, and they only change every `cells.jitterIntervalMs`. Smooth
continuous noise reads as drifting dust; stepped noise reads as a dot-matrix
display that has not locked yet.

### The text is real; the particles are decoration

The resting text is **not reconstructed from particles**. It is a real OffBit
`<text>`, laid out and rasterised by the browser, so it is correct and readable
by definition.

> **The bug this fixes.** The line used to be rebuilt out of sampled pixels,
> aligned to OffBit's design grid. However carefully that grid was aligned, one
> sample landing a hair off centre dropped a whole stroke -- the finished line
> was missing the H's left leg and the F's bars. Reconstructing type from a
> sampler is a losing game: it can only ever approach what the browser already
> does perfectly.

`pixelGridV2.ts` now measures the real text and samples particles **into the box
it is about to occupy**:

1. **`measureTextInk`** gives the tight ink box and where the text's own origin
   sits inside it. Everything -- the `<text>`, the particle canvas and the
   character bands -- is positioned from that one measurement.
2. **`sampleTextParticles`** draws the same string at the same size and origin
   and emits a particle for any grid cell containing ink. A cell counts if
   **any** pixel in it is ink, not if its centre happens to be, so a stroke
   cannot fall between samples. The alpha threshold is low
   (`cells.inkAlpha`) and there is no particle cap.
3. OffBit's design pixel still sets the particle **pitch**, because it makes the
   nicest dot-matrix, but nothing depends on it landing perfectly any more.

**The swap.** Over the last `question.textSwapMs` of the formation the real text
fades in exactly underneath while the particles fade out. Both are OffBit at the
same position, so there is nothing to see in the swap.

**The jitter is quantised in two ways on purpose:** positions snap to the design
grid, and they only change every `cells.jitterIntervalMs`. Smooth continuous
noise reads as drifting dust; stepped noise reads as a dot-matrix display that
has not locked yet.

### FOCUS?? — double vision

Every layer is a **real OffBit `<text>`** -- the same word drawn by the browser
several times, larger than line 1. It used to be stacks of sampled pixel rects,
so every ghost inherited the sampler's dropped strokes and the word was hard to
read for the wrong reason. Now it is hard to read for the right one: the copies
are perfect, they just will not sit still. The word is stacked
`doubleVision.ghostCount` times with small vertical offsets at falling
opacity — readable, but you feel yourself straining at it.

The offsets **breathe** between `minSpread` and `maxSpread` and **never reach
zero**, so it never snaps into focus. That is the point of the beat: the
question is about focus and the word refuses to give you any.

Entrance: ghosts start at `entranceSpread` and settle into their breathing range
over 1.5s, fading up over the first fifth of it rather than popping in.

**It is mounted with line 1, not at its entrance.** The column has to reserve
FOCUS??'s slot from the start, or line 1 visibly jumps up the screen the moment
the word arrives. Its entrance headroom is then pulled back out of the layout
with negative margins, so the flex column centres on the **ink** rather than on
empty space.

### Scene 2 — white to black, then the brain out of the smoke

**Four stages.** The brain is completely absent for the first two, and for
the second half it is *inside* the smoke rather than beside it.

| From | To | Stage |
|---|---|---|
| 0 | 4000 | White to glossy black, text blurring away |
| 4000 | 6000 | **Pure glossy black, nothing on screen** |
| 6000 | 10900 | **White smoke** pours from the exact centre, then clears |
| 6900 | 10900 | The **brain reveal**, running underneath it |

> **The bug this fixes.** The reveal used to be keyed to the brain
> **mounting**, which happened the instant scene 2 began. So the 4s brain
> reveal ran concurrently with the 4s white-to-black, and the brain was
> visible right through the transition. There was no black hold at all.

Until its stage begins the brain carries `visibility: hidden`, so the
compositor paints **nothing** for it — not a low-opacity material. It stays
mounted through the first two stages so the WebGL context and the model are
warm by the time it appears.

**The smoke is the same shader as scene 1**, not a second copy of it. Colour
and peak opacity are uniforms and the blend mode is a prop: scene 1's is
near-black over white and composites normally, scene 2's is pale grey over
black and composites **additively**, so it glows out of the dark instead of
laying a flat grey sheet over it.

**The smoke is the top layer.** That is the whole trick — the brain fading up
*underneath* it is what reads as emerging from inside the cloud. Its density
eases out rather than fading linearly, so it holds its body while the brain
is still only a shape inside it and then goes quickly; a linear fade spent
most of the reveal as a barely-there haze, and the brain read as appearing
next to the smoke rather than out of it.

**Nothing lingers.** `smokeClearMs` is *derived*, not authored: the smoke
must be completely gone at the exact frame the brain becomes crisp, and
deriving it from the brain's own timings is the only way that invariant
cannot drift the next time one of the numbers is tuned. See
`TO_BLACK_MARKS`.

The brain's blur is a CSS filter on its own layer, and it is **removed**, not
faded, once the reveal lands (`is-crisp`): a filter left on a live WebGL
canvas keeps an extra compositor layer alive and resampled for every
remaining beat, for no visible gain.

The colour transition itself is **CSS, not a JS loop**: the compositor
interpolates a flat full-screen colour, which is smoother than per-frame JS,
cannot band, and costs zero React renders.

**A freshly mounted element cannot transition from a value it never held.**
The brain therefore gets one frame at its hidden state before the revealed
class lands, and the opening layer **stays mounted** through scene 2 rather
than being replaced by a copy — otherwise both would snap instead of easing.

Reduced motion: no smoke, a plain fade, still after the black hold.

### Sizing and placing the brain

`BrainStageV2` measures the model **once** and hands three numbers to the
layout. All are taken in the model's own local space, because the beats
rotate it about Y and a world-space box would breathe as it turned:

| | |
|---|---|
| **height** | its Y extent. Y rotation cannot change it, so this is what "two thirds of the viewport height" is measured against, and why the brain reads at the size it was asked for from every angle. |
| **span** | the longer of its two horizontal extents: the widest its silhouette ever gets. This is what must clear the text and stay on screen. |
| **width** | the shorter one — what faces you, and what "55% of the viewport width" means on a phone. |

The scale then falls out of the camera's own field of view and distance, so
it is identical on every screen and is recomputed on resize.

> **Two bounds that were too big, in order.** A full 3D bounding **sphere**
> came first. It folds the vertical extent into the horizontal bound, so the
> brain was clamped to 56% of the viewport height on a 1080p screen when
> there was room for all 66%. The swept **circle** came next, which is the
> right bound for a box but not for a brain: a brain is near enough an
> ellipsoid that its silhouette never comes close to filling its own
> circumscribed circle, so the layout kept shoving it 150px right of centre
> to clear text it was nowhere near. The longer horizontal extent bounds an
> ellipsoid's projection exactly, and is just as invariant.

### The layout is one solve, not two

`useStageLayout` places the brain and the text column together, because they
are one problem: the column's width is whatever is left once the brain has
taken its share, and the brain's centre is wherever it has to be for the text
to clear it. Solving them separately is how the text ended up printed over
the brain.

**Landscape.** The brain is two thirds of the viewport height and centred.
The text is a left column, vertically centred, at most `maxCh` characters
wide. If that column plus its clear gap reaches into the brain, **the brain
moves right** — the text does not shrink. Only once the brain has run out of
room on the right, where the progress dots live, does the text give width
back, and never below `minCh`.

**Portrait.** There is no room for a column beside anything, so the stage
stacks: text along the top, brain below at `portraitWidthFraction` of the
viewport width.

### Scenes 3+ — one scroll per beat

The same choreography as v1's Act 2 — a frosted pane sweeps the text column,
the old text leaves under its leading edge, the new text assembles once it
has passed, the brain rotates underneath — driven by scene index instead of
scroll position.

`SceneBeat` **persists across every beat**. If each beat mounted its own
instance, the outgoing text would vanish instead of leaving and the sweep
would have nothing to hide.

#### The text is real text

> **The bug this fixes.** Every part of a beat used to be assembled out of
> sampled pixels under a `maxParticles` cap. A region name can carry that; a
> two-sentence paragraph cannot, and a paragraph rebuilt from a budget of
> dots arrived as unreadable fragments. `PixelText` is gone from v2 entirely.

Each piece now gets the treatment it can actually carry:

| | |
|---|---|
| **name** | OffBit in the region's colour. Particles jitter in their cells, converge onto the glyphs, and hand over to real OffBit underneath as they fade — `CellPixelText`, the question line's treatment, reused wholesale. |
| **role** | small OffBit, real text, a simple fade a beat after the name. |
| **body** | sans, no particles at all, revealed with the inverse swell-blur and a staggered rise. See `BeatBody`. |

The **closing line** is short and a headline, so it takes the name's particle
treatment rather than the body's. It stays in the left column like every
other beat; v1 centres it, which in v2 would put it straight over the brain.

**`BeatBody` breaks its own lines** rather than letting the browser wrap, for
two reasons: the stagger needs a line to be an addressable element, and the
swell filter needs its own instance per line because each is at a different
progress. Each filter is dropped the moment its line lands — an SVG filter
left on static text keeps a layer alive for nothing.

Region copy, role tags, the prefrontal finale, the progress dots and the
model attribution all come from v1 unchanged.

v2 owns the beat CSS outright rather than reusing v1's `.story-text-area`,
because the column's position and width are now computed. v1's rules are
keyed to its own scroll layout and stay untouched.

## The cursor tag

A small "scroll" pill trails the cursor whenever the machine is `idle`, lerped
rather than pinned so it reads as a label following you. It fades out when a
scene starts and back in when input is awaited again.

It **hides itself over the Skip button**, so it can never sit on top of the one
control that matters.

Touch devices have no pointer, so `(hover: none), (pointer: coarse)` gets a
static **"swipe up"** hint at the bottom centre instead.

## Crispness

- 2D canvases at **full devicePixelRatio**; the R3F canvas stays capped at 2 for
  performance.
- Pixel squares are drawn in **device pixels and rounded**, with
  `imageSmoothingEnabled = false`, so edges stay razor sharp.
- Smoke draws with smoothing **on** — the snap-and-no-smoothing rule is for hard
  squares and would make smoke look blocky.
- **Resting text is real SVG `<text>`**, so it is vector-sharp at any DPR and
  cannot lose a stroke.
- No CSS scaling of any rasterised layer.

### Why animated values are passed as refs

`DoubleVisionText` renders several thousand `<rect>`s. Passing its entrance
progress as a plain number prop would re-render and reconcile every one of them
sixty times a second. So `CellPixelText`, `DoubleVisionText` and `SmokeField2D`
all take **`RefObject<number>`** for their live values, and read them inside
their own animation loops.

`SceneOpening` therefore drives the entire 11.6s scene from one rAF that writes
to refs, and flips React state only on coarse milestones — "the line exists
now", "FOCUS?? exists now". The scene costs a handful of renders rather than
several hundred.

## Config

`DEBUG_HUD` (or `?v2debug=1` for one load, no edit needed) draws an on-screen
readout of the current scene, the machine's phase, the elapsed time, which
sub-stage of scene 1 is running, and every live timeline value -- which is how
you tell "the phase is not running" apart from "the phase is running and
rendering nothing". `SmokeShader` reports its frame count and any missing WebGL
context to the same readout.

Everything tunable is in `STORY_V2` in `storyContentV2.ts`: scene durations,
input quiet-time and thresholds, cursor-tag behaviour, scene-1 timings, grid
density and jitter, ghost count / offsets / breathing, both smokes, the
to-black transition and its white smoke, the brain's fit and margins, the
text column's type sizes and measures, and the beat sweep and reveals.
`DEBUG_SCENES` logs every transition and input decision.

## Reduced motion

Scenes collapse to simple crossfades: no jitter, no breathing ghosts, no smoke,
no sweep. Scene durations are capped so the story does not crawl.

## Known gaps

- The **ghost spread and opacity falloff** on FOCUS?? were tuned up by eye from
  the reference thumbnail (0.035/0.075 to 0.055/0.105): OffBit's horizontal bars
  are thick, and at the tighter spacing the copies interleaved into a stripe
  pattern that read as a corrupted glyph rather than as double vision. Still the
  most subjective numbers in the file.
- The design-pixel measurement falls back to a fixed density if the GCD comes
  out at 1 or 2, which would mean the webfont had not loaded or the face is an
  outline font. It only sets the particle pitch now, so a wrong answer costs
  density, not legibility.
- The brain's **centre is its bounding box's centre, not its visual one**, so
  a pose whose mass sits to one side reads as about 40px off centre at 1080p.
  Correcting it would mean a per-pose silhouette centroid, which is a lot of
  machinery for a 2% offset.
- `width` (the head-on extent, which sizes portrait) is the only one of the
  three measurements that is not rotation-invariant: it is taken at whatever
  pose the model holds when it loads. A few percent either way is invisible.
