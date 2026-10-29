import type { CognitiveRoundType, StimulusDefinition } from "./types";

export const SPHERE_COUNT = 150;
export const BOX_COUNT = 37;
export const TOTAL_TRIALS = SPHERE_COUNT + BOX_COUNT; // 187

/**
 * Generates the pseudorandom trial sequence for the specified cognitive round.
 * Round 1: CPT (Continuous Performance Test)
 *   - 150 Cyan Spheres -> GO (Click)
 *   - 37 Red Boxes -> NO-GO (Do not click)
 * 
 * Round 2: SART (Sustained Attention to Response Task)
 *   - 150 Cyan Spheres -> NO-GO (Do not click)
 *   - 37 Red Boxes -> GO (Click)
 * 
 * Ratio of sphere to box is exactly 150 / 37 in both rounds.
 */
export function generateRoundSequence(round: CognitiveRoundType): StimulusDefinition[] {
  const items: StimulusDefinition[] = [];

  for (let i = 0; i < SPHERE_COUNT; i++) {
    items.push({
      type: "sphere",
      isGo: round === 1, // Go in Round 1, No-Go in Round 2
    });
  }

  for (let i = 0; i < BOX_COUNT; i++) {
    items.push({
      type: "box",
      isGo: round === 2, // No-Go in Round 1, Go in Round 2
    });
  }

  // Fisher-Yates shuffle with anti-clustering constraint:
  // prevent more than 3 consecutive rare red boxes to maintain continuous engagement
  let shuffled: StimulusDefinition[] = [];
  let valid = false;
  let attempts = 0;

  while (!valid && attempts < 100) {
    attempts++;
    shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Check consecutive boxes
    valid = true;
    let consecutiveBoxes = 0;
    for (const item of shuffled) {
      if (item.type === "box") {
        consecutiveBoxes++;
        if (consecutiveBoxes > 3) {
          valid = false;
          break;
        }
      } else {
        consecutiveBoxes = 0;
      }
    }
  }

  return shuffled;
}

/**
 * Available 3D target anchor slots in the arena (front grid).
 * Target positions distributed across width and height at z ~ -5.8m.
 */
export const TARGET_SLOTS: [number, number, number][] = [
  [-2.6, 2.2, -5.8],
  [-1.3, 2.2, -5.8],
  [0.0, 2.3, -5.8],
  [1.3, 2.2, -5.8],
  [2.6, 2.2, -5.8],

  [-2.4, 1.5, -5.6],
  [-1.2, 1.5, -5.6],
  [0.0, 1.6, -5.6],
  [1.2, 1.5, -5.6],
  [2.4, 1.5, -5.6],

  [-2.2, 0.9, -5.4],
  [-1.0, 0.9, -5.4],
  [0.0, 0.95, -5.4],
  [1.0, 0.9, -5.4],
  [2.2, 0.9, -5.4],
];

