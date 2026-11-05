// All copy and region data for the story intro lives here.
// Edit text/positions here -- never inside the components.

// =====================================================================
// PACING CONFIG -- every tunable number for the story lives here.
// Nothing below this block is hardcoded in the components.
// =====================================================================

export const STORY_PACING = {

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

  /** Brain sizing. */
  brain: {
    /** Served from public/. */
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
