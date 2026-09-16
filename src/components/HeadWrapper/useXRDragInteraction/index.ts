import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { capturePointer, releasePointer } from "../pointerCapture";
import { useSqueezeHeld } from "./useSqueezeHeld";
import { toVector3, toQuaternion } from "./pose";

export interface XRDragInteractionParams {
  gl: THREE.WebGLRenderer;
  groupRef: React.RefObject<THREE.Group | null>;
  initialPosition?: THREE.Vector3 | [number, number, number];
  initialRotation?: THREE.Quaternion | THREE.Euler | [number, number, number];
  positionRef?: React.RefObject<THREE.Vector3>;
  rotationRef?: React.RefObject<THREE.Quaternion>;
  constrainPosition?: (targetPos: THREE.Vector3, targetQuat: THREE.Quaternion) => void;
  onDragStart?: (inputSource: XRInputSource | undefined) => void;
  onDragEnd?: (inputSource: XRInputSource | undefined) => void;
}

const _qDiff = new THREE.Quaternion();
const _rotatedOffset = new THREE.Vector3();
const _newPos = new THREE.Vector3();
const _newQuat = new THREE.Quaternion();
const _initialRayPoint = new THREE.Vector3();

// WebXR grip-to-reposition and grip-to-rotate interaction for spatial groups.
// Repositioning is driven by the grip/squeeze button (see useSqueezeHeld)
// rather than the ray pointer's own down/up cycle, which is bound to the
// trigger and needed elsewhere for node selection. The ray pointer's
// continuous hover/move events (which fire regardless of button state —
// they drive the XR cursor model) still supply the pointing direction: a
// move event reaching this handler proves the ray currently intersects
// something in this group's subtree, which is what starts the drag once
// the grip is also held.
export function useXRDragInteraction({
  gl,
  groupRef,
  initialPosition,
  initialRotation,
  positionRef,
  rotationRef,
  constrainPosition,
  onDragStart,
  onDragEnd,
}: XRDragInteractionParams) {
  const defaultPos = useRef(toVector3(initialPosition, new THREE.Vector3(0, 1.3, -1.1))).current;
  const defaultQuat = useRef(toQuaternion(initialRotation, new THREE.Quaternion())).current;

  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const capturedTargetRef = useRef<unknown>(null);
  const dragStartRayDirRef = useRef(new THREE.Vector3());
  const dragStartQuatRef = useRef(new THREE.Quaternion());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const dragDistanceRef = useRef(0);
  const internalPositionRef = useRef(defaultPos.clone());
  const internalRotationRef = useRef(defaultQuat.clone());

  const xrPositionRef = positionRef ?? internalPositionRef;
  const xrRotationRef = rotationRef ?? internalRotationRef;
  const wasPresentingRef = useRef(false);

  const squeeze = useSqueezeHeld();

  const endDrag = () => {
    if (capturedTargetRef.current != null && pointerIdRef.current != null) {
      releasePointer({ target: capturedTargetRef.current, pointerId: pointerIdRef.current });
    }
    isDraggingRef.current = false;
    pointerIdRef.current = null;
    capturedTargetRef.current = null;
    if (groupRef.current) {
      xrPositionRef.current.copy(groupRef.current.position);
      xrRotationRef.current.copy(groupRef.current.quaternion);
    }
    onDragEnd?.(squeeze.activeInputSource());
  };

  useFrame((state) => {
    const isPresenting = state.gl.xr.isPresenting;
    if (!isPresenting) {
      wasPresentingRef.current = false;
      if (isDraggingRef.current) endDrag();
      return;
    }

    if (!wasPresentingRef.current) {
      xrPositionRef.current.copy(defaultPos);
      xrRotationRef.current.copy(defaultQuat);
      wasPresentingRef.current = true;
    }

    if (isDraggingRef.current && !squeeze.isHeld()) {
      endDrag();
    }

    if (groupRef.current && !isDraggingRef.current) {
      constrainPosition?.(xrPositionRef.current, xrRotationRef.current);
      groupRef.current.position.copy(xrPositionRef.current);
      groupRef.current.quaternion.copy(xrRotationRef.current);
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!gl.xr.isPresenting || e.pointerType !== "ray") return;

    if (!isDraggingRef.current) {
      if (!squeeze.isHeld() || !groupRef.current) return;

      e.stopPropagation();
      capturePointer(e);
      capturedTargetRef.current = e.target;
      isDraggingRef.current = true;
      pointerIdRef.current = e.pointerId;
      dragStartRayDirRef.current.copy(e.ray.direction);
      dragStartQuatRef.current.copy(groupRef.current.quaternion);

      // Grab distance/offset, so the drag doesn't snap the group onto the ray.
      const grabDistance = e.ray.origin.distanceTo(groupRef.current.position);
      dragDistanceRef.current = grabDistance;
      _initialRayPoint.copy(e.ray.origin).addScaledVector(e.ray.direction, grabDistance);
      dragOffsetRef.current.subVectors(groupRef.current.position, _initialRayPoint);

      onDragStart?.(squeeze.activeInputSource());
      return;
    }

    if (e.pointerId !== pointerIdRef.current) return;
    e.stopPropagation();
    if (!groupRef.current) return;

    // Short-arc rotation aligning the drag's start ray direction to the current one.
    _qDiff.setFromUnitVectors(dragStartRayDirRef.current, e.ray.direction);

    _rotatedOffset.copy(dragOffsetRef.current).applyQuaternion(_qDiff);
    _newPos
      .copy(e.ray.origin)
      .addScaledVector(e.ray.direction, dragDistanceRef.current)
      .add(_rotatedOffset);

    _newQuat.multiplyQuaternions(_qDiff, dragStartQuatRef.current);

    // Apply anti-overlap / collision constraints
    constrainPosition?.(_newPos, _newQuat);

    // Only commit to full displacement if moved beyond small deadzone
    if (_newPos.distanceTo(xrPositionRef.current) > 0.015) {
      groupRef.current.position.copy(_newPos);
      xrPositionRef.current.copy(_newPos);

      groupRef.current.quaternion.copy(_newQuat);
      xrRotationRef.current.copy(_newQuat);
    }
  };

  return {
    isDraggingRef,
    xrPositionRef,
    xrRotationRef,
    handlePointerMove,
  };
}
