import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BrainRegion } from "./storyContent";
import { STORY_PACING } from "./storyContent";
import SmokeBurst from "./SmokeBurst";
import BrainModel from "./BrainModel";
import BrainFallback from "./BrainFallback";

/**
 * PLACEHOLDER BRAIN -- now only a FALLBACK.
 *
 * The real segmented model (BrainModel.tsx, human_brain.glb) is what
 * normally renders. This procedural shell is kept so a failed or slow model
 * load does not leave the reader on an empty stage.
 *
 * This repo doesn't currently ship a segmented brain model (only
 * public/digitalTwin.glb, the headset). Until one is added, the brain is
 * built procedurally: a ghosted wireframe shell for the overall shape, plus
 * one soft glowing marker per region from BRAIN_REGIONS.
 *
 * TO SWAP IN A REAL MODEL:
 *   1. Add a segmented brain .glb to /public (e.g. public/brain.glb), ideally
 *      with one named mesh per lobe.
 *   2. Replace <ShellAndMarkers> below with a <primitive object={gltf.scene} />
 *      loaded via useGLTF("/brain.glb"), wrapped in <Suspense>.
 *   3. Update BRAIN_REGIONS.position in storyContent.ts to real mesh-local
 *      coordinates (or map region id -> mesh name and toggle
 *      mesh.material.emissiveIntensity directly instead of drawing markers).
 * Everything else (rotation-on-scroll, ghosting, active-region logic) can
 * stay as-is since it only depends on the `activeIndex` / `regions` props.
 */

const BRAIN_CFG = STORY_PACING.brain;

interface Brain3DProps {
  regions: BrainRegion[];
  activeIndex: number;
  /** 0..1 — drives the whole brain's opacity during the Act 3 handoff dissolve */
  opacity?: number;
  /** 0..1 time-based smoke rise. Undefined means draw no smoke at all. */
  smokeRise?: number;
  /** 0..1 scroll-based smoke clear. */
  smokeClear?: number;
  /** Uniform scale for the whole brain group. See STORY_PACING.brain. */
  scale?: number;
  /** Finale: light only the front of the frontal lobe. */
  prefrontal?: boolean;
  /** Finale beat B: breathe the prefrontal glow. */
  pulse?: boolean;
  reducedMotion?: boolean;
  /** World-space Y nudge, used to lift the brain clear of a bottom text panel. */
  offsetY?: number;
  className?: string;
}

function ShellAndMarkers({
  regions,
  activeIndex,
  scale,
  offsetY,
}: {
  regions: BrainRegion[];
  activeIndex: number;
  scale: number;
  offsetY: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  // The fallback has no real anatomy to derive a facing from, so it just
  // spaces the regions evenly around the shell.
  const yawFor = (i: number) => (i / Math.max(1, regions.length)) * Math.PI * 2;
  const targetRotation = useRef(0);
  targetRotation.current = -yawFor(Math.max(0, activeIndex));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // shortest-path angle damping toward the active region's facing
    const g = groupRef.current;
    let diff = targetRotation.current - g.rotation.y;
    diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
    g.rotation.y += diff * Math.min(1, delta * 2.2);
  });

  const shellGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.15, 3), []);

  return (
    <group scale={scale} position={[0, offsetY, 0]}>
    <group ref={groupRef}>
      {/* Ghosted overall shape */}
      <mesh geometry={shellGeometry} scale={[0.95, 1.05, 1.2]}>
        <meshBasicMaterial
          color="#c7c9e0"
          wireframe
          transparent
          opacity={BRAIN_CFG.shellOpacity}
        />
      </mesh>

      {/* One marker per region */}
      {regions.map((region, i) => {
        const isActive = i === activeIndex;
        return (
          <group
            key={region.id}
            position={[
              Math.sin(yawFor(i)) * 1.0,
              (i % 2 === 0 ? 0.25 : -0.2),
              Math.cos(yawFor(i)) * 1.0,
            ]}
          >
            <mesh scale={isActive ? 0.16 : 0.09}>
              <icosahedronGeometry args={[1, 2]} />
              <meshBasicMaterial
                color={region.color}
                transparent
                opacity={isActive ? 0.95 : BRAIN_CFG.inactiveMarkerOpacity}
              />
            </mesh>
            {isActive && (
              <mesh scale={0.26}>
                <icosahedronGeometry args={[1, 1]} />
                <meshBasicMaterial
                  color={region.color}
                  transparent
                  opacity={0.16}
                  side={THREE.BackSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
    </group>
  );
}

export default function Brain3D({
  regions,
  activeIndex,
  opacity = 1,
  smokeRise,
  smokeClear = 0,
  scale = 1,
  offsetY = 0,
  prefrontal = false,
  pulse = false,
  reducedMotion = false,
  className,
}: Brain3DProps) {
  const showSmoke = smokeRise !== undefined && smokeRise > 0 && smokeClear < 1;

  const placeholder = (
    <ShellAndMarkers
      regions={regions}
      activeIndex={Math.max(0, activeIndex)}
      scale={scale}
      offsetY={offsetY}
    />
  );
  return (
    <div
      className={className}
      style={{ opacity, transition: "opacity 500ms ease", width: "100%", height: "100%" }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.4], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Neutral three-point-ish rig: enough to read the folds without
            tinting the ghosted lobes warm or cool. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[2.5, 3, 4]} intensity={0.75} color="#ffffff" />
        <directionalLight position={[-3, -1, -2.5]} intensity={0.35} color="#b9bfcc" />

        <BrainFallback fallback={placeholder}>
          <Suspense fallback={placeholder}>
            <group scale={scale} position={[0, offsetY, 0]}>
              <BrainModel
                activeIndex={activeIndex}
                prefrontal={prefrontal}
                pulse={pulse}
                reducedMotion={reducedMotion}
              />
            </group>
          </Suspense>
        </BrainFallback>

        {showSmoke && <SmokeBurst rise={smokeRise} clear={smokeClear} />}
      </Canvas>
    </div>
  );
}
