# BrainFallback.tsx

A class-based error boundary: if loading/decoding the segmented brain GLB
throws (inside [[BrainModel|BrainModel]]), renders `fallback` instead of
`children` so the reader never lands on an empty stage.

**Props**: `fallback: ReactNode`, `children: ReactNode`.

**Non-obvious**: must be a class component — `getDerivedStateFromError`/
`componentDidCatch` have no hook equivalent in React. Used by
[[Brain3D|Brain3D]] to swap in the procedural `ShellAndMarkers` stand-in on
failure.
