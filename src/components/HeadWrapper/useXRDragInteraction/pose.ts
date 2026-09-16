import * as THREE from "three";

export function toVector3(
  pos?: THREE.Vector3 | [number, number, number],
  fallback: THREE.Vector3 = new THREE.Vector3(0, 1.3, -1.1)
): THREE.Vector3 {
  if (!pos) return fallback.clone();
  if (pos instanceof THREE.Vector3) return pos.clone();
  return new THREE.Vector3(pos[0], pos[1], pos[2]);
}

export function toQuaternion(
  rot?: THREE.Quaternion | THREE.Euler | [number, number, number],
  fallback: THREE.Quaternion = new THREE.Quaternion()
): THREE.Quaternion {
  if (!rot) return fallback.clone();
  if (rot instanceof THREE.Quaternion) return rot.clone();
  if (rot instanceof THREE.Euler) return new THREE.Quaternion().setFromEuler(rot);
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
}
