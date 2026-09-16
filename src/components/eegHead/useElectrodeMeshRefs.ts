import * as THREE from "three";
import { useRef } from "react";
import type { ElectrodeName } from "../../utils/signalSource";

type MeshRefCallback = (mesh: THREE.Mesh | null) => void;

// Owns the live electrode-mesh registry (written to by each ElectrodeNode's
// `ref` so EEGHead's useFrame can mutate materials directly) plus a stable
// per-electrode ref callback, built once per name and cached, so
// ElectrodeNode's React.memo isn't defeated by a fresh closure every render.
export function useElectrodeMeshRefs() {
  const meshRefs = useRef<Record<string, THREE.Mesh>>({});
  const callbacks = useRef<Partial<Record<ElectrodeName, MeshRefCallback>>>({});

  function getRefCallback(name: ElectrodeName): MeshRefCallback {
    let cb = callbacks.current[name];
    if (!cb) {
      cb = (mesh) => {
        if (mesh) meshRefs.current[name] = mesh;
      };
      callbacks.current[name] = cb;
    }
    return cb;
  }

  return { meshRefs, getRefCallback };
}
