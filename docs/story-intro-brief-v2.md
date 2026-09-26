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
| `SwellFilter.tsx` | the inverse swell-blur over the forming line |
| `PixelText.tsx` | the beat panels — its `mode="in"/"out"` path is already time-driven |
| `Brain3D.tsx` | the real model, lighting and fallback. `smokeRise` omitted, so no smoke |
| `storyContent.ts` | `BRAIN_REGIONS`, `FINALE_BEATS`, `MODEL_CREDIT`, `STORY_PACING.brain` |
| `IdleSplash.tsx` | the wordmark, so scene 0 matches the idle screen **by construction** |
| global CSS | `.story-pane`, `.story-text-area`, `.story-dots`, `.story-credit`, `.story-glass*` |

The only thing that had to be re-implemented is the **sweep state machine**,
which in v1 lives inside `Act2.tsx` keyed off scroll values. v2's copy is in
`SceneBeat.tsx`, driven by scene index instead.

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
  SmokeShader.tsx        scene 1 smoke, full-screen fragment shader
  pixelGridV2.ts         particle sampling, taken off the real text
  DebugHud.tsx           dev-only scene / phase / elapsed readout
  v2Debug.ts             the live values that HUD reads
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
| 1 | `question` | 11.6s | smoke → the question forms → hold → FOCUS?? |
| 2 | `toBlack` | 4s | white → glossy black, brain emerges |
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

### Scene 2 — white to black, then the brain

**Three distinct stages, 10s total.** The brain is completely absent for the
first two.

| From | To | Stage |
|---|---|---|
| 0 | 4000 | White to glossy black, text blurring away |
| 4000 | 6000 | **Pure glossy black, nothing on screen** |
| 6000 | 10000 | The brain reveal |

> **The bug this fixes.** The reveal used to be keyed to the brain
> **mounting**, which happened the instant scene 2 began. So the 4s brain
> reveal ran concurrently with the 4s white-to-black, and the brain was visible
> right through the transition. There was no black hold at all.

Until its stage begins the brain carries `visibility: hidden`, so the
compositor paints **nothing** for it — not a low-opacity material. It stays
mounted through the first two stages so the WebGL context and the model are
warm by the time it appears.

The colour transition itself is **CSS, not a JS loop**: the compositor
interpolates a flat full-screen colour, which is smoother than per-frame JS,
cannot band, and costs zero React renders.

No smoke and no U-zoom in v2.

**A freshly mounted element cannot transition from a value it never held.** The
brain therefore gets one frame at its hidden state before the revealed class
lands, and the opening layer **stays mounted** through scene 2 rather than being
replaced by a copy — otherwise both would snap instead of easing.

### Scenes 3+ — one scroll per beat

The same choreography as v1's Act 2 — frosted pane sweeps the text column, old
pixels fall as its leading edge arrives, new ones assemble once it has passed,
brain rotates underneath — driven by scene index instead of scroll.

`SceneBeat` **persists across every beat**. If each beat mounted its own
instance, the outgoing text would vanish instead of falling and the sweep would
have nothing to hide.

Region copy, role tags, prefrontal finale, progress dots and the model
attribution all come from v1 unchanged.

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
density and jitter, ghost count / offsets / breathing, smoke, the to-black
transition, and the beat sweep. `DEBUG_SCENES` logs every transition and input
decision.

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
- The **brain sits slightly left of centre**. That comes from `Brain3D` and the
  model itself, both of which v2 imports from v1 unchanged.
