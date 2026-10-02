import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STORY_V2 } from "./storyContentV2";
import { v2Debug } from "./v2Debug";

/**
 * Scene 1's smoke: one full-screen fragment shader.
 *
 * Sprites were the obvious approach and the wrong one -- however many you
 * add, they read as a handful of soft blobs drifting past each other.
 * Domain-warped fbm noise is what actually looks like smoke: the warp means
 * the noise field is sampled through another noise field, so the structure
 * curls and tears instead of merely translating.
 *
 * Three inputs:
 *   uReach    radial mask, grows from the exact centre as the smoke pours
 *   uDensity  0 -> 1 -> 0 envelope, the pour and then the clear
 *   uTime     churn, independent of either
 *
 * ONE shader serves both smokes. Scene 1's is near-black over white and
 * composites normally; scene 2's is pale grey over black and composites
 * ADDITIVELY, so it glows out of the dark instead of laying a flat grey
 * sheet over it. Colour and peak opacity are uniforms and the blend mode is
 * a prop -- a second copy of the shader would be two things to keep in step
 * for no gain.
 */

const CFG = STORY_V2.smoke;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Full-screen quad: ignore the camera entirely.
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uReach;
uniform float uDensity;
uniform float uAspect;
uniform vec3 uColor;
uniform float uScale;
uniform float uWarp;
uniform float uEdgeLow;
uniform float uEdgeHigh;
uniform float uMaxOpacity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  // Centre-origin coordinates, aspect corrected so the burst is round.
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;
  float r = length(p);

  // Push the field outward from the centre as it pours, so the smoke
  // travels rather than just boiling in place.
  vec2 flow = p * (0.35 * uReach);
  vec2 sp = p * uScale - flow;

  // Domain warp: sample noise through noise. This is what makes it curl.
  vec2 q = vec2(
    fbm(sp + vec2(0.0, 0.0) + uTime * 0.11),
    fbm(sp + vec2(5.2, 1.3) - uTime * 0.09)
  );
  vec2 rr = vec2(
    fbm(sp + uWarp * q + vec2(1.7, 9.2) + uTime * 0.15),
    fbm(sp + uWarp * q + vec2(8.3, 2.8) - uTime * 0.13)
  );
  float f = fbm(sp + uWarp * rr);

  // Radial mask growing from the exact centre, with a soft shoulder.
  float mask = 1.0 - smoothstep(uReach * 0.18, max(uReach, 0.001), r);

  // Thicker in the middle of the plume than at its edge.
  float body = f * mask * uDensity * (1.25 - 0.45 * r);
  float d = smoothstep(uEdgeLow, uEdgeHigh, body);

  gl_FragColor = vec4(uColor, d * uMaxOpacity);
}
`;

interface PlaneProps {
  reachRef: React.RefObject<number>;
  densityRef: React.RefObject<number>;
  color: readonly [number, number, number];
  maxOpacity: number;
  additive: boolean;
}

function SmokePlane({ reachRef, densityRef, color, maxOpacity, additive }: PlaneProps) {
  const { size } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReach: { value: 0 },
      uDensity: { value: 0 },
      uAspect: { value: 1 },
      uColor: { value: new THREE.Color(color[0], color[1], color[2]) },
      uScale: { value: CFG.scale },
      uWarp: { value: CFG.warp },
      uEdgeLow: { value: CFG.edgeLow },
      uEdgeHigh: { value: CFG.edgeHigh },
      uMaxOpacity: { value: maxOpacity },
    }),
    // Built once per mount: the values are pushed in useFrame below, so a
    // colour change must not rebuild the material mid-scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    (u.uColor.value as THREE.Color).setRGB(color[0], color[1], color[2]);
    u.uMaxOpacity.value = maxOpacity;
  }, [color, maxOpacity]);

  useFrame((state) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    // Counted so the HUD can tell "the smoke is drawing but you cannot see
    // it" apart from "the smoke never drew at all" -- a shader that fails
    // to compile and a canvas with a zero size look identical on screen.
    v2Debug.smokeFrames++;
    u.uTime.value = state.clock.elapsedTime * CFG.speed;
    u.uReach.value = (reachRef.current ?? 0) * CFG.reach;
    u.uDensity.value = densityRef.current ?? 0;
    u.uAspect.value = size.width / Math.max(1, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        // Additive is what makes pale smoke read as light on black. Normal
        // blending there would paint a flat grey rectangle.
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export interface SmokeShaderProps {
  /** Live 0..1 radial growth. */
  reachRef: React.RefObject<number>;
  /** Live 0..1 density envelope: pour, then clear. */
  densityRef: React.RefObject<number>;
  /** Linear RGB, 0..1. Defaults to scene 1's near-black ink. */
  color?: readonly [number, number, number];
  /** Peak opacity. Defaults to scene 1's. */
  maxOpacity?: number;
  /** True for pale smoke on black, so it glows rather than greys. */
  additive?: boolean;
  className?: string;
}

export default function SmokeShader({
  reachRef,
  densityRef,
  color = CFG.color,
  maxOpacity = CFG.maxOpacity,
  additive = false,
  className,
}: SmokeShaderProps) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        // Full DPR for the detail, capped at 2 so a 4K screen does not melt.
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: false }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          // Surfaced on the HUD; a shader that will not compile otherwise
          // only shows up as an empty screen.
          const ctx = gl.getContext();
          if (!ctx) v2Debug.smokeError = "no webgl context";
        }}
      >
        <SmokePlane
          reachRef={reachRef}
          densityRef={densityRef}
          color={color}
          maxOpacity={maxOpacity}
          additive={additive}
        />
      </Canvas>
    </div>
  );
}
