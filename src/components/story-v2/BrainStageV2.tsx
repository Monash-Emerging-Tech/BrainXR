import { lazy, Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import BrainFallback from "../story/BrainFallback";
import BrainModel from "../story/BrainModel";
import { IDLE_FRAME, type RigPose } from "./headsetRig";
import { STORY_V2 } from "./storyContentV2";
import type { StageLayout } from "./useStageLayout";
import { v2Debug } from "./v2Debug";

// Lazy, so the 3.4MB headset is only fetched when asked for: importing the
// module runs its useGLTF.preload. See preloadHeadset().
const EEGHead = lazy(() => import("../eegHead"));

/** Starts fetching the headset model (and its module) ahead of Act 3. */
export function preloadHeadset(): void {
  void import("../eegHead");
}

const FIT = STORY_V2.act3.brainFit;

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
 *
 * ONE RIG. The brain is not placed directly: it sits inside a rig group, at
 * STORY_V2.act3.brainFit in the HEADSET's local space, and the headset is a
 * sibling in the same rig. Until Act 3 the rig's transform is solved from
 * the layout so the brain lands exactly where it always has; in Act 3 the
 * rig is driven by `poseRef` instead, and brain and headset turn and scale
 * as one.
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
  /** Mount the headset in the rig. */
  headset?: boolean;
  /**
   * When it holds a pose, the rig is driven from it instead of the layout.
   * Read every frame, so it can be animated without re-rendering.
   */
  poseRef?: React.RefObject<RigPose | null>;
  /** When set, the camera is moved here (z distance and vertical fov). */
  cameraRef?: React.RefObject<{ z: number; fov: number } | null>;
  /** Dev only (?v2fit): publish the brain's and headset's boxes on window.__v2fit. */
  debugFit?: boolean;
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
/** Bounding box of everything under `root`, in `root`'s own local space. */
export function localBox(root: THREE.Object3D, out = new THREE.Box3()): THREE.Box3 {
  root.updateWorldMatrix(true, true);
  const toLocal = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const m = new THREE.Matrix4();
  const meshBox = new THREE.Box3();
  out.makeEmpty();

  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox;
    if (!bb) return;
    m.multiplyMatrices(toLocal, mesh.matrixWorld);
    meshBox.copy(bb).applyMatrix4(m);
    out.union(meshBox);
  });
  return out;
}

function measureModel(root: THREE.Object3D): BrainMetrics {
  const box = localBox(root);
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

interface RigProps {
  layout: StageLayout;
  onMeasured?: (m: BrainMetrics) => void;
  headset: boolean;
  poseRef?: React.RefObject<RigPose | null>;
  cameraRef?: React.RefObject<{ z: number; fov: number } | null>;
  debugFit?: boolean;
  children: React.ReactNode;
}

function Rig({ layout, onMeasured, headset, poseRef, cameraRef, debugFit, children }: RigProps) {
  const { camera, size } = useThree();
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const spanRef = useRef(0);
  const heightRef = useRef(0);

  useFrame(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const cam = camera as THREE.PerspectiveCamera;
    const camPose = cameraRef?.current;
    if (camPose && (cam.position.z !== camPose.z || cam.fov !== camPose.fov)) {
      cam.position.set(0, 0, camPose.z);
      cam.fov = camPose.fov;
      cam.updateProjectionMatrix();
    }

    // The brain's place inside the headset. Applied every frame so a nudge
    // to the config shows up on the next hot reload.
    inner.position.set(FIT.x, FIT.y, FIT.z);
    inner.scale.setScalar(FIT.scale);

    // The model arrives through Suspense, so keep looking until there is
    // something to measure. Once measured, never again. Measured in the
    // brain's OWN units -- `inner`'s local space, under the fit scale.
    if (spanRef.current <= 0) {
      const mm = measureModel(inner);
      if (mm.span > 0 && mm.height > 0) {
        spanRef.current = mm.span;
        heightRef.current = mm.height;
        v2Debug.brainSpan = mm.span;
        v2Debug.brainHeight = mm.height;
        onMeasured?.(mm);
      }
    }

    if (debugFit) publishFit(outer, inner);

    // Act 3: the rig is driven directly.
    const pose = poseRef?.current;
    if (pose) {
      outer.position.copy(pose.position);
      outer.quaternion.copy(pose.quaternion);
      outer.scale.setScalar(pose.scale);
      return;
    }
    if (spanRef.current <= 0) return;

    // World height the camera can see at the brain's depth.
    const visibleH =
      2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.length();
    const pxToWorld = visibleH / Math.max(1, size.height);

    // The layout asked for a span in CSS px; turn it into the BRAIN's world
    // scale, then back out the rig scale that produces it.
    const target = layout.brainPx * pxToWorld;
    const brainScale = target / spanRef.current;
    const rigScale = brainScale / FIT.scale;
    outer.quaternion.identity();
    outer.scale.setScalar(rigScale);

    v2Debug.brainSpanPx = layout.brainPx;
    v2Debug.brainHeightPx = (heightRef.current * brainScale) / pxToWorld;

    // ...and put the BRAIN's centre exactly where the layout wants it, so
    // the rig origin sits wherever that requires. Screen y grows downward
    // and world y grows upward, hence the negation.
    outer.position.set(
      (layout.brainCx - size.width / 2) * pxToWorld - FIT.x * rigScale,
      -(layout.brainCy - size.height / 2) * pxToWorld - FIT.y * rigScale,
      -FIT.z * rigScale,
    );
  });

  return (
    <group ref={outerRef}>
      <group ref={innerRef}>{children}</group>
      {headset && (
        <Suspense fallback={null}>
          <EEGHead frameRef={idleFrameRef} />
        </Suspense>
      )}
    </group>
  );
}

/**
 * Dev only. The brain's box in its OWN units (after it has turned its
 * frontal lobe to +Z), and the headset's box in rig (headset) units, for
 * working out STORY_V2.act3.brainFit.
 */
function publishFit(outer: THREE.Object3D, inner: THREE.Object3D) {
  const brain = localBox(inner);
  const headsetGroup = outer.children.find((c) => c !== inner);
  const head = headsetGroup ? localBox(headsetGroup) : null;
  const r = (v: THREE.Vector3) => [v.x, v.y, v.z].map((n) => +n.toFixed(3));
  (window as unknown as { __v2fit: unknown }).__v2fit = {
    brainMin: r(brain.min),
    brainMax: r(brain.max),
    headsetMin: head && !head.isEmpty() ? r(head.min) : null,
    headsetMax: head && !head.isEmpty() ? r(head.max) : null,
    fit: FIT,
  };
}

/** EEGHead wants a ref; the story's headset only ever shows the idle frame. */
const idleFrameRef = { current: IDLE_FRAME } as React.RefObject<typeof IDLE_FRAME>;

export default function BrainStageV2({
  layout,
  onMeasured,
  activeIndex,
  prefrontal = false,
  pulse = false,
  reducedMotion = false,
  className,
  headset = false,
  poseRef,
  cameraRef,
  debugFit = false,
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

        <Rig
          layout={layout}
          onMeasured={onMeasured}
          headset={headset}
          poseRef={poseRef}
          cameraRef={cameraRef}
          debugFit={debugFit}
        >
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
        </Rig>
      </Canvas>
    </div>
  );
}
