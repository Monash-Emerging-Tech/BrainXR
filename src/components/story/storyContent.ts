// All copy and region data for the story intro lives here.
// Edit text/positions here -- never inside the components.

// =====================================================================
// PACING CONFIG -- every tunable number for the story lives here.
// Nothing below this block is hardcoded in the components.
// =====================================================================

/**
 * DEV FLAG -- set true to scroll straight through without any enforced
 * pauses. Handy when you are iterating on a later beat and do not want to
 * sit through the checkpoints each reload.
 */
export const DISABLE_CHECKPOINTS = false;

export interface StoryCheckpoint {
  id: string;
  /** The lock fires at the END of this segment. */
  afterSegment: string;
  /** How long to hold once the guarded beat is ready. */
  dwellMs: number;
  /**
   * The beat whose completion releases the lock. Omit when there is nothing
   * to wait for and the dwell alone is the pause.
   */
  waitsFor?: string;
}

/**
 * Enforced reading pauses. Each entry locks scrolling the FIRST time the
 * reader crosses the end of `afterSegment` going forward, and holds until the
 * guarded beat has finished playing plus `dwellMs`. Backwards scrolling and
 * every later pass are never locked.
 */
export const STORY_CHECKPOINTS: readonly StoryCheckpoint[] = [
  { id: "line1", afterSegment: "line1Form", dwellMs: 3000, waitsFor: "line1" },
  { id: "focus", afterSegment: "focusForm", dwellMs: 3000, waitsFor: "focus" },
  { id: "landed", afterSegment: "zoom", dwellMs: 3000 },
  { id: "brain", afterSegment: "reveal", dwellMs: 3000 },
  // the two prefrontal finale beats each get a pause to be read
  { id: "finaleA", afterSegment: "finaleA", dwellMs: 3000 },
  { id: "finaleB", afterSegment: "finaleB", dwellMs: 3000 },
];

export const STORY_PACING = {

  /**
   * Segment lengths, in vh. One unit of 100vh costs the reader roughly one
   * viewport of scrolling. HOLD segments are scroll distance where nothing
   * changes -- they are what makes the story feel paced rather than rushed.
   * These are summed to size the scroll track.
   */
  lengths: {
    // --- Act 1, in scroll order ---
    /** (a) empty white screen. */
    hold1Vh: 70,
    /** (b) grey mist gathers at centre. */
    mistGatherVh: 110,
    /** (c) mist drifts apart to left and right, making way. */
    mistPartVh: 110,
    /** (d) line 1 forms from pixels out of the parting mist. */
    line1FormVh: 160,
    /** (e) HOLD -- line 1 sits on screen. */
    hold2Vh: 80,
    /** (f1) the black highlight block wipes in. */
    blockInVh: 70,
    /** (f2) white "FOCUS??" pixels assemble inside the block. */
    focusFormVh: 150,
    /** (g) HOLD -- both parts sit fully formed before the dive. */
    hold3Vh: 120,
    /** (h) the blink-step zoom into the "U". */
    zoomVh: 500,

    // --- Act 2 ---
    /** Smoke delay + rise are time-based; this is the scroll-driven clear. */
    smokeRevealVh: 250,
    /** Per brain region. */
    regionVh: 100,
    /** Each prefrontal finale beat. */
    finaleVh: 110,
    /** The closing line. */
    closingVh: 110,
  },

  /** Act 1 mist behaviour. */
  mist: {
    /** How far the outer mist layers slide apart, in vw, during (c). */
    partDistanceVw: 42,
    /** Mist opacity once it has gathered, before parting. */
    gatheredOpacity: 1,
    /** Mist opacity it thins to after the text has formed. */
    partedOpacity: 0.45,
  },

  /** Act 1 pixel formation: PLAY (swarm) then FORM (converge). */
  form: {
    /**
     * (a) PLAY -- pixels drift, swirl and wander loosely around their target
     * area like a small swarm. Time-based: once scroll triggers it, it keeps
     * living even if the reader stops scrolling.
     */
    playMs: 2500,
    /** (b) FORM -- they converge onto their letter positions. */
    formMs: 2000,
    /** Spread of the per-pixel stagger during FORM, as a fraction of it. */
    staggerSpan: 0.35,
    /** How far the swarm wanders from its target, in px. */
    swarmRadius: 58,
    /** Swarm churn rate. Higher is more agitated. */
    swarmSpeed: 0.85,
    /** How long the un-form runs when the reader scrolls back past a beat. */
    unformMs: 1100,
  },

  /**
   * INVERSE SWELL-BLUR reveal, used on both hook parts.
   *
   * The reference clip plays sharp -> swollen -> haze; this runs it
   * backwards. One progress value drives everything, 0 = dim haze,
   * 1 = perfectly crisp:
   *
   *   body = dilate(r) -> blur(sigmaBody), at bodyOpacity
   *   core = blur(sigmaCore) of the original, at coreOpacity
   *   merge, then scale the whole thing by the overall opacity
   *
   * The dilate is what makes strokes look inflated and smoky rather than
   * merely out of focus, and the tighter core inside the swollen body is
   * what gives it the volumetric, neon-tube feel.
   *
   * All sizes are FRACTIONS OF FONT SIZE, so the effect reads identically
   * on a phone and on a desktop.
   */
  swell: {
    /** Peak dilate radius, x font size. */
    maxDilate: 0.055,
    /** Peak blur on the swollen body, x font size. */
    maxBodyBlur: 0.105,
    /** Peak blur on the bright inner core, x font size. */
    maxCoreBlur: 0.028,
    /** Alpha of the soft swollen body. */
    bodyOpacity: 0.8,
    /** Alpha of the tighter core. Higher reads more like a neon tube. */
    coreOpacity: 0.95,
    /** Overall opacity at progress 0 -- the dim, barely readable haze. */
    startOpacity: 0.26,
    /**
     * Ease-out on the tightening: above 1 means most of the swell collapses
     * early and the last of the sharpening settles gently.
     */
    easeExponent: 1.85,
    /**
     * feMorphology renderer. "auto" uses the layered-blur fallback on
     * WebKit, where dilate is the slow path; "morphology" and "layered"
     * force one or the other for testing.
     */
    renderer: "auto" as "auto" | "morphology" | "layered",
    /** Blur multiplier used by the layered fallback to fake the dilate. */
    fallbackSpread: 1.45,
    /** Alpha gain that re-solidifies that blur into a fattened shape. */
    fallbackGain: 2.6,
  },

  /** Act 1 highlight block: black smoke gathering into a glass rectangle. */
  block: {
    /** Smoke blur at the start, tightening to 0 as the rectangle sharpens. */
    smokeBlurPx: 26,
    /** How much wider the smoke cloud starts than the final rectangle. */
    smokeScale: 1.75,
    /** Corner radius of the resolved rectangle, in px. */
    cornerRadius: 16,
  },

  /** Act 1 dive into the "U". One smooth, continuous, scrubbed zoom. */
  zoom: {
    /**
     * Scroll smoothing. The damped value chases the raw scroll value with
     * this time constant, in seconds, so wheel and trackpad steps do not
     * show up as jitter. Larger is smoother and laggier.
     */
    dampingTau: 0.14,
    /**
     * Dive easing exponent, applied to progress before it drives the scale.
     * Above 1 means it starts gently and accelerates -- the "entering this
     * world" feel. 1 would be a constant exponential rate.
     */
    easeExponent: 2.1,
    /**
     * How quickly the viewBox centre travels to the counter relative to the
     * scale. Below 1 locks onto the U early instead of drifting in late.
     */
    centreExponent: 0.55,
    /**
     * Extra margin on the computed dive box, so no white stroke survives.
     * The counter itself is found from the sampled pixel grid at runtime.
     */
    finalScaleSafety: 1.2,
    /**
     * Screen-space gloss. The specular sheen must NOT scale with the rect or
     * it smears, so it rides above the zooming SVG as a fixed overlay.
     */
    sheenFrom: 0.3,
    sheenTo: 0.6,
    /**
     * The final frame of the dive crossfades to the exact same glass panel
     * Act 2 uses, so the handoff matches base colour and sheen precisely.
     */
    glassBaseFrom: 0.74,
    glassBaseTo: 0.94,
  },

  /** Act 2 smoke. Delay and rise are TIME-based; the clear is scroll-driven. */
  smoke: {
    /** How long the smoke takes to rise and fill the lower screen. */
    riseMs: 4200,
    /**
     * If the reader scrolls past this much of the reveal segment before the
     * rise has finished, it is fast-forwarded to its end state rather than
     * blocking or rewinding. Scroll is never hijacked.
     */
    fastForwardAt: 0.04,
    /** Number of sprite puffs. Raise for denser smoke, at a GPU cost. */
    puffCount: 22,
    /** World-space Y the puffs start below the frame, and rise to. */
    startY: -2.4,
    /** Top of the risen smoke. ~0.35 fills roughly the lower two thirds. */
    riseTopY: 0.35,
    /** Horizontal spread of the smoke column, in world units. */
    columnWidth: 3.2,
    /** Sprite size at the start of the rise, and how much it grows. */
    startScale: 1.1,
    growth: 1.4,
    /** Peak sprite opacity. */
    maxOpacity: 0.8,
    /** Gentle continuous churn, independent of scroll. */
    churnSpeed: 0.12,
    /**
     * Scroll-driven clear. The smoke splits evenly into two mirrored flows
     * that stream toward the vertical centre of the left and right screen
     * edges. Targets are derived from the live viewport in world units, so
     * this holds on any aspect ratio.
     */
    /** Fraction past the edge the flows aim for, so they fully exit frame. */
    exitOvershoot: 1.18,
    /** Amplitude of the per-particle curl across the direction of travel. */
    curlAmount: 0.55,
    /** How fast the curl oscillates. */
    curlSpeed: 0.75,
    /** Turbulence amplitude, in world units. */
    turbulence: 0.22,
    /** How much a puff stretches along its direction of travel as it flows. */
    stretch: 1.5,
    /** Brain reveal: where it starts before easing to 1 / to 0. */
    brainStartScale: 0.82,
    brainStartBlur: 14,
  },

  /** Act 2 brain sizing. */
  brain: {
    /** Served from public/. Preloaded during Act 1. */
    modelUrl: "/models/human_brain.glb",
    /**
     * The GLB is a Sketchfab export in large, off-centre units, so it is
     * bounding-boxed, centred and normalised to this many world units on
     * its longest axis before the viewport ratios below are applied.
     */
    normalizedSize: 2.4,
    /**
     * Meshes below this vertex count are annotation pins and label cards
     * left in the original anatomical model, not anatomy. They would render
     * as floating spikes, so they are dropped.
     */
    minMeshVerts: 200,
    /** Resting lobe: dark translucent grey with a soft neutral fresnel rim. */
    restColor: "#24242a",
    restOpacity: 0.34,
    rimColor: "#c8ccd8",
    rimStrength: 0.5,
    rimPower: 2.6,
    /** Active lobe: fades to its region colour with a gentle emissive glow. */
    activeOpacity: 0.85,
    activeEmissive: 0.5,
    /** How fast tint and rotation lerp toward their targets. */
    lerpSpeed: 2.4,
    /** Prefrontal finale: how far back along the front axis the glow reaches. */
    prefrontalSpan: 0.34,
    prefrontalEmissive: 1.15,
    /** Central band half-width along the front axis, as 0..1 of brain depth. */
    centralBandWidth: 0.09,
    /** Breathing pulse on the prefrontal glow during finale beat B. */
    pulsePeriodMs: 1000,
    pulseDepth: 0.35,
    /**
     * Brain height as a fraction of viewport height. The camera's visible
     * world height is ~2.47 units and the mesh is ~2.4 tall, so the group
     * scale applied is roughly this value.
     */
    viewportHeightRatioDesktop: 0.3,
    viewportHeightRatioMobile: 0.22,
    /** Nudge DOWN on mobile, where the text panel sits along the top. */
    offsetYMobile: -0.5,
    /** Ghosted shell opacity -- tuned for the black background. */
    shellOpacity: 0.34,
    /** Inactive region marker opacity on black. */
    inactiveMarkerOpacity: 0.36,
  },
} as const;

// ---- Act 1: the question ----

export const ACT1 = {
  /** Escape hatch, visible for the whole act. */
  skipLabel: "Skip intro ->",
  /** Nudge shown on the opening white hold, before the mist arrives. */
  scrollHint: "scroll",
  lead: "Have you wondered what makes you",
  /** Two question marks is deliberate. Split per character for measurement. */
  emphasis: "FOCUS??",
  /**
   * Index of the character whose counter the zoom dives into. The hollow is
   * located in the sampled pixel grid at runtime -- nothing about it is
   * hardcoded beyond which glyph to look at.
   */
  zoomCharIndex: 3, // the "U"
} as const;

// ---- Act 2: the tour ----

export const ACT2 = {
  /** Closing line of the act; assembles from pixels like every region line. */
  closingLine: "So how do we measure it?",
  /**
   * Resolved font stacks, passed straight to canvas ctx.font. These must be
   * real font strings -- a CSS custom property (var(--font-offbit)) does not
   * resolve inside a canvas context and silently falls back to sans-serif.
   */
  labelFont: "'OffBit', monospace",
  bodyFont: "ui-sans-serif, system-ui, -apple-system, sans-serif",
  labelWeight: 400,
  bodyWeight: 400,
} as const;

export type BrainRegionId =
  | "occipital"
  | "parietal"
  | "central"
  | "temporal"
  | "frontal";

export interface BrainRegion {
  id: BrainRegionId;
  /** Shown in the pixel font. */
  label: string;
  /** Small tag under the name. */
  role: string;
  sentence: string;
  color: string;
  /**
   * Group node in human_brain.glb. null means the region has no mesh of its
   * own and is drawn as a band on its neighbours -- see CENTRAL below.
   */
  node: string | null;
}

/**
 * The tour, in scroll order, ending on the frontal lobe and its prefrontal
 * finale. Nothing here hardcodes an orientation: each region's facing is
 * derived at runtime from its mesh centroid (see BrainModel.tsx).
 */
export const BRAIN_REGIONS: BrainRegion[] = [
  {
    id: "occipital",
    label: "OCCIPITAL",
    role: "the eyes",
    sentence:
      "Your visual cortex. Everything you look at is processed here first. When your mind drifts, calm alpha waves tend to grow back here.",
    color: "#7dd3c8",
    node: "occipit1",
  },
  {
    id: "parietal",
    label: "PARIETAL",
    role: "the spotlight",
    sentence:
      "It maps where things are and swings your attention toward what matters, like a spotlight on a stage.",
    color: "#c9a5e8",
    node: "pariet1",
  },
  {
    id: "central",
    label: "CENTRAL",
    role: "the steady hand",
    sentence:
      "The strip that runs movement and touch. It turns plans into action and helps keep your body steady while your mind works.",
    color: "#f0b3d6",
    // No mesh of its own: it is the strip where frontal meets parietal, and
    // is drawn as a glowing band along that shared boundary.
    node: null,
  },
  {
    id: "temporal",
    label: "TEMPORAL",
    role: "the filter",
    sentence:
      "Sound, language and memory. It helps you tune out background noise and pull up what you already know.",
    color: "#a5b4e8",
    node: "temp1",
  },
  {
    id: "frontal",
    label: "FRONTAL",
    role: "the leader",
    sentence:
      "Right behind your forehead sits the prefrontal cortex: the brain's director. It picks a goal and holds onto it.",
    color: "#a5b4fc",
    node: "frontal1",
  },
];

/**
 * The prefrontal finale. The brain turns head-on, the other lobes dim, and
 * only the front-most part of the frontal lobe glows. Each beat is its own
 * scroll segment with the normal sweep and pixel text.
 */
export const FINALE_BEATS = [
  {
    id: "finaleA" as const,
    sentence:
      "It keeps what matters in working memory, blocks distractions, and pulls you back when your mind wanders.",
  },
  {
    id: "finaleB" as const,
    sentence:
      "Focus leaves a trace: a rhythm called frontal midline theta grows as you concentrate.",
  },
];

/** Required by the model's CC BY 4.0 licence. */
export const MODEL_CREDIT = {
  text: "Brain model: \"Human Brain\" by Versal, CC BY 4.0",
  modelUrl:
    "https://sketchfab.com/3d-models/human-brain-49bcdf19c1904c76a456b31838b0d7ac",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
} as const;
