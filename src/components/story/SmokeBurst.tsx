import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STORY_PACING } from "./storyContent";

/**
 * Smoke, drawn inside the brain's own R3F Canvas so the puffs sit at real
 * depths and wrap around the mesh instead of floating over it as a flat
 * overlay. The texture is generated procedurally -- a radial gradient painted
 * into a 2D canvas. No new assets, no new dependencies.
 *
 * Two inputs:
 *   rise   0..1, time-based. Smoke climbs from below the frame until it fills
 *          roughly the lower two thirds.
 *   clear  0..1, scroll-based. The cloud splits into two mirrored flows that
 *          stream out through the vertical centres of the left and right
 *          screen edges, thinning as they go, revealing the brain.
 *
 * EVERYTHING is positioned from scratch each frame. An earlier version added
 * per-frame offsets onto the existing position, which integrated a slow-moving
 * sine into steady linear travel and made the whole cloud creep off in one
 * direction. Absolute positioning each frame cannot drift.
 */

const CFG = STORY_PACING.smoke;

function makeSmokeTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.3, "rgba(244,246,250,0.6)");
    g.addColorStop(0.62, "rgba(222,226,236,0.25)");
    g.addColorStop(1, "rgba(210,215,228,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

interface Puff {
  /** -1 flows left, +1 flows right. Assigned alternately for an even split. */
  side: number;
  x: number;
  z: number;
  restT: number;
  speed: number;
  baseScale: number;
  delay: number;
  /** Vertical offset of this puff's exit point, so the flows are not a line. */
  exitY: number;
  curlPhase: number;
  curlFreq: number;
  turbPhase: number;
  turbFreq: number;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface SmokeBurstProps {
  rise: number;
  clear: number;
}

export default function SmokeBurst({ rise, clear }: SmokeBurstProps) {
  const texture = useMemo(() => makeSmokeTexture(), []);
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Props are read inside useFrame, so keep them in refs rather than
  // rebuilding the scene graph on every scroll tick.
  const riseRef = useRef(rise);
  const clearRef = useRef(clear);
  riseRef.current = rise;
  clearRef.current = clear;

  useEffect(() => () => texture.dispose(), [texture]);

  const puffs = useMemo<Puff[]>(
    () =>
      Array.from({ length: CFG.puffCount }, (_, i) => ({
        // Alternating assignment guarantees an even split; the jitter in
        // every other field keeps the two flows from mirroring exactly.
        side: i % 2 === 0 ? -1 : 1,
        x: (Math.random() - 0.5) * CFG.columnWidth,
        z: (Math.random() - 0.5) * 2.4,
        restT: Math.random(),
        speed: 0.75 + Math.random() * 0.5,
        baseScale: 0.85 + Math.random() * 0.8,
        delay: Math.random() * 0.35,
        exitY: (Math.random() - 0.5) * 0.9,
        curlPhase: Math.random() * Math.PI * 2,
        curlFreq: 0.7 + Math.random() * 1.1,
        turbPhase: Math.random() * Math.PI * 2,
        turbFreq: 0.5 + Math.random() * 0.9,
      })),
    [],
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const time = state.clock.elapsedTime;
    const r = riseRef.current;
    const c = clearRef.current;

    // Exit targets: the vertical centre of each screen edge, in world units.
    // Taken from the live viewport, so this is correct at any aspect ratio.
    const halfW = (viewport.width / 2) * CFG.exitOvershoot;

    group.children.forEach((child, i) => {
      const puff = puffs[i];
      const sprite = child as THREE.Sprite;
      if (!puff || !sprite.material) return;

      const rt = easeOut(clamp01((r - puff.delay) / Math.max(0.05, 1 - puff.delay)));
      const restY = CFG.startY + (CFG.riseTopY - CFG.startY) * (0.45 + puff.restT * 0.55);
      const riseY = CFG.startY + (restY - CFG.startY) * rt;

      // Flow: from where it settled, out toward its own edge.
      const flow = clamp01(c * puff.speed);
      const targetX = puff.side * halfW;
      const x = puff.x + (targetX - puff.x) * flow;
      const y = riseY + (puff.exitY - riseY) * flow;

      // Curl across the direction of travel, plus low-frequency turbulence.
      // Both are absolute functions of time, never accumulated.
      const curl =
        Math.sin(time * CFG.curlSpeed * puff.curlFreq + puff.curlPhase) *
        CFG.curlAmount *
        flow;
      const turbX =
        Math.sin(time * puff.turbFreq + puff.turbPhase) * CFG.turbulence * (0.3 + flow);
      const turbY =
        Math.cos(time * puff.turbFreq * 0.8 + puff.turbPhase) * CFG.turbulence * (0.3 + flow);

      sprite.position.set(x + turbX, y + curl + turbY, puff.z);

      // Stretch gently along the direction of travel as the flow builds.
      const base = puff.baseScale * (CFG.startScale + rt * CFG.growth + flow * 0.8);
      sprite.scale.set(base * (1 + CFG.stretch * flow), base * (1 - 0.25 * flow), 1);

      // Fade as they approach the edges.
      const edgeFade = 1 - clamp01((Math.abs(x) / Math.max(0.001, halfW)) * 1.1);
      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = CFG.maxOpacity * rt * edgeFade * (1 - clamp01(c * 0.85));
      sprite.visible = mat.opacity > 0.004;
    });
  });

  return (
    <group ref={groupRef}>
      {puffs.map((_, i) => (
        <sprite key={i}>
          {/* depthWrite off so puffs blend with each other; depth TEST stays
              on, which is what lets the brain occlude the puffs behind it. */}
          <spriteMaterial map={texture} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}
