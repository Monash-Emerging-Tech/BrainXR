import { Canvas } from "@react-three/fiber";

/**
 * PLACEHOLDER HEADSET for the Act 3 handoff crossfade.
 *
 * The real interactive headset (public/digitalTwin.glb + its node
 * highlight logic) lives on the existing landing page. Rather than
 * duplicate that component's internals here without seeing its source,
 * this renders a lightweight stand-in dome + node-sphere shape so the
 * dissolve reads correctly.
 *
 * TO USE THE REAL MODEL INSTEAD:
 *   Replace the contents of <Canvas> below with your actual headset
 *   component (e.g. <DigitalTwinHeadset interactive={false} />), passed
 *   in as `children`, and drop the placeholder geometry.
 */

interface Headset3DProps {
  opacity: number;
  className?: string;
  children?: React.ReactNode;
}

const NODE_POSITIONS: [number, number, number][] = [
  [0, 0.75, 0.55],
  [0.5, 0.6, 0.35],
  [-0.5, 0.6, 0.35],
  [0.7, 0.35, -0.1],
  [-0.7, 0.35, -0.1],
  [0, 0.3, 0.85],
  [0.35, 0.15, 0.75],
  [-0.35, 0.15, 0.75],
];

export default function Headset3D({ opacity, className, children }: Headset3DProps) {
  return (
    <div
      className={className}
      style={{ opacity, transition: "opacity 500ms ease", width: "100%", height: "100%" }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.1, 3.2], fov: 40 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.7} />
        {children ?? (
          <group>
            <mesh scale={[1.05, 0.85, 1.05]} position={[0, 0.2, 0]}>
              <sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <meshBasicMaterial color="#0d1224" wireframe transparent opacity={0.85} />
            </mesh>
            {NODE_POSITIONS.map((p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.055, 12, 12]} />
                <meshBasicMaterial color="#6366f1" transparent opacity={0.9} />
              </mesh>
            ))}
          </group>
        )}
      </Canvas>
    </div>
  );
}
