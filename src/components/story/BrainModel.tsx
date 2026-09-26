import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { BRAIN_REGIONS, STORY_PACING, type BrainRegionId } from "./storyContent";

/**
 * The real segmented brain.
 *
 * The GLB is a Sketchfab export: large units, off-centre, Z-up under a root
 * node that rotates it Y-up, with every lobe sharing the same three source
 * materials. So this component:
 *
 *  - bounding-boxes the model, centres it and normalises its scale
 *  - DERIVES the front axis from the frontal vs occipital centroids rather
 *    than hardcoding one, and computes each region's facing from its own
 *    centroid, so re-exporting the model cannot silently break the tour
 *  - gives every region its OWN material. The source meshes share three
 *    materials, so tinting a shared one would light every lobe at once
 *  - drops the tiny annotation pins and label cards left in the original
 *
 * CENTRAL has no mesh of its own. It is drawn as a glowing band along the
 * frontal/parietal boundary, injected into both of those materials.
 */

const CFG = STORY_PACING.brain;

export interface BrainModelProps {
  /** Index into BRAIN_REGIONS, or -1 for none. */
  activeIndex: number;
  /** Finale: light only the front of the frontal lobe. */
  prefrontal?: boolean;
  /** Finale beat B: breathe the prefrontal glow. */
  pulse?: boolean;
  reducedMotion?: boolean;
}

interface LobeEntry {
  id: BrainRegionId;
  group: THREE.Object3D;
  material: THREE.MeshStandardMaterial;
  uniforms: Record<string, { value: number | THREE.Color | THREE.Vector3 }>;
  /** Target yaw that turns this region toward the camera. */
  yaw: number;
}

/** Centroid of an object's world-space bounding box. */
function centroidOf(obj: THREE.Object3D): THREE.Vector3 {
  const box = new THREE.Box3().setFromObject(obj);
  return box.getCenter(new THREE.Vector3());
}

/**
 * A lobe material: dark translucent grey at rest, tintable, with a neutral
 * fresnel rim, an optional front-axis gradient for the prefrontal glow, and
 * an optional band for CENTRAL. All driven by uniforms so useFrame can lerp
 * them without rebuilding shaders.
 */
function makeLobeMaterial(forwardLocal: THREE.Vector3, depth: number, centreAlong: number) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(CFG.restColor),
    emissive: new THREE.Color("#000000"),
    roughness: 0.55,
    metalness: 0,
    transparent: true,
    opacity: CFG.restOpacity,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  const uniforms = {
    uRimColor: { value: new THREE.Color(CFG.rimColor) },
    uRimStrength: { value: CFG.rimStrength },
    uRimPower: { value: CFG.rimPower },
    uForward: { value: forwardLocal.clone() },
    uDepth: { value: depth },
    uAlongMid: { value: centreAlong },
    /** 0..1 prefrontal glow amount. */
    uFront: { value: 0 },
    uFrontColor: { value: new THREE.Color("#ffffff") },
    uFrontSpan: { value: CFG.prefrontalSpan },
    /** 0..1 central-band glow amount. */
    uBand: { value: 0 },
    uBandColor: { value: new THREE.Color("#ffffff") },
    uBandAt: { value: 0 },
    uBandWidth: { value: CFG.centralBandWidth },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLocalPos;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvLocalPos = transformed;",
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vLocalPos;
uniform vec3 uRimColor;
uniform float uRimStrength;
uniform float uRimPower;
uniform vec3 uForward;
uniform float uDepth;
uniform float uAlongMid;
uniform float uFront;
uniform vec3 uFrontColor;
uniform float uFrontSpan;
uniform float uBand;
uniform vec3 uBandColor;
uniform float uBandAt;
uniform float uBandWidth;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
{
  // Soft neutral fresnel rim, so ghosted lobes still read as solid forms.
  float fres = 1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0);
  totalEmissiveRadiance += uRimColor * pow(fres, uRimPower) * uRimStrength;

  // Position along the derived front axis, 0 at the back, 1 at the front.
  float along = (dot(vLocalPos, uForward) - uAlongMid) / max(uDepth, 0.0001) + 0.5;

  // Prefrontal: only the front-most slice, so it reads as the prefrontal
  // cortex rather than the whole frontal lobe.
  if (uFront > 0.0) {
    float f = smoothstep(1.0 - uFrontSpan, 1.0, along);
    totalEmissiveRadiance += uFrontColor * f * uFront;
  }

  // Central: a band straddling the frontal/parietal boundary.
  if (uBand > 0.0) {
    float d = abs(along - uBandAt);
    float b = 1.0 - smoothstep(0.0, uBandWidth, d);
    totalEmissiveRadiance += uBandColor * b * uBand;
  }
}`,
      );
  };
  // Force a recompile if the same material is reused across renders.
  material.customProgramCacheKey = () => "storyLobe";

  return { material, uniforms };
}

export default function BrainModel({
  activeIndex,
  prefrontal = false,
  pulse = false,
  reducedMotion = false,
}: BrainModelProps) {
  const { scene } = useGLTF(CFG.modelUrl);
  const rotorRef = useRef<THREE.Group>(null);

  const built = useMemo(() => {
    const root = scene.clone(true);

    // Drop annotation pins and label cards: tiny meshes the anatomical
    // source shipped with, which would otherwise float as spikes.
    const doomed: THREE.Object3D[] = [];
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const pos = mesh.geometry?.getAttribute("position");
      if (!pos || pos.count < CFG.minMeshVerts) doomed.push(mesh);
    });
    doomed.forEach((o) => o.parent?.remove(o));

    root.updateWorldMatrix(true, true);

    const byName = new Map<string, THREE.Object3D>();
    root.traverse((o) => {
      if (o.name) byName.set(o.name, o);
    });

    // ---- derive the front axis from anatomy, never hardcode it ----
    const frontNode = byName.get("frontal1");
    const backNode = byName.get("occipit1");
    if (!frontNode || !backNode) return null;

    const frontC = centroidOf(frontNode);
    const backC = centroidOf(backNode);

    const box = new THREE.Box3().setFromObject(root);
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = CFG.normalizedSize / Math.max(size.x, size.y, size.z);

    // Forward in the model's own space, flattened to the horizontal plane.
    const forward = frontC.clone().sub(backC);
    forward.y = 0;
    forward.normalize();

    // Extent along that axis, for the gradients, in centred+scaled space.
    const depth =
      Math.abs(size.x * forward.x) + Math.abs(size.z * forward.z) || size.x;

    const localCentre = centre.clone();

    const lobes: LobeEntry[] = [];
    const bandAtByRegion = new Map<BrainRegionId, number>();

    // Where frontal meets parietal, along the front axis, 0..1.
    const frontalAlong = frontC.clone().sub(localCentre).dot(forward) / depth + 0.5;
    const parietalNode = byName.get("pariet1");
    const parietalAlong = parietalNode
      ? centroidOf(parietalNode).sub(localCentre).dot(forward) / depth + 0.5
      : frontalAlong - 0.2;
    const bandAt = (frontalAlong + parietalAlong) / 2;

    for (const region of BRAIN_REGIONS) {
      if (!region.node) {
        // CENTRAL: no mesh, drawn as a band on frontal and parietal. Its
        // facing is the midpoint of the two lobes it sits between.
        const mid = frontC.clone().add(parietalNode ? centroidOf(parietalNode) : frontC).multiplyScalar(0.5);
        const dir = mid.sub(localCentre);
        lobes.push({
          id: region.id,
          group: root,
          material: null as unknown as THREE.MeshStandardMaterial,
          uniforms: {},
          yaw: -Math.atan2(dir.x, dir.z),
        });
        bandAtByRegion.set(region.id, bandAt);
        continue;
      }

      const group = byName.get(region.node);
      if (!group) {
        // Keep the array index-aligned with BRAIN_REGIONS even if a node is
        // missing, or every region after it would drive the wrong lobe.
        lobes.push({
          id: region.id,
          group: root,
          material: null as unknown as THREE.MeshStandardMaterial,
          uniforms: {},
          yaw: 0,
        });
        continue;
      }

      const { material, uniforms } = makeLobeMaterial(
        forward,
        depth,
        localCentre.clone().dot(forward),
      );

      // Every mesh in this lobe gets THIS material, not the shared source.
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.material = material;
      });

      const dir = centroidOf(group).sub(localCentre);
      lobes.push({
        id: region.id,
        group,
        material,
        uniforms,
        yaw: -Math.atan2(dir.x, dir.z),
      });
    }

    // Everything not in a named lobe -- brainstem, deep structures, corpus
    // callosum -- stays permanently ghosted so the brain reads as whole.
    const lobeNodes = new Set(
      BRAIN_REGIONS.map((r) => r.node).filter(Boolean) as string[],
    );
    const restMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CFG.restColor),
      roughness: 0.6,
      metalness: 0,
      transparent: true,
      opacity: CFG.restOpacity * 0.8,
      depthWrite: false,
    });
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      let inLobe = false;
      let p: THREE.Object3D | null = mesh;
      while (p) {
        if (p.name && lobeNodes.has(p.name)) {
          inLobe = true;
          break;
        }
        p = p.parent;
      }
      if (!inLobe) mesh.material = restMaterial;
    });

    return { root, centre, scale, lobes, bandAt, restMaterial, forward };
  }, [scene]);

  // Dispose the materials this instance created.
  useEffect(() => {
    if (!built) return;
    return () => {
      built.lobes.forEach((l) => l.material?.dispose());
      built.restMaterial.dispose();
    };
  }, [built]);

  const tmpColor = useMemo(() => new THREE.Color(), []);
  const startRef = useRef(performance.now());

  useFrame((_, delta) => {
    if (!built) return;
    const k = reducedMotion ? 1 : Math.min(1, delta * CFG.lerpSpeed);

    const active = built.lobes[activeIndex];
    const activeRegion = BRAIN_REGIONS[activeIndex];

    // ---- rotation: turn the active region toward the camera ----
    const rotor = rotorRef.current;
    if (rotor && active) {
      let diff = active.yaw - rotor.rotation.y;
      diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      rotor.rotation.y += diff * k;
    }

    // ---- breathing pulse on the prefrontal glow ----
    let pulseScale = 1;
    if (pulse && !reducedMotion) {
      const t = (performance.now() - startRef.current) / CFG.pulsePeriodMs;
      pulseScale = 1 - CFG.pulseDepth * (0.5 - 0.5 * Math.cos(t * Math.PI * 2));
    }

    for (let i = 0; i < built.lobes.length; i++) {
      const lobe = built.lobes[i];
      if (!lobe.material) continue;
      const region = BRAIN_REGIONS[i];
      const isActive = i === activeIndex && !prefrontal;

      // In the finale everything except the frontal lobe dims further.
      const dimmed = prefrontal && region.id !== "frontal";
      const targetOpacity = dimmed
        ? CFG.restOpacity * 0.5
        : isActive
          ? CFG.activeOpacity
          : CFG.restOpacity;

      tmpColor.set(isActive ? region.color : CFG.restColor);
      lobe.material.color.lerp(tmpColor, k);
      lobe.material.opacity += (targetOpacity - lobe.material.opacity) * k;

      tmpColor.set(isActive ? region.color : "#000000");
      lobe.material.emissive.lerp(tmpColor, k);
      lobe.material.emissiveIntensity +=
        ((isActive ? CFG.activeEmissive : 0) - lobe.material.emissiveIntensity) * k;

      // ---- CENTRAL band, on frontal and parietal ----
      const bandU = lobe.uniforms.uBand as { value: number } | undefined;
      if (bandU) {
        const wantsBand =
          activeRegion?.id === "central" &&
          (region.id === "frontal" || region.id === "parietal") &&
          !prefrontal;
        const bandColor = lobe.uniforms.uBandColor as
          | { value: THREE.Color }
          | undefined;
        const bandAtU = lobe.uniforms.uBandAt as { value: number } | undefined;
        if (bandColor) bandColor.value.set(BRAIN_REGIONS[2].color);
        if (bandAtU) bandAtU.value = built.bandAt;
        bandU.value += ((wantsBand ? 1 : 0) - bandU.value) * k;
      }

      // ---- prefrontal glow, frontal lobe only ----
      const frontU = lobe.uniforms.uFront as { value: number } | undefined;
      if (frontU) {
        const wants = prefrontal && region.id === "frontal";
        const target = wants ? CFG.prefrontalEmissive * pulseScale : 0;
        frontU.value += (target - frontU.value) * k;
        const frontColor = lobe.uniforms.uFrontColor as
          | { value: THREE.Color }
          | undefined;
        if (frontColor) frontColor.value.set(BRAIN_REGIONS[4].color);
      }
    }
  });

  if (!built) return null;

  return (
    <group ref={rotorRef}>
      <primitive
        object={built.root}
        position={[
          -built.centre.x * built.scale,
          -built.centre.y * built.scale,
          -built.centre.z * built.scale,
        ]}
        scale={built.scale}
      />
    </group>
  );
}

useGLTF.preload(CFG.modelUrl);
