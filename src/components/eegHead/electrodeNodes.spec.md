# electrodeNodes.ts

`ELECTRODE_NODE_PLACEMENTS` — the 21 electrodes' mesh node name plus
hand-measured position/rotation on `/digitalTwin.glb`, consumed by
[[index|EEGHead]] to render one [[ElectrodeNode]] per entry.

Positions/rotations came from the Blender export and are not derived from
anything else in the codebase — treat them as fixture data, not something to
recompute.

Also exports `ELECTRODE_RING_NORMALS` (outward unit normal vectors for each electrode halo ring), `computeElectrodeRingNormal`, `computeFocusQuaternion`, `updateElectrodeGeometry`, `getElectrodeFocusQuaternion` (computing focus quaternions aligning each electrode's normal/halo directly facing any target camera direction orthogonally with zero roll while maintaining upright posture), `ELECTRODE_FOCUS_QUATERNIONS`, and `DEFAULT_HEADSET_QUATERNION`.

**Non-obvious**: `computeFocusQuaternion`/`getElectrodeFocusQuaternion` take
an optional `out` Quaternion so a per-frame caller (see
[[../HeadWrapper/useHeadPlacement]]) can write into an owned scratch object
instead of allocating a new Quaternion (plus ~10 internal Vector3/Matrix4
temporaries) every frame while a channel stays selected. The internal math
uses shared module-level scratch objects — safe because the function is
synchronous/non-reentrant and never returns or stores those intermediates by
reference; only the final `out ?? new Quaternion()` result escapes. Callers
that omit `out` (the module-init precomputed maps below) keep getting a
fresh, independently-owned Quaternion exactly as before.

