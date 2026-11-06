import React, { useEffect, useSyncExternalStore } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { xrStore } from "../../../utils/xrStore";
import { RoomSegment } from "./RoomSegment";
import { TunnelEndWall } from "./TunnelEndWall";

interface AimlabsArenaProps {
  speed?: number;
  width?: number;
  height?: number;
  isXR?: boolean;
}

export const AimlabsArena: React.FC<AimlabsArenaProps> = ({
  speed = 3.5,
  height = 14,
  width = (14 * 16) / 9, // Exact 16:9 aspect ratio (~24.89 for height 14)
  isXR: isXRProp,
}) => {
  const { scene } = useThree();

  const isXRPresenting = useSyncExternalStore(
    xrStore.subscribe,
    () => xrStore.getState().session != null,
    () => false
  );
  const isXR = isXRProp ?? isXRPresenting;

  // Set dark background & deep space fog while the portal experience is active.
  // In the web version (desktop), linear fog (#000000, 20..85) creates a clean, infinite vanishing corridor.
  // In WebXR, exponential fog (#000000, 0.024) is used alongside the 360° cosmic void enclosure for sensory occlusion.
  useEffect(() => {
    const prevBackground = scene.background;
    const prevFog = scene.fog;

    scene.background = new THREE.Color("#000000");
    scene.fog = isXR
      ? new THREE.FogExp2("#000000", 0.024)
      : new THREE.Fog("#000000", 20, 85);

    return () => {
      scene.background = prevBackground;
      scene.fog = prevFog;
    };
  }, [scene, isXR]);

  return (
    <group name="brainxr-portal-arena">
      {/* Ambient Fill Light */}
      <ambientLight intensity={0.5} color="#ffffff" />

      {/* Top Key Directional Light */}
      <directionalLight
        position={[0, 8, 2]}
        intensity={1.2}
        color="#ffffff"
      />

      {/* Perimeter Portal Accent Lights */}
      <pointLight
        position={[-9.5, 4, 0]}
        intensity={3.2}
        color="#ffffff"
        decay={1.5}
        distance={30}
      />
      <pointLight
        position={[9.5, 4, 0]}
        intensity={3.2}
        color="#ffffff"
        decay={1.5}
        distance={30}
      />

      {/* Target Zone Focal Fill Light */}
      <pointLight
        position={[0, 2.5, -4.0]}
        intensity={1.2}
        color="#ffffff"
        decay={2}
        distance={10}
      />

      {/*
        360° Cosmic Void Enclosure for WebXR:
        In WebXR (especially when passthrough / alpha-blend is active), the clear color is transparent.
        An inverted opaque black sphere ensures complete sensory occlusion in all directions,
        rendering pitch black (#000000) with alpha = 1.0 behind the tunnel and surrounding space.
        Only rendered in WebXR mode.
      */}
      {isXR && (
        <mesh position={[0, 1.6, 0]} renderOrder={-1000}>
          <sphereGeometry args={[180, 32, 16]} />
          <meshBasicMaterial
            color="#000000"
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/*
        4-Segment Continuous Zooming Corridor Tunnel.
        Centered at y = 1.6 so the vanishing point converges directly behind the central target.
        Rectangle cross-section: 16:9 Aspect Ratio (Width: 24.89, Height: 14).
        Extends 120m in length with seamless wrapping behind the viewer.
      */}
      <group position={[0, 1.6, 0]}>
        {/*
          WebXR Tunnel End Caps:
          In WebXR, end caps close the corridor tunnel to ensure full sensory occlusion in the HMD.
          In the web version, the tunnel remains open with an infinite vanishing point into the distance fog.
        */}
        {isXR && (
          <>
            {/*
              Far Tunnel End Cap (-Z):
              Caps the far end of the corridor tunnel beyond the furthest segment wrap point (z = -105).
              Guarantees that looking down the tunnel in WebXR displays an opaque solid black vanishing point,
              with the 16:9 corridor wireframe lines continuing across the wall in crisp white.
            */}
            <TunnelEndWall
              z={-108}
              width={width}
              height={height}
              wallWidthMultiplier={2.5}
              wallHeightMultiplier={2.5}
              isFarWall={true}
            />

            {/*
              Near Tunnel End Cap (+Z):
              Caps the rear end of the corridor tunnel behind the viewer beyond the nearest wrap point (z = +45).
              Guarantees that looking backward in WebXR displays an opaque solid black void,
              with the 16:9 corridor wireframe lines continuing across the wall in crisp white.
            */}
            <TunnelEndWall
              z={48}
              width={width}
              height={height}
              wallWidthMultiplier={3}
              wallHeightMultiplier={3}
              isFarWall={false}
            />
          </>
        )}

        <RoomSegment initialZ={15} depthSegment={30} totalLength={120} speed={speed} width={width} height={height} />
        <RoomSegment initialZ={-15} depthSegment={30} totalLength={120} speed={speed} width={width} height={height} />
        <RoomSegment initialZ={-45} depthSegment={30} totalLength={120} speed={speed} width={width} height={height} />
        <RoomSegment initialZ={-75} depthSegment={30} totalLength={120} speed={speed} width={width} height={height} />
      </group>
    </group>
  );
};
