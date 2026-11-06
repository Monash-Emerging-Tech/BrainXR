import * as THREE from "three";

/**
 * Palette for the white-themed portal experience.
 * Active tiles appear as crisp/glowing white, while inactive tiles are set to #000000
 * so they disappear into the dark #0d0d10 cosmic void.
 */
const WHITE_TILES_PALETTE = [
  new THREE.Color("#ffffff"), // Pure luminous white
  new THREE.Color("#ffffff"), // Pure luminous white (emphasize bright tiles)
  new THREE.Color("#f8fafc"), // Crisp bright white
  new THREE.Color("#f1f5f9"), // Clean off-white
  new THREE.Color("#cbd5e1"), // Soft silver white
  new THREE.Color("#000000"), // Inactive / disappeared into background void
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
  new THREE.Color("#000000"),
];

/**
 * Rare jewel accent colors matching the exact canonical design system hues used across the site:
 * - Emerald: #34d399 (matches BrainModel, TrialProgressBar, TopHudBar, and RT feedback)
 * - Purple:  #c084fc (matches stamp gradient, DoubleVisionFocusText, and OnboardingFlow violet/purple)
 * - Cyan:    #22d3ee (matches AimlabsModals, renderHUD, CognitiveReportDashboard, and OnboardingFlow)
 * - Red:     #f43f5e (matches AimlabsTarget, AimlabsHUD, TelemetryPerformanceGraph, and RT feedback)
 * Making up a cumulative ~1% of all active tiles.
 */
const RARE_ACCENT_COLORS = [
  new THREE.Color("#34d399"), // Emerald (site canonical)
  new THREE.Color("#c084fc"), // Purple / Violet (site canonical)
  new THREE.Color("#22d3ee"), // Cyan (site canonical)
  new THREE.Color("#f43f5e"), // Red / Rose (site canonical)
];

/**
 * Returns a random tile color: ~1% chance for rare accent colors (emerald, purple, cyan, red),
 * and ~99% chance for the white/disappearing-void palette.
 */
export function getRandomTileColor(): THREE.Color {
  if (Math.random() < 0.01) {
    const rareIdx = Math.floor(Math.random() * RARE_ACCENT_COLORS.length);
    return RARE_ACCENT_COLORS[rareIdx];
  }
  const whiteIdx = Math.floor(Math.random() * WHITE_TILES_PALETTE.length);
  return WHITE_TILES_PALETTE[whiteIdx];
}
