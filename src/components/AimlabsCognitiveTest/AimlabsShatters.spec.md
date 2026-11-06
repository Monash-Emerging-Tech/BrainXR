# AimlabsShatters

Renders one physics-y particle burst (`ShardBurst`) per active hit, each exploding 10 shards (cylinder wedges for sphere targets, cubes for box targets) outward and down under simple gravity over 0.6s, fading out, then self-removing via `onRemoveBurst`.

**Props**: `bursts` (`ShatterBurstData[]`: `id`, `type`, `position`, `startTime`), `onRemoveBurst(id)`.

**Non-obvious**: each `ShardBurst`'s shard geometries/materials/velocities are generated once via `useMemo` and then mutated directly in the `useFrame` loop (not React state) for performance — `onDone` fires once its own local age timer passes 0.6s, independent of `startTime`.
