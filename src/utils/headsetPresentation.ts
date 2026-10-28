import * as THREE from "three";
import { DEFAULT_HEADSET_QUATERNION } from "../components/eegHead/electrodeNodes";

export type HeadsetPresentationStage =
  | "hidden"
  | "showcase"
  | "electrodes"
  | "prefrontal"
  | "interactive";

let stage: HeadsetPresentationStage = "showcase";
const listeners = new Set<() => void>();
const homeQuaternion = DEFAULT_HEADSET_QUATERNION.clone();
let storyProgress: number | null = null;

export const headsetPresentation = {
  getSnapshot: () => stage,
  getServerSnapshot: (): HeadsetPresentationStage => "showcase",
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setStage: (nextStage: HeadsetPresentationStage) => {
    if (nextStage === stage) return;
    stage = nextStage;
    listeners.forEach((listener) => listener());
  },
  getHomeQuaternion: (): THREE.Quaternion => homeQuaternion,
  setHomeQuaternion: (q: THREE.Quaternion) => {
    homeQuaternion.copy(q);
  },
  getStoryProgress: (): number | null => storyProgress,
  setStoryProgress: (p: number | null) => {
    storyProgress = p;
  },
};

// Integration seam for Person A's Onboarding component. Story code only
// chooses a semantic stage; all Three.js poses and easing stay owned here.
export function setHeadsetPresentationStage(stage: HeadsetPresentationStage): void {
  headsetPresentation.setStage(stage);
}
