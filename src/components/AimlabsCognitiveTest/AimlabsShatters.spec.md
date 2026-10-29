# AimlabsShatters.tsx

Renders a stack of hit-feedback particle bursts (`ShardBurst`): on a
correct Go hit, [[aimlabsStore|aimlabsStore]] spawns a `ShatterBurstData`
and this component animates ~10 shards (cyan disc wedges for a sphere hit,
red cubes for a box hit) flying outward under gravity and fading over
0.6s, then self-removes.

**Props**: `bursts` (`ShatterBurstData[]`), `onRemoveBurst: (id) => void`.

**Non-obvious**: each shard's geometry/material is built imperatively with
raw `THREE.Mesh` objects in a `useMemo` and mutated directly in `useFrame`
(position, rotation, material opacity) rather than driven through
declarative JSX/state — these are short-lived, fire-and-forget particles
where per-frame object mutation avoids React reconciliation overhead for
something that's gone in 0.6s.

**Non-obvious**: a burst calls `onDone` (→ `onRemoveBurst`) from inside
`useFrame` once its age exceeds the fixed `duration`, not from a timer —
keeps the burst's lifetime tied to the same clock it animates with, which
[[aimlabsStore|aimlabsStore]] also caps to the last 5 bursts
(`shatters.slice(-4)` plus the new one) so rapid hits can't accumulate
unbounded shard groups.
