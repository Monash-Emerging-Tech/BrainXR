import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import BrainFallback from "../story/BrainFallback";
import BrainModel from "../story/BrainModel";
import type { StageLayout } from "./useStageLayout";
import { v2Debug } from "./v2Debug";

/**
 * v2's brain stage. A fork of v1's Brain3D, which stays untouched.
 *
 * WHAT IS DIFFERENT, AND WHY IT HAD TO BE A FORK. v1 takes a `scale` prop --
 * a magic number tuned by eye against one screen, with the smoke burst and
 * the procedural fallback shell wired around it. v2 does not want any of
 * that: it wants the brain to be a fixed fraction of the VIEWPORT on every
 * screen, and to be placed by the same layout that places the text.
 *
 * THE FIT. Three numbers come off the model, measured once:
 *
 *   HEIGHT  its Y extent. The beats rotate it about Y and nothing else, so
 *           this is exactly invariant -- which is why "two thirds of the
 *           viewport height" is measured against it, and why the brain
 *           reads at the size it was asked for from every angle.
 *   SPAN    the widest its silhouette ever gets: the longer of its two
 *           horizontal extents. This is what has to clear the text column
 *           and stay on screen, because it bounds the brain's projected
 *           width at every angle.
 *   WIDTH   its NARROW horizontal extent. A brain is longer front-to-back
 *           than it is ear-to-ear, so the narrow axis is the one facing you
 *           in every beat -- and that is what "55% of the viewport width"
 *           means on a phone.
 *
 * TWO BOUNDS THAT WERE TOO BIG, IN ORDER. A full 3D bounding sphere came
 * first: it folds the vertical extent into the horizontal bound, so the
 * brain was clamped to 56% of the viewport height on a 1080p screen when
 * there was room for all 66%. The swept CIRCLE came next, and is the right
 * bound for a box but not for a brain -- a brain is near enough an
 * ellipsoid that its silhouette never comes close to filling its own
 * circumscribed circle, so the layout kept shoving it 150px right of centre
 * to clear text it was nowhere near. The longer horizontal extent bounds an
 * ellipsoid's projection exactly, and is just as invariant.
 *
 * All three go up to the layout solve, which turns them into the on-screen
 * footprint it wants; this component only converts that footprint into a
 * scale, using the camera's own field of view and distance. Recomputed
 * whenever the layout or the canvas size changes, so a resize cannot leave
 * it stale.
 */

/** What the layout solve needs to know about the model, measured once. */
export interface BrainMetrics {
  /** Widest the silhouette ever gets: the longer horizontal extent. */
  span: number;
  /** Y extent. Exactly invariant under the beats' Y rotation. */
  height: number;
  /** Narrow horizontal extent: what you see when it faces you. */
  width: number;
}

export interface BrainStageV2Props {
  layout: StageLayout;
  /** Fired once, when the model has loaded and been measured. */
  onMeasured?: (m: BrainMetrics) => void;
  activeIndex: number;
  prefrontal?: boolean;
  pulse?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

/**
 * Measures the model's footprint, height and head-on width, in its own
 * units and about its own rotation origin.
 *
 * The footprint is the XZ radius -- the cylinder the brain sweeps as it
 * turns -- NOT a 3D bounding sphere. A sphere folds the vertical extent
 * into the horizontal bound and is far too pessimistic for a shape that
 * only ever rotates about Y.
 *
 * Box3.setFromObject would give a world-space AABB of the geometry AS
 * CURRENTLY ROTATED, so everything here is pulled back into the group's own
 * local space first, and the footprint is taken from per-mesh bounding
 * spheres, which are rotation-independent by construction.
 */
function measureModel(root: THREE.Object3D): BrainMetrics {
  root.updateWorldMatrix(true, true);
  const toLocal = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const m = new THREE.Matrix4();
  const box = new THREE.Box3();
  const meshBox = new THREE.Box3();

  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox;
    if (!bb) return;
    m.multiplyMatrices(toLocal, mesh.matrixWorld);
    meshBox.copy(bb).applyMatrix4(m);
    box.union(meshBox);
  });

  if (box.isEmpty()) return { span: 0, height: 0, width: 0 };

  const extentX = box.max.x - box.min.x;
  const extentZ = box.max.z - box.min.z;

  return {
    // Rotating an ellipsoid about Y sweeps its projected width between its
    // two horizontal extents, so the longer one bounds every angle. The
    // hypotenuse of the two -- the circumscribed circle -- is only tight
    // for a box, and cost the brain its centring.
    span: Math.max(extentX, extentZ),
    height: box.max.y - box.min.y,
    // ...and the shorter one is what faces you, which is what "55% of the
    // viewport width" means on a phone. Taking X outright was wrong: X is
    // the model's front-to-back axis, its longest, so portrait came out
    // sized against the brain seen side-on, about a third too small.
    width: Math.min(extentX, extentZ),
  };
}

interface FitProps {
  layout: StageLayout;
  onMeasured?: (m: BrainMetrics) => void;
  children: React.ReactNode;
}

function FitToViewport({ layout, onMeasured, children }: FitProps) {
  const { camera, size } = useThree();
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const spanRef = useRef(0);
  const heightRef = useRef(0);

  useFrame(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // The model arrives through Suspense, so keep looking until there is
    // something to measure. Once measured, never again.
    if (spanRef.current <= 0) {
      const mm = measureModel(inner);
      if (!(mm.span > 0) || !(mm.height > 0)) return;
      spanRef.current = mm.span;
      heightRef.current = mm.height;
      v2Debug.brainSpan = mm.span;
      v2Debug.brainHeight = mm.height;
      onMeasured?.(mm);
    }

    const cam = camera as THREE.PerspectiveCamera;
    // World height the camera can see at the brain's depth.
    const visibleH =
      2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.length();
    const pxToWorld = visibleH / Math.max(1, size.height);

    // The layout asked for a span in CSS px; turn it into a scale.
    const target = layout.brainPx * pxToWorld;
    const scale = target / spanRef.current;
    outer.scale.setScalar(scale);

    v2Debug.brainSpanPx = layout.brainPx;
    v2Debug.brainHeightPx = (heightRef.current * scale) / pxToWorld;

    // ...and put its centre exactly where the layout wants it. Screen y
    // grows downward and world y grows upward, hence the negation.
    outer.position.set(
      (layout.brainCx - size.width / 2) * pxToWorld,
      -(layout.brainCy - size.height / 2) * pxToWorld,
      0,
    );
  });

  return (
    <group ref={outerRef}>
      <group ref={innerRef}>{children}</group>
    </group>
  );
}

export default function BrainStageV2({
  layout,
  onMeasured,
  activeIndex,
  prefrontal = false,
  pulse = false,
  reducedMotion = false,
  className,
}: BrainStageV2Props) {
  // A plain sphere while the model loads, so the stage is never empty and
  // the fit has something to measure from the first frame.
  const placeholder = useMemo(
    () => (
      <mesh>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshBasicMaterial color="#c7c9e0" wireframe transparent opacity={0.28} />
      </mesh>
    ),
    [],
  );

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.4], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Neutral three-point-ish rig: enough to read the folds without
            tinting the ghosted lobes warm or cool. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[2.5, 3, 4]} intensity={0.75} color="#ffffff" />
        <directionalLight position={[-3, -1, -2.5]} intensity={0.35} color="#b9bfcc" />

        <FitToViewport layout={layout} onMeasured={onMeasured}>
          <BrainFallback fallback={placeholder}>
            <Suspense fallback={placeholder}>
              <BrainModel
                activeIndex={activeIndex}
                prefrontal={prefrontal}
                pulse={pulse}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </BrainFallback>
        </FitToViewport>
      </Canvas>
    </div>
  );
}
