import * as THREE from "three";

export function capturePointer(e: { target: unknown; pointerId: number }): void {
  (e.target as { setPointerCapture?: (id: number) => void } | null)?.setPointerCapture?.(e.pointerId);
}

export function releasePointer(e: { target: unknown; pointerId: number }): void {
  (e.target as { releasePointerCapture?: (id: number) => void } | null)?.releasePointerCapture?.(e.pointerId);
}

