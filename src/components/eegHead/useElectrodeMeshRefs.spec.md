# useElectrodeMeshRefs.ts

Sub-hook split out of [[index|EEGHead]]. Owns the `meshRefs` map that
EEGHead's `useFrame` mutates materials through, and `getRefCallback(name)` —
a per-electrode ref callback cached in a ref, so its identity stays stable
across renders. Exists so [[ElectrodeNode]]'s `React.memo` isn't broken by a
fresh `onRef` closure on every EEGHead render.
