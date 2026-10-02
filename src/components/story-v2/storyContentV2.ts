import { BRAIN_REGIONS, FINALE_BEATS, ACT2 } from "../story/storyContent";

/**
 * STORY V2 -- scroll triggers SCENES.
 *
 * v1 maps scroll position onto a long timeline. v2 inverts that: the page
 * does not scroll at all, and one scroll gesture plays the next scene in
 * full, on its own clock. Roughly 80% animation, 20% scroll.
 *
 * Everything tunable lives in STORY_V2 below.
 */

/** Dev flag: log every scene transition and input decision to the console. */
export const DEBUG_SCENES = false;

/**
 * Dev flag: draw the on-screen HUD (current scene, phase, elapsed time and
 * every live timeline value). Off by default. Either flip this, or append
 * `?v2debug=1` to the URL for one load without editing the file.
 */
export const DEBUG_HUD = false;

/** True when the HUD should be drawn: the build flag OR the URL override. */
export function debugHudEnabled(): boolean {
  if (DEBUG_HUD) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("v2debug") === "1";
}

export type SceneId =
  | "landing"
  | "question"
  | "toBlack"
  | "occipital"
  | "parietal"
  | "central"
  | "temporal"
  | "frontal"
  | "finaleA"
  | "finaleB"
  | "closing";

export interface SceneDef {
  id: SceneId;
  /** How long the scene's animation runs. 0 means it is a rest state. */
  durationMs: number;
  /**
   * If true, a second input while it plays fast-forwards it to its rest
   * state instead of being swallowed. Used on the long opening scene.
   */
  fastForwardable?: boolean;
}

/** Scene 1's stage boundaries, in ms from its start. */
export const Q_MARKS = (() => {
  const q = {
    swallowMs: 1200,
    whitePauseMs: 1000,
    smokePourMs: 3000,
    smokeClearMs: 1000,
    smokeLineOverlapMs: 800,
    lineFormMs: 5000,
    holdMs: 2000,
    focusEnterMs: 1500,
  };
  const smokeStart = q.swallowMs + q.whitePauseMs;
  const smokeEnd = smokeStart + q.smokePourMs + q.smokeClearMs;
  const lineStart = smokeEnd - q.smokeLineOverlapMs;
  const lineEnd = lineStart + q.lineFormMs;
  const focusStart = lineEnd + q.holdMs;
  return {
    smokeStart,
    smokeEnd,
    lineStart,
    lineEnd,
    focusStart,
    total: focusStart + q.focusEnterMs,
  };
})();

/**
 * Scene 2's authored timings. Lifted out of STORY_V2 so the scene's own
 * duration can be DERIVED from them rather than restated as a literal.
 */
const TO_BLACK = {
  /** (a) White -> glossy black, text blurring away. */
  fadeMs: 4000,
  /** (b) Pure glossy black, nothing on screen at all. */
  blackHoldMs: 2000,
  /**
   * (c) White smoke erupts from the exact screen centre, and the brain
   * reveal runs UNDERNEATH it, so the brain appears to emerge from inside
   * the smoke rather than fade up next to it.
   *
   * How long the smoke pours outward before it starts thinning.
   */
  smokePourMs: 1800,
  /** How far into the smoke the brain reveal begins. */
  brainDelayMs: 900,
  /** The reveal: low opacity + blurred + slightly small -> crisp, full size. */
  brainRevealMs: 4000,
  /**
   * The clear is DERIVED, not authored (see TO_BLACK_MARKS): the smoke has
   * to be completely gone at the exact moment the brain becomes crisp, and
   * deriving it is the only way that invariant cannot drift when one of the
   * numbers above is tuned.
   */
  /** Pale grey, so it glows on black instead of reading as a flat sheet. */
  smokeColor: [0.93, 0.94, 0.98] as [number, number, number],
  /** Additive peak. Lower than the black smoke: additive light builds fast. */
  smokeOpacity: 0.72,
  /** Blur applied to the text layer as it leaves. */
  textBlurPx: 28,
  /** Brain starts slightly small and soft. */
  brainStartScale: 0.86,
  brainStartBlurPx: 16,
} as const;

/**
 * Scene 2's stage boundaries, in ms from its start.
 *
 * `smokeClearMs` is derived here rather than authored, because the smoke has
 * to be completely gone at the exact moment the brain becomes crisp. Written
 * as two independent numbers that invariant drifts the first time either one
 * is tuned; derived, it cannot.
 */
export const TO_BLACK_MARKS = (() => {
  const smokeStart = TO_BLACK.fadeMs + TO_BLACK.blackHoldMs;
  const brainStart = smokeStart + TO_BLACK.brainDelayMs;
  const brainEnd = brainStart + TO_BLACK.brainRevealMs;
  // The smoke ends WITH the brain, by construction.
  const smokeEnd = brainEnd;
  return {
    smokeStart,
    brainStart,
    brainEnd,
    smokeEnd,
    smokeClearMs: smokeEnd - smokeStart - TO_BLACK.smokePourMs,
    total: smokeEnd,
  };
})();

export const SCENES: readonly SceneDef[] = [
  { id: "landing", durationMs: 0 },
  { id: "question", durationMs: Q_MARKS.total, fastForwardable: true },
  { id: "toBlack", durationMs: TO_BLACK_MARKS.total },
  { id: "occipital", durationMs: 2700 },
  { id: "parietal", durationMs: 2700 },
  { id: "central", durationMs: 2700 },
  { id: "temporal", durationMs: 2700 },
  { id: "frontal", durationMs: 2700 },
  { id: "finaleA", durationMs: 2700 },
  { id: "finaleB", durationMs: 2700 },
  { id: "closing", durationMs: 2700 },
];

/** Index of the first scene that shows the brain and the beat panels. */
export const FIRST_BEAT_SCENE = 3;
/** Scene index at which the brain and black background appear. */
export const TO_BLACK_SCENE = 2;

export const STORY_V2 = {
  /** Input handling. */
  input: {
    /**
     * After a scene ends, input stays ignored until the wheel has been quiet
     * for this long. One trackpad flick carries inertia for a few hundred ms,
     * and without this it would trigger a second scene on its own.
     */
    quietMs: 400,
    /**
     * Two input events closer together than this belong to the SAME
     * gesture and only the first one counts.
     *
     * THE BUG THIS FIXES: a wheel "flick" is not one event, it is a burst
     * of twenty or more. The machine used to act on every one of them, so
     * the first started scene 1 and the second -- arriving ~16ms later --
     * hit the fastForwardable branch and threw the whole 13.9s opening
     * straight to its rest state. The question appeared instantly and the
     * swallow, the smoke and the formation were never seen.
     */
    gestureGapMs: 420,
    /**
     * A fast-forwardable scene cannot be skipped before this much of it has
     * played, so a stray second gesture right on the heels of the first
     * still cannot eat the opening.
     */
    fastForwardAfterMs: 900,
    /** Minimum wheel delta that counts as a deliberate gesture. */
    wheelThreshold: 8,
    /** Minimum vertical travel, in px, for a touch swipe to count. */
    swipeThreshold: 44,
  },

  /** The "scroll" pill that follows the cursor while input is awaited. */
  cursorTag: {
    label: "scroll",
    /** Offset from the pointer, bottom-right. */
    offsetX: 18,
    offsetY: 22,
    /** Lerp factor per frame; lower trails further behind. */
    follow: 0.18,
    fadeMs: 260,
    /** Shown instead on touch devices, which have no pointer. */
    touchLabel: "swipe up",
  },

  /**
   * Scene 1, in order: the landing group is swallowed by the centre of the
   * screen, a beat of plain white, then black smoke erupts from that same
   * point and the question forms as it clears.
   */
  question: {
    /** (a) The landing group scales into the exact screen centre. */
    swallowMs: 1200,
    /** How small it gets before it is gone. */
    swallowScale: 0.02,
    /** Fraction of the swallow over which it also blurs and fades. */
    swallowFadeFrom: 0.62,
    /** (b) Plain white, nothing on screen. */
    whitePauseMs: 1000,
    /** (c) Smoke pours outward from the centre... */
    smokePourMs: 3000,
    /** ...then clears away. */
    smokeClearMs: 1000,
    /** (d) How far the line's forming overlaps the smoke clearing. */
    smokeLineOverlapMs: 800,
    /** (e) How long the line takes to lock. */
    lineFormMs: 5000,
    /** Swell-blur overlay; reaches crisp as the pixels lock. */
    lineSwellMs: 3800,
    /**
     * The tail of the formation over which the real OffBit text fades in
     * underneath the particles and the particles fade out. Both are the
     * same type at the same position, so the swap is invisible.
     */
    textSwapMs: 500,
    /** Hold on the finished line before FOCUS?? arrives. */
    holdMs: 2000,
    /** FOCUS?? entrance. */
    focusEnterMs: 1500,
  },

  /** Per-character dot-matrix forming text. */
  cells: {
    /**
     * Requested font size for line 1, as a fraction of viewport width, then
     * clamped. The actual size is snapped so one OffBit design pixel lands
     * on a whole number of device pixels -- see pixelGridV2.
     */
    lineVwFraction: 0.033,
    lineMinPx: 17,
    lineMaxPx: 42,
    /** How much of the total form time is spread across characters. */
    staggerSpan: 0.35,
    /** How often a jittering pixel picks a new dither position, in ms. */
    jitterIntervalMs: 90,
    /** Jitter spread inside the character's own cell, 0..1 of cell width. */
    jitterSpread: 0.85,
    /**
     * Alpha (0-255) above which a sampled pixel counts as ink. Kept LOW and
     * combined with a max-over-the-cell test, so a thin stroke or an
     * antialiased edge can never drop a particle. Particles are decoration
     * now -- the readable text is real OffBit underneath -- but a missing
     * column still reads as a hole during the formation.
     */
    inkAlpha: 24,
  },

  /** FOCUS??, seen without glasses. */
  doubleVision: {
    /** How many stacked copies, including the main one. */
    ghostCount: 4,
    /** Font size relative to line 1. */
    scaleVsLine: 2.1,
    /**
     * Ghost separation, as a fraction of font size. Never reaches zero.
     *
     * Tuned up from 0.035/0.075 by eye: OffBit's horizontal bars are thick,
     * and at the tighter spacing the copies interleaved into a stripe
     * pattern that read as a corrupted glyph rather than as double vision.
     * Far enough apart to read as copies, close enough to strain at.
     */
    minSpread: 0.055,
    maxSpread: 0.105,
    /** How far apart the ghosts start before settling. */
    entranceSpread: 0.28,
    /** One breathe in and out. */
    breatheMs: 5200,
    /** Opacity of the furthest ghost; the main copy is always 1. */
    ghostOpacity: 0.34,
  },

  /**
   * Scene 1 smoke: a full-screen fragment shader, not sprites. Sprites read
   * as a handful of soft blobs no matter how many you add; domain-warped
   * fbm noise is what makes it look thick, fast and chaotic.
   */
  smoke: {
    /** How fast the noise field churns. */
    speed: 0.42,
    /** Base noise frequency. Higher is finer, wispier smoke. */
    scale: 2.4,
    /** Strength of the domain warp -- the source of the turbulence. */
    warp: 2.1,
    /** How far the radial mask reaches at full pour, in screen halves. */
    reach: 1.75,
    /** Contrast of the density ramp. Tighter = thicker, more defined smoke. */
    edgeLow: 0.2,
    edgeHigh: 0.72,
    /** Peak opacity of the smoke. */
    maxOpacity: 0.97,
    /** Smoke colour. Near black, matching the ink. */
    color: [0.02, 0.02, 0.025] as [number, number, number],
  },

  /**
   * Scene 2, in three distinct stages. The brain is completely absent for
   * the first two -- not merely faint.
   */
  toBlack: TO_BLACK,

  /**
   * The brain's size and placement, derived every time from the model's
   * bounding SPHERE and the camera, never from a magic scale number.
   *
   * A sphere rather than a box because the brain rotates: a box fit that
   * just clears the frame head-on will clip a quarter turn later.
   */
  brain: {
    /** Bounding-sphere diameter as a fraction of viewport HEIGHT. */
    viewportHeightFraction: 0.66,
    /** Portrait instead sizes it against viewport WIDTH. */
    portraitWidthFraction: 0.55,
    /**
     * Portrait: the brain's centre, as a fraction of viewport height.
     * Sits below the text block but well clear of the progress dots and
     * the credit line, which move to the bottom edge on a phone.
     */
    portraitCenterY: 0.58,
    /** Below this width the stage stacks: text on top, brain underneath. */
    portraitBreakpointPx: 768,
    /** Clear space between the text column and the brain's swept circle. */
    textGapPx: 48,
    /**
     * How much viewport must stay to the right of the brain when it is
     * pushed right to clear the text -- the progress dots live there.
     */
    rightMarginFraction: 0.1,
  },

  /** Scenes 3+: the same sweep choreography v1 uses, on scene timing. */
  beats: {
    paneMs: 1050,
    panePassMs: 480,
    /** Reduced motion: a plain crossfade in place of the sweep. */
    crossfadeMs: 300,
    /** The region name's particles jitter, converge, and hand over. */
    nameFormMs: 1400,
    /** Inverse swell-blur over the name's particles. */
    nameSwellMs: 1100,
    /** The role tag fades in this long after the name starts. */
    roleDelayMs: 520,
    roleFadeMs: 520,
    /** Body copy: swell-blur plus a gentle upward fade, per line. */
    bodyDelayMs: 760,
    bodyLineStaggerMs: 130,
    bodyRevealMs: 1150,
    /** How far each body line drifts up as it arrives. */
    bodyRisePx: 14,
  },

  /** The left text column. All sizes in CSS px unless noted. */
  text: {
    /** Side gutter, as a fraction of viewport width, with a floor. */
    gutterFraction: 0.055,
    minGutterPx: 28,
    /** Region name, in OffBit -- big enough for the particles to read. */
    namePx: 30,
    namePxPortrait: 24,
    /** The small role tag under it. */
    rolePx: 13,
    /** Body copy. */
    bodyPx: 19,
    bodyPxPortrait: 16,
    bodyLineHeight: 1.5,
    /** Longest body line, in characters. The column is sized from this. */
    maxCh: 38,
    /**
     * ...and the shortest it may be squeezed to. The brain is pushed right
     * to make room FIRST; only when it has run out of room does the text
     * give any width back.
     */
    minCh: 26,
    /** The closing line is a headline, so it gets the particle treatment. */
    closingPx: 27,
    closingPxPortrait: 21,
    /** Body copy on the black glass. */
    bodyOpacity: 0.85,
  },

} as const;

/** Line 1, uppercase for v2. */
export const V2_COPY = {
  question: "HAVE YOU WONDERED WHAT MAKES YOU",
  emphasis: "FOCUS??",
  skipLabel: "Skip intro →",
} as const;

/**
 * The beat panels for scenes 3+, reusing v1's region copy, prefrontal
 * finale and closing line unchanged.
 */
export interface BeatPanel {
  kind: "region" | "finale" | "closing";
  /** Index into BRAIN_REGIONS for a region beat. */
  regionIndex: number;
  label?: string;
  role?: string;
  sentence: string;
  color: string;
}

const BODY_COLOR = "#e2e8f0";

export const BEAT_PANELS: readonly BeatPanel[] = [
  ...BRAIN_REGIONS.map((r, i) => ({
    kind: "region" as const,
    regionIndex: i,
    label: r.label,
    role: r.role,
    sentence: r.sentence,
    color: r.color,
  })),
  {
    kind: "finale" as const,
    regionIndex: BRAIN_REGIONS.length - 1,
    sentence: FINALE_BEATS[0].sentence,
    color: BODY_COLOR,
  },
  {
    kind: "finale" as const,
    regionIndex: BRAIN_REGIONS.length - 1,
    sentence: FINALE_BEATS[1].sentence,
    color: BODY_COLOR,
  },
  {
    kind: "closing" as const,
    regionIndex: BRAIN_REGIONS.length - 1,
    sentence: ACT2.closingLine,
    color: BODY_COLOR,
  },
];

export { BODY_COLOR };
